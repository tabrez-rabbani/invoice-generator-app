'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import FAQItem from '../../components/FAQItem';
import Link from 'next/link';

export default function FAQ() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('general');

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

  // FAQ categories and items
  const faqData = {
    general: [
      {
        question: 'What is Invoice Generator?',
        answer: 'Invoice Generator is a web application that allows you to create, manage, and track professional invoices. It provides features like customizable invoice templates, client management, and payment tracking.'
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes, we take data security very seriously. All your data is encrypted and stored securely. We use industry-standard security practices to protect your information.'
      },
      {
        question: 'Can I use Invoice Generator on mobile devices?',
        answer: 'Yes, Invoice Generator is fully responsive and works on desktops, tablets, and mobile phones. You can create and manage invoices from any device with a web browser.'
      },
      {
        question: 'How do I get started?',
        answer: 'After signing in, you can start by creating your business profile in the Settings section. Then, add your clients in the Clients section. Once that&apos;s done, you can create your first invoice by clicking the &quot;New Invoice&quot; button in the navigation bar.'
      }
    ],
    invoices: [
      {
        question: 'How do I create a new invoice?',
        answer: 'Click on the &quot;New Invoice&quot; button in the navigation bar or go to the Invoices page and click &quot;Create New Invoice&quot;. Fill in the required information including client details, items, quantities, and prices. You can also add notes, payment terms, and due dates.'
      },
      {
        question: 'Can I customize my invoices?',
        answer: 'Yes, you can customize your invoices by adding your company logo, changing colors, and selecting different templates. You can also set default values for tax rates, payment terms, and currencies in the Settings section.'
      },
      {
        question: 'How do I download or share an invoice?',
        answer: 'Open the invoice you want to share, then click on the &quot;Download PDF&quot; button to save it as a PDF file. You can then share this file via email or any other method you prefer.'
      },
      {
        question: 'Can I track payments for my invoices?',
        answer: 'Yes, you can mark invoices as paid, partially paid, or overdue. The dashboard shows you a summary of your invoice status, and you can filter invoices by their payment status.'
      }
    ],
    clients: [
      {
        question: 'How do I add a new client?',
        answer: 'Go to the Clients page and click &quot;Add New Client&quot;. Fill in the client&apos;s details such as name, contact information, and billing address. You can also add notes and custom fields for each client.'
      },
      {
        question: 'Can I import clients from another system?',
        answer: 'Yes, you can import clients using CSV files. Go to the Clients page and look for the &quot;Import&quot; option. Follow the instructions to map your CSV columns to the appropriate fields.'
      },
      {
        question: 'How do I view a client&apos;s invoice history?',
        answer: 'Go to the Clients page, find the client you&apos;re interested in, and click on their name. This will take you to the client&apos;s detail page where you can see all invoices associated with that client.'
      }
    ],
    payments: [
      {
        question: 'What payment methods are supported?',
        answer: 'Invoice Generator allows you to specify any payment method you accept. Common methods include bank transfers, credit cards, PayPal, and checks. You can add payment instructions to your invoices.'
      },
      {
        question: 'How do I record a payment?',
        answer: 'Open the invoice that has been paid, click on &quot;Record Payment&quot;, and enter the payment details including the amount, date, and payment method. You can also add notes about the payment.'
      },
      {
        question: 'Can I generate payment receipts?',
        answer: 'Yes, after recording a payment, you can generate a payment receipt by clicking on the &quot;Generate Receipt&quot; button on the payment details page.'
      }
    ],
    account: [
      {
        question: 'How do I update my account information?',
        answer: 'Go to the Settings page and select the &quot;Account&quot; tab. Here you can update your name, email, and password. You can also manage your notification preferences.'
      },
      {
        question: 'Can I have multiple business profiles?',
        answer: 'Yes, you can create and manage multiple business profiles. Go to the Business Profiles page to add, edit, or switch between different business profiles.'
      },
      {
        question: 'How do I get help if I have a problem?',
        answer: 'If you need assistance, you can visit our Support page to contact our support team. You can also check this FAQ section for answers to common questions.'
      }
    ]
  };

  const categories = [
    { id: 'general', label: 'General' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'clients', label: 'Clients' },
    { id: 'payments', label: 'Payments' },
    { id: 'account', label: 'Account' }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-800">Frequently Asked Questions</h1>
            <p className="text-sm text-gray-600 mt-1">
              Find answers to common questions about using the Invoice Generator.
            </p>
          </div>

          {/* Category tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto py-2 px-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-4 py-2 text-sm font-medium rounded-md mr-2 whitespace-nowrap ${
                    activeCategory === category.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ items */}
          <div className="p-6">
            <div className="space-y-4">
              {faqData[activeCategory]?.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Can&apos;t find what you&apos;re looking for? Visit our{' '}
                <Link href="/help" className="text-blue-600 hover:text-blue-800">
                  Help Center
                </Link>{' '}
                for more resources or our{' '}
                <Link href="/support" className="text-blue-600 hover:text-blue-800">
                  Support page
                </Link>{' '}
                to get in touch with our team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
