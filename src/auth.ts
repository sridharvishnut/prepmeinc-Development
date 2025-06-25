import { app } from './firebaseUtils';
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithRedirect,
  signInAnonymously,
  signOut,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  Auth
} from 'firebase/auth';

let clientAuthInstance: Auth | null = null;

export const getClientAuth = (): Auth | null => {
  if (typeof window === "undefined") {
    // On the server, return null gracefully. react-firebase-hooks can handle this.
    return null;
  }

  if (!clientAuthInstance) {
    try {
      clientAuthInstance = getAuth(app);
    } catch (e) {
      console.log("Firebase Auth: No existing auth instance, initializing a new one.");
      clientAuthInstance = initializeAuth(app, {
        persistence: browserLocalPersistence,
      });
    }

    if (process.env.NODE_ENV === "development" && clientAuthInstance) {
      try {
        (clientAuthInstance.settings as any).appVerificationDisabledForTesting = true;
        console.log("Firebase Auth: appVerificationDisabledForTesting is set to true for development.");
      } catch (e) {
        console.warn("auth.settings not available or failed to set test mode (likely not using emulator or unexpected state)", e);
      }
    }
  }

  // After initialization attempts, if still null, throw or handle as appropriate
  // For react-firebase-hooks, returning null here is fine for SSR.
  console.log("Auth instance retrieved by getClientAuth:", clientAuthInstance);
  return clientAuthInstance;
};

export const signInWithGmail = async () => {
  const auth = getClientAuth();
  if (!auth) throw new Error("Auth not initialized for sign-in.");
  const provider = new GoogleAuthProvider();
  try {
    await signInWithRedirect(auth, provider);
    console.log('Initiated Gmail Sign-in with redirect.');
  } catch (error: any) {
    console.error('❌ Gmail login error (redirect flow):', error.code, error.message);
    throw error;
  }
};

export const sendEmailLink = async (email: string, redirectUrl: string) => {
  const auth = getClientAuth();
  if (!auth) throw new Error("Auth not initialized for sending email link.");
  const actionCodeSettings = {
    url: redirectUrl,
    handleCodeInApp: true,
  };
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    console.log('✅ Sign-in link sent to:', email);
  } catch (error: any) {
    console.error('❌ Error sending sign-in link:', error.code, error.message);
    throw error;
  }
};

export const completeSignInWithEmailLink = async (email: string, emailLink: string) => {
  const auth = getClientAuth();
  if (!auth) throw new Error("Auth not initialized for completing email link sign-in.");

  if (!isSignInWithEmailLink(auth, emailLink)) {
    throw new Error("Invalid email link.");
  }
  try {
    const result = await signInWithEmailLink(auth, email, emailLink);
    window.localStorage.removeItem('emailForSignIn');
    console.log('✅ Signed in with email link:', result.user);
    return result;
  } catch (error: any) {
    console.error('❌ Error signing in with email link:', error.code, error.message);
    throw error;
  }
};

export const signInAsGuest = async () => {
  const auth = getClientAuth();
  if (!auth) throw new Error("Auth not initialized for guest sign-in.");
  try {
    const result = await signInAnonymously(auth);
    console.log('Guest User UID for admin setup:', result.user.uid);
    return result;
  } catch (error) {
    console.error('Error signing in as guest:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  const auth = getClientAuth();
  if (!auth) throw new Error("Auth not initialized for sign out.");
  try {
    await signOut(auth);
    console.log('✅ User signed out successfully');
  } catch (error: any) {
    console.error('❌ Sign out error:', error.code, error.message);
    throw error;
  }
};
