// src/components/student-dashboard/StudentExamResults.tsx

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ExamResult, Subject } from '../../../types/manage-organizations';

interface StudentExamResultsProps {
  studentId: string;
  schoolId: string;
  classId: string;
  sectionId: string;
}

/**
 * Feature ID: MO-056-FE
 * Feature Name: Student Dashboard - Personalized Exam Results
 * What it does: Displays a logged-in student's individual exam results across subjects.
 * Description: Fetches the ExamResult records for the specific studentId, schoolId, classId, and sectionId, and presents them, giving the student an overview of their performance, including scores, percentages, and ranks.
 * Current Module Implemented: src/components/student-dashboard
 * Module to be implemented: (None - core component)
 */
const StudentExamResults: React.FC<StudentExamResultsProps> = ({
  studentId,
  schoolId,
  classId,
  sectionId,
}) => {
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]); // To map subjectId to subject name
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await fetch(`/api/manage-organizations/subjects?schoolId=${schoolId}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects);
      }
    } catch (err) {
      console.error('Failed to fetch subjects for exam results:', err);
    }
  }, [schoolId]);

  const fetchExamResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('studentId', studentId);
      queryParams.append('schoolId', schoolId);
      queryParams.append('classId', classId);
      queryParams.append('sectionId', sectionId);

      const response = await fetch(`/api/manage-organizations/exam-results?${
        queryParams.toString()
      }`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch exam results');
      }
      const data = await response.json();
      setExamResults(data.examResults);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching exam results.');
      setExamResults([]);
    } finally {
      setLoading(false);
    }
  }, [studentId, schoolId, classId, sectionId]);

  useEffect(() => {
    fetchSubjects();
    fetchExamResults();
  }, [fetchSubjects, fetchExamResults]);

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown Subject';
  };

  if (loading) {
    return <div className="bg-white p-6 rounded-lg shadow">Loading your exam results...</div>;
  }

  if (error) {
    return <div className="bg-white p-6 rounded-lg shadow text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">My Exam Results</h2>
      {examResults.length === 0 ? (
        <p className="text-gray-600">No exam results available for you yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank (Class/Section)</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {examResults.map((result) => (
                <tr key={result.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getSubjectName(result.subjectId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.score} / {result.maxMarks}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.percentage.toFixed(2)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.rankInClass || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Add view test attempt details here later */}
                    <span className="text-gray-400">View Details (coming soon)</span>
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

export default StudentExamResults;
