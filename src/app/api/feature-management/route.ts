// src/app/api/feature-management/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  upsertFeatureFlag,
  getFeatureFlagById,
  getAllFeatureFlags,
  // deleteFeatureFlag, // Optional, if you decide to implement delete
} from '@/lib/featureManagementService';

/**
 * Feature ID: MO-049-API
 * Feature Name: Feature Management API Endpoints - GET (List/Get By ID)
 * What it does: Handles GET requests for retrieving feature flag data (list all or by ID).
 * Description: If an 'id' query parameter is provided, it fetches a specific feature flag; otherwise, it returns all feature flags.
 * Current Module Implemented: src/app/api/feature-management
 * Module to be implemented: Frontend for Feature Management Page.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const featureFlag = await getFeatureFlagById(id);
      if (featureFlag) {
        return NextResponse.json({ featureFlag }, { status: 200 });
      } else {
        return NextResponse.json({ message: 'Feature flag not found' }, { status: 404 });
      }
    } else {
      const featureFlags = await getAllFeatureFlags();
      return NextResponse.json({ featureFlags }, { status: 200 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('API Error (GET /feature-management):', error);
    return NextResponse.json({ message: errorMessage || 'Failed to retrieve feature flags' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-049-API
 * Feature Name: Feature Management API Endpoints - POST/PUT (Upsert Feature Flag)
 * What it does: Handles POST requests for creating or updating a feature flag.
 * Description: Receives feature flag data from the request body and uses the featureManagementService to upsert (insert or update) it in the database. This endpoint can act as both POST and PUT for simplicity.
 * Current Module Implemented: src/app/api/feature-management
 * Module to be implemented: Frontend for Feature Flag Form.
 */
export async function POST(request: NextRequest) {
  try {
    const featureFlagData = await request.json();
    if (!featureFlagData.id || !featureFlagData.name || typeof featureFlagData.enabled !== 'boolean') {
      return NextResponse.json({ message: 'Missing required feature flag fields (id, name, enabled)' }, { status: 400 });
    }
    const upsertedFeatureFlag = await upsertFeatureFlag(featureFlagData);
    return NextResponse.json({ featureFlag: upsertedFeatureFlag }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('API Error (POST /feature-management):', error);
    return NextResponse.json({ message: errorMessage || 'Failed to upsert feature flag' }, { status: 500 });
  }
}

// You could add a PUT method explicitly if you prefer strict REST semantics
export async function PUT(request: NextRequest) {
  return POST(request); // For simplicity, re-use POST logic for PUT (upsert)
}

/*
// Example for a DELETE endpoint if needed later:
export async function DELETE(request: NextRequest) {
  try {
    const { id }: { id: string } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Feature flag ID is required for deletion' }, { status: 400 });
    }
    // await deleteFeatureFlag(id);
    return NextResponse.json({ message: 'Feature flag deleted successfully (not implemented)' }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('API Error (DELETE /feature-management):', error);
    return NextResponse.json({ message: errorMessage || 'Failed to delete feature flag' }, { status: 500 });
  }
}
*/
