'use client';
import { useState, useEffect } from 'react';
import {
  signInWithGmail,
  sendEmailLink,
  completeSignInWithEmailLink,
  signInAsGuest,
  getClientAuth
} from '@/auth';
import { useRouter } from 'next/navigation';
import { isSignInWithEmailLink, Auth, UserCredential } from 'firebase/auth'; 

export default function LoginPage() {
  const router = useRouter();

  // State for Email Link login
  const [email, setEmail] = useState<string>('');
  const [emailSent, setEmailSent] = useState<boolean>(false);

  // General UI state
  const [error, setError] = useState<string | null>(null);
  const [isVerifyingEmailLink, setIsVerifyingEmailLink] = useState<boolean>(false);

  // Effect to handle incoming email link sign-in and initial auth state check
  useEffect(() => {
    if (typeof window === 'undefined') return; // Ensure client-side execution

    let authInstance: Auth | null = null;
    try {
      authInstance = getClientAuth();
    } catch (e) {
      console.error("Auth not available in LoginPage useEffect, likely SSR or very early render:", e);
      return; // Can't proceed with auth operations without a valid auth instance
    }

    const currentUrl = window.location.href;

    // 1. Handle incoming email sign-in link
    if (currentUrl && typeof currentUrl === 'string' && isSignInWithEmailLink(authInstance, currentUrl)) {
      setIsVerifyingEmailLink(true);
      const storedEmail = window.localStorage.getItem('emailForSignIn');

      if (!storedEmail) {
        setError('No email found for sign-in. Please try sending the link again.');
        setIsVerifyingEmailLink(false);
        return;
      }

      completeSignInWithEmailLink(storedEmail, currentUrl)
        .then((result) => { 
          // Cast result to any to access additionalUserInfo, which might be missing in some UserCredential type definitions
          const signInResult = result as any; 
          if (signInResult && signInResult.operationType === 'signIn' && signInResult.additionalUserInfo?.isNewUser) {
            router.push('/signup');
          } else {
            router.push('/');
          }
        })
        .catch((err) => {
          setError(`Error signing in with email link: ${err.message}`);
          console.error('Error signing in with email link:', err);
          setIsVerifyingEmailLink(false);
        });
    } else {
      // 2. Listen for auth state changes for general redirection for already logged-in users
      const unsubscribe = authInstance.onAuthStateChanged((user) => {
        if (user) {
          router.push('/');
        }
      });
      return () => unsubscribe();
    }
  }, [router]);

  const handleGmailSignIn = async () => {
    setError(null);
    try {
      const result = await signInWithGmail();
      // Cast result to any to access additionalUserInfo, which might be missing in some UserCredential type definitions
      const signInResult = result as any;
      if (signInResult && signInResult.operationType === 'signIn' && signInResult.additionalUserInfo?.isNewUser) {
        router.push('/signup');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('Gmail login failed.');
      console.error('Gmail login failed:', err);
    }
  };

  const handleSendEmailLink = async () => { // Correctly defined function
    setError(null);
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    try {
      const redirectUrl = window.location.href;
      await sendEmailLink(email, redirectUrl);
      setEmailSent(true);
    } catch (err) {
      setError('Error sending email link.');
      console.error('Error sending email link:', err);
    }
  };

  const handleGuestSignIn = async () => {
    setError(null);
    try {
      const result = await signInAsGuest();
      // Cast result to any to access additionalUserInfo, which might be missing in some UserCredential type definitions
      const signInResult = result as any;
      if (signInResult && signInResult.operationType === 'signIn' && signInResult.additionalUserInfo?.isNewUser) {
        router.push('/signup');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('Guest login failed.');
      console.error('Guest login failed:', err);
    }
  };

  if (isVerifyingEmailLink) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <p className="text-xl font-medium text-gray-900">Verifying email link...</p>
        {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Login to Prepmeinc
        </h2>
        {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

        <div className="mt-8 space-y-4">
          <button
            onClick={handleGmailSignIn}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
          >
            <img src="/google_logo.svg" alt="Google Logo" className="h-5 w-5 mr-2" />
            Sign in with Google
          </button>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400">Or continue with</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Email Link Login</h3>
            {emailSent ? (
              <p className="text-sm text-green-600">
                A sign-in link has been sent to {email}. Please check your inbox and click the link to complete login.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  onClick={handleSendEmailLink}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-300"
                >
                  Send Login Link
                </button>
              </div>
            )}
          </div>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400">Or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div>
            <button
              onClick={handleGuestSignIn}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300"
            >
              Sign in as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
