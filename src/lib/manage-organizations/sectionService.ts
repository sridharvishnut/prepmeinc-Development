// src/lib/manage-organizations/sectionService.ts

import { db } from '../../firebaseUtils'; // Assuming firebaseUtils exports `db` (Firestore instance)
import { Section } from '../../types/manage-organizations';
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

const sectionsCollectionRef = collection(db, 'sections');

/**
 * Feature ID: MO-007
 * Feature Name: Section Management Backend Service - Add Section
 * What it does: Adds a new section to the Firestore database.
 * Description: Takes section data (including classId and schoolId), generates timestamps, and stores it in the 'sections' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for adding section, Frontend for adding section)
 */
export const addSection = async (sectionData: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>): Promise<Section> => {
  try {
    const now = Date.now();
    const newSection = {
      ...sectionData,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(sectionsCollectionRef, newSection);
    return { id: docRef.id, ...newSection } as Section;
  } catch (error) {
    console.error('Error adding section:', error);
    throw new Error('Failed to add section.');
  }
};

/**
 * Feature ID: MO-007
 * Feature Name: Section Management Backend Service - Get Section by ID
 * What it does: Retrieves a single section by its ID from the Firestore database.
 * Description: Fetches a specific section document from the 'sections' collection using its unique ID.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for getting section, Frontend for viewing section details)
 */
export const getSectionById = async (id: string): Promise<Section | null> => {
  try {
    const docRef = doc(db, 'sections', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Section;
    }
    return null;
  } catch (error) {
    console.error(`Error getting section with ID ${id}:`, error);
    throw new Error(`Failed to retrieve section with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-007
 * Feature Name: Section Management Backend Service - Get Sections by Class ID
 * What it does: Retrieves all sections belonging to a specific class.
 * Description: Queries the 'sections' collection for documents matching the provided class ID.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for listing sections, Frontend for displaying sections by class)
 */
export const getSectionsByClassId = async (classId: string): Promise<Section[]> => {
  try {
    const q = query(sectionsCollectionRef, where('classId', '==', classId));
    const querySnapshot = await getDocs(q);
    const sections: Section[] = [];
    querySnapshot.forEach((doc) => {
      sections.push({ id: doc.id, ...doc.data() } as Section);
    });
    return sections;
  } catch (error) {
    console.error(`Error getting sections for class ID ${classId}:`, error);
    throw new Error(`Failed to retrieve sections for class ID ${classId}.`);
  }
};

/**
 * Feature ID: MO-007
 * Feature Name: Section Management Backend Service - Update Section
 * What it does: Updates an existing section's data in the Firestore database.
 * Description: Takes section ID and partial section data, updates the document, and sets the 'updatedAt' timestamp.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for updating section, Frontend for editing section)
 */
export const updateSection = async (id: string, sectionData: Partial<Omit<Section, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const docRef = doc(db, 'sections', id);
    await updateDoc(docRef, { ...sectionData, updatedAt: Date.now() });
  } catch (error) {
    console.error(`Error updating section with ID ${id}:`, error);
    throw new Error(`Failed to update section with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-007
 * Feature Name: Section Management Backend Service - Delete Section
 * What it does: Deletes a section from the Firestore database by its ID.
 * Description: Removes a specific section document from the 'sections' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for deleting section, Frontend for deleting section)
 */
export const deleteSection = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'sections', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting section with ID ${id}:`, error);
    throw new Error(`Failed to delete section with ID ${id}.`);
  }
};
