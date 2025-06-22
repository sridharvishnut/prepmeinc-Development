// src/lib/manage-organizations/examResultService.ts

import { db } from '../../firebaseUtils';
import { Test, TestAttempt, ExamResult, Question, Student, Subject } from '../../types/manage-organizations';
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
  orderBy,
  limit,
} from 'firebase/firestore';

const testsCollectionRef = collection(db, 'tests');
const testAttemptsCollectionRef = collection(db, 'testAttempts');
const examResultsCollectionRef = collection(db, 'examResults');
const questionsCollectionRef = collection(db, 'questions');
const studentsCollectionRef = collection(db, 'students');
const subjectsCollectionRef = collection(db, 'subjects');

/**
 * Feature ID: MO-034
 * Feature Name: Exam Results Backend Service - Add Question
 * What it does: Adds a new question to the Firestore database.
 * Description: Stores a single question, potentially linked to a subject material, in the 'questions' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: AI Integration for question generation, Frontend for question editing.
 */
export const addQuestion = async (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Question> => {
  try {
    const now = Date.now();
    const newQuestion = {
      ...questionData,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(questionsCollectionRef, newQuestion);
    return { id: docRef.id, ...newQuestion } as Question;
  } catch (error) {
    console.error('Error adding question:', error);
    throw new Error('Failed to add question.');
  }
};

/**
 * Feature ID: MO-034
 * Feature Name: Exam Results Backend Service - Get Question by ID
 * What it does: Retrieves a single question by its ID.
 * Description: Fetches a specific question document from the 'questions' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Frontend for question preview/edit.
 */
export const getQuestionById = async (id: string): Promise<Question | null> => {
  try {
    const docRef = doc(db, 'questions', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Question;
    }
    return null;
  } catch (error) {
    console.error(`Error getting question with ID ${id}:`, error);
    throw new Error(`Failed to retrieve question with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-034
 * Feature Name: Exam Results Backend Service - Add Test
 * What it does: Adds a new test to the Firestore database.
 * Description: Stores a test record, including references to questions, in the 'tests' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Frontend for test generation.
 */
export const addTest = async (testData: Omit<Test, 'id' | 'createdAt' | 'updatedAt'>): Promise<Test> => {
  try {
    const now = Date.now();
    const newTest = {
      ...testData,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(testsCollectionRef, newTest);
    return { id: docRef.id, ...newTest } as Test;
  } catch (error) {
    console.error('Error adding test:', error);
    throw new Error('Failed to add test.');
  }
};

/**
 * Feature ID: MO-034
 * Feature Name: Exam Results Backend Service - Get Test by ID
 * What it does: Retrieves a single test by its ID.
 * Description: Fetches a specific test document from the 'tests' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Frontend for taking tests.
 */
export const getTestById = async (id: string): Promise<Test | null> => {
  try {
    const docRef = doc(db, 'tests', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Test;
    }
    return null;
  } catch (error) {
    console.error(`Error getting test with ID ${id}:`, error);
    throw new Error(`Failed to retrieve test with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-034
 * Feature Name: Exam Results Backend Service - Get Tests by Filters
 * What it does: Retrieves tests based on provided filters (schoolId, classId, subjectMaterialId).
 * Description: Queries the 'tests' collection with optional filters.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Frontend for listing available tests.
 */
export const getTests = async (filters: { schoolId?: string; classId?: string; subjectMaterialId?: string }): Promise<Test[]> => {
  try {
    let q = query(testsCollectionRef);
    if (filters.schoolId) {
      q = query(q, where('schoolId', '==', filters.schoolId));
    }
    if (filters.classId) {
      q = query(q, where('classId', '==', filters.classId));
    }
    if (filters.subjectMaterialId) {
      q = query(q, where('subjectMaterialId', '==', filters.subjectMaterialId));
    }
    const querySnapshot = await getDocs(q);
    const tests: Test[] = [];
    querySnapshot.forEach((doc) => {
      tests.push({ id: doc.id, ...doc.data() } as Test);
    });
    return tests;
  } catch (error) {
    console.error('Error getting tests with filters:', error);
    throw new Error('Failed to retrieve tests.');
  }
};

/**
 * Feature ID: MO-034
 * Feature Name: Exam Results Backend Service - Add Test Attempt
 * What it does: Records a student's attempt on a test.
 * Description: Stores the student's submitted answers and relevant metadata in the 'testAttempts' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Frontend for students taking tests.
 */
export const addTestAttempt = async (attemptData: Omit<TestAttempt, 'id' | 'createdAt' | 'updatedAt'>): Promise<TestAttempt> => {
  try {
    const now = Date.now();
    const newAttempt = {
      ...attemptData,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(testAttemptsCollectionRef, newAttempt);
    return { id: docRef.id, ...newAttempt } as TestAttempt;
  } catch (error) {
    console.error('Error adding test attempt:', error);
    throw new Error('Failed to add test attempt.');
  }
};

/**
 * Feature ID: MO-034
 * Feature Name: Exam Results Backend Service - Update Test Attempt
 * What it does: Updates an existing test attempt (e.g., marking as completed, adding score).
 * Description: Modifies a test attempt record in Firestore.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Frontend for test grading/completion.
 */
export const updateTestAttempt = async (id: string, attemptData: Partial<Omit<TestAttempt, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const docRef = doc(db, 'testAttempts', id);
    await updateDoc(docRef, { ...attemptData, updatedAt: Date.now() });
  } catch (error) {
    console.error(`Error updating test attempt with ID ${id}:`, error);
    throw new Error(`Failed to update test attempt with ID ${id}.`);
  }
};

/**
 * Feature ID: MO-034
 * Feature Name: Exam Results Backend Service - Get Test Attempts by Filters
 * What it does: Retrieves test attempts based on provided filters (studentId, testId, schoolId, classId, sectionId).
 * Description: Queries the 'testAttempts' collection with optional filters.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Frontend for exam results dashboard.
 */
export const getTestAttempts = async (filters: { studentId?: string; testId?: string; schoolId?: string; classId?: string; sectionId?: string }): Promise<TestAttempt[]> => {
  try {
    let q = query(testAttemptsCollectionRef);
    if (filters.studentId) {
      q = query(q, where('studentId', '==', filters.studentId));
    }
    if (filters.testId) {
      q = query(q, where('testId', '==', filters.testId));
    }
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
    const attempts: TestAttempt[] = [];
    querySnapshot.forEach((doc) => {
      attempts.push({ id: doc.id, ...doc.data() } as TestAttempt);
    });
    return attempts;
  } catch (error) {
    console.error('Error getting test attempts with filters:', error);
    throw new Error('Failed to retrieve test attempts.');
  }
};

/**
 * Feature ID: MO-034
 * Feature Name: Exam Results Backend Service - Add Exam Result
 * What it does: Adds a new exam result record to the Firestore database.
 * Description: Stores a student's final exam result, including score, grade, and rank information, in the 'examResults' collection.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Automated grading systems.
 */
export const addExamResult = async (resultData: Omit<ExamResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExamResult> => {
  try {
    const now = Date.now();
    const newResult = {
      ...resultData,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(examResultsCollectionRef, newResult);
    return { id: docRef.id, ...newResult } as ExamResult;
  } catch (error) {
    console.error('Error adding exam result:', error);
    throw new Error('Failed to add exam result.');
  }
};

/**
 * Feature ID: MO-034
 * Feature Name: Exam Results Backend Service - Get Exam Results by Filters
 * What it does: Retrieves exam results based on provided filters (schoolId, classId, sectionId, studentId, subjectId).
 * Description: Queries the 'examResults' collection with optional filters.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Frontend for exam results dashboard.
 */
export const getExamResults = async (filters: { schoolId?: string; classId?: string; sectionId?: string; studentId?: string; subjectId?: string }): Promise<ExamResult[]> => {
  try {
    let q = query(examResultsCollectionRef);
    if (filters.schoolId) {
      q = query(q, where('schoolId', '==', filters.schoolId));
    }
    if (filters.classId) {
      q = query(q, where('classId', '==', filters.classId));
    }
    if (filters.sectionId) {
      q = query(q, where('sectionId', '==', filters.sectionId));
    }
    if (filters.studentId) {
      q = query(q, where('studentId', '==', filters.studentId));
    }
    if (filters.subjectId) {
      q = query(q, where('subjectId', '==', filters.subjectId));
    }
    const querySnapshot = await getDocs(q);
    const results: ExamResult[] = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() } as ExamResult);
    });
    return results;
  } catch (error) {
    console.error('Error getting exam results with filters:', error);
    throw new Error('Failed to retrieve exam results.');
  }
};

/**
 * Feature ID: MO-034
 * Feature Name: Exam Results Backend Service - Calculate Ranks
 * What it does: Calculates and updates ranks for students within a given class and section for a specific subject.
 * Description: Fetches all exam results for a specified class, section, and subject, sorts them by score, and assigns ranks. This is a conceptual implementation; in a real system, this might be triggered by a batch job or a specific event.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Automated rank calculation, Frontend for triggering rank calculation.
 */
export const calculateAndAssignRanks = async (schoolId: string, classId: string, sectionId: string, subjectId: string): Promise<void> => {
  try {
    const q = query(
      examResultsCollectionRef,
      where('schoolId', '==', schoolId),
      where('classId', '==', classId),
      where('sectionId', '==', sectionId),
      where('subjectId', '==', subjectId),
      orderBy('score', 'desc') // Order by score descending for ranking
    );
    const querySnapshot = await getDocs(q);
    let currentRank = 1;
    let prevScore: number | null = null;
    let rankTieCount = 0;

    for (const docSnap of querySnapshot.docs) {
      const result = { id: docSnap.id, ...docSnap.data() } as ExamResult;
      let rankToAssign = currentRank;

      if (prevScore !== null && result.score < prevScore) {
        currentRank += rankTieCount;
        rankTieCount = 0;
        rankToAssign = currentRank;
      } else if (prevScore !== null && result.score === prevScore) {
        // Tie: assign same rank as previous, increment tie count
        rankTieCount++;
        rankToAssign = currentRank; // Keep the same rank as the tied score
      } else if (prevScore === null) {
        // First element, simply assign currentRank
        rankToAssign = currentRank;
      }
      
      prevScore = result.score;
      
      // Update the document with the calculated rank
      const docRef = doc(db, 'examResults', result.id);
      await updateDoc(docRef, { rankInClass: rankToAssign, rankInSection: rankToAssign }); // For simplicity, class and section rank are same here
    }
  } catch (error) {
    console.error('Error calculating and assigning ranks:', error);
    throw new Error('Failed to calculate and assign ranks.');
  }
};

/**
 * Feature ID: MO-043
 * Feature Name: Exam Results Backend Service - Get Top Students By Subject
 * What it does: Retrieves the top N students for a specific subject within a given class and section.
 * Description: Queries exam results for the specified criteria, orders by score, and limits the results to the top N. Joins with student and subject data.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for subject-wise top students, Frontend dashboard)
 */
export const getTopStudentsBySubject = async (schoolId: string, classId: string, sectionId: string, subjectId: string, topN: number = 10): Promise<ExamResult[]> => {
  try {
    const q = query(
      examResultsCollectionRef,
      where('schoolId', '==', schoolId),
      where('classId', '==', classId),
      where('sectionId', '==', sectionId),
      where('subjectId', '==', subjectId),
      orderBy('score', 'desc'),
      limit(topN)
    );
    const querySnapshot = await getDocs(q);
    const results: ExamResult[] = [];
    for (const docSnap of querySnapshot.docs) {
      const result = { id: docSnap.id, ...docSnap.data() } as ExamResult;
      // Optionally fetch student details here if not already denormalized in examResult
      // const student = await getStudentById(result.studentId);
      // results.push({ ...result, studentName: student?.firstName + ' ' + student?.lastName });
      results.push(result);
    }
    return results;
  } catch (error) {
    console.error('Error getting top students by subject:', error);
    throw new Error('Failed to retrieve top students by subject.');
  }
};

/**
 * Feature ID: MO-043
 * Feature Name: Exam Results Backend Service - Get Overall Top Students
 * What it does: Retrieves the top N students based on their average performance across all subjects within a given school, class, and section.
 * Description: Fetches all exam results for the specified criteria, groups them by student, calculates average scores, sorts by average, and limits to top N. Joins with student and subject data.
 * Current Module Implemented: Manage-Organizations (src/lib/manage-organizations)
 * Module to be implemented: Manage-Organizations (API Endpoint for overall top students, Frontend dashboard)
 */
export const getOverallTopStudents = async (schoolId: string, classId: string, sectionId: string, topN: number = 10): Promise<ExamResult[]> => {
  try {
    const q = query(
      examResultsCollectionRef,
      where('schoolId', '==', schoolId),
      where('classId', '==', classId),
      where('sectionId', '==', sectionId)
    );
    const querySnapshot = await getDocs(q);

    const studentScores: { [studentId: string]: { totalScore: number; totalMaxMarks: number; subjectCount: number; results: ExamResult[] } } = {};

    for (const docSnap of querySnapshot.docs) {
      const result = { id: docSnap.id, ...docSnap.data() } as ExamResult;
      if (!studentScores[result.studentId]) {
        studentScores[result.studentId] = { totalScore: 0, totalMaxMarks: 0, subjectCount: 0, results: [] };
      }
      studentScores[result.studentId].totalScore += result.score;
      studentScores[result.studentId].totalMaxMarks += result.maxMarks;
      studentScores[result.studentId].subjectCount++;
      studentScores[result.studentId].results.push(result);
    }

    const studentAverages: Array<{ studentId: string; averagePercentage: number; totalScore: number; totalMaxMarks: number; rank?: number; firstName?: string; lastName?: string; rollNumber?: string; subjectResults: ExamResult[] }> = [];

    for (const studentId in studentScores) {
      const data = studentScores[studentId];
      const averagePercentage = (data.totalScore / data.totalMaxMarks) * 100;
      // Fetch student details
      const studentDoc = await getDoc(doc(db, 'students', studentId));
      let studentDetails: Student | null = null;
      if (studentDoc.exists()) {
        studentDetails = { id: studentDoc.id, ...studentDoc.data() } as Student;
      }

      studentAverages.push({
        studentId,
        averagePercentage,
        totalScore: data.totalScore,
        totalMaxMarks: data.totalMaxMarks,
        firstName: studentDetails?.firstName,
        lastName: studentDetails?.lastName,
        rollNumber: studentDetails?.rollNumber,
        subjectResults: data.results, // Include all subject results for display
      });
    }

    // Sort by average percentage in descending order
    studentAverages.sort((a, b) => b.averagePercentage - a.averagePercentage);

    // Assign ranks
    let currentRank = 1;
    let prevPercentage: number | null = null;
    let rankTieCount = 0;
    for (let i = 0; i < studentAverages.length; i++) {
      const student = studentAverages[i];
      if (prevPercentage !== null && student.averagePercentage < prevPercentage) {
        currentRank += rankTieCount;
        rankTieCount = 0;
      } else if (prevPercentage !== null && student.averagePercentage === prevPercentage) {
        rankTieCount++;
      }
      student.rank = currentRank;
      prevPercentage = student.averagePercentage;
    }

    return studentAverages.slice(0, topN) as unknown as ExamResult[]; // Cast back for compatibility, though structure is different
  } catch (error) {
    console.error('Error getting overall top students:', error);
    throw new Error('Failed to retrieve overall top students.');
  }
};
