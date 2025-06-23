// src/components/manage-organizations/subjects/SubjectForm.tsx

"use client";

import React, { useState } from 'react';
import { Subject } from '../../../types/manage-organizations';

interface SubjectFormProps {
  schoolId: string | null; // The currently selected school
  classId: string | null; // The currently selected class (NEWLY ADDED)
  onSubjectAdded: () => void;
}

/**
 * Feature ID: MO-024
 * Feature Name: Frontend Component - Subject Form
 * What it does: Provides a form for adding new subject records for a selected school.
 * Description: Allows administrators to input details for a new subject (name, description, and if it's a custom field) and submit them via the API, associated with a specific school.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/subjects)
 * Module to be implemented: Manage-Organizations (Integration into Subjects & Materials tab)
 */
const SubjectForm: React.FC<SubjectFormProps> = ({ schoolId, classId, onSubjectAdded }) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(true); // Default to custom
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId || !classId) { // Added classId to validation
      setError('Please select a school and a class first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/manage-organizations/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId,
          classId, // Pass classId to the API
          name,
          description,
          isCustom,
        } as Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add subject');
      }

      const data = await response.json();
      setSuccess(`Subject '${data.subject.name}' added successfully!`);
      setName('');
      setDescription('');
      setIsCustom(true);
      onSubjectAdded(); // Notify parent component to refresh list
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New Subject</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700">Subject Name</label>
          <input
            type="text"
            id="subjectName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            disabled={!schoolId || !classId} // Disabled if no school or class selected
          />
        </div>
        <div>
          <label htmlFor="subjectDescription" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
          <textarea
            id="subjectDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={!schoolId || !classId} // Disabled if no school or class selected
          />
        </div>
        <div className="flex items-center">
          <input
            id="isCustom"
            name="isCustom"
            type="checkbox"
            checked={isCustom}
            onChange={(e) => setIsCustom(e.target.checked)}
            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            disabled={!schoolId || !classId} // Disabled if no school or class selected
          />
          <label htmlFor="isCustom" className="ml-2 block text-sm text-gray-900">Custom Subject (Can be added by School Admin)</label>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading || !schoolId || !classId} // Disabled if loading or no school/class selected
        >
          {loading ? 'Adding Subject...' : 'Add Subject'}
        </button>
      </form>
    </div>
  );
};

export default SubjectForm;
