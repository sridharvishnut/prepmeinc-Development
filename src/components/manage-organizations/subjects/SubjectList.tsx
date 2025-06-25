// src/components/manage-organizations/subjects/SubjectList.tsx

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Subject } from '../../../types/manage-organizations';

interface SubjectListProps {
  schoolId: string | null;
  classId?: string | null; // Added classId as optional
  refreshTrigger: number; // Keep as required based on current usage pattern in page.tsx if it's used as a direct refresh trigger.
  onSelectSubject: (subjectId: string | null) => void;
  selectedSubjectId: string | null;
  showSelectAllOption?: boolean; // Added showSelectAllOption
}

/**
 * Feature ID: MO-025
 * Feature Name: Frontend Component - Subject List
 * What it does: Displays a list of subjects for a selected school and allows selection of a subject.
 * Description: Fetches subjects based on the provided schoolId and presents them. It also provides a mechanism to select a subject, which will then drive the display of materials for that subject.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/subjects)
 * Module to be implemented: Manage-Organizations (Integration into Subjects & Materials tab, Edit/Delete functionality)
 */
const SubjectList: React.FC<SubjectListProps> = ({
  schoolId,
  classId,
  refreshTrigger,
  onSelectSubject,
  selectedSubjectId,
  showSelectAllOption,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    if (!schoolId) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let url = `/api/manage-organizations/subjects?schoolId=${schoolId}`;
      if (classId) {
        url += `&classId=${classId}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch subjects');
      }
      const data = await response.json();
      setSubjects(data.subjects);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching subjects.');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [schoolId, classId]); // Added classId to dependencies

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects, refreshTrigger]); // Re-fetch when schoolId, classId or refreshTrigger changes

  if (!schoolId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-6 text-gray-600">
        Please select a school to view subjects.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-4">Loading subjects...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Subjects</h2>
      {subjects.length === 0 ? (
        <p className="text-gray-600">No subjects added yet for this school.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {showSelectAllOption && (
                <tr
                  className={`${
                    selectedSubjectId === null ? 'bg-blue-50' : ''
                  } hover:bg-gray-50 cursor-pointer`}
                  onClick={() => onSelectSubject(null)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={3}>All Subjects</td>
                </tr>
              )}
              {subjects.map((subject) => (
                <tr
                  key={subject.id}
                  className={`${
                    selectedSubjectId === subject.id ? 'bg-blue-50' : ''
                  } hover:bg-gray-50 cursor-pointer`}
                  onClick={() => onSelectSubject(subject.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name} {subject.isCustom && '(Custom)'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.description || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Add edit/delete buttons here later */}
                    <span className="text-gray-400">Select to manage materials</span>
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

export default SubjectList;
