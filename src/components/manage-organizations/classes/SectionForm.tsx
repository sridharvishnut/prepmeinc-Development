// src/components/manage-organizations/classes/SectionForm.tsx

"use client";

import React, { useState } from 'react';
import { Section } from '../../../types/manage-organizations';

interface SectionFormProps {
  schoolId: string | null;
  classId: string | null;
  onSectionAdded: () => void;
}

/**
 * Feature ID: MO-010
 * Feature Name: Frontend Component - Section Form
 * What it does: Provides a form for adding new section records for a selected class within a school.
 * Description: Allows administrators to input details for a new section and submit them via the API, associated with a specific class and school.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/classes)
 * Module to be implemented: Manage-Organizations (Integration into Classes & Sections tab)
 */
const SectionForm: React.FC<SectionFormProps> = ({ schoolId, classId, onSectionAdded }) => {
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId || !classId) {
      setError('Please select a school and a class first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/manage-organizations/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId,
          classId,
          name,
        } as Omit<Section, 'id' | 'createdAt' | 'updatedAt'>),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add section');
      }

      const data = await response.json();
      setSuccess(`Section '${data.section.name}' added successfully!`);
      setName('');
      onSectionAdded(); // Notify parent component to refresh list
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New Section</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="sectionName" className="block text-sm font-medium text-gray-700">Section Name</label>
          <input
            type="text"
            id="sectionName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            disabled={!schoolId || !classId} // Disable if no school or class is selected
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading || !schoolId || !classId}
        >
          {loading ? 'Adding Section...' : 'Add Section'}
        </button>
      </form>
    </div>
  );
};

export default SectionForm;
