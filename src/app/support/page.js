'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../components/Layout';
import ContactForm from '../../components/ContactForm';

export default function Support() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmitSuccess = () => {
    setSubmitted(true);
    // Reset after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-800">Contact Support</h1>
            <p className="text-sm text-gray-600 mt-1">
              Need help with your invoice generator? We&apos;re here to assist you.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              You can also visit our{' '}
              <Link href="/help" className="text-blue-600 hover:text-blue-800">
                Help Center
              </Link>{' '}
              for guides, tutorials, and frequently asked questions.
            </p>
          </div>

          <div className="p-6">
            {submitted ? (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">
                      Your message has been sent successfully. We&apos;ll get back to you as soon as possible.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <ContactForm onSubmitSuccess={handleSubmitSuccess} userEmail={session?.user?.email} />
            )}

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Other Ways to Get Help</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <svg className="h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-md font-medium text-gray-900">Email Support</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    For urgent inquiries, you can email us directly at{' '}
                    <a href="mailto:support@invoicegenerator.com" className="text-blue-600 hover:text-blue-800">
                      support@invoicegenerator.com
                    </a>
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <svg className="h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-md font-medium text-gray-900">FAQ</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Find answers to common questions in our FAQ section.
                    <Link href="/faq" className="block mt-2 text-blue-600 hover:text-blue-800">
                      View FAQ
                    </Link>
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <svg className="h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="text-md font-medium text-gray-900">Documentation</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Check our documentation for detailed guides on using the invoice generator.
                    <span className="block mt-2 text-blue-600 hover:text-blue-800 cursor-pointer">
                      Coming soon...
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
