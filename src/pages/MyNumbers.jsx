import React, { useState } from 'react';
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
  Flex
} from '@chakra-ui/react';
import { FaFileExcel, FaEye, FaPlug } from 'react-icons/fa';

function MyNumbers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);

  // Sample data matching the screenshot
  const numbers = [
    { id: 1, country: 'United States (+)', productType: 'Freephone', areaCode: 'Freephone (866)', number: '18664970069' },
    { id: 2, country: 'United States (+)', productType: 'Freephone', areaCode: 'Freephone (866)', number: '18664970071' },
    { id: 3, country: 'United States (+)', productType: 'Freephone', areaCode: 'Freephone (866)', number: '18664970082' },
    { id: 4, country: 'United States (+)', productType: 'Freephone', areaCode: 'Freephone (866)', number: '18664970087' },
    { id: 5, country: 'United States (+)', productType: 'Freephone', areaCode: 'Freephone (868)', number: '18552942813' },
    { id: 6, country: 'Myanmar (+95)', productType: 'DID', areaCode: 'Mobile (9)', number: '959652005122' },
    { id: 7, country: 'Myanmar (+95)', productType: 'DID', areaCode: 'Mobile (9)', number: '959652005123' },
    { id: 8, country: 'Myanmar (+95)', productType: 'DID', areaCode: 'Mobile (9)', number: '959652005124' }
  ];

  // Pagination calculations
  const totalResults = numbers.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, totalResults);
  const currentNumbers = numbers.slice(startIndex, endIndex);

  const handleExportToExcel = () => {
    const headers = ['S. No.', 'Country', 'Product Type', 'Area Code', 'Number'];
    const rows = numbers.map((num, index) => [
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

  return (
    <Box
      flex={1}
      p={6}
      bg="#f8f9fa"
      height="calc(100vh - 76px)"
      overflowY="auto"
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading
            color="#1a3a52"
            fontSize="3xl"
            fontWeight="bold"
            letterSpacing="-0.2px"
          >
            My Numbers
          </Heading>
          <Button
            leftIcon={<Icon as={FaFileExcel} />}
            onClick={handleExportToExcel}
            colorScheme="blue"
            variant="outline"
            borderRadius="lg"
            fontWeight="medium"
          >
            Export
          </Button>
        </HStack>

        <Box
          bg="white"
          borderRadius="12px"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          h="450px"
          overflowY="auto"
          p={2}
        >
          <Table variant="simple">
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
                <Th width="10%">ID</Th>
                <Th>Country</Th>
                <Th>Product Type</Th>
                <Th>Area Code</Th>
                <Th>Number</Th>
                <Th width="20%">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentNumbers.length > 0 ? (
                currentNumbers.map((number) => (
                  <Tr key={number.id} _hover={{ bg: 'gray.50' }}>
                    <Td textAlign="center">{number.id}</Td>
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
                          fontWeight="bold"
                          leftIcon={<Icon as={FaEye} />}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          fontWeight="bold"
                          leftIcon={<Icon as={FaPlug} />}
                        >
                          Disconnect
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
                    No numbers purchased yet
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
                Results {startIndex + 1} - {endIndex} from the {totalResults}
              </Text>
            </Flex>
          </Box>
        )}

        {/* Footer */}
       </VStack>
    </Box>
  );
}

export default MyNumbers;