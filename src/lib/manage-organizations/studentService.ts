// src/lib/manage-organizations/studentService.ts

import { db } from '../../firebaseUtils'; // Assuming firebaseUtils exports `db` (Firestore instance)
import { Student } from '../../types/manage-organizations';
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

const studentsCollectionRef = collection(db, 'students');

/**
 * Feature ID: MO-015
 * Feature Name: Student Management Backend Service - Add Student
 * What it does: Adds a new student to the Firestore database.
 * Description: Takes student data (including schoolId, classId, sectionId), generates timestamps, and stores it in the 'students' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for adding student, Frontend for adding student)
 */
export const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student> => {
  try {
    const now = Date.now();
    const newStudent = {
      ...studentData,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(studentsCollectionRef, newStudent);
    return { id: docRef.id, ...newStudent } as Student;
  } catch (error) {
    console.error('Error adding student:', error);
    throw new Error('Failed to add student.');
  }
};

/**
 * Feature ID: MO-015
 * Feature Name: Student Management Backend Service - Get Student by ID
 * What it does: Retrieves a single student by its ID from the Firestore database.
 * Description: Fetches a specific student document from the 'students' collection using its unique ID.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for getting student, Frontend for viewing student details)
 */
export const getStudentById = async (id: string): Promise<Student | null> => {
  try {
    const docRef = doc(db, 'students', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Student;
    }
    return null;
  } catch (error) {
    console.error(`Error getting student with ID ${id}:`, error);
    throw new Error(`Failed to retrieve student with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-015
 * Feature Name: Student Management Backend Service - Get Students by Class/Section/School ID
 * What it does: Retrieves students based on provided schoolId, classId, and/or sectionId.
 * Description: Queries the 'students' collection with optional filters for school, class, and section.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for listing students, Frontend for displaying students)
 */
export const getStudents = async (filters: { schoolId?: string; classId?: string; sectionId?: string; }): Promise<Student[]> => {
  try {
    let q = query(studentsCollectionRef);
    if (filters.schoolId) {
      q = query(q, where('schoolId', '==', filters.schoolId));
    }
    if (filters.classId) {
      q = query(q, where('classId', '==', filters.classId));
    }
    if (filters.sectionId) {
      q = query(q, where('sectionId', '==', filters.sectionId));
    }

    const querySnapshot = await getDocs(q);
    const students: Student[] = [];
    querySnapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() } as Student);
    });
    return students;
  } catch (error) {
    console.error('Error getting students with filters:', error);
    throw new Error('Failed to retrieve students.');
  }
};

/**
 * Feature ID: MO-015
 * Feature Name: Student Management Backend Service - Update Student
 * What it does: Updates an existing student's data in the Firestore database.
 * Description: Takes student ID and partial student data, updates the document, and sets the 'updatedAt' timestamp.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for updating student, Frontend for editing student)
 */
export const updateStudent = async (id: string, studentData: Partial<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const docRef = doc(db, 'students', id);
    await updateDoc(docRef, { ...studentData, updatedAt: Date.now() });
  } catch (error) {
    console.error(`Error updating student with ID ${id}:`, error);
    throw new Error(`Failed to update student with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-015
 * Feature Name: Student Management Backend Service - Delete Student
 * What it does: Deletes a student from the Firestore database by its ID.
 * Description: Removes a specific student document from the 'students' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for deleting student, Frontend for deleting student)
 */
export const deleteStudent = async (id: string): Promise<void> => {
  try {
    // Deletion is now disallowed for school admins
    // This function will remain but its API endpoint will restrict school admin access.
    // Application admins can still use this via backend tools if needed.

    // For now, if the request is coming from a context where school admins initiate it,
    // the API route (src/app/api/manage-organizations/students/route.ts) will handle the permission.
    // The service layer itself does not perform permission checks, assuming the caller has permission.
    const docRef = doc(db, 'students', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting student with ID ${id}:`, error);
    throw new Error(`Failed to delete student with ID ${id}.`);
  }
};
