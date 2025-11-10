import React, { useState, useMemo } from 'react';
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
  InputRightElement
} from '@chakra-ui/react';
import { FaFileExcel, FaEye, FaPlug, FaSearch, FaUnlink } from 'react-icons/fa';
import NumberPricingModal from '../Modals/NumberPricingModal';

function MyNumbers({ onRequestDisconnection }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [disconnectRequests, setDisconnectRequests] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const [numbers, setNumbers] = useState([
    {
      id: 1,
      country: 'United States (+)',
      productType: 'Freephone',
      areaCode: 'Freephone (866)',
      number: '18664970069',
      linkedOrderId: 3,
      disconnectionStatus: null
    },
    {
      id: 2,
      country: 'United States (+)',
      productType: 'Freephone',
      areaCode: 'Freephone (866)',
      number: '18664970071',
      linkedOrderId: 3,
      disconnectionStatus: null
    },
    {
      id: 3,
      country: 'United States (+)',
      productType: 'Freephone',
      areaCode: 'Freephone (866)',
      number: '18664970082',
      linkedOrderId: 3,
      disconnectionStatus: null
    },
    {
      id: 4,
      country: 'United States (+)',
      productType: 'Freephone',
      areaCode: 'Freephone (866)',
      number: '18664970087',
      linkedOrderId: 3,
      disconnectionStatus: null
    },
    {
      id: 5,
      country: 'United States (+)',
      productType: 'Freephone',
      areaCode: 'Freephone (868)',
      number: '18552942813',
      linkedOrderId: 1,
      disconnectionStatus: null
    },
    {
      id: 6,
      country: 'Myanmar (+95)',
      productType: 'DID',
      areaCode: 'Mobile (9)',
      number: '959652005122',
      linkedOrderId: 1,
      disconnectionStatus: null
    },
    {
      id: 7,
      country: 'Myanmar (+95)',
      productType: 'DID',
      areaCode: 'Mobile (9)',
      number: '959652005123',
      linkedOrderId: 2,
      disconnectionStatus: null
    },
    {
      id: 8,
      country: 'Myanmar (+95)',
      productType: 'DID',
      areaCode: 'Mobile (9)',
      number: '959652005124',
      linkedOrderId: 2,
      disconnectionStatus: null
    }
  ]);

  // Filter numbers based on search term
  const filteredNumbers = useMemo(() => {
    if (!searchTerm.trim()) {
      return numbers;
    }

    const searchLower = searchTerm.toLowerCase();
    return numbers.filter(number =>
      number.country.toLowerCase().includes(searchLower) ||
      number.productType.toLowerCase().includes(searchLower) ||
      number.areaCode.toLowerCase().includes(searchLower) ||
      number.number.toLowerCase().includes(searchLower)
    );
  }, [numbers, searchTerm]);

  const handleDisconnectClick = (number) => {
    if (!onRequestDisconnection) {
      return;
    }

    setNumbers(prevNumbers => prevNumbers.map(item => (
      item.id === number.id
        ? { ...item, disconnectionStatus: 'Pending' }
        : item
    )));

    setDisconnectRequests(prev => ({
      ...prev,
      [number.id]: 'Pending'
    }));

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
    const headers = ['S. No.', 'Country', 'Product Type', 'Area Code', 'Number'];
    const rows = filteredNumbers.map((num, index) => [
      index + 1,
      num.country,
      num.productType,
      num.areaCode,
      num.number
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

  return (
    <Box
      flex={1}
      p={6}
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

        {/* Search Results Info */}
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
        )}

        <Box
          bg="white"
          borderRadius="12px"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          h="480px"
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
                <Th width="20%">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentNumbers.length > 0 ? (
                currentNumbers.map((number, index) => (
                  <Tr key={number.id} _hover={{ bg: 'gray.50' }}>
                    <Td textAlign="center">{startIndex + index + 1}</Td>
                    <Td textAlign="center">{number.country}</Td>
                    <Td textAlign="center">{number.productType}</Td>
                    <Td textAlign="center">{number.areaCode}</Td>
                    <Td textAlign="center">{number.number}</Td>
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
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          leftIcon={<Icon as={FaUnlink} />}
                          onClick={() => handleDisconnectClick(number)}
                          isDisabled={number.disconnectionStatus === 'Pending'}
                        >
                          {number.disconnectionStatus === 'Pending' ? 'Pending...' : 'Disconnect'}
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td 
                    colSpan={6}
                    textAlign="center"
                    color="gray.400"
                    py={8}
                    fontSize="sm"
                  >
                    {searchTerm ? 'No numbers found matching your search' : 'No numbers purchased yet'}
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
            p={4}
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