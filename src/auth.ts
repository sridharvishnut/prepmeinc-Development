import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential, PhoneAuthProvider, signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult, signInAnonymously, signOut } from 'firebase/auth';
import { firebaseConfig } from '../firebaseConfig'; // Corrected path to firebaseConfig

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Export auth to be used in components

// Gmail Sign-in function
export const signInWithGmail = async (): Promise<UserCredential | null> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    // The signed-in user info.
    const user = result.user;
    console.log("Gmail sign-in successful:", user);
    return result;
  } catch (error: any) {
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData?.email;
    const credential = GoogleAuthProvider.credentialFromError(error);

    console.error("Error during Gmail sign-in:", errorCode, errorMessage, email, credential);
    return null;
  }
};

// --- Phone Number (OTP) Sign-in ---
let recaptchaVerifier: RecaptchaVerifier | null = null;

export const setUpRecaptcha = (containerId: string) => {
  if (typeof window !== 'undefined' && !recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      'size': 'invisible',
      'callback': (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("reCAPTCHA solved:", response);
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        console.log("reCAPTCHA expired.");
      }
    });
    recaptchaVerifier.render();
  }
};

export const signInWithPhone = async (phoneNumber: string): Promise<ConfirmationResult | null> => {
  if (!recaptchaVerifier) {
    console.error("reCAPTcha verifier not initialized.");
    return null;
  }
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    console.log("OTP sent successfully!");
    return confirmationResult;
  } catch (error: any) {
    console.error("Error sending OTP:", error.code, error.message);
    // Handle specific errors like 'auth/too-many-requests'
    return null;
  }
};

export const verifyOtp = async (confirmationResult: ConfirmationResult, otp: string): Promise<UserCredential | null> => {
    try {
        const result = await confirmationResult.confirm(otp);
        console.log("Phone sign-in successful:", result.user);
        return result;
    } catch (error: any) {
        console.error("Error verifying OTP:", error.code, error.message);
        // Handle specific errors like 'auth/invalid-verification-code'
        return null;
    }
};

// --- Guest (Anonymous) Sign-in ---
export const signInAsGuest = async (): Promise<UserCredential | null> => {
  try {
    const result = await signInAnonymously(auth);
    console.log("Guest sign-in successful:", result.user);
    return result;
  } catch (error: any) {
    console.error("Error during Guest sign-in:", error.code, error.message);
    return null;
  }
};

// --- Sign Out ---
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("User signed out successfully.");
  } catch (error: any) {
    console.error("Error during sign out:", error.code, error.message);
    throw error; // Re-throw to be handled by the calling component
  }
};
