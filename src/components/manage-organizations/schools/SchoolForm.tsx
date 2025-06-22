// src/components/manage-organizations/schools/SchoolForm.tsx

"use client";

import React, { useState } from 'react';
import { School } from '../../../types/manage-organizations';

interface SchoolFormProps {
  onSchoolAdded: () => void;
  // Optional: for editing
  // initialData?: School;
  // onSchoolUpdated?: () => void;
}

/**
 * Feature ID: MO-004
 * Feature Name: Frontend Component - School Form
 * What it does: Provides a form for adding new school records.
 * Description: Allows administrators to input details for a new school and submit them via the API.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/schools)
 * Module to be implemented: Manage-Organizations (Integration into page.tsx, Edit functionality)
 */
const SchoolForm: React.FC<SchoolFormProps> = ({ onSchoolAdded }) => {
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/manage-organizations/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          address,
          contactEmail,
          contactPhone,
        } as Omit<School, 'id' | 'createdAt' | 'updatedAt'>),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add school');
      }

      const data = await response.json();
      setSuccess(`School '${data.school.name}' added successfully!`);
      setName('');
      setAddress('');
      setContactEmail('');
      setContactPhone('');
      onSchoolAdded(); // Notify parent component to refresh list
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New School</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">School Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Contact Email</label>
          <input
            type="email"
            id="contactEmail"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">Contact Phone</label>
          <input
            type="tel"
            id="contactPhone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Adding School...' : 'Add School'}
        </button>
      </form>
    </div>
  );
};

export default SchoolForm;
