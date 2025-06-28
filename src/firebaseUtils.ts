import { initializeApp, getApps } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';
import { getAuth, initializeAuth, browserLocalPersistence, Auth } from 'firebase/auth';

let firebaseAppInstance;

try {
  firebaseAppInstance = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
} catch (e) {
  console.error("FATAL: Error initializing Firebase App:", e);
  throw e; // Re-throw to halt if essential app initialization fails
}

export const app = firebaseAppInstance;

let firestoreDbInstance;
try {
  firestoreDbInstance = getFirestore(app);
  console.log("Firestore DB instance initialized:", firestoreDbInstance ? "SUCCESS" : "FAILED");
} catch (e) {
  console.error("FATAL: Error initializing Firestore DB:", e);
  throw e; // Re-throw to halt if essential db initialization fails
}
export const db = firestoreDbInstance;

// Initialize Firebase Auth only on the client side
let _auth: Auth | null = null;

if (typeof window !== 'undefined') {
  try {
    _auth = getAuth(app);
  } catch (e) {
    console.log("Firebase Auth: No existing auth instance, initializing a new one.");
    _auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    });
  }

  if (process.env.NODE_ENV === "development" && _auth) {
    try {
      _auth.settings.appVerificationDisabledForTesting = true;
      console.log("Firebase Auth: appVerificationDisabledForTesting is set to true for development.");
    } catch (e) {
      console.warn("appVerificationDisabledForTesting not supported or auth not ready for setting", e);
    }
  }
}

export const auth = _auth;
export const storage = getStorage(app);

export const uploadDocument = async (file: File, userId: string, category: string, onProgress: (progress: number) => void) => {
  // Get the current authenticated user
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User is not authenticated.");
  }

  const uid = currentUser.uid; // Use the UID from the authenticated user

  // Conditionally add '/testing/' for anonymous users
  const storagePath = currentUser.isAnonymous
    ? `${uid}/testing/${category}/${file.name}`
    : `${uid}/${category}/${file.name}`;


  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  console.log("Starting upload for file:", file.name, "to path:", storagePath);

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done. State:' + snapshot.state);
        onProgress(progress);
      },
      (error) => {
        console.error("Upload failed (state_changed error callback):", error);
        reject(error);
      },
      async () => {
        console.log("Upload complete callback triggered.");
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("Download URL obtained:", downloadURL);

          await addDoc(collection(db, "documents"), {
            userId: uid, // Use uid here as well
            category: category,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            downloadURL: downloadURL,
            uploadedAt: serverTimestamp(),
            storagePath: storagePath,
          });
          console.log("File uploaded and metadata saved successfully to Firestore.", downloadURL);
          resolve(downloadURL);
        } catch (error) {
          console.error("Error saving document metadata to Firestore:", error);
          reject(error);
        }
      }
    );
  });
};

export interface DocumentMetadata {
  id: string;
  userId: string;
  category: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadURL: string;
  uploadedAt: any; // Firebase Timestamp
  storagePath: string;
}

export const getDocuments = async (userId: string): Promise<DocumentMetadata[]> => {
  if (!userId) {
    throw new Error("User ID is required to fetch documents.");
  }
  const q = query(collection(db, "documents"), where("userId", "==", userId), orderBy("uploadedAt", "desc"));
  const querySnapshot = await getDocs(q);
  const documents: DocumentMetadata[] = [];
  querySnapshot.forEach((doc) => {
    documents.push({ id: doc.id, ...(doc.data() as Omit<DocumentMetadata, 'id'>) });
  });
  return documents;
};

export const deleteDocument = async (docId: string, storagePath: string) => {
  try {
    await deleteDoc(doc(db, "documents", docId));
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
    console.log(`Document ${docId} and file at ${storagePath} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};