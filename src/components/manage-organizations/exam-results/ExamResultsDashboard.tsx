// src/components/manage-organizations/exam-results/ExamResultsDashboard.tsx

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { ExamResult } from '../../../types/manage-organizations';

interface ExamResultsDashboardProps {
  filters: {
    schoolId: string | null;
    classId: string | null;
    sectionId: string | null;
    subjectId: string | null;
    studentId: string | null;
  };
  refreshTrigger: number;
}

/**
 * Feature ID: MO-041
 * Feature Name: Frontend Component - Exam Results Dashboard
 * What it does: Displays a dashboard of exam results based on selected filters.
 * Description: Fetches exam results from the API using the provided filters and presents them in a table, including student details, subject, score, and rank. Includes a button to trigger rank calculation.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/exam-results)
 * Module to be implemented: Manage-Organizations (Integration into Exam Results tab, Advanced analytics/reporting)
 */
const ExamResultsDashboard: React.FC<ExamResultsDashboardProps> = ({
  filters,
  refreshTrigger,
}) => {
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rankCalculationLoading, setRankCalculationLoading] = useState<boolean>(false);
  const [rankCalculationError, setRankCalculationError] = useState<string | null>(null);
  const [rankCalculationSuccess, setRankCalculationSuccess] = useState<string | null>(null);

  const fetchExamResults = useCallback(async () => {
    if (!filters.schoolId) {
      setExamResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters.schoolId) queryParams.append('schoolId', filters.schoolId);
      if (filters.classId) queryParams.append('classId', filters.classId);
      if (filters.sectionId) queryParams.append('sectionId', filters.sectionId);
      if (filters.subjectId) queryParams.append('subjectId', filters.subjectId);
      if (filters.studentId) queryParams.append('studentId', filters.studentId);

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
  }, [filters]);

  useEffect(() => {
    fetchExamResults();
  }, [fetchExamResults, refreshTrigger]);

  const handleCalculateRanks = async () => {
    if (!filters.schoolId || !filters.classId || !filters.sectionId || !filters.subjectId) {
      setRankCalculationError('Please select a School, Class, Section, and Subject to calculate ranks.');
      return;
    }

    setRankCalculationLoading(true);
    setRankCalculationError(null);
    setRankCalculationSuccess(null);

    try {
      const response = await fetch('/api/manage-organizations/exam-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Note: The POST for rank calculation will be a separate route or distinct payload
        // For now, assuming a specific endpoint or logic in the main /exam-results POST
        // A better approach would be /api/manage-organizations/exam-results/calculate-ranks
        body: JSON.stringify({
          schoolId: filters.schoolId,
          classId: filters.classId,
          sectionId: filters.sectionId,
          subjectId: filters.subjectId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate ranks');
      }

      setRankCalculationSuccess('Ranks calculated and updated successfully!');
      fetchExamResults(); // Refresh results to show new ranks
    } catch (err: any) {
      setRankCalculationError(err.message || 'An unexpected error occurred during rank calculation.');
    } finally {
      setRankCalculationLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading exam results...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Exam Results Dashboard</h2>

      <div className="mb-4">
        <button
          onClick={handleCalculateRanks}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          disabled={rankCalculationLoading || !filters.schoolId || !filters.classId || !filters.sectionId || !filters.subjectId}
        >
          {rankCalculationLoading ? 'Calculating Ranks...' : 'Calculate Ranks for Selected Filter'}
        </button>
        {rankCalculationError && <p className="text-red-500 text-sm mt-2">{rankCalculationError}</p>}
        {rankCalculationSuccess && <p className="text-green-500 text-sm mt-2">{rankCalculationSuccess}</p>}
        {!filters.schoolId || !filters.classId || !filters.sectionId || !filters.subjectId && (
             <p className="text-gray-600 text-sm mt-2">Select a School, Class, Section, and Subject to enable rank calculation.</p>
        )}
      </div>

      {examResults.length === 0 ? (
        <p className="text-gray-600">No exam results found for the selected filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {examResults.map((result) => (
                <tr key={result.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{/* Fetch student name dynamically */}Student ID: {result.studentId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{/* Fetch class name dynamically */}Class ID: {result.classId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{/* Fetch section name dynamically */}Section ID: {result.sectionId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{/* Fetch subject name dynamically */}Subject ID: {result.subjectId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.score} / {result.maxMarks}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.percentage.toFixed(2)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.rankInClass || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Add edit/delete result, view attempt details buttons here later */}
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

export default ExamResultsDashboard;
