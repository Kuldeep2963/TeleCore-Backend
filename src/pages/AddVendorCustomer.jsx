import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  Card,
  CardBody,
  Divider,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import {
  FiUsers,
  // FiBuilding,
  FiSave,
  FiX,
  FiCheck,
  FiPhone,
  FiMail,
  FiMapPin,
  FiGlobe,
  FiPackage,
  FiShoppingCart
} from 'react-icons/fi';
import api from '../services/api';

const AddVendorCustomer = () => {
  const location = useLocation();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 0);
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalCustomers: 0,
    activeProducts: 0,
    totalOrders: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.stats.getDashboardStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard statistics',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  // Vendor form state
  const [vendorForm, setVendorForm] = useState({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    address: '',
    description: '',
    contactPerson: '',
    contactPersonPhone: '',
    industry: '',
    productsCount: '',
    establishedYear: ''
  });

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    address: '',
    industry: '',
    jobTitle: '',
    notes: '',
    source: '',
    budget: ''
  });

  const handleVendorChange = (field, value) => {
    setVendorForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomerChange = (field, value) => {
    setCustomerForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVendorSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!vendorForm.companyName || !vendorForm.email || !vendorForm.phone) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Here you would typically send the data to your backend
    console.log('Vendor data:', vendorForm);

    toast({
      title: 'Vendor Added',
      description: `${vendorForm.companyName} has been successfully added.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // Reset form
    setVendorForm({
      companyName: '',
      email: '',
      phone: '',
      website: '',
      location: '',
      address: '',
      description: '',
      contactPerson: '',
      contactPersonPhone: '',
      industry: '',
      productsCount: '',
      establishedYear: ''
    });
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!customerForm.firstName || !customerForm.lastName || !customerForm.email || !customerForm.phone) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Here you would typically send the data to your backend
    console.log('Customer data:', customerForm);

    toast({
      title: 'Customer Added',
      description: `${customerForm.firstName} ${customerForm.lastName} has been successfully added.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // Reset form
    setCustomerForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      location: '',
      address: '',
      industry: '',
      jobTitle: '',
      notes: '',
      source: '',
      budget: ''
    });
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
          <VStack align="start" spacing={5}>
            <Heading
              color="gray.800"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              letterSpacing="-0.5px"
              textAlign="left"
            >
              Add Vendor / Customer
            </Heading>
            <Text color="gray.600">
              Add new vendors or customers to your database
            </Text>
          </VStack>
        </Box>

        {/* Stats Overview */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} w="full">
          <Card>
            <CardBody>
              <HStack spacing={4}>
                <Box
                  p={3}
                  borderRadius="full"
                  bgGradient="linear(135deg, blue.50, blue.100)"
                  color="blue.600"
                >
                  {/* <Icon as={FiBuilding} boxSize={6} /> */}
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {statsLoading ? '...' : stats.totalVendors}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Total Vendors
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <HStack spacing={4}>
                <Box
                  p={3}
                  borderRadius="full"
                  bgGradient="linear(135deg, green.50, green.100)"
                  color="green.600"
                >
                  <Icon as={FiUsers} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {statsLoading ? '...' : stats.totalCustomers}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Total Customers
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <HStack spacing={4}>
                <Box
                  p={3}
                  borderRadius="full"
                  bgGradient="linear(135deg, purple.50, purple.100)"
                  color="purple.600"
                >
                  <Icon as={FiPackage} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {statsLoading ? '...' : stats.activeProducts}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Active Products
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <HStack spacing={4}>
                <Box
                  p={3}
                  borderRadius="full"
                  bgGradient="linear(135deg, orange.50, orange.100)"
                  color="orange.600"
                >
                  <Icon as={FiShoppingCart} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {statsLoading ? '...' : stats.totalOrders}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Total Orders
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Main Form */}
        <Card w="full">
          <CardBody>
            <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
              <TabList>
                <Tab>
                  <HStack spacing={2}>
                    {/* <Icon as={FiBuilding} /> */}
                    <Text>Add Vendor</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FiUsers} />
                    <Text>Add Customer</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Vendor Form */}
                <TabPanel>
                  <form onSubmit={handleVendorSubmit}>
                    <VStack spacing={6} align="start">
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        Add a new vendor to your supplier network. All fields marked with * are required.
                      </Alert>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        <FormControl isRequired>
                          <FormLabel>Company Name</FormLabel>
                          <Input
                            placeholder="Enter company name"
                            value={vendorForm.companyName}
                            onChange={(e) => handleVendorChange('companyName', e.target.value)}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Email</FormLabel>
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            value={vendorForm.email}
                            onChange={(e) => handleVendorChange('email', e.target.value)}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Phone</FormLabel>
                          <Input
                            placeholder="Enter phone number"
                            value={vendorForm.phone}
                            onChange={(e) => handleVendorChange('phone', e.target.value)}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Website</FormLabel>
                          <Input
                            placeholder="https://example.com"
                            value={vendorForm.website}
                            onChange={(e) => handleVendorChange('website', e.target.value)}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Location</FormLabel>
                          <Input
                            placeholder="City, Country"
                            value={vendorForm.location}
                            onChange={(e) => handleVendorChange('location', e.target.value)}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Industry</FormLabel>
                          <Select
                            placeholder="Select industry"
                            value={vendorForm.industry}
                            onChange={(e) => handleVendorChange('industry', e.target.value)}
                          >
                            <option value="telecom">Telecommunications</option>
                            <option value="technology">Technology</option>
                            <option value="manufacturing">Manufacturing</option>
                            <option value="services">Services</option>
                            <option value="other">Other</option>
                          </Select>
                        </FormControl>
                      </SimpleGrid>

                      <FormControl>
                        <FormLabel>Address</FormLabel>
                        <Textarea
                          placeholder="Enter full address"
                          value={vendorForm.address}
                          onChange={(e) => handleVendorChange('address', e.target.value)}
                        />
                      </FormControl>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        <FormControl>
                          <FormLabel>Contact Person</FormLabel>
                          <Input
                            placeholder="Primary contact name"
                            value={vendorForm.contactPerson}
                            onChange={(e) => handleVendorChange('contactPerson', e.target.value)}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Contact Person Phone</FormLabel>
                          <Input
                            placeholder="Contact person's phone"
                            value={vendorForm.contactPersonPhone}
                            onChange={(e) => handleVendorChange('contactPersonPhone', e.target.value)}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Products Count</FormLabel>
                          <Input
                            type="number"
                            placeholder="Number of products offered"
                            value={vendorForm.productsCount}
                            onChange={(e) => handleVendorChange('productsCount', e.target.value)}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Established Year</FormLabel>
                          <Input
                            type="number"
                            placeholder="Year established"
                            value={vendorForm.establishedYear}
                            onChange={(e) => handleVendorChange('establishedYear', e.target.value)}
                          />
                        </FormControl>
                      </SimpleGrid>

                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          placeholder="Brief description of the vendor"
                          value={vendorForm.description}
                          onChange={(e) => handleVendorChange('description', e.target.value)}
                        />
                      </FormControl>

                      <Divider />

                      <HStack spacing={4} w="full" justify="end">
                        <Button
                          leftIcon={<FiX />}
                          variant="ghost"
                          onClick={() => setVendorForm({
                            companyName: '',
                            email: '',
                            phone: '',
                            website: '',
                            location: '',
                            address: '',
                            description: '',
                            contactPerson: '',
                            contactPersonPhone: '',
                            industry: '',
                            productsCount: '',
                            establishedYear: ''
                          })}
                        >
                          Clear
                        </Button>
                        <Button
                          leftIcon={<FiSave />}
                          colorScheme="blue"
                          type="submit"
                        >
                          Add Vendor
                        </Button>
                      </HStack>
                    </VStack>
                  </form>
                </TabPanel>

                {/* Customer Form */}
                <TabPanel>
                  <form onSubmit={handleCustomerSubmit}>
                    <VStack spacing={6} align="start">
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        Add a new customer to your database. All fields marked with * are required.
                      </Alert>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        <FormControl isRequired>
                          <FormLabel>First Name</FormLabel>
                          <Input
                            placeholder="Enter first name"
                            value={customerForm.firstName}
                            onChange={(e) => handleCustomerChange('firstName', e.target.value)}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Last Name</FormLabel>
                          <Input
                            placeholder="Enter last name"
                            value={customerForm.lastName}
                            onChange={(e) => handleCustomerChange('lastName', e.target.value)}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Email</FormLabel>
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            value={customerForm.email}
                            onChange={(e) => handleCustomerChange('email', e.target.value)}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Phone</FormLabel>
                          <Input
                            placeholder="Enter phone number"
                            value={customerForm.phone}
                            onChange={(e) => handleCustomerChange('phone', e.target.value)}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Company</FormLabel>
                          <Input
                            placeholder="Company name"
                            value={customerForm.company}
                            onChange={(e) => handleCustomerChange('company', e.target.value)}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Job Title</FormLabel>
                          <Input
                            placeholder="Job title/position"
                            value={customerForm.jobTitle}
                            onChange={(e) => handleCustomerChange('jobTitle', e.target.value)}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Location</FormLabel>
                          <Input
                            placeholder="City, Country"
                            value={customerForm.location}
                            onChange={(e) => handleCustomerChange('location', e.target.value)}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Industry</FormLabel>
                          <Select
                            placeholder="Select industry"
                            value={customerForm.industry}
                            onChange={(e) => handleCustomerChange('industry', e.target.value)}
                          >
                            <option value="technology">Technology</option>
                            <option value="finance">Finance</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="retail">Retail</option>
                            <option value="manufacturing">Manufacturing</option>
                            <option value="other">Other</option>
                          </Select>
                        </FormControl>
                      </SimpleGrid>

                      <FormControl>
                        <FormLabel>Address</FormLabel>
                        <Textarea
                          placeholder="Enter full address"
                          value={customerForm.address}
                          onChange={(e) => handleCustomerChange('address', e.target.value)}
                        />
                      </FormControl>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        <FormControl>
                          <FormLabel>Source</FormLabel>
                          <Select
                            placeholder="How did they find us?"
                            value={customerForm.source}
                            onChange={(e) => handleCustomerChange('source', e.target.value)}
                          >
                            <option value="website">Website</option>
                            <option value="referral">Referral</option>
                            <option value="social">Social Media</option>
                            <option value="advertisement">Advertisement</option>
                            <option value="other">Other</option>
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Budget Range</FormLabel>
                          <Select
                            placeholder="Select budget range"
                            value={customerForm.budget}
                            onChange={(e) => handleCustomerChange('budget', e.target.value)}
                          >
                            <option value="under-1k">Under $1,000</option>
                            <option value="1k-5k">$1,000 - $5,000</option>
                            <option value="5k-10k">$5,000 - $10,000</option>
                            <option value="10k-50k">$10,000 - $50,000</option>
                            <option value="over-50k">Over $50,000</option>
                          </Select>
                        </FormControl>
                      </SimpleGrid>

                      <FormControl>
                        <FormLabel>Notes</FormLabel>
                        <Textarea
                          placeholder="Additional notes about the customer"
                          value={customerForm.notes}
                          onChange={(e) => handleCustomerChange('notes', e.target.value)}
                        />
                      </FormControl>

                      <Divider />

                      <HStack spacing={4} w="full" justify="end">
                        <Button
                          leftIcon={<FiX />}
                          variant="ghost"
                          onClick={() => setCustomerForm({
                            firstName: '',
                            lastName: '',
                            email: '',
                            phone: '',
                            company: '',
                            location: '',
                            address: '',
                            industry: '',
                            jobTitle: '',
                            notes: '',
                            source: '',
                            budget: ''
                          })}
                        >
                          Clear
                        </Button>
                        <Button
                          leftIcon={<FiSave />}
                          colorScheme="blue"
                          type="submit"
                        >
                          Add Customer
                        </Button>
                      </HStack>
                    </VStack>
                  </form>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default AddVendorCustomer;