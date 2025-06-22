// src/components/manage-organizations/classes/ClassForm.tsx

"use client";

import React, { useState } from 'react';
import { Class, School } from '../../../types/manage-organizations';

interface ClassFormProps {
  schoolId: string | null; // The currently selected school
  onClassAdded: () => void;
}

/**
 * Feature ID: MO-009
 * Feature Name: Frontend Component - Class Form
 * What it does: Provides a form for adding new class records for a selected school.
 * Description: Allows administrators to input details for a new class and submit them via the API, associated with a specific school.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/classes)
 * Module to be implemented: Manage-Organizations (Integration into Classes & Sections tab)
 */
const ClassForm: React.FC<ClassFormProps> = ({ schoolId, onClassAdded }) => {
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) {
      setError('Please select a school first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/manage-organizations/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId,
          name,
        } as Omit<Class, 'id' | 'createdAt' | 'updatedAt'>),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add class');
      }

      const data = await response.json();
      setSuccess(`Class '${data.class.name}' added successfully!`);
      setName('');
      onClassAdded(); // Notify parent component to refresh list
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New Class</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="className" className="block text-sm font-medium text-gray-700">Class Name</label>
          <input
            type="text"
            id="className"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            disabled={!schoolId} // Disable if no school is selected
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading || !schoolId}
        >
          {loading ? 'Adding Class...' : 'Add Class'}
        </button>
      </form>
    </div>
  );
};

export default ClassForm;
