// src/components/manage-organizations/users/UserForm.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { SchoolUser, UserRoleType, School } from '../../../types/manage-organizations';

interface UserFormProps {
  onUserAdded: () => void;
  selectedSchoolId: string | null; // For school-specific users
  // Optional: For editing existing user
  // initialData?: SchoolUser;
  // onUserUpdated?: () => void;
}

/**
 * Feature ID: MO-031
 * Feature Name: Frontend Component - User Form
 * What it does: Provides a form for adding new school user records.
 * Description: Allows administrators to input details for a new school user, including their role (Principal, Teacher, School Admin), and associate them with a selected school. Submits data via the API.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/users)
 * Module to be implemented: Manage-Organizations (Integration into User Management tab)
 */
const UserForm: React.FC<UserFormProps> = ({ onUserAdded, selectedSchoolId }) => {
  const [id, setId] = useState<string>(''); // This should ideally come from Firebase Auth UID
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [role, setRole] = useState<UserRoleType | ''>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSchoolId) {
      setId('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setRole('');
      setError(null);
      setSuccess(null);
    }
  }, [selectedSchoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSchoolId) {
      setError('Please select a school first to add a user.');
      return;
    }
    if (!id) {
        setError('User ID (Firebase Auth UID) is required.');
        return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const userData: Omit<SchoolUser, 'createdAt' | 'updatedAt'> = {
        id: id, // In a real scenario, this 'id' would be the Firebase Auth UID generated upon user creation.
        schoolId: selectedSchoolId,
        firstName,
        lastName,
        email,
        phoneNumber,
        role: role as UserRoleType,
        isActive: true, // New users are active by default
        // assignedClasses and assignedSections would be managed separately or after user creation
      };

      const response = await fetch('/api/manage-organizations/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add user');
      }

      const data = await response.json();
      setSuccess(`User '${data.user.firstName} ${data.user.lastName}' (${data.user.role}) added successfully!`);
      // Clear form fields
      setId('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setRole('');

      onUserAdded(); // Notify parent component to refresh list
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const isFormDisabled = !selectedSchoolId;

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New School User</h2>
      <p className="text-sm text-gray-600 mb-4">Note: For a production system, user creation in Firebase Authentication should happen first, and then the UID should be used as the 'User ID' here.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700">User ID (Firebase Auth UID)</label>
          <input
            type="text"
            id="userId"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            disabled={isFormDisabled}
            placeholder="e.g., abcdef1234567890"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRoleType)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isFormDisabled}
            >
              <option value="">Select Role</option>
              <option value="school_admin">School Admin</option>
              <option value="principal">Principal</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mt-4">{success}</p>}
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading || isFormDisabled}
        >
          {loading ? 'Adding User...' : 'Add User'}
        </button>
      </form>
    </div>
  );
};

export default UserForm;
