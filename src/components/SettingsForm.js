'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserSettings, updateUserSettings } from '../services/settingsService';
import { commonTaxRates } from '../utils/taxCalculator';

const SettingsForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    defaultCurrency: 'USD',
    defaultTaxRate: 0,
    defaultTaxName: '',
    pdfStyling: {
      primaryColor: '#3b82f6',
      secondaryColor: '#f3f4f6',
      fontFamily: 'Helvetica',
      fontSize: 10,
      logoPosition: 'right',
      showBankDetails: true,
      showFooter: true,
      footerText: 'Thank you for your business!'
    }
  });

  // Available currencies
  const currencyOptions = [
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' },
    { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
    { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
    { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
    { value: 'INR', label: 'INR (Rs.)', symbol: 'Rs.' },
  ];

  // Available font families
  const fontFamilyOptions = [
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times', label: 'Times' },
    { value: 'Courier', label: 'Courier' },
  ];

  // Fetch user settings
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await getUserSettings();
        if (settings.error) {
          setError(settings.error);
        } else {
          setFormData(settings);
        }
      } catch (err) {
        setError('Failed to load settings');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle PDF styling changes
  const handlePdfStylingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      pdfStyling: {
        ...prev.pdfStyling,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await updateUserSettings(formData);
      if (result.success) {
        setSuccessMessage('Settings saved successfully');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(result.error || 'Failed to save settings');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-600 mt-1">
          Customize your invoice generator preferences
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p>{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-8">
          {/* Default Invoice Settings Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Default Invoice Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default Currency */}
              <div>
                <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                  Default Currency
                </label>
                <select
                  id="defaultCurrency"
                  name="defaultCurrency"
                  value={formData.defaultCurrency}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {currencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  This currency will be pre-selected when creating new invoices
                </p>
              </div>

              {/* Default Tax Rate */}
              <div>
                <label htmlFor="defaultTaxRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Default Tax Rate
                </label>
                <select
                  id="defaultTaxRate"
                  name="defaultTaxRate"
                  value={formData.defaultTaxRate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {commonTaxRates.map(tax => (
                    <option key={tax.value} value={tax.value}>
                      {tax.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  This tax rate will be pre-selected when creating new invoices
                </p>
              </div>
            </div>
          </div>

          {/* PDF Styling Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">PDF Styling Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Color */}
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    value={formData.pdfStyling.primaryColor}
                    onChange={handlePdfStylingChange}
                    className="h-10 w-10 border border-gray-300 rounded-md mr-2"
                  />
                  <input
                    type="text"
                    value={formData.pdfStyling.primaryColor}
                    onChange={handlePdfStylingChange}
                    name="primaryColor"
                    className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Used for headings and important elements
                </p>
              </div>

              {/* Secondary Color */}
              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="secondaryColor"
                    name="secondaryColor"
                    value={formData.pdfStyling.secondaryColor}
                    onChange={handlePdfStylingChange}
                    className="h-10 w-10 border border-gray-300 rounded-md mr-2"
                  />
                  <input
                    type="text"
                    value={formData.pdfStyling.secondaryColor}
                    onChange={handlePdfStylingChange}
                    name="secondaryColor"
                    className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Used for backgrounds and less important elements
                </p>
              </div>

              {/* Font Family */}
              <div>
                <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700 mb-1">
                  Font Family
                </label>
                <select
                  id="fontFamily"
                  name="fontFamily"
                  value={formData.pdfStyling.fontFamily}
                  onChange={handlePdfStylingChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {fontFamilyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div>
                <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size
                </label>
                <input
                  type="number"
                  id="fontSize"
                  name="fontSize"
                  min="8"
                  max="14"
                  value={formData.pdfStyling.fontSize}
                  onChange={handlePdfStylingChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Base font size in points (8-14)
                </p>
              </div>

              {/* Logo Position */}
              <div>
                <label htmlFor="logoPosition" className="block text-sm font-medium text-gray-700 mb-1">
                  Logo Position
                </label>
                <select
                  id="logoPosition"
                  name="logoPosition"
                  value={formData.pdfStyling.logoPosition}
                  onChange={handlePdfStylingChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="center">Center</option>
                </select>
              </div>

              {/* Show Bank Details */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showBankDetails"
                  name="showBankDetails"
                  checked={formData.pdfStyling.showBankDetails}
                  onChange={handlePdfStylingChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showBankDetails" className="ml-2 block text-sm text-gray-700">
                  Show Bank Details in PDF
                </label>
              </div>

              {/* Show Footer */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showFooter"
                  name="showFooter"
                  checked={formData.pdfStyling.showFooter}
                  onChange={handlePdfStylingChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showFooter" className="ml-2 block text-sm text-gray-700">
                  Show Footer in PDF
                </label>
              </div>

              {/* Footer Text */}
              {formData.pdfStyling.showFooter && (
                <div className="md:col-span-2">
                  <label htmlFor="footerText" className="block text-sm font-medium text-gray-700 mb-1">
                    Footer Text
                  </label>
                  <input
                    type="text"
                    id="footerText"
                    name="footerText"
                    value={formData.pdfStyling.footerText}
                    onChange={handlePdfStylingChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsForm;
