import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Icon,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { FiSearch, FiXCircle,FiCheck, FiClock, FiX, FiDollarSign,FiPackage } from 'react-icons/fi';
import { FaEye } from 'react-icons/fa';
function MyOrders() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);

  // Sample orders data
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNo: 'ORD-001',
      country: 'United States (+1)',
      productType: 'DID',
      serviceName: 'Voice',
      areaCode: 'Toll Free (800)',
      quantity: 5,
      orderStatus: 'In Progress',
      orderDate: '2025-01-15',
      disconnectionStatus: null,
      pricing: {
        nrc: '$24.00',
        mrc: '$24.00',
        ppm: '$0.0380'
      },
      desiredPricing: {
        nrc: '$18.00',
        mrc: '$20.00',
        ppm: '$0.0300'
      }
    },
    {
      id: 2,
      orderNo: 'ORD-002',
      country: 'United Kingdom (+44)',
      productType: 'Freephone',
      serviceName: 'SMS',
      areaCode: 'London (020)',
      quantity: 3,
      orderStatus: 'Confirmed',
      orderDate: '2025-01-10',
      disconnectionStatus: null,
      pricing: {
        nrc: '$30.00',
        mrc: '$28.00',
        ppmFix: '$0.0400',
        ppmMobile: '$0.0550',
        ppmPayphone: '$0.0650'
      },
      desiredPricing: {
        nrc: '$27.00',
        mrc: '$25.00',
        ppmFix: '$0.0350',
        ppmMobile: '$0.0500',
        ppmPayphone: '$0.0580'
      }
    },
    {
      id: 3,
      orderNo: 'ORD-003',
      country: 'Canada (+1)',
      productType: 'DID',
      serviceName: 'Voice & SMS',
      areaCode: 'Toronto (416)',
      quantity: 2,
      orderStatus: 'Amount Paid',
      orderDate: '2025-01-20',
      disconnectionStatus: null,
      pricing: {
        nrc: '$26.00',
        mrc: '$26.00',
        ppm: '$0.0400'
      },
      desiredPricing: {
        nrc: '$24.00',
        mrc: '$24.00',
        ppm: '$0.0350'
      }
    },
    {
      id: 4,
      orderNo: 'ORD-004',
      country: 'Australia (+61)',
      productType: 'Virtual Number',
      serviceName: 'Voice',
      areaCode: 'Sydney (02)',
      quantity: 4,
      orderStatus: 'Delivered',
      orderDate: '2025-01-08',
      disconnectionStatus: null,
      pricing: {
        nrc: '$32.00',
        mrc: '$30.00',
        ppm: '$0.0450'
      },
      desiredPricing: {
        nrc: '$30.00',
        mrc: '$28.00',
        ppm: '$0.0400'
      }
    },
    {
      id: 5,
      orderNo: 'ORD-005',
      country: 'Germany (+49)',
      productType: 'Mobile',
      serviceName: 'Voice',
      areaCode: 'Berlin (030)',
      quantity: 1,
      orderStatus: 'Cancelled',
      orderDate: '2025-01-05',
      disconnectionStatus: null,
      pricing: {
        nrc: '$36.00',
        mrc: '$34.00',
        Incomingppm: '$0.0250',
        Outgoingppmfix: '$0.0370',
        Outgoingppmmobile: '$0.0470',
        incmongsms: '$0.0130',
        outgoingsms: '$0.0180'
      },
      desiredPricing: {
        nrc: '$33.00',
        mrc: '$31.00',
        Incomingppm: '$0.0220',
        Outgoingppmfix: '$0.0340',
        Outgoingppmmobile: '$0.0430',
        incmongsms: '$0.0100',
        outgoingsms: '$0.0150'
      }
    }
  ]);

  const updateOrderDisconnectionStatus = (orderId, status) => {
    setOrders(prevOrders => prevOrders.map(order => (
      order.id === orderId ? { ...order, disconnectionStatus: status } : order
    )));
  };

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

  const handleViewOrder = (order) => {
    navigate('/order-number-view', { state: { orderData: order } });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'green';
      case 'confirmed': return 'blue';
      case 'cancelled': return 'red';
      case 'in progress': return 'yellow';
      case 'amount paid': return 'purple';
      default: return 'gray';
    }
  };
  const getStatusIcon = (status) => {
      switch (status?.toLowerCase()) {
        case 'delivered': return FiCheck;
        case 'confirmed': return FiClock;
        case 'cancelled': return FiX;
        case 'in progress': return FiClock;
        case 'amount paid': return FiDollarSign;
        default: return FiPackage;
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
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} alignItems="end" w="full">
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
                  <option value="in progress">In Progress</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="amount paid">Amount Paid</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </FormControl>

              <GridItem colSpan={{ base: 1, md: 6 }} display="flex" justifyContent="center" alignItems="center" gap={3}>
                <Button
                  // variant={"ghost"}
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
                  variant="ghost"
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
                {/* <Th width="3%">No.</Th> */}
                <Th w="5%">Order</Th>
                <Th w={"5%"}>Country</Th>
                <Th w={"15%"}>Product Type</Th>
                <Th w={"15%"}>Service Name</Th>
                <Th w={"15%"}>Area Code(Prefix)</Th>
                <Th w={"5%"}>Quantity</Th>
                <Th w={"10%"}>Order Status</Th>
                <Th w={"20%"}>Order Date</Th>
                <Th width="5%">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <Tr key={order.id} _hover={{ bg: 'gray.50' }}>
                    {/* <Td textAlign="center">{order.id}</Td> */}
                    <Td textAlign="center">{order.orderNo}</Td>
                    <Td textAlign="center">{order.country}</Td>
                    <Td textAlign="center">{order.productType}</Td>
                    <Td textAlign="center">{order.serviceName}</Td>
                    <Td textAlign="center">{order.areaCode}</Td>
                    <Td textAlign="center">{order.quantity}</Td>
                    <Td textAlign="center">
                      
                      <Badge borderRadius={"full"} colorScheme={getStatusColor(order.orderStatus)}>
                        <HStack spacing={1}>
                          <Icon as={getStatusIcon(order.orderStatus)} boxSize={3} />
                          <Text>{order.orderStatus}</Text>
                       </HStack>
                      </Badge>
                    </Td>
                    <Td w={"15%"} textAlign="center">{order.orderDate}</Td>
                    <Td textAlign="center">
                      <HStack spacing={2} justify="center">
                        
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          fontWeight="bold"
                          leftIcon={<FaEye />}
                          onClick={() => handleViewOrder(order)}
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