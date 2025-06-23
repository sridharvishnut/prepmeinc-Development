// src/app/api/manage-organizations/exam-results/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  addExamResult,
  getExamResults,
} from '@/lib/manage-organizations/examResultService';
import { ExamResult } from '@/types/manage-organizations';

/**
 * Feature ID: MO-038
 * Feature Name: Exam Result Management API Endpoints - POST (Add Exam Result)
 * What it does: Handles POST requests for adding a new exam result.
 * Description: Receives exam result data from the request body and uses the examResultService to add it to the database.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/exam-results)
 * Module to be implemented: Automated grading systems.
 */
export async function POST(request: NextRequest) {
  try {
    const resultData: Omit<ExamResult, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    if (!resultData.studentId || !resultData.testAttemptId || !resultData.schoolId || !resultData.classId || !resultData.subjectId || resultData.score === undefined || resultData.maxMarks === undefined || resultData.percentage === undefined || resultData.resultDate === undefined) {
      return NextResponse.json({ message: 'Missing required exam result fields' }, { status: 400 });
    }
    const newResult = await addExamResult(resultData);
    return NextResponse.json({ examResult: newResult }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('API Error (POST /exam-results):', error);
    return NextResponse.json({ message: errorMessage || 'Failed to add exam result' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-038
 * Feature Name: Exam Result Management API Endpoints - GET (List/Get By Filters)
 * What it does: Handles GET requests for retrieving exam result data based on filters.
 * Description: Returns exam results filtered by schoolId, classId, sectionId, studentId, and/or subjectId.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/exam-results)
 * Module to be implemented: Frontend for exam results dashboard.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const studentId = searchParams.get('studentId');
    const subjectId = searchParams.get('subjectId');

    const filters = {
      ...(schoolId && { schoolId }),
      ...(classId && { classId }),
      ...(sectionId && { sectionId }),
      ...(studentId && { studentId }),
      ...(subjectId && { subjectId }),
    };
    const examResults = await getExamResults(filters);
    return NextResponse.json({ examResults }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('API Error (GET /exam-results):', error);
    return NextResponse.json({ message: errorMessage || 'Failed to retrieve exam results' }, { status: 500 });
  }
}
