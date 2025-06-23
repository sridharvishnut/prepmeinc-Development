"use client";

import React, { useState } from 'react';
import SchoolForm from '@/components/manage-organizations/schools/SchoolForm';
import SchoolList from '@/components/manage-organizations/schools/SchoolList';
import ClassForm from '@/components/manage-organizations/classes/ClassForm';
import ClassList from '@/components/manage-organizations/classes/ClassList';
import SectionForm from '@/components/manage-organizations/classes/SectionForm';
import SectionList from '@/components/manage-organizations/classes/SectionList';
import StudentForm from '@/components/manage-organizations/students/StudentForm';
import StudentList from '@/components/manage-organizations/students/StudentList';
import SubjectForm from '@/components/manage-organizations/subjects/SubjectForm';
import SubjectList from '@/components/manage-organizations/subjects/SubjectList';
import SubjectMaterialForm from '@/components/manage-organizations/subjects/SubjectMaterialForm';
import SubjectMaterialList from '@/components/manage-organizations/subjects/SubjectMaterialList';
import UserForm from '@/components/manage-organizations/users/UserForm';
import UserList from '@/components/manage-organizations/users/UserList';
import ExamResultFilters from '@/components/manage-organizations/exam-results/ExamResultFilters';
import ExamResultsDashboard from '@/components/manage-organizations/exam-results/ExamResultsDashboard';
import TopRankerDashboard from '@/components/manage-organizations/exam-results/TopRankerDashboard';

const ManageOrganizationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('schools');

  // Various refresh triggers
  const [refreshSchoolList, setRefreshSchoolList] = useState(0);
  const [refreshClassList, setRefreshClassList] = useState(0);
  const [refreshSectionList, setRefreshSectionList] = useState(0);
  const [refreshStudentList, setRefreshStudentList] = useState(0);
  const [refreshSubjectList, setRefreshSubjectList] = useState(0);
  const [refreshSubjectMaterialList, setRefreshSubjectMaterialList] = useState(0);
  const [refreshUserList, setRefreshUserList] = useState(0);
  const [refreshExamResults, setRefreshExamResults] = useState(0);

  // Selected IDs
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedStudentSchoolId, setSelectedStudentSchoolId] = useState<string | null>(null);
  const [selectedStudentClassId, setSelectedStudentClassId] = useState<string | null>(null);
  const [selectedStudentSectionId, setSelectedStudentSectionId] = useState<string | null>(null);
  const [selectedSubjectSchoolId, setSelectedSubjectSchoolId] = useState<string | null>(null);
  const [selectedSubjectClassId, setSelectedSubjectClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedUserSchoolId, setSelectedUserSchoolId] = useState<string | null>(null);

  const [examResultFilters, setExamResultFilters] = useState({
    schoolId: null as string | null,
    classId: null as string | null,
    sectionId: null as string | null,
    subjectId: null as string | null,
    studentId: null as string | null,
  });

  const resetAllSelections = () => {
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
  };

  const handleSchoolAdded = () => {
    setRefreshSchoolList(p => p + 1);
    resetAllSelections();
  };

  const handleClassAdded = () => {
    setRefreshClassList(p => p + 1);
    setSelectedClassId(null);
  };

  const handleSectionAdded = () => {
    setRefreshSectionList(p => p + 1);
  };

  const handleStudentAdded = () => {
    setRefreshStudentList(p => p + 1);
    setRefreshExamResults(p => p + 1);
  };

  const handleSubjectAdded = () => {
    setRefreshSubjectList(p => p + 1);
    setSelectedSubjectId(null);
    setRefreshExamResults(p => p + 1);
  };

  const handleSubjectMaterialAdded = () => {
    setRefreshSubjectMaterialList(p => p + 1);
  };

  const handleUserAdded = () => {
    setRefreshUserList(p => p + 1);
  };

  const handleSelectSchool = (schoolId: string | null) => {
    console.log('handleSelectSchool called with:', schoolId); // ADDED LOG
    setSelectedSchoolId(schoolId);
    setSelectedClassId(null);
    setRefreshClassList(p => p + 1);
    setSelectedSubjectId(null);
    setRefreshSubjectList(p => p + 1);
  };

  const handleSelectClass = (classId: string | null) => {
    console.log('handleSelectClass called with:', classId); // ADDED LOG
    setSelectedClassId(classId);
    setRefreshSectionList(p => p + 1);
  };

  const handleSelectStudentSchool = (schoolId: string | null) => {
    setSelectedStudentSchoolId(schoolId);
    setSelectedStudentClassId(null);
    setSelectedStudentSectionId(null);
    setRefreshClassList(p => p + 1);
  };

  const handleSelectStudentClass = (classId: string | null) => {
    setSelectedStudentClassId(classId);
    setSelectedStudentSectionId(null);
    setRefreshSectionList(p => p + 1);
  };

  const handleSelectStudentSection = (sectionId: string | null) => {
    setSelectedStudentSectionId(sectionId);
    setRefreshStudentList(p => p + 1);
  };

  const handleSelectSubjectSchool = (schoolId: string | null) => {
    setSelectedSubjectSchoolId(schoolId);
    setSelectedSubjectClassId(null);
    setSelectedSubjectId(null);
    setRefreshClassList(p => p + 1);
    if (activeTab === 'classes') setSelectedSchoolId(schoolId);
  };

  const handleSelectSubjectClass = (classId: string | null) => {
    setSelectedSubjectClassId(classId);
    setSelectedSubjectId(null);
    setRefreshSubjectList(p => p + 1);
    if (activeTab === 'classes') setSelectedClassId(classId);
  };

  const handleSelectSubject = (subjectId: string | null) => {
    setSelectedSubjectId(subjectId);
    setRefreshSubjectMaterialList(p => p + 1);
  };

  const handleSelectUserSchool = (schoolId: string | null) => {
    setSelectedUserSchoolId(schoolId);
    setRefreshUserList(p => p + 1);
  };

  const handleExamResultFilterChange = (filters: typeof examResultFilters) => {
    setExamResultFilters(filters);
    setRefreshExamResults(p => p + 1);
  };

  const getSubjectMaterialMessage = () => {
    if (!selectedSubjectSchoolId) return "Please select a School to manage subject materials.";
    if (!selectedSubjectClassId) return "Please select a Class to manage subject materials.";
    if (!selectedSubjectId) return "Please select a Subject to manage subject materials.";
    return "Select School, Class, and Subject above.";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Organizations</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {['schools', 'classes', 'students', 'subjects', 'users', 'exam-results', 'top-rankers'].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  // Only reset all selections if NOT navigating to the 'classes' tab
                  if (tab !== 'classes') {
                    resetAllSelections();
                  }
                }}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {{
                  schools: 'Schools',
                  classes: 'Classes & Sections',
                  students: 'Students',
                  subjects: 'Subjects & Materials',
                  users: 'User Management',
                  'exam-results': 'Exam Results',
                  'top-rankers': 'Top Rankers',
                }[tab]}
              </button>
            ))}
          </nav>
        </div>

        {/* ---- Tab Content ---- */}
        {activeTab === 'schools' && (
          <>
            <SchoolForm onSchoolAdded={handleSchoolAdded} />
            <SchoolList
              refreshTrigger={refreshSchoolList}
              onSelectSchool={handleSelectSchool}
              selectedSchoolId={selectedSchoolId}
            />
          </>
        )}

        {activeTab === 'classes' && selectedSchoolId && (
          <>
            <ClassForm schoolId={selectedSchoolId} onClassAdded={handleClassAdded} />
            <ClassList
              schoolId={selectedSchoolId}
              refreshTrigger={refreshClassList}
              onSelectClass={handleSelectClass}
              selectedClassId={selectedClassId}
            />
            {selectedClassId && (
              <>
                <SectionForm schoolId={selectedSchoolId} classId={selectedClassId} onSectionAdded={handleSectionAdded} />
                <SectionList
                  classId={selectedClassId}
                  refreshTrigger={refreshSectionList}
                  onSelectSection={handleSelectStudentSection}
                  selectedSectionId={selectedStudentSectionId}
                />
              </>
            )}
          </>
        )}

        {activeTab === 'students' && (
          <>
            <SchoolList
              refreshTrigger={refreshSchoolList}
              onSelectSchool={handleSelectStudentSchool}
              selectedSchoolId={selectedStudentSchoolId}
            />
            <ClassList
              schoolId={selectedStudentSchoolId}
              refreshTrigger={refreshClassList}
              onSelectClass={handleSelectStudentClass}
              selectedClassId={selectedStudentClassId}
            />
            <SectionList
              classId={selectedStudentClassId}
              refreshTrigger={refreshSectionList}
              onSelectSection={handleSelectStudentSection}
              selectedSectionId={selectedStudentSectionId}
            />
            {selectedStudentSchoolId && selectedStudentClassId && selectedStudentSectionId && (
              <>
                <StudentForm
                  onStudentAdded={handleStudentAdded}
                  selectedSchoolId={selectedStudentSchoolId}
                  selectedClassId={selectedStudentClassId}
                  selectedSectionId={selectedStudentSectionId}
                />
                <StudentList
                  schoolId={selectedStudentSchoolId}
                  classId={selectedStudentClassId}
                  sectionId={selectedStudentSectionId}
                  refreshTrigger={refreshStudentList}
                />
              </>
            )}
          </>
        )}

        {activeTab === 'subjects' && (
          <>
            <SchoolList
              refreshTrigger={refreshSchoolList}
              onSelectSchool={handleSelectSubjectSchool}
              selectedSchoolId={selectedSubjectSchoolId}
            />
            <ClassList
              schoolId={selectedSubjectSchoolId}
              refreshTrigger={refreshClassList}
              onSelectClass={handleSelectSubjectClass}
              selectedClassId={selectedSubjectClassId}
            />
            {selectedSubjectSchoolId && selectedSubjectClassId && (
              <SubjectForm
                schoolId={selectedSubjectSchoolId}
                classId={selectedSubjectClassId}
                onSubjectAdded={handleSubjectAdded}
              />
            )}
            <SubjectList
              schoolId={selectedSubjectSchoolId}
              refreshTrigger={refreshSubjectList}
              onSelectSubject={handleSelectSubject}
              selectedSubjectId={selectedSubjectId}
            />
            {selectedSubjectSchoolId && selectedSubjectClassId && selectedSubjectId ? (
              <>
                <SubjectMaterialForm
                  schoolId={selectedSubjectSchoolId}
                  classId={selectedSubjectClassId}
                  subjectId={selectedSubjectId}
                  onMaterialAdded={handleSubjectMaterialAdded}
                />
                <SubjectMaterialList subjectId={selectedSubjectId} refreshTrigger={refreshSubjectMaterialList} />
              </>
            ) : (
              <p className="text-gray-600">{getSubjectMaterialMessage()}</p>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <>
            <SchoolList
              refreshTrigger={refreshSchoolList}
              onSelectSchool={handleSelectUserSchool}
              selectedSchoolId={selectedUserSchoolId}
            />
            {selectedUserSchoolId ? (
              <>
                <UserForm selectedSchoolId={selectedUserSchoolId} onUserAdded={handleUserAdded} />
                <UserList schoolId={selectedUserSchoolId} refreshTrigger={refreshUserList} />
              </>
            ) : (
              <p className="text-gray-600">Please select a school to manage users.</p>
            )}
          </>
        )}

        {activeTab === 'exam-results' && (
          <>
            <ExamResultFilters onFilterChange={handleExamResultFilterChange} />
            <ExamResultsDashboard filters={examResultFilters} refreshTrigger={refreshExamResults} />
          </>
        )}

        {activeTab === 'top-rankers' && <TopRankerDashboard />}
      </div>
    </div>
  );
};

export default ManageOrganizationsPage;
