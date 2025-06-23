// src/app/api/manage-organizations/subject-materials/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  addSubjectMaterial,
  getSubjectMaterialsBySubjectId,
  getSubjectMaterialById,
  updateSubjectMaterial,
  deleteSubjectMaterial,
} from '@/lib/manage-organizations/subjectMaterialService';
import { SubjectMaterial } from '@/types/manage-organizations';

/**
 * Feature ID: MO-023
 * Feature Name: Subject Material Management API Endpoints - GET (List/Get By ID)
 * What it does: Handles GET requests for retrieving subject material data (list all for a subject or by ID).
 * Description: If an 'id' query parameter is provided, it fetches a specific subject material; if 'subjectId' is provided, it returns all materials for that subject.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/subject-materials)
 * Module to be implemented: Manage-Organizations (Frontend for displaying subject materials)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const subjectId = searchParams.get('subjectId');

    if (id) {
      const material = await getSubjectMaterialById(id);
      if (material) {
        return NextResponse.json({ material }, { status: 200 });
      } else {
        return NextResponse.json({ message: 'Subject material not found' }, { status: 404 });
      }
    } else if (subjectId) {
      const materials = await getSubjectMaterialsBySubjectId(subjectId);
      return NextResponse.json({ materials }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Either subject material ID or subject ID is required' }, { status: 400 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('API Error (GET /subject-materials):', error);
    return NextResponse.json({ message: errorMessage || 'Failed to retrieve subject materials' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-023
 * Feature Name: Subject Material Management API Endpoints - POST (Add Subject Material)
 * What it does: Handles POST requests for adding a new subject material.
 * Description: Receives subject material data from the request body and uses the subjectMaterialService to add it to the database.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/subject-materials)
 * Module to be implemented: Manage-Organizations (Frontend for adding a subject material)
 */
export async function POST(request: NextRequest) {
  try {
    const materialData: Omit<SubjectMaterial, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    if (!materialData.subjectId || !materialData.schoolId || !materialData.classId || !materialData.title || !materialData.fileUrl || !materialData.fileName || !materialData.fileType) {
      return NextResponse.json({ message: 'Missing required subject material fields' }, { status: 400 });
    }
    const newMaterial = await addSubjectMaterial(materialData);
    return NextResponse.json({ material: newMaterial }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('API Error (POST /subject-materials):', error);
    return NextResponse.json({ message: errorMessage || 'Failed to add subject material' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-023
 * Feature Name: Subject Material Management API Endpoints - PUT (Update Subject Material)
 * What it does: Handles PUT requests for updating an existing subject material.
 * Description: Receives subject material ID and updated data from the request, and uses the subjectMaterialService to modify the record.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/subject-materials)
 * Module to be implemented: Manage-Organizations (Frontend for editing a subject material)
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, ...materialData }: Partial<SubjectMaterial> = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Subject Material ID is required for update' }, { status: 400 });
    }
    await updateSubjectMaterial(id, materialData);
    return NextResponse.json({ message: 'Subject Material updated successfully' }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('API Error (PUT /subject-materials):', error);
    return NextResponse.json({ message: errorMessage || 'Failed to update subject material' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-023
 * Feature Name: Subject Material Management API Endpoints - DELETE (Delete Subject Material)
 * What it does: Handles DELETE requests for removing a subject material.
 * Description: Receives subject material ID from the request and uses the subjectMaterialService to delete the corresponding record.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/subject-materials)
 * Module to be implemented: Manage-Organizations (Frontend for deleting a subject material)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { id }: { id: string } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Subject Material ID is required for deletion' }, { status: 400 });
    }
    await deleteSubjectMaterial(id);
    return NextResponse.json({ message: 'Subject Material deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('API Error (DELETE /subject-materials):', error);
    return NextResponse.json({ message: errorMessage || 'Failed to delete subject material' }, { status: 500 });
  }
}
