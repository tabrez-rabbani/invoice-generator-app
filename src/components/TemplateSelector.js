'use client';

import { useState, useEffect } from 'react';
import { getTemplates, deleteTemplate } from '../services/templateService';

const TemplateSelector = ({ onSelectTemplate, onSaveTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [error, setError] = useState('');

  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setError('Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Handle template selection
  const handleSelectTemplate = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  // Handle save template button click
  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  // Handle save template form submission
  const handleSaveTemplate = (e) => {
    e.preventDefault();
    
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }

    if (onSaveTemplate) {
      onSaveTemplate(templateName);
      setShowSaveModal(false);
      setTemplateName('');
      setError('');
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async (id) => {
    try {
      const result = await deleteTemplate(id);
      
      if (result.success) {
        // Remove template from state
        setTemplates(prev => prev.filter(template => template._id !== id));
        setDeleteConfirmation(null);
      } else {
        setError('Failed to delete template: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      setError('An error occurred while deleting the template');
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800">Invoice Templates</h2>
        <button
          type="button"
          onClick={handleSaveClick}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Save as Template
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-4 bg-gray-50 rounded-md">
          <p className="text-gray-500">No templates saved yet.</p>
          <p className="text-sm text-gray-400 mt-1">Save your current invoice as a template for future use.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {templates.map((template) => (
            <div 
              key={template._id} 
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-md cursor-pointer"
            >
              <div 
                className="flex-1 truncate mr-4"
                onClick={() => handleSelectTemplate(template)}
              >
                <p className="font-medium text-gray-800">{template.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(template.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleSelectTemplate(template)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmation(template._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Save as Template</h3>
            <form onSubmit={handleSaveTemplate}>
              <div className="mb-4">
                <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Standard Invoice, Consulting Services, etc."
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveModal(false);
                    setTemplateName('');
                    setError('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTemplate(deleteConfirmation)}
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

export default TemplateSelector;
