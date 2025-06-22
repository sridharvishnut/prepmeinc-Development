// src/lib/manage-organizations/schoolService.ts

import { db } from '../../firebaseUtils'; // Assuming firebaseUtils exports `db` (Firestore instance)
import { School } from '../../types/manage-organizations';
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

const schoolsCollectionRef = collection(db, 'schools');

/**
 * Feature ID: MO-002
 * Feature Name: School Management Backend Service - Add School
 * What it does: Adds a new school to the Firestore database.
 * Description: Takes school data, generates timestamps, and stores it in the 'schools' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for adding school, Frontend for adding school)
 */
export const addSchool = async (schoolData: Omit<School, 'id' | 'createdAt' | 'updatedAt'>): Promise<School> => {
  try {
    const now = Date.now();
    const newSchool = {
      ...schoolData,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(schoolsCollectionRef, newSchool);
    return { id: docRef.id, ...newSchool } as School;
  } catch (error) {
    console.error('Error adding school:', error);
    throw new Error('Failed to add school.');
  }
};

/**
 * Feature ID: MO-002
 * Feature Name: School Management Backend Service - Get School by ID
 * What it does: Retrieves a single school by its ID from the Firestore database.
 * Description: Fetches a specific school document from the 'schools' collection using its unique ID.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for getting school, Frontend for viewing school details)
 */
export const getSchoolById = async (id: string): Promise<School | null> => {
  try {
    const docRef = doc(db, 'schools', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as School;
    }
    return null;
  } catch (error) {
    console.error(`Error getting school with ID ${id}:`, error);
    throw new Error(`Failed to retrieve school with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-002
 * Feature Name: School Management Backend Service - Get All Schools
 * What it does: Retrieves all schools from the Firestore database.
 * Description: Fetches all documents from the 'schools' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for listing schools, Frontend for displaying all schools)
 */
export const getAllSchools = async (): Promise<School[]> => {
  try {
    const q = query(schoolsCollectionRef);
    const querySnapshot = await getDocs(q);
    const schools: School[] = [];
    querySnapshot.forEach((doc) => {
      schools.push({ id: doc.id, ...doc.data() } as School);
    });
    return schools;
  } catch (error) {
    console.error('Error getting all schools:', error);
    throw new Error('Failed to retrieve all schools.');
  }
};

/**
 * Feature ID: MO-002
 * Feature Name: School Management Backend Service - Update School
 * What it does: Updates an existing school's data in the Firestore database.
 * Description: Takes school ID and partial school data, updates the document, and sets the 'updatedAt' timestamp.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for updating school, Frontend for editing school)
 */
export const updateSchool = async (id: string, schoolData: Partial<Omit<School, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const docRef = doc(db, 'schools', id);
    await updateDoc(docRef, { ...schoolData, updatedAt: Date.now() });
  } catch (error) {
    console.error(`Error updating school with ID ${id}:`, error);
    throw new Error(`Failed to update school with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-002
 * Feature Name: School Management Backend Service - Delete School
 * What it does: Deletes a school from the Firestore database by its ID.
 * Description: Removes a specific school document from the 'schools' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for deleting school, Frontend for deleting school)
 */
export const deleteSchool = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'schools', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting school with ID ${id}:`, error);
    throw new Error(`Failed to delete school with ID ${id}.`);
  }
};