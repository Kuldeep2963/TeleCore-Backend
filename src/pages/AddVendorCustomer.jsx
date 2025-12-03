import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  AlertIcon,
} from "@chakra-ui/react";
import {
  FiUsers,
  // FiBuilding,
  FiSave,
  FiX,
  FiCheck,
  FiPhone,
  FiMail,
  FiMapPin,
  FiPackage,
  FiShoppingCart,
} from "react-icons/fi";
import api from "../services/api";

const AddVendorCustomer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 0);
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalCustomers: 0,
    activeProducts: 0,
    totalOrders: 0,
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
        console.error("Failed to fetch stats:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          status: "error",
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
    name: "",
    email: "",
    phone: "",
    location: "",
    status: "Active",
  });
  const [vendorLoading, setVendorLoading] = useState(false);

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    location: "",
    status: "Active",
  });
  const [customerLoading, setCustomerLoading] = useState(false);

  const handleVendorChange = (field, value) => {
    setVendorForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomerChange = (field, value) => {
    setCustomerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();

    if (
      !vendorForm.name ||
      !vendorForm.email ||
      !vendorForm.phone ||
      !vendorForm.location
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields (Name, Email, Phone, Location).",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setVendorLoading(true);
      const response = await api.vendors.create({
        name: vendorForm.name,
        email: vendorForm.email,
        phone: vendorForm.phone,
        location: vendorForm.location,
        status: vendorForm.status,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `${vendorForm.name} has been successfully added.`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });

        setTimeout(() => {
          navigate("/vendors");
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating vendor:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add vendor.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setVendorLoading(false);
    }
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();

    if (
      !customerForm.company_name ||
      !customerForm.contact_person ||
      !customerForm.email ||
      !customerForm.phone ||
      !customerForm.location
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields (Company Name, Contact Person, Email, Phone, Location).",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setCustomerLoading(true);

      // Split contact_person into first and last name
      const nameParts = customerForm.contact_person.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      const password = `${firstName}@123`;

      // Create user first
      const userResponse = await api.auth.register({
        email: customerForm.email,
        password: password,
        first_name: firstName,
        last_name: lastName,
        role: "Client",
      });

      if (!userResponse.success) {
        throw new Error(userResponse.message || "Failed to create user");
      }

      const userId = userResponse.data.id;

      // Create customer with user_id
      const customerResponse = await api.customers.create({
        company_name: customerForm.company_name,
        contact_person: customerForm.contact_person,
        email: customerForm.email,
        phone: customerForm.phone,
        location: customerForm.location,
        status: customerForm.status,
        user_id: userId,
      });

      if (customerResponse.success) {
        toast({
          title: "Success",
          description: `${customerForm.company_name} has been successfully added.`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });

        setTimeout(() => {
          navigate("/customers");
        }, 1500);
      } else {
        throw new Error(
          customerResponse.message || "Failed to create customer"
        );
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add customer.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCustomerLoading(false);
    }
  };

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
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
          <Card>
            <CardBody>
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
                    {statsLoading ? "..." : stats.totalVendors}
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
                    {statsLoading ? "..." : stats.totalCustomers}
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
                    {statsLoading ? "..." : stats.activeProducts}
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
                    {statsLoading ? "..." : stats.totalOrders}
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
                    <Icon as={FiUsers} />
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
                      {/* <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        Add a new vendor to your supplier network. All fields marked with * are required.
                      </Alert> */}

                      <SimpleGrid
                        columns={{ base: 1, md: 2 }}
                        spacing={4}
                        w="full"
                      >
                        <FormControl isRequired>
                          <FormLabel>Vendor Name</FormLabel>
                          <Input
                            borderRadius={"full"}
                            placeholder="Enter vendor name"
                            value={vendorForm.name}
                            onChange={(e) =>
                              handleVendorChange("name", e.target.value)
                            }
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Email</FormLabel>
                          <Input
                            borderRadius={"full"}
                            type="email"
                            placeholder="Enter email address"
                            value={vendorForm.email}
                            onChange={(e) =>
                              handleVendorChange("email", e.target.value)
                            }
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Phone</FormLabel>
                          <Input
                            borderRadius={"full"}
                            placeholder="Enter phone number"
                            value={vendorForm.phone}
                            onChange={(e) =>
                              handleVendorChange("phone", e.target.value)
                            }
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Location</FormLabel>
                          <Input
                            borderRadius={"full"}
                            placeholder="City, Country"
                            value={vendorForm.location}
                            onChange={(e) =>
                              handleVendorChange("location", e.target.value)
                            }
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Status</FormLabel>
                          <Select
                            borderRadius={"full"}
                            value={vendorForm.status}
                            onChange={(e) =>
                              handleVendorChange("status", e.target.value)
                            }
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </Select>
                        </FormControl>
                      </SimpleGrid>

                      <Divider />

                      <HStack spacing={4} w="full" justify="end">
                        <Button
                          borderRadius={"full"}
                          leftIcon={<FiX />}
                          variant="ghost"
                          onClick={() =>
                            setVendorForm({
                              name: "",
                              email: "",
                              phone: "",
                              location: "",
                              status: "Active",
                            })
                          }
                          isDisabled={vendorLoading}
                        >
                          Clear
                        </Button>
                        <Button
                          borderRadius={"full"}
                          leftIcon={<FiSave />}
                          colorScheme="blue"
                          type="submit"
                          isLoading={vendorLoading}
                          loadingText="Adding..."
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
                      {/* <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        Add a new customer to your database. All fields marked with * are required.
                      </Alert> */}

                      <SimpleGrid
                        columns={{ base: 1, md: 2 }}
                        spacing={4}
                        w="full"
                      >
                        <FormControl isRequired>
                          <FormLabel>Company Name</FormLabel>
                          <Input
                            borderRadius={"full"}
                            placeholder="Enter company name"
                            value={customerForm.company_name}
                            onChange={(e) =>
                              handleCustomerChange(
                                "company_name",
                                e.target.value
                              )
                            }
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Contact Person</FormLabel>
                          <Input
                            borderRadius={"full"}
                            placeholder="Enter contact person name"
                            value={customerForm.contact_person}
                            onChange={(e) =>
                              handleCustomerChange(
                                "contact_person",
                                e.target.value
                              )
                            }
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Email</FormLabel>
                          <Input
                            borderRadius={"full"}
                            type="email"
                            placeholder="Enter email address"
                            value={customerForm.email}
                            onChange={(e) =>
                              handleCustomerChange("email", e.target.value)
                            }
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Phone</FormLabel>
                          <Input
                            borderRadius={"full"}
                            placeholder="Enter phone number"
                            value={customerForm.phone}
                            onChange={(e) =>
                              handleCustomerChange("phone", e.target.value)
                            }
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Location</FormLabel>
                          <Input
                            borderRadius={"full"}
                            placeholder="City, Country"
                            value={customerForm.location}
                            onChange={(e) =>
                              handleCustomerChange("location", e.target.value)
                            }
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Status</FormLabel>
                          <Select
                            borderRadius={"full"}
                            value={customerForm.status}
                            onChange={(e) =>
                              handleCustomerChange("status", e.target.value)
                            }
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </Select>
                        </FormControl>
                      </SimpleGrid>

                      <Divider />

                      <HStack spacing={4} w="full" justify="end">
                        <Button
                          borderRadius={"full"}
                          leftIcon={<FiX />}
                          variant="ghost"
                          onClick={() =>
                            setCustomerForm({
                              company_name: "",
                              contact_person: "",
                              email: "",
                              phone: "",
                              location: "",
                              status: "Active",
                            })
                          }
                          isDisabled={customerLoading}
                        >
                          Clear
                        </Button>
                        <Button
                          borderRadius={"full"}
                          leftIcon={<FiSave />}
                          colorScheme="blue"
                          type="submit"
                          isLoading={customerLoading}
                          loadingText="Adding..."
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
