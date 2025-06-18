'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import UserProfile from './UserProfile';

const Navbar = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = status === 'authenticated';

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation items for authenticated users
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/invoices', label: 'Invoices', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { href: '/clients', label: 'Clients', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { href: '/business-profiles', label: 'Profiles', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { href: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { href: '/help', label: 'Help', icon: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1a1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z' },
  ];

  // Check if a path is active
  const isActive = (href) => {
    if (href === pathname) return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100'
          : 'bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Logo */}
          <div className="flex items-center">
              <Link
                href="/"
              className="flex items-center space-x-3 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200"
              >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent font-semibold">
                Invoice Generator
              </span>
              </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            {isAuthenticated ? (
              <>
                {navItems.slice(0, 5).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative
                      ${isActive(item.href)
                        ? 'text-blue-600 bg-blue-50 shadow-sm'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`mr-2 h-4 w-4 transition-colors duration-200 ${
                        isActive(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.label}
                    {isActive(item.href) && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>
                ))}
              </>
            ) : (
              <div className="flex items-center space-x-1">
                <Link
                  href="/"
                  className={`
                    group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${pathname === '/'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`mr-2 h-4 w-4 transition-colors duration-200 ${
                      pathname === '/' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Home
                </Link>
                <a
                  href="#features"
                  className="group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Features
                </a>
                <a
                  href="#faq"
                  className="group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  FAQ
                </a>
              </div>
            )}
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* New Invoice Button */}
                <Link
                  href="/invoices/new"
                  className="hidden md:flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Invoice
                </Link>

                {/* User Profile */}
                <div className="hidden sm:block">
                  <UserProfile />
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={() => signOut()}
                  className="hidden md:flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign out
                </button>
              </>
            ) : (
              <>
                {/* Sign In Button */}
                <Link
                  href="/auth/signin"
                  className="hidden md:flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign In
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                aria-expanded="false"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg
                    className="block h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-lg">
          <div className="pt-4 pb-6 space-y-2 px-4">
            {isAuthenticated ? (
              <>
                {/* New Invoice Button - Mobile */}
                <Link
                  href="/invoices/new"
                  className="flex items-center justify-center w-full py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg mb-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Invoice
                </Link>

                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive(item.href)
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`mr-3 h-5 w-5 ${
                        isActive(item.href) ? 'text-blue-500' : 'text-gray-400'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.label}
                  </Link>
                ))}

                {/* Mobile Sign Out */}
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full py-3 px-4 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 mt-4 border-t border-gray-100 pt-6"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className={`
                    flex items-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200
                    ${pathname === '/'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`mr-3 h-5 w-5 ${
                      pathname === '/' ? 'text-blue-500' : 'text-gray-400'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Home
                </Link>
                <a
                  href="#features"
                  className="flex items-center py-3 px-4 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-3 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Features
                </a>
                <a
                  href="#faq"
                  className="flex items-center py-3 px-4 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-3 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  FAQ
                </a>

                {/* Mobile Sign In */}
                <Link
                  href="/auth/signin"
                  className="flex items-center justify-center w-full py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg mt-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
