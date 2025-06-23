// src/app/api/manage-organizations/top-rankers/subject-wise/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTopStudentsBySubject } from '@/lib/manage-organizations/examResultService';

/**
 * Feature ID: MO-044
 * Feature Name: API Endpoint - Top Students by Subject
 * What it does: Handles GET requests to retrieve top N students for a specific subject within a class and section.
 * Description: Requires schoolId, classId, sectionId, and subjectId as query parameters. Returns a list of ExamResult objects for the top students.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/top-rankers)
 * Module to be implemented: Frontend for Elite Student Top Ranker Dashboard.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const subjectId = searchParams.get('subjectId');
    const topN = parseInt(searchParams.get('topN') || '10');

    if (!schoolId || !classId || !sectionId || !subjectId) {
      return NextResponse.json({ message: 'School ID, Class ID, Section ID, and Subject ID are required' }, { status: 400 });
    }

    const topStudents = await getTopStudentsBySubject(schoolId, classId, sectionId, subjectId, topN);
    return NextResponse.json({ topStudents }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('API Error (GET /top-rankers/subject-wise):', error);
    return NextResponse.json({ message: errorMessage || 'Failed to retrieve top students by subject' }, { status: 500 });
  }
}
