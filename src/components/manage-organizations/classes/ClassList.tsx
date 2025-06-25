// src/components/manage-organizations/classes/ClassList.tsx

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Class } from '../../../types/manage-organizations';

interface ClassListProps {
  schoolId: string | null;
  refreshTrigger: number;
  onSelectClass: (classId: string | null) => void;
  selectedClassId: string | null;
  showSelectAllOption?: boolean; 
}

/**
 * Feature ID: MO-011
 * Feature Name: Frontend Component - Class List
 * What it does: Displays a list of classes for a selected school and allows selection of a class.
 * Description: Fetches classes based on the provided schoolId and presents them. It also provides a mechanism to select a class, which will then drive the display of sections for that class.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/classes)
 * Module to be implemented: Manage-Organizations (Integration into Classes & Sections tab, Edit/Delete functionality)
 */
const ClassList: React.FC<ClassListProps> = ({ schoolId, refreshTrigger, onSelectClass, selectedClassId, showSelectAllOption }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    if (!schoolId) {
      setClasses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/manage-organizations/classes?schoolId=${schoolId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch classes');
      }
      const data = await response.json();
      setClasses(data.classes);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching classes.');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses, refreshTrigger]); // Re-fetch when schoolId or refreshTrigger changes

  if (!schoolId) {
    return <div className="bg-white p-6 rounded-lg shadow mb-6 text-gray-600">Please select a school to view classes.</div>;
  }

  if (loading) {
    return <div className="text-center py-4">Loading classes...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Classes</h2>
      {classes.length === 0 ? (
        <p className="text-gray-600">No classes added yet for this school.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {showSelectAllOption && (
                <tr
                  className={`${
                    selectedClassId === null ? 'bg-blue-50' : ''
                  } hover:bg-gray-50 cursor-pointer`}
                  onClick={() => onSelectClass(null)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={2}>All Classes</td>
                </tr>
              )}
              {classes.map((classItem) => (
                <tr
                  key={classItem.id}
                  className={`${
                    selectedClassId === classItem.id ? 'bg-blue-50' : ''
                  } hover:bg-gray-50 cursor-pointer`}
                  onClick={() => onSelectClass(classItem.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{classItem.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Add edit/delete buttons here later */}
                    <span className="text-gray-400">Select to manage sections</span>
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

export default ClassList;
