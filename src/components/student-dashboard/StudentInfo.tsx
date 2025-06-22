// src/components/student-dashboard/StudentInfo.tsx

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Student, School, Class, Section } from '../../types/manage-organizations';

interface StudentInfoProps {
  studentId: string;
  schoolId: string;
}

/**
 * Feature ID: MO-054-FE
 * Feature Name: Frontend Component - Student Information Display
 * What it does: Displays essential information about the currently logged-in student.
 * Description: Fetches student, their associated class, section, and school details using their IDs and presents them in a user-friendly format on the student dashboard.
 * Current Module Implemented: src/components/student-dashboard
 * Module to be implemented: (None - core component)
 */
const StudentInfo: React.FC<StudentInfoProps> = ({
  studentId,
  schoolId,
}) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [classInfo, setClassInfo] = useState<Class | null>(null);
  const [sectionInfo, setSectionInfo] = useState<Section | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Student Details
      const studentRes = await fetch(`/api/manage-organizations/students?id=${studentId}`);
      if (!studentRes.ok) throw new Error('Failed to fetch student details');
      const studentData = await studentRes.json();
      setStudent(studentData.student);

      if (studentData.student) {
        // Fetch School Details
        const schoolRes = await fetch(`/api/manage-organizations/schools?id=${studentData.student.schoolId}`);
        if (schoolRes.ok) {
          const schoolData = await schoolRes.json();
          setSchool(schoolData.school);
        }

        // Fetch Class Details
        const classRes = await fetch(`/api/manage-organizations/classes?id=${studentData.student.classId}`);
        if (classRes.ok) {
          const classData = await classRes.json();
          setClassInfo(classData.class);
        }

        // Fetch Section Details
        const sectionRes = await fetch(`/api/manage-organizations/sections?id=${studentData.student.sectionId}`);
        if (sectionRes.ok) {
          const sectionData = await sectionRes.json();
          setSectionInfo(sectionData.section);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching student info.');
    } finally {
      setLoading(false);
    }
  }, [studentId, schoolId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="bg-white p-6 rounded-lg shadow">Loading student information...</div>;
  }

  if (error) {
    return <div className="bg-white p-6 rounded-lg shadow text-red-500">Error: {error}</div>;
  }

  if (!student) {
    return <div className="bg-white p-6 rounded-lg shadow text-gray-600">Student information not available.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Welcome, {student.firstName} {student.lastName}!</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
        <p><strong>School:</strong> {school?.name || 'N/A'}</p>
        <p><strong>Class:</strong> {classInfo?.name || 'N/A'}</p>
        <p><strong>Section:</strong> {sectionInfo?.name || 'N/A'}</p>
        <p><strong>Roll Number:</strong> {student.rollNumber}</p>
        <p><strong>Admission Number:</strong> {student.admissionNumber}</p>
        <p><strong>Parent:</strong> {student.parentName} ({student.parentContact})</p>
      </div>
    </div>
  );
};

export default StudentInfo;
