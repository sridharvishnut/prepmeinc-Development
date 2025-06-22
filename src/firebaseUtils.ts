import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);

export const uploadDocument = async (file: File, userId: string, category: string, onProgress: (progress: number) => void) => {
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  const filePath = `${userId}/${category}/${file.name}`;
  const storageRef = ref(storage, filePath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  console.log("Starting upload for file:", file.name, "to path:", filePath);

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

          // Store metadata in Firestore
          await addDoc(collection(db, "documents"), {
            userId: userId,
            category: category,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            downloadURL: downloadURL,
            uploadedAt: serverTimestamp(),
            storagePath: filePath,
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
    // Delete from Firestore
    await deleteDoc(doc(db, "documents", docId));
    // Delete from Storage
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
    console.log(`Document ${docId} and file at ${storagePath} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error; // Re-throw to be handled by the calling component
  }
};
