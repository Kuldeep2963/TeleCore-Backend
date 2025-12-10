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
  Divider,
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
  FiTrash2,
  FiPhone,
  FiMail,
  FiMapPin,
  FiPackage,
  FiEdit3
} from 'react-icons/fi';
import VendorDetailModal from '../Modals/VendorDetailModal';
import api from '../services/api';

const Vendors = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await api.vendors.getAll();
      if (response.success) {
        setVendors(response.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load vendors',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vendors',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || vendor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteVendor = async (vendorId) => {
    try {
      const response = await api.vendors.delete(vendorId);
      if (response.success) {
        setVendors(vendors.filter(vendor => vendor.id !== vendorId));
        toast({
          title: 'Vendor deleted',
          description: 'The vendor has been successfully removed.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete vendor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'green' : 'red';
  };

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    onOpen();
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
      p={{base:5,md:8}}
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
                Vendors
              </Heading>
              <Text color="gray.600" mt={2}>
                Manage your vendor partnerships and suppliers
              </Text>
            </Box>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              size="sm"
              onClick={() => navigate('/add-vendor-customer', { state: { activeTab: 0 } })}
              borderRadius="full"
              px={{base:7, md:2}}
            >
              Add Vendor
            </Button>
          </HStack>
              <Divider
                      pt={2}
                      mb={4}
                      borderRadius={"full"}
                      border="0"
                      bgGradient="linear(to-r, gray.400, gray.300, transparent)"
                    />

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} w="full" mb={6}>
            <Box
              bg="white"
              p={6}
              px={{base:2,md:6}}

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
                    {vendors.length}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Total Vendors
                  </Text>
                </Box>
              </HStack>
            </Box>

            <Box
              bg="white"
              p={6}
              px={{base:2,md:6}}

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
                  <Icon as={FiPackage} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {vendors.reduce((sum, vendor) => sum + Number(vendor.total_orders || 0), 0)}
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
              px={{base:2,md:6}}

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
                    {vendors.filter(v => v.status === 'Active').length}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Active Vendors
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
                placeholder="Search vendors..."
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </HStack>

          {/* Vendors Table */}
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
                  <Th color={"gray.700"}>Vendor</Th>
                  <Th color={"gray.700"}>Contact</Th>
                  <Th color={"gray.700"}>Location</Th>
                  <Th color={"gray.700"}>Status</Th>
                  {/* <Th color={"gray.700"}>Products</Th> */}
                  {/* <Th color={"gray.700"} textAlign="center">Orders</Th> */}
                  <Th color={"gray.700"} >Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredVendors.map((vendor) => (
                  <Tr key={vendor.id} _hover={{ bg: 'gray.50' }}>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar size="sm" name={vendor.name} />
                        <Box>
                          <Text fontWeight="medium">{vendor.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            Joined {new Date(vendor.join_date).toLocaleDateString()}
                          </Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Icon as={FiMail} boxSize={3} color="red.600" />
                          <Text fontSize="sm">{vendor.email}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiPhone} boxSize={3} color="blue.600" />
                          <Text fontSize="sm">{vendor.phone}</Text>
                        </HStack>
                      </VStack>
                    </Td>
                    <Td>
                      <HStack>
                        <Icon as={FiMapPin} boxSize={3} color="green.600" />
                        <Text fontSize="sm">{vendor.location}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(vendor.status)} borderRadius="full">
                        {vendor.status}
                      </Badge>
                    </Td>
                  
                    <Td>
                      <HStack spacing={0}>
                        <Button size="sm" variant="ghost" colorScheme="blue" onClick={() => handleViewDetails(vendor)}>
                          <HStack spacing={1}><Icon as={FiEdit3} boxSize={4} /><Text>Details</Text></HStack>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDeleteVendor(vendor.id)}
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

      {/* Vendor Detail Modal */}
      <VendorDetailModal
        isOpen={isOpen}
        onClose={onClose}
        vendor={selectedVendor}
      />

    </Box>
  );
};

export default Vendors;