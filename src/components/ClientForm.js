'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addClient, updateClient, getClientById } from '../services/clientService';

const ClientForm = ({ clientId = null, onSuccess = null }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    taxId: '',
    notes: ''
  });

  // Fetch client data if editing
  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) return;
      
      setIsLoading(true);
      try {
        const client = await getClientById(clientId);
        if (client) {
          setFormData({
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
            city: client.city || '',
            state: client.state || '',
            postalCode: client.postalCode || '',
            country: client.country || '',
            taxId: client.taxId || '',
            notes: client.notes || ''
          });
        } else {
          setError('Client not found');
        }
      } catch (err) {
        setError('Error loading client data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let result;
      
      if (clientId) {
        // Update existing client
        result = await updateClient(clientId, formData);
      } else {
        // Create new client
        result = await addClient(formData);
      }

      if (result.success) {
        if (onSuccess) {
          onSuccess(result);
        } else {
          // Navigate to clients list
          router.push('/clients');
          router.refresh();
        }
      } else {
        setError(result.error || 'Failed to save client');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {clientId ? 'Edit Client' : 'Add New Client'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Client Name */}
          <div className="col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Client or Company Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Contact Information */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="client@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Address */}
          <div className="col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Street Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State/Province
            </label>
            <input
              type="text"
              id="state"
              name="state"
              placeholder="State/Province"
              value={formData.state}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal/ZIP Code
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              placeholder="Postal/ZIP Code"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Tax ID */}
          <div className="col-span-2">
            <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
              Tax ID / VAT Number
            </label>
            <input
              type="text"
              id="taxId"
              name="taxId"
              placeholder="Tax ID or VAT Number"
              value={formData.taxId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Notes */}
          <div className="col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              placeholder="Additional notes about this client"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (clientId ? 'Update Client' : 'Add Client')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;
