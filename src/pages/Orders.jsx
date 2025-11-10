import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useToast
} from '@chakra-ui/react';
import {
  FiPackage,
  FiSearch,
  FiEye,
  FiCheck,
  FiX,
  FiClock,
  FiDollarSign,
} from 'react-icons/fi';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const toast = useToast();
  const navigate = useNavigate();

  // Sample orders data
  const [orders, setOrders] = useState([
    {
      id: '#ORD-001',
      customer: 'John Smith',
      customerEmail: 'john.smith@email.com',
      service: 'DID Numbers',
      quantity: 5,
      totalAmount: 250.00,
      status: 'In Progress',
      orderDate: '2024-11-01',
      completedDate: null,
      vendor: 'Telecom Solutions Inc.',
      pricing: {
        nrc: '$24.00',
        mrc: '$24.00',
        ppm: '$0.0380'
      },
      desiredPricing: {
        nrc: '$19.00',
        mrc: '$21.00',
        ppm: '$0.0310'
      }
    },
    {
      id: '#ORD-002',
      customer: 'Sarah Johnson',
      customerEmail: 'sarah.j@email.com',
      service: 'Two Way SMS',
      quantity: 3,
      totalAmount: 180.00,
      status: 'Confirmed',
      orderDate: '2024-10-30',
      completedDate: null,
      vendor: 'Global Voice Networks',
      pricing: {
        nrc: '$28.00',
        mrc: '$26.00',
        arc: '$0.0180',
        mo: '$0.0140',
        mt: '$0.0200'
      },
      desiredPricing: {
        nrc: '$26.00',
        mrc: '$24.00',
        arc: '$0.0150',
        mo: '$0.0120',
        mt: '$0.0170'
      }
    },
    {
      id: '#ORD-003',
      customer: 'Mike Chen',
      customerEmail: 'mike.chen@email.com',
      service: 'Mobile Numbers',
      quantity: 2,
      totalAmount: 120.00,
      status: 'Amount Paid',
      orderDate: '2024-10-28',
      completedDate: null,
      vendor: 'Asia Telecom Ltd.',
      pricing: {
        nrc: '$34.00',
        mrc: '$32.00',
        Incomingppm: '$0.0240',
        Outgoingppmfix: '$0.0360',
        Outgoingppmmobile: '$0.0460',
        incmongsms: '$0.0120',
        outgoingsms: '$0.0170'
      },
      desiredPricing: {
        nrc: '$31.00',
        mrc: '$29.00',
        Incomingppm: '$0.0210',
        Outgoingppmfix: '$0.0330',
        Outgoingppmmobile: '$0.0430',
        incmongsms: '$0.0100',
        outgoingsms: '$0.0150'
      }
    },
    {
      id: '#ORD-004',
      customer: 'Emma Davis',
      customerEmail: 'emma.davis@email.com',
      service: 'Freephone',
      quantity: 1,
      totalAmount: 75.00,
      status: 'Delivered',
      orderDate: '2024-10-25',
      completedDate: '2024-10-26',
      vendor: 'Telecom Solutions Inc.',
      pricing: {
        nrc: '$29.00',
        mrc: '$27.00',
        ppmFix: '$0.0410',
        ppmMobile: '$0.0560',
        ppmPayphone: '$0.0660'
      },
      desiredPricing: {
        nrc: '$27.00',
        mrc: '$25.00',
        ppmFix: '$0.0370',
        ppmMobile: '$0.0520',
        ppmPayphone: '$0.0600'
      }
    },
    {
      id: '#ORD-005',
      customer: 'Alex Turner',
      customerEmail: 'alex.turner@email.com',
      service: 'Virtual Number',
      quantity: 4,
      totalAmount: 200.00,
      status: 'Cancelled',
      orderDate: '2024-10-20',
      completedDate: null,
      vendor: 'Global Voice Networks',
      pricing: {
        nrc: '$31.00',
        mrc: '$29.00',
        ppm: '$0.0420'
      },
      desiredPricing: {
        nrc: '$28.00',
        mrc: '$26.00',
        ppm: '$0.0380'
      }
    }
  ]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, status: newStatus, completedDate: newStatus === 'Delivered' ? new Date().toISOString().split('T')[0] : null }
        : order
    ));

    toast({
      title: 'Order status updated',
      description: `Order ${orderId} status changed to ${newStatus}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
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

  const handleViewOrder = (order) => {
    // Transform order data to match OrderNumberView expected format
    const transformedOrder = {
      orderNo: order.id.replace('#', ''), // e.g., 'ORD-001'
      serviceName: order.service, // e.g., 'DID Numbers'
      country: 'United States (+1)', // Default since not available in admin orders
      productType: order.service.split(' ')[0], // e.g., 'DID' from 'DID Numbers'
      areaCode: 'Toll Free (800)', // Default
      quantity: order.quantity,
      orderStatus: order.status,
      orderDate: order.orderDate,
      pricing: order.pricing,
      desiredPricing: order.desiredPricing
    };
    navigate('/order-number-view', { state: { orderData: transformedOrder } });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
  const confirmedOrders = orders.filter(order => order.status === 'Confirmed').length;

  return (
    <Box
      flex={1}
      p={8}
      pr={5}
      pb={5}
      minH="calc(100vh - 76px)"
      overflowY="auto"
    >
      <VStack spacing={8} align="start" maxW="full" mx="auto">
        {/* Header Section */}
        <Box w="full">
          <HStack justify="space-between" align="center" mb={6}>
            <Box>
              <Heading
                color="gray.800"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                letterSpacing="-0.5px"
              >
                Orders Management
              </Heading>
              <Text color="gray.600" mt={2}>
                Track and manage all customer orders
              </Text>
            </Box>

          </HStack>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full" mb={6}>
            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
              border="1px solid"
              borderColor="gray.100"
            >
              <HStack spacing={4}>
                <Box
                  p={3}
                  borderRadius="full"
                  bgGradient="linear(135deg, blue.50, blue.100)"
                  color="blue.600"
                >
                  <Icon as={FiPackage} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {orders.length}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Total Orders
                  </Text>
                </Box>
              </HStack>
            </Box>

            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
              border="1px solid"
              borderColor="gray.100"
            >
              <HStack spacing={4}>
                <Box
                  p={3}
                  borderRadius="full"
                  bgGradient="linear(135deg, green.50, green.100)"
                  color="green.600"
                >
                  <Icon as={FiCheck} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {deliveredOrders}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Delivered
                  </Text>
                </Box>
              </HStack>
            </Box>

            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
              border="1px solid"
              borderColor="gray.100"
            >
              <HStack spacing={4}>
                <Box
                  p={3}
                  borderRadius="full"
                  bgGradient="linear(135deg, yellow.50, yellow.100)"
                  color="yellow.600"
                >
                  <Icon as={FiClock} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {confirmedOrders}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Confirmed
                  </Text>
                </Box>
              </HStack>
            </Box>

            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
              border="1px solid"
              borderColor="gray.100"
            >
              <HStack spacing={4}>
                <Box
                  p={3}
                  borderRadius="full"
                  bgGradient="linear(135deg, purple.50, purple.100)"
                  color="purple.600"
                >
                  <Icon as={FiDollarSign} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {formatCurrency(totalRevenue)}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Total Revenue
                  </Text>
                </Box>
              </HStack>
            </Box>
          </SimpleGrid>

          {/* Filters */}
          <HStack spacing={4} mb={6}>
            <InputGroup maxW="300px">
              <InputLeftElement>
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                bg={"white"}
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                borderRadius="full"
              />
            </InputGroup>

            <Select
              bg={"white"}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              maxW="150px"
              borderRadius="full"
            >
              <option value="All">All Status</option>
              <option value="In Progress">In Progress</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Amount Paid">Amount Paid</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
          </HStack>

          {/* Orders Table */}
          <Box
            bg="white"
            borderRadius="xl"
            boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
            border="1px solid"
            borderColor="gray.100"
            overflow="hidden"
          >
            <Table variant="simple">
              <Thead bg="gray.200">
                <Tr>
                  <Th color={"gray.700"} textAlign="center">Order ID</Th>
                  <Th color={"gray.700"} textAlign="center">Customer</Th>
                  <Th color={"gray.700"} textAlign="center">Service</Th>
                  <Th color={"gray.700"} textAlign="center">Quantity</Th>
                  <Th color={"gray.700"} textAlign="center">Amount</Th>
                  <Th color={"gray.700"} textAlign="center">Status</Th>
                  <Th w={"11%"} color={"gray.700"} textAlign="center">Order Date</Th>
                  <Th color={"gray.700"} textAlign="center">Vendor</Th>
                  <Th color={"gray.700"} textAlign="center">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredOrders.map((order) => (
                  <Tr key={order.id} _hover={{ bg: 'gray.50' }}>
                    <Td>
                      <Text fontWeight="medium" color="blue.600">
                        {order.id}
                      </Text>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{order.customer}</Text>
                        <Text fontSize="sm" color="gray.500">{order.customerEmail}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text>{order.service}</Text>
                    </Td>
                    <Td>
                      <Text textAlign={"center"} fontWeight="medium">{order.quantity}</Text>
                    </Td>
                    <Td>
                      <Text color={"green"} fontWeight="bold">{formatCurrency(order.totalAmount)}</Text>
                    </Td>
                    <Td textAlign="center">
                      <Badge colorScheme={getStatusColor(order.status)} borderRadius={"full"}>
                        <HStack spacing={1}>
                          <Icon as={getStatusIcon(order.status)} boxSize={3} />
                          <Text>{order.status}</Text>
                        </HStack>
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{new Date(order.orderDate).toLocaleDateString()}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{order.vendor}</Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button size="sm" variant="ghost" colorScheme="blue" onClick={() => handleViewOrder(order)}>
                          <Icon as={FiEye} boxSize={4} />
                        </Button>
                        {(order.status === 'Confirmed'||order.status ==='in progress') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => handleStatusUpdate(order.id, 'Delivered')}
                          >
                            <Icon as={FiCheck} boxSize={4} />
                          </Button>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>


    </Box>
  );
};

export default Orders;