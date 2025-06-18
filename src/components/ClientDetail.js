'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getClientById, getClientPaymentHistory, deleteClient } from '../services/clientService';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ClientDetail = ({ clientId }) => {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch client data and payment history
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch client details
        const clientData = await getClientById(clientId);
        if (!clientData) {
          setError('Client not found');
          return;
        }
        setClient(clientData);

        // Fetch payment history
        const history = await getClientPaymentHistory(clientId);
        if (history) {
          setPaymentHistory(history);
        }
      } catch (err) {
        setError('Error loading client data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  // Handle client deletion
  const handleDelete = async () => {
    try {
      const result = await deleteClient(clientId);
      
      if (result.success) {
        router.push('/clients');
        router.refresh();
      } else {
        alert('Failed to delete client: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('An error occurred while deleting the client');
    }
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Chart options and data
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Invoice & Payment History',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value, 'USD');
          }
        }
      }
    }
  };

  const getChartData = () => {
    if (!paymentHistory || !paymentHistory.monthlyData) {
      return {
        labels: [],
        datasets: []
      };
    }

    return {
      labels: paymentHistory.monthlyData.map(d => d.month),
      datasets: [
        {
          label: 'Invoiced',
          data: paymentHistory.monthlyData.map(d => d.invoiced),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
        },
        {
          label: 'Paid',
          data: paymentHistory.monthlyData.map(d => d.paid),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
        }
      ]
    };
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-base font-medium text-gray-900">{error}</h3>
          <div className="mt-6">
            <Link
              href="/clients"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Clients
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 font-medium text-lg">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{client.name}</h2>
              {client.email && <p className="text-gray-600">{client.email}</p>}
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link
              href={`/clients/${clientId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </Link>
            <Link
              href={`/invoices/new?client=${clientId}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Invoice
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Client Details */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Contact Information</h3>
          <div className="space-y-3">
            {client.phone && (
              <div className="flex items-start">
                <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-gray-600">{client.phone}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-start">
                <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-gray-600">{client.email}</span>
              </div>
            )}
            {(client.address || client.city || client.state || client.postalCode || client.country) && (
              <div className="flex items-start">
                <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div className="text-gray-600">
                  {client.address && <div>{client.address}</div>}
                  <div>
                    {client.city && <span>{client.city}</span>}
                    {client.state && <span>{client.city ? ', ' : ''}{client.state}</span>}
                    {client.postalCode && <span> {client.postalCode}</span>}
                  </div>
                  {client.country && <div>{client.country}</div>}
                </div>
              </div>
            )}
            {client.taxId && (
              <div className="flex items-start">
                <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600">Tax ID: {client.taxId}</span>
              </div>
            )}
          </div>

          {client.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Notes</h3>
              <p className="text-gray-600 whitespace-pre-line">{client.notes}</p>
            </div>
          )}
        </div>

        <div className="col-span-2">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Summary</h3>
          
          {paymentHistory ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Invoiced</p>
                  <p className="text-xl font-bold text-gray-800">
                    {formatCurrency(paymentHistory.stats.totalInvoiced)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Paid</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(paymentHistory.stats.totalPaid)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {formatCurrency(paymentHistory.stats.totalPending)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Overdue</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(paymentHistory.stats.totalOverdue)}
                  </p>
                </div>
              </div>

              <div className="h-64 mb-6">
                <Bar options={chartOptions} data={getChartData()} />
              </div>

              <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Invoices</h3>
              {paymentHistory.recentInvoices && paymentHistory.recentInvoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentHistory.recentInvoices.map((invoice) => (
                        <tr key={invoice._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <Link href={`/invoices/${invoice._id}`} className="text-blue-600 hover:text-blue-900">
                              {invoice.invoiceNumber || 'No Number'}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(invoice.issueDate || invoice.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(invoice.total || 0, invoice.currency || 'USD')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                              {invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No invoices found for this client.</p>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No payment history available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete {client.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
