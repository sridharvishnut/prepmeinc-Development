'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getClientAuth, signOutUser } from '@/auth';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let authInstance: Auth | null = null; // Correct type for authInstance
    try {
      authInstance = getClientAuth(); // Get the client-side auth instance
      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        setCurrentUser(user);
        // Removed the redirect logic from here to avoid conflicts with other components
        // The main landing page or individual pages should handle redirection based on auth state
      });
      return () => unsubscribe(); // Cleanup subscription
    } catch (e) {
      console.error("Error initializing auth for UserMenu:", e);
      // If auth isn't available, we just won't show the user menu.
      // Redirection should be handled by the main app components (e.g., LandingPage)
    }
  }, []); // No router in dependency array here, as we removed router-based logic

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsDropdownOpen(false); // Close dropdown
      // The onAuthStateChanged listener on the LandingPage will handle redirection to /login
    } catch (error) {
      console.error("Failed to sign out:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  if (!currentUser) {
    return null; // Don't render anything if no user is logged in
  }

  // Determine the display name
  let displayUserName = "User";
  if (currentUser.isAnonymous) {
    displayUserName = "Guest";
  } else if (currentUser.displayName) {
    displayUserName = currentUser.displayName;
  } else if (currentUser.email) {
    displayUserName = currentUser.email;
  }

  const userInitial = displayUserName.charAt(0).toUpperCase();


  return (
    <div className="relative flex items-center space-x-2" ref={dropdownRef}>
      {/* Display user name */}
      <span className="text-gray-700 text-sm font-medium hidden sm:block">{displayUserName}</span>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold text-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="User Menu"
      >
        {userInitial}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
          <div className="block px-4 py-2 text-sm text-gray-700 truncate">
            {/* Display full email or name in dropdown */}
            {currentUser.email ? currentUser.email : displayUserName}
          </div>
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
