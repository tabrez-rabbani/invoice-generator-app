'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import jsPDF from 'jspdf';
import { calculateTaxAmount, calculateTotal, commonTaxRates, getTaxName, formatTaxDisplay } from '../utils/taxCalculator';
import { getClients, getClientById } from '../services/clientService';
import { getBusinessProfiles, getBusinessProfileById } from '../services/businessProfileService';
import { getUserSettings } from '../services/settingsService';
import Link from 'next/link';

const InvoiceForm = () => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [businessProfiles, setBusinessProfiles] = useState([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [userSettings, setUserSettings] = useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // State for form fields
  const [formData, setFormData] = useState({
    logo: null,
    logoPreview: null,
    invoiceNumber: '',
    paymentTerms: '',
    issueDate: '',
    dueDate: '',
    currency: 'USD', // Default currency, will be updated from settings
    clientId: '',
    businessProfileId: '',
    fromDetails: '',
    toDetails: '',
    items: [
      {
        id: 1,
        description: '',
        quantity: '',
        rate: '',
        discount: '',
        discountType: '%',
        amount: 0
      }
    ],
    subtotal: 0,
    discount: '',
    discountType: '%',
    // Enhanced tax fields
    taxType: 'standard', // 'standard', 'multiple', or 'none'
    taxRate: '0', // For standard tax
    taxName: '', // Custom tax name for standard tax
    taxAmount: 0, // Calculated tax amount
    taxes: [], // For multiple taxes [{name, rate, amount}]
    shipping: '',
    total: 0,
    paymentMethod: '',
    bankDetails: '',
    paypalId: '',
    upiId: '',
    paymentLink: '',
    notes: '',
    terms: ''
  });

  // Available payment terms
  const paymentTermsOptions = [
    { value: 'NET7', label: 'NET 7' },
    { value: 'NET15', label: 'NET 15' },
    { value: 'NET30', label: 'NET 30' },
    { value: 'NET45', label: 'NET 45' },
    { value: 'NET60', label: 'NET 60' },
    { value: 'DUE_ON_RECEIPT', label: 'Due on receipt' },
  ];

  // Available currencies
  const currencyOptions = [
    { value: 'AED', label: 'AED (د.إ)', symbol: 'د.إ' },
    { value: 'AFN', label: 'AFN (؋)', symbol: '؋' },
    { value: 'ALL', label: 'ALL (L)', symbol: 'L' },
    { value: 'AMD', label: 'AMD (դր)', symbol: 'դր' },
    { value: 'ANG', label: 'ANG (ƒ)', symbol: 'ƒ' },
    { value: 'AOA', label: 'AOA (Kz)', symbol: 'Kz' },
    { value: 'ARS', label: 'ARS ($)', symbol: '$' },
    { value: 'AUD', label: 'AUD ($)', symbol: '$' },
    { value: 'AWG', label: 'AWG (ƒ)', symbol: 'ƒ' },
    { value: 'AZN', label: 'AZN (₼)', symbol: '₼' },
    { value: 'BAM', label: 'BAM (KM)', symbol: 'KM' },
    { value: 'BBD', label: 'BBD ($)', symbol: '$' },
    { value: 'BDT', label: 'BDT (৳)', symbol: '৳' },
    { value: 'BGN', label: 'BGN (лв)', symbol: 'лв' },
    { value: 'BHD', label: 'BHD (.د.ب)', symbol: '.د.ب' },
    { value: 'BIF', label: 'BIF (FBu)', symbol: 'FBu' },
    { value: 'BMD', label: 'BMD ($)', symbol: '$' },
    { value: 'BND', label: 'BND ($)', symbol: '$' },
    { value: 'BOB', label: 'BOB (Bs.)', symbol: 'Bs.' },
    { value: 'BRL', label: 'BRL (R$)', symbol: 'R$' },
    { value: 'BSD', label: 'BSD ($)', symbol: '$' },
    { value: 'BTN', label: 'BTN (Nu.)', symbol: 'Nu.' },
    { value: 'BWP', label: 'BWP (P)', symbol: 'P' },
    { value: 'BYN', label: 'BYN (Br)', symbol: 'Br' },
    { value: 'BZD', label: 'BZD (BZ$)', symbol: 'BZ$' },
    { value: 'CAD', label: 'CAD ($)', symbol: '$' },
    { value: 'CDF', label: 'CDF (FC)', symbol: 'FC' },
    { value: 'CHF', label: 'CHF (CHF)', symbol: 'CHF' },
    { value: 'CLP', label: 'CLP ($)', symbol: '$' },
    { value: 'CNY', label: 'CNY (¥)', symbol: '¥' },
    { value: 'COP', label: 'COP ($)', symbol: '$' },
    { value: 'CRC', label: 'CRC (₡)', symbol: '₡' },
    { value: 'CUC', label: 'CUC ($)', symbol: '$' },
    { value: 'CUP', label: 'CUP (₱)', symbol: '₱' },
    { value: 'CVE', label: 'CVE (Esc)', symbol: 'Esc' },
    { value: 'CZK', label: 'CZK (Kč)', symbol: 'Kč' },
    { value: 'DJF', label: 'DJF (Fdj)', symbol: 'Fdj' },
    { value: 'DKK', label: 'DKK (kr)', symbol: 'kr' },
    { value: 'DOP', label: 'DOP (RD$)', symbol: 'RD$' },
    { value: 'DZD', label: 'DZD (دج)', symbol: 'دج' },
    { value: 'EGP', label: 'EGP (ج.م)', symbol: 'ج.م' },
    { value: 'ERN', label: 'ERN (Nfk)', symbol: 'Nfk' },
    { value: 'ETB', label: 'ETB (Br)', symbol: 'Br' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'FJD', label: 'FJD ($)', symbol: '$' },
    { value: 'FKP', label: 'FKP (£)', symbol: '£' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' },
    { value: 'GEL', label: 'GEL (₾)', symbol: '₾' },
    { value: 'GHS', label: 'GHS (₵)', symbol: '₵' },
    { value: 'GIP', label: 'GIP (£)', symbol: '£' },
    { value: 'GMD', label: 'GMD (D)', symbol: 'D' },
    { value: 'GNF', label: 'GNF (FG)', symbol: 'FG' },
    { value: 'GTQ', label: 'GTQ (Q)', symbol: 'Q' },
    { value: 'GYD', label: 'GYD ($)', symbol: '$' },
    { value: 'HKD', label: 'HKD ($)', symbol: '$' },
    { value: 'HNL', label: 'HNL (L)', symbol: 'L' },
    { value: 'HRK', label: 'HRK (kn)', symbol: 'kn' },
    { value: 'HTG', label: 'HTG (G)', symbol: 'G' },
    { value: 'HUF', label: 'HUF (Ft)', symbol: 'Ft' },
    { value: 'IDR', label: 'IDR (Rp)', symbol: 'Rp' },
    { value: 'ILS', label: 'ILS (₪)', symbol: '₪' },
    { value: 'INR', label: 'INR (Rs.)', symbol: 'Rs.' },
    { value: 'IQD', label: 'IQD (د.ع)', symbol: 'د.ع' },
    { value: 'IRR', label: 'IRR (﷼)', symbol: '﷼' },
    { value: 'ISK', label: 'ISK (kr)', symbol: 'kr' },
    { value: 'JMD', label: 'JMD (J$)', symbol: 'J$' },
    { value: 'JOD', label: 'JOD (JD)', symbol: 'JD' },
    { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
    { value: 'KES', label: 'KES (KSh)', symbol: 'KSh' },
    { value: 'KGS', label: 'KGS (с)', symbol: 'с' },
    { value: 'KHR', label: 'KHR (៛)', symbol: '៛' },
    { value: 'KMF', label: 'KMF (CF)', symbol: 'CF' },
    { value: 'KPW', label: 'KPW (₩)', symbol: '₩' },
    { value: 'KRW', label: 'KRW (₩)', symbol: '₩' },
    { value: 'KWD', label: 'KWD (د.ك)', symbol: 'د.ك' },
    { value: 'KYD', label: 'KYD ($)', symbol: '$' },
    { value: 'KZT', label: 'KZT (₸)', symbol: '₸' },
    { value: 'LAK', label: 'LAK (₭)', symbol: '₭' },
    { value: 'LBP', label: 'LBP (ل.ل)', symbol: 'ل.ل' },
    { value: 'LKR', label: 'LKR (Rs)', symbol: 'Rs' },
    { value: 'LRD', label: 'LRD ($)', symbol: '$' },
    { value: 'LSL', label: 'LSL (M)', symbol: 'M' },
    { value: 'LYD', label: 'LYD (ل.د)', symbol: 'ل.د' },
    { value: 'MAD', label: 'MAD (د.م.)', symbol: 'د.م.' },
    { value: 'MDL', label: 'MDL (L)', symbol: 'L' },
    { value: 'MGA', label: 'MGA (Ar)', symbol: 'Ar' },
    { value: 'MKD', label: 'MKD (ден)', symbol: 'ден' },
    { value: 'MMK', label: 'MMK (K)', symbol: 'K' },
    { value: 'MNT', label: 'MNT (₮)', symbol: '₮' },
    { value: 'MOP', label: 'MOP (MOP$)', symbol: 'MOP$' },
    { value: 'MRU', label: 'MRU (UM)', symbol: 'UM' },
    { value: 'MUR', label: 'MUR (₨)', symbol: '₨' },
    { value: 'MVR', label: 'MVR (Rf)', symbol: 'Rf' },
    { value: 'MWK', label: 'MWK (MK)', symbol: 'MK' },
    { value: 'MXN', label: 'MXN ($)', symbol: '$' },
    { value: 'MYR', label: 'MYR (RM)', symbol: 'RM' },
    { value: 'MZN', label: 'MZN (MT)', symbol: 'MT' },
    { value: 'NAD', label: 'NAD (N$)', symbol: 'N$' },
    { value: 'NGN', label: 'NGN (₦)', symbol: '₦' },
    { value: 'NIO', label: 'NIO (C$)', symbol: 'C$' },
    { value: 'NOK', label: 'NOK (kr)', symbol: 'kr' },
    { value: 'NPR', label: 'NPR (₨)', symbol: '₨' },
    { value: 'NZD', label: 'NZD ($)', symbol: '$' },
    { value: 'OMR', label: 'OMR (ر.ع.)', symbol: 'ر.ع.' },
    { value: 'PAB', label: 'PAB (B/.)', symbol: 'B/.' },
    { value: 'PEN', label: 'PEN (S/.)', symbol: 'S/.' },
    { value: 'PGK', label: 'PGK (K)', symbol: 'K' },
    { value: 'PHP', label: 'PHP (₱)', symbol: '₱' },
    { value: 'PKR', label: 'PKR (₨)', symbol: '₨' },
    { value: 'PLN', label: 'PLN (zł)', symbol: 'zł' },
    { value: 'PYG', label: 'PYG (₲)', symbol: '₲' },
    { value: 'QAR', label: 'QAR (ر.ق)', symbol: 'ر.ق' },
    { value: 'RON', label: 'RON (lei)', symbol: 'lei' },
    { value: 'RSD', label: 'RSD (дин)', symbol: 'дин' },
    { value: 'RUB', label: 'RUB (₽)', symbol: '₽' },
    { value: 'RWF', label: 'RWF (FRw)', symbol: 'FRw' },
    { value: 'SAR', label: 'SAR (﷼)', symbol: '﷼' },
    { value: 'SBD', label: 'SBD ($)', symbol: '$' },
    { value: 'SCR', label: 'SCR (₨)', symbol: '₨' },
    { value: 'SDG', label: 'SDG (ج.س.)', symbol: 'ج.س.' },
    { value: 'SEK', label: 'SEK (kr)', symbol: 'kr' },
    { value: 'SGD', label: 'SGD ($)', symbol: '$' },
    { value: 'SHP', label: 'SHP (£)', symbol: '£' },
    { value: 'SLL', label: 'SLL (Le)', symbol: 'Le' },
    { value: 'SOS', label: 'SOS (S)', symbol: 'S' },
    { value: 'SRD', label: 'SRD ($)', symbol: '$' },
    { value: 'SSP', label: 'SSP (£)', symbol: '£' },
    { value: 'STN', label: 'STN (Db)', symbol: 'Db' },
    { value: 'SYP', label: 'SYP (£)', symbol: '£' },
    { value: 'SZL', label: 'SZL (E)', symbol: 'E' },
    { value: 'THB', label: 'THB (฿)', symbol: '฿' },
    { value: 'TJS', label: 'TJS (SM)', symbol: 'SM' },
    { value: 'TMT', label: 'TMT (m)', symbol: 'm' },
    { value: 'TND', label: 'TND (د.ت)', symbol: 'د.ت' },
    { value: 'TOP', label: 'TOP (T$)', symbol: 'T$' },
    { value: 'TRY', label: 'TRY (₺)', symbol: '₺' },
    { value: 'TTD', label: 'TTD (TT$)', symbol: 'TT$' },
    { value: 'TWD', label: 'TWD (NT$)', symbol: 'NT$' },
    { value: 'TZS', label: 'TZS (TSh)', symbol: 'TSh' },
    { value: 'UAH', label: 'UAH (₴)', symbol: '₴' },
    { value: 'UGX', label: 'UGX (USh)', symbol: 'USh' },
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'UYU', label: 'UYU ($U)', symbol: '$U' },
    { value: 'UZS', label: 'UZS (сўм)', symbol: 'сўм' },
    { value: 'VES', label: 'VES (Bs.)', symbol: 'Bs.' },
    { value: 'VND', label: 'VND (₫)', symbol: '₫' },
    { value: 'VUV', label: 'VUV (VT)', symbol: 'VT' },
    { value: 'WST', label: 'WST (WS$)', symbol: 'WS$' },
    { value: 'XAF', label: 'XAF (FCFA)', symbol: 'FCFA' },
    { value: 'XCD', label: 'XCD (EC$)', symbol: 'EC$' },
    { value: 'XOF', label: 'XOF (CFA)', symbol: 'CFA' },
    { value: 'XPF', label: 'XPF (₣)', symbol: '₣' },
    { value: 'YER', label: 'YER (﷼)', symbol: '﷼' },
    { value: 'ZAR', label: 'ZAR (R)', symbol: 'R' },
    { value: 'ZMW', label: 'ZMW (ZK)', symbol: 'ZK' },
    { value: 'ZWL', label: 'ZWL (Z$)', symbol: 'Z$' },
  ];

  // Get currency symbol from currency value
  const getCurrencySymbol = (currencyValue) => {
    const currency = currencyOptions.find(option => option.value === currencyValue);
    // Add a space after some specific currency symbols for better readability in PDF
    const symbol = currency ? currency.symbol : '$';

    // For INR, use "Rs." instead of the Unicode symbol which doesn't render properly in PDF
    if (currencyValue === 'INR') {
      return 'Rs. ';  // Use "Rs." for Indian Rupee which renders properly in PDF
    }
    
    // For other currencies that need spacing
    if (currencyValue === 'EUR' || currencyValue === 'GBP' || currencyValue === 'JPY') {
      return symbol + ' ';  // Add a space after the symbol for better readability
    }

    return symbol;
  };

  // Format date to YYYY-MM-DD for input fields
  function formatDate(date) {
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  // Load user settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!session) return;

      setIsLoadingSettings(true);
      try {
        const settings = await getUserSettings();
        setUserSettings(settings);

        // Apply default settings to form
        setFormData(prev => ({
          ...prev,
          currency: settings.defaultCurrency || prev.currency,
          taxType: settings.defaultTaxRate > 0 ? 'standard' : 'none',
          taxRate: settings.defaultTaxRate?.toString() || '0',
          taxName: settings.defaultTaxName || ''
        }));
      } catch (error) {
        console.error('Error loading user settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [session]);

  // Load clients and business profiles on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;

      // Fetch clients
      setIsLoadingClients(true);
      try {
        const clientsData = await getClients();
        setClients(clientsData);

        // Check if there's a client ID in the URL query params
        const clientIdFromUrl = searchParams.get('client');
        if (clientIdFromUrl) {
          // Set the client ID in the form
          setFormData(prev => ({ ...prev, clientId: clientIdFromUrl }));

          // Load client details
          const client = await getClientById(clientIdFromUrl);
          if (client) {
            // Format client details for the toDetails field
            const clientDetails = [
              client.name,
              client.address,
              client.city ? `${client.city}${client.state ? ', ' + client.state : ''}${client.postalCode ? ' ' + client.postalCode : ''}` : '',
              client.country,
              client.email,
              client.phone,
              client.taxId ? `Tax ID: ${client.taxId}` : ''
            ].filter(Boolean).join('\n');

            setFormData(prev => ({ ...prev, toDetails: clientDetails }));
          }
        }
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setIsLoadingClients(false);
      }

      // Fetch business profiles
      setIsLoadingProfiles(true);
      try {
        const profiles = await getBusinessProfiles();
        setBusinessProfiles(profiles);
      } catch (error) {
        console.error('Error loading business profiles:', error);
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    fetchData();
  }, [session, searchParams]);

  // Calculate due date based on payment terms and issue date
  useEffect(() => {
    // Only calculate due date if both issue date and payment terms are provided
    if (formData.issueDate && formData.paymentTerms) {
      const issueDate = new Date(formData.issueDate);
      let dueDate = new Date(issueDate);

      switch (formData.paymentTerms) {
        case 'NET7':
          dueDate.setDate(issueDate.getDate() + 7);
          break;
        case 'NET15':
          dueDate.setDate(issueDate.getDate() + 15);
          break;
        case 'NET30':
          dueDate.setDate(issueDate.getDate() + 30);
          break;
        case 'NET45':
          dueDate.setDate(issueDate.getDate() + 45);
          break;
        case 'NET60':
          dueDate.setDate(issueDate.getDate() + 60);
          break;
        case 'DUE_ON_RECEIPT':
          // Due date is the same as issue date
          break;
        default:
          break;
      }

      setFormData(prev => ({
        ...prev,
        dueDate: formatDate(dueDate)
      }));
    }
  }, [formData.issueDate, formData.paymentTerms]);

  // Calculate item amount
  const calculateItemAmount = (quantity, rate, discount, discountType) => {
    const qty = parseFloat(quantity) || 0;
    const rt = parseFloat(rate) || 0;
    const disc = parseFloat(discount) || 0;

    let amount = qty * rt;

    if (discountType === '%') {
      amount = amount - (amount * (disc / 100));
    } else {
      amount = amount - disc;
    }

    return parseFloat(amount.toFixed(2));
  };

  // Calculate invoice totals with enhanced tax calculation
  const calculateTotals = (items, discount, discountType, taxInfo, shipping) => {
    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

    // Calculate discount
    let discountAmount = 0;
    if (discountType === '%') {
      discountAmount = subtotal * (parseFloat(discount) || 0) / 100;
    } else {
      discountAmount = parseFloat(discount) || 0;
    }

    // Net amount after discount
    const netAmount = subtotal - discountAmount;

    // Calculate tax based on tax type
    let totalTaxAmount = 0;
    let updatedTaxes = [];

    if (taxInfo.taxType === 'none') {
      totalTaxAmount = 0;
    } else if (taxInfo.taxType === 'standard') {
      const taxRate = parseFloat(taxInfo.taxRate) || 0;
      totalTaxAmount = calculateTaxAmount(netAmount, taxRate);

      // For standard tax, we still want to track it in the taxes array for consistency
      if (taxRate > 0) {
        updatedTaxes = [{
          name: taxInfo.taxName || getTaxName(taxRate),
          rate: taxRate,
          amount: totalTaxAmount
        }];
      } else {
        updatedTaxes = [];
      }
    } else if (taxInfo.taxType === 'multiple') {
      // For multiple taxes, calculate each tax and sum them
      updatedTaxes = taxInfo.taxes.map(tax => {
        const rate = parseFloat(tax.rate) || 0;
        const amount = calculateTaxAmount(netAmount, rate);
        return {
          ...tax,
          amount: parseFloat(amount.toFixed(2))
        };
      });

      totalTaxAmount = updatedTaxes.reduce((sum, tax) => sum + tax.amount, 0);
    }

    // Calculate total
    const shippingAmount = parseFloat(shipping) || 0;
    const total = netAmount + totalTaxAmount + shippingAmount;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(totalTaxAmount.toFixed(2)),
      taxes: updatedTaxes,
      total: parseFloat(total.toFixed(2))
    };
  };

  // Calculate all values whenever relevant form data changes
  useEffect(() => {
    const calculateValues = () => {
      // Calculate item amounts
      const updatedItems = formData.items.map(item => ({
        ...item,
        amount: calculateItemAmount(item.quantity, item.rate, item.discount, item.discountType)
      }));

      // Prepare tax info object
      const taxInfo = {
        taxType: formData.taxType,
        taxRate: formData.taxRate,
        taxName: formData.taxName,
        taxes: formData.taxes
      };

      // Calculate totals
      const { subtotal, taxAmount, taxes, total } = calculateTotals(
        updatedItems,
        formData.discount,
        formData.discountType,
        taxInfo,
        formData.shipping
      );

      // Only update if values have changed
      if (
        JSON.stringify(updatedItems) !== JSON.stringify(formData.items) ||
        subtotal !== formData.subtotal ||
        taxAmount !== formData.taxAmount ||
        JSON.stringify(taxes) !== JSON.stringify(formData.taxes) ||
        total !== formData.total
      ) {
        setFormData(prev => ({
          ...prev,
          items: updatedItems,
          subtotal,
          taxAmount,
          taxes,
          total
        }));
      }
    };

    calculateValues();
  }, [
    formData.items,
    formData.discount,
    formData.discountType,
    formData.taxType,
    formData.taxRate,
    formData.taxName,
    formData.taxes,
    formData.shipping,
    formData.subtotal,
    formData.taxAmount,
    formData.total
  ]);

  // Handle client selection
  const handleClientChange = async (e) => {
    const clientId = e.target.value;

    setFormData(prev => ({ ...prev, clientId }));

    if (clientId) {
      try {
        const client = await getClientById(clientId);
        if (client) {
          // Format client details for the toDetails field
          const clientDetails = [
            client.name,
            client.address,
            client.city ? `${client.city}${client.state ? ', ' + client.state : ''}${client.postalCode ? ' ' + client.postalCode : ''}` : '',
            client.country,
            client.email,
            client.phone,
            client.taxId ? `Tax ID: ${client.taxId}` : ''
          ].filter(Boolean).join('\n');

          setFormData(prev => ({ ...prev, toDetails: clientDetails }));
        }
      } catch (error) {
        console.error('Error loading client details:', error);
      }
    } else {
      // Clear the toDetails field if no client is selected
      setFormData(prev => ({ ...prev, toDetails: '' }));
    }
  };

  // Handle business profile selection
  const handleBusinessProfileChange = async (e) => {
    const profileId = e.target.value;

    setFormData(prev => ({ ...prev, businessProfileId: profileId }));

    if (profileId) {
      try {
        const profile = await getBusinessProfileById(profileId);
        if (profile) {
          // Format business profile details for the fromDetails field
          const profileDetails = [
            profile.name,
            profile.address,
            profile.city ? `${profile.city}${profile.state ? ', ' + profile.state : ''}${profile.postalCode ? ' ' + profile.postalCode : ''}` : '',
            profile.country,
            profile.phone,
            profile.email,
            profile.website,
            profile.taxId ? `Tax ID: ${profile.taxId}` : ''
          ].filter(Boolean).join('\n');

          // Update logo if available
          if (profile.logoUrl) {
            setFormData(prev => ({
              ...prev,
              fromDetails: profileDetails,
              logoPreview: profile.logoUrl,
              bankDetails: profile.bankDetails || prev.bankDetails
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              fromDetails: profileDetails,
              bankDetails: profile.bankDetails || prev.bankDetails
            }));
          }
        }
      } catch (error) {
        console.error('Error loading business profile details:', error);
      }
    } else {
      // Clear the fromDetails field if no profile is selected
      setFormData(prev => ({ ...prev, fromDetails: '' }));
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updatedData = { ...prev, [name]: value };

      // Handle tax type change
      if (name === 'taxType') {
        if (value === 'none') {
          updatedData.taxRate = '0';
          updatedData.taxName = '';
          updatedData.taxes = [];
        } else if (value === 'standard') {
          // If switching to standard tax and we had multiple taxes before,
          // we can initialize with the first tax or default to 0
          if (prev.taxes.length > 0) {
            updatedData.taxRate = prev.taxes[0].rate.toString();
            updatedData.taxName = prev.taxes[0].name;
          } else {
            updatedData.taxRate = '0';
            updatedData.taxName = '';
          }
        } else if (value === 'multiple') {
          // If switching to multiple taxes and we had a standard tax before,
          // we can initialize with that tax
          if (parseFloat(prev.taxRate) > 0) {
            updatedData.taxes = [{
              id: 1,
              name: prev.taxName || getTaxName(prev.taxRate),
              rate: parseFloat(prev.taxRate),
              amount: 0
            }];
          } else if (prev.taxes.length === 0) {
            // Initialize with an empty tax entry
            updatedData.taxes = [{
              id: 1,
              name: 'Tax',
              rate: 0,
              amount: 0
            }];
          }
        }
      }

      // Recalculate totals if a relevant field changed
      if (
        name === 'discount' ||
        name === 'discountType' ||
        name === 'taxType' ||
        name === 'taxRate' ||
        name === 'taxName' ||
        name === 'shipping'
      ) {
        const taxInfo = {
          taxType: name === 'taxType' ? value : prev.taxType,
          taxRate: name === 'taxRate' ? value : prev.taxRate,
          taxName: name === 'taxName' ? value : prev.taxName,
          taxes: prev.taxes
        };

        const { subtotal, taxAmount, taxes, total } = calculateTotals(
          prev.items,
          name === 'discount' ? value : prev.discount,
          name === 'discountType' ? value : prev.discountType,
          taxInfo,
          name === 'shipping' ? value : prev.shipping
        );

        updatedData.subtotal = subtotal;
        updatedData.taxAmount = taxAmount;
        updatedData.taxes = taxes;
        updatedData.total = total;
      }

      return updatedData;
    });
  };

  // Handle item field changes
  const handleItemChange = (id, field, value) => {
    setFormData(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate amount if a relevant field changed
          if (field === 'quantity' || field === 'rate' || field === 'discount' || field === 'discountType') {
            updatedItem.amount = calculateItemAmount(
              field === 'quantity' ? value : updatedItem.quantity,
              field === 'rate' ? value : updatedItem.rate,
              field === 'discount' ? value : updatedItem.discount,
              field === 'discountType' ? value : updatedItem.discountType
            );
          }

          return updatedItem;
        }
        return item;
      });

      // Prepare tax info
      const taxInfo = {
        taxType: prev.taxType,
        taxRate: prev.taxRate,
        taxName: prev.taxName,
        taxes: prev.taxes
      };

      // Calculate new subtotal and total
      const { subtotal, taxAmount, taxes, total } = calculateTotals(
        updatedItems,
        prev.discount,
        prev.discountType,
        taxInfo,
        prev.shipping
      );

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        taxAmount,
        taxes,
        total
      };
    });
  };

  // Add new item
  const addItem = () => {
    const newId = Math.max(...formData.items.map(item => item.id), 0) + 1;
    setFormData(prev => {
      const updatedItems = [
        ...prev.items,
        {
          id: newId,
          description: '',
          quantity: 1,
          rate: 0,
          discount: 0,
          discountType: '%',
          amount: 0
        }
      ];

      // Prepare tax info
      const taxInfo = {
        taxType: prev.taxType,
        taxRate: prev.taxRate,
        taxName: prev.taxName,
        taxes: prev.taxes
      };

      // Recalculate totals
      const { subtotal, taxAmount, taxes, total } = calculateTotals(
        updatedItems,
        prev.discount,
        prev.discountType,
        taxInfo,
        prev.shipping
      );

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        taxAmount,
        taxes,
        total
      };
    });
  };

  // Remove item
  const removeItem = (id) => {
    if (formData.items.length > 1) {
      setFormData(prev => {
        const updatedItems = prev.items.filter(item => item.id !== id);

        // Prepare tax info
        const taxInfo = {
          taxType: prev.taxType,
          taxRate: prev.taxRate,
          taxName: prev.taxName,
          taxes: prev.taxes
        };

        // Recalculate totals
        const { subtotal, taxAmount, taxes, total } = calculateTotals(
          updatedItems,
          prev.discount,
          prev.discountType,
          taxInfo,
          prev.shipping
        );

        return {
          ...prev,
          items: updatedItems,
          subtotal,
          taxAmount,
          taxes,
          total
        };
      });
    }
  };

  // Add a new tax for multiple tax mode
  const addTax = () => {
    setFormData(prev => {
      if (prev.taxType !== 'multiple') return prev;

      const newId = prev.taxes.length > 0
        ? Math.max(...prev.taxes.map(tax => tax.id)) + 1
        : 1;

      const updatedTaxes = [
        ...prev.taxes,
        {
          id: newId,
          name: 'Tax',
          rate: 0,
          amount: 0
        }
      ];

      // Recalculate with the new tax
      const taxInfo = {
        taxType: prev.taxType,
        taxRate: prev.taxRate,
        taxName: prev.taxName,
        taxes: updatedTaxes
      };

      const { subtotal, taxAmount, taxes, total } = calculateTotals(
        prev.items,
        prev.discount,
        prev.discountType,
        taxInfo,
        prev.shipping
      );

      return {
        ...prev,
        taxes: taxes,
        taxAmount,
        total
      };
    });
  };

  // Remove a tax from multiple tax mode
  const removeTax = (id) => {
    setFormData(prev => {
      if (prev.taxType !== 'multiple' || prev.taxes.length <= 1) return prev;

      const updatedTaxes = prev.taxes.filter(tax => tax.id !== id);

      // Recalculate with the updated taxes
      const taxInfo = {
        taxType: prev.taxType,
        taxRate: prev.taxRate,
        taxName: prev.taxName,
        taxes: updatedTaxes
      };

      const { subtotal, taxAmount, taxes, total } = calculateTotals(
        prev.items,
        prev.discount,
        prev.discountType,
        taxInfo,
        prev.shipping
      );

      return {
        ...prev,
        taxes,
        taxAmount,
        total
      };
    });
  };

  // Handle tax field changes for multiple taxes
  const handleTaxChange = (id, field, value) => {
    setFormData(prev => {
      if (prev.taxType !== 'multiple') return prev;

      const updatedTaxes = prev.taxes.map(tax => {
        if (tax.id === id) {
          return { ...tax, [field]: value };
        }
        return tax;
      });

      // Recalculate with the updated tax
      const taxInfo = {
        taxType: prev.taxType,
        taxRate: prev.taxRate,
        taxName: prev.taxName,
        taxes: updatedTaxes
      };

      const { subtotal, taxAmount, taxes, total } = calculateTotals(
        prev.items,
        prev.discount,
        prev.discountType,
        taxInfo,
        prev.shipping
      );

      return {
        ...prev,
        taxes,
        taxAmount,
        total
      };
    });
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 1024 * 1024) { // 1MB limit
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: file,
          logoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert('File size exceeds 1MB limit');
    }
  };



  // PDF generation is handled directly by jsPDF

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      logo: null,
      logoPreview: null,
      invoiceNumber: '',
      paymentTerms: '',
      issueDate: '',
      dueDate: '',
      currency: userSettings?.currency || 'USD',
      clientId: '',
      businessProfileId: '',
      fromDetails: '',
      toDetails: '',
      items: [
        {
          id: 1,
          description: '',
          quantity: '',
          rate: '',
          discount: '',
          discountType: '%',
          amount: 0
        }
      ],
      subtotal: 0,
      discount: '',
      discountType: '%',
      taxType: 'standard',
      taxRate: '0',
      taxName: '',
      taxAmount: 0,
      taxes: [],
      shipping: '',
      total: 0,
      paymentMethod: '',
      bankDetails: '',
      paypalId: '',
      upiId: '',
      paymentLink: '',
      notes: '',
      terms: ''
    });
  };

  // Scroll to element
  const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      // Focus the element after scrolling
      setTimeout(() => {
        element.focus();
      }, 500);
    }
  };

  // Validate individual field
  const validateField = (fieldName, value, shouldScroll = false) => {
    let error = '';
    
    switch (fieldName) {
      case 'invoiceNumber':
        if (!value.trim()) {
          error = 'Invoice Number is required';
          if (shouldScroll) scrollToElement('invoiceNumber');
        }
        break;
      case 'issueDate':
        if (!value) {
          error = 'Issue Date is required';
          if (shouldScroll) scrollToElement('issueDate');
        }
        break;
      case 'dueDate':
        if (!value) {
          error = 'Due Date is required';
          if (shouldScroll) scrollToElement('dueDate');
        }
        break;
      case 'fromDetails':
        if (!value.trim()) {
          error = 'From Details (Sender Information) is required';
          if (shouldScroll) scrollToElement('fromDetails');
        }
        break;
      case 'toDetails':
        if (!value.trim()) {
          error = 'To Details (Client Information) is required';
          if (shouldScroll) scrollToElement('toDetails');
        }
        break;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    return !error;
  };

  // Validate item fields
  const validateItemField = (itemId, fieldName, value, shouldScroll = false) => {
    let error = '';
    
    switch (fieldName) {
      case 'description':
        if (!value.trim()) {
          error = 'Description is required';
          if (shouldScroll) {
            // Find the specific item container and then the description field
            const itemContainer = document.querySelector(`div[data-item-id="${itemId}"]`);
            if (itemContainer) {
              const descriptionField = itemContainer.querySelector('input[placeholder="Item description"]');
              if (descriptionField) {
                descriptionField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => descriptionField.focus(), 500);
              }
            }
          }
        }
        break;
      case 'quantity':
        if (!value || parseFloat(value) <= 0) {
          error = 'Quantity must be greater than 0';
          if (shouldScroll) {
            const itemContainer = document.querySelector(`div[data-item-id="${itemId}"]`);
            if (itemContainer) {
              const quantityField = itemContainer.querySelector('input[placeholder="1"]');
              if (quantityField) {
                quantityField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => quantityField.focus(), 500);
              }
            }
          }
        }
        break;
      case 'rate':
        if (!value || parseFloat(value) <= 0) {
          error = 'Rate must be greater than 0';
          if (shouldScroll) {
            const itemContainer = document.querySelector(`div[data-item-id="${itemId}"]`);
            if (itemContainer) {
              // Find rate field (there might be multiple 0.00 placeholders, so be more specific)
              const rateFields = itemContainer.querySelectorAll('input[placeholder="0.00"]');
              // Rate field is usually the first one (before discount)
              const rateField = rateFields[0];
              if (rateField) {
                rateField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => rateField.focus(), 500);
              }
            }
          }
        }
        break;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [`item_${itemId}_${fieldName}`]: error
    }));
    
    return !error;
  };

  // Validate form step by step
  const validateFormStepByStep = () => {
    // Clear all errors first
    setFieldErrors({});
    
    // Validate fields one by one
    if (!validateField('invoiceNumber', formData.invoiceNumber, true)) {
      return false;
    }
    
    if (!validateField('issueDate', formData.issueDate, true)) {
      return false;
    }
    
    if (!validateField('dueDate', formData.dueDate, true)) {
      return false;
    }
    
    if (!validateField('fromDetails', formData.fromDetails, true)) {
      return false;
    }
    
    if (!validateField('toDetails', formData.toDetails, true)) {
      return false;
    }
    
    // Validate items
    for (const item of formData.items) {
      if (!validateItemField(item.id, 'description', item.description, true)) {
        return false;
      }
      if (!validateItemField(item.id, 'quantity', item.quantity, true)) {
        return false;
      }
      if (!validateItemField(item.id, 'rate', item.rate, true)) {
        return false;
      }
    }
    
    return true;
  };

  // Handle create invoice button click
  const handleCreateInvoice = async () => {
    try {
      // Check if user is authenticated
      if (!session) {
        alert('Please sign in to create an invoice');
        return;
      }

      // Validate form step by step
      if (!validateFormStepByStep()) {
        return;
      }



      // Save invoice to database
      try {
        // Import the addInvoice function from our real service
        const { addInvoice } = await import('../services/invoiceService');

        // Add the invoice to the database with the user's ID
        const result = await addInvoice(formData, session.user.id);

        if (!result.success) {
          throw new Error(result.error || 'Failed to save invoice');
        }

        console.log('Invoice saved successfully with ID:', result.id);
      } catch (error) {
        console.error('Error saving invoice:', error);
        
        // Check if it's a limit reached error
        if (error.type === 'LIMIT_REACHED') {
          alert(error.message + '\n\nClick "Upgrade Now" on your dashboard to unlock unlimited invoices.');
          return;
        } else if (typeof error.message === 'string' && (error.message.includes('limit') || error.message.includes('reached'))) {
          alert('You have reached your monthly invoice limit. Please upgrade your plan to create more invoices.');
          return;
        }
        
        // Generic error handling
        alert('Failed to save invoice: ' + error.message);
        return;
      }

      // Create a new PDF directly with jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Apply PDF styling from user settings
      const pdfStyling = userSettings?.pdfStyling || {
        primaryColor: '#3b82f6',
        secondaryColor: '#f3f4f6',
        fontFamily: 'Helvetica',
        fontSize: 10,
        logoPosition: 'right',
        showBankDetails: true,
        showFooter: true,
        footerText: 'Thank you for your business!'
      };

      // Set font based on user settings with fallback for special characters
      try {
        pdf.setFont(pdfStyling.fontFamily.toLowerCase());
      } catch (error) {
        console.warn('Font not supported, using default font', error);
        pdf.setFont('helvetica');
      }

      // Set font size based on user settings
      pdf.setFontSize(pdfStyling.fontSize);

      // Add logo if available
      if (formData.logoPreview) {
        try {
          // Add logo image to PDF
          const logoWidth = 40; // Width in mm
          const logoHeight = 20; // Height in mm

          // Determine image format from data URL
          let format = 'JPEG';
          if (formData.logoPreview.includes('data:image/png')) {
            format = 'PNG';
          } else if (formData.logoPreview.includes('data:image/svg')) {
            format = 'SVG';
          }

          // Position logo based on user settings
          let logoX = 20; // Default left position

          if (pdfStyling.logoPosition === 'right') {
            logoX = 150;
          } else if (pdfStyling.logoPosition === 'center') {
            logoX = 85;
          }

          pdf.addImage(formData.logoPreview, format, logoX, 10, logoWidth, logoHeight);
        } catch (error) {
          console.error('Error adding logo to PDF:', error);
        }
      }

      // Add title with primary color from settings
      pdf.setFontSize(24);

      // Convert hex color to RGB for jsPDF
      const primaryColorHex = pdfStyling.primaryColor.replace('#', '');
      const r = parseInt(primaryColorHex.substring(0, 2), 16);
      const g = parseInt(primaryColorHex.substring(2, 4), 16);
      const b = parseInt(primaryColorHex.substring(4, 6), 16);

      pdf.setTextColor(r, g, b);
      pdf.text('INVOICE', 20, 20);

      // Reset text color to black for normal text
      pdf.setTextColor(0, 0, 0);

      // Add invoice number
      pdf.setFontSize(12);
      pdf.text(`Invoice #: ${formData.invoiceNumber}`, 20, 30);

      // Add dates
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      pdf.text(`Issue Date: ${formatDate(formData.issueDate)}`, 20, 40);
      pdf.text(`Due Date: ${formatDate(formData.dueDate)}`, 20, 50);

      // Add from and to sections with primary color
      pdf.setFontSize(14);
      pdf.setTextColor(r, g, b);
      pdf.text('From:', 20, 70);
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      // Handle From section with proper checks
      if (formData.fromDetails && formData.fromDetails.trim()) {
        // Use text with max width to force line breaks
        const fromText = formData.fromDetails.trim();
        const fromLines = pdf.splitTextToSize(fromText, 80); // Set max width to 80mm
        pdf.text(fromLines, 20, 80);
      } else {
        pdf.text("No sender information provided", 20, 80);
      }

      pdf.setFontSize(14);
      pdf.setTextColor(r, g, b);
      pdf.text('Bill To:', 120, 70);
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      // Handle Bill To section with proper checks
      if (formData.toDetails && formData.toDetails.trim()) {
        // Use text with max width to force line breaks
        const toText = formData.toDetails.trim();
        const toLines = pdf.splitTextToSize(toText, 70); // Set max width to 70mm
        pdf.text(toLines, 120, 80);
      } else {
        pdf.text("No recipient information provided", 120, 80);
      }

      // Add items table with primary color
      const startY = 120;
      pdf.setFontSize(12);
      pdf.setTextColor(r, g, b);
      pdf.text('Items', 20, startY);
      pdf.setTextColor(0, 0, 0);

      // Table headers
      pdf.setFontSize(10);
      pdf.text('Description', 20, startY + 10);
      pdf.text('Qty', 100, startY + 10);
      pdf.text('Rate', 120, startY + 10);
      pdf.text('Discount', 150, startY + 10);  // Moved Discount header to position 150 (was 145)
      pdf.text('Amount', 175, startY + 10);  // Adjusted Amount position to 175 (was 170)

      // Draw header line with secondary color
      // Convert hex color to RGB for jsPDF
      const secondaryColorHex = pdfStyling.secondaryColor.replace('#', '');
      const sr = parseInt(secondaryColorHex.substring(0, 2), 16);
      const sg = parseInt(secondaryColorHex.substring(2, 4), 16);
      const sb = parseInt(secondaryColorHex.substring(4, 6), 16);

      pdf.setDrawColor(sr, sg, sb);
      pdf.setLineWidth(0.5);
      pdf.line(20, startY + 12, 190, startY + 12);

      // Table rows
      let currentY = startY + 20;
      formData.items.forEach((item, index) => {
        // Ensure description is properly trimmed and not empty
        const description = item.description ? item.description.trim().substring(0, 40) : "Item";
        pdf.text(description, 20, currentY);

        // Format quantity
        pdf.text(item.quantity.toString(), 100, currentY);

        // Format rate with currency symbol
        const rate = parseFloat(item.rate) || 0;
        pdf.text(`${getCurrencySymbol(formData.currency)}${parseFloat(rate).toFixed(2)}`, 120, currentY);

        // Format discount
        const discount = parseFloat(item.discount) || 0;
        const discountText = item.discountType === '%'
          ? `${discount}%`
          : `${getCurrencySymbol(formData.currency)}${parseFloat(discount).toFixed(2)}`;
        pdf.text(discountText, 150, currentY);  // Moved Discount value to position 150 (was 145)

        // Format amount
        const amount = parseFloat(item.amount) || 0;
        pdf.text(`${getCurrencySymbol(formData.currency)}${parseFloat(amount).toFixed(2)}`, 175, currentY);  // Adjusted Amount position to 175 (was 170)

        currentY += 10;
      });

      // Draw table bottom line with secondary color
      pdf.setDrawColor(sr, sg, sb);
      pdf.setLineWidth(0.5);
      pdf.line(20, currentY + 2, 190, currentY + 2);

      // Add totals
      currentY += 10;
      pdf.text('Subtotal:', 140, currentY);
      const subtotal = parseFloat(formData.subtotal) || 0;
      pdf.text(`${getCurrencySymbol(formData.currency)}${parseFloat(subtotal).toFixed(2)}`, 175, currentY); // Updated position to 175 (was 170)

      const discount = parseFloat(formData.discount) || 0;
      if (discount > 0) {
        currentY += 8;
        const discountText = formData.discountType === '%'
          ? `Discount (${discount}%):`
          : `Discount:`;
        pdf.text(discountText, 140, currentY);

        const discountAmount = formData.discountType === '%'
          ? (subtotal * discount / 100)
          : discount;
        pdf.text(`${getCurrencySymbol(formData.currency)}${parseFloat(discountAmount).toFixed(2)}`, 175, currentY); // Updated position to 175 (was 170)
      }

      // Handle taxes based on tax type
      if (formData.taxType === 'standard') {
        const taxRate = parseFloat(formData.taxRate) || 0;
        if (taxRate > 0) {
          currentY += 8;
          const taxName = formData.taxName || getTaxName(taxRate);
          pdf.text(`${taxName} (${taxRate}%):`, 140, currentY);
          pdf.text(`${getCurrencySymbol(formData.currency)}${parseFloat(formData.taxAmount || 0).toFixed(2)}`, 175, currentY); // Updated position to 175 (was 170)
        }
      } else if (formData.taxType === 'multiple' && formData.taxes.length > 0) {
        // Display each tax on a separate line
        formData.taxes.forEach(tax => {
          if (parseFloat(tax.rate) > 0) {
            currentY += 8;
            pdf.text(`${tax.name} (${tax.rate}%):`, 140, currentY);
            pdf.text(`${getCurrencySymbol(formData.currency)}${parseFloat(tax.amount || 0).toFixed(2)}`, 175, currentY); // Updated position to 175 (was 170)
          }
        });
      }

      const shipping = parseFloat(formData.shipping) || 0;
      if (shipping > 0) {
        currentY += 8;
        pdf.text('Shipping:', 140, currentY);
        pdf.text(`${getCurrencySymbol(formData.currency)}${parseFloat(shipping).toFixed(2)}`, 175, currentY); // Updated position to 175 (was 170)
      }

      // Total with primary color
      currentY += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(r, g, b);
      pdf.text('Total:', 140, currentY);
      pdf.setTextColor(0, 0, 0);
      const total = parseFloat(formData.total) || 0;
      pdf.text(`${getCurrencySymbol(formData.currency)}${parseFloat(total || 0).toFixed(2)}`, 175, currentY); // Updated position to 175 (was 170)

      // Payment method with primary color
      currentY += 20;
      pdf.setFontSize(12);
      pdf.setTextColor(r, g, b);
      pdf.text('Payment Method:', 20, currentY);
      pdf.setTextColor(0, 0, 0);

      pdf.setFontSize(10);
      let paymentMethodText = '';
      switch(formData.paymentMethod) {
        case 'bankTransfer': paymentMethodText = 'Bank Transfer'; break;
        case 'paypal': paymentMethodText = 'PayPal'; break;
        case 'upi': paymentMethodText = 'UPI'; break;
        case 'paymentLink': paymentMethodText = 'Payment Link'; break;
        case 'cash': paymentMethodText = 'Cash'; break;
        default: paymentMethodText = formData.paymentMethod;
      }

      pdf.text(paymentMethodText, 20, currentY + 8);

      // Payment details based on payment method
      if (pdfStyling.showBankDetails) {
        currentY += 15;

        // Check if we need to add a new page for payment details
        if (currentY > 250) {
          pdf.addPage();
          currentY = 20;
        }

        // Bank Transfer details
        if (formData.paymentMethod === 'bankTransfer' && formData.bankDetails && formData.bankDetails.trim()) {
          pdf.setTextColor(r, g, b);
          pdf.text('Bank Details:', 20, currentY);
          pdf.setTextColor(0, 0, 0);

          // Use text with max width to force line breaks
          const bankText = formData.bankDetails.trim();
          const bankLines = pdf.splitTextToSize(bankText, 150); // Set max width to 150mm

          // Check if bank details will go off the page and add a new page if needed
          if (currentY + 8 + (bankLines.length * 5) > 280) {
            pdf.addPage();
            currentY = 20;
            pdf.text('Bank Details (continued):', 20, currentY);
          }

          pdf.text(bankLines, 20, currentY + 8);

          // Adjust currentY based on the number of lines
          currentY += 8 + (bankLines.length * 5);
        }

        // PayPal details
        else if (formData.paymentMethod === 'paypal' && formData.paypalId && formData.paypalId.trim()) {
          pdf.setTextColor(r, g, b);
          pdf.text('PayPal Payment:', 20, currentY);
          pdf.setTextColor(0, 0, 0);

          pdf.text(`Please send payment to PayPal ID: ${formData.paypalId.trim()}`, 20, currentY + 8);

          // Adjust currentY
          currentY += 15;
        }

        // UPI details
        else if (formData.paymentMethod === 'upi' && formData.upiId && formData.upiId.trim()) {
          pdf.setTextColor(r, g, b);
          pdf.text('UPI Payment:', 20, currentY);
          pdf.setTextColor(0, 0, 0);

          pdf.text(`Please send payment to UPI ID: ${formData.upiId.trim()}`, 20, currentY + 8);

          // Adjust currentY
          currentY += 15;
        }

        // Payment Link details
        else if (formData.paymentMethod === 'paymentLink' && formData.paymentLink && formData.paymentLink.trim()) {
          pdf.setTextColor(r, g, b);
          pdf.text('Online Payment:', 20, currentY);
          pdf.setTextColor(0, 0, 0);

          pdf.text(`Please make payment using this link: ${formData.paymentLink.trim()}`, 20, currentY + 8);

          // Adjust currentY
          currentY += 15;
        }

        // Cash payment
        else if (formData.paymentMethod === 'cash') {
          pdf.setTextColor(r, g, b);
          pdf.text('Payment Method:', 20, currentY);
          pdf.setTextColor(0, 0, 0);

          pdf.text('Please pay in cash upon delivery or service completion.', 20, currentY + 8);

          // Adjust currentY
          currentY += 15;
        }
      }

      // Check if we need to add a new page for notes and terms
      if ((currentY > 230) && (formData.notes || formData.terms)) {
        pdf.addPage();
        currentY = 20; // Reset Y position for the new page
      }

      // Notes and terms
      if (formData.notes && formData.notes.trim()) {
        currentY += 15;
        pdf.setFontSize(12);
        pdf.setTextColor(r, g, b);
        pdf.text('Notes:', 20, currentY);
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);

        // Use text with max width to force line breaks
        const notesText = formData.notes.trim();
        const noteLines = pdf.splitTextToSize(notesText, 150); // Set max width to 150mm

        // Check if notes will go off the page and add a new page if needed
        if (currentY + 8 + (noteLines.length * 5) > 280) {
          pdf.addPage();
          currentY = 20;
          pdf.setFontSize(12);
          pdf.text('Notes (continued):', 20, currentY);
          pdf.setFontSize(10);
        }

        pdf.text(noteLines, 20, currentY + 8);

        // Adjust currentY based on the number of lines
        currentY += 8 + (noteLines.length * 5);
      }

      if (formData.terms && formData.terms.trim()) {
        currentY += 15;

        // Check if terms will go off the page and add a new page if needed
        if (currentY > 250) {
          pdf.addPage();
          currentY = 20;
        }

        pdf.setFontSize(12);
        pdf.setTextColor(r, g, b);
        pdf.text('Terms and Conditions:', 20, currentY);
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);

        // Use text with max width to force line breaks
        const termsText = formData.terms.trim();
        const termLines = pdf.splitTextToSize(termsText, 150); // Set max width to 150mm

        // Check if terms will go off the page and add a new page if needed
        if (currentY + 8 + (termLines.length * 5) > 280) {
          pdf.addPage();
          currentY = 20;
          pdf.setFontSize(12);
          pdf.text('Terms and Conditions (continued):', 20, currentY);
          pdf.setFontSize(10);
        }

        pdf.text(termLines, 20, currentY + 8);
      }

      // Add footer if enabled in settings
      if (pdfStyling.showFooter) {
        pdf.setFontSize(pdfStyling.fontSize);
        pdf.setTextColor(100, 100, 100);
        pdf.text(pdfStyling.footerText, 105, 280, { align: 'center' });
      }

      // Save the PDF
      pdf.save(`Invoice-${formData.invoiceNumber}.pdf`);

      // Reset form after successful invoice creation
      resetForm();

    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Invoice Details</h1>



      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Logo Upload Section */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-6 h-full">
              {formData.logoPreview ? (
                <div className="relative w-full h-32 mb-4">
                  <Image
                    src={formData.logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 300px"
                    quality={80}
                    loading="lazy"
                    onLoad={() => {
                      // Optimize image rendering
                      window.requestAnimationFrame(() => {
                        window.requestAnimationFrame(() => {
                          document.body.style.opacity = 1;
                        });
                      });
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              )}
              <p className="text-sm text-center text-gray-600 mb-2">Upload logo</p>
              <p className="text-xs text-center text-gray-500 mb-4">Supported formats: JPG, PNG, SVG</p>
              <p className="text-xs text-center text-gray-500 mb-4">Recommended size: 500px × 500px</p>
              <label className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium py-2 px-4 rounded-md cursor-pointer transition-colors">
                Upload
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.svg"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
              <p className="text-xs text-center text-gray-500 mt-4">Max upload size: 1 MB</p>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Invoice Number */}
              <div>
                <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="invoiceNumber"
                  name="invoiceNumber"
                  placeholder="INV-0001"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
                    fieldErrors.invoiceNumber 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {fieldErrors.invoiceNumber && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.invoiceNumber}</p>
                )}
              </div>

              {/* Payment Terms */}
              <div>
                <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <select
                  id="paymentTerms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
                >
                  <option value="" disabled>Select payment terms</option>
                  {paymentTermsOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Issue Date */}
              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="issueDate"
                  name="issueDate"
                  placeholder="Select issue date"
                  value={formData.issueDate}
                  onChange={handleChange}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
                    fieldErrors.issueDate 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {fieldErrors.issueDate && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.issueDate}</p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  placeholder="Select due date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
                    fieldErrors.dueDate 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {fieldErrors.dueDate && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.dueDate}</p>
                )}
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <div className="relative">
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
                    size="1"
                  >
                    <option value="" disabled>Select currency</option>
                    <optgroup label="Common Currencies">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                      <option value="INR">INR (Rs.)</option>
                      <option value="CNY">CNY (¥)</option>
                    </optgroup>
                    <optgroup label="All Currencies">
                      {currencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Select from 150+ currencies</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice From and Bill To Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Invoice From Section */}
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-2">Invoice From <span className="text-red-500">*</span></h2>
          <p className="text-sm text-gray-600 mb-2">Your Business Details</p>

          {/* Business Profile Selection Dropdown */}
          <div className="mb-3">
            <select
              id="businessProfileId"
              name="businessProfileId"
              value={formData.businessProfileId}
              onChange={handleBusinessProfileChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
            >
              <option value="">Select a business profile</option>
              {isLoadingProfiles ? (
                <option value="" disabled>Loading profiles...</option>
              ) : (
                businessProfiles.map(profile => (
                  <option key={profile._id} value={profile._id}>
                    {profile.name}
                  </option>
                ))
              )}
            </select>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">Select from your business profiles</span>
              <a href="/business-profiles/new" target="_blank" className="text-xs text-blue-600 hover:text-blue-800">
                + Add New Profile
              </a>
            </div>
          </div>

          <textarea
            name="fromDetails"
            id="fromDetails"
            rows="6"
            placeholder="Business Name,
Address,
Phone,
Email,
TAX ID, etc."
            value={formData.fromDetails}
            onChange={handleChange}
            className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
              fieldErrors.fromDetails 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          ></textarea>
          {fieldErrors.fromDetails && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.fromDetails}</p>
          )}
        </div>

        {/* Bill To Section */}
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-2">Bill To <span className="text-red-500">*</span></h2>
          <p className="text-sm text-gray-600 mb-2">Client Details</p>

          {/* Client Selection Dropdown */}
          <div className="mb-3">
            <select
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleClientChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
            >
              <option value="">Select a client</option>
              {isLoadingClients ? (
                <option value="" disabled>Loading clients...</option>
              ) : (
                clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))
              )}
            </select>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">Select from existing clients</span>
              <a href="/clients/new" target="_blank" className="text-xs text-blue-600 hover:text-blue-800">
                + Add New Client
              </a>
            </div>
          </div>

          <textarea
            name="toDetails"
            id="toDetails"
            rows="6"
            placeholder="Client/Business Name,
