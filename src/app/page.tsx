"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { getClientAuth, signOutUser } from '@/auth';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true); // New loading state
  const router = useRouter();
  const adminEmail = 'vishnusridhar.tpm@gmail.com'; // The specified admin email

  useEffect(() => {
    console.log("LandingPage useEffect: Starting auth check.");
    let authInstance: Auth | null = null;
    try {
      authInstance = getClientAuth(); // Attempt to get the auth instance
      console.log("LandingPage useEffect: getClientAuth() succeeded.", authInstance);
    } catch (e) {
      console.warn("LandingPage useEffect: getClientAuth() threw an error. This is expected during SSR/early render:", e);
      setLoadingAuth(false); // Can't determine auth state immediately, so stop loading.
      // Since authInstance is null, the onAuthStateChanged won't be set up.
      // Redirection logic should be handled by /login page when a user lands there.
      return; // Exit effect if auth instance isn't available
    }

    // Only proceed if authInstance is successfully obtained (i.e., we are client-side and auth is ready)
    if (authInstance) {
      console.log("LandingPage useEffect: Subscribing to onAuthStateChanged.");
      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        console.log("LandingPage onAuthStateChanged: User state changed.", user);
        if (user) {
          // User is logged in
          setCurrentUser(user);
          // Changed this line for clearer logging
          console.log("LandingPage onAuthStateChanged: User logged in.", user.email ? user.email : "N/A (email not available)");
          if (user.email === adminEmail) {
            setIsAdminUser(true);
          } else {
            setIsAdminUser(false);
          }
        } else {
          // User is NOT logged in
          setCurrentUser(null);
          setIsAdminUser(false);
          console.log("LandingPage onAuthStateChanged: No user logged in. Redirecting to /login.");
          router.push('/login'); // Redirect to login page
        }
        setLoadingAuth(false); // Auth state definitively resolved
      });
      return () => {
        console.log("LandingPage useEffect: Cleaning up onAuthStateChanged subscription.");
        unsubscribe(); // Cleanup subscription
      };
    } else {
      // This else block should theoretically not be hit if the catch block correctly handles errors
      // and returns early. Adding a log just in case.
      console.log("LandingPage useEffect: authInstance is null after try-catch block. Not subscribing.");
      setLoadingAuth(false); // Ensure loading is false if for some reason we get here without auth
    }
  }, [router]); // Depend only on router

  const handleSignOut = async () => {
    try {
      console.log("Attempting sign out.");
      await signOutUser();
      console.log("Sign out completed.");
      // onAuthStateChanged listener in this useEffect will handle redirection after sign out
    } catch (error) {
      console.error("Failed to sign out:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  const modules = [
    { name: 'Personal Buddy', href: '/personal-buddy' },
    { name: 'Manage Organizations', href: '/manage-organizations' },
    { name: 'Competitive Exams', href: '/competitive-exams' },
    { name: 'Pricing & Subscriptions', href: '/pricing-subscriptions' },
    { name: 'Admin', href: '/admin', isAdmin: true },
    { name: 'Support & Our Promise', href: '/support' },
  ];

  // Render loading state while checking authentication status
  if (loadingAuth) {
    console.log("LandingPage: Rendering loading state.");
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <p className="text-xl">Loading authentication status...</p>
      </div>
    );
  }

  // If not loading and no current user, it means the user is unauthenticated 
  // and redirection to /login has already been initiated by the useEffect.
  if (!currentUser) {
    console.log("LandingPage: No current user, redirecting handled by useEffect.");
    return null; // Render nothing as the redirect is happening
  }

  // If loading is complete and currentUser exists, render the main content
  console.log("LandingPage: Rendering main content for user:", currentUser.email);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Welcome to Prepmeinc</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modules.map((module) => (
          (module.isAdmin && !isAdminUser) ? null : (
            <Link href={module.href} key={module.name}>
              <div className="flex flex-col items-center justify-center w-48 h-48 rounded-full bg-blue-500 text-white text-center text-lg font-semibold shadow-lg hover:bg-blue-600 transition-colors duration-300 cursor-pointer">
                {module.name}
              </div>
            </Link>
          )
        ))}
      </div>
      {currentUser && ( // Show sign out button only if a user is logged in
        <button
          onClick={handleSignOut}
          className="mt-8 px-6 py-2 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 transition-colors duration-300"
        >
          Sign Out
        </button>
      )}
    </div>
  );
}
