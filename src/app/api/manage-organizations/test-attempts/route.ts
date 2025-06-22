// src/app/api/manage-organizations/test-attempts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  addTestAttempt,
  getTestAttempts,
  updateTestAttempt,
} from '../../../../src/lib/manage-organizations/examResultService';
import { TestAttempt } from '../../../../src/types/manage-organizations';

/**
 * Feature ID: MO-037
 * Feature Name: Test Attempt Management API Endpoints - POST (Add Test Attempt)
 * What it does: Handles POST requests for adding a new test attempt.
 * Description: Receives test attempt data from the request body and uses the examResultService to add it to the database.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/test-attempts)
 * Module to be implemented: Frontend for students taking tests.
 */
export async function POST(request: NextRequest) {
  try {
    const attemptData: Omit<TestAttempt, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    if (!attemptData.testId || !attemptData.studentId || !attemptData.schoolId || !attemptData.classId || !attemptData.sectionId || !attemptData.submittedAnswers) {
      return NextResponse.json({ message: 'Missing required test attempt fields' }, { status: 400 });
    }
    const newAttempt = await addTestAttempt(attemptData);
    return NextResponse.json({ testAttempt: newAttempt }, { status: 201 });
  } catch (error: any) {
    console.error('API Error (POST /test-attempts):', error);
    return NextResponse.json({ message: error.message || 'Failed to add test attempt' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-037
 * Feature Name: Test Attempt Management API Endpoints - GET (List/Get By Filters)
 * What it does: Handles GET requests for retrieving test attempt data based on filters.
 * Description: Returns test attempts filtered by studentId, testId, schoolId, classId, and/or sectionId.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/test-attempts)
 * Module to be implemented: Frontend for exam results dashboard.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const testId = searchParams.get('testId');
    const schoolId = searchParams.get('schoolId');
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');

    const filters = {
      ...(studentId && { studentId }),
      ...(testId && { testId }),
      ...(schoolId && { schoolId }),
      ...(classId && { classId }),
      ...(sectionId && { sectionId }),
    };
    const testAttempts = await getTestAttempts(filters);
    return NextResponse.json({ testAttempts }, { status: 200 });
  } catch (error: any) {
    console.error('API Error (GET /test-attempts):', error);
    return NextResponse.json({ message: error.message || 'Failed to retrieve test attempts' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-037
 * Feature Name: Test Attempt Management API Endpoints - PUT (Update Test Attempt)
 * What it does: Handles PUT requests for updating an existing test attempt.
 * Description: Receives test attempt ID and updated data from the request, and uses the examResultService to modify the record.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/test-attempts)
 * Module to be implemented: Automated grading, Frontend for test completion.
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, ...attemptData }: Partial<TestAttempt> = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Test Attempt ID is required for update' }, { status: 400 });
    }
    await updateTestAttempt(id, attemptData);
    return NextResponse.json({ message: 'Test attempt updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error (PUT /test-attempts):', error);
    return NextResponse.json({ message: error.message || 'Failed to update test attempt' }, { status: 500 });
  }
}
