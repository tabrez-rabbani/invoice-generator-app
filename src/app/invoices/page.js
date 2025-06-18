'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { getUserInvoices, updateInvoiceStatus, deleteInvoice } from '../../services/invoiceService';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/formatters';
import { downloadCSV, downloadExcel } from '../../utils/exportImportUtils';
import jsPDF from 'jspdf';

export default function InvoicesList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('issueDate');
  const [sortDirection, setSortDirection] = useState('desc');
  // Add state for delete functionality at the top with other state declarations
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setExportMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load invoices on component mount and when session changes
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        // Only fetch invoices if we have a session
        if (session) {
          // Use the user's ID from the session to fetch only their invoices
          const userId = session.user.id;
          const data = await getUserInvoices(userId);
          setInvoices(data);

          // Apply initial filtering and sorting
          let filtered = [...data];

          // Apply search filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(invoice =>
              (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(query)) ||
              (invoice.toDetails && invoice.toDetails.toLowerCase().includes(query)) ||
              (invoice.fromDetails && invoice.fromDetails.toLowerCase().includes(query))
            );
          }

          // Apply status filter
          if (statusFilter !== 'all') {
            filtered = filtered.filter(invoice => invoice.status === statusFilter);
          }

          // Apply sorting
          filtered.sort((a, b) => {
            let aValue, bValue;

            // Extract the values to compare based on the sort field
            switch (sortField) {
              case 'id':
                aValue = a.invoiceNumber || '';
                bValue = b.invoiceNumber || '';
                break;
              case 'client':
                aValue = a.toDetails ? a.toDetails.split('\n')[0] : '';
                bValue = b.toDetails ? b.toDetails.split('\n')[0] : '';
                break;
              case 'issueDate':
                aValue = new Date(a.issueDate || a.createdAt || 0);
                bValue = new Date(b.issueDate || b.createdAt || 0);
                break;
              case 'dueDate':
                aValue = new Date(a.dueDate || 0);
                bValue = new Date(b.dueDate || 0);
                break;
              case 'amount':
                aValue = a.total || 0;
                bValue = b.total || 0;
                break;
              case 'status':
                aValue = a.status || '';
                bValue = b.status || '';
                break;
              default:
                aValue = new Date(a.createdAt || 0);
                bValue = new Date(b.createdAt || 0);
            }

            // Compare the values based on their type
            let comparison;
            if (aValue instanceof Date && bValue instanceof Date) {
              comparison = aValue - bValue;
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
              comparison = aValue - bValue;
            } else {
              comparison = String(aValue).localeCompare(String(bValue));
            }

            // Apply sort direction
            return sortDirection === 'asc' ? comparison : -comparison;
          });

          setFilteredInvoices(filtered);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [session, searchQuery, statusFilter, sortField, sortDirection]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will be redirected)
  if (status === 'unauthenticated') {
    return null;
  }

  // Handle invoice status update
  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      if (!session) return;

      const result = await updateInvoiceStatus(invoiceId, session.user.id, newStatus);

      if (result.success) {
        // Update local state
        setInvoices(prevInvoices =>
          prevInvoices.map(invoice =>
            invoice._id === invoiceId
              ? { ...invoice, status: newStatus, updatedAt: new Date() }
              : invoice
          )
        );

        // Also update filtered invoices
        setFilteredInvoices(prevFiltered =>
          prevFiltered.map(invoice =>
            invoice._id === invoiceId
              ? { ...invoice, status: newStatus, updatedAt: new Date() }
              : invoice
          )
        );

        // Show success message
        alert('Invoice status updated successfully');
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      alert('Failed to update invoice status');
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;

    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  // Handle delete invoice

  const handleDeleteClick = (invoiceId) => {
    setInvoiceToDelete(invoiceId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete || !session) return;

    setIsDeleting(true);
    try {
      const result = await deleteInvoice(invoiceToDelete, session.user.id);

      if (result.success) {
        // Remove from local state
        setInvoices(prevInvoices =>
          prevInvoices.filter(invoice => invoice._id !== invoiceToDelete)
        );

        // Also update filtered invoices
        setFilteredInvoices(prevFiltered =>
          prevFiltered.filter(invoice => invoice._id !== invoiceToDelete)
        );

        // Show success message
        alert('Invoice deleted successfully');
      } else {
        throw new Error('Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice: ' + error.message);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setInvoiceToDelete(null);
    }
  };

  // Handle download PDF
  const handleDownloadPdf = (invoice) => {
    try {
      // Create a new PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set font
      pdf.setFont('helvetica');

      // Add title
      pdf.setFontSize(24);
      pdf.text('INVOICE', 20, 20);

      // Add invoice number
      pdf.setFontSize(12);
      pdf.text(`Invoice #: ${invoice.invoiceNumber || 'N/A'}`, 20, 30);

      // Add dates
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
      };

      pdf.text(`Issue Date: ${formatDate(invoice.issueDate || invoice.createdAt)}`, 20, 40);
      pdf.text(`Due Date: ${formatDate(invoice.dueDate)}`, 20, 50);

      // Add from and to sections
      pdf.setFontSize(14);
      pdf.text('From:', 20, 70);
      pdf.setFontSize(10);

      // Handle From section
      if (invoice.fromDetails && invoice.fromDetails.trim()) {
        const fromLines = pdf.splitTextToSize(invoice.fromDetails.trim(), 80);
        pdf.text(fromLines, 20, 80);
      } else {
        pdf.text("No sender information provided", 20, 80);
      }

      pdf.setFontSize(14);
      pdf.text('Bill To:', 120, 70);
      pdf.setFontSize(10);

      // Handle Bill To section
      if (invoice.toDetails && invoice.toDetails.trim()) {
        const toLines = pdf.splitTextToSize(invoice.toDetails.trim(), 70);
        pdf.text(toLines, 120, 80);
      } else {
        pdf.text("No recipient information provided", 120, 80);
      }

      // Add items table
      const startY = 120;
      pdf.setFontSize(12);
      pdf.text('Items', 20, startY);

      // Table headers
      pdf.setFontSize(10);
      pdf.text('Description', 20, startY + 10);
      pdf.text('Qty', 100, startY + 10);
      pdf.text('Rate', 120, startY + 10);
      pdf.text('Amount', 170, startY + 10);

      // Draw header line
      pdf.line(20, startY + 12, 190, startY + 12);

      // Table rows
      let currentY = startY + 20;

      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach((item) => {
          const description = item.description ? item.description.trim().substring(0, 40) : "Item";
          pdf.text(description, 20, currentY);
          pdf.text(item.quantity?.toString() || '1', 100, currentY);
          pdf.text(`${getCurrencySymbol(invoice.currency)}${(parseFloat(item.rate) || 0).toFixed(2)}`, 120, currentY);
          pdf.text(`${getCurrencySymbol(invoice.currency)}${(parseFloat(item.amount) || 0).toFixed(2)}`, 170, currentY);
          currentY += 10;
        });
      } else {
        pdf.text("No items", 20, currentY);
        currentY += 10;
      }

      // Draw table bottom line
      pdf.line(20, currentY + 2, 190, currentY + 2);

      // Add totals
      currentY += 10;
      pdf.text('Subtotal:', 140, currentY);
      pdf.text(`${getCurrencySymbol(invoice.currency)}${parseFloat(invoice.subtotal || 0).toFixed(2)}`, 170, currentY);

      // Add tax if available
      if (invoice.taxAmount && parseFloat(invoice.taxAmount) > 0) {
        currentY += 8;
        pdf.text(`Tax:`, 140, currentY);
        pdf.text(`${getCurrencySymbol(invoice.currency)}${parseFloat(invoice.taxAmount).toFixed(2)}`, 170, currentY);
      }

      // Add shipping if available
      if (invoice.shipping && parseFloat(invoice.shipping) > 0) {
        currentY += 8;
        pdf.text('Shipping:', 140, currentY);
        pdf.text(`${getCurrencySymbol(invoice.currency)}${parseFloat(invoice.shipping).toFixed(2)}`, 170, currentY);
      }

      // Total
      currentY += 10;
      pdf.setFontSize(12);
      pdf.text('Total:', 140, currentY);
      pdf.text(`${getCurrencySymbol(invoice.currency)}${parseFloat(invoice.total || 0).toFixed(2)}`, 170, currentY);

      // Add discount if available
      if (invoice.discount && parseFloat(invoice.discount) > 0) {
        currentY += 8;
        const discountLabel = invoice.discountType === '%'
          ? `Discount (${invoice.discount}%):`
          : 'Discount:';
        pdf.text(discountLabel, 140, currentY);
        pdf.text(`${getCurrencySymbol(invoice.currency)}${parseFloat(invoice.discountAmount || 0).toFixed(2)}`, 170, currentY);
      }

      // Add payment method
      currentY += 20;
      pdf.setFontSize(12);
      pdf.text('Payment Method:', 20, currentY);

      // Format payment method for display
      const paymentMethodMap = {
        'bankTransfer': 'Bank Transfer',
        'paypal': 'PayPal',
        'upi': 'UPI',
        'paymentLink': 'Payment Link',
        'cash': 'Cash',
        'other': 'Other'
      };

      const paymentMethodText = paymentMethodMap[invoice.paymentMethod] || 'Not specified';
      pdf.setFontSize(10);
      pdf.text(paymentMethodText, 20, currentY + 8);

      // Add bank details if payment method is bank transfer
      if (invoice.paymentMethod === 'bankTransfer' && invoice.bankDetails) {
        currentY += 16;
        pdf.setFontSize(12);
        pdf.text('Bank Details:', 20, currentY);
        pdf.setFontSize(10);

        const bankDetailsLines = pdf.splitTextToSize(invoice.bankDetails.trim(), 170);
        pdf.text(bankDetailsLines, 20, currentY + 8);

        // Adjust currentY based on the number of lines
        currentY += 8 + (bankDetailsLines.length * 5);
      } else {
        currentY += 16;
      }

      // Add notes if available
      if (invoice.notes && invoice.notes.trim()) {
        pdf.setFontSize(12);
        pdf.text('Notes:', 20, currentY);
        pdf.setFontSize(10);

        const notesLines = pdf.splitTextToSize(invoice.notes.trim(), 170);
        pdf.text(notesLines, 20, currentY + 8);

        // Adjust currentY based on the number of lines
        currentY += 8 + (notesLines.length * 5);
      } else {
        currentY += 16;
      }

      // Add terms if available
      if (invoice.terms && invoice.terms.trim()) {
        pdf.setFontSize(12);
        pdf.text('Terms and Conditions:', 20, currentY);
        pdf.setFontSize(10);

        const termsLines = pdf.splitTextToSize(invoice.terms.trim(), 170);
        pdf.text(termsLines, 20, currentY + 8);
      }

      // Save the PDF
      pdf.save(`Invoice-${invoice.invoiceNumber || 'download'}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  // Helper function to get currency symbol
  const getCurrencySymbol = (currencyCode) => {
    const currencies = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': 'Rs.',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CNY': '¥',
      'RUB': '₽',
    };

    // Add a space after INR for better readability
    if (currencyCode === 'INR') {
      return currencies[currencyCode] + ' ';
    }

    return currencies[currencyCode] || currencyCode || '$';
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    if (!filteredInvoices.length) {
      alert('No invoices to export');
      return;
    }

    const headers = [
      { title: 'Invoice Number', key: 'invoiceNumber' },
      { title: 'Client', key: 'toDetails' },
      { title: 'Issue Date', key: 'issueDate' },
      { title: 'Due Date', key: 'dueDate' },
      { title: 'Amount', key: 'total' },
      { title: 'Currency', key: 'currency' },
      { title: 'Status', key: 'status' }
    ];

    // Format data for export
    const formattedData = filteredInvoices.map(invoice => {
      return {
        ...invoice,
        // Format dates
        issueDate: formatDate(invoice.issueDate || invoice.createdAt),
        dueDate: formatDate(invoice.dueDate),
        // Extract client name from toDetails
        toDetails: invoice.toDetails ? invoice.toDetails.split('\n')[0] : 'N/A',
        // Ensure values are properly formatted
        total: parseFloat(invoice.total || 0).toFixed(2),
        currency: invoice.currency || 'USD',
        status: invoice.status || 'issued'
      };
    });

    downloadCSV(formattedData, headers, 'invoices-export.csv');
    setExportMenuOpen(false);
  };

  // Handle export to Excel
  const handleExportExcel = () => {
    if (!filteredInvoices.length) {
      alert('No invoices to export');
      return;
    }

    const headers = [
      { title: 'Invoice Number', key: 'invoiceNumber' },
      { title: 'Client', key: 'toDetails' },
      { title: 'Issue Date', key: 'issueDate' },
      { title: 'Due Date', key: 'dueDate' },
      { title: 'Amount', key: 'total' },
      { title: 'Currency', key: 'currency' },
      { title: 'Status', key: 'status' }
    ];

    // Format data for export
    const formattedData = filteredInvoices.map(invoice => {
      return {
        ...invoice,
        // Format dates
        issueDate: formatDate(invoice.issueDate || invoice.createdAt),
        dueDate: formatDate(invoice.dueDate),
        // Extract client name from toDetails
        toDetails: invoice.toDetails ? invoice.toDetails.split('\n')[0] : 'N/A',
        // Ensure values are properly formatted
        total: parseFloat(invoice.total || 0).toFixed(2),
        currency: invoice.currency || 'USD',
        status: invoice.status || 'issued'
      };
    });

    downloadExcel(formattedData, headers, 'invoices-export.csv');
    setExportMenuOpen(false);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Invoices</h1>

          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {/* Export Button with Dropdown */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Export
                </button>

                {/* Export Dropdown Menu */}
                {exportMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="export-menu">
                      <button
                        onClick={handleExportCSV}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Export as CSV
                      </button>
                      <button
                        onClick={handleExportExcel}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Export as Excel-compatible CSV
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Create New Invoice Button */}
              <Link
                href="/invoices/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Invoice
              </Link>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('id')}
                  >
                    Invoice {renderSortIndicator('id')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('client')}
                  >
                    Client {renderSortIndicator('client')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('issueDate')}
                  >
                    Issue Date {renderSortIndicator('issueDate')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('dueDate')}
                  >
                    Due Date {renderSortIndicator('dueDate')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('amount')}
                  >
                    Amount {renderSortIndicator('amount')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('status')}
                  >
                    Status {renderSortIndicator('status')}
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading invoices...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const statusColors = getStatusColor(invoice.status || 'issued');
                    const clientName = invoice.toDetails ? invoice.toDetails.split('\n')[0] : 'N/A';
                    return (
                      <tr key={invoice._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link href={`/invoices/${invoice._id}`} className="text-blue-600 hover:text-blue-900">
                            {invoice.invoiceNumber || 'No Number'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {clientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(invoice.issueDate || invoice.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(invoice.dueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(invoice.total || 0, invoice.currency || 'USD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={invoice.status || 'issued'}
                            onChange={(e) => handleStatusChange(invoice._id, e.target.value)}
                            className={`text-xs rounded-full px-2.5 py-0.5 font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                          >
                            <option value="issued">Issued</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/invoices/${invoice._id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                            View
                          </Link>
                          <button
                            onClick={() => handleDownloadPdf(invoice)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDeleteClick(invoice._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Placeholder */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredInvoices.length}</span> invoices
            </div>
            <div className="flex-1 flex justify-end">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </a>
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this invoice? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setInvoiceToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
