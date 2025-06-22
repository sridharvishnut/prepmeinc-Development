// src/components/manage-organizations/students/StudentList.tsx

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Student } from '../../../types/manage-organizations';

interface StudentListProps {
  schoolId: string | null;
  classId: string | null;
  sectionId: string | null;
  refreshTrigger: number;
}

/**
 * Feature ID: MO-018
 * Feature Name: Frontend Component - Student List
 * What it does: Displays a list of students based on selected school, class, and section.
 * Description: Fetches students from the API using provided filters (schoolId, classId, sectionId) and presents them in a table.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/students)
 * Module to be implemented: Manage-Organizations (Integration into Students tab, Edit/Delete functionality, Bulk Upload UI)
 */
const StudentList: React.FC<StudentListProps> = ({
  schoolId,
  classId,
  sectionId,
  refreshTrigger,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    if (!schoolId || !classId || !sectionId) {
      setStudents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (schoolId) queryParams.append('schoolId', schoolId);
      if (classId) queryParams.append('classId', classId);
      if (sectionId) queryParams.append('sectionId', sectionId);

      const response = await fetch(`/api/manage-organizations/students?${
        queryParams.toString()
      }`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch students');
      }
      const data = await response.json();
      setStudents(data.students);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching students.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [schoolId, classId, sectionId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents, refreshTrigger]); // Re-fetch when filters or refreshTrigger changes

  if (!schoolId || !classId || !sectionId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-6 text-gray-600">
        Please select a School, Class, and Section to view students.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-4">Loading students...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Students in Selected Section</h2>
      {students.length === 0 ? (
        <p className="text-gray-600">No students added yet for this section.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.admissionNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rollNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.gender}</td>
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

export default StudentList;
