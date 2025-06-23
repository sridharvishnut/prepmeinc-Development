import { db } from '../firebaseUtils';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { FeatureFlag } from '@/types/manage-organizations'; // Import FeatureFlag from central types

const featureFlagsCollectionRef = collection(db, 'featureFlags');

/**
 * Feature ID: MO-048-BE
 * Feature Name: Feature Management Backend Service - Upsert Feature Flag
 * What it does: Creates or updates a feature flag in the Firestore database.
 * Description: Allows setting global status and per-school overrides for features.
 * Current Module Implemented: Manage-Organizations (src/lib)
 * Module to be implemented: (None - core service)
 */
export const upsertFeatureFlag = async (featureFlag: FeatureFlag): Promise<FeatureFlag> => {
  try {
    const now = Date.now();
    const dataToSave: FeatureFlag = {
      ...featureFlag,
      createdAt: featureFlag.createdAt || now, // Preserve createdAt if exists, otherwise set now
      updatedAt: now,
    };
    const docRef = doc(featureFlagsCollectionRef, featureFlag.id);
    await setDoc(docRef, dataToSave, { merge: true });
    return dataToSave;
  } catch (error: unknown) { // Changed to unknown
    const errorMessage = error instanceof Error ? error.message : `Failed to upsert feature flag ${featureFlag.id}.`;
    console.error(`Error upserting feature flag ${featureFlag.id}:`, error);
    throw new Error(errorMessage);
  }
};

/**
 * Feature ID: MO-048-BE
 * Feature Name: Feature Management Backend Service - Get Feature Flag by ID
 * What it does: Retrieves a single feature flag by its ID from the Firestore database.
 * Description: Fetches a specific feature flag document from the 'featureFlags' collection.
 * Current Module Implemented: Manage-Organizations (src/lib)
 * Module to be implemented: (None - core service)
 */
export const getFeatureFlagById = async (id: string): Promise<FeatureFlag | null> => {
  try {
    const docRef = doc(db, 'featureFlags', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FeatureFlag;
    }
    return null;
  } catch (error: unknown) { // Changed to unknown
    const errorMessage = error instanceof Error ? error.message : `Failed to retrieve feature flag with ID ${id}.`;
    console.error(`Error getting feature flag with ID ${id}:`, error);
    throw new Error(errorMessage);
  }
};

/**
 * Feature ID: MO-048-BE
 * Feature Name: Feature Management Backend Service - Get All Feature Flags
 * What it does: Retrieves all feature flags from the Firestore database.
 * Description: Fetches all documents from the 'featureFlags' collection.
 * Current Module Implemented: Manage-Organizations (src/lib)
 * Module to be implemented: (None - core service)
 */
export const getAllFeatureFlags = async (): Promise<FeatureFlag[]> => {
  try {
    const q = query(featureFlagsCollectionRef);
    const querySnapshot = await getDocs(q);
    const flags: FeatureFlag[] = [];
    querySnapshot.forEach((doc) => {
      flags.push({ id: doc.id, ...doc.data() } as FeatureFlag);
    });
    return flags;
  } catch (error: unknown) { // Changed to unknown
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve all feature flags.';
    console.error('Error getting all feature flags:', error);
    throw new Error(errorMessage);
  }
};

/**
 * Feature ID: MO-048-BE
 * Feature Name: Feature Management Backend Service - Check Feature Enabled for School
 * What it does: Determines if a specific feature is enabled for a given school.
 * Description: Checks the feature flag's global status and then any specific override for the school. Per-school override takes precedence.
 * Current Module Implemented: Manage-Organizations (src/lib)
 * Module to be implemented: (None - core service, used by frontend/middleware for feature gating)
 */
export const isFeatureEnabledForSchool = async (featureId: string, schoolId: string): Promise<boolean> => {
  try {
    const flag = await getFeatureFlagById(featureId);
    if (!flag) {
      // If feature flag doesn't exist, default to disabled or a predefined state
      console.warn(`Feature flag '${featureId}' not found. Defaulting to disabled.`);
      return false; // Or return a predefined default like `flag.defaultEnabled` if you set it.
    }

    // Check per-school override first
    if (typeof flag.enabledForSchools[schoolId] === 'boolean') {
      return flag.enabledForSchools[schoolId];
    }

    // Otherwise, use global enabled status
    return flag.enabled;
  } catch (error: unknown) { // Changed to unknown
    const errorMessage = error instanceof Error ? error.message : `Error checking feature '${featureId}' for school '${schoolId}'.`;
    console.error(`Error checking feature '${featureId}' for school '${schoolId}':`, error);
    return false; // Default to false on error
  }
};

// Optionally, you might want a function to delete a feature flag if it's no longer needed.
// export const deleteFeatureFlag = async (id: string): Promise<void> => { ... };
