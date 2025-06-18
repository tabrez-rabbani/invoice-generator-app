/**
 * Get all templates for the current user
 * 
 * @returns {Promise<Array>} Array of template objects
 */
export async function getTemplates() {
  try {
    const response = await fetch('/api/templates');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch templates');
    }

    const templates = await response.json();
    return templates;
  } catch (error) {
    console.error('Error getting templates:', error);
    return [];
  }
}

/**
 * Get a specific template by ID
 * 
 * @param {string} id - The template ID
 * @returns {Promise<Object|null>} The template object or null if not found
 */
export async function getTemplateById(id) {
  try {
    const response = await fetch(`/api/templates/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch template');
    }

    const template = await response.json();
    return template;
  } catch (error) {
    console.error('Error getting template by ID:', error);
    return null;
  }
}

/**
 * Save a new template
 * 
 * @param {Object} templateData - The template data to save
 * @returns {Promise<Object>} The result of the operation
 */
export async function saveTemplate(templateData) {
  try {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save template');
    }

    return result;
  } catch (error) {
    console.error('Error saving template:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing template
 * 
 * @param {string} id - The template ID
 * @param {Object} updates - The template data to update
 * @returns {Promise<Object>} The result of the operation
 */
export async function updateTemplate(id, updates) {
  try {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update template');
    }

    return result;
  } catch (error) {
    console.error('Error updating template:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a template
 * 
 * @param {string} id - The template ID to delete
 * @returns {Promise<Object>} The result of the operation
 */
export async function deleteTemplate(id) {
  try {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete template');
    }

    return result;
  } catch (error) {
    console.error('Error deleting template:', error);
    return { success: false, error: error.message };
  }
}
