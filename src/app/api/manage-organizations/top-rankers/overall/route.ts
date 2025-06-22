// src/app/api/manage-organizations/top-rankers/overall/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getOverallTopStudents } from '../../../../../src/lib/manage-organizations/examResultService';

/**
 * Feature ID: MO-045
 * Feature Name: API Endpoint - Overall Top Students
 * What it does: Handles GET requests to retrieve top N students based on their average performance across all subjects within a class and section.
 * Description: Requires schoolId, classId, and sectionId as query parameters. Returns a list of student average performance objects including their overall rank.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/top-rankers)
 * Module to be implemented: Frontend for Elite Student Top Ranker Dashboard.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const topN = parseInt(searchParams.get('topN') || '10');

    if (!schoolId || !classId || !sectionId) {
      return NextResponse.json({ message: 'School ID, Class ID, and Section ID are required' }, { status: 400 });
    }

    const topStudents = await getOverallTopStudents(schoolId, classId, sectionId, topN);
    return NextResponse.json({ topStudents }, { status: 200 });
  } catch (error: any) {
    console.error('API Error (GET /top-rankers/overall):', error);
    return NextResponse.json({ message: error.message || 'Failed to retrieve overall top students' }, { status: 500 });
  }
}
