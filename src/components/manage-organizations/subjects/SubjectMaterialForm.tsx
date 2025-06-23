// src/components/manage-organizations/subjects/SubjectMaterialForm.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { SubjectMaterial } from '../../../types/manage-organizations';
import { uploadDocument } from '../../../../src/firebaseUtils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../../src/auth'; // Assuming auth is exported from auth.ts

interface SubjectMaterialFormProps {
  schoolId: string | null;
  classId: string | null;
  subjectId: string | null;
  onMaterialAdded: () => void;
}

/**
 * Feature ID: MO-026
 * Feature Name: Frontend Component - Subject Material Form (Placeholder for File Upload)
 * What it does: Provides a form for adding new subject material records, including title, description, and placeholders for file URL and optional test key URL.
 * Description: Allows administrators to input details for subject materials. The actual file upload mechanism to a storage solution (like Firebase Storage) is noted as a future, separate implementation step. For now, it will simulate file URLs.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/subjects)
 * Module to be implemented: Manage-Organizations (Actual file upload to Firebase Storage, integration into page.tsx)
 */
const SubjectMaterialForm: React.FC<SubjectMaterialFormProps> = ({
  schoolId,
  classId,
  subjectId,
  onMaterialAdded,
}) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [testKeyFile, setTestKeyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [testKeyUploadProgress, setTestKeyUploadProgress] = useState<number>(0);

  const [user, authLoading, authError] = useAuthState(auth); // Get the authenticated user

  // Reset form fields when selection changes
  useEffect(() => {
    if (!schoolId || !classId || !subjectId) {
      setTitle('');
      setDescription('');
      setMainFile(null);
      setTestKeyFile(null);
      setError(null);
      setSuccess(null);
      setUploadProgress(0);
      setTestKeyUploadProgress(0);
    }
  }, [schoolId, classId, subjectId]);

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainFile(e.target.files[0]);
    }
  };

  const handleTestKeyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTestKeyFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schoolId || !classId || !subjectId) {
      setError('Please select a School, Class, and Subject before adding material.');
      return;
    }

    if (!user) {
      setError('You must be logged in to upload subject material.');
      return;
    }

    if (!mainFile) {
      setError('Please upload a main material file.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadedBy = user.uid; // Use the actual authenticated user's UID

      let mainFileUrl = '';
      let mainFileName = '';
      let mainFileType = '';

      // Upload main file to Firebase Storage
      console.log("Uploading main file...");
      mainFileUrl = await uploadDocument(mainFile, uploadedBy, 'subject_materials', setUploadProgress);
      mainFileName = mainFile.name;
      mainFileType = mainFile.type;
      console.log("Main file uploaded. URL:", mainFileUrl);

      let testKeyFileUrl = '';
      if (testKeyFile) {
        console.log("Uploading test key file...");
        testKeyFileUrl = await uploadDocument(testKeyFile, uploadedBy, 'test_keys', setTestKeyUploadProgress);
        console.log("Test key file uploaded. URL:", testKeyFileUrl);
      }

      const materialData: Omit<SubjectMaterial, 'id' | 'createdAt' | 'updatedAt'> = {
        schoolId,
        classId,
        subjectId,
        title,
        description,
        fileUrl: mainFileUrl,
        fileName: mainFileName,
        fileType: mainFileType,
        uploadedBy: uploadedBy, // Ensure uploadedBy is part of the data sent to API
      };

      const response = await fetch('/api/manage-organizations/subject-materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add subject material');
      }

      const data = await response.json();
      setSuccess(`Material '${data.material.title}' added successfully!`);
      // Clear form fields
      setTitle('');
      setDescription('');
      setMainFile(null);
      setTestKeyFile(null);
      setUploadProgress(0);
      setTestKeyUploadProgress(0);

      onMaterialAdded(); // Notify parent component to refresh list
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error("Error adding subject material:", err);
    } finally {
      setLoading(false);
    }
  };

  const isFormDisabled = !schoolId || !classId || !subjectId || authLoading || !user;

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New Subject Material</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!user && !authLoading && (
          <p className="text-red-500 text-sm mb-4">Please log in to add subject materials.</p>
        )}
        {authError && <p className="text-red-500 text-sm mb-4">Authentication Error: {authError.message}</p>}
        <div>
          <label htmlFor="materialTitle" className="block text-sm font-medium text-gray-700">Material Title</label>
          <input
            type="text"
            id="materialTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label htmlFor="materialDescription" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
          <textarea
            id="materialDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={isFormDisabled}
          />
        </div>

        {/* Main File Upload Input */}
        <div className="border border-dashed border-gray-300 p-4 rounded-md text-center text-gray-500">
          <p className="font-medium mb-2">Upload Main Material File</p>
          <input
            type="file"
            id="mainFile"
            onChange={handleMainFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required
            disabled={isFormDisabled}
          />
          {mainFile && <p className="mt-2 text-sm text-gray-700">Selected file: {mainFile.name} ({mainFile.type})</p>}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}
           {uploadProgress === 100 && <p className="text-green-500 text-sm mt-2">Upload Complete!</p>}
        </div>
        
        {/* Optional Test Key File Upload Input */}
        <div className="border border-dashed border-gray-300 p-4 rounded-md text-center text-gray-500">
          <p className="font-medium mb-2">Optional: Upload Test Key File</p>
          <input
            type="file"
            id="testKeyFile"
            onChange={handleTestKeyFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isFormDisabled}
          />
          {testKeyFile && <p className="mt-2 text-sm text-gray-700">Selected file: {testKeyFile.name} ({testKeyFile.type})</p>}
          {testKeyUploadProgress > 0 && testKeyUploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${testKeyUploadProgress}%` }}></div>
            </div>
          )}
          {testKeyUploadProgress === 100 && <p className="text-green-500 text-sm mt-2">Upload Complete!</p>}\
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mt-4">{success}</p>}
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading || isFormDisabled}
        >
          {loading ? 'Adding Material...' : 'Add Material'}
        </button>
      </form>
    </div>
  );
};

export default SubjectMaterialForm;
