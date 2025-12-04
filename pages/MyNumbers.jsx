import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Button,
  Icon,
  Select,
  Flex,
  InputGroup,
  Input,
  Spacer,
  InputRightElement,
  Spinner,
  Center,
  useToast,
  Badge,
  SimpleGrid,
  Card,
  CardBody
} from '@chakra-ui/react';
import { FaFileExcel, FaEye, FaSearch, FaUnlink, FaChevronCircleLeft, FaChevronCircleRight } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import NumberPricingModal from '../Modals/NumberPricingModal';
import api from '../services/api';

function MyNumbers({ onRequestDisconnection, refreshTrigger }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [disconnectRequests, setDisconnectRequests] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allocationSummary, setAllocationSummary] = useState({
    totalRequired: 0,
    totalAllocated: 0,
    pendingAllocation: 0
  });
  const toast = useToast();

  useEffect(() => {
    fetchNumbers();
    fetchAllocationSummary();
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchNumbers();
      fetchAllocationSummary();
    }
  }, [refreshTrigger]);

  const fetchNumbers = async () => {
    try {
      setLoading(true);
      const response = await api.numbers.getAll();
      if (response.success) {
        setNumbers(response.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load numbers',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching numbers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load numbers',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocationSummary = async () => {
    try {
      const ordersResponse = await api.orders.getAll();
      if (ordersResponse.success && ordersResponse.data) {
        const orders = ordersResponse.data;
        const numbersResponse = await api.numbers.getAll();
        const allNumbers = numbersResponse.success ? numbersResponse.data : [];

        let totalRequired = 0;
        let totalAllocated = 0;

        orders.forEach(order => {
          if (order.orderStatus === 'Delivered') {
            totalRequired += order.quantity || 0;
            const allocatedCount = allNumbers.filter(n => n.order_id === order.id).length;
            totalAllocated += allocatedCount;
          }
        });

        const pendingAllocation = Math.max(0, totalRequired - totalAllocated);

        setAllocationSummary({
          totalRequired,
          totalAllocated,
          pendingAllocation
        });
      }
    } catch (error) {
      console.error('Error fetching allocation summary:', error);
    }
  };

  // Filter numbers based on search term
  const filteredNumbers = useMemo(() => {
    if (!searchTerm.trim()) {
      return numbers;
    }

    const searchLower = searchTerm.toLowerCase();
    return numbers.filter(number =>
      number.country_name.toLowerCase().includes(searchLower) ||
      number.product_name.toLowerCase().includes(searchLower) ||
      number.area_code.toLowerCase().includes(searchLower) ||
      number.number.toLowerCase().includes(searchLower)
    );
  }, [numbers, searchTerm]);

  const handleDisconnectClick = (number) => {
    if (!onRequestDisconnection) {
      return;
    }
    onRequestDisconnection(number);
  };

  // Pagination calculations based on filtered numbers
  const totalResults = filteredNumbers.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, totalResults);
  const currentNumbers = filteredNumbers.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleExportToExcel = () => {
    const headers = ['S. No.', 'Country', 'Product Type', 'Area Code', 'Number', 'Status'];
    const rows = filteredNumbers.map((num, index) => [
      index + 1,
      num.country_name,
      num.product_name,
      num.area_code,
      num.number,
      num.status || 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', 'my-numbers.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleResultsPerPageChange = (e) => {
    setResultsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing results per page
  };

  const handleViewNumber = (number) => {
    setSelectedNumber(number);
    setIsPricingModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPricingModalOpen(false);
    setSelectedNumber(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'green';
      case 'Inactive':
        return 'gray';
      case 'Disconnected':
        return 'red';
   
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
    <Box
      flex={1}
      p={{base:4,md:6}}
      pb={2}
      bg="#f8f9fa"
      height="calc(100vh - 76px)"
      overflowY="auto"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Heading
            color="#1a3a52"
            fontSize="3xl"
            fontWeight="bold"
            letterSpacing="-0.2px"
          >
            My Numbers
          </Heading>
          <HStack spacing={6}>
            <Spacer/>
            <InputGroup w="250px">
              <Input
                boxShadow="lg"
                type="text"
                bg="white"
                placeholder="Search . . . ."
                borderRadius="full"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <InputRightElement width="4.5rem">
                {searchTerm ? (
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={clearSearch}
                    variant="ghost"
                    color="gray.500"
                    _hover={{ color: 'gray.700' }}
                  >
                    ✕
                  </Button>
                ) : (
                  <Icon as={FaSearch} color="gray.400" />
                )}
              </InputRightElement>
            </InputGroup>
            <Button
              leftIcon={<Icon as={FaFileExcel} />}
              onClick={handleExportToExcel}
              colorScheme="blue"
              variant="ghost"
              borderRadius="full"
              fontWeight="medium"
              isDisabled={filteredNumbers.length === 0}
            >
              Export
            </Button>
          </HStack>
        </HStack>

        {/* Search Results Info
        {searchTerm && (
          <Box
            bg="blue.50"
            borderRadius="md"
            p={3}
            border="1px solid"
            borderColor="blue.200"
          >
            <Text fontSize="sm" color="blue.700" fontWeight="medium">
              Found {filteredNumbers.length} number(s) matching "{searchTerm}"
              {filteredNumbers.length === 0 && ' - Try a different search term'}
            </Text>
          </Box>
        )} */}

        {/* Allocation Summary */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          <Card bg="white" borderRadius="12px" boxShadow="lg" border="1px solid" borderColor="gray.200">
            <CardBody>
              <HStack justify={"center"} spacing={12}>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">Total Quantity Required</Text>
                <Text fontSize="2xl" color="blue.600" fontWeight="bold">{allocationSummary.totalRequired}</Text>
              </HStack>
            </CardBody>
          </Card>

          <Card bg="white" borderRadius="12px" boxShadow="md" border="1px solid" borderColor="gray.200">
            <CardBody>
              <HStack justify={"center"} spacing={12}>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">Total Quantity Allocated</Text>
                <Text fontSize="2xl" color="green.600" fontWeight="bold">{allocationSummary.totalAllocated}</Text>
              </HStack>
            </CardBody>
          </Card>

          <Card bg="white" borderRadius="12px" boxShadow="md" border="1px solid" borderColor="gray.200">
            <CardBody>
              <HStack justify={"center"} spacing={12}>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">Pending Allocation</Text>
                <Text fontSize="2xl" color={allocationSummary.pendingAllocation > 0 ? "orange.600" : "green.600"} fontWeight="bold">{allocationSummary.pendingAllocation}</Text>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Box
          bg="white"
          borderRadius="12px"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          h="60%"
          overflowY="auto"
          p={2}
        >
          <Table variant="simple" h="470px">
            <Thead position="sticky" top={0} bg="white" zIndex={1}>
              <Tr
                sx={{
                  '& > th': {
                    bg: "gray.200",
                    color: "gray.700",
                    fontWeight: "semibold",
                    fontSize: "sm",
                    letterSpacing: "0.3px",
                    borderBottom: "2px solid",
                    borderColor: "blue.400",
                    textAlign: "center",
                  }
                }}
              >
                <Th width="10%">No.</Th>
                <Th>Country</Th>
                <Th>Product Type</Th>
                <Th>Area Code</Th>
                <Th>Number</Th>
                <Th>Status</Th>
                <Th width="20%">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentNumbers.length > 0 ? (
                currentNumbers.map((number, index) => (
                  <Tr key={number.id} _hover={{ bg: 'gray.50' }}>
                    <Td color={"blue.500"} fontWeight={"bold"} textAlign="center">{startIndex + index + 1}</Td>
                    <Td fontWeight={"semibold"} color={"green"} textAlign="center">{number.country_name}</Td>
                    
                    <Td textAlign="center"><Badge size={"lg"} bg={"blue.100"}>{number.product_name}</Badge></Td>
                    
                    <Td fontWeight={"semibold"} textAlign="center">{number.area_code}</Td>
                    <Td textAlign="center">{number.number}</Td>
                    <Td textAlign="center">
                      <Badge px={2} colorScheme={getStatusColor(number.status)} borderRadius="full">
                        {number.status || 'N/A'}
                      </Badge>
                    </Td>
                    <Td textAlign="center">
                      <HStack spacing={2} justify="center">
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          leftIcon={<Icon as={FaEye} />}
                          onClick={() => handleViewNumber(number)}
                        >
                          View
                        </Button>
                        {number.status !== 'Disconnected' && (
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            leftIcon={<Icon as={FaUnlink} />}
                            onClick={() => handleDisconnectClick(number)}
                            isDisabled={number.disconnection_status === 'Pending' || number.disconnection_status === 'Approved' || number.disconnection_status === 'Completed'}
                          >
                            {number.disconnection_status === 'Pending' ? 'Pending...' :
                             number.disconnection_status === 'Approved' ? 'Approved' :
                             number.disconnection_status === 'Rejected' ? 'Rejected' :
                             number.disconnection_status === 'Completed' ? 'Disconnected' : 'Disconnect'}
                          </Button>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
  <Td 
    colSpan={7}
    textAlign="center"
    color="gray.600"
    py={8}
    fontStyle='italic'
    fontSize="md"
  >
    <VStack spacing={3} justify="center">
      <Icon as={FiRefreshCw} boxSize={8} color="gray.500" />
      <Text>
        {searchTerm ? 'No numbers found matching your search' : 'No numbers purchased yet'}
      </Text>
    </VStack>
  </Td>
</Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination Section */}
        {totalResults > 0 && (
          <Box
            bg="white"
            borderRadius="12px"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            px={4}
            py={2}
          >
            <Flex
              justify="space-between"
              align="center"
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
                  size="lg"
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1}
                  borderRadius="md"
                >
                  <FaChevronCircleLeft/>
                </Button>
                
                <Text fontSize="sm" color="gray.600" px={2}>
                  Page {currentPage} of {totalPages}
                </Text>

                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage + 1)}
                  isDisabled={currentPage === totalPages}
                  borderRadius="md"
                >
                  <FaChevronCircleRight/>
                </Button>
              </HStack>

              {/* Results count */}
              <Text fontSize="sm" color="gray.600">
                Results {startIndex + 1} - {endIndex} of {totalResults}
                {searchTerm && ` (filtered from ${numbers.length} total)`}
              </Text>
            </Flex>
          </Box>
        )}
      </VStack>

      {/* Pricing Modal */}
      <NumberPricingModal
        isOpen={isPricingModalOpen}
        onClose={handleCloseModal}
        selectedNumber={selectedNumber}
      />
    </Box>
  );
}

export default MyNumbers;