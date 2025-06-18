'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBusinessProfiles, deleteBusinessProfile } from '../services/businessProfileService';

const BusinessProfileList = () => {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Fetch business profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      try {
        const data = await getBusinessProfiles();
        if (data.error) {
          setError(data.error);
        } else {
          setProfiles(data);
        }
      } catch (err) {
        setError('Failed to load business profiles');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // Handle delete confirmation
  const confirmDelete = (profileId, profileName) => {
    setDeleteConfirmation({ id: profileId, name: profileName });
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  // Handle delete profile
  const handleDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      const result = await deleteBusinessProfile(deleteConfirmation.id);
      if (result.success) {
        // Remove the deleted profile from the list
        setProfiles(profiles.filter(profile => profile._id !== deleteConfirmation.id));
        setDeleteConfirmation(null);
      } else {
        setError(result.error || 'Failed to delete business profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
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
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Business Profiles</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your business profiles for invoices
          </p>
        </div>
        <Link
          href="/business-profiles/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add New Profile
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the business profile &quot;{deleteConfirmation.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="p-6 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No business profiles yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first business profile to use on your invoices
          </p>
          <Link
            href="/business-profiles/new"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Business Profile
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {profiles.map(profile => (
            <li key={profile._id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 mr-4">
                    {profile.logoUrl ? (
                      <Image
                        src={profile.logoUrl}
                        alt={profile.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-contain"
                        sizes="48px"
                        quality={75}
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <span className="text-gray-500 text-lg font-medium">
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{profile.name}</h3>
                    <div className="mt-1 text-sm text-gray-500">
                      {profile.email && (
                        <p className="truncate">{profile.email}</p>
                      )}
                      {profile.phone && (
                        <p className="truncate">{profile.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/business-profiles/${profile._id}/edit`}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => confirmDelete(profile._id, profile.name)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BusinessProfileList;
