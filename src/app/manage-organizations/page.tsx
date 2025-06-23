"use client";

import React, { useState } from 'react';
import SchoolForm from '../../../src/components/manage-organizations/schools/SchoolForm';
import SchoolList from '../../../src/components/manage-organizations/schools/SchoolList';
import ClassForm from '../../../src/components/manage-organizations/classes/ClassForm';
import ClassList from '../../../src/components/manage-organizations/classes/ClassList';
import SectionForm from '../../../src/components/manage-organizations/classes/SectionForm';
import SectionList from '../../../src/components/manage-organizations/classes/SectionList';
import StudentForm from '../../../src/components/manage-organizations/students/StudentForm';
import StudentList from '../../../src/components/manage-organizations/students/StudentList';
import SubjectForm from '../../../src/components/manage-organizations/subjects/SubjectForm';
import SubjectList from '../../../src/components/manage-organizations/subjects/SubjectList';
import SubjectMaterialForm from '../../../src/components/manage-organizations/subjects/SubjectMaterialForm';
import SubjectMaterialList from '../../../src/components/manage-organizations/subjects/SubjectMaterialList';
import UserForm from '../../../src/components/manage-organizations/users/UserForm';
import UserList from '../../../src/components/manage-organizations/users/UserList';
import ExamResultFilters from '../../../src/components/manage-organizations/exam-results/ExamResultFilters';
import ExamResultsDashboard from '../../../src/components/manage-organizations/exam-results/ExamResultsDashboard';
import TopRankerDashboard from '../../../src/components/manage-organizations/exam-results/TopRankerDashboard';

/**
 * Feature ID: MO-047
 * Feature Name: Manage Organizations Page - Top Rankers Dashboard Integration
 * What it does: Integrates the Elite Student Top Ranker Dashboard into the main Manage Organizations page.
 * Description: Adds a new tab for "Top Rankers" and conditionally renders the TopRankerDashboard component, which allows viewing of subject-wise and overall top students. This serves as an admin-facing view for now.
 * Current Module Implemented: Manage-Organizations (src/app/manage-organizations)
 * Module to be implemented: Student-facing dashboard integration, Feature Management for the "Choose from folders" feature.
 */
const ManageOrganizationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('schools');

  // Refresh triggers for different lists
  const [refreshSchoolList, setRefreshSchoolList] = useState(0);
  const [refreshClassList, setRefreshClassList] = useState(0);
  const [refreshSectionList, setRefreshSectionList] = useState(0);
  const [refreshStudentList, setRefreshStudentList] = useState(0);
  const [refreshSubjectList, setRefreshSubjectList] = useState(0);
  const [refreshSubjectMaterialList, setRefreshSubjectMaterialList] = useState(0);
  const [refreshUserList, setRefreshUserList] = useState(0);
  const [refreshExamResults, setRefreshExamResults] = useState(0);
  // No specific refresh trigger for TopRankerDashboard as it has its own internal state/fetching for now

  // State for selections across tabs (Schools & Classes/Sections tab)
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // State for selections specific to Students tab
  const [selectedStudentSchoolId, setSelectedStudentSchoolId] = useState<string | null>(null);
  const [selectedStudentClassId, setSelectedStudentClassId] = useState<string | null>(null);
  const [selectedStudentSectionId, setSelectedStudentSectionId] = useState<string | null>(null);

  // State for selections specific to Subjects & Materials tab
  const [selectedSubjectSchoolId, setSelectedSubjectSchoolId] = useState<string | null>(null);
  const [selectedSubjectClassId, setSelectedSubjectClassId] = useState<string | null>(null); // For associating material with a class
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // State for selections specific to User Management tab
  const [selectedUserSchoolId, setSelectedUserSchoolId] = useState<string | null>(null);

  // State for filters specific to Exam Results tab
  const [examResultFilters, setExamResultFilters] = useState({
    schoolId: null as string | null,
    classId: null as string | null,
    sectionId: null as string | null,
    subjectId: null as string | null,
    studentId: null as string | null,
  });

  // Handlers for refreshing lists
  const handleSchoolAdded = () => {
    setRefreshSchoolList((prev) => prev + 1);
    setSelectedSchoolId(null); // Clear selection when new school is added
    setSelectedClassId(null); // Clear class selection too
    setSelectedStudentSchoolId(null);
    setSelectedStudentClassId(null);
    setSelectedStudentSectionId(null);
    setSelectedSubjectSchoolId(null);
    setSelectedSubjectClassId(null);
    setSelectedSubjectId(null);
    setSelectedUserSchoolId(null);
    setExamResultFilters({ schoolId: null, classId: null, sectionId: null, subjectId: null, studentId: null });
  };

  const handleClassAdded = () => {
    setRefreshClassList((prev) => prev + 1);
    setSelectedClassId(null); // Clear selection when new class is added
    setSelectedStudentClassId(null);
    setSelectedStudentSectionId(null);
    setSelectedSubjectClassId(null);
    setSelectedSubjectId(null);
    setExamResultFilters((prev) => ({ ...prev, classId: null, sectionId: null, studentId: null }));
  };

  const handleSectionAdded = () => {
    setRefreshSectionList((prev) => prev + 1);
    setSelectedStudentSectionId(null);
    setExamResultFilters((prev) => ({ ...prev, sectionId: null, studentId: null }));
  };

  const handleStudentAdded = () => {
    setRefreshStudentList((prev) => prev + 1);
    setRefreshExamResults((prev) => prev + 1); // Refresh exam results potentially affected by new student
  };

  const handleSubjectAdded = () => {
    setRefreshSubjectList((prev) => prev + 1);
    setSelectedSubjectId(null);
    setRefreshExamResults((prev) => ({ ...prev, subjectId: null }));
  };

  const handleSubjectMaterialAdded = () => {
    setRefreshSubjectMaterialList((prev) => prev + 1);
  };

  const handleUserAdded = () => {
    setRefreshUserList((prev) => prev + 1);
  };

  // Handlers for selecting items in Schools & Classes/Sections tab
  const handleSelectSchool = (schoolId: string | null) => {
    setSelectedSchoolId(schoolId);
    setSelectedClassId(null); // Reset selected class when school changes
    setRefreshClassList((prev) => prev + 1); // Trigger class list refresh for new school
  };

  const handleSelectClass = (classId: string | null) => {
    setSelectedClassId(classId);
    setRefreshSectionList((prev) => prev + 1); // Trigger section list refresh for new class
  };

  // Handlers for selecting items in Students tab
  const handleSelectStudentSchool = (schoolId: string | null) => {
    setSelectedStudentSchoolId(schoolId);
    setSelectedStudentClassId(null); // Reset class selection when student-school changes
    setSelectedStudentSectionId(null); // Reset section selection
    setRefreshClassList((prev) => prev + 1); // Use shared class refresh for this selection context
  };

  const handleSelectStudentClass = (classId: string | null) => {
    setSelectedStudentClassId(classId);
    setSelectedStudentSectionId(null); // Reset section selection when student-class changes
    setRefreshSectionList((prev) => prev + 1); // Use shared section refresh
  };

  // New handler for selecting a section for student management
  const handleSelectStudentSection = (sectionId: string | null) => {
    setSelectedStudentSectionId(sectionId);
    setRefreshStudentList((prev) => prev + 1); // Trigger student list refresh
  };

  // Handlers for selecting items in Subjects & Materials tab
  const handleSelectSubjectSchool = (schoolId: string | null) => {
    setSelectedSubjectSchoolId(schoolId);
    setSelectedSubjectClassId(null); // Reset class selection when subject-school changes
    setSelectedSubjectId(null); // Reset subject selection
    setRefreshClassList((prev) => prev + 1); // Use shared class refresh for this selection context
  };

  const handleSelectSubjectClass = (classId: string | null) => {
    setSelectedSubjectClassId(classId);
    setSelectedSubjectId(null); // Reset subject selection
    setRefreshSubjectList((prev) => prev + 1); // Use shared subject refresh for this selection context
  };

  const handleSelectSubject = (subjectId: string | null) => {
    setSelectedSubjectId(subjectId);
    setRefreshSubjectMaterialList((prev) => prev + 1); // Trigger material list refresh
  };

  // Handlers for selecting items in User Management tab
  const handleSelectUserSchool = (schoolId: string | null) => {
    setSelectedUserSchoolId(schoolId);
    setRefreshUserList((prev) => prev + 1);
  };

  // Handler for Exam Result Filters change
  const handleExamResultFilterChange = (filters: typeof examResultFilters) => {
    setExamResultFilters(filters);
    setRefreshExamResults((prev) => prev + 1); // Trigger dashboard refresh
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Organizations</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => {
                setActiveTab('schools');
                // Reset all selections when switching to Schools tab
                setSelectedSchoolId(null);
                setSelectedClassId(null);
                setSelectedStudentSchoolId(null);
                setSelectedStudentClassId(null);
                setSelectedStudentSectionId(null);
                setSelectedSubjectSchoolId(null);
                setSelectedSubjectClassId(null);
                setSelectedSubjectId(null);
                setSelectedUserSchoolId(null);
                setExamResultFilters({ schoolId: null, classId: null, sectionId: null, subjectId: null, studentId: null });
              }}
              className={`${
                activeTab === 'schools'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Schools
            </button>
            <button
              onClick={() => {
                setActiveTab('classes');
                // Reset selections specific to other tabs
                setSelectedStudentSchoolId(null);
                setSelectedStudentClassId(null);
                setSelectedStudentSectionId(null);
                setSelectedSubjectSchoolId(null);
                setSelectedSubjectClassId(null);
                setSelectedSubjectId(null);
                setSelectedUserSchoolId(null);
                setExamResultFilters({ schoolId: null, classId: null, sectionId: null, subjectId: null, studentId: null });
              }}
              className={`${
                activeTab === 'classes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Classes & Sections
            </button>
            <button
              onClick={() => {
                setActiveTab('students');
                // Reset selections specific to other tabs
                setSelectedSchoolId(null);
                setSelectedClassId(null);
                setSelectedSubjectSchoolId(null);
                setSelectedSubjectClassId(null);
                setSelectedSubjectId(null);
                setSelectedUserSchoolId(null);
                setExamResultFilters({ schoolId: null, classId: null, sectionId: null, subjectId: null, studentId: null });
              }}
              className={`${
                activeTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Students
            </button>
            <button
              onClick={() => {
                setActiveTab('subjects');
                // Reset selections specific to other tabs
                setSelectedSchoolId(null);
                setSelectedClassId(null);
                setSelectedStudentSchoolId(null);
                setSelectedStudentClassId(null);
                setSelectedStudentSectionId(null);
                setSelectedUserSchoolId(null);
                setExamResultFilters({ schoolId: null, classId: null, sectionId: null, subjectId: null, studentId: null });
              }}
              className={`${
                activeTab === 'subjects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Subjects & Materials
            </button>
            <button
              onClick={() => {
                setActiveTab('users');
                // Reset selections specific to other tabs
                setSelectedSchoolId(null);
                setSelectedClassId(null);
                setSelectedStudentSchoolId(null);
                setSelectedStudentClassId(null);
                setSelectedStudentSectionId(null);
                setSelectedSubjectSchoolId(null);
                setSelectedSubjectClassId(null);
                setSelectedSubjectId(null);
                setExamResultFilters({ schoolId: null, classId: null, sectionId: null, subjectId: null, studentId: null });
              }}
              className={`${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              User Management
            </button>
            <button
              onClick={() => {
                setActiveTab('exam-results');
                // Reset selections specific to other tabs
                setSelectedSchoolId(null);
                setSelectedClassId(null);
                setSelectedStudentSchoolId(null);
                setSelectedStudentClassId(null);
                setSelectedStudentSectionId(null);
                setSelectedSubjectSchoolId(null);
                setSelectedSubjectClassId(null);
                setSelectedSubjectId(null);
                setSelectedUserSchoolId(null);
              }}
              className={`${
                activeTab === 'exam-results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Exam Results
            </button>
            <button
              onClick={() => {
                setActiveTab('top-rankers');
                // Reset selections specific to other tabs, keep the ranker dashboard clean state
                setSelectedSchoolId(null);
                setSelectedClassId(null);
                setSelectedStudentSchoolId(null);
                setSelectedStudentClassId(null);
                setSelectedStudentSectionId(null);
                setSelectedSubjectSchoolId(null);
                setSelectedSubjectClassId(null);
                setSelectedSubjectId(null);
                setSelectedUserSchoolId(null);
                setExamResultFilters({ schoolId: null, classId: null, sectionId: null, subjectId: null, studentId: null });
              }}
              className={`${
                activeTab === 'top-rankers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Top Rankers
            </button>
          </nav>
        </div>

        {activeTab === 'schools' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Manage Schools</h2>
            <SchoolForm onSchoolAdded={handleSchoolAdded} />
            <SchoolList
              refreshTrigger={refreshSchoolList}
              onSelectSchool={handleSelectSchool}
              selectedSchoolId={selectedSchoolId}
            />
          </div>
        )}

        {activeTab === 'classes' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Manage Classes & Sections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Select School</h3>
                <SchoolList
                  refreshTrigger={refreshSchoolList}
                  onSelectSchool={handleSelectSchool}
                  selectedSchoolId={selectedSchoolId}
                />
              </div>
              <div>
                {selectedSchoolId && (
                  <>
                    <ClassForm schoolId={selectedSchoolId} onClassAdded={handleClassAdded} />
                    <ClassList
                      schoolId={selectedSchoolId}
                      refreshTrigger={refreshClassList}
                      onSelectClass={handleSelectClass}
                      selectedClassId={selectedClassId}
                    />
                  </>
                )}
                {selectedClassId && (
                  <div className="mt-6">
                    <SectionForm schoolId={selectedSchoolId} classId={selectedClassId} onSectionAdded={handleSectionAdded} />
                    <SectionList
                      classId={selectedClassId}
                      refreshTrigger={refreshSectionList}
                      onSelectSection={handleSelectStudentSection} // Re-use for the section list within classes tab
                      selectedSectionId={selectedStudentSectionId} // Re-use for highlighting
                    />
                  </div>
                )}
                {!selectedSchoolId && (
                  <p className="text-gray-600">Please select a school to manage its classes and sections.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Manage Students</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="col-span-1">
                <h3 className="text-xl font-semibold mb-3">Select School</h3>
                <SchoolList
                  refreshTrigger={refreshSchoolList}
                  onSelectSchool={handleSelectStudentSchool}
                  selectedSchoolId={selectedStudentSchoolId}
                />
              </div>
              <div className="col-span-1">
                <h3 className="text-xl font-semibold mb-3">Select Class</h3>
                <ClassList
                  schoolId={selectedStudentSchoolId}
                  refreshTrigger={refreshClassList}
                  onSelectClass={handleSelectStudentClass}
                  selectedClassId={selectedStudentClassId}
                />
              </div>
              <div className="col-span-1">
                <h3 className="text-xl font-semibold mb-3">Select Section</h3>
                <SectionList
                  classId={selectedStudentClassId}
                  refreshTrigger={refreshSectionList}
                  onSelectSection={handleSelectStudentSection}
                  selectedSectionId={selectedStudentSectionId}
                />
                {selectedStudentClassId && !selectedStudentSectionId && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                    Please select a section from the list above to add/view students.
                  </div>
                )}
              </div>
            </div>

            {selectedStudentSchoolId && selectedStudentClassId && selectedStudentSectionId && (
              <>
                <StudentForm
                  onStudentAdded={handleStudentAdded}
                  selectedSchoolId={selectedStudentSchoolId}
                  selectedClassId={selectedStudentClassId}
                  selectedSectionId={selectedStudentSectionId}
                />
                <div className="mt-6">
                  <button className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Bulk Upload Students (Coming Soon)
                  </button>
                </div>
                <StudentList
                  schoolId={selectedStudentSchoolId}
                  classId={selectedStudentClassId}
                  sectionId={selectedStudentSectionId}
                  refreshTrigger={refreshStudentList}
                />
              </>
            )}
            {(!selectedStudentSchoolId || !selectedStudentClassId || !selectedStudentSectionId) && (
              <p className="text-gray-600">Select a School, Class, and Section above to manage students.</p>
            )}
          </div>
        )}

        {activeTab === 'subjects' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Manage Subjects & Materials</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="col-span-1">
                <h3 className="text-xl font-semibold mb-3">Select School</h3>
                <SchoolList
                  refreshTrigger={refreshSchoolList}
                  onSelectSchool={handleSelectSubjectSchool}
                  selectedSchoolId={selectedSubjectSchoolId}
                />
              </div>
              <div className="col-span-1">
                <h3 className="text-xl font-semibold mb-3">Select Class (for material association)</h3>
                <ClassList
                  schoolId={selectedSubjectSchoolId}
                  refreshTrigger={refreshClassList}
                  onSelectClass={handleSelectSubjectClass}
                  selectedClassId={selectedSubjectClassId}
                />
              </div>
              <div className="col-span-1">
                <h3 className="text-xl font-semibold mb-3">Select Subject</h3>
                <SubjectList
                  schoolId={selectedSubjectSchoolId}
                  refreshTrigger={refreshSubjectList}
                  onSelectSubject={handleSelectSubject}
                  selectedSubjectId={selectedSubjectId}
                />
              </div>
            </div>

            {selectedSubjectSchoolId && selectedSubjectClassId && selectedSubjectId && (
              <>
                <SubjectForm schoolId={selectedSubjectSchoolId} onSubjectAdded={handleSubjectAdded} />
                <div className="mt-6">
                  <SubjectMaterialForm
                    schoolId={selectedSubjectSchoolId}
                    classId={selectedSubjectClassId}
                    subjectId={selectedSubjectId}
                    onMaterialAdded={handleSubjectMaterialAdded}
                  />
                </div>
                <SubjectMaterialList
                  subjectId={selectedSubjectId}
                  refreshTrigger={refreshSubjectMaterialList}
                />
              </>
            )}
            {(!selectedSubjectSchoolId || !selectedSubjectClassId || !selectedSubjectId) && (
              <p className="text-gray-600">Select a School, Class, and Subject above to manage subjects and materials.</p>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="col-span-1">
                <h3 className="text-xl font-semibold mb-3">Select School to Manage Users For</h3>
                <SchoolList
                  refreshTrigger={refreshSchoolList} // Re-use school refresh
                  onSelectSchool={handleSelectUserSchool}
                  selectedSchoolId={selectedUserSchoolId}
                />
              </div>
              <div className="col-span-1">
                {selectedUserSchoolId ? (
                  <>
                    <UserForm schoolId={selectedUserSchoolId} onUserAdded={handleUserAdded} />
                    <div className="mt-6">
                      <UserList schoolId={selectedUserSchoolId} refreshTrigger={refreshUserList} />
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">Please select a school to manage its users.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exam-results' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Exam Results Dashboard</h2>
            <ExamResultFilters onFilterChange={handleExamResultFilterChange} />
            <ExamResultsDashboard filters={examResultFilters} refreshTrigger={refreshExamResults} />
          </div>
        )}

        {activeTab === 'top-rankers' && (
          <div>
            <TopRankerDashboard />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrganizationsPage;
