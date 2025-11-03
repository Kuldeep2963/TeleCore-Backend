import React, { useRef, useState } from 'react';
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
  FormControl,
  FormLabel,
  Select,
  Input,
  Grid,
  GridItem,
  Card,
  CardBody,
  Button,
  Divider,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { FiSearch, FiXCircle } from 'react-icons/fi';
import { FaEye } from 'react-icons/fa';
function MyOrders() {
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);

  // Sample orders data
  const orders = [
    {
      id: 1,
      orderNo: 'ORD-001',
      country: 'United States (+1)',
      productType: 'DID',
      serviceName: 'Voice',
      areaCode: 'Toll Free (800)',
      quantity: 5,
      orderStatus: 'Active',
      orderDate: '2025-01-15'
    },
    {
      id: 2,
      orderNo: 'ORD-002',
      country: 'United Kingdom (+44)',
      productType: 'Freephone',
      serviceName: 'SMS',
      areaCode: 'London (020)',
      quantity: 3,
      orderStatus: 'Completed',
      orderDate: '2025-01-10'
    },
    {
      id: 3,
      orderNo: 'ORD-003',
      country: 'Canada (+1)',
      productType: 'DID',
      serviceName: 'Voice & SMS',
      areaCode: 'Toronto (416)',
      quantity: 2,
      orderStatus: 'Pending',
      orderDate: '2025-01-20'
    },
    {
      id: 4,
      orderNo: 'ORD-004',
      country: 'Australia (+61)',
      productType: 'Virtual Number',
      serviceName: 'Voice',
      areaCode: 'Sydney (02)',
      quantity: 4,
      orderStatus: 'Active',
      orderDate: '2025-01-08'
    }
  ];

  const countryRef = useRef(null);
  const productTypeRef = useRef(null);
  const serviceNameRef = useRef(null);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const statusRef = useRef(null);

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
    }
  };

  const handleClear = () => {
    if (countryRef.current) countryRef.current.value = '';
    if (productTypeRef.current) productTypeRef.current.value = '';
    if (serviceNameRef.current) serviceNameRef.current.value = '';
    if (startDateRef.current) startDateRef.current.value = '';
    if (endDateRef.current) endDateRef.current.value = '';
    if (statusRef.current) statusRef.current.value = '';
    
    countryRef.current?.focus();
  };

  // Pagination calculations
  const totalResults = orders.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, totalResults);
  const currentOrders = orders.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleResultsPerPageChange = (e) => {
    setResultsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'green';
      case 'completed': return 'blue';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
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
        <Heading color="#1a3a52" fontSize="3xl" fontWeight="bold">
          My Orders
        </Heading>

        <Card bg="white" borderRadius="12px" boxShadow="sm" border="1px solid" borderColor="gray.200">
          <CardBody p={6}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(6, 1fr)" }} gap={4} alignItems="end" w="full">
              <FormControl>
                <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                  Country
                </FormLabel>
                <Select 
                  ref={countryRef}
                  placeholder="Select country" 
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: "blue.400" }}
                  onKeyDown={(e) => handleKeyDown(e, productTypeRef)}
                >
                  <option value="us">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="ca">Canada</option>
                  <option value="au">Australia</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                  Product Type
                </FormLabel>
                <Select 
                  ref={productTypeRef}
                  placeholder="Select product type" 
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: "blue.400" }}
                  onKeyDown={(e) => handleKeyDown(e, serviceNameRef)}
                >
                  <option value="did">DID</option>
                  <option value="freephone">Freephone</option>
                  <option value="universal">Universal Freephone</option>
                  <option value="mobile">Mobile</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                  Service Name
                </FormLabel>
                <Select 
                  ref={serviceNameRef}
                  placeholder="Select service name" 
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: "blue.400" }}
                  onKeyDown={(e) => handleKeyDown(e, startDateRef)}
                >
                  <option value="voice">Voice</option>
                  <option value="sms">SMS</option>
                  <option value="both">Voice & SMS</option>
                  <option value="virtual">Virtual Number</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                  Start Date
                </FormLabel>
                <Input 
                  ref={startDateRef}
                  type="date" 
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: "blue.400" }}
                  onKeyDown={(e) => handleKeyDown(e, endDateRef)}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                  End Date
                </FormLabel>
                <Input 
                  ref={endDateRef}
                  type="date" 
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: "blue.400" }}
                  onKeyDown={(e) => handleKeyDown(e, statusRef)}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                  Status
                </FormLabel>
                <Select 
                  ref={statusRef}
                  placeholder="Select status" 
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: "blue.400" }}
                  onKeyDown={(e) => handleKeyDown(e, null)}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </FormControl>

              
              <GridItem colSpan={{ base: 1, md: 6 }} display="flex" justifyContent="flex-end" alignItems="center" gap={3}>
                <Button
                  colorScheme="blue"
                  size="md"
                  borderRadius="full"
                  fontWeight="semibold"
                  boxShadow="0 2px 4px rgba(49, 130, 206, 0.25)"
                  _hover={{
                    boxShadow: '0 4px 8px rgba(49, 130, 206, 0.35)'
                  }}
                  transition="all 0.2s ease"
                  leftIcon={<FiSearch />}
                >
                  Search
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  borderRadius="full"
                  fontWeight="semibold"
                  borderColor="gray.500"
                  color="gray.600"
                  _hover={{
                    bg: "gray.100",
                    borderColor: "gray.400"
                  }}
                  transition="all 0.2s ease"
                  onClick={handleClear}
                  leftIcon={<FiXCircle />}
                >
                  Clear
                </Button>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        <Divider borderColor="gray.300" />

        <Box
          bg="white"
          borderRadius="12px"
          p={2}
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <Table variant="simple">
            <Thead>
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
                <Th width="3%">No.</Th>
                <Th w="5%">Order</Th>
                <Th w={"5%"}>Country</Th>
                <Th w={"15%"}>Product Type</Th>
                <Th w={"15%"}>Service Name</Th>
                <Th w={"15%"}>Area Code(Prefix)</Th>
                <Th w={"5%"}>Quantity</Th>
                <Th w={"10%"}>Order Status</Th>
                <Th w={"10%"}>Order Date</Th>
                <Th width="5%">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <Tr key={order.id} _hover={{ bg: 'gray.50' }}>
                    <Td textAlign="center">{order.id}</Td>
                    <Td textAlign="center">{order.orderNo}</Td>
                    <Td textAlign="center">{order.country}</Td>
                    <Td textAlign="center">{order.productType}</Td>
                    <Td textAlign="center">{order.serviceName}</Td>
                    <Td textAlign="center">{order.areaCode}</Td>
                    <Td textAlign="center">{order.quantity}</Td>
                    <Td textAlign="center">
                      <Badge colorScheme={getStatusColor(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </Td>
                    <Td textAlign="center">{order.orderDate}</Td>
                    <Td textAlign="center">
                      <HStack spacing={2} justify="center">
                        
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          fontWeight="bold"
                          leftIcon={<FaEye />}
                        >
                          View
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td 
                    colSpan={10}
                    textAlign="center"
                    color="gray.400"
                    py={8}
                    fontSize="sm"
                  >
                    No orders found
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
      </VStack>
    </Box>
  );
}

export default MyOrders;