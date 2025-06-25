// src/components/manage-organizations/users/UserList.tsx

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { SchoolUser, UserRoleType } from '../../../types/manage-organizations';

interface UserListProps {
  schoolId: string | null;
  refreshTrigger: number;
  onSelectUser?: (userId: string | null) => void; // Added optional prop
  selectedUserId?: string | null; // Added optional prop
  showSelectAllOption?: boolean; // Added optional prop
}

/**
 * Feature ID: MO-032
 * Feature Name: Frontend Component - User List
 * What it does: Displays a list of school users based on selected school and optional role filter.
 * Description: Fetches school users from the API using provided schoolId and presents them in a table. Allows for filtering by role.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/users)
 * Module to be implemented: Manage-Organizations (Integration into User Management tab, Edit/Delete functionality, Role-based filtering UI)
 */
const UserList: React.FC<UserListProps> = ({
  schoolId,
  refreshTrigger,
  onSelectUser,
  selectedUserId,
  showSelectAllOption,
}) => {
  const [users, setUsers] = useState<SchoolUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<UserRoleType | '' | 'all'>('all');

  const fetchUsers = useCallback(async () => {
    if (!schoolId) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('schoolId', schoolId);
      if (filterRole !== 'all') {
        queryParams.append('role', filterRole);
      }

      const response = await fetch(`/api/manage-organizations/users?${
        queryParams.toString()
      }`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [schoolId, filterRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshTrigger]); // Re-fetch when filters or refreshTrigger changes

  if (!schoolId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-6 text-gray-600">
        Please select a school to view users.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-4">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">School Users</h2>
      <div className="mb-4">
        <label htmlFor="filterRole" className="block text-sm font-medium text-gray-700 mb-1">Filter by Role:</label>
        <select
          id="filterRole"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as UserRoleType | '' | 'all')}
          className="mt-1 block w-full md:w-auto border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="all">All Roles</option>
          <option value="school_admin">School Admin</option>
          <option value="principal">Principal</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="application_admin">Application Admin</option>
        </select>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-600">No users found for this school with the selected filter.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {showSelectAllOption && (
                <tr
                  className={`${
                    selectedUserId === null ? 'bg-blue-50' : ''
                  } hover:bg-gray-50 cursor-pointer`}
                  onClick={() => onSelectUser && onSelectUser(null)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={5}>All Users</td>
                </tr>
              )}
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onSelectUser && onSelectUser(user.id)}
                  className={`cursor-pointer hover:bg-gray-100 ${selectedUserId === user.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role.replace(/_/g, ' ').replace(/ \w/g, c => c.toUpperCase())}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Add edit/delete buttons here later */}
                    <span className="text-gray-400">Actions (coming soon)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;
