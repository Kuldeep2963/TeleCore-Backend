import React, { useRef, useState, useEffect } from 'react';
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
  Spinner,
  Center,
  useToast
} from '@chakra-ui/react';
import { FiSearch, FiXCircle,FiCheck, FiClock, FiX, FiDollarSign,FiPackage } from 'react-icons/fi';
import { FaChevronCircleLeft, FaChevronCircleRight, FaEye } from 'react-icons/fa';
import api from '../services/api';
import { transform } from 'framer-motion';
function MyOrders({ userId, userRole }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    country: '',
    productType: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
    fetchCountriesAndProducts();
  }, []);

  const fetchCountriesAndProducts = async () => {
    try {
      // Fetch countries
      const countriesResponse = await api.countries.getAll();
      if (countriesResponse.success) {
        setCountries(countriesResponse.data);
      }

      // Fetch products
      const productsResponse = await api.products.getAll();
      if (productsResponse.success) {
        setProducts(productsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching countries and products:', error);
    }
  };

  const fetchOrders = async (searchFilters = {}) => {
    try {
      setLoading(true);
      const params = {};
      if (userId && userRole === 'Client') {
        params.user_id = userId;
        params.role = userRole;
      }

      // Add search filters
      if (searchFilters.country) params.country = searchFilters.country;
      if (searchFilters.productType) params.product_type = searchFilters.productType;
      if (searchFilters.startDate) params.start_date = searchFilters.startDate;
      if (searchFilters.endDate) params.end_date = searchFilters.endDate;
      if (searchFilters.status) params.status = searchFilters.status;

      const response = await api.orders.getAll(params);
      if (response.success) {
        setOrders(response.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load orders',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  const updateOrderDisconnectionStatus = (orderId, status) => {
    setOrders(prevOrders => prevOrders.map(order => (
      order.id === orderId ? { ...order, disconnectionStatus: status } : order
    )));
  };

  const countryRef = useRef(null);
  const productTypeRef = useRef(null);
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

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    fetchOrders(filters); // Apply current filters
  };

  const handleClear = () => {
    const clearedFilters = {
      country: '',
      productType: '',
      startDate: '',
      endDate: '',
      status: ''
    };
    setFilters(clearedFilters);

    if (countryRef.current) countryRef.current.value = '';
    if (productTypeRef.current) productTypeRef.current.value = '';
    if (startDateRef.current) startDateRef.current.value = '';
    if (endDateRef.current) endDateRef.current.value = '';
    if (statusRef.current) statusRef.current.value = '';

    setCurrentPage(1);
    countryRef.current?.focus();
  };

  // Filter orders based on current filters
  const filteredOrders = orders.filter(order => {
    if (filters.country && order.country !== filters.country) return false;
    if (filters.productType && order.productType !== filters.productType) return false;
    if (filters.startDate && new Date(order.orderDate) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(order.orderDate) > new Date(filters.endDate)) return false;
    if (filters.status && order.orderStatus.toLowerCase() !== filters.status.toLowerCase()) return false;
    return true;
  });

  // Pagination calculations
  const totalResults = filteredOrders.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, totalResults);
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

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

  const handlePayOrder = async (orderId) => {
    try {
      const response = await api.orders.updateStatus(orderId, 'Amount Paid');
      if (response.success) {
        // Update the local state to reflect the new status
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId
              ? { ...order, orderStatus: 'Amount Paid' }
              : order
          )
        );

        toast({
          title: 'Payment successful',
          description: 'Order status updated to Amount Paid',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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
      bg="#f8f9fa"
      height="calc(100vh - 76px)"
      overflowY="auto"
    >
      <VStack spacing={6} align="stretch">
        <Heading color="#1a3a52" fontSize="3xl" fontWeight="bold">
          My Orders
        </Heading>
           <Box px={6} mb={2}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4} alignItems="end" w="full">
              <FormControl>
                <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                  Country
                </FormLabel>
                <Select
                  ref={countryRef}
                  borderRadius={"full"}
                  placeholder="Select country"
                  value={filters.country}
                  onChange={(e) => setFilters({...filters, country: e.target.value})}
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: "blue.400" }}
                  onKeyDown={(e) => handleKeyDown(e, startDateRef)}
                >
                  {countries.map(country => (
                    <option key={country.countryname} value={country.countryname}>
                      {country.countryname} ({country.phonecode})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                  Product Type
                </FormLabel>
                <Select
                  ref={productTypeRef}
                  placeholder="Select product type"
                  value={filters.productType}
                  onChange={(e) => setFilters({...filters, productType: e.target.value})}
                  bg="white"
                  borderColor="gray.300"
                  borderRadius={"full"}
                  _hover={{ borderColor: "blue.400" }}
                  onKeyDown={(e) => handleKeyDown(e, startDateRef)}
                >
                  {products.map(product => (
                    <option key={product.code} value={product.code}>
                      {product.name}
                    </option>
                  ))}
                </Select>
              </FormControl>



              {/* <FormControl>
                <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                  Start Date
                </FormLabel>
                <Input
                  ref={startDateRef}
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: "blue.400" }}
                  onKeyDown={(e) => handleKeyDown(e, endDateRef)}
                />
              </FormControl> */}

              {/* <FormControl>
                <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                  End Date
                </FormLabel>
                <Input
                  ref={endDateRef}
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: "blue.400" }}
                  onKeyDown={(e) => handleKeyDown(e, statusRef)}
                />
              </FormControl> */}

              <FormControl>
                <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                  Status
                </FormLabel>
                <Select
                  borderRadius={"full"}
                  ref={statusRef}
                  placeholder="Select status"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
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

                {/* <Button
                  variant={"ghost"}
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
                  onClick={handleSearch}
                >
                  Search
                </Button> */}

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
            </Grid>
          </Box>
        <Box
          bg="white"
            borderRadius="xl"
            boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
            border="1px solid"
            borderColor="gray.100"
            overflow={{base:"scroll",md:"hidden"}}
        >
          <Table variant="simple" h={"400px"}>
            <Thead bg={"gray.200"}>
              <Tr
                sx={{
                  '& > th': {
                    bg: "gray.200",
                    color: "gray.700",
                    fontWeight: "semibold",
                    fontSize: "sm",
                    letterSpacing: "0.3px",
                    borderBottom: "2px solid",
                    borderColor: "gray.400",
                    textAlign: "center",
                  }
                }}
              >
                <Th w="5%">Order</Th>
                <Th>Country</Th>
                <Th>Product Type</Th>
                <Th>Amount</Th>
                <Th>Area Code(Prefix)</Th>
                <Th>Quantity</Th>
                <Th>Order Status</Th>
                <Th>Order Date</Th>
                <Th width="5%">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <Tr key={order.id} _hover={{ bg: 'gray.50' }}>
                    {/* <Td textAlign="center">{order.id}</Td> */}
                    <Td fontWeight={"medium"} color={"blue.600"} textAlign="center">{order.orderNo}</Td>
                    <Td fontWeight={"semibold"} textAlign="center">{order.country}</Td>
                    <Td textAlign="center"><Badge borderRadius={"full"} px={2}  bg={"blue.100"}>{order.productType}</Badge></Td>
                    <Td fontWeight={"semibold"} color={"green"} textAlign="center">${order.totalAmount}</Td>
                    <Td textAlign="center">{order.areaCode}</Td>
                    <Td w={"5%"} fontWeight={"bold"} textAlign="center">{order.quantity}</Td>
                    <Td textAlign="center">
                      
                      <Badge borderRadius={"full"} px={2} colorScheme={getStatusColor(order.orderStatus)}>
                        <HStack spacing={1}>
                          <Icon as={getStatusIcon(order.orderStatus)} boxSize={3} />
                          <Text>{order.orderStatus}</Text>
                       </HStack>
                      </Badge>
                    </Td>
                    <Td textAlign="center">{order.orderDate}</Td>
                    <Td textAlign="center">
                      <HStack spacing={2} justify="center">
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          fontWeight="semibold"
                          leftIcon={<FaEye />}
                          onClick={() => handleViewOrder(order)}
                        >
                          View
                        </Button>
                        {order.orderStatus === 'Confirmed' && (
                          <Button
                            size="sm"
                            colorScheme="green"
                            variant="ghost"
                            fontWeight="semibold"
                            // bg='green.100'
                            borderRadius='full'
                            _hover={bg=>{return {'bg':'green.200'}}}
                            leftIcon={<FiDollarSign />}
                            onClick={() => handlePayOrder(order.id)}
                          >
                            Pay
                          </Button>
                        )}
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