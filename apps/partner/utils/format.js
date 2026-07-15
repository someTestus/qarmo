/**
 * Formats a number as Indian Rupees (₹) using the standard Indian numbering system.
 * 
 * @param {number|string} value - The numeric value to format.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (value) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (typeof numericValue !== 'number' || isNaN(numericValue)) {
    return '₹0.00';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(numericValue);
};
