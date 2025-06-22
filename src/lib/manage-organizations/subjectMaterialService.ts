// src/lib/manage-organizations/subjectMaterialService.ts

import { db } from '../../firebaseUtils'; // Assuming firebaseUtils exports `db` (Firestore instance)
import { SubjectMaterial } from '../../types/manage-organizations';
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

const subjectMaterialsCollectionRef = collection(db, 'subjectMaterials');

/**
 * Feature ID: MO-021
 * Feature Name: Subject Material Management Backend Service - Add Subject Material
 * What it does: Adds a new subject material record to the Firestore database.
 * Description: Takes subject material data (including subjectId, classId, schoolId, file URLs), generates timestamps, and stores it in the 'subjectMaterials' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for adding subject material, Frontend for uploading material)
 */
export const addSubjectMaterial = async (materialData: Omit<SubjectMaterial, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubjectMaterial> => {
  try {
    const now = Date.now();
    const newMaterial = {
      ...materialData,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(subjectMaterialsCollectionRef, newMaterial);
    return { id: docRef.id, ...newMaterial } as SubjectMaterial;
  } catch (error) {
    console.error('Error adding subject material:', error);
    throw new Error('Failed to add subject material.');
  }
};

/**
 * Feature ID: MO-021
 * Feature Name: Subject Material Management Backend Service - Get Subject Material by ID
 * What it does: Retrieves a single subject material by its ID from the Firestore database.
 * Description: Fetches a specific subject material document from the 'subjectMaterials' collection using its unique ID.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for getting subject material, Frontend for viewing material details)
 */
export const getSubjectMaterialById = async (id: string): Promise<SubjectMaterial | null> => {
  try {
    const docRef = doc(db, 'subjectMaterials', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as SubjectMaterial;
    }
    return null;
  } catch (error) {
    console.error(`Error getting subject material with ID ${id}:`, error);
    throw new Error(`Failed to retrieve subject material with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-021
 * Feature Name: Subject Material Management Backend Service - Get Subject Materials by Subject ID
 * What it does: Retrieves all subject materials belonging to a specific subject.
 * Description: Queries the 'subjectMaterials' collection for documents matching the provided subject ID.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for listing subject materials, Frontend for displaying materials by subject)
 */
export const getSubjectMaterialsBySubjectId = async (subjectId: string): Promise<SubjectMaterial[]> => {
  try {
    const q = query(subjectMaterialsCollectionRef, where('subjectId', '==', subjectId));
    const querySnapshot = await getDocs(q);
    const materials: SubjectMaterial[] = [];
    querySnapshot.forEach((doc) => {
      materials.push({ id: doc.id, ...doc.data() } as SubjectMaterial);
    });
    return materials;
  } catch (error) {
    console.error(`Error getting subject materials for subject ID ${subjectId}:`, error);
    throw new Error(`Failed to retrieve subject materials for subject ID ${subjectId}.`);
  }
};

/**
 * Feature ID: MO-021
 * Feature Name: Subject Material Management Backend Service - Update Subject Material
 * What it does: Updates an existing subject material's data in the Firestore database.
 * Description: Takes subject material ID and partial data, updates the document, and sets the 'updatedAt' timestamp.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for updating subject material, Frontend for editing material)
 */
export const updateSubjectMaterial = async (id: string, materialData: Partial<Omit<SubjectMaterial, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const docRef = doc(db, 'subjectMaterials', id);
    await updateDoc(docRef, { ...materialData, updatedAt: Date.now() });
  } catch (error) {
    console.error(`Error updating subject material with ID ${id}:`, error);
    throw new Error(`Failed to update subject material with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-021
 * Feature Name: Subject Material Management Backend Service - Delete Subject Material
 * What it does: Deletes a subject material from the Firestore database by its ID.
 * Description: Removes a specific subject material document from the 'subjectMaterials' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for deleting subject material, Frontend for deleting material)
 */
export const deleteSubjectMaterial = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'subjectMaterials', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting subject material with ID ${id}:`, error);
    throw new Error(`Failed to delete subject material with ID ${id}.`);
  }
};
