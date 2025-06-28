'use client';

import { useState, useEffect, Suspense, use } from 'react'; // Import use from react
import { useRouter, useSearchParams } from 'next/navigation';
import { getClientAuth } from '@/auth';
import { updateProfile, onAuthStateChanged, User, Auth } from 'firebase/auth';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = use(searchParams); // Unwrap with use()
  const initialEmail = params.get('email') || ''; // Use params instead of searchParams
  const [fullName, setFullName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let authInstance: Auth | null = null;
    try {
      authInstance = getClientAuth();
    } catch (e) {
      console.error("Firebase Auth client initialization error on signup page:", e);
      setError("Authentication service not available.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user && user.displayName && user.phoneNumber) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignupComplete = async () => {
    setError(null);
    if (!currentUser) {
      setError("No authenticated user found. Please try logging in again.");
      return;
    }

    if (!fullName) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      await updateProfile(currentUser, {
        displayName: fullName,
      });

      console.log("User profile updated:", currentUser.uid, fullName);
      router.push('/');
    } catch (err: any) {
      setError(`Error completing signup: ${err.message}`);
      console.error("Error completing signup:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <p className="text-xl font-medium text-gray-900">Loading user data...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-center text-sm text-gray-600">You need to log in first to complete your profile.</p>
          <button
            onClick={() => router.push('/login')}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Profile
        </h2>
        {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

        <div className="mt-8 space-y-4">
          <p className="text-center text-sm text-gray-600">
            Welcome! Please complete your profile to continue.\n
          </p>
          <div className="mb-4">
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              readOnly
              value={currentUser.email || initialEmail}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="fullName" className="sr-only">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="mobileNumber" className="sr-only">Mobile Number</label>
            <input
              id="mobileNumber"
              name="mobileNumber"
              type="tel"
              autoComplete="tel"
              placeholder="Mobile Number (Optional)"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <button
            onClick={handleSignupComplete}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
          >
            Complete Signup
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading signup form...</div>}>
      <SignupContent />
    </Suspense>
  );
}