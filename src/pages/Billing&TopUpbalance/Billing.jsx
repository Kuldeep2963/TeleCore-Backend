import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {Box, VStack, HStack, Text, Table, Thead, Tbody, Tr, Th, Td, IconButton, Badge, Button, Card, CardBody, Heading, Flex, Select,Icon,Input, InputGroup, InputLeftElement, Grid, GridItem, Divider, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Tabs, TabList, TabPanels, Tab, TabPanel, Collapse, Wrap, WrapItem, Spinner, Center, useToast
} from '@chakra-ui/react';
import { FaSearch, FaDownload, FaEye, FaPrint, FaFileInvoice, FaCreditCard, FaWallet, FaChevronDown, FaChevronUp, FaFilter, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import TopUp from './TopUp';
import api from '../../services/api';
import { FiCheckCircle, FiClock, FiXCircle, FiFileText,} from 'react-icons/fi';

const Billing = ({ walletBalance = 50.00, onUpdateBalance = () => {}, userId }) => {
  const [invoices, setInvoices] = useState([]);
  const [activeServices, setActiveServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);

      // Fetch invoices
      const invoicesResponse = await api.invoices.getAll();
      if (invoicesResponse.success) {
        // Transform invoices data to match expected format
        const transformedInvoices = invoicesResponse.data.map(invoice => {
          return {
            id: invoice.invoice_number,
            date: new Date(invoice.invoice_date).toISOString().split('T')[0],
            dueDate: new Date(invoice.due_date).toISOString().split('T')[0],
            payDate: invoice.paid_date ? new Date(invoice.paid_date).toISOString().split('T')[0] : null,
            service: invoice.customer_name || 'Service', // Use customer name as service name
            amount: parseFloat(invoice.amount),
            mrcAmount: parseFloat(invoice.mrc_amount || 0),
            usageAmount: parseFloat(invoice.usage_amount || 0),
            status: invoice.status,
            period: invoice.period || 'N/A',
            fromDate: invoice.from_date ? new Date(invoice.from_date).toISOString().split('T')[0] : null,
            toDate: invoice.to_date ? new Date(invoice.to_date).toISOString().split('T')[0] : null
          };
        });
        setInvoices(transformedInvoices);
      }

      // For active services, we'll derive from orders that are active
      // For now, set empty array - this might need a specific API endpoint
      setActiveServices([]);

    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load billing data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabIndex, setTabIndex] = useState(() => {
    const tab = searchParams.get('tab');
    return tab && tab.toLowerCase() === 'topup' ? 1 : 0;
  });

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const date = new Date(0, index);
      return {
        value: String(month).padStart(2, '0'),
        label: date.toLocaleString('default', { month: 'long' })
      };
    });
  }, []);

  const yearOptions = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 5 }, (_, index) => {
      const year = now.getFullYear() - index;
      return {
        value: String(year),
        label: String(year)
      };
    });
  }, []);

  const getMonthIndex = (yearValue, monthValue) => {
    if (!yearValue || !monthValue) {
      return null;
    }
    const year = Number(yearValue);
    const month = Number(monthValue);
    if (Number.isNaN(year) || Number.isNaN(month)) {
      return null;
    }
    return year * 12 + month;
  };

  const applyQuickFilter = (filterType) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    switch (filterType) {
      case 'last30days':
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
        setDateTo(now.toISOString().split('T')[0]);
        break;
      case 'thisMonth':
        const firstDayThisMonth = new Date(currentYear, currentMonth - 1, 1);
        const lastDayThisMonth = new Date(currentYear, currentMonth, 0);
        setDateFrom(firstDayThisMonth.toISOString().split('T')[0]);
        setDateTo(lastDayThisMonth.toISOString().split('T')[0]);
        break;
      case 'lastMonth':
        const firstDayLastMonth = new Date(currentYear, currentMonth - 2, 1);
        const lastDayLastMonth = new Date(currentYear, currentMonth - 1, 0);
        setDateFrom(firstDayLastMonth.toISOString().split('T')[0]);
        setDateTo(lastDayLastMonth.toISOString().split('T')[0]);
        break;
      case 'thisYear':
        const firstDayThisYear = new Date(currentYear, 0, 1);
        setDateFrom(firstDayThisYear.toISOString().split('T')[0]);
        setDateTo(now.toISOString().split('T')[0]);
        break;
      case 'lastYear':
        const firstDayLastYear = new Date(currentYear - 1, 0, 1);
        const lastDayLastYear = new Date(currentYear - 1, 11, 31);
        setDateFrom(firstDayLastYear.toISOString().split('T')[0]);
        setDateTo(lastDayLastYear.toISOString().split('T')[0]);
        break;
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

  useEffect(() => {
    const tab = searchParams.get('tab');
    const nextIndex = tab && tab.toLowerCase() === 'topup' ? 1 : 0;
    setTabIndex(nextIndex);
  }, [searchParams]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    onOpen();
  };

  const handleDownloadInvoice = (invoiceId) => {
    // Simulate download
    console.log(`Downloading invoice: ${invoiceId}`);
  };



  const calculateTotalDue = () => {
    return activeServices.reduce((total, service) => total + (service.price * service.quantity), 0);
  };

  const getFilteredInvoices = () => {
    let filtered = invoices.filter((invoice) => {
      const matchesSearch =
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.period.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === '' ||
        invoice.status.toLowerCase() === selectedStatus.toLowerCase();

      const invoiceDate = new Date(invoice.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      const matchesDateRange =
        (!fromDate || invoiceDate >= fromDate) &&
        (!toDate || invoiceDate <= toDate);

      return matchesSearch && matchesStatus && matchesDateRange;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'service':
          aValue = a.service;
          bValue = b.service;
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  // Pagination calculations
  const filteredInvoices = getFilteredInvoices();
  const totalResults = filteredInvoices.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, totalResults);
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleResultsPerPageChange = (e) => {
    setResultsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleTabChange = (index) => {
    setTabIndex(index);
    const nextParams = new URLSearchParams(searchParams);
    if (index === 1) {
      nextParams.set('tab', 'topup');
    } else {
      nextParams.delete('tab');
    }
    setSearchParams(nextParams, { replace: true });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, dateFrom, dateTo, sortField, sortDirection]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'green';
      case 'Pending': return 'yellow';
      case 'Overdue': return 'red';
      default: return 'gray';
    }
  };
   const getStatusIcon = (status) => {
      switch (status?.toLowerCase()) {
        case 'paid': return FiCheckCircle;
        case 'pending': return FiClock;
        case 'overdue': return FiXCircle;
        default: return FiFileText;
      }
    };




  if (loading) {
    return (
      <Center flex={1} minH="calc(100vh - 76px)">
        <Spinner size="lg" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box w="full" p={6} >
      <VStack spacing={6} align="stretch">
        {/* Tab Navigation */}
        <Tabs variant="soft-rounded" colorScheme="blue" index={tabIndex} onChange={handleTabChange}>
          <TabList mb="1em" bg={useColorModeValue('gray.50', 'gray.900')} p={2} borderRadius="lg">
            <HStack spacing={4}>
            <Tab fontWeight="semibold" fontSize="md">
              <HStack spacing={2}>
              <FaFileInvoice/>
              <Text>Billing & Invoices</Text>
              </HStack>
            </Tab>
            <Tab fontWeight="semibold" fontSize="md">
              <HStack spacing={2}>
              <FaWallet/>
              <Text>TopUp/Balance</Text>
              </HStack>
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
          <Card borderRadius="12px" bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Heading size="md" mb={4}>Active Services</Heading>
              <VStack spacing={4} align="stretch">
                {activeServices.map((service) => (
                  <Box key={service.id} p={4} border="1px solid" borderColor={borderColor} borderRadius="md">
                    <Flex justify="space-between" align="start" mb={3}>
                      <VStack align="start" spacing={2} flex={1}>
                        <Text fontWeight="semibold" fontSize="md">{service.name}</Text>
                        <Text fontSize="sm" fontWeight="bold" color="green.600">
                          ${service.price} × {service.quantity} numbers
                        </Text>
                        <Grid templateColumns="repeat(3, 1fr)" gap={4} width="100%">
                          <Box>
                            <Text fontSize="xs" color="gray.800" fontWeight="medium">Billing Period</Text>
                            <Text fontWeight="bold" fontSize="sm">{service.fromDate} to {service.toDate}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="xs" color="gray.800" fontWeight="medium">Total Cost</Text>
                            <Text fontWeight="bold" fontSize="sm" color="green.600">${service.totalCost.toFixed(2)}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="xs" color="gray.800" fontWeight="medium">Next Billing</Text>
                            <Text fontWeight="bold" fontSize="sm">{service.nextBilling}</Text>
                          </Box>
                        </Grid>
                      </VStack>
                      <VStack align="end" spacing={3}>
                        <Badge colorScheme="green">{service.status}</Badge>
                        <Button 
                          leftIcon={<FaDownload />} 
                          size="sm" 
                          colorScheme="blue" 
                          variant="outline"
                          onClick={() => handleDownloadInvoice(service.invoiceId)}
                        >
                          Download
                        </Button>
                      </VStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
              
              <Divider my={4} />
              
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="bold">Total Due</Text>
                <Text fontWeight="bold" fontSize="xl">
                  ${calculateTotalDue().toFixed(2)}
                </Text>
              </Flex>

              <Divider my={4} />

              {/* Action Buttons */}
              <Flex justify="flex-end" gap={4}>
                <Button borderRadius={"full"} leftIcon={<FaFileInvoice />} colorScheme="teal" variant="outline" minW="180px">
                  Download All Invoices
                </Button>
                <Button borderRadius={"full"} leftIcon={<FaCreditCard />} colorScheme="blue" minW="120px">
                  Pay Now
                </Button>
              </Flex>
            </CardBody>
          </Card>
        </Grid>

        {/* Invoice History */}
        <Card borderRadius="12px" bg={cardBg} border="1px solid" borderColor={borderColor}>
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

            {/* Collapsible Filters */}
            <Collapse in={showFilters} animateOpacity>
              <Card bg="gray.50" mb={4} borderRadius="md">
                <CardBody py={4}>
                  <VStack spacing={4} align="stretch">
                    {/* Quick Filters */}
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700">
                        Quick Filters:
                      </Text>
                      <Wrap spacing={8}>
                        <WrapItem>
                          <Button
                            size="sm"
                            borderRadius='full'
                            variant="outline"
                            colorScheme="blue"
                            leftIcon={<FaCalendarAlt />}
                            onClick={() => applyQuickFilter('last30days')}
                          >
                            Last 30 Days
                          </Button>
                        </WrapItem>
                        <WrapItem>
                          <Button
                          borderRadius='full'

                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                            leftIcon={<FaCalendarAlt />}
                            onClick={() => applyQuickFilter('thisMonth')}
                          >
                            This Month
                          </Button>
                        </WrapItem>
                        <WrapItem>
                          <Button
                          borderRadius='full'

                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                            leftIcon={<FaCalendarAlt />}
                            onClick={() => applyQuickFilter('lastMonth')}
                          >
                            Last Month
                          </Button>
                        </WrapItem>
                        <WrapItem>
                          <Button
                          borderRadius='full'

                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                            leftIcon={<FaCalendarAlt />}
                            onClick={() => applyQuickFilter('thisYear')}
                          >
                            This Year
                          </Button>
                        </WrapItem>
                        <WrapItem>
                          <Button
                          borderRadius='full'

                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                            leftIcon={<FaCalendarAlt />}
                            onClick={() => applyQuickFilter('lastYear')}
                          >
                            Last Year
                          </Button>
                        </WrapItem>
                      </Wrap>
                    </Box>

                    {/* Advanced Filters */}
                    <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4} alignItems="end">
                      <GridItem>
                        <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">
                          From Date
                        </Text>
                        <Input
                          type="date"
                          size="sm"
                          borderRadius='full'
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          bg="white"
                        />
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">
                          To Date
                        </Text>
                        <Input
                          borderRadius='full'

                          type="date"
                          size="sm"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          bg="white"
                        />
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">
                          Status
                        </Text>
                        <Select
                          borderRadius='full'

                          size="sm"
                          placeholder="All Status"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          bg="white"
                        >
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                          <option value="overdue">Overdue</option>
                        </Select>
                      </GridItem>
                      <GridItem>
                        <Button
                          borderRadius='full'

                          leftIcon={<FaTimes />}
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          onClick={clearAllFilters}
                          w="full"
                        >
                          Clear Filters
                        </Button>
                      </GridItem>
                    </Grid>
                  </VStack>
                </CardBody>
              </Card>
            </Collapse>

            {/* Search Bar */}
            <Flex justify="space-between" align="center" mb={4}>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <FaSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="white"
                  borderRadius={"full"}
                />
              </InputGroup>
              <Text fontSize="sm" color="gray.600">
                {totalResults} invoice{totalResults !== 1 ? 's' : ''} found
              </Text>
            </Flex>

            <Table variant="simple" h={"350px"} overflow={"auto"}>
              <Thead>
                <Tr
                  sx={{
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
                  }}
                >
                  <Th>Invoice ID</Th>
                  <Th onClick={() => handleSort('service')} _hover={{ bg: "gray.200" }}>
                    <Flex align="center" justify="center">
                      Service Name
                      {sortField === 'service' && (
                        <Icon as={sortDirection === 'asc' ? FaChevronUp : FaChevronDown} ml={1} boxSize={3} />
                      )}
                    </Flex>
                  </Th>
                  <Th onClick={() => handleSort('date')} _hover={{ bg: "gray.200" }}>
                    <Flex align="center" justify="center">
                      Invoice Date
                      {sortField === 'date' && (
                        <Icon as={sortDirection === 'asc' ? FaChevronUp : FaChevronDown} ml={1} boxSize={3} />
                      )}
                    </Flex>
                  </Th>
                  <Th>MRC Amount</Th>
                  <Th>Usage Amount</Th>
                  <Th onClick={() => handleSort('amount')} isNumeric _hover={{ bg: "gray.200" }}>
                    <Flex align="center" justify="center">
                      Amount
                      {sortField === 'amount' && (
                        <Icon as={sortDirection === 'asc' ? FaChevronUp : FaChevronDown} ml={1} boxSize={3} />
                      )}
                    </Flex>
                  </Th>
                  <Th onClick={() => handleSort('status')} _hover={{ bg: "gray.200" }}>
                    <Flex align="center" justify="center">
                      Status
                      {sortField === 'status' && (
                        <Icon as={sortDirection === 'asc' ? FaChevronUp : FaChevronDown} ml={1} boxSize={3} />
                      )}
                    </Flex>
                  </Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentInvoices.length > 0 ? (
                  currentInvoices.map((invoice) => (
                    <Tr key={invoice.id} _hover={{ bg: 'gray.50' }}>
                      <Td textAlign="center" fontWeight="medium">{invoice.id}</Td>
                      <Td textAlign="center" fontWeight="500">{invoice.service}</Td>
                      <Td textAlign="center" fontSize="sm" color="gray.600">{invoice.date}</Td>
                      <Td textAlign="center" isNumeric fontWeight="semibold" color="blue.600">${invoice.mrcAmount.toFixed(2)}</Td>
                      <Td textAlign="center" isNumeric fontWeight="semibold" color="purple.600">${invoice.usageAmount.toFixed(2)}</Td>
                      <Td textAlign="center" isNumeric fontWeight="bold" color="green.600">${invoice.amount.toFixed(2)}</Td>
                      <Td textAlign="center">
                        {/* <Badge  colorScheme={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge> */}
                        <Badge colorScheme={getStatusColor(invoice.status)} borderRadius={"full"}>
                                    <HStack spacing={1}>
                                                  <Icon as={getStatusIcon(invoice.status)} boxSize={3} />
                                                  <Text>{invoice.status}</Text>
                                                </HStack>
                                              </Badge>
                      </Td>
                      <Td textAlign="center">
                        <HStack justify="center" spacing={2}>
                          <IconButton
                            icon={<FaEye />}
                            colorScheme="blue"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                            aria-label="View invoice"
                          />
                          <IconButton
                            icon={<FaDownload />}
                            colorScheme="green"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            aria-label="Download invoice"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={8}>
                      <Text color="gray.500" fontWeight="medium">
                        No invoices found matching your search criteria.
                      </Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>

            {/* Pagination Footer */}
            {totalResults > 0 && (
              <Flex
                justify="space-between"
                align="center"
                mt={4}
                pt={4}
                borderTop="1px solid"
                borderColor="gray.200"
              >
                {/* Results per page selector */}
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    Show
                  </Text>
                  <Select
                    size="sm"
                    value={resultsPerPage}
                    onChange={handleResultsPerPageChange}
                    width="auto"
                    borderRadius="md"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Select>
                  <Text fontSize="sm" color="gray.600">
                    results per page
                  </Text>
                </HStack>

                {/* Pagination controls */}
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    isDisabled={currentPage === 1}
                    borderRadius="md"
                  >
                    &lt;
                  </Button>

                  <Text fontSize="sm" color="gray.600" px={2}>
                    Page {currentPage} of {totalPages}
                  </Text>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    isDisabled={currentPage === totalPages}
                    borderRadius="md"
                  >
                    &gt;
                  </Button>
                </HStack>

                {/* Results count */}
                <Text fontSize="sm" color="gray.600">
                  Results {startIndex + 1} - {endIndex} from {totalResults}
                </Text>
              </Flex>
            )}
          </CardBody>
        </Card>
              </VStack>
            </TabPanel>

            {/* TopUp/Balance Tab */}
            <TabPanel>
              <TopUp
                userId={userId}
                walletBalance={walletBalance}
                onUpdateBalance={onUpdateBalance}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Invoice Detail Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Invoice Details - {selectedInvoice?.id}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedInvoice && (
                <VStack spacing={4} align="stretch">
                  <Grid templateColumns="1fr 1fr" gap={4}>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">Service:</Text>
                      <Text fontWeight="500">{selectedInvoice.service}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">MRC Amount:</Text>
                      <Text fontWeight="500" color="blue.600">${selectedInvoice.mrcAmount.toFixed(2)}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">Invoice Date:</Text>
                      <Text fontWeight="500">{selectedInvoice.date}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">Due Date:</Text>
                      <Text fontWeight="500">{selectedInvoice.dueDate}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">Usage Amount:</Text>
                      <Text fontWeight="500" color="purple.600">${selectedInvoice.usageAmount.toFixed(2)}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.600">Total Amount:</Text>
                      <Text fontWeight="500" color="green.600">${selectedInvoice.amount.toFixed(2)}</Text>
                    </Box>
                  </Grid>
                  <Divider />
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Total Amount:</Text>
                    <Text fontWeight="bold" fontSize="xl" color="green.600">
                      ${selectedInvoice.amount.toFixed(2)}
                    </Text>
                  </Flex>
                  <Badge 
                    colorScheme={getStatusColor(selectedInvoice.status)}
                    alignSelf="start"
                    fontSize="md"
                    px={3}
                    py={1}
                  >
                    Status: {selectedInvoice.status}
                  </Badge>
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>


      </VStack>
    </Box>
  );
};

export default Billing;