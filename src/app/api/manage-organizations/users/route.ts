// src/app/api/manage-organizations/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  addSchoolUser,
  getSchoolUsers,
  getSchoolUserById,
  updateSchoolUser,
  deleteSchoolUser,
} from '../../../../src/lib/manage-organizations/userService';
import { SchoolUser } from '../../../../src/types/manage-organizations';

/**
 * Feature ID: MO-030
 * Feature Name: User Management API Endpoints - GET (List/Get By ID)
 * What it does: Handles GET requests for retrieving school user data (list all with filters or by ID).
 * Description: If an 'id' query parameter is provided, it fetches a specific school user; otherwise, it returns all school users filtered by schoolId and/or role.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/users)
 * Module to be implemented: Manage-Organizations (Frontend for displaying users)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const schoolId = searchParams.get('schoolId');
    const role = searchParams.get('role'); // UserRoleType

    if (id) {
      const user = await getSchoolUserById(id);
      if (user) {
        return NextResponse.json({ user }, { status: 200 });
      } else {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
    } else {
      const filters: { schoolId?: string; role?: SchoolUser['role'] } = {};
      if (schoolId) filters.schoolId = schoolId;
      if (role) filters.role = role as SchoolUser['role'];

      const users = await getSchoolUsers(filters);
      return NextResponse.json({ users }, { status: 200 });
    }
  } catch (error: any) {
    console.error('API Error (GET /users):', error);
    return NextResponse.json({ message: error.message || 'Failed to retrieve users' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-030
 * Feature Name: User Management API Endpoints - POST (Add School User)
 * What it does: Handles POST requests for adding a new school user.
 * Description: Receives user data from the request body and uses the userService to add it to the database. Assumes the 'id' in the payload is the Firebase Auth UID.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/users)
 * Module to be implemented: Manage-Organizations (Frontend for adding a user)
 */
export async function POST(request: NextRequest) {
  try {
    const userData: SchoolUser = await request.json();
    // Basic validation, more can be added based on requirements
    if (!userData.id || !userData.schoolId || !userData.role || !userData.email || !userData.firstName || !userData.lastName) {
      return NextResponse.json({ message: 'Missing required user fields' }, { status: 400 });
    }
    const newUser = await addSchoolUser(userData);
    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('API Error (POST /users):', error);
    return NextResponse.json({ message: error.message || 'Failed to add user' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-030
 * Feature Name: User Management API Endpoints - PUT (Update School User)
 * What it does: Handles PUT requests for updating an existing school user.
 * Description: Receives user ID and updated data from the request, and uses the userService to modify the record.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/users)
 * Module to be implemented: Manage-Organizations (Frontend for editing a user)
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, ...userData }: Partial<SchoolUser> = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'User ID is required for update' }, { status: 400 });
    }
    await updateSchoolUser(id, userData);
    return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error (PUT /users):', error);
    return NextResponse.json({ message: error.message || 'Failed to update user' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-030
 * Feature Name: User Management API Endpoints - DELETE (Delete School User)
 * What it does: Handles DELETE requests for removing a school user.
 * Description: Receives user ID from the request and uses the userService to delete the corresponding record.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/users)
 * Module to be implemented: Manage-Organizations (Frontend for deleting a user)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { id }: { id: string } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'User ID is required for deletion' }, { status: 400 });
    }
    await deleteSchoolUser(id);
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error (DELETE /users):', error);
    return NextResponse.json({ message: error.message || 'Failed to delete user' }, { status: 500 });
  }
}
