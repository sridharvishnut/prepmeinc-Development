// src/lib/manage-organizations/subjectService.ts

import { db } from '../../firebaseUtils'; // Assuming firebaseUtils exports `db` (Firestore instance)
import { Subject } from '../../types/manage-organizations';
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

const subjectsCollectionRef = collection(db, 'subjects');

/**
 * Feature ID: MO-020
 * Feature Name: Subject Management Backend Service - Add Subject
 * What it does: Adds a new subject to the Firestore database.
 * Description: Takes subject data (including schoolId and a flag for custom subject), generates timestamps, and stores it in the 'subjects' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for adding subject, Frontend for adding subject)
 */
export const addSubject = async (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subject> => {
  try {
    const now = Date.now();
    const newSubject = {
      ...subjectData,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(subjectsCollectionRef, newSubject);
    return { id: docRef.id, ...newSubject } as Subject;
  } catch (error) {
    console.error('Error adding subject:', error);
    throw new Error('Failed to add subject.');
  }
};

/**
 * Feature ID: MO-020
 * Feature Name: Subject Management Backend Service - Get Subject by ID
 * What it does: Retrieves a single subject by its ID from the Firestore database.
 * Description: Fetches a specific subject document from the 'subjects' collection using its unique ID.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for getting subject, Frontend for viewing subject details)
 */
export const getSubjectById = async (id: string): Promise<Subject | null> => {
  try {
    const docRef = doc(db, 'subjects', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Subject;
    }
    return null;
  } catch (error) {
    console.error(`Error getting subject with ID ${id}:`, error);
    throw new Error(`Failed to retrieve subject with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-020
 * Feature Name: Subject Management Backend Service - Get Subjects by School ID
 * What it does: Retrieves all subjects belonging to a specific school.
 * Description: Queries the 'subjects' collection for documents matching the provided school ID.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for listing subjects, Frontend for displaying subjects by school)
 */
export const getSubjectsBySchoolId = async (schoolId: string): Promise<Subject[]> => {
  try {
    const q = query(subjectsCollectionRef, where('schoolId', '==', schoolId));
    const querySnapshot = await getDocs(q);
    const subjects: Subject[] = [];
    querySnapshot.forEach((doc) => {
      subjects.push({ id: doc.id, ...doc.data() } as Subject);
    });
    return subjects;
  } catch (error) {
    console.error(`Error getting subjects for school ID ${schoolId}:`, error);
    throw new Error(`Failed to retrieve subjects for school ID ${schoolId}.`);
  }
};

/**
 * Feature ID: MO-020
 * Feature Name: Subject Management Backend Service - Update Subject
 * What it does: Updates an existing subject's data in the Firestore database.
 * Description: Takes subject ID and partial subject data, updates the document, and sets the 'updatedAt' timestamp.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for updating subject, Frontend for editing subject)
 */
export const updateSubject = async (id: string, subjectData: Partial<Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const docRef = doc(db, 'subjects', id);
    await updateDoc(docRef, { ...subjectData, updatedAt: Date.now() });
  } catch (error) {
    console.error(`Error updating subject with ID ${id}:`, error);
    throw new Error(`Failed to update subject with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-020
 * Feature Name: Subject Management Backend Service - Delete Subject
 * What it does: Deletes a subject from the Firestore database by its ID.
 * Description: Removes a specific subject document from the 'subjects' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for deleting subject, Frontend for deleting subject)
 */
export const deleteSubject = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'subjects', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting subject with ID ${id}:`, error);
    throw new Error(`Failed to delete subject with ID ${id}.`);
  }
};
