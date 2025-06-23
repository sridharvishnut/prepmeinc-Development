// src/app/api/manage-organizations/exam-results/calculate-ranks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateAndAssignRanks,
} from '@/lib/manage-organizations/examResultService';

/**
 * Feature ID: MO-039
 * Feature Name: Exam Result Management API Endpoints - POST (Calculate Ranks)
 * What it does: Handles POST requests to trigger rank calculation for a specific class, section, and subject.
 * Description: Receives schoolId, classId, sectionId, and subjectId, and calls the backend service to calculate and update ranks for the relevant exam results.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/exam-results/calculate-ranks)
 * Module to be implemented: Frontend for triggering rank calculation.
 */
export async function POST(request: NextRequest) {
    try {
        const { schoolId, classId, sectionId, subjectId }: { schoolId: string; classId: string; sectionId: string; subjectId: string } = await request.json();

        if (!schoolId || !classId || !sectionId || !subjectId) {
            return NextResponse.json({ message: 'School ID, Class ID, Section ID, and Subject ID are required to calculate ranks.' }, { status: 400 });
        }

        await calculateAndAssignRanks(schoolId, classId, sectionId, subjectId);
        return NextResponse.json({ message: 'Ranks calculated and assigned successfully.' }, { status: 200 });
    } catch (error: any) {
        console.error('API Error (POST /exam-results/calculate-ranks):', error);
        return NextResponse.json({ message: error.message || 'Failed to calculate ranks.' }, { status: 500 });
    }
}
