/**
 * Add a new invoice to the database
 *
 * @param {Object} invoiceData - The invoice data to save
 * @param {string} userId - The user ID who created the invoice
 * @returns {Promise<Object>} The result of the database operation
 */
export async function addInvoice(invoiceData, userId) {
  try {
    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle specific limit reached error
      if (response.status === 403 && result.code === 'LIMIT_REACHED') {
        const limitError = new Error(result.message || 'You have reached your invoice limit. Please upgrade your plan.');
        limitError.type = 'LIMIT_REACHED';
        limitError.originalError = result.error;
        throw limitError;
      }
      throw new Error(result.error || 'Failed to add invoice');
    }

    return result;
  } catch (error) {
    console.error('Error adding invoice:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all invoices for a specific user
 *
 * @param {string} userId - The user ID to get invoices for
 * @returns {Promise<Array>} Array of invoice objects
 */
export async function getUserInvoices(userId) {
  try {
    const response = await fetch('/api/invoices');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch invoices');
    }

    const invoices = await response.json();
    return invoices;
  } catch (error) {
    console.error('Error getting user invoices:', error);
    return [];
  }
}

/**
 * Get a specific invoice by ID
 *
 * @param {string} id - The invoice ID
 * @param {string} userId - The user ID (for security)
 * @returns {Promise<Object|null>} The invoice object or null if not found
 */
export async function getInvoiceById(id, userId) {
  try {
    const response = await fetch(`/api/invoices/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch invoice');
    }

    const invoice = await response.json();
    return invoice;
  } catch (error) {
    console.error('Error getting invoice by ID:', error);
    return null;
  }
}

/**
 * Update an invoice's status
 *
 * @param {string} id - The invoice ID
 * @param {string} userId - The user ID (for security)
 * @param {string} status - The new status ('issued', 'paid', 'overdue', 'cancelled')
 * @returns {Promise<Object>} Result of the operation
 */
export async function updateInvoiceStatus(id, userId, status) {
  try {
    const response = await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update invoice status');
    }

    return result;
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete an invoice
 *
 * @param {string} id - The invoice ID
 * @param {string} userId - The user ID (for security)
 * @returns {Promise<Object>} Result of the operation
 */
export async function deleteInvoice(id, userId) {
  try {
    const response = await fetch(`/api/invoices/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete invoice');
    }

    return result;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return { success: false, error: error.message };
  }
}
