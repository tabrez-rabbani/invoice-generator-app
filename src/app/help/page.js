'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../components/Layout';

export default function HelpCenter() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect to home if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will be redirected)
  if (status === 'unauthenticated') {
    return null;
  }

  // Help center resources
  const resources = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of using Invoice Generator',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      links: [
        { text: 'Create your first invoice', url: '/help/guides/first-invoice', comingSoon: true },
        { text: 'Set up your business profile', url: '/business-profiles', comingSoon: false },
        { text: 'Add clients', url: '/clients', comingSoon: false },
        { text: 'Customize invoice settings', url: '/settings', comingSoon: false },
      ]
    },
    {
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      links: [
        { text: 'Browse all FAQs', url: '/faq', comingSoon: false },
        { text: 'General FAQ', url: '/faq', comingSoon: false },
        { text: 'Invoices FAQ', url: '/faq', comingSoon: false },
        { text: 'Clients FAQ', url: '/faq', comingSoon: false },
        { text: 'Payments FAQ', url: '/faq', comingSoon: false },
      ]
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      links: [
        { text: 'Creating invoices', url: '/help/videos/creating-invoices', comingSoon: true },
        { text: 'Managing clients', url: '/help/videos/managing-clients', comingSoon: true },
        { text: 'Tracking payments', url: '/help/videos/tracking-payments', comingSoon: true },
        { text: 'Customizing templates', url: '/help/videos/customizing-templates', comingSoon: true },
      ]
    },
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
      links: [
        { text: 'Contact our support team', url: '/support', comingSoon: false },
        { text: 'Email support', url: 'mailto:support@invoicegenerator.com', comingSoon: false },
        { text: 'Live chat support', url: '/support', comingSoon: true },
        { text: 'Check system status', url: '/help/system-status', comingSoon: true },
      ]
    }
  ];

  // Filter resources based on search query
  const filteredResources = searchQuery
    ? resources.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.links.some(link => link.text.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : resources;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-10 sm:px-10 sm:py-14">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Help Center</h1>
            <p className="mt-3 text-blue-100 text-lg">
              Find answers, learn how to use Invoice Generator, and get help when you need it.
            </p>

            {/* Search bar */}
            <div className="mt-8 max-w-xl mx-auto">
              <div className="relative rounded-xl shadow-xl overflow-hidden border-2 border-white">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg
                    className="h-7 w-7 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-14 pr-5 py-5 bg-blue-600 bg-opacity-50 text-white placeholder-white text-lg font-medium rounded-xl"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <p className="mt-3 text-sm text-white text-center">Type keywords to find answers to your questions</p>
            </div>
          </div>

          {/* Resources grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredResources.map((resource, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-5 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-500 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={resource.icon} />
                      </svg>
                      <h2 className="text-lg font-medium text-gray-900">{resource.title}</h2>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{resource.description}</p>
                  </div>
                  <div className="p-5">
                    <ul className="space-y-3">
                      {resource.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          {link.comingSoon ? (
                            <div className="flex items-center text-sm text-gray-500">
                              <span>{link.text}</span>
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                Coming Soon
                              </span>
                            </div>
                          ) : (
                            <Link
                              href={link.url}
                              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                            >
                              <span>{link.text}</span>
                              <svg
                                className="ml-1.5 h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* No results message */}
            {searchQuery && filteredResources.length === 0 && (
              <div className="text-center py-16 px-6 bg-gray-50 rounded-lg border border-gray-200 my-6">
                <svg
                  className="mx-auto h-16 w-16 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-xl font-medium text-gray-900">No results found</h3>
                <p className="mt-2 text-base text-gray-600 max-w-md mx-auto">
                  We couldn&apos;t find any help resources matching &quot;<span className="font-semibold text-blue-600">{searchQuery}</span>&quot;.
                </p>
                <div className="mt-8">
                  <button
                    type="button"
                    className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  Try using different keywords or browse the categories below
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
