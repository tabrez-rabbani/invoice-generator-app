/**
 * Get all clients for the current user
 * 
 * @returns {Promise<Array>} Array of client objects
 */
export async function getClients() {
  try {
    const response = await fetch('/api/clients');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch clients');
    }

    const clients = await response.json();
    return clients;
  } catch (error) {
    console.error('Error getting clients:', error);
    return [];
  }
}

/**
 * Get a specific client by ID
 * 
 * @param {string} id - The client ID
 * @returns {Promise<Object|null>} The client object or null if not found
 */
export async function getClientById(id) {
  try {
    const response = await fetch(`/api/clients/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch client');
    }

    const client = await response.json();
    return client;
  } catch (error) {
    console.error('Error getting client by ID:', error);
    return null;
  }
}

/**
 * Get a client's payment history
 * 
 * @param {string} id - The client ID
 * @returns {Promise<Object|null>} The payment history or null if error
 */
export async function getClientPaymentHistory(id) {
  try {
    const response = await fetch(`/api/clients/${id}/payment-history`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch payment history');
    }

    const history = await response.json();
    return history;
  } catch (error) {
    console.error('Error getting client payment history:', error);
    return null;
  }
}

/**
 * Add a new client
 * 
 * @param {Object} clientData - The client data to save
 * @returns {Promise<Object>} The result of the operation
 */
export async function addClient(clientData) {
  try {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle specific limit reached error
      if (response.status === 403 && result.code === 'LIMIT_REACHED') {
        const limitError = new Error(result.message || 'You have reached your client limit. Please upgrade your plan.');
        limitError.type = 'LIMIT_REACHED';
        limitError.originalError = result.error;
        throw limitError;
      }
      throw new Error(result.error || 'Failed to add client');
    }

    return result;
  } catch (error) {
    console.error('Error adding client:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing client
 * 
 * @param {string} id - The client ID
 * @param {Object} updates - The client data to update
 * @returns {Promise<Object>} The result of the operation
 */
export async function updateClient(id, updates) {
  try {
    const response = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update client');
    }

    return result;
  } catch (error) {
    console.error('Error updating client:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a client
 * 
 * @param {string} id - The client ID to delete
 * @returns {Promise<Object>} The result of the operation
 */
export async function deleteClient(id) {
  try {
    const response = await fetch(`/api/clients/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete client');
    }

    return result;
  } catch (error) {
    console.error('Error deleting client:', error);
    return { success: false, error: error.message };
  }
}
