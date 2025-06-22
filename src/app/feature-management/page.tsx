// src/app/feature-management/page.tsx

"use client";

import React, { useState } from 'react';
import FeatureFlagForm from '../../src/components/feature-management/FeatureFlagForm';
import FeatureFlagList from '../../src/components/feature-management/FeatureFlagList';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  enabledForSchools: { [key: string]: boolean };
  defaultEnabled: boolean;
}

/**
 * Feature ID: MO-052-FE
 * Feature Name: Feature Management Page
 * What it does: Provides a user interface for application administrators to manage feature flags.
 * Description: Allows creation, editing, and viewing of feature flags, including their global status and per-school overrides.
 * Current Module Implemented: src/app/feature-management
 * Module to be implemented: (None - core page)
 */
const FeatureManagementPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  const handleFlagUpserted = () => {
    setRefreshTrigger((prev) => prev + 1);
    setEditingFlag(null); // Clear editing state after upsert
  };

  const handleEditFlag = (flag: FeatureFlag) => {
    setEditingFlag(flag);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Feature Management</h1>

      <FeatureFlagForm onFlagUpserted={handleFlagUpserted} initialData={editingFlag} />

      <div className="mt-8">
        <FeatureFlagList refreshTrigger={refreshTrigger} onEditFlag={handleEditFlag} />
      </div>
    </div>
  );
};

export default FeatureManagementPage;
