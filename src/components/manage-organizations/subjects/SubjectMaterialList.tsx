// src/components/manage-organizations/subjects/SubjectMaterialList.tsx

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { SubjectMaterial } from '../../../types/manage-organizations';

interface SubjectMaterialListProps {
  subjectId: string | null;
  refreshTrigger: number;
}

/**
 * Feature ID: MO-027
 * Feature Name: Frontend Component - Subject Material List
 * What it does: Displays a list of subject materials for a selected subject.
 * Description: Fetches subject materials based on the provided subjectId and presents them in a table. Includes buttons for viewing content and generating tests.
 * Current Module Implemented: Manage-Organizations (src/components/manage-organizations/subjects)
 * Module to be implemented: Manage-Organizations (Integration into Subjects & Materials tab, View Content/Generate Test functionality, Edit/Delete functionality)
 */
const SubjectMaterialList: React.FC<SubjectMaterialListProps> = ({
  subjectId,
  refreshTrigger,
}) => {
  const [materials, setMaterials] = useState<SubjectMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = useCallback(async () => {
    if (!subjectId) {
      setMaterials([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/manage-organizations/subject-materials?subjectId=${subjectId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch subject materials');
      }
      const data = await response.json();
      setMaterials(data.materials);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching subject materials.');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials, refreshTrigger]); // Re-fetch when subjectId or refreshTrigger changes

  const handleViewContent = (fileUrl: string) => {
    // In a real application, this would open the file in a viewer or new tab
    window.open(fileUrl, '_blank');
    console.log('View content for:', fileUrl);
  };

  const handleGenerateTest = (materialId: string) => {
    // This will be a dropdown with options, for now, just a placeholder
    alert(`Generate Test for Material ID: ${materialId} (Functionality coming soon!)`);
    console.log('Generate Test for material:', materialId);
  };

  if (!subjectId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-6 text-gray-600">
        Select a subject to view materials.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-4">Loading subject materials...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Materials for Selected Subject</h2>
      {materials.length === 0 ? (
        <p className="text-gray-600">No materials added yet for this subject.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((material) => (
                <tr key={material.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.fileName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewContent(material.fileUrl)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      View Content
                    </button>
                    <button
                      onClick={() => handleGenerateTest(material.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Generate Test
                    </button>
                    {/* Add edit/delete buttons here later */}
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

export default SubjectMaterialList;
