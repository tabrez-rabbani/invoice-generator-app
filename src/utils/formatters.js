// Format date to a readable string
export const formatDate = (date) => {
  if (!date) return '';

  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return '';

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  });

  return formatter.format(amount);
};

// Get currency symbol
export const getCurrencySymbol = (currency) => {
  const currencyOptions = [
    { value: 'USD', symbol: '$' },
    { value: 'EUR', symbol: '€' },
    { value: 'GBP', symbol: '£' },
    { value: 'JPY', symbol: '¥' },
    { value: 'CAD', symbol: 'C$' },
    { value: 'AUD', symbol: 'A$' },
    { value: 'INR', symbol: 'Rs.' },
  ];

  const found = currencyOptions.find(option => option.value === currency);
  if (currency === 'INR' && found) {
    return found.symbol + ' ';
  }
  return found ? found.symbol : '$';
};

// Get status badge color
export const getStatusColor = (status) => {
  // Handle undefined or null status
  if (!status) {
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200'
    };
  }

  switch (status.toLowerCase()) {
    case 'paid':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200'
      };
    case 'pending':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200'
      };
    case 'overdue':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200'
      };
  }
};

const formatters = {
  formatDate,
  formatCurrency,
  getCurrencySymbol,
  getStatusColor
};

export default formatters;
