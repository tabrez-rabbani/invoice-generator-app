'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getClients, deleteClient } from '../services/clientService';
import ImportClients from './ImportClients';
import { downloadCSV, downloadExcel } from '../utils/exportImportUtils';

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setExportMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const data = await getClients();
        setClients(data);
        setFilteredClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Filter clients when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(term) ||
      (client.email && client.email.toLowerCase().includes(term)) ||
      (client.phone && client.phone.toLowerCase().includes(term)) ||
      (client.city && client.city.toLowerCase().includes(term)) ||
      (client.country && client.country.toLowerCase().includes(term))
    );

    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  // Handle client deletion
  const handleDelete = async (id) => {
    try {
      const result = await deleteClient(id);

      if (result.success) {
        // Remove client from state
        setClients(prev => prev.filter(client => client._id !== id));
        setFilteredClients(prev => prev.filter(client => client._id !== id));
        setDeleteConfirmation(null);
      } else {
        alert('Failed to delete client: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('An error occurred while deleting the client');
    }
  };

  // Format address for display
  const formatAddress = (client) => {
    const parts = [];
    if (client.city) parts.push(client.city);
    if (client.state) parts.push(client.state);
    if (client.country) parts.push(client.country);

    return parts.join(', ') || 'No address';
  };

  // Handle client import success
  const handleImportSuccess = (results) => {
    // Refresh client list
    const fetchClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
        setFilteredClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
    setShowImportModal(false);
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    if (!filteredClients.length) {
      alert('No clients to export');
      return;
    }

    const headers = [
      { title: 'Name', key: 'name' },
      { title: 'Email', key: 'email' },
      { title: 'Phone', key: 'phone' },
      { title: 'Address', key: 'address' },
      { title: 'City', key: 'city' },
      { title: 'State', key: 'state' },
      { title: 'PostalCode', key: 'postalCode' },
      { title: 'Country', key: 'country' },
      { title: 'TaxId', key: 'taxId' },
      { title: 'Notes', key: 'notes' }
    ];

    downloadCSV(filteredClients, headers, 'clients-export.csv');
    setExportMenuOpen(false);
  };

  // Handle export to Excel
  const handleExportExcel = () => {
    if (!filteredClients.length) {
      alert('No clients to export');
      return;
    }

    const headers = [
      { title: 'Name', key: 'name' },
      { title: 'Email', key: 'email' },
      { title: 'Phone', key: 'phone' },
      { title: 'Address', key: 'address' },
      { title: 'City', key: 'city' },
      { title: 'State', key: 'state' },
      { title: 'PostalCode', key: 'postalCode' },
      { title: 'Country', key: 'country' },
      { title: 'TaxId', key: 'taxId' },
      { title: 'Notes', key: 'notes' }
    ];

    downloadExcel(filteredClients, headers, 'clients-export.csv');
    setExportMenuOpen(false);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header with search and add button */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
            Clients
          </h2>
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 border border-gray-300 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex space-x-3">
              {/* Export Button with Dropdown */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Export
                </button>

                {/* Export Dropdown Menu */}
                {exportMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="export-menu">
                      <button
                        onClick={handleExportCSV}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Export as CSV
                      </button>
                      <button
                        onClick={handleExportExcel}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Export as Excel-compatible CSV
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Import Button */}
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" transform="rotate(180, 10, 10)" />
                </svg>
                Import
              </button>

              {/* Add Client Button */}
              <Link
                href="/clients/new"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Client
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Empty state */}
          {clients.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No clients</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new client.</p>
              <div className="mt-6">
                <Link
                  href="/clients/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Client
                </Link>
              </div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No clients match your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-lg">
                              {client.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              <Link href={`/clients/${client._id}`} className="hover:text-blue-600">
                                {client.name}
                              </Link>
                            </div>
                            {client.taxId && (
                              <div className="text-sm text-gray-500">
                                Tax ID: {client.taxId}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {client.email && (
                          <div className="text-sm text-gray-900">{client.email}</div>
                        )}
                        {client.phone && (
                          <div className="text-sm text-gray-500">{client.phone}</div>
                        )}
                        {!client.email && !client.phone && (
                          <div className="text-sm text-gray-500">No contact info</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatAddress(client)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/clients/${client._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </Link>
                          <Link
                            href={`/clients/${client._id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmation(client._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this client? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmation)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import clients modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">Import Clients</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ImportClients onSuccess={handleImportSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsList;
