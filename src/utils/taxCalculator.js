/**
 * Tax Calculator Utility
 *
 * This utility provides functions for tax calculations in the invoice generator.
 */

/**
 * Calculate tax amount based on subtotal and tax rate
 *
 * @param {number} subtotal - The subtotal amount before tax
 * @param {number} taxRate - The tax rate as a percentage (e.g., 18 for 18%)
 * @returns {number} The calculated tax amount
 */
export const calculateTaxAmount = (subtotal, taxRate) => {
  if (!subtotal || !taxRate) return 0;
  return (subtotal * taxRate) / 100;
};

/**
 * Calculate the total amount including tax
 *
 * @param {number} subtotal - The subtotal amount before tax
 * @param {number} taxAmount - The tax amount
 * @returns {number} The total amount including tax
 */
export const calculateTotal = (subtotal, taxAmount) => {
  return subtotal + taxAmount;
};

/**
 * Common tax rates for different countries/regions
 * This can be expanded as needed
 */
export const commonTaxRates = [
  { label: 'No Tax (0%)', value: 0 },
  { label: 'GST/HST (5%)', value: 5 },
  { label: 'GST/HST (13%)', value: 13 },
  { label: 'GST/HST (15%)', value: 15 },
  { label: 'VAT (7%)', value: 7.0 },  // Changed to 7.0 to make it unique from Sales Tax (7%)
  { label: 'VAT (10%)', value: 10 },
  { label: 'VAT (20%)', value: 20 },
  { label: 'Sales Tax (6%)', value: 6 },
  { label: 'Sales Tax (7%)', value: 7.1 },  // Changed to 7.1 to make it unique from VAT (7%)
  { label: 'Sales Tax (8%)', value: 8 },
  { label: 'GST (18%)', value: 18 },
  { label: 'Custom', value: 'custom' },
];

/**
 * Get tax name based on rate
 *
 * @param {number|string} taxRate - The tax rate
 * @returns {string} The tax name
 */
export const getTaxName = (taxRate) => {
  if (taxRate === 'custom') return 'Custom Tax';

  // Convert to number for comparison and handle floating point precision
  const numericRate = parseFloat(taxRate);

  // Find the tax info by comparing with a small epsilon to handle floating point comparison
  const taxInfo = commonTaxRates.find(tax => {
    if (typeof tax.value === 'number') {
      return Math.abs(tax.value - numericRate) < 0.01; // Allow small difference for floating point
    }
    return tax.value === taxRate;
  });

  if (taxInfo) {
    return taxInfo.label.split(' ')[0]; // Return just the tax type (GST, VAT, etc.)
  }

  return 'Tax';
};

/**
 * Format tax for display
 *
 * @param {number|string} taxRate - The tax rate
 * @param {string} taxName - Optional custom tax name
 * @returns {string} Formatted tax display
 */
export const formatTaxDisplay = (taxRate, taxName = '') => {
  if (taxRate === 'custom' && taxName) {
    return taxName;
  }

  const name = getTaxName(taxRate);
  return `${name} (${taxRate}%)`;
};
