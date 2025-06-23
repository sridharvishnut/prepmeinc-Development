// src/components/feature-management/FeatureFlagForm.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { School } from '../../types/manage-organizations';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  enabledForSchools: { [key: string]: boolean };
  defaultEnabled: boolean;
}

interface FeatureFlagFormProps {
  onFlagUpserted: () => void;
  initialData?: FeatureFlag | null;
}

/**
 * Feature ID: MO-050-FE
 * Feature Name: Frontend Component - Feature Flag Form
 * What it does: Provides a form for creating or editing feature flags.
 * Description: Allows application administrators to define new features with an ID, name, description, global enabled status, and manage per-school overrides.
 * Current Module Implemented: src/components/feature-management
 * Module to be implemented: (None - core component)
 */
const FeatureFlagForm: React.FC<FeatureFlagFormProps> = ({
  onFlagUpserted,
  initialData = null,
}) => {
  const [id, setId] = useState(initialData?.id || '');
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [enabled, setEnabled] = useState(initialData?.enabled || false);
  const [defaultEnabled, setDefaultEnabled] = useState(initialData?.defaultEnabled || false);
  const [enabledForSchools, setEnabledForSchools] = useState<{ [key: string]: boolean }>(initialData?.enabledForSchools || {});
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Fetch schools to manage per-school overrides
    const fetchSchools = async () => {
      try {
        const response = await fetch('/api/manage-organizations/schools');
        if (response.ok) {
          const data = await response.json();
          setSchools(data.schools);
        }
      } catch (err) {
        console.error('Failed to fetch schools:', err);
      }
    };
    fetchSchools();
  }, []);

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setName(initialData.name);
      setDescription(initialData.description);
      setEnabled(initialData.enabled);
      setDefaultEnabled(initialData.defaultEnabled);
      setEnabledForSchools(initialData.enabledForSchools || {});
    } else {
      setId('');
      setName('');
      setDescription('');
      setEnabled(false);
      setDefaultEnabled(false);
      setEnabledForSchools({});
    }
  }, [initialData?.id]); // Changed dependency to initialData?.id

  const handleSchoolToggle = (schoolId: string, isChecked: boolean) => {
    setEnabledForSchools((prev) => ({
      ...prev,
      [schoolId]: isChecked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const method = initialData ? 'PUT' : 'POST'; // Use PUT for edit, POST for new
      const response = await fetch('/api/feature-management', {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          name,
          description,
          enabled,
          defaultEnabled,
          enabledForSchools,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save feature flag');
      }

      setSuccess(`Feature flag '${name}' saved successfully!`);
      onFlagUpserted(); // Notify parent to refresh list
      if (!initialData) {
        // Clear form for new entry after successful submission
        setId('');
        setName('');
        setDescription('');
        setEnabled(false);
        setDefaultEnabled(false);
        setEnabledForSchools({});
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">{initialData ? 'Edit Feature Flag' : 'Create New Feature Flag'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="flagId" className="block text-sm font-medium text-gray-700">Feature ID (Unique)</label>
          <input
            type="text"
            id="flagId"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            disabled={!!initialData} // Disable ID field if editing existing flag
          />
        </div>
        <div>
          <label htmlFor="flagName" className="block text-sm font-medium text-gray-700">Feature Name</label>
          <input
            type="text"
            id="flagName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="flagDescription" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="flagDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              id="enabledGlobal"
              name="enabledOption"
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="enabledGlobal" className="ml-2 block text-sm text-gray-900">Globally Enabled</label>
          </div>
          <div className="flex items-center">
            <input
              id="defaultEnabled"
              name="defaultEnabledOption"
              type="checkbox"
              checked={defaultEnabled}
              onChange={(e) => setDefaultEnabled(e.target.checked)}\
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"\
            />
            <label htmlFor="defaultEnabled" className="ml-2 block text-sm text-gray-900">Default Enabled for New Schools</label>
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Enable/Disable Per School (Overrides Global)</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto border p-4 rounded-md">
          {schools.length === 0 ? (
            <p className="text-gray-600">No schools available to configure.</p>
          ) : (
            schools.map((school) => (
              <div key={school.id} className="flex items-center justify-between py-1 border-b last:border-b-0">
                <span className="text-sm font-medium text-gray-800">{school.name}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    checked={!!enabledForSchools[school.id]}
                    onChange={(e) => handleSchoolToggle(school.id, e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-['''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{enabledForSchools[school.id] ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>
            ))
          )}
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mt-4">{success}</p>}
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Feature Flag'}
        </button>
      </form>
    </div>
  );
};

export default FeatureFlagForm;
