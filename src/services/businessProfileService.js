/**
 * Service for managing business profiles
 */

/**
 * Get all business profiles for the current user
 * @returns {Promise<Array>} Array of business profiles
 */
export async function getBusinessProfiles() {
  try {
    const response = await fetch('/api/business-profiles', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch business profiles');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching business profiles:', error);
    return { error: error.message };
  }
}

/**
 * Get a specific business profile by ID
 * @param {string} id Business profile ID
 * @returns {Promise<Object>} Business profile data
 */
export async function getBusinessProfileById(id) {
  try {
    const response = await fetch(`/api/business-profiles/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch business profile');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching business profile ${id}:`, error);
    return { error: error.message };
  }
}

/**
 * Create a new business profile
 * @param {Object} profileData Business profile data
 * @returns {Promise<Object>} Result with success status and profile data
 */
export async function addBusinessProfile(profileData) {
  try {
    const response = await fetch('/api/business-profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create business profile');
    }

    return { success: true, ...result };
  } catch (error) {
    console.error('Error creating business profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing business profile
 * @param {string} id Business profile ID
 * @param {Object} profileData Updated business profile data
 * @returns {Promise<Object>} Result with success status
 */
export async function updateBusinessProfile(id, profileData) {
  try {
    const response = await fetch(`/api/business-profiles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update business profile');
    }

    return { success: true, ...result };
  } catch (error) {
    console.error(`Error updating business profile ${id}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a business profile
 * @param {string} id Business profile ID
 * @returns {Promise<Object>} Result with success status
 */
export async function deleteBusinessProfile(id) {
  try {
    const response = await fetch(`/api/business-profiles/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete business profile');
    }

    return { success: true };
  } catch (error) {
    console.error(`Error deleting business profile ${id}:`, error);
    return { success: false, error: error.message };
  }
}
