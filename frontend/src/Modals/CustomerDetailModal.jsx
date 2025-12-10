import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Box,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
  Heading,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
  FiCalendar,
  FiTrendingUp
} from 'react-icons/fi';

const CustomerDetailModal = ({ isOpen, onClose, customer }) => {
  const [customerProducts, setCustomerProducts] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      fetchCustomerData();
    }
  }, [isOpen, customer]);

  const fetchCustomerData = async () => {
    if (!customer) return;

    try {
      setLoading(true);

      // Fetch orders for this customer
      const ordersResponse = await api.orders.getAll({ customer_id: customer.id });
      if (ordersResponse.success) {
        setCustomerOrders(ordersResponse.data.map(order => ({
          id: `#${order.orderNo}`,
          service: order.serviceName || 'Service',
          quantity: order.quantity,
          totalAmount: order.totalAmount,
          status: order.orderStatus,
          orderDate: order.orderDate,
          vendor: order.vendorName || 'Vendor'
        })));
      }

      // Fetch numbers for this customer
      const numbersResponse = await api.numbers.getAll();
      if (numbersResponse.success && ordersResponse.success) {
        // Get order IDs for this customer
        const customerOrderIds = ordersResponse.data.map(order => order.id);

        // Filter numbers that belong to customer's orders
        const customerNumbers = numbersResponse.data.filter(number =>
          customerOrderIds.includes(number.order_id)
        );

        // Group numbers by order for display
        const productsMap = new Map();
        customerNumbers.forEach(number => {
          const order = ordersResponse.data.find(o => o.id === number.order_id);
          if (order) {
            const key = `${order.id}-${order.area_code}`;
            if (!productsMap.has(key)) {
              productsMap.set(key, {
                id: key,
                country: order.country,
                productType: order.productType,
                areaCode: order.areaCode,
                purchaseDate: order.completedDate,
                quantity: order.quantity,
                numbers: []
              });
            }
            const product = productsMap.get(key);
            product.quantity = Number(product.quantity);
            product.numbers.push(number);
          }
        });

        setCustomerProducts(Array.from(productsMap.values()));
      } else {
        setCustomerProducts([]);
      }

    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'green';
      case 'delivered': return 'green';
      case 'pending': return 'yellow';
      case 'inactive': return 'red';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{base:"sm",md:"6xl"}} scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent  borderRadius="15px" >
        <ModalHeader bgGradient="linear(to-r, blue.400, blue.500)" borderTopRadius={"15px"} color={"white"} >
          <HStack spacing={3}>
            <Avatar size="md" name={customer.company_name} />
            <VStack align="start" spacing={0}>
              <Heading size="lg">{customer.contact_person || customer.company_name}</Heading>
              <Text fontSize="sm" color="WhiteAlpha.700">Customer Details</Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color={"white"} boxSize={20} size={"xl"} />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Box>
              <Heading size="md" mb={4}>Basic Information</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <Card>
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <HStack>
                        <Icon as={FiMail} color="red.500" />
                        <Text fontWeight="medium">Email</Text>
                      </HStack>
                      <Text>{customer.email}</Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <HStack>
                        <Icon as={FiPhone} color="blue.500" />
                        <Text fontWeight="medium">Phone</Text>
                      </HStack>
                      <Text>{customer.phone}</Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <HStack>
                        <Icon as={FiMapPin} color="green.500" />
                        <Text fontWeight="medium">Location</Text>
                      </HStack>
                      <Text>{customer.location}</Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <HStack>
                        <Icon as={FiCalendar} color="purple.500" />
                        <Text fontWeight="medium">Joined Date</Text>
                      </HStack>
                      <Text>{new Date(customer.join_date).toLocaleDateString()}</Text>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Statistics */}
            <Box>
              <Heading size="md" mb={4}>Statistics</Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Card bg="blue.50">
                  <CardBody>
                    <VStack>
                      <Icon as={FiShoppingCart} boxSize={6} color="blue.500" />
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {customer.total_orders || 0}
                      </Text>
                      <Text fontSize="sm" color="blue.600">Total Orders</Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg="green.50">
                  <CardBody>
                    <VStack>
                      <Icon as={FiDollarSign} boxSize={6} color="green.500" />
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        {formatCurrency(customer.total_spent || 0)}
                      </Text>
                      <Text fontSize="sm" color="green.600">Total Spent</Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg="purple.50">
                  <CardBody>
                    <VStack>
                      <Icon as={FiPackage} boxSize={6} color="purple.500" />
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                        {customerProducts.length}
                      </Text>
                      <Text fontSize="sm" color="purple.600">Active Products</Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={customer.status === 'Active' ? 'green.50' : 'red.50'}>
                  <CardBody>
                    <VStack>
                      <Badge
                        colorScheme={getStatusColor(customer.status)}
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {customer.status}
                      </Badge>
                      <Text fontSize="sm" color={customer.status === 'Active' ? 'green.600' : 'red.600'}>
                        Status
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Products and Orders Tabs */}
            <Box >
              <Tabs variant="enclosed">
                <TabList>
                  <Tab>Owned Products</Tab>
                  <Tab>Order History</Tab>
                </TabList>

                <TabPanels>
                  {/* Owned Products */}
                  <TabPanel>
                    <Box
                      bg="white"
                      borderRadius="xl"
                      boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                      border="1px solid"
                      borderColor="gray.100"
                      overflow={{base:"scroll",md:"hidden"}}
                    >
                      <Table variant="simple">
                        <Thead bg="gray.200">
                          <Tr>
                            <Th color={"gray.700"} >Country</Th>
                            <Th color={"gray.700"} >Product Type</Th>
                            <Th color={"gray.700"} textAlign="center">Area Code</Th>
                            <Th color={"gray.700"} textAlign="center">Quantity</Th>
                            <Th color={"gray.700"} >Delivery Date</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {customerProducts.length > 0 ? customerProducts.map((product) => (
                            <Tr key={product.id} _hover={{ bg: 'gray.50' }}>
                              <Td>
                                <Text fontWeight="medium">{product.country}</Text>
                              </Td>
                              <Td>
                                <Badge bg={"blue.100"}>
                                <Text >{product.productType}</Text>
                                </Badge>
                              </Td>
                              <Td textAlign="center">
                                <Text color={"purple"} fontWeight="medium">{product.areaCode}</Text>
                              </Td>
                              <Td textAlign="center">
                                <Text fontWeight="medium">{product.quantity}</Text>
                              </Td>
                              <Td>
                                <Text color={"green"} fontWeight={"medium"} fontSize="sm">{product.purchaseDate ? new Date(product.purchaseDate).toLocaleDateString() : 'N/A'}</Text>
                              </Td>
                            </Tr>
                          )) : (
                            <Tr>
                              <Td colSpan={5} textAlign="center" color="gray.600" py={8}>
                                <VStack spacing={3} justify="center">
                                  <Icon as={FiPackage} boxSize={6} color="gray.500" />
                                  <Text>No products found for this customer</Text>
                                </VStack>
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  </TabPanel>

                  {/* Order History */}
                  <TabPanel>
                    <Box
                      bg="white"
                      borderRadius="xl"
                      boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                      border="1px solid"
                      borderColor="gray.100"
                      overflow={{base:"scroll",md:"hidden"}}
                    >
                      <Table variant="simple">
                        <Thead bg="gray.200">
                          <Tr>
                            <Th color={"gray.700"} textAlign="center">Order ID</Th>
                            <Th color={"gray.700"} >Service</Th>
                            <Th color={"gray.700"} textAlign="center">Quantity</Th>
                            <Th color={"gray.700"} textAlign="center">Amount</Th>
                            <Th color={"gray.700"} textAlign="center">Status</Th>
                            <Th color={"gray.700"} >Order Date</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {customerOrders.length > 0 ? customerOrders.map((order) => (
                            <Tr key={order.id} _hover={{ bg: 'gray.50' }}>
                              <Td>
                                <Text fontWeight="medium" color="blue.600">{order.id}</Text>
                              </Td>
                              <Td>
                                <Text>{order.service}</Text>
                              </Td>
                              <Td textAlign="center">
                                <Text fontWeight="medium">{order.quantity}</Text>
                              </Td>
                              <Td>
                                <Text fontWeight="medium" color="green.600">{formatCurrency(order.totalAmount)}</Text>
                              </Td>
                              <Td textAlign="center">
                                <Badge colorScheme={getStatusColor(order.status)} borderRadius={"full"}>
                                  {order.status}
                                </Badge>
                              </Td>
                              <Td>
                                <Text fontSize="sm">{new Date(order.orderDate).toLocaleDateString()}</Text>
                              </Td>
                              {/* <Td>
                                <Text fontSize="sm">{order.vendor}</Text>
                              </Td> */}
                            </Tr>
                          )) : (
                            <Tr>
                              <Td colSpan={7} textAlign="center" color="gray.600" py={8}>
                                <VStack spacing={3} justify="center">
                                  <Icon as={FiShoppingCart} boxSize={6} color="gray.500" />
                                  <Text>No orders found for this customer</Text>
                                </VStack>
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomerDetailModal;