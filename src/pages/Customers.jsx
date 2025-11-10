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
  useToast,
  useDisclosure
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

const Customers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Sample customer data
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0123',
      location: 'New York, USA',
      status: 'Active',
      orders: 12,
      totalSpent: 2450.00,
      lastOrder: '2024-11-01',
      joinDate: '2023-06-15'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+44-20-7946-0123',
      location: 'London, UK',
      status: 'Active',
      orders: 8,
      totalSpent: 1890.50,
      lastOrder: '2024-10-28',
      joinDate: '2023-08-22'
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      phone: '+65-6789-0123',
      location: 'Singapore',
      status: 'Inactive',
      orders: 3,
      totalSpent: 450.75,
      lastOrder: '2024-09-15',
      joinDate: '2023-11-10'
    },
    {
      id: 4,
      name: 'Emma Davis',
      email: 'emma.davis@email.com',
      phone: '+61-2-1234-5678',
      location: 'Sydney, Australia',
      status: 'Active',
      orders: 15,
      totalSpent: 3200.25,
      lastOrder: '2024-11-02',
      joinDate: '2023-04-18'
    }
  ]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCustomer = (customerId) => {
    setCustomers(customers.filter(customer => customer.id !== customerId));
    toast({
      title: 'Customer deleted',
      description: 'The customer has been successfully removed.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
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
                    {customers.reduce((sum, customer) => sum + customer.orders, 0)}
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
                    {formatCurrency(customers.reduce((sum, customer) => sum + customer.totalSpent, 0))}
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
                  <Th color={"gray.700"} textAlign="center">Customer</Th>
                  <Th color={"gray.700"} textAlign="center">Contact</Th>
                  <Th color={"gray.700"} textAlign="center">Location</Th>
                  <Th color={"gray.700"} textAlign="center">Status</Th>
                  <Th color={"gray.700"} textAlign="center">Orders</Th>
                  <Th color={"gray.700"} textAlign="center">Total Spent</Th>
                  <Th color={"gray.700"} textAlign="center">Last Order</Th>
                  <Th color={"gray.700"} textAlign="center">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredCustomers.map((customer) => (
                  <Tr key={customer.id} _hover={{ bg: 'gray.50' }}>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar size="sm" name={customer.name} />
                        <Box>
                          <Text fontWeight="medium">{customer.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            Joined {new Date(customer.joinDate).toLocaleDateString()}
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
                      <Text fontWeight="medium">{customer.orders}</Text>
                    </Td>
                    <Td>
                      <Text fontWeight="medium">{formatCurrency(customer.totalSpent)}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{new Date(customer.lastOrder).toLocaleDateString()}</Text>
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