"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signOutUser } from '@/auth'; // Corrected path using alias
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();
  const adminEmail = 'vishnusridhar.tpm@gmail.com'; // The specified admin email

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        console.log("Logged in user email:", user.email);
        if (user.email === adminEmail) {
          setIsAdminUser(true);
        } else {
          setIsAdminUser(false);
        }
      } else {
        setIsAdminUser(false);
        router.push('/login'); // Redirect to login page if no user is logged in
      }
    });

    return () => unsubscribe();
  }, [router]); // Add router to the dependency array

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/login'); // Redirect to login page after sign out
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
    { name: 'Admin', href: '/admin', isAdmin: true }, // Mark Admin for conditional rendering
    { name: 'Support & Our Promise', href: '/support' },
  ];

  if (!currentUser) {
    return null; // Render nothing while redirecting
  }

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
