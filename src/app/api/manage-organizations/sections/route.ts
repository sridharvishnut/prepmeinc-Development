// src/app/api/manage-organizations/sections/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  addSection,
  getSectionsByClassId,
  getSectionById,
  updateSection,
  deleteSection,
} from '../../../../src/lib/manage-organizations/sectionService';
import { Section } from '../../../../src/types/manage-organizations';

/**
 * Feature ID: MO-013
 * Feature Name: Section Management API Endpoints - GET (List/Get By ID)
 * What it does: Handles GET requests for retrieving section data (list all for a class or by ID).
 * Description: If an 'id' query parameter is provided, it fetches a specific section; if 'classId' is provided, it returns all sections for that class.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/sections)
 * Module to be implemented: Manage-Organizations (Frontend for displaying sections)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const classId = searchParams.get('classId');

    if (id) {
      const sectionItem = await getSectionById(id);
      if (sectionItem) {
        return NextResponse.json({ section: sectionItem }, { status: 200 });
      } else {
        return NextResponse.json({ message: 'Section not found' }, { status: 404 });
      }
    } else if (classId) {
      const sections = await getSectionsByClassId(classId);
      return NextResponse.json({ sections }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Either section ID or class ID is required' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API Error (GET /sections):', error);
    return NextResponse.json({ message: error.message || 'Failed to retrieve sections' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-013
 * Feature Name: Section Management API Endpoints - POST (Add Section)
 * What it does: Handles POST requests for adding a new section.
 * Description: Receives section data from the request body and uses the sectionService to add it to the database.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/sections)
 * Module to be implemented: Manage-Organizations (Frontend for adding a section)
 */
export async function POST(request: NextRequest) {
  try {
    const sectionData: Omit<Section, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    if (!sectionData.schoolId || !sectionData.classId || !sectionData.name) {
      return NextResponse.json({ message: 'School ID, Class ID, and section name are required' }, { status: 400 });
    }
    const newSection = await addSection(sectionData);
    return NextResponse.json({ section: newSection }, { status: 201 });
  } catch (error: any) {
    console.error('API Error (POST /sections):', error);
    return NextResponse.json({ message: error.message || 'Failed to add section' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-013
 * Feature Name: Section Management API Endpoints - PUT (Update Section)
 * What it does: Handles PUT requests for updating an existing section.
 * Description: Receives section ID and updated data from the request, and uses the sectionService to modify the record.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/sections)
 * Module to be implemented: Manage-Organizations (Frontend for editing a section)
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, ...sectionData }: Partial<Section> = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Section ID is required for update' }, { status: 400 });
    }
    await updateSection(id, sectionData);
    return NextResponse.json({ message: 'Section updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error (PUT /sections):', error);
    return NextResponse.json({ message: error.message || 'Failed to update section' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-013
 * Feature Name: Section Management API Endpoints - DELETE (Delete Section)
 * What it does: Handles DELETE requests for removing a section.
 * Description: Receives section ID from the request and uses the sectionService to delete the corresponding record.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/sections)
 * Module to be implemented: Manage-Organizations (Frontend for deleting a section)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { id }: { id: string } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Section ID is required for deletion' }, { status: 400 });
    }
    await deleteSection(id);
    return NextResponse.json({ message: 'Section deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error (DELETE /sections):', error);
    return NextResponse.json({ message: error.message || 'Failed to delete section' }, { status: 500 });
  }
}
