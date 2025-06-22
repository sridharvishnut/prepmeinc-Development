// src/app/api/manage-organizations/classes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  addClass,
  getClassesBySchoolId,
  getClassById,
  updateClass,
  deleteClass,
} from '../../../../src/lib/manage-organizations/classService';
import { Class } from '../../../../src/types/manage-organizations';

/**
 * Feature ID: MO-008
 * Feature Name: Class Management API Endpoints - GET (List/Get By ID)
 * What it does: Handles GET requests for retrieving class data (list all for a school or by ID).
 * Description: If an 'id' query parameter is provided, it fetches a specific class; if 'schoolId' is provided, it returns all classes for that school.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/classes)
 * Module to be implemented: Manage-Organizations (Frontend for displaying classes)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const schoolId = searchParams.get('schoolId');

    if (id) {
      const classItem = await getClassById(id);
      if (classItem) {
        return NextResponse.json({ class: classItem }, { status: 200 });
      } else {
        return NextResponse.json({ message: 'Class not found' }, { status: 404 });
      }
    } else if (schoolId) {
      const classes = await getClassesBySchoolId(schoolId);
      return NextResponse.json({ classes }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Either class ID or school ID is required' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API Error (GET /classes):', error);
    return NextResponse.json({ message: error.message || 'Failed to retrieve classes' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-008
 * Feature Name: Class Management API Endpoints - POST (Add Class)
 * What it does: Handles POST requests for adding a new class.
 * Description: Receives class data from the request body and uses the classService to add it to the database.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/classes)
 * Module to be implemented: Manage-Organizations (Frontend for adding a class)
 */
export async function POST(request: NextRequest) {
  try {
    const classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    if (!classData.schoolId || !classData.name) {
      return NextResponse.json({ message: 'School ID and class name are required' }, { status: 400 });
    }
    const newClass = await addClass(classData);
    return NextResponse.json({ class: newClass }, { status: 201 });
  } catch (error: any) {
    console.error('API Error (POST /classes):', error);
    return NextResponse.json({ message: error.message || 'Failed to add class' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-008
 * Feature Name: Class Management API Endpoints - PUT (Update Class)
 * What it does: Handles PUT requests for updating an existing class.
 * Description: Receives class ID and updated data from the request, and uses the classService to modify the record.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/classes)
 * Module to be implemented: Manage-Organizations (Frontend for editing a class)
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, ...classData }: Partial<Class> = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Class ID is required for update' }, { status: 400 });
    }
    await updateClass(id, classData);
    return NextResponse.json({ message: 'Class updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error (PUT /classes):', error);
    return NextResponse.json({ message: error.message || 'Failed to update class' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-008
 * Feature Name: Class Management API Endpoints - DELETE (Delete Class)
 * What it does: Handles DELETE requests for removing a class.
 * Description: Receives class ID from the request and uses the classService to delete the corresponding record.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/classes)
 * Module to be implemented: Manage-Organizations (Frontend for deleting a class)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { id }: { id: string } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Class ID is required for deletion' }, { status: 400 });
    }
    await deleteClass(id);
    return NextResponse.json({ message: 'Class deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error (DELETE /classes):', error);
    return NextResponse.json({ message: error.message || 'Failed to delete class' }, { status: 500 });
  }
}
