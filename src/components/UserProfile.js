'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function UserProfile() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  if (status === 'loading') {
    return (
      <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse border-2 border-gray-100"></div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
          />
        </svg>
        Sign in
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center space-x-2 focus:outline-none group"
        onClick={toggleDropdown}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200 hidden md:block">
          {session.user.name}
        </span>
        <div className={`h-9 w-9 rounded-full overflow-hidden border-2 ${isDropdownOpen ? 'border-blue-500' : 'border-transparent group-hover:border-blue-300'} transition-all duration-200`}>
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={36}
              height={36}
              className="h-full w-full object-cover"
              loading="eager" // Load user avatar eagerly as it's above the fold
              priority={true} // Give high priority to user avatar
              fetchPriority="high" // Browser hint for resource priority
              sizes="36px" // Exact size needed
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white">
              {session.user.name ? session.user.name[0].toUpperCase() : 'U'}
            </div>
          )}
        </div>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-3 w-64 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50 transform transition-all duration-200 origin-top-right">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
            <p className="text-xs text-gray-500 truncate mt-1">{session.user.email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setIsDropdownOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <Link
              href="/invoices"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setIsDropdownOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Invoices
            </Link>
            <Link
              href="/clients"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setIsDropdownOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Clients
            </Link>
            <Link
              href="/business-profiles"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setIsDropdownOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Business Profiles
            </Link>
          </div>

          <div className="py-1 border-t border-gray-100">
            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setIsDropdownOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
