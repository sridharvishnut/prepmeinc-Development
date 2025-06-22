"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { School, Class, Section, Subject, ExamResult, Student } from '../../../types/manage-organizations';

interface TopRankerDashboardProps {
  // For simplicity, we'll manage school, class, section selection within this component for now
  // In a real app, these might come from a parent component or global state.
}

/**
 * Feature ID: MO-046
 * Feature Name: Frontend Component - Elite Student Top Ranker Dashboard
 * What it does: Displays top-performing students (overall and subject-wise) for selected school, class, and section.
 * Description: Fetches and displays lists of top 10 students. Users can select school, class, section, and subject to filter the results. It includes overall ranks and individual subject marks.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/exam-results)
 * Module to be implemented: Manage-Organizations (Integration into student view/school admin view)
 */
const TopRankerDashboard: React.FC<TopRankerDashboardProps> = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]); // To map student IDs to names

  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const [overallTopStudents, setOverallTopStudents] = useState<any[]>([]); // Using 'any' due to mixed type from backend service
  const [subjectWiseTopStudents, setSubjectWiseTopStudents] = useState<ExamResult[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to get student name
  const getStudentName = useCallback((studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : `Student ID: ${studentId}`;
  }, [students]);

  const getStudentRollNumber = useCallback((studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.rollNumber : 'N/A';
  }, [students]);

  // Fetch Schools, Classes, Sections, Subjects and Students
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [schoolsRes, allStudentsRes] = await Promise.all([
          fetch('/api/manage-organizations/schools'),
          fetch('/api/manage-organizations/students') // Fetch all students to map IDs to names
        ]);

        if (schoolsRes.ok) {
          const data = await schoolsRes.json();
          setSchools(data.schools);
        }

        if (allStudentsRes.ok) {
          const data = await allStudentsRes.json();
          setStudents(data.students);
        }

      } catch (err) {
        console.error('Failed to fetch initial data for dashboard:', err);
        setError('Failed to load initial data.');
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      if (selectedSchoolId) {
        try {
          const response = await fetch(`/api/manage-organizations/classes?schoolId=${selectedSchoolId}`);
          if (response.ok) {
            const data = await response.json();
            setClasses(data.classes);
          }
        } catch (error) {
          console.error('Failed to fetch classes for dashboard:', error);
        }
      } else {
        setClasses([]);
      }
      setSelectedClassId(null);
      setSelectedSectionId(null);
      setSelectedSubjectId(null);
    };
    fetchClasses();

    const fetchSubjects = async () => {
      if (selectedSchoolId) {
        try {
          const response = await fetch(`/api/manage-organizations/subjects?schoolId=${selectedSchoolId}`);
          if (response.ok) {
            const data = await response.json();
            setSubjects(data.subjects);
          }
        } catch (error) {
          console.error('Failed to fetch subjects for dashboard:', error);
        }
      } else {
        setSubjects([]);
      }
    };
    fetchSubjects();

  }, [selectedSchoolId]);

  useEffect(() => {
    const fetchSections = async () => {
      if (selectedClassId) {
        try {
          const response = await fetch(`/api/manage-organizations/sections?classId=${selectedClassId}`);
          if (response.ok) {
            const data = await response.json();
            setSections(data.sections);
          }
        } catch (error) {
          console.error('Failed to fetch sections for dashboard:', error);
        }
      } else {
        setSections([]);
      }
      setSelectedSectionId(null);
    };
    fetchSections();
  }, [selectedClassId]);

  // Fetch Overall Top Students
  const fetchOverallTopStudents = useCallback(async () => {
    if (selectedSchoolId && selectedClassId && selectedSectionId) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/manage-organizations/top-rankers/overall?schoolId=${selectedSchoolId}&classId=${selectedClassId}&sectionId=${selectedSectionId}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch overall top students');
        }
        const data = await response.json();
        setOverallTopStudents(data.topStudents);
      } catch (err: any) {
        setError(err.message || 'Error fetching overall top students.');
        setOverallTopStudents([]);
      } finally {
        setLoading(false);
      }
    } else {
      setOverallTopStudents([]);
      setLoading(false);
    }
  }, [selectedSchoolId, selectedClassId, selectedSectionId]);

  // Fetch Subject-Wise Top Students
  const fetchSubjectWiseTopStudents = useCallback(async () => {
    if (selectedSchoolId && selectedClassId && selectedSectionId && selectedSubjectId) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/manage-organizations/top-rankers/subject-wise?schoolId=${selectedSchoolId}&classId=${selectedClassId}&sectionId=${selectedSectionId}&subjectId=${selectedSubjectId}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch subject-wise top students');
        }
        const data = await response.json();
        setSubjectWiseTopStudents(data.topStudents);
      } catch (err: any) {
        setError(err.message || 'Error fetching subject-wise top students.');
        setSubjectWiseTopStudents([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSubjectWiseTopStudents([]);
      setLoading(false);
    }
  }, [selectedSchoolId, selectedClassId, selectedSectionId, selectedSubjectId]);

  useEffect(() => {
    fetchOverallTopStudents();
    fetchSubjectWiseTopStudents();
  }, [fetchOverallTopStudents, fetchSubjectWiseTopStudents]);

  const isFilterReady = selectedSchoolId && selectedClassId && selectedSectionId;

  if (loading && schools.length === 0) {
    return <div className="text-center py-4">Loading top rankers dashboard...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Elite Student Top Ranker Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label htmlFor="schoolFilter" className="block text-sm font-medium text-gray-700">School:</label>
          <select
            id="schoolFilter"
            value={selectedSchoolId || ''}
            onChange={(e) => setSelectedSchoolId(e.target.value || null)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select School</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>{school.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700">Class:</label>
          <select
            id="classFilter"
            value={selectedClassId || ''}
            onChange={(e) => setSelectedClassId(e.target.value || null)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={!selectedSchoolId}
          >
            <option value="">Select Class</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sectionFilter" className="block text-sm font-medium text-gray-700">Section:</label>
          <select
            id="sectionFilter"
            value={selectedSectionId || ''}
            onChange={(e) => setSelectedSectionId(e.target.value || null)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={!selectedClassId}
          >
            <option value="">Select Section</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>{section.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subjectFilter" className="block text-sm font-medium text-gray-700">Subject (for subject-wise ranks):</label>
          <select
            id="subjectFilter"
            value={selectedSubjectId || ''}
            onChange={(e) => setSelectedSubjectId(e.target.value || null)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={!selectedSchoolId}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!isFilterReady && (
        <p className="text-gray-600 mb-6">Please select a School, Class, and Section to view top rankers.</p>
      )}

      {isFilterReady && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Overall Top 10 Students</h3>
            {overallTopStudents.length === 0 ? (
              <p className="text-gray-600">No overall top students found for the selected criteria.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. %</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {overallTopStudents.map((student) => (
                      <tr key={student.studentId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.rank}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getStudentName(student.studentId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStudentRollNumber(student.studentId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.averagePercentage.toFixed(2)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.totalScore} / {student.totalMaxMarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Subject-Wise Top 10 Students {selectedSubjectId && subjects.find(s => s.id === selectedSubjectId)?.name && `(${subjects.find(s => s.id === selectedSubjectId)?.name})`}</h3>
            {!selectedSubjectId ? (
              <p className="text-gray-600">Select a subject to view subject-wise top students.</p>
            ) : subjectWiseTopStudents.length === 0 ? (
              <p className="text-gray-600">No subject-wise top students found for the selected criteria.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subjectWiseTopStudents.map((result) => (
                      <tr key={result.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.rankInClass || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getStudentName(result.studentId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStudentRollNumber(result.studentId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.score} / {result.maxMarks}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.percentage.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopRankerDashboard;
