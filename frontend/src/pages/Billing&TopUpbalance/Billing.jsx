import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, VStack, HStack, Text, Table, Thead, Tbody, Tr, Th, Td, IconButton, Badge, Button, Card, CardBody, Heading,
  Flex, Select, Icon, Input, InputGroup, InputLeftElement, Grid, GridItem, Divider, useColorModeValue,
  useDisclosure, Tabs, TabList, TabPanels, Tab, TabPanel, Collapse, Wrap, WrapItem, Spinner, Center, useToast
} from '@chakra-ui/react';
import {
  FaSearch,FaEye, FaFileInvoice, FaCreditCard, FaWallet, FaChevronDown, FaChevronUp,
  FaFilter, FaCalendarAlt, FaTimes,
  FaChevronCircleRight,
  FaChevronCircleLeft
} from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import TopUp from './TopUp';
import InvoiceDetailsModal from '../../Modals/InvoiceDetailsModal';
import api from '../../services/api';
import { FiCheckCircle, FiClock, FiXCircle, FiFileText, FiRefreshCcw, FiDownload } from 'react-icons/fi';

const Billing = ({ walletBalance = 50.00, onUpdateBalance = () => {}, userId }) => {
  const [invoices, setInvoices] = useState([]); // transformed invoices used by the table
  const [activeServices, setActiveServices] = useState([]); // services/invoices shown in Active Services
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabIndex, setTabIndex] = useState(() => {
    const tab = searchParams.get('tab');
    return tab && tab.toLowerCase() === 'topup' ? 1 : 0;
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);

  // Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchBillingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // safe date parsing - returns YYYY-MM-DD or null
  const safeDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return null;
    return dt.toISOString().split('T')[0];
  };

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      // fetch invoices and orders in parallel
      const [invoicesResponse, ordersResponse] = await Promise.all([
        api.invoices.getAll(),
        api.orders.getAll()
      ]);

      // Transform invoices for table usage
      if (invoicesResponse && invoicesResponse.success && Array.isArray(invoicesResponse.data)) {
        const transformedInvoices = invoicesResponse.data.map(invoice => ({
          id: invoice.invoice_number, // using invoice_number consistently
          invoiceRaw: invoice, // keep raw if needed
          date: safeDate(invoice.invoice_date) || '',
          dueDate: safeDate(invoice.due_date) || '',
          payDate: safeDate(invoice.paid_date) || null,
          service: invoice.customer_name || invoice.product_name || 'Service',
          amount: parseFloat(invoice.amount || 0),
          mrcAmount: parseFloat(invoice.mrc_amount || 0),
          usageAmount: parseFloat(invoice.usage_amount || 0),
          status: invoice.status || 'Unknown',
          period: invoice.period || '',
          fromDate: safeDate(invoice.from_date) || null,
          toDate: safeDate(invoice.to_date) || null,
          orderId: invoice.order_id || null
        }));
        setInvoices(transformedInvoices);
      } else {
        setInvoices([]);
      }

      // Build maps for orders (needed for quantity and completed_date fallbacks)
      const ordersMap = {};
      if (ordersResponse && ordersResponse.success && Array.isArray(ordersResponse.data)) {
        for (const o of ordersResponse.data) {
          ordersMap[o.id] = o;
        }
      }

      const activeServicesData = [];
      if (invoicesResponse && invoicesResponse.success && Array.isArray(invoicesResponse.data)) {
        // Show invoices that are not paid (Pending/Overdue etc.)
        for (const inv of invoicesResponse.data) {
          const status = (inv.status || '').toString();
          const statusLower = status.toLowerCase();
          // include if not paid (you can change this filter if you want to show all)
          if (statusLower !== 'paid') {
            const order = ordersMap[inv.order_id] || null;

            // compute price & quantity (fallbacks)
            const price = parseFloat(inv.mrc_amount || 0);
            const quantity = order?.quantity || inv.quantity || 1;
            const usageAmount = parseFloat(inv.usage_amount || 0);

            // compute dates
            const fromDate = safeDate(inv.from_date) || safeDate(order?.completed_date) || '';

            // next billing - prefer invoice to_date else compute from order.completed_date
            let nextBilling = safeDate(inv.to_date);
            if (!nextBilling && order?.completed_date) {
              const completed = new Date(order.completed_date);
              if (!Number.isNaN(completed.getTime())) {
                const nb = new Date(completed);
                nb.setMonth(nb.getMonth() + 1);
                nextBilling = nb.toISOString().split('T')[0];
              }
            }

            // Get country, product, and area code information from invoice data
            const countryName = inv.country_name || '';
            const productType = inv.product_type || '';
            const areaCode = inv.area_code || '';

            const name = `${order?.product_name || inv.customer_name || 'Service'}${areaCode ? ` - ${areaCode}` : ''}`;

            const serviceObj = {
              id: inv.invoice_number,
              invoiceNumber: inv.invoice_number,
              name,
              price,
              quantity,
              mrcAmount: price,
              usageAmount,
              fromDate,
              period: inv.period || '',
              toDate: nextBilling || '',
              totalCost: (price * quantity) + usageAmount,
              nextBilling: nextBilling || '',
              status: inv.status || 'Unknown',
              invoiceDate: safeDate(inv.invoice_date) || '',
              orderId: inv.order_id || null,
              countryName,
              productType,
              areaCode
            };
            activeServicesData.push(serviceObj);
          }
        }
      }

      setActiveServices(activeServicesData);
    } catch (err) {
      console.error('Error fetching billing data:', err);

      // Check if it's an authentication error
      let errorMessage = 'Failed to load billing data';
      let errorTitle = 'Error';

      if (err.message && err.message.includes('Authentication required')) {
        errorTitle = 'Authentication Required';
        errorMessage = 'Please log in again to access billing information';
      } else if (err.message && err.message.includes('401')) {
        errorTitle = 'Session Expired';
        errorMessage = 'Your session has expired. Please log in again';
      } else if (err.message && err.message.includes('403')) {
        errorTitle = 'Access Denied';
        errorMessage = 'You do not have permission to access billing data';
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Sorting helper
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // View / Download handlers
  const handleViewInvoice = (invoice) => {
    // Find the corresponding activeService for detailed information
    const activeService = activeServices.find(service => service.invoiceNumber === invoice.id);
    // Use activeService if available (has country, product, area code info), otherwise use invoice
    setSelectedInvoice(activeService || invoice);
    onOpen();
  };

  const generateInvoicePDF = (invoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // -------------------------
  // Helpers
  // -------------------------
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  const currency = (amount) => `$${Number(amount || 0).toFixed(2)}`;

  const drawSectionTitle = (title) => {
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(title, 20, y);
    y += 8;
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
  };

  const drawLine = () => {
    doc.setDrawColor(0);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;
  };

  const drawRow = (label, value) => {
    doc.setFont(undefined, "normal");
    doc.text(label, 20, y);
    doc.text(String(value), pageWidth - 90, y);
    y += 7;
  };

  // -------------------------
  // Header
  // -------------------------
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("INVOICE", pageWidth / 2, y, { align: "center" });
  y += 15;

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  drawRow("Invoice Number:", invoiceData.invoice_number || "N/A");
  drawRow("Invoice Date:", formatDate(invoiceData.invoice_date));
  drawRow("Customer:", invoiceData.customer_name || "N/A");
  drawRow("Due Date:", formatDate(invoiceData.due_date));

  if (invoiceData.customer_email) drawRow("Email:", invoiceData.customer_email);
  if (invoiceData.customer_phone) drawRow("Phone:", invoiceData.customer_phone);
  if (invoiceData.country_name || invoiceData.area_code)
    drawRow(
      "Location:",
      `${invoiceData.country_name || ""} ${invoiceData.area_code || ""}`.trim()
    );

  drawLine();

  // -------------------------
  // Invoice Details
  // -------------------------
  drawSectionTitle("Invoice Details");

  const detailRows = [
    ["Period", invoiceData.period || "N/A"],
    ["From Date", formatDate(invoiceData.from_date)],
    ["To Date", formatDate(invoiceData.to_date)],
    ["Product", invoiceData.product_name || "N/A"],
    ["Product Type", invoiceData.product_type || "N/A"],
    ["Quantity", invoiceData.quantity || "N/A"],
  ];

  detailRows.forEach(([label, value]) => drawRow(label + ":", value));

  drawLine();

  // -------------------------
  // Charges Section
  // -------------------------
  drawSectionTitle("Charges");

  drawRow("MRC Amount:", currency(invoiceData.mrc_amount));
  drawRow("Usage Amount:", currency(invoiceData.usage_amount));

  drawLine();

  // -------------------------
  // Total Amount
  // -------------------------
  doc.setFont(undefined, "bold");
  doc.setFontSize(12);
  doc.text("Total Amount:", 20, y);
  doc.text(currency(invoiceData.amount), pageWidth - 90, y);
  y += 12;

  // -------------------------
  // Status & Paid Info
  // -------------------------
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  drawRow("Status:", invoiceData.status || "N/A");

  if (invoiceData.paid_date) drawRow("Paid Date:", formatDate(invoiceData.paid_date));

  // -------------------------
  // Notes
  // -------------------------
  if (invoiceData.notes) {
    y += 8;
    doc.setFont(undefined, "bold");
    doc.text("Notes:", 20, y);
    y += 7;

    doc.setFont(undefined, "normal");

    const wrapped = doc.splitTextToSize(String(invoiceData.notes), pageWidth - 40);
    doc.text(wrapped, 20, y);
  }

  // -------------------------
  // Save PDF
  // -------------------------
  const fileName = `Invoice_${invoiceData.invoice_number}_${new Date()
    .toISOString()
    .split("T")[0]}.pdf`;

  doc.save(fileName);
};

  const handleDownloadInvoice = async (invoiceNumber) => {
    try {
      console.log('Fetching invoice details for:', invoiceNumber);
      const response = await api.invoices.getDetails(invoiceNumber);

      console.log('Invoice details response:', response);
      if (response.success && response.data) {
        generateInvoicePDF(response.data);
        toast({
          title: 'Success',
          description: `Invoice ${invoiceNumber} downloaded successfully.`,
          status: 'success',
          duration: 2000,
          isClosable: true
        });
      } else {
        console.error('Response not successful:', response);
        toast({
          title: 'Error',
          description: response?.message || 'Failed to fetch invoice details.',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Download invoice error:', error.message, error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download invoice.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Total due: sum of activeServices where status is not Paid
  const calculateTotalDue = () => {
    return activeServices.reduce((total, service) => {
      const status = (service.status || '').toString().toLowerCase();
      if (status === 'paid') return total;
      return total + Number(service.totalCost || 0);
    }, 0);
  };

  // Filters & sorting for invoice table
  const getFilteredInvoices = () => {
    let filtered = invoices.filter((invoice) => {
      const sq = searchQuery.toLowerCase();
      const matchesSearch =
        invoice.id.toString().toLowerCase().includes(sq) ||
        (invoice.service || '').toString().toLowerCase().includes(sq) ||
        (invoice.period || '').toString().toLowerCase().includes(sq);

      const matchesStatus =
        selectedStatus === '' ||
        (invoice.status || '').toString().toLowerCase() === selectedStatus.toLowerCase();

      const invoiceDate = invoice.date && invoice.date !== '' ? new Date(invoice.date) : null;
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;

      const matchesDateRange =
        (!from || (invoiceDate && invoiceDate >= from)) &&
        (!to || (invoiceDate && invoiceDate <= to));

      return matchesSearch && matchesStatus && matchesDateRange;
    });

    // sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortField) {
        case 'date':
          aValue = new Date(a.date || 0);
          bValue = new Date(b.date || 0);
          break;
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case 'status':
          aValue = (a.status || '').toString().toLowerCase();
          bValue = (b.status || '').toString().toLowerCase();
          break;
        case 'service':
          aValue = (a.service || '').toString().toLowerCase();
          bValue = (b.service || '').toString().toLowerCase();
          break;
        default:
          aValue = new Date(a.date || 0);
          bValue = new Date(b.date || 0);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  // Pagination values
  const filteredInvoices = getFilteredInvoices();
  const totalResults = filteredInvoices.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / resultsPerPage));
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, totalResults);
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  // Helpers for status display
  const getStatusColor = (status) => {
    const s = (status || '').toString().toLowerCase();
    if (s === 'paid') return 'green';
    if (s === 'pending') return 'yellow';
    if (s === 'overdue') return 'red';
    return 'gray';
  };

  const getStatusIcon = (status) => {
    const s = (status || '').toString().toLowerCase();
    switch (s) {
      case 'paid': return FiCheckCircle;
      case 'pending': return FiClock;
      case 'overdue': return FiXCircle;
      default: return FiFileText;
    }
  };

  // Quick filters helpers
  const applyQuickFilter = (filterType) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    switch (filterType) {
      case 'last30days': {
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
        setDateTo(now.toISOString().split('T')[0]);
        break;
      }
      case 'thisMonth': {
        const firstDayThisMonth = new Date(currentYear, currentMonth - 1, 1);
        const lastDayThisMonth = new Date(currentYear, currentMonth, 0);
        setDateFrom(firstDayThisMonth.toISOString().split('T')[0]);
        setDateTo(lastDayThisMonth.toISOString().split('T')[0]);
        break;
      }
      case 'lastMonth': {
        const firstDayLastMonth = new Date(currentYear, currentMonth - 2, 1);
        const lastDayLastMonth = new Date(currentYear, currentMonth - 1, 0);
        setDateFrom(firstDayLastMonth.toISOString().split('T')[0]);
        setDateTo(lastDayLastMonth.toISOString().split('T')[0]);
        break;
      }
      case 'thisYear': {
        const firstDayThisYear = new Date(currentYear, 0, 1);
        setDateFrom(firstDayThisYear.toISOString().split('T')[0]);
        setDateTo(now.toISOString().split('T')[0]);
        break;
      }
      case 'lastYear': {
        const firstDayLastYear = new Date(currentYear - 1, 0, 1);
        const lastDayLastYear = new Date(currentYear - 1, 11, 31);
        setDateFrom(firstDayLastYear.toISOString().split('T')[0]);
        setDateTo(lastDayLastYear.toISOString().split('T')[0]);
        break;
      }
      default:
        break;
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setDateFrom('');
    setDateTo('');
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handleResultsPerPageChange = (e) => {
    setResultsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Tab change handler
  const handleTabChange = (index) => {
    setTabIndex(index);
    const nextParams = new URLSearchParams(searchParams);
    if (index === 1) nextParams.set('tab', 'topup');
    else nextParams.delete('tab');
    setSearchParams(nextParams, { replace: true });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, dateFrom, dateTo, sortField, sortDirection, resultsPerPage]);

  if (loading) {
    return (
      <Center flex={1} minH="calc(100vh - 76px)">
        <Spinner size="lg" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box w="full" px={{base:0,md:6}} py={3}>
      <VStack spacing={6} align="stretch">
        <Tabs variant="soft-rounded" colorScheme="blue" index={tabIndex} onChange={handleTabChange}>
          <TabList mb="1em" bg={useColorModeValue('gray.50', 'gray.900')} p={2} borderRadius="lg">
            <HStack spacing={4}>
              <Tab fontWeight="semibold" fontSize="md">
                <HStack spacing={2}><FaFileInvoice /><Text>Billing & Invoices</Text></HStack>
              </Tab>
              <Tab fontWeight="semibold" fontSize="md">
                <HStack spacing={2}><FaWallet /><Text>TopUp/Balance</Text></HStack>
              </Tab>
            </HStack>
          </TabList>

          <TabPanels>
            {/* Billing Tab */}
            <TabPanel>
              <VStack spacing={8} align="stretch">
                {/* Billing Summary */}
                <Grid templateColumns={{ base: '1fr', md: '1fr' }} gap={6}>
                  {/* Active Services */}
                  <Card borderRadius="12px"  bg={cardBg} border="1px solid" borderColor={borderColor}>
                    <CardBody>
                      <Flex justify="space-between" align="center" mb={4}>
                        <Heading size="md">Pending Bills</Heading>
                        <Button
                          borderRadius={"full"}
                          leftIcon={<FiRefreshCcw />}
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                          onClick={fetchBillingData}
                          isLoading={loading}
                        >
                          Refresh
                        </Button>
                      </Flex>
                      <VStack spacing={4} align="stretch" h={"400px"} overflow={"auto"}>
                        {activeServices.length === 0 && (
                          <VStack spacing={4} align="center" justify="center" h="200px">
                            <Text color="gray.500" textAlign="center">
                              {loading ? 'Loading billing data...' : 'No pending invoices or active services to show.'}
                            </Text>
                            {!loading && (
                              <Text color="gray.400" fontSize="sm" textAlign="center">
                                If you believe you should have billing data, please ensure you're logged in and try refreshing the page.
                              </Text>
                            )}
                          </VStack>
                        )}
                        {activeServices.map((service) => (
                          <Box key={service.id} p={4} border="1px solid" borderColor={borderColor} borderRadius="md">
                            <VStack spacing={3} align="stretch">
                              <Flex justify="space-between" align="center">
                                <Box flex={1}>
                                  <Text fontWeight="semibold" color="purple" fontSize="md">{service.name}</Text>
                                  <Text fontSize="sm" fontWeight="bold" color="green.600">
                                    ${Number(service.price).toFixed(2)} × {service.quantity} numbers
                                  </Text>
                                </Box>
                                <HStack spacing={3}>
                                  <Badge colorScheme={getStatusColor(service.status)} borderRadius="full">
                                    {service.status}
                                  </Badge>
                                  <Button
                                    borderRadius={"full"}
                                    leftIcon={<FiDownload />}
                                    size="xs"
                                    colorScheme="blue"
                                    variant="outline"
                                    onClick={() => handleDownloadInvoice(service.invoiceNumber)}
                                    isDisabled={!service.invoiceNumber}
                                  >
                                    Download
                                  </Button>
                                </HStack>
                              </Flex>

                              <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(6, 1fr)" }} gap={3} w="full">
                                <Box textAlign="center">
                                  <Text fontSize="xs" color="gray.600" fontWeight="medium" mb={1}>Country</Text>
                                  <Badge variant="subtle" borderRadius={"full"} colorScheme="blue" justifyContent="center">
                                    <Text fontWeight="bold" fontSize="sm">{service.countryName || '-'}</Text>
                                  </Badge>
                                </Box>
                                <Box textAlign="center">
                                  <Text fontSize="xs" color="gray.600" fontWeight="medium" mb={1}>Product</Text>
                                  <Text fontWeight="bold" fontSize="sm">{service.productType || '-'}</Text>
                                </Box>
                                <Box textAlign="center">
                                  <Text fontSize="xs" color="gray.600" fontWeight="medium" mb={1}>Period</Text>
                                  <Text fontWeight="bold" fontSize="sm">{service.period || '-'}</Text>
                                </Box>
                                <Box textAlign="center">
                                  <Text fontSize="xs" color="gray.600" fontWeight="medium" mb={1}>MRC Cost</Text>
                                  <Text fontWeight="bold" fontSize="sm" color="purple.600">${(Number(service.price) * Number(service.quantity)).toFixed(2)}</Text>
                                </Box>
                                <Box textAlign="center">
                                  <Text fontSize="xs" color="gray.600" fontWeight="medium" mb={1}>Usage Cost</Text>
                                  <Text fontWeight="bold" fontSize="sm" color="purple.600">${Number(service.usageAmount).toFixed(2)}</Text>
                                </Box>
                                <Box textAlign="center">
                                  <Text fontSize="xs" color="gray.600" fontWeight="medium" mb={1}>Total Cost</Text>
                                  <Text fontWeight="bold" fontSize="lg" color="green.700">${Number(service.totalCost || 0).toFixed(2)}</Text>
                                </Box>
                              </Grid>
                            </VStack>
                          </Box>
                        ))}
                      </VStack>

                      <Divider my={4} />

                     <Flex justify="flex-end" align="center" px={8} mb={4} gap={5}>
                      <Text fontSize="md" color="gray.600">Total Due</Text>
                      <Text fontWeight="bold" fontSize="2xl" color="green.600">
                          ${calculateTotalDue().toFixed(2)}
                      </Text>
                     </Flex>
                     <Divider my={4} />

                      <Flex justify="flex-end" gap={4}>
                        <Button px={{base:10,md:4}} borderRadius={"full"} leftIcon={<FiDownload />} colorScheme="teal" variant="outline" >
                          Download All Invoices
                        </Button>
                        <Button px={{base:6,md:4}} borderRadius={"full"} leftIcon={<FaCreditCard />} colorScheme="blue" >
                          Pay Now
                        </Button>
                      </Flex>
                    </CardBody>
                  </Card>
                </Grid>

                {/* Invoice History */}
                <Card borderRadius="12px" bg={cardBg} overflow={{base:"scroll",md:"hidden"}} border="1px solid" borderColor={borderColor}>
                  <CardBody>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="md">Invoice History</Heading>
                      <Button
                        leftIcon={showFilters ? <FaChevronUp /> : <FaChevronDown />}
                        rightIcon={<FaFilter />}
                        size="sm"
                        variant="outline"
                        borderRadius={"full"}
                        colorScheme="blue"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        {showFilters ? 'Hide' : 'Show'} Filters
                      </Button>
                    </Flex>

                    <Collapse in={showFilters} animateOpacity>
                      <Card bg="gray.50" mb={4} borderRadius="md">
                        <CardBody py={4}>
                          <VStack spacing={4} align="stretch">
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700">Quick Filters:</Text>
                              <Wrap spacing={8}>
                                <WrapItem>
                                  <Button size="sm" borderRadius='full' variant="outline" colorScheme="blue" leftIcon={<FaCalendarAlt />} onClick={() => applyQuickFilter('last30days')}>Last 30 Days</Button>
                                </WrapItem>
                                <WrapItem>
                                  <Button size="sm" borderRadius='full' variant="outline" colorScheme="blue" leftIcon={<FaCalendarAlt />} onClick={() => applyQuickFilter('thisMonth')}>This Month</Button>
                                </WrapItem>
                                <WrapItem>
                                  <Button size="sm" borderRadius='full' variant="outline" colorScheme="blue" leftIcon={<FaCalendarAlt />} onClick={() => applyQuickFilter('lastMonth')}>Last Month</Button>
                                </WrapItem>
                                <WrapItem>
                                  <Button size="sm" borderRadius='full' variant="outline" colorScheme="blue" leftIcon={<FaCalendarAlt />} onClick={() => applyQuickFilter('thisYear')}>This Year</Button>
                                </WrapItem>
                                <WrapItem>
                                  <Button size="sm" borderRadius='full' variant="outline" colorScheme="blue" leftIcon={<FaCalendarAlt />} onClick={() => applyQuickFilter('lastYear')}>Last Year</Button>
                                </WrapItem>
                              </Wrap>
                            </Box>

                            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4} alignItems="end">
                              <GridItem>
                                <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">From Date</Text>
                                <Input type="date" size="sm" borderRadius='full' value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} bg="white" />
                              </GridItem>
                              <GridItem>
                                <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">To Date</Text>
                                <Input borderRadius='full' type="date" size="sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} bg="white" />
                              </GridItem>
                              <GridItem>
                                <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Status</Text>
                                <Select borderRadius='full' size="sm" placeholder="All Status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} bg="white">
                                  <option value="paid">Paid</option>
                                  <option value="pending">Pending</option>
                                  <option value="overdue">Overdue</option>
                                </Select>
                              </GridItem>
                              <GridItem>
                                <Button borderRadius='full' leftIcon={<FaTimes />} size="sm" variant="outline" colorScheme="red" onClick={clearAllFilters} w="full">Clear Filters</Button>
                              </GridItem>
                            </Grid>
                          </VStack>
                        </CardBody>
                      </Card>
                    </Collapse>

                    <Flex justify="space-between" align="center" mb={4}>
                      <InputGroup maxW="300px">
                        <InputLeftElement pointerEvents="none"><FaSearch color="gray.300" /></InputLeftElement>
                        <Input placeholder="Search invoices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} bg="white" borderRadius={"full"} />
                      </InputGroup>
                      <Text fontSize="sm" color="gray.600">{totalResults} invoice{totalResults !== 1 ? 's' : ''} found</Text>
                    </Flex>

                    <Table variant="simple" h={"350px"} overflow={"auto"}>
                      <Thead>
                        <Tr sx={{
                          '& > th': {
                            bg: "gray.100",
                            color: "gray.700",
                            fontWeight: "semibold",
                            fontSize: "sm",
                            letterSpacing: "0.3px",
                            borderBottom: "2px solid",
                            borderColor: "blue.400",
                            textAlign: "center",
                            cursor: "pointer",
                            _hover: { bg: "gray.200" }
                          }
                        }}>
                          <Th>Invoice ID</Th>
                          <Th onClick={() => handleSort('service')} _hover={{ bg: "gray.200" }}>
                            <Flex align="center" justify="center">Service Name {sortField === 'service' && <Icon as={sortDirection === 'asc' ? FaChevronUp : FaChevronDown} ml={1} boxSize={3} />}</Flex>
                          </Th>
                          <Th onClick={() => handleSort('date')} _hover={{ bg: "gray.200" }}>
                            <Flex align="center" justify="center">Invoice Date {sortField === 'date' && <Icon as={sortDirection === 'asc' ? FaChevronUp : FaChevronDown} ml={1} boxSize={3} />}</Flex>
                          </Th>
                          <Th>MRC Amount</Th>
                          <Th>Usage Amount</Th>
                          <Th onClick={() => handleSort('amount')} isNumeric _hover={{ bg: "gray.200" }}>
                            <Flex align="center" justify="center">Amount {sortField === 'amount' && <Icon as={sortDirection === 'asc' ? FaChevronUp : FaChevronDown} ml={1} boxSize={3} />}</Flex>
                          </Th>
                          <Th onClick={() => handleSort('status')} _hover={{ bg: "gray.200" }}>
                            <Flex align="center" justify="center">Status {sortField === 'status' && <Icon as={sortDirection === 'asc' ? FaChevronUp : FaChevronDown} ml={1} boxSize={3} />}</Flex>
                          </Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {currentInvoices.length > 0 ? currentInvoices.map((invoice) => (
                          <Tr key={invoice.id} _hover={{ bg: 'gray.50' }}>
                            <Td color={"blue.500"} textAlign="center" fontWeight="medium">{invoice.id}</Td>
                            <Td textAlign="center" fontWeight="500">{invoice.service}</Td>
                            <Td textAlign="center" fontSize="sm" color="gray.600">{invoice.date}</Td>
                            <Td textAlign="center" isNumeric fontWeight="semibold" color="blue.600">${Number(invoice.mrcAmount).toFixed(2)}</Td>
                            <Td textAlign="center" isNumeric fontWeight="semibold" color="purple.600">${Number(invoice.usageAmount).toFixed(2)}</Td>
                            <Td textAlign="center" isNumeric fontWeight="bold" color="green.600">${Number(invoice.amount).toFixed(2)}</Td>
                            <Td textAlign="center">
                              <Badge colorScheme={getStatusColor(invoice.status)} borderRadius={"full"}>
                                <HStack spacing={1}><Icon as={getStatusIcon(invoice.status)} boxSize={3} /><Text>{invoice.status}</Text></HStack>
                              </Badge>
                            </Td>
                            <Td textAlign="center">
                              <HStack justify="center" spacing={2}>
                                <IconButton icon={<FaEye />} colorScheme="blue" variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)} aria-label="View invoice" />
                                <IconButton icon={<FiDownload />} colorScheme="green" variant="ghost" size="md" onClick={() => handleDownloadInvoice(invoice.id)} aria-label="Download invoice" />
                              </HStack>
                            </Td>
                          </Tr>
                        )) : (
                          <Tr>
                            <Td colSpan={8} textAlign="center" py={8}>
                              <VStack spacing={2}>
                                <Text color="gray.500" fontWeight="medium">
                                  {loading ? 'Loading invoice data...' : 'No invoices found matching your search criteria.'}
                                </Text>
                                {!loading && (
                                  <Text color="gray.400" fontSize="sm">
                                    If you believe you should have invoice data, please ensure you're logged in and try refreshing the page.
                                  </Text>
                                )}
                              </VStack>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>

                    {/* Pagination Footer */}
                    {totalResults > 0 && (
                      <Flex justify="space-between" align="center" mt={4} pt={4} borderTop="1px solid" borderColor="gray.200">
                        <HStack spacing={2}>
                          <Text fontSize="sm" color="gray.600">Show</Text>
                          <Select size="sm" value={resultsPerPage} onChange={handleResultsPerPageChange} width="auto" borderRadius="md">
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </Select>
                          <Text fontSize="sm" color="gray.600">results per page</Text>
                        </HStack>

                        <HStack spacing={2}>
                          <Button size="lg" variant="ghost" onClick={() => handlePageChange(currentPage - 1)} isDisabled={currentPage === 1} borderRadius="md"><FaChevronCircleLeft/></Button>
                          <Text fontSize="sm" color="gray.600" px={2}>Page {currentPage} of {totalPages}</Text>
                          <Button size="lg" variant="ghost" onClick={() => handlePageChange(currentPage + 1)} isDisabled={currentPage === totalPages} borderRadius="md"><FaChevronCircleRight/></Button>
                        </HStack>

                        <Text fontSize="sm" color="gray.600">Results {startIndex + 1} - {endIndex} from {totalResults}</Text>
                      </Flex>
                    )}
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* TopUp/Balance Tab */}
            <TabPanel>
              <TopUp userId={userId} walletBalance={walletBalance} onUpdateBalance={onUpdateBalance} />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Invoice Detail Modal */}
        <InvoiceDetailsModal
          isOpen={isOpen}
          onClose={onClose}
          invoice={selectedInvoice}
        />
      </VStack>
    </Box>
  );
};

export default Billing;
