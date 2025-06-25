/* @jsxImportSource react */
'use client';

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

const ManageOrganizationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('schools');

  const [refreshSchoolList, setRefreshSchoolList] = useState(0);
  const [refreshClassList, setRefreshClassList] = useState(0);
  const [refreshSectionList, setRefreshSectionList] = useState(0);
  const [refreshStudentList, setRefreshStudentList] = useState(0);
  const [refreshSubjectList, setRefreshSubjectList] = useState(0);
  const [refreshSubjectMaterialList, setRefreshSubjectMaterialList] = useState(0);
  const [refreshUserList, setRefreshUserList] = useState(0);
  const [refreshExamResults, setRefreshExamResults] = useState(0);

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
    schoolId: null,
    classId: null,
    sectionId: null,
    subjectId: null,
    studentId: null
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
    setRefreshSchoolList(prev => prev + 1);
    resetAllSelections();
  };

  const handleClassAdded = () => {
    setRefreshClassList(prev => prev + 1);
    setSelectedClassId(null);
    setSelectedStudentClassId(null);
    setSelectedStudentSectionId(null);
    setSelectedSubjectClassId(null);
    setSelectedSubjectId(null);
    setExamResultFilters(prev => ({ ...prev, classId: null, sectionId: null, studentId: null }));
  };

  const handleSectionAdded = () => {
    setRefreshSectionList(prev => prev + 1);
    setSelectedStudentSectionId(null);
    setExamResultFilters(prev => ({ ...prev, sectionId: null, studentId: null }));
  };

  const handleStudentAdded = () => {
    setRefreshStudentList(prev => prev + 1);
    setRefreshExamResults(prev => prev + 1);
  };

  const handleSubjectAdded = () => {
    setRefreshSubjectList(prev => prev + 1);
    setSelectedSubjectId(null);
    setRefreshExamResults(prev => prev + 1);
  };

  const handleSubjectMaterialAdded = () => {
    setRefreshSubjectMaterialList(prev => prev + 1);
  };

  const handleUserAdded = () => {
    setRefreshUserList(prev => prev + 1);
  };

  const handleSelectSchool = (schoolId: string | null) => {
    setSelectedSchoolId(schoolId);
    setSelectedClassId(null);
    setRefreshClassList(prev => prev + 1);
    setSelectedSubjectId(null);
    setRefreshSubjectList(prev => prev + 1);
  };

  const handleSelectClass = (classId: string | null) => {
    setSelectedClassId(classId);
    setRefreshSectionList(prev => prev + 1);
  };

  const handleSelectStudentSchool = (schoolId: string | null) => {
    setSelectedStudentSchoolId(schoolId);
    setSelectedStudentClassId(null);
    setSelectedStudentSectionId(null);
    setRefreshClassList(prev => prev + 1);
  };

  const handleSelectStudentClass = (classId: string | null) => {
    setSelectedStudentClassId(classId);
    setSelectedStudentSectionId(null);
    setRefreshSectionList(prev => prev + 1);
  };

  const handleSelectStudentSection = (sectionId: string | null) => {
    setSelectedStudentSectionId(sectionId);
    setRefreshStudentList(prev => prev + 1);
  };

  const handleSelectSubjectSchool = (schoolId: string | null) => {
    setSelectedSubjectSchoolId(schoolId);
    setSelectedSubjectClassId(null);
    setSelectedSubjectId(null);
    setRefreshClassList(prev => prev + 1);
    if (activeTab === 'classes') {
      setSelectedSchoolId(schoolId);
    }
  };

  const handleSelectSubjectClass = (classId: string | null) => {
    setSelectedSubjectClassId(classId);
    setSelectedSubjectId(null);
    setRefreshSubjectList(prev => prev + 1);
    if (activeTab === 'classes') {
      setSelectedClassId(classId);
    }
  };

  const handleSelectSubject = (subjectId: string | null) => {
    setSelectedSubjectId(subjectId);
    setRefreshSubjectMaterialList(prev => prev + 1);
  };

  const handleSelectUserSchool = (schoolId: string | null) => {
    setSelectedUserSchoolId(schoolId);
    setRefreshUserList(prev => prev + 1);
  };

  const handleExamResultFilterChange = (filters: typeof examResultFilters) => {
    setExamResultFilters(filters);
    setRefreshExamResults(prev => prev + 1);
  };

  const getSubjectMaterialMessage = () => {
    if (!selectedSubjectSchoolId) return 'Please select a School to manage subject materials.';
    if (!selectedSubjectClassId) return 'Please select a Class to manage subject materials.';
    if (!selectedSubjectId) return 'Please select a Subject to manage subject materials.';
    return 'Select a School, Class, and Subject above to manage subject materials.';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Organizations</h1>

      <div className="mb-8 flex space-x-4">
        <TabButton label="Schools" activeTab={activeTab} setActiveTab={setActiveTab} tabName="schools" />
        <TabButton label="Classes" activeTab={activeTab} setActiveTab={setActiveTab} tabName="classes" />
        <TabButton label="Students" activeTab={activeTab} setActiveTab={setActiveTab} tabName="students" />
        <TabButton label="Subjects" activeTab={activeTab} setActiveTab={setActiveTab} tabName="subjects" />
        <TabButton label="Users" activeTab={activeTab} setActiveTab={setActiveTab} tabName="users" />
        <TabButton label="Exam Results" activeTab={activeTab} setActiveTab={setActiveTab} tabName="examResults" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'schools' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Schools</h2>
            {/* Corrected prop name from onSuccess to onSchoolAdded */}
            <SchoolForm onSchoolAdded={handleSchoolAdded} />
            <SchoolList
              key={refreshSchoolList}
              onSelectSchool={handleSelectSchool}
              refreshTrigger={refreshSchoolList}
              selectedSchoolId={selectedSchoolId}
            />
          </div>
        )}

        {activeTab === 'classes' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Classes</h2>
            <div className="mb-4">
              <label htmlFor="select-school-for-class" className="block text-gray-700 text-sm font-bold mb-2">Select School:</label>
              <SchoolList
                key={`select-class-school-${refreshSchoolList}`}
                onSelectSchool={(id) => {
                  setSelectedSchoolId(id);
                  setSelectedClassId(null);
                  setRefreshClassList(prev => prev + 1);
                }}
                selectedSchoolId={selectedSchoolId}
                showSelectAllOption={true}
                refreshTrigger={refreshSchoolList}
              />
            </div>

            {selectedSchoolId ? (
              <>
                {/* Corrected prop name from onSuccess to onClassAdded */}
                <ClassForm onClassAdded={handleClassAdded} schoolId={selectedSchoolId} />
                <ClassList
                  key={refreshClassList}
                  schoolId={selectedSchoolId}
                  onSelectClass={handleSelectClass}
                  selectedClassId={selectedClassId}
                  refreshTrigger={refreshClassList}
                />
                {selectedClassId && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Sections for selected Class</h3>
                    {/* Corrected prop name from onSuccess to onSectionAdded */}
                    <SectionForm onSectionAdded={handleSectionAdded} classId={selectedClassId} schoolId={selectedSchoolId} />
                    <SectionList
                      key={refreshSectionList}
                      classId={selectedClassId}
                      onSelectSection={handleSelectStudentSection} 
                      selectedSectionId={selectedStudentSectionId} 
                      refreshTrigger={refreshSectionList}
                    />
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-600">Please select a school to manage classes and sections.</p>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Students</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="select-school-for-student" className="block text-gray-700 text-sm font-bold mb-2">Select School:</label>
                <SchoolList
                  key={`select-student-school-${refreshSchoolList}`}
                  onSelectSchool={handleSelectStudentSchool}
                  selectedSchoolId={selectedStudentSchoolId}
                  showSelectAllOption={true}
                  refreshTrigger={refreshSchoolList}
                />
              </div>
              <div>
                <label htmlFor="select-class-for-student" className="block text-gray-700 text-sm font-bold mb-2">Select Class:</label>
                <ClassList
                  key={`select-student-class-${refreshClassList}`}
                  schoolId={selectedStudentSchoolId}
                  onSelectClass={handleSelectStudentClass}
                  selectedClassId={selectedStudentClassId}
                  showSelectAllOption={true}
                  refreshTrigger={refreshClassList}
                />
              </div>
              <div>
                <label htmlFor="select-section-for-student" className="block text-gray-700 text-sm font-bold mb-2">Select Section:</label>
                <SectionList
                  key={`select-student-section-${refreshSectionList}`}
                  classId={selectedStudentClassId}
                  onSelectSection={handleSelectStudentSection}
                  selectedSectionId={selectedStudentSectionId}
                  refreshTrigger={refreshSectionList}
                />
              </div>
            </div>

            {(selectedStudentSchoolId || selectedStudentClassId || selectedStudentSectionId) && (
              <StudentForm
                onStudentAdded={handleStudentAdded}
                schoolId={selectedStudentSchoolId}
                classId={selectedStudentClassId}
                sectionId={selectedStudentSectionId}
              />
            )}
            <StudentList
              key={refreshStudentList}
              schoolId={selectedStudentSchoolId}
              classId={selectedStudentClassId}
              sectionId={selectedStudentSectionId}
              refreshTrigger={refreshStudentList} // Added missing prop
            />
          </div>
        )}

        {activeTab === 'subjects' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Subjects & Materials</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="select-school-for-subject" className="block text-gray-700 text-sm font-bold mb-2">Select School:</label>
                <SchoolList
                  key={`select-subject-school-${refreshSchoolList}`}
                  onSelectSchool={handleSelectSubjectSchool}
                  selectedSchoolId={selectedSubjectSchoolId}
                  showSelectAllOption={true}
                  refreshTrigger={refreshSchoolList}
                />
              </div>
              <div>
                <label htmlFor="select-class-for-subject" className="block text-gray-700 text-sm font-bold mb-2">Select Class:</label>
                <ClassList
                  key={`select-subject-class-${refreshClassList}`}
                  schoolId={selectedSubjectSchoolId}
                  onSelectClass={handleSelectSubjectClass}
                  selectedClassId={selectedSubjectClassId}
                  showSelectAllOption={true}
                  refreshTrigger={refreshClassList}
                />
              </div>
              <div>
                <label htmlFor="select-subject" className="block text-gray-700 text-sm font-bold mb-2">Select Subject:</label>
                <SubjectList
                  key={`select-subject-${refreshSubjectList}`}
                  schoolId={selectedSubjectSchoolId}
                  classId={selectedSubjectClassId}
                  onSelectSubject={handleSelectSubject}
                  selectedSubjectId={selectedSubjectId}
                  showSelectAllOption={true}
                  refreshTrigger={refreshSubjectList} // Added missing prop
                />
              </div>
            </div>
            {(selectedSubjectSchoolId && selectedSubjectClassId) && (
              <SubjectForm
                onSubjectAdded={handleSubjectAdded} 
                schoolId={selectedSubjectSchoolId}
                classId={selectedSubjectClassId}
              />
            )}
            <SubjectList
              key={refreshSubjectList}
              schoolId={selectedSubjectSchoolId}
              classId={selectedSubjectClassId}
              onSelectSubject={handleSelectSubject}
              selectedSubjectId={selectedSubjectId}
            />

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Subject Materials</h3>
              {selectedSubjectSchoolId && selectedSubjectClassId && selectedSubjectId ? (
                <>
                  <SubjectMaterialForm
                    onSuccess={handleSubjectMaterialAdded}
                    schoolId={selectedSubjectSchoolId}
                    classId={selectedSubjectClassId}
                    subjectId={selectedSubjectId}
                  />
                  <SubjectMaterialList
                    key={refreshSubjectMaterialList}
                    schoolId={selectedSubjectSchoolId}
                    classId={selectedSubjectClassId}
                    subjectId={selectedSubjectId}
                    refreshTrigger={refreshSubjectMaterialList} // Added missing prop
                  />
                </>
              ) : (
                <p className="text-gray-600">{getSubjectMaterialMessage()}</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Users</h2>
            <div className="mb-4">
              <label htmlFor="select-school-for-user" className="block text-gray-700 text-sm font-bold mb-2">Filter by School:</label>
              <SchoolList
                key={`select-user-school-${refreshSchoolList}`}
                onSelectSchool={handleSelectUserSchool}
                selectedSchoolId={selectedUserSchoolId}
                showSelectAllOption={true}
                refreshTrigger={refreshSchoolList}
              />
            </div>
            <UserForm onSuccess={handleUserAdded} schoolId={selectedUserSchoolId} />
            <UserList 
              key={refreshUserList} 
              schoolId={selectedUserSchoolId} 
              refreshTrigger={refreshUserList} // Added missing prop
            />
          </div>
        )}

        {activeTab === 'examResults' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Exam Results</h2>
            <ExamResultFilters
              filters={examResultFilters}
              onFilterChange={handleExamResultFilterChange}
              refreshSchoolList={refreshSchoolList}
              refreshClassList={refreshClassList}
              refreshSectionList={refreshSectionList}
              refreshSubjectList={refreshSubjectList}
              refreshStudentList={refreshStudentList}
            />
            <ExamResultsDashboard
              key={refreshExamResults}
              filters={examResultFilters}
            />
            <TopRankerDashboard
              key={`top-rankers-${refreshExamResults}`}
              filters={examResultFilters}
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface TabButtonProps {
  label: string;
  tabName: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, tabName, activeTab, setActiveTab }) => (
  <button
    className={`px-4 py-2 rounded-md focus:outline-none ${activeTab === tabName ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
    onClick={() => setActiveTab(tabName)}
  >
    {label}
  </button>
);

export default ManageOrganizationsPage;
