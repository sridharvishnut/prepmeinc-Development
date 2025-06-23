// src/components/manage-organizations/classes/SectionList.tsx

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Section } from '../../../types/manage-organizations';

interface SectionListProps {
  classId: string | null;
  refreshTrigger: number;
  onSelectSection: (sectionId: string) => void; // New prop for selecting a section
  selectedSectionId: string | null; // New prop to highlight the selected section
}

/**
 * Feature ID: MO-012
 * Feature Name: Frontend Component - Section List
 * What it does: Displays a list of sections for a selected class.
 * Description: Fetches sections based on the provided classId and presents them in a table.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/classes)
 * Module to be implemented: Manage-Organizations (Integration into Classes & Sections tab, Edit/Delete functionality)
 */
const SectionList: React.FC<SectionListProps> = ({
  classId,
  refreshTrigger,
  onSelectSection,
  selectedSectionId,
}) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    if (!classId) {
      setSections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/manage-organizations/sections?classId=${classId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch sections');
      }
      const data = await response.json();
      setSections(data.sections);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching sections.');
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections, refreshTrigger]); // Re-fetch when classId or refreshTrigger changes

  if (!classId) {
    return <div className="bg-white p-6 rounded-lg shadow mb-6 text-gray-600">Select a class to view sections.</div>;
  }

  if (loading) {
    return <div className="text-center py-4">Loading sections...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Sections for Selected Class</h2>
      {sections.length === 0 ? (
        <p className="text-gray-600">No sections added yet for this class.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section Name</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sections.map((section) => (
                <tr
                  key={section.id}
                  onClick={() => onSelectSection(section.id)}
                  className={`cursor-pointer hover:bg-gray-100 ${selectedSectionId === section.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{section.name}</td>
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

export default SectionList;
