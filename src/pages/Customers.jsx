import React, { useState, useEffect } from 'react';
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
  useToast,
  useDisclosure,
  Spinner,
  Center
} from '@chakra-ui/react';
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiEdit3,
  FiTrash2,
  FiPhone,
  FiMail,
  FiMapPin,
  FiShoppingCart,
  FiDollarSign
} from 'react-icons/fi';
import CustomerDetailModal from '../Modals/CustomerDetailModal';
import api from '../services/api';

const Customers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.customers.getAll();
      if (response.success) {
        setCustomers(response.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load customers',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = (customer.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCustomer = async (customerId) => {
    try {
      const response = await api.customers.delete(customerId);
      if (response.success) {
        setCustomers(customers.filter(customer => customer.id !== customerId));
        toast({
          title: 'Customer deleted',
          description: 'The customer has been successfully removed.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete customer',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'green' : 'red';
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    onOpen();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
                Customers
              </Heading>
              <Text color="gray.600" mt={2}>
                Manage your customer relationships and data
              </Text>
            </Box>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              size="sm"
              onClick={() => navigate('/add-vendor-customer', { state: { activeTab: 1 } })}
              borderRadius="full"
            >
              Add Customer
            </Button>
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
                  <Icon as={FiUsers} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {customers.length}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Total Customers
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
                  <Icon as={FiShoppingCart} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {customers.reduce((sum, customer) => sum + (customer.total_orders || 0), 0)}
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
                  bgGradient="linear(135deg, purple.50, purple.100)"
                  color="purple.600"
                >
                  <Icon as={FiUsers} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {customers.filter(c => c.status === 'Active').length}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Active Customers
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
                  bgGradient="linear(135deg, orange.50, orange.100)"
                  color="orange.600"
                >
                  <Icon as={FiDollarSign} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {formatCurrency(customers.reduce((sum, customer) => sum + (parseFloat(customer.total_spent) || 0), 0))}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Total Spents
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
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                borderRadius="full"
              />
            </InputGroup>

            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              maxW="150px"
              borderRadius="full"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </HStack>

          {/* Customers Table */}
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
                  <Th color={"gray.700"} >Customer</Th>
                  <Th color={"gray.700"} >Contact</Th>
                  <Th color={"gray.700"} >Location</Th>
                  <Th color={"gray.700"} >Status</Th>
                  <Th color={"gray.700"} >Orders</Th>
                  <Th color={"gray.700"} >Total Spent</Th>
                  <Th color={"gray.700"} >Last Order</Th>
                  <Th color={"gray.700"}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredCustomers.map((customer) => (
                  <Tr key={customer.id} _hover={{ bg: 'gray.50' }}>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar size="sm" name={customer.company_name} />
                        <Box>
                          <Text fontWeight="medium">{customer.company_name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            Joined {new Date(customer.join_date).toLocaleDateString()}
                          </Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Icon as={FiMail} boxSize={3} color="red.600" />
                          <Text fontSize="sm">{customer.email}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiPhone} boxSize={3} color="blue.600" />
                          <Text fontSize="sm">{customer.phone}</Text>
                        </HStack>
                      </VStack>
                    </Td>
                    <Td>
                      <HStack>
                        <Icon as={FiMapPin} boxSize={3} color="green.600" />
                        <Text fontSize="sm">{customer.location}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(customer.status)} borderRadius="full">
                        {customer.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontWeight="medium">{customer.total_orders}</Text>
                    </Td>
                    <Td>
                      <Text fontWeight="medium">{formatCurrency(parseFloat(customer.total_spent) || 0)}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'N/A'}</Text>
                    </Td>
                    <Td>
                      <HStack spacing={0}>
                        <Button size="sm" variant="ghost" colorScheme="blue" onClick={() => handleViewDetails(customer)}>
                          <HStack spacing={1}><Icon as={FiEdit3} boxSize={4}/><Text>Details</Text> </HStack>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          <Icon as={FiTrash2} boxSize={4} />
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={isOpen}
        onClose={onClose}
        customer={selectedCustomer}
      />

    </Box>
  );
};

export default Customers;