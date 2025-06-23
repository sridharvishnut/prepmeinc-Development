// src/app/api/manage-organizations/subjects/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  addSubject,
  getSubjectsBySchoolId,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from '@/lib/manage-organizations/subjectService';
import { Subject } from '@/types/manage-organizations';

/**
 * Feature ID: MO-022
 * Feature Name: Subject Management API Endpoints - GET (List/Get By ID)
 * What it does: Handles GET requests for retrieving subject data (list all for a school or by ID).
 * Description: If an 'id' query parameter is provided, it fetches a specific subject; if 'schoolId' is provided, it returns all subjects for that school.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/subjects)
 * Module to be implemented: Manage-Organizations (Frontend for displaying subjects)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const schoolId = searchParams.get('schoolId');

    if (id) {
      const subject = await getSubjectById(id);
      if (subject) {
        return NextResponse.json({ subject }, { status: 200 });
      } else {
        return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
      }
    } else if (schoolId) {
      const subjects = await getSubjectsBySchoolId(schoolId);
      return NextResponse.json({ subjects }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Either subject ID or school ID is required' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API Error (GET /subjects):', error);
    return NextResponse.json({ message: error.message || 'Failed to retrieve subjects' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-022
 * Feature Name: Subject Management API Endpoints - POST (Add Subject)
 * What it does: Handles POST requests for adding a new subject.
 * Description: Receives subject data from the request body and uses the subjectService to add it to the database.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/subjects)
 * Module to be implemented: Manage-Organizations (Frontend for adding a subject)
 */
export async function POST(request: NextRequest) {
  try {
    const subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    if (!subjectData.schoolId || !subjectData.name) {
      return NextResponse.json({ message: 'School ID and subject name are required' }, { status: 400 });
    }
    const newSubject = await addSubject(subjectData);
    return NextResponse.json({ subject: newSubject }, { status: 201 });
  } catch (error: any) {
    console.error('API Error (POST /subjects):', error);
    return NextResponse.json({ message: error.message || 'Failed to add subject' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-022
 * Feature Name: Subject Management API Endpoints - PUT (Update Subject)
 * What it does: Handles PUT requests for updating an existing subject.
 * Description: Receives subject ID and updated data from the request, and uses the subjectService to modify the record.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/subjects)
 * Module to be implemented: Manage-Organizations (Frontend for editing a subject)
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, ...subjectData }: Partial<Subject> = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Subject ID is required for update' }, { status: 400 });
    }
    await updateSubject(id, subjectData);
    return NextResponse.json({ message: 'Subject updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error (PUT /subjects):', error);
    return NextResponse.json({ message: error.message || 'Failed to update subject' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-022
 * Feature Name: Subject Management API Endpoints - DELETE (Delete Subject)
 * What it does: Handles DELETE requests for removing a subject.
 * Description: Receives subject ID from the request and uses the subjectService to delete the corresponding record.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/subjects)
 * Module to be implemented: Manage-Organizations (Frontend for deleting a subject)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { id }: { id: string } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Subject ID is required for deletion' }, { status: 400 });
    }
    await deleteSubject(id);
    return NextResponse.json({ message: 'Subject deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error (DELETE /subjects):', error);
    return NextResponse.json({ message: error.message || 'Failed to delete subject' }, { status: 500 });
  }
}
