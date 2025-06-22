// src/lib/manage-organizations/classService.ts

import { db } from '../../firebaseUtils'; // Assuming firebaseUtils exports `db` (Firestore instance)
import { Class } from '../../types/manage-organizations';
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

const classesCollectionRef = collection(db, 'classes');

/**
 * Feature ID: MO-006
 * Feature Name: Class Management Backend Service - Add Class
 * What it does: Adds a new class to the Firestore database.
 * Description: Takes class data (including schoolId), generates timestamps, and stores it in the 'classes' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for adding class, Frontend for adding class)
 */
export const addClass = async (classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>): Promise<Class> => {
  try {
    const now = Date.now();
    const newClass = {
      ...classData,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(classesCollectionRef, newClass);
    return { id: docRef.id, ...newClass } as Class;
  } catch (error) {
    console.error('Error adding class:', error);
    throw new Error('Failed to add class.');
  }
};

/**
 * Feature ID: MO-006
 * Feature Name: Class Management Backend Service - Get Class by ID
 * What it does: Retrieves a single class by its ID from the Firestore database.
 * Description: Fetches a specific class document from the 'classes' collection using its unique ID.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for getting class, Frontend for viewing class details)
 */
export const getClassById = async (id: string): Promise<Class | null> => {
  try {
    const docRef = doc(db, 'classes', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Class;
    }
    return null;
  } catch (error) {
    console.error(`Error getting class with ID ${id}:`, error);
    throw new Error(`Failed to retrieve class with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-006
 * Feature Name: Class Management Backend Service - Get Classes by School ID
 * What it does: Retrieves all classes belonging to a specific school.
 * Description: Queries the 'classes' collection for documents matching the provided school ID.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for listing classes, Frontend for displaying classes by school)
 */
export const getClassesBySchoolId = async (schoolId: string): Promise<Class[]> => {
  try {
    const q = query(classesCollectionRef, where('schoolId', '==', schoolId));
    const querySnapshot = await getDocs(q);
    const classes: Class[] = [];
    querySnapshot.forEach((doc) => {
      classes.push({ id: doc.id, ...doc.data() } as Class);
    });
    return classes;
  } catch (error) {
    console.error(`Error getting classes for school ID ${schoolId}:`, error);
    throw new Error(`Failed to retrieve classes for school ID ${schoolId}.`);
  }
};

/**
 * Feature ID: MO-006
 * Feature Name: Class Management Backend Service - Update Class
 * What it does: Updates an existing class's data in the Firestore database.
 * Description: Takes class ID and partial class data, updates the document, and sets the 'updatedAt' timestamp.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for updating class, Frontend for editing class)
 */
export const updateClass = async (id: string, classData: Partial<Omit<Class, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const docRef = doc(db, 'classes', id);
    await updateDoc(docRef, { ...classData, updatedAt: Date.now() });
  } catch (error) {
    console.error(`Error updating class with ID ${id}:`, error);
    throw new Error(`Failed to update class with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-006
 * Feature Name: Class Management Backend Service - Delete Class
 * What it does: Deletes a class from the Firestore database by its ID.
 * Description: Removes a specific class document from the 'classes' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for deleting class, Frontend for deleting class)
 */
export const deleteClass = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'classes', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting class with ID ${id}:`, error);
    throw new Error(`Failed to delete class with ID ${id}.`);
  }
};