Address,
Phone,
Email,
TAX ID, etc."
            value={formData.toDetails}
            onChange={handleChange}
            className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
              fieldErrors.toDetails 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          ></textarea>
          {fieldErrors.toDetails && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.toDetails}</p>
          )}
        </div>
      </div>

      {/* Items Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Items</h2>

        {/* Items Table Header - Only visible on medium screens and up */}
        <div className="hidden md:grid grid-cols-12 gap-2 md:gap-4 mb-2 text-sm font-semibold text-gray-800">
          <div key="header-desc" className="col-span-5">Item Description <span className="text-red-500">*</span></div>
          <div key="header-qty" className="col-span-1 text-center">Qty <span className="text-red-500">*</span></div>
          <div key="header-rate" className="col-span-2 text-center">Rate <span className="text-red-500">*</span></div>
          <div key="header-discount" className="col-span-2 text-center">Discount</div>
          <div key="header-amount" className="col-span-1 text-right">Amount</div>
          <div key="header-actions" className="col-span-1"></div>
        </div>

        {/* Items List */}
        {formData.items.map((item) => (
          <div key={item.id} className="mb-4 md:mb-3" data-item-id={item.id}>
            {/* Mobile layout (stacked) */}
            <div className="md:hidden space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Item Description <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
                    fieldErrors[`item_${item.id}_description`] 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {fieldErrors[`item_${item.id}_description`] && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors[`item_${item.id}_description`]}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Qty <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                    className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:border-transparent text-center text-gray-900 ${
                      fieldErrors[`item_${item.id}_quantity`] 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors[`item_${item.id}_quantity`] && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors[`item_${item.id}_quantity`]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Rate <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={item.rate}
                    onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                    className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
                      fieldErrors[`item_${item.id}_rate`] 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors[`item_${item.id}_rate`] && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors[`item_${item.id}_rate`]}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Discount</label>
                <div className="flex">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={item.discount}
                    onChange={(e) => handleItemChange(item.id, 'discount', e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <select
                    value={item.discountType}
                    onChange={(e) => handleItemChange(item.id, 'discountType', e.target.value)}
                    className="border border-gray-300 rounded-md py-2 px-2 ml-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option key="percent" value="%">%</option>
                    <option key="fixed" value="fixed">{getCurrencySymbol(formData.currency)}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                  <span className="font-bold text-gray-900">{getCurrencySymbol(formData.currency)}{parseFloat(item.amount || 0).toFixed(2)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Remove item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Divider for mobile */}
              <div className="border-b border-gray-200 pt-2"></div>
            </div>

            {/* Desktop/tablet layout (grid) */}
            <div className="hidden md:grid grid-cols-12 gap-2 md:gap-4 items-start">
              <div className="col-span-5">
                <input
                  type="text"
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
                    fieldErrors[`item_${item.id}_description`] 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {fieldErrors[`item_${item.id}_description`] && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors[`item_${item.id}_description`]}</p>
                )}
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:border-transparent text-center text-gray-900 ${
                    fieldErrors[`item_${item.id}_quantity`] 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {fieldErrors[`item_${item.id}_quantity`] && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors[`item_${item.id}_quantity`]}</p>
                )}
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={item.rate}
                  onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
                    fieldErrors[`item_${item.id}_rate`] 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {fieldErrors[`item_${item.id}_rate`] && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors[`item_${item.id}_rate`]}</p>
                )}
              </div>
              <div className="col-span-2 flex">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={item.discount}
                  onChange={(e) => handleItemChange(item.id, 'discount', e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <select
                  value={item.discountType}
                  onChange={(e) => handleItemChange(item.id, 'discountType', e.target.value)}
                  className="border border-gray-300 rounded-md py-2 px-2 ml-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option key="percent" value="%">%</option>
                  <option key="fixed" value="fixed">{getCurrencySymbol(formData.currency)}</option>
                </select>
              </div>
              <div className="col-span-1 text-right">
                <span className="font-bold text-gray-900">{getCurrencySymbol(formData.currency)}{parseFloat(item.amount || 0).toFixed(2)}</span>
              </div>
              <div className="col-span-1 text-center">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add Item Button */}
        <button
          type="button"
          onClick={addItem}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium mt-4 mb-6 mx-auto md:mx-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Item
        </button>

        {/* Totals Section */}
        <div className="flex flex-col items-center md:items-end mt-4">
          <div className="w-full sm:w-3/4 md:w-1/2 flex flex-col sm:flex-row justify-between py-2">
            <span className="text-gray-700 font-medium mb-1 sm:mb-0">Subtotal:</span>
            <span className="font-bold text-gray-900">{getCurrencySymbol(formData.currency)}{parseFloat(formData.subtotal || 0).toFixed(2)}</span>
          </div>

          <div className="w-full sm:w-3/4 md:w-1/2 flex flex-col sm:flex-row justify-between items-start sm:items-center py-2">
            <span className="text-gray-700 font-medium mb-1 sm:mb-0">Discount:</span>
            <div className="flex items-center w-full sm:w-auto">
              <input
                type="number"
                min="0"
                step="0.01"
                name="discount"
                placeholder="0"
                value={formData.discount}
                onChange={handleChange}
                className="w-full sm:w-20 border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-gray-900"
              />
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="border border-gray-300 rounded-md py-1 px-2 ml-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option key="percent" value="%">%</option>
                <option key="fixed" value="fixed">{getCurrencySymbol(formData.currency)}</option>
              </select>
            </div>
          </div>

          {/* Tax Type Selection */}
          <div className="w-full sm:w-3/4 md:w-1/2 flex flex-col sm:flex-row justify-between items-start sm:items-center py-2">
            <span className="text-gray-700 font-medium mb-1 sm:mb-0">Tax Type:</span>
            <select
              name="taxType"
              value={formData.taxType}
              onChange={handleChange}
              className="w-full sm:w-40 border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option key="none" value="none">No Tax</option>
              <option key="standard" value="standard">Standard Tax</option>
              <option key="multiple" value="multiple">Multiple Taxes</option>
            </select>
          </div>

          {/* Standard Tax Rate (shown only when taxType is 'standard') */}
          {formData.taxType === 'standard' && (
            <div className="w-full sm:w-3/4 md:w-1/2 flex flex-col sm:flex-row justify-between items-start sm:items-center py-2">
              <span className="text-gray-700 font-medium mb-1 sm:mb-0">Tax Rate:</span>
              <div className="flex items-center w-full sm:w-auto">
                <select
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleChange}
                  className="w-full sm:w-40 border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  {commonTaxRates.map((tax) => (
                    <option key={tax.value} value={tax.value}>
                      {tax.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Custom Tax Name (shown only when taxType is 'standard' and taxRate is 'custom') */}
          {formData.taxType === 'standard' && formData.taxRate === 'custom' && (
            <div className="w-full sm:w-3/4 md:w-1/2 flex flex-col sm:flex-row justify-between items-start sm:items-center py-2">
              <span className="text-gray-700 font-medium mb-1 sm:mb-0">Custom Tax:</span>
              <div className="flex flex-wrap items-center space-x-0 sm:space-x-2 w-full sm:w-auto">
                <input
                  type="text"
                  name="taxName"
                  placeholder="Tax Name"
                  value={formData.taxName}
                  onChange={handleChange}
                  className="w-full sm:w-24 mb-1 sm:mb-0 border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <div className="flex items-center w-full sm:w-auto">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="taxRate"
                    placeholder="0"
                    value={formData.taxRate === 'custom' ? '' : formData.taxRate}
                    onChange={handleChange}
                    className="w-20 border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-gray-900"
                  />
                  <span className="ml-1">%</span>
                </div>
              </div>
            </div>
          )}

          {/* Multiple Taxes (shown only when taxType is 'multiple') */}
          {formData.taxType === 'multiple' && (
            <div className="w-full sm:w-3/4 md:w-1/2 py-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                <span className="text-gray-700 font-medium mb-1 sm:mb-0">Multiple Taxes:</span>
                <button
                  type="button"
                  onClick={addTax}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Tax
                </button>
              </div>

              {formData.taxes.map((tax) => (
                <div key={tax.id} className="flex flex-wrap items-center space-x-0 sm:space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Tax Name"
                    value={tax.name}
                    onChange={(e) => handleTaxChange(tax.id, 'name', e.target.value)}
                    className="w-full sm:flex-1 mb-1 sm:mb-0 border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <div className="flex items-center w-full sm:w-auto justify-between">
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={tax.rate}
                        onChange={(e) => handleTaxChange(tax.id, 'rate', e.target.value)}
                        className="w-20 border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-gray-900"
                      />
                      <span className="ml-1 mr-2">%</span>
                    </div>
                    {formData.taxes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTax(tax.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tax Amount Display */}
          {(formData.taxType === 'standard' && parseFloat(formData.taxRate) > 0) ||
           (formData.taxType === 'multiple' && formData.taxes.some(tax => parseFloat(tax.rate) > 0)) ? (
            <div className="w-full sm:w-3/4 md:w-1/2 flex flex-col sm:flex-row justify-between items-start sm:items-center py-2">
              <span className="text-gray-700 font-medium mb-1 sm:mb-0">Tax Amount:</span>
              <span className="text-gray-900">{getCurrencySymbol(formData.currency)}{parseFloat(formData.taxAmount || 0).toFixed(2)}</span>
            </div>
          ) : null}

          <div className="w-full sm:w-3/4 md:w-1/2 flex flex-col sm:flex-row justify-between items-start sm:items-center py-2">
            <span className="text-gray-700 font-medium mb-1 sm:mb-0">Shipping:</span>
            <input
              type="number"
              min="0"
              step="0.01"
              name="shipping"
              placeholder="0"
              value={formData.shipping}
              onChange={handleChange}
              className="w-full sm:w-20 border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-gray-900"
            />
          </div>

          <div className="w-full sm:w-3/4 md:w-1/2 flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-t border-gray-200 mt-2">
            <span className="text-gray-700 font-medium mb-1 sm:mb-0">Total:</span>
            <span className="text-blue-600 font-bold text-xl">{getCurrencySymbol(formData.currency)}{parseFloat(formData.total || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">How does this invoice get paid?</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {/* Payment Methods */}
            <div className="space-y-3">
              {/* Bank Transfer */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bankTransfer"
                  checked={formData.paymentMethod === 'bankTransfer'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-gray-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </span>
                  <span className="text-gray-800 font-medium">Bank Transfer</span>
                </div>
              </label>

              {/* PayPal */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={formData.paymentMethod === 'paypal'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-gray-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </span>
                  <span className="text-gray-800 font-medium">PayPal</span>
                </div>
              </label>

              {/* UPI */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={formData.paymentMethod === 'upi'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-gray-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <span className="text-gray-800 font-medium">UPI</span>
                </div>
              </label>

              {/* Payment Link */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paymentLink"
                  checked={formData.paymentMethod === 'paymentLink'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-gray-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </span>
                  <span className="text-gray-800 font-medium">Payment Link</span>
                </div>
              </label>

              {/* Cash */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-gray-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <span className="text-gray-800 font-medium">Cash</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            {/* Bank Details Field (shown only when Bank Transfer is selected) */}
            {formData.paymentMethod === 'bankTransfer' && (
              <div>
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">Enter bank details</span>
                </div>
                <textarea
                  name="bankDetails"
                  id="bankDetails"
                  rows="6"
                  placeholder="Bank Name,
Account Holder Name,
Account Number,
Account Type,
IFSC/SWIFT Code,
IBAN, etc..."
                  value={formData.bankDetails}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                ></textarea>
              </div>
            )}

            {/* PayPal ID Field (shown only when PayPal is selected) */}
            {formData.paymentMethod === 'paypal' && (
              <div>
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">Enter PayPal ID</span>
                </div>
                <input
                  type="text"
                  name="paypalId"
                  id="paypalId"
                  placeholder="Enter your PayPal ID"
                  value={formData.paypalId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-2">This PayPal ID will be displayed on the invoice for the client to make payment.</p>
              </div>
            )}

            {/* UPI ID Field (shown only when UPI is selected) */}
            {formData.paymentMethod === 'upi' && (
              <div>
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">Enter UPI ID</span>
                </div>
                <input
                  type="text"
                  name="upiId"
                  id="upiId"
                  placeholder="yourname@upi"
                  value={formData.upiId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-2">This UPI ID will be displayed on the invoice for the client to make payment.</p>
              </div>
            )}

            {/* Payment Link Field (shown only when Payment Link is selected) */}
            {formData.paymentMethod === 'paymentLink' && (
              <div>
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">Enter Payment Link</span>
                </div>
                <input
                  type="url"
                  name="paymentLink"
                  id="paymentLink"
                  placeholder="https://example.com/pay/invoice123"
                  value={formData.paymentLink}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-2">This payment link will be displayed on the invoice for the client to make payment.</p>
              </div>
            )}

            {/* Cash (no additional fields needed) */}
            {formData.paymentMethod === 'cash' && (
              <div>
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">Cash Payment</span>
                </div>
                <p className="text-sm text-gray-600">The invoice will indicate that payment should be made in cash.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes and Terms Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Notes Section */}
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-2">Notes</h2>
          <textarea
            name="notes"
            id="notes"
            rows="5"
            placeholder="Notes to be displayed on the invoice"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          ></textarea>
        </div>

        {/* Terms Section */}
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-2">Terms</h2>
          <textarea
            name="terms"
            id="terms"
            rows="5"
            placeholder="Terms and conditions for this invoice"
            value={formData.terms}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          ></textarea>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-8 mb-12">
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          onClick={handleCreateInvoice}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>

      {/* PDF is generated directly using jsPDF */}
    </div>
  );
};

export default InvoiceForm;
