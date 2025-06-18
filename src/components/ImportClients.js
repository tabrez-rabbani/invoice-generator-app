'use client';

import { useState, useRef } from 'react';
import { parseCSV } from '../utils/exportImportUtils';
import { addClient } from '../services/clientService';

const ImportClients = ({ onSuccess }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState({ success: 0, failed: 0, total: 0 });
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setIsImporting(true);
    setError('');
    setShowResults(false);

    try {
      // Read the file
      const text = await readFileAsText(file);
      
      // Parse CSV
      const clients = parseCSV(text);
      
      if (!clients.length) {
        throw new Error('No valid client data found in the CSV file');
      }
      
      // Process clients
      const results = await importClients(clients);
      
      // Show results
      setImportStatus(results);
      setShowResults(true);
      
      // Call success callback if provided
      if (onSuccess && results.success > 0) {
        onSuccess(results);
      }
    } catch (err) {
      setError(err.message || 'Failed to import clients');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // Import clients
  const importClients = async (clients) => {
    let success = 0;
    let failed = 0;
    const total = clients.length;
    
    // Process each client
    for (const clientData of clients) {
      try {
        // Format client data
        const formattedClient = {
          name: clientData.name || clientData.Name || '',
          email: clientData.email || clientData.Email || '',
          phone: clientData.phone || clientData.Phone || '',
          address: clientData.address || clientData.Address || '',
          city: clientData.city || clientData.City || '',
          state: clientData.state || clientData.State || '',
          postalCode: clientData.postalCode || clientData.PostalCode || clientData['Postal Code'] || '',
          country: clientData.country || clientData.Country || '',
          taxId: clientData.taxId || clientData.TaxId || clientData['Tax ID'] || '',
          notes: clientData.notes || clientData.Notes || ''
        };
        
        // Validate required fields
        if (!formattedClient.name) {
          throw new Error('Client name is required');
        }
        
        // Add client
        const result = await addClient(formattedClient);
        
        if (result.success) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }
    
    return { success, failed, total };
  };

  // Download sample CSV template
  const downloadSampleTemplate = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Address',
      'City',
      'State',
      'PostalCode',
      'Country',
      'TaxId',
      'Notes'
    ];
    
    const sampleData = [
      'ABC Company',
      'contact@abccompany.com',
      '123-456-7890',
      '123 Main St',
      'New York',
      'NY',
      '10001',
      'USA',
      'TAX-12345',
      'Sample client notes'
    ];
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'client_import_template.csv';
    link.click();
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Import Clients</h2>
      
      {/* Instructions */}
      <div className="mb-6 text-sm text-gray-600">
        <p className="mb-2">Upload a CSV file with client information to import multiple clients at once.</p>
        <p className="mb-2">The CSV file should include the following columns: Name, Email, Phone, Address, City, State, PostalCode, Country, TaxId, Notes.</p>
        <p>
          <button
            onClick={downloadSampleTemplate}
            className="text-blue-600 hover:text-blue-800 font-medium"
            type="button"
          >
            Download sample template
          </button>
        </p>
      </div>
      
      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={isImporting}
        />
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Import Status */}
      {isImporting && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Importing clients...
        </div>
      )}
      
      {/* Results */}
      {showResults && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
          <p className="font-medium">Import completed</p>
          <p>Successfully imported: {importStatus.success} clients</p>
          {importStatus.failed > 0 && (
            <p>Failed to import: {importStatus.failed} clients</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportClients;
