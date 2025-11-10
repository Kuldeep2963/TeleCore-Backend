import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Badge,
  VStack,
  HStack,
  Heading,
  Text,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button,
  useColorModeValue,
  SimpleGrid,
  Flex
} from '@chakra-ui/react';
import { DownloadIcon, SearchIcon,ViewIcon } from '@chakra-ui/icons';
import { FiXCircle } from 'react-icons/fi';
function Products() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);

  const products = [
    {
      id: 1,
      country: 'Martinique (+596)',
      region: 'North America',
      productType: 'DID',
      areaCode: 'National (596)',
      edt: '8-10 Days',
      inventoryCount: 0
    },
    {
      id: 2,
      country: 'Macau (+853)',
      region: 'Asia',
      productType: 'Two Way Voice',
      areaCode: 'Mobile (6)',
      edt: '15 Days',
      inventoryCount: 0
    },
    {
      id: 3,
      country: 'Antigua & Barbuda (+1)',
      region: 'North America',
      productType: 'Two Way Voice',
      areaCode: 'Mobile (268)',
      edt: '120 Days',
      inventoryCount: 0
    },
    {
      id: 4,
      country: 'Turkey (+90)',
      region: 'Asia',
      productType: 'Two Way SMS',
      areaCode: 'FTEU Shortcode',
      edt: '35-40 Days',
      inventoryCount: 0
    }
  ];

  // Pagination calculations
  const totalResults = products.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, totalResults);
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleResultsPerPageChange = (e) => {
    setResultsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const pageBg = useColorModeValue('#f8f9fa', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('#1a3a52', 'white');
  const subheadingColor = useColorModeValue('gray.800', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('gray.200', 'gray.700');
  const rowHoverBg = useColorModeValue('#f8fafc', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.900');

  const handleExportExcel = () => {
    console.log('Export to Excel');
  };

  const handleSearch = () => {
    console.log('Search products');
  };

  const handleClear = () => {
    console.log('Clear filters');
  };

  const handleViewProduct = (product) => {
    // Transform product data to match OrderNumberView expected format
    const orderData = {
      orderNo: `PROD-${product.id}`,
      country: product.country,
      productType: product.productType.toLowerCase(),
      serviceName: product.productType.toLowerCase().replace('-', ' '),
      areaCode: product.areaCode,
      quantity: 1, // Default quantity for product view
      orderStatus: 'Available',
      orderDate: new Date().toISOString().split('T')[0], // Today's date
      region: product.region, // Add region for product view
      edt: product.edt // Add estimated delivery time for product view
    };

    navigate('/order-number-view', { state: { orderData } });
  };

  return (
    <Box
      flex={1}
      py={6}
      px={{ base: 4, md: 6 }}
      bg={pageBg}
      height="calc(100vh - 76px)"
      overflowY="auto"
    >
      <Container maxW="container.xl" p={0}>
        <VStack align="flex-start" spacing={2} mb={6}>
          <Heading as="h1" color={headingColor} fontSize="3xl" fontWeight="bold">
            Products
          </Heading>
        </VStack>

        <Box
          bg={cardBg}
          borderRadius="16px"
          p={{ base: 5, md: 6 }}
          boxShadow="sm"
          border="1px solid"
          borderColor={borderColor}
          mb={6}
        >
          <VStack align="flex-start" spacing={4} w="full">
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} w="full">
              <Box>
                <Text color={mutedTextColor} fontSize="sm" mb={2}>
                  Country
                </Text>
                <Select
                  placeholder="Select Country"
                  bg={inputBg}
                  color={textColor}
                  borderColor={borderColor}
                  focusBorderColor="blue.400"
                >
                  <option value="martinique">Martinique (+596)</option>
                  <option value="macau">Macau (+853)</option>
                  <option value="antigua">Antigua & Barbuda (+1)</option>
                  <option value="turkey">Turkey (+90)</option>
                </Select>
              </Box>
              <Box>
                <Text color={mutedTextColor} fontSize="sm" mb={2}>
                  Product Type
                </Text>
                <Select
                  placeholder="Select Product Type"
                  bg={inputBg}
                  color={textColor}
                  borderColor={borderColor}
                  focusBorderColor="blue.400"
                >
                  <option value="did">DID</option>
                  <option value="two-way-voice">Two Way Voice</option>
                  <option value="two-way-sms">Two Way SMS</option>
                  <option value="mobile">Mobile</option>
                </Select>
              </Box>

              <Box display="flex" alignItems="flex-end">
                <HStack spacing={3} w="full">
                  <Button
                    borderRadius={"full"}
                    leftIcon={<SearchIcon />}
                    colorScheme="blue"
                    onClick={handleSearch}
                    flex={1}
                  >
                    Search
                  </Button>
                  <Button
                    borderRadius={"full"}
                    leftIcon={<FiXCircle />}
                    variant="outline"
                    colorScheme="gray"
                    onClick={handleClear}
                    flex={1}
                  >
                    Clear
                  </Button>
                </HStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Box>

        <Box
          bg={cardBg}
          borderRadius="16px"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="sm"
          p={{ base: 5, md: 6 }}
        >
          <HStack justify="space-between" align="center" mb={4} spacing={4}>
            <VStack align="flex-start" spacing={1}>
              <Heading as="h2" color={subheadingColor} fontSize="lg" fontWeight="semibold">
                Product Inventory
              </Heading>
            </VStack>
            <Button
              leftIcon={<DownloadIcon />}
              colorScheme="green"
              borderRadius={"full"}
              variant="solid"
              onClick={handleExportExcel}
            >
              Export Excel
            </Button>
          </HStack>


          <Table variant="simple" size="md">
            <Thead bg={headerBg}>
              <Tr>
                <Th fontSize={"sm"} color={subheadingColor} fontWeight="semibold">#</Th>
                <Th fontSize={"sm"} color={subheadingColor} fontWeight="semibold">Country</Th>
                <Th fontSize={"sm"} color={subheadingColor} fontWeight="semibold">Region</Th>
                <Th fontSize={"sm"} color={subheadingColor} fontWeight="semibold">Product Type</Th>
                <Th fontSize={"sm"} color={subheadingColor} fontWeight="semibold">Area Code (Prefix)</Th>
                <Th fontSize={"sm"} color={subheadingColor} fontWeight="semibold">EDT</Th>
                {/* <Th fontSize={"sm"} color={subheadingColor} fontWeight="semibold">Inventory Count</Th> */}
                <Th fontSize={"sm"} color={subheadingColor} fontWeight="semibold">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <Tr
                    key={product.id}
                    _hover={{ bg: rowHoverBg }}
                    transition="background-color 0.2s"
                  >
                    <Td color={textColor} fontWeight="medium">{product.id}</Td>
                    <Td color={textColor}>{product.country}</Td>
                    <Td color={textColor}>{product.region}</Td>
                    <Td color={"Gray.700"}><Badge colorScheme='teal'>{product.productType}</Badge></Td>
                    <Td color={textColor}>{product.areaCode}</Td>
                    <Td color={textColor}>{product.edt}</Td>
                    {/* <Td color={textColor}>{product.inventoryCount}</Td> */}
                    <Td>
                      <Button
                        variant="ghost"
                        colorScheme="blue"
                        size="sm"
                        leftIcon={<ViewIcon />}
                        onClick={() => handleViewProduct(product)}
                      >
                        View
                      </Button>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td
                    colSpan={8}
                    textAlign="center"
                    color="gray.400"
                    py={8}
                    fontSize="sm"
                  >
                    No products found
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination Section */}
        {totalResults > 0 && (
          <Box
          mt={4}
            bg={cardBg}
            borderRadius="16px"
            boxShadow="sm"
            border="1px solid"
            borderColor={borderColor}
            p={4}
          >
            <Flex
              justify="space-between"
              align="center"
            >
              {/* Results per page selector */}
              <HStack spacing={2}>
                <Text fontSize="sm" color={mutedTextColor}>
                  Show
                </Text>
                <Select
                  size="sm"
                  value={resultsPerPage}
                  onChange={handleResultsPerPageChange}
                  width="auto"
                  borderRadius="md"
                  bg={inputBg}
                  borderColor={borderColor}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Select>
                <Text fontSize="sm" color={mutedTextColor}>
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
                
                <Text fontSize="sm" color={mutedTextColor} px={2}>
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
              <Text fontSize="sm" color={mutedTextColor}>
                Results {startIndex + 1} - {endIndex} from the {totalResults}
              </Text>
            </Flex>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Products;
