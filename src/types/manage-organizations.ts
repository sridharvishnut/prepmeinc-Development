
// src/types/manage-organizations.ts

/**
 * Feature ID: MO-001
 * Feature Name: Core Data Models for Manage Organizations
 * What it does: Defines the TypeScript interfaces for key entities within the school management system (School, Class, Section, Student, Subject, UserRole, etc.).
 * Description: Establishes the data structure for the Manage Organizations module, ensuring type safety and consistency across the application. These models will be used by both frontend and backend components.
 * Current Module Implemented: Manage-Organizations (src/types)
 * Module to be implemented: (None - foundational)
 */

export interface School {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}

export interface Class {
  id: string;
  schoolId: string;
  name: string; // e.g., "Class 1", "Grade 10"
  createdAt: number;
  updatedAt: number;
}

export interface Section {
  id: string;
  classId: string;
  schoolId: string;
  name: string; // e.g., "Section A", "Section B"
  createdAt: number;
  updatedAt: number;
}

export interface Student {
  id: string;
  schoolId: string;
  classId: string;
  sectionId: string;
  userId?: string; // Link to a user account if student has one
  firstName: string;
  lastName: string;
  dateOfBirth: number; // Timestamp
  gender: 'Male' | 'Female' | 'Other';
  admissionNumber: string;
  rollNumber: string; // Specific to class/section
  parentName: string;
  parentContact: string;
  parentEmail: string;
  createdAt: number;
  updatedAt: number;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string; // e.g., "Mathematics", "Science"
  description?: string;
  isCustom: boolean; // True if added by admin, false for default subjects
  createdAt: number;
  updatedAt: number;
}

export interface SubjectMaterial {
  id: string;
  subjectId: string;
  classId: string; // Material might be specific to a class
  schoolId: string;
  title: string;
  description?: string;
  fileUrl: string; // URL to the uploaded document
  fileName: string;
  fileType: string; // e.g., 'pdf', 'docx'
  uploadedBy: string; // userId of the uploader
  testKeyFileUrl?: string; // Optional: URL to test keys for the material
  createdAt: number;
  updatedAt: number;
}

export type UserRoleType = 'application_admin' | 'school_admin' | 'principal' | 'teacher' | 'student';

export interface SchoolUser {
  id: string; // Firebase Auth UID
  schoolId: string; // The school this user belongs to
  role: UserRoleType;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  assignedClasses?: string[]; // For teachers/principals: array of class IDs they are assigned to
  assignedSections?: string[]; // For teachers: array of section IDs they are assigned to
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Question {
  id: string;
  subjectMaterialId: string;
  questionText: string;
  options: { [key: string]: string }; // e.g., { a: "Option A", b: "Option B" }
  correctAnswer: string; // e.g., "a"
  isGeneratedByAI: boolean;
  sourceDocumentUrl?: string; // URL of the document from which it was extracted
  createdAt: number;
  updatedAt: number;
}

export interface Test {
  id: string;
  subjectMaterialId: string;
  generatedBy: 'ai_from_document' | 'ai_from_content' | 'admin_manual';
  questions: string[]; // Array of question IDs
  schoolId: string;
  classId: string;
  sectionId?: string; // Optional, if test is for a specific section
  title: string;
  description?: string;
  durationMinutes?: number;
  maxMarks?: number;
  createdAt: number;
  updatedAt: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  studentId: string;
  schoolId: string;
  classId: string;
  sectionId: string;
  startTime: number;
  endTime?: number;
  submittedAnswers: { [questionId: string]: string }; // { questionId: "chosenOptionKey" }
  score?: number;
  totalQuestions: number;
  correctAnswersCount?: number;
  incorrectAnswersCount?: number;
  status: 'started' | 'completed' | 'graded';
  createdAt: number;
  updatedAt: number;
}

export interface ExamResult {
  id: string;
  studentId: string;
  testAttemptId: string;
  schoolId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  score: number;
  maxMarks: number;
  grade?: string;
  percentage: number;
  rankInClass?: number;
  rankInSection?: number;
  resultDate: number; // Timestamp
  createdAt: number;
  updatedAt: number;
}
