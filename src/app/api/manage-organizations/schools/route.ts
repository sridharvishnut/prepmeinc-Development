// src/app/api/manage-organizations/schools/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  addSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
} from '../../../../src/lib/manage-organizations/schoolService';
import { School } from '../../../../src/types/manage-organizations';

/**
 * Feature ID: MO-003
 * Feature Name: School Management API Endpoints - GET (List/Get By ID)
 * What it does: Handles GET requests for retrieving school data (list all or by ID).
 * Description: If an 'id' query parameter is provided, it fetches a specific school; otherwise, it returns all schools.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/schools)
 * Module to be implemented: Manage-Organizations (Frontend for displaying schools)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const school = await getSchoolById(id);
      if (school) {
        return NextResponse.json({ school }, { status: 200 });
      } else {
        return NextResponse.json({ message: 'School not found' }, { status: 404 });
      }
    } else {
      const schools = await getAllSchools();
      return NextResponse.json({ schools }, { status: 200 });
    }
  } catch (error: any) {
    console.error('API Error (GET /schools):', error);
    return NextResponse.json({ message: error.message || 'Failed to retrieve schools' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-003
 * Feature Name: School Management API Endpoints - POST (Add School)
 * What it does: Handles POST requests for adding a new school.
 * Description: Receives school data from the request body and uses the schoolService to add it to the database.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/schools)
 * Module to be implemented: Manage-Organizations (Frontend for adding a school)
 */
export async function POST(request: NextRequest) {
  try {
    const schoolData: Omit<School, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    const newSchool = await addSchool(schoolData);
    return NextResponse.json({ school: newSchool }, { status: 201 });
  } catch (error: any) {
    console.error('API Error (POST /schools):', error);
    return NextResponse.json({ message: error.message || 'Failed to add school' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-003
 * Feature Name: School Management API Endpoints - PUT (Update School)
 * What it does: Handles PUT requests for updating an existing school.
 * Description: Receives school ID and updated data from the request, and uses the schoolService to modify the record.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/schools)
 * Module to be implemented: Manage-Organizations (Frontend for editing a school)
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, ...schoolData }: Partial<School> = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'School ID is required for update' }, { status: 400 });
    }
    await updateSchool(id, schoolData);
    return NextResponse.json({ message: 'School updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error (PUT /schools):', error);
    return NextResponse.json({ message: error.message || 'Failed to update school' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-003
 * Feature Name: School Management API Endpoints - DELETE (Delete School)
 * What it does: Handles DELETE requests for removing a school.
 * Description: Receives school ID from the request and uses the schoolService to delete the corresponding record.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/schools)
 * Module to be implemented: Manage-Organizations (Frontend for deleting a school)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { id }: { id: string } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'School ID is required for deletion' }, { status: 400 });
    }
    await deleteSchool(id);
    return NextResponse.json({ message: 'School deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error (DELETE /schools):', error);
    return NextResponse.json({ message: error.message || 'Failed to delete school' }, { status: 500 });
  }
}
