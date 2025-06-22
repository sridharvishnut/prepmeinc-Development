// src/lib/manage-organizations/userService.ts

import { db } from '../../firebaseUtils'; // Assuming firebaseUtils exports `db` (Firestore instance)
import { SchoolUser, UserRoleType } from '../../types/manage-organizations';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

const schoolUsersCollectionRef = collection(db, 'schoolUsers');

/**
 * Feature ID: MO-029
 * Feature Name: User Management Backend Service - Add School User
 * What it does: Adds a new school user record to the Firestore database.
 * Description: Takes user data (including schoolId and role), generates timestamps, and stores it in the 'schoolUsers' collection. Note: Actual Firebase Auth user creation should be handled separately.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for adding user, Frontend for adding user)
 */
export const addSchoolUser = async (userData: Omit<SchoolUser, 'createdAt' | 'updatedAt'>): Promise<SchoolUser> => {
  try {
    const now = Date.now();
    const newUser = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    // For school users, the 'id' typically matches their Firebase Auth UID.
    // If the user already exists in Auth, we use that UID. If not, we'd create one and then use its UID.
    // For simplicity in this service, we assume 'id' is provided or generated elsewhere (e.g., Firebase Auth on registration)
    // If 'id' is not provided, Firestore will auto-generate. For user management, linking to Auth UID is crucial.
    const docRef = doc(schoolUsersCollectionRef, newUser.id); // Use provided ID as doc ID
    await updateDoc(docRef, newUser); // Use setDoc with merge:true or updateDoc if sure it exists

    return newUser as SchoolUser;
  } catch (error) {
    console.error('Error adding school user:', error);
    throw new Error('Failed to add school user.');
  }
};

/**
 * Feature ID: MO-029
 * Feature Name: User Management Backend Service - Get School User by ID
 * What it does: Retrieves a single school user by their ID (Firebase Auth UID) from the Firestore database.
 * Description: Fetches a specific school user document from the 'schoolUsers' collection using their unique ID.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for getting user, Frontend for viewing user details)
 */
export const getSchoolUserById = async (id: string): Promise<SchoolUser | null> => {
  try {
    const docRef = doc(db, 'schoolUsers', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as SchoolUser;
    }
    return null;
  } catch (error) {
    console.error(`Error getting school user with ID ${id}:`, error);
    throw new Error(`Failed to retrieve school user with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-029
 * Feature Name: User Management Backend Service - Get School Users with Filters
 * What it does: Retrieves school users based on provided schoolId and/or role.
 * Description: Queries the 'schoolUsers' collection with optional filters for school and user role.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for listing users, Frontend for displaying users)
 */
export const getSchoolUsers = async (filters: { schoolId?: string; role?: UserRoleType }): Promise<SchoolUser[]> => {
  try {
    let q = query(schoolUsersCollectionRef);
    if (filters.schoolId) {
      q = query(q, where('schoolId', '==', filters.schoolId));
    }
    if (filters.role) {
      q = query(q, where('role', '==', filters.role));
    }

    const querySnapshot = await getDocs(q);
    const users: SchoolUser[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as SchoolUser);
    });
    return users;
  } catch (error) {
    console.error('Error getting school users with filters:', error);
    throw new Error('Failed to retrieve school users.');
  }
};

/**
 * Feature ID: MO-029
 * Feature Name: User Management Backend Service - Update School User
 * What it does: Updates an existing school user's data in the Firestore database.
 * Description: Takes user ID and partial user data, updates the document, and sets the 'updatedAt' timestamp.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for updating user, Frontend for editing user)
 */
export const updateSchoolUser = async (id: string, userData: Partial<Omit<SchoolUser, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const docRef = doc(db, 'schoolUsers', id);
    await updateDoc(docRef, { ...userData, updatedAt: Date.now() });
  } catch (error) {
    console.error(`Error updating school user with ID ${id}:`, error);
    throw new Error(`Failed to update school user with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-029
 * Feature Name: User Management Backend Service - Delete School User
 * What it does: Deletes a school user from the Firestore database by their ID.
 * Description: Removes a specific school user document from the 'schoolUsers' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for deleting user, Frontend for deleting user)
 */
export const deleteSchoolUser = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'schoolUsers', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting school user with ID ${id}:`, error);
    throw new Error(`Failed to delete school user with ID ${id}.`);
  }
};
