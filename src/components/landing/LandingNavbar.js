'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">InvoiceGen</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
                Pricing
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
                How it Works
              </a>
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
              >
                Log In
              </button>
              <button
                onClick={() => router.push('/auth/signin')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
              <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-blue-600 text-sm font-medium">
                Features
              </a>
              <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-blue-600 text-sm font-medium">
                Pricing
              </a>
              <a href="#how-it-works" className="block px-3 py-2 text-gray-600 hover:text-blue-600 text-sm font-medium">
                How it Works
              </a>
              <button
                onClick={() => router.push('/auth/signin')}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600 text-sm font-medium"
              >
                Log In
              </button>
              <button
                onClick={() => router.push('/auth/signin')}
                className="block w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors mt-2"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 