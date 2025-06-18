/**
 * Utility functions for exporting and importing data
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header objects with title and key properties
 * @returns {string} CSV string
 */
export function convertToCSV(data, headers) {
  if (!data || !data.length || !headers || !headers.length) {
    return '';
  }

  // Create header row
  const headerRow = headers.map(header => `"${header.title}"`).join(',');

  // Create data rows
  const rows = data.map(item => {
    return headers.map(header => {
      // Get the value using the key
      let value = item[header.key];

      // Handle nested objects
      if (header.key.includes('.')) {
        const keys = header.key.split('.');
        value = keys.reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : '', item);
      }

      // Format the value
      if (value === null || value === undefined) {
        return '""';
      } else if (typeof value === 'string') {
        // Escape quotes and wrap in quotes
        return `"${value.replace(/"/g, '""')}"`;
      } else if (value instanceof Date) {
        return `"${value.toISOString()}"`;
      } else if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return `"${value}"`;
    }).join(',');
  }).join('\n');

  return `${headerRow}\n${rows}`;
}

/**
 * Download data as a CSV file
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header objects with title and key properties
 * @param {string} filename - Name of the file to download
 */
export function downloadCSV(data, headers, filename = 'export.csv') {
  const csv = convertToCSV(data, headers);
  downloadFile(csv, filename, 'text/csv');
}

/**
 * Convert array of objects to Excel-compatible CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header objects with title and key properties
 * @returns {string} CSV string optimized for Excel
 */
export function convertToExcelCSV(data, headers) {
  if (!data || !data.length || !headers || !headers.length) {
    return '';
  }

  // Create BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';

  // Create header row
  const headerRow = headers.map(header => `"${header.title}"`).join(',');

  // Create data rows
  const rows = data.map(item => {
    return headers.map(header => {
      // Get the value using the key
      let value = item[header.key];

      // Handle nested objects
      if (header.key.includes('.')) {
        const keys = header.key.split('.');
        value = keys.reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : '', item);
      }

      // Format the value
      if (value === null || value === undefined) {
        return '""';
      } else if (typeof value === 'string') {
        // Escape quotes and wrap in quotes
        return `"${value.replace(/"/g, '""')}"`;
      } else if (value instanceof Date) {
        // Format date for Excel
        return `"${value.toLocaleDateString()}"`;
      } else if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return `"${value}"`;
    }).join(',');
  }).join('\n');

  return `${BOM}${headerRow}\n${rows}`;
}

/**
 * Download data as an Excel-compatible CSV file
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header objects with title and key properties
 * @param {string} filename - Name of the file to download
 */
export function downloadExcel(data, headers, filename = 'export.csv') {
  const excelCSV = convertToExcelCSV(data, headers);
  // Using CSV format with BOM for Excel compatibility
  downloadFile(excelCSV, filename, 'text/csv;charset=utf-8');
}

/**
 * Helper function to download a file
 * @param {string} content - Content of the file
 * @param {string} filename - Name of the file
 * @param {string} contentType - MIME type of the file
 */
function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}



/**
 * Parse CSV data
 * @param {string} csvText - CSV text to parse
 * @returns {Array} Array of objects
 */
export function parseCSV(csvText) {
  if (!csvText) return [];

  // Split by lines
  const lines = csvText.split(/\r\n|\n/);
  if (lines.length < 2) return [];

  // Parse header row
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  // Parse data rows
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = parseCSVLine(lines[i]);
    const obj = {};

    headers.forEach((header, index) => {
      if (index < values.length) {
        obj[header] = values[index];
      }
    });

    result.push(obj);
  }

  return result;
}

/**
 * Parse a single CSV line respecting quoted values
 * @param {string} line - CSV line to parse
 * @returns {Array} Array of values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Check if this is an escaped quote
      if (i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last value
  result.push(current.trim());

  return result;
}
