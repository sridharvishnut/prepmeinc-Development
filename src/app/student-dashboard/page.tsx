// src/app/student-dashboard/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import StudentInfo from '@/components/student-dashboard/StudentInfo';
import SubjectMaterialBrowser from '@/components/student-dashboard/SubjectMaterialBrowser';
import StudentExamResults from '@/components/student-dashboard/StudentExamResults';
import { isFeatureEnabledForSchool } from '@/lib/featureManagementService';
import { Student } from '@/types/manage-organizations';

// Placeholder for real authentication context
// In a real app, you'd get the current user's ID and their associated school/student data securely.
const MOCK_STUDENT_ID = "student123"; // Replace with dynamic ID from auth

/**
 * Feature ID: MO-057-FE
 * Feature Name: Student Dashboard Page - Enhanced with Exam Results
 * What it does: Displays essential student information, allows browsing of subject materials, conditionally enables custom test features, and shows the student's personal exam results.
 * Description: This page dynamically fetches student-specific data (including their class and section), checks feature flag status for personalized learning tools, and integrates components to provide a comprehensive learning hub for students.
 * Current Module Implemented: src/app/student-dashboard
 * Module to be implemented: Full authentication integration, actual test taking UI, AI integration for tests.
 */
const StudentDashboardPage: React.FC = () => {
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [isCustomTestFeatureEnabled, setIsCustomTestFeatureEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentAndFeatures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Student Details (to get schoolId, classId, sectionId)
      const studentRes = await fetch(`/api/manage-organizations/students?id=${MOCK_STUDENT_ID}`);
      if (!studentRes.ok) {
        const errorData = await studentRes.json();
        throw new Error(errorData.message || 'Failed to fetch student details');
      }
      const data = await studentRes.json();
      const fetchedStudent: Student = data.student;
      setStudentData(fetchedStudent);

      // 2. Check Feature Flag for the student's school
      if (fetchedStudent?.schoolId) {
        const enabled = await isFeatureEnabledForSchool('student_content_access', fetchedStudent.schoolId);
        setIsCustomTestFeatureEnabled(enabled);
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while loading your dashboard.');
      setStudentData(null);
      setIsCustomTestFeatureEnabled(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentAndFeatures();
  }, [fetchStudentAndFeatures]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading your personalized dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <p className="text-lg text-red-600">Error: {error}</p>
        <p className="text-sm text-gray-500 mt-2">Please try refreshing the page or contact support.</p>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <p className="text-lg text-gray-600">Student profile not found or accessible.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Learning Dashboard</h1>

      <div className="space-y-8">
        <StudentInfo
          studentId={studentData.id}
          schoolId={studentData.schoolId}
        />
        
        <SubjectMaterialBrowser
          studentId={studentData.id}
          schoolId={studentData.schoolId}
          isCustomTestFeatureEnabled={isCustomTestFeatureEnabled}
        />

        <StudentExamResults
          studentId={studentData.id}
          schoolId={studentData.schoolId}
          classId={studentData.classId}
          sectionId={studentData.sectionId}
        />
      </div>
    </div>
  );
};

export default StudentDashboardPage;
