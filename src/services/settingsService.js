/**
 * Service for managing user settings
 */

/**
 * Get user settings
 * @returns {Promise<Object>} User settings
 */
export async function getUserSettings() {
  try {
    const response = await fetch('/api/settings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return { error: error.message };
  }
}

/**
 * Update user settings
 * @param {Object} settingsData Updated settings data
 * @returns {Promise<Object>} Result with success status
 */
export async function updateUserSettings(settingsData) {
  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update user settings');
    }

    return { success: true, ...result };
  } catch (error) {
    console.error('Error updating user settings:', error);
    return { success: false, error: error.message };
  }
}
