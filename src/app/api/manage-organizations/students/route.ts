// src/app/api/manage-organizations/students/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from '../../../../src/lib/manage-organizations/studentService';
import { Student } from '../../../../src/types/manage-organizations';

/**
 * Feature ID: MO-016
 * Feature Name: Student Management API Endpoints - GET (List/Get By ID)
 * What it does: Handles GET requests for retrieving student data (list all with filters or by ID).
 * Description: If an 'id' query parameter is provided, it fetches a specific student; otherwise, it returns all students filtered by schoolId, classId, and/or sectionId.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/students)
 * Module to be implemented: Manage-Organizations (Frontend for displaying students)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const schoolId = searchParams.get('schoolId');
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');

    if (id) {
      const student = await getStudentById(id);
      if (student) {
        return NextResponse.json({ student }, { status: 200 });
      } else {
        return NextResponse.json({ message: 'Student not found' }, { status: 404 });
      }
    } else {
      const filters = {
        ...(schoolId && { schoolId }),
        ...(classId && { classId }),
        ...(sectionId && { sectionId }),
      };
      const students = await getStudents(filters);
      return NextResponse.json({ students }, { status: 200 });
    }
  } catch (error: any) {
    console.error('API Error (GET /students):', error);
    return NextResponse.json({ message: error.message || 'Failed to retrieve students' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-016
 * Feature Name: Student Management API Endpoints - POST (Add Student)
 * What it does: Handles POST requests for adding a new student.
 * Description: Receives student data from the request body and uses the studentService to add it to the database.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/students)
 * Module to be implemented: Manage-Organizations (Frontend for adding a student, Bulk upload endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    if (!studentData.schoolId || !studentData.classId || !studentData.sectionId || !studentData.firstName || !studentData.lastName || !studentData.admissionNumber || !studentData.rollNumber) {
      return NextResponse.json({ message: 'Missing required student fields' }, { status: 400 });
    }
    const newStudent = await addStudent(studentData);
    return NextResponse.json({ student: newStudent }, { status: 201 });
  } catch (error: any) {
    console.error('API Error (POST /students):', error);
    return NextResponse.json({ message: error.message || 'Failed to add student' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-016
 * Feature Name: Student Management API Endpoints - PUT (Update Student)
 * What it does: Handles PUT requests for updating an existing student.
 * Description: Receives student ID and updated data from the request, and uses the studentService to modify the record.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/students)
 * Module to be implemented: Manage-Organizations (Frontend for editing a student)
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, ...studentData }: Partial<Student> = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Student ID is required for update' }, { status: 400 });
    }
    await updateStudent(id, studentData);
    return NextResponse.json({ message: 'Student updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error (PUT /students):', error);
    return NextResponse.json({ message: error.message || 'Failed to update student' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-016
 * Feature Name: Student Management API Endpoints - DELETE (Delete Student)
 * What it does: Handles DELETE requests for removing a student.
 * Description: Receives student ID from the request and uses the studentService to delete the corresponding record.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/students)
 * Module to be implemented: Manage-Organizations (Frontend for deleting a student)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { id }: { id: string } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Student ID is required for deletion' }, { status: 400 });
    }
    await deleteStudent(id);
    return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error (DELETE /students):', error);
    return NextResponse.json({ message: error.message || 'Failed to delete student' }, { status: 500 });
  }
}
