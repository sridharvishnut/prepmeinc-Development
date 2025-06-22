// src/components/feature-management/FeatureFlagList.tsx

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { School } from '../../types/manage-organizations'; // Assuming School type is still needed for context

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  enabledForSchools: { [key: string]: boolean };
  defaultEnabled: boolean;
}

interface FeatureFlagListProps {
  refreshTrigger: number;
  onEditFlag: (flag: FeatureFlag) => void;
}

/**
 * Feature ID: MO-051-FE
 * Feature Name: Frontend Component - Feature Flag List
 * What it does: Displays a list of all configured feature flags and allows initiating edit operations.
 * Description: Fetches all feature flags from the API and presents them in a table. Includes options to view details and trigger the edit form.
 * Current Module Implemented: src/components/feature-management
 * Module to be implemented: (None - core component)
 */
const FeatureFlagList: React.FC<FeatureFlagListProps> = ({ refreshTrigger, onEditFlag }) => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [schools, setSchools] = useState<School[]>([]); // To display school names for overrides
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatureFlags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/feature-management');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch feature flags');
      }
      const data = await response.json();
      setFeatureFlags(data.featureFlags);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching feature flags.');
      setFeatureFlags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSchools = useCallback(async () => {
    try {
      const response = await fetch('/api/manage-organizations/schools');
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools);
      }
    } catch (error) {
      console.error('Failed to fetch schools for feature flag list:', error);
    }
  }, []);

  useEffect(() => {
    fetchFeatureFlags();
    fetchSchools();
  }, [fetchFeatureFlags, fetchSchools, refreshTrigger]);

  if (loading) {
    return <div className="text-center py-4">Loading feature flags...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Existing Feature Flags</h2>
      {featureFlags.length === 0 ? (
        <p className="text-gray-600">No feature flags defined yet. Create one using the form above.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Global Enabled</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Enabled</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Per-School Overrides</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {featureFlags.map((flag) => (
                <tr key={flag.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{flag.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{flag.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                      flag.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {flag.enabled ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                      flag.defaultEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {flag.defaultEnabled ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {
                      Object.keys(flag.enabledForSchools).length === 0 ? (
                        'None'
                      ) : (
                        <ul>
                          {Object.entries(flag.enabledForSchools).map(([schoolId, enabledStatus]) => {
                            const schoolName = schools.find(s => s.id === schoolId)?.name || `Unknown School (${schoolId})`;
                            return (
                              <li key={schoolId}>
                                {schoolName}: 
                                <span className={`font-semibold ${
                                  enabledStatus ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {enabledStatus ? 'Enabled' : 'Disabled'}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEditFlag(flag)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
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

export default FeatureFlagList;
