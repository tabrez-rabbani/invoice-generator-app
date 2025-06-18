'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { addBusinessProfile, getBusinessProfileById, updateBusinessProfile } from '../services/businessProfileService';

const BusinessProfileForm = ({ profileId }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    logo: null,
    logoPreview: null,
    bankDetails: '',
    notes: ''
  });

  // Fetch business profile data if editing an existing profile
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (profileId) {
        setIsLoading(true);
        try {
          const profile = await getBusinessProfileById(profileId);
          if (profile.error) {
            setError(profile.error);
          } else {
            // Set form data from profile
            setFormData({
              name: profile.name || '',
              address: profile.address || '',
              city: profile.city || '',
              state: profile.state || '',
              postalCode: profile.postalCode || '',
              country: profile.country || '',
              phone: profile.phone || '',
              email: profile.email || '',
              website: profile.website || '',
              taxId: profile.taxId || '',
              logoPreview: profile.logoUrl || null,
              bankDetails: profile.bankDetails || '',
              notes: profile.notes || ''
            });
          }
        } catch (err) {
          setError('Failed to load business profile');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchBusinessProfile();
  }, [profileId]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 1024 * 1024) { // 1MB limit
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: file,
          logoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert('File size exceeds 1MB limit');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Prepare data for submission
      const profileData = {
        ...formData,
        logoUrl: formData.logoPreview // Store the base64 encoded logo
      };

      // Remove unnecessary fields
      delete profileData.logo;
      delete profileData.logoPreview;

      let result;

      if (profileId) {
        // Update existing profile
        result = await updateBusinessProfile(profileId, profileData);
      } else {
        // Create new profile
        result = await addBusinessProfile(profileData);
      }

      if (result.success) {
        // Navigate to business profiles list
        router.push('/business-profiles');
        router.refresh();
      } else {
        setError(result.error || 'Failed to save business profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && profileId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          {profileId ? 'Edit Business Profile' : 'Create Business Profile'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {profileId
            ? 'Update your business information'
            : 'Add a new business profile to use on your invoices'}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload Section */}
          <div className="md:col-span-2">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-6">
              {formData.logoPreview ? (
                <div className="relative w-full h-32 mb-4">
                  <Image
                    src={formData.logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 300px"
                    quality={80}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              )}
              <p className="text-sm text-center text-gray-600 mb-2">Upload business logo</p>
              <p className="text-xs text-center text-gray-500 mb-4">Supported formats: JPG, PNG, SVG</p>
              <label className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md cursor-pointer transition-colors">
                Upload Logo
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.svg"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
              <p className="text-xs text-center text-gray-500 mt-4">Max upload size: 1 MB</p>
            </div>
          </div>

          {/* Business Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* State/Province */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State/Province
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Postal Code */}
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tax ID */}
          <div>
            <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
              Tax ID / VAT Number
            </label>
            <input
              type="text"
              id="taxId"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bank Details */}
          <div className="md:col-span-2">
            <label htmlFor="bankDetails" className="block text-sm font-medium text-gray-700 mb-1">
              Bank Details
            </label>
            <textarea
              id="bankDetails"
              name="bankDetails"
              rows="4"
              placeholder="Account Name, Account Number, Bank Name, SWIFT/BIC, IBAN, etc."
              value={formData.bankDetails}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <Link
            href="/business-profiles"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : profileId ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessProfileForm;
