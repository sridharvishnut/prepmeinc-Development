// src/components/manage-organizations/students/StudentForm.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { Student, School, Class, Section } from '../../../types/manage-organizations';

interface StudentFormProps {
  onStudentAdded: () => void;
  selectedSchoolId: string | null;
  selectedClassId: string | null;
  selectedSectionId: string | null;
}

/**
 * Feature ID: MO-017
 * Feature Name: Frontend Component - Student Form
 * What it does: Provides a form for adding new student records.
 * Description: Allows administrators to input details for a new student, associating them with a selected school, class, and section. It submits the data via the API.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/students)
 * Module to be implemented: (None - core component)
 */
const StudentForm: React.FC<StudentFormProps> = ({
  onStudentAdded,
  selectedSchoolId,
  selectedClassId,
  selectedSectionId,
}) => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>(''); // YYYY-MM-DD
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [admissionNumber, setAdmissionNumber] = useState<string>('');
  const [rollNumber, setRollNumber] = useState<string>('');
  const [parentName, setParentName] = useState<string>('');
  const [parentContact, setParentContact] = useState<string>('');
  const [parentEmail, setParentEmail] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>(''); // New
  const [email, setEmail] = useState<string>(''); // New
  const [address, setAddress] = useState<string>(''); // New
  const [dateOfJoining, setDateOfJoining] = useState<string>(''); // New: YYYY-MM-DD
  const [dateOfExit, setDateOfExit] = useState<string>(''); // New: YYYY-MM-DD
  const [yearPassedOut, setYearPassedOut] = useState<string>(''); // New
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset form fields when school/class/section selection changes
  useEffect(() => {
    // Only reset if a specific ID is no longer selected, indicating a change in context
    if (!selectedSchoolId || !selectedClassId || !selectedSectionId) {
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setGender('');
      setAdmissionNumber('');
      setRollNumber('');
      setParentName('');
      setParentContact('');
      setParentEmail('');
      setContactNumber('');
      setEmail('');
      setAddress('');
      setDateOfJoining('');
      setDateOfExit('');
      setYearPassedOut('');
      setError(null);
      setSuccess(null);
    }
  }, [selectedSchoolId, selectedClassId, selectedSectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSchoolId || !selectedClassId || !selectedSectionId) {
      setError('Please select a School, Class, and Section before adding a student.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'> = {
        schoolId: selectedSchoolId,
        classId: selectedClassId,
        sectionId: selectedSectionId,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth).getTime(), // Convert date string to timestamp
        gender: gender as 'Male' | 'Female' | 'Other',
        admissionNumber,
        rollNumber,
        parentName,
        parentContact,
        parentEmail,
        contactNumber: contactNumber || undefined, // New: Optional
        email: email || undefined, // New: Optional
        address: address || undefined, // New: Optional
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining).getTime() : undefined, // New: Optional timestamp
        dateOfExit: dateOfExit ? new Date(dateOfExit).getTime() : undefined, // New: Optional timestamp
        yearPassedOut: yearPassedOut ? parseInt(yearPassedOut) : undefined, // New: Optional number
      };

      const response = await fetch('/api/manage-organizations/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add student');
      }

      const data = await response.json();
      setSuccess(`Student '${data.student.firstName} ${data.student.lastName}' added successfully!`);
      // Clear form fields
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setGender('');
      setAdmissionNumber('');
      setRollNumber('');
      setParentName('');
      setParentContact('');
      setParentEmail('');
      setContactNumber('');
      setEmail('');
      setAddress('');
      setDateOfJoining('');
      setDateOfExit('');
      setYearPassedOut('');

      onStudentAdded(); // Notify parent component to refresh list
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const isFormDisabled = !selectedSchoolId || !selectedClassId || !selectedSectionId;

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isFormDisabled}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="admissionNumber" className="block text-sm font-medium text-gray-700">Admission Number</label>
            <input
              type="text"
              id="admissionNumber"
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">Roll Number</label>
            <input
              type="text"
              id="rollNumber"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="parentName" className="block text-sm font-medium text-gray-700">Parent/Guardian Name</label>
            <input
              type="text"
              id="parentName"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="parentContact" className="block text-sm font-medium text-gray-700">Parent/Guardian Contact</label>
            <input
              type="tel"
              id="parentContact"
              value={parentContact}
              onChange={(e) => setParentContact(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700">Parent/Guardian Email</label>
            <input
              type="email"
              id="parentEmail"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isFormDisabled}
            />
          </div>
          {/* New fields added below */}
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Student Contact Number</label>
            <input
              type="tel"
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Student Email ID</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isFormDisabled}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Student Address</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="dateOfJoining" className="block text-sm font-medium text-gray-700">Date of Joining</label>
            <input
              type="date"
              id="dateOfJoining"
              value={dateOfJoining}
              onChange={(e) => setDateOfJoining(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="dateOfExit" className="block text-sm font-medium text-gray-700">Date of Exit from School</label>
            <input
              type="date"
              id="dateOfExit"
              value={dateOfExit}
              onChange={(e) => setDateOfExit(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="yearPassedOut" className="block text-sm font-medium text-gray-700">Year Passed Out</label>
            <input
              type="number"
              id="yearPassedOut"
              value={yearPassedOut}
              onChange={(e) => setYearPassedOut(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isFormDisabled}
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mt-4">{success}</p>}
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading || isFormDisabled}
        >
          {loading ? 'Adding Student...' : 'Add Student'}
        </button>
      </form>
    </div>
  );
};

export default StudentForm;
