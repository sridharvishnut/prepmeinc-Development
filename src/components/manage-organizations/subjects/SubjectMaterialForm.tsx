// src/components/manage-organizations/subjects/SubjectMaterialForm.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { SubjectMaterial } from '../../../types/manage-organizations';

interface SubjectMaterialFormProps {
  schoolId: string | null;
  classId: string | null; // Material might be specific to a class
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
  const [fileUrl, setFileUrl] = useState<string>(''); // Placeholder for actual file upload URL
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [testKeyFileUrl, setTestKeyFileUrl] = useState<string>(''); // Optional test key file URL
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset form fields when selection changes
  useEffect(() => {
    if (!schoolId || !classId || !subjectId) {
      setTitle('');
      setDescription('');
      setFileUrl('');
      setFileName('');
      setFileType('');
      setTestKeyFileUrl('');
      setError(null);
      setSuccess(null);
    }
  }, [schoolId, classId, subjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schoolId || !classId || !subjectId) {
      setError('Please select a School, Class, and Subject before adding material.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real application, file upload to Firebase Storage would happen here first.
      // For now, we assume fileUrl, fileName, fileType are obtained or manually entered.
      if (!fileUrl || !fileName || !fileType) {
        throw new Error('Please provide a file URL, file name, and file type for the material.');
      }

      const materialData: Omit<SubjectMaterial, 'id' | 'createdAt' | 'updatedAt' | 'uploadedBy'> = {
        schoolId,
        classId,
        subjectId,
        title,
        description,
        fileUrl,
        fileName,
        fileType,
        ...(testKeyFileUrl && { testKeyFileUrl }), // Only include if provided
      };

      // TODO: Replace with actual userId from authentication context
      const uploadedBy = "admin_user_id"; 

      const response = await fetch('/api/manage-organizations/subject-materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...materialData, uploadedBy }),
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
      setFileUrl('');
      setFileName('');
      setFileType('');
      setTestKeyFileUrl('');

      onMaterialAdded(); // Notify parent component to refresh list
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const isFormDisabled = !schoolId || !classId || !subjectId;

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New Subject Material</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        {/* Placeholder for actual file upload input */}
        <div className="border border-dashed border-gray-300 p-4 rounded-md text-center text-gray-500">
          <p className="font-medium">File Upload Area (Coming Soon: Firebase Storage Integration)</p>
          <p className="text-sm mb-2">For now, please manually provide file details:</p>
          <div>
            <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700">File URL</label>
            <input
              type="text"
              id="fileUrl"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., https://firebasestorage.com/.../document.pdf"
              required
              disabled={isFormDisabled}
            />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fileName" className="block text-sm font-medium text-gray-700">File Name (e.g., MyChapter1.pdf)</label>
              <input
                type="text"
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                disabled={isFormDisabled}
              />
            </div>
            <div>
              <label htmlFor="fileType" className="block text-sm font-medium text-gray-700">File Type (e.g., application/pdf)</label>
              <input
                type="text"
                id="fileType"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                disabled={isFormDisabled}
              />
            </div>
          </div>
        </div>
        
        {/* Optional Test Key File Upload Placeholder */}
        <div className="border border-dashed border-gray-300 p-4 rounded-md text-center text-gray-500">
          <p className="font-medium">Optional: Test Key File Upload Area (Coming Soon)</p>
          <p className="text-sm mb-2">For now, you can provide an optional test key file URL:</p>
          <div>
            <label htmlFor="testKeyFileUrl" className="block text-sm font-medium text-gray-700">Test Key File URL (Optional)</label>
            <input
              type="text"
              id="testKeyFileUrl"
              value={testKeyFileUrl}
              onChange={(e) => setTestKeyFileUrl(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., https://firebasestorage.com/.../test_keys.pdf"
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
          {loading ? 'Adding Material...' : 'Add Material'}
        </button>
      </form>
    </div>
  );
};

export default SubjectMaterialForm;
