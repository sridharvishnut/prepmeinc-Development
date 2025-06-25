// src/components/manage-organizations/subjects/SubjectMaterialForm.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { SubjectMaterial } from '../../../types/manage-organizations';

interface SubjectMaterialFormProps {
  schoolId: string | null;
  classId: string | null;
  subjectId: string | null;
  onSuccess?: () => void;
}

/**
 * Feature ID: MO-026
 * Feature Name: Frontend Component - Subject Material Form (Placeholder for File Upload)
 */
const SubjectMaterialForm: React.FC<SubjectMaterialFormProps> = ({
  schoolId,
  classId,
  subjectId,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [testKeyFileUrl, setTestKeyFileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        ...(testKeyFileUrl && { testKeyFileUrl }),
      };

      const uploadedBy = "admin_user_id";

      const response = await fetch('/api/manage-organizations/subject-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...materialData, uploadedBy }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add subject material');
      }

      const data = await response.json();
      setSuccess(`Material '${data.material.title}' added successfully!`);

      setTitle('');
      setDescription('');
      setFileUrl('');
      setFileName('');
      setFileType('');
      setTestKeyFileUrl('');

      onSuccess && onSuccess();
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

        {/* File Upload Placeholder */}
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
              <label htmlFor="fileName" className="block text-sm font-medium text-gray-700">File Name</label>
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
              <label htmlFor="fileType" className="block text-sm font-medium text-gray-700">File Type</label>
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
        </div> {/* ✅ This closing div was missing! */}

        {/* Test Key File URL Section */}
        <div className="border border-dashed border-gray-300 p-4 rounded-md text-center text-gray-500">
          <p className="font-medium">Optional: Test Key File Upload Area (Coming Soon)</p>
          <p className="text-sm mb-2">You can provide an optional test key file URL:</p>

          <div>
            <label htmlFor="testKeyFileUrl" className="block text-sm font-medium text-gray-700">Test Key File URL</label>
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
