'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { getInvoiceById } from '../../../services/invoiceService';
import { formatDate, formatCurrency, getStatusColor } from '../../../utils/formatters';

export default function InvoiceDetail() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Fetch invoice when component mounts and session is available
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        if (!session) {
          // If no session, we'll let the middleware handle the redirect
          return;
        }

        const userId = session.user.id;
        const data = await getInvoiceById(id, userId);

        if (data) {
          setInvoice(data);
        } else {
          setError('Invoice not found or you do not have permission to view it');
        }
      } catch (err) {
        setError('Error fetching invoice details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id && session) {
      fetchInvoice();
    }
  }, [id, session]);

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

  const handleDownload = () => {
    // In a real app, this would generate and download the PDF
    alert('PDF download functionality would be implemented here');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-center text-gray-500">Loading invoice details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !invoice) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Invoice Not Found</h2>
              <p className="text-gray-500 mb-4">{error || 'The requested invoice could not be found.'}</p>
              <Link
                href="/invoices"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Invoices
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const statusColors = getStatusColor(invoice.status);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          {/* Header with actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Invoice {invoice.id}</h1>
              <p className="text-gray-500">
                Issued on {formatDate(invoice.issueDate)} • Due on {formatDate(invoice.dueDate)}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/invoices')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}>
              {invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'Unknown'}
            </span>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-2">From</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                {invoice.fromDetails ? (
                  invoice.fromDetails.split('\n').map((line, index) => (
                    <p key={index} className={index === 0 ? "text-gray-700" : "text-gray-500"}>
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500">No sender information available</p>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-2">Bill To</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                {invoice.toDetails ? (
                  invoice.toDetails.split('\n').map((line, index) => (
                    <p key={index} className={index === 0 ? "text-gray-700" : "text-gray-500"}>
                      {line}
                    </p>
                  ))
                ) : (
                  <div>
                    <p className="text-gray-700">{invoice.client}</p>
                    <p className="text-gray-500">No recipient details available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Invoice Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.quantity || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(item.rate || 0, invoice.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(item.amount || 0, invoice.currency)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/3">
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="text-gray-900">{formatCurrency(invoice.amount, invoice.currency)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Tax:</span>
                  <span className="text-gray-900">{formatCurrency(0, invoice.currency)}</span>
                </div>
                <div className="flex justify-between py-2 font-medium">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-blue-600">{formatCurrency(invoice.amount, invoice.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
