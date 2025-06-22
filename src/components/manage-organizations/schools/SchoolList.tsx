// src/components/manage-organizations/schools/SchoolList.tsx

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { School } from '../../../types/manage-organizations';

interface SchoolListProps {
  refreshTrigger: number; // A prop to trigger data refresh
  onSelectSchool: (schoolId: string | null) => void; // Callback for selecting a school
  selectedSchoolId: string | null; // Currently selected school ID from parent
}

/**
 * Feature ID: MO-005
 * Feature Name: Frontend Component - School List (Enhanced with Selection)
 * What it does: Displays a list of schools retrieved from the API and allows selection of a school.
 * Description: Fetches all schools, presents them in a table, and highlights the currently selected school. Clicking a school triggers the onSelectSchool callback.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/schools)
 * Module to be implemented: (None - core enhancement)
 */
const SchoolList: React.FC<SchoolListProps> = ({ refreshTrigger, onSelectSchool, selectedSchoolId }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/manage-organizations/schools');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch schools');
      }
      const data = await response.json();
      setSchools(data.schools);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching schools.');
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools, refreshTrigger]); // Re-fetch when refreshTrigger changes

  if (loading) {
    return <div className="text-center py-4">Loading schools...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Existing Schools</h2>
      {schools.length === 0 ? (
        <p className="text-gray-600">No schools added yet. Add a new school using the form above.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Phone</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schools.map((school) => (
                <tr
                  key={school.id}
                  className={`${
                    selectedSchoolId === school.id ? 'bg-blue-50' : ''
                  } hover:bg-gray-50 cursor-pointer`}
                  onClick={() => onSelectSchool(school.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{school.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.contactEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.contactPhone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button> */}
                    <span className="text-gray-400">Select</span>
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

export default SchoolList;
