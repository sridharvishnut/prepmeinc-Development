// src/components/manage-organizations/exam-results/ExamResultFilters.tsx

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { School, Class, Section, Subject, Student } from '../../../types/manage-organizations';

interface ExamResultFiltersProps {
  onFilterChange: (filters: {
    schoolId: string | null;
    classId: string | null;
    sectionId: string | null;
    subjectId: string | null;
    studentId: string | null;
  }) => void;
}

/**
 * Feature ID: MO-040
 * Feature Name: Frontend Component - Exam Result Filters
 * What it does: Provides UI for selecting filters (School, Class, Section, Subject, Student) to view exam results.
 * Description: Allows administrators to narrow down the scope of exam results displayed by selecting specific organizational units and subjects. It fetches available options for these filters and manages the selected filter states.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/exam-results)
 * Module to be implemented: Manage-Organizations (Integration into Exam Results tab, ExamResultsDashboard component)
 */
const ExamResultFilters: React.FC<ExamResultFiltersProps> = ({ onFilterChange }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Fetch Schools
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch('/api/manage-organizations/schools');
        if (response.ok) {
          const data = await response.json();
          setSchools(data.schools);
        }
      } catch (error) {
        console.error('Failed to fetch schools for filter:', error);
      }
    };
    fetchSchools();
  }, []);

  // Fetch Classes when selectedSchoolId changes
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
          console.error('Failed to fetch classes for filter:', error);
        }
      } else {
        setClasses([]);
      }
      setSelectedClassId(null); // Reset class selection on school change
      setSelectedSectionId(null); // Reset section selection
      setSelectedStudentId(null); // Reset student selection
    };
    fetchClasses();
  }, [selectedSchoolId]);

  // Fetch Sections when selectedClassId changes
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
          console.error('Failed to fetch sections for filter:', error);
        }
      } else {
        setSections([]);
      }
      setSelectedSectionId(null); // Reset section selection on class change
      setSelectedStudentId(null); // Reset student selection
    };
    fetchSections();
  }, [selectedClassId]);

  // Fetch Subjects when selectedSchoolId changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (selectedSchoolId) {
        try {
          const response = await fetch(`/api/manage-organizations/subjects?schoolId=${selectedSchoolId}`);
          if (response.ok) {
            const data = await response.json();
            setSubjects(data.subjects);
          }
        } catch (error) {
          console.error('Failed to fetch subjects for filter:', error);
        }
      } else {
        setSubjects([]);
      }
      setSelectedSubjectId(null); // Reset subject selection on school change
    };
    fetchSubjects();
  }, [selectedSchoolId]);

  // Fetch Students when selectedSchoolId, selectedClassId, selectedSectionId changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedSchoolId && selectedClassId && selectedSectionId) {
        try {
          const queryParams = new URLSearchParams();
          queryParams.append('schoolId', selectedSchoolId);
          queryParams.append('classId', selectedClassId);
          queryParams.append('sectionId', selectedSectionId);
          const response = await fetch(`/api/manage-organizations/students?${
            queryParams.toString()
          }`);
          if (response.ok) {
            const data = await response.json();
            setStudents(data.students);
          }
        } catch (error) {
          console.error('Failed to fetch students for filter:', error);
        }
      } else {
        setStudents([]);
      }
      setSelectedStudentId(null); // Reset student selection on class/section change
    };
    fetchStudents();
  }, [selectedSchoolId, selectedClassId, selectedSectionId]);

  // Trigger filter change callback whenever any selection changes
  useEffect(() => {
    onFilterChange({
      schoolId: selectedSchoolId,
      classId: selectedClassId,
      sectionId: selectedSectionId,
      subjectId: selectedSubjectId,
      studentId: selectedStudentId,
    });
  }, [selectedSchoolId, selectedClassId, selectedSectionId, selectedSubjectId, selectedStudentId, onFilterChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Filter Exam Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div>
          <label htmlFor="filterSchool" className="block text-sm font-medium text-gray-700">School:</label>
          <select
            id="filterSchool"
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
          <label htmlFor="filterClass" className="block text-sm font-medium text-gray-700">Class:</label>
          <select
            id="filterClass"
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
          <label htmlFor="filterSection" className="block text-sm font-medium text-gray-700">Section:</label>
          <select
            id="filterSection"
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
          <label htmlFor="filterSubject" className="block text-sm font-medium text-gray-700">Subject:</label>
          <select
            id="filterSubject"
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

        <div>
          <label htmlFor="filterStudent" className="block text-sm font-medium text-gray-700">Student:</label>
          <select
            id="filterStudent"
            value={selectedStudentId || ''}
            onChange={(e) => setSelectedStudentId(e.target.value || null)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={!selectedSectionId}
          >
            <option value="">Select Student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>{student.firstName} {student.lastName} ({student.rollNumber})</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ExamResultFilters;
