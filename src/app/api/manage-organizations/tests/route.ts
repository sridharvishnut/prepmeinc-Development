// src/app/api/manage-organizations/tests/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  addTest,
  getTests,
  getTestById,
} from '../../../../src/lib/manage-organizations/examResultService';
import { Test } from '../../../../src/types/manage-organizations';

/**
 * Feature ID: MO-036
 * Feature Name: Test Management API Endpoints - POST (Add Test)
 * What it does: Handles POST requests for adding a new test.
 * Description: Receives test data from the request body and uses the examResultService to add it to the database.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/tests)
 * Module to be implemented: Frontend for test generation.
 */
export async function POST(request: NextRequest) {
  try {
    const testData: Omit<Test, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    if (!testData.schoolId || !testData.classId || !testData.subjectMaterialId || !testData.title || !testData.questions) {
      return NextResponse.json({ message: 'Missing required test fields' }, { status: 400 });
    }
    const newTest = await addTest(testData);
    return NextResponse.json({ test: newTest }, { status: 201 });
  } catch (error: any) {
    console.error('API Error (POST /tests):', error);
    return NextResponse.json({ message: error.message || 'Failed to add test' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-036
 * Feature Name: Test Management API Endpoints - GET (List/Get By ID)
 * What it does: Handles GET requests for retrieving test data (list all with filters or by ID).
 * Description: If an 'id' query parameter is provided, it fetches a specific test; otherwise, it returns all tests filtered by schoolId, classId, and/or subjectMaterialId.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/tests)
 * Module to be implemented: Frontend for displaying tests.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const schoolId = searchParams.get('schoolId');
    const classId = searchParams.get('classId');
    const subjectMaterialId = searchParams.get('subjectMaterialId');

    if (id) {
      const test = await getTestById(id);
      if (test) {
        return NextResponse.json({ test }, { status: 200 });
      } else {
        return NextResponse.json({ message: 'Test not found' }, { status: 404 });
      }
    } else {
      const filters = {
        ...(schoolId && { schoolId }),
        ...(classId && { classId }),
        ...(subjectMaterialId && { subjectMaterialId }),
      };
      const tests = await getTests(filters);
      return NextResponse.json({ tests }, { status: 200 });
    }
  } catch (error: any) {
    console.error('API Error (GET /tests):', error);
    return NextResponse.json({ message: error.message || 'Failed to retrieve tests' }, { status: 500 });
  }
}
