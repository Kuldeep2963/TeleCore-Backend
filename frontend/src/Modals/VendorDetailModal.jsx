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
  Tooltip,
  Spinner,
  useToast
} from '@chakra-ui/react';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiPackage,
  FiTrendingUp,
  FiStar,
  FiCalendar,
  FiFileText,
  FiEye,
  FiPlus
} from 'react-icons/fi';
import DocumentRequiredModal from './DocumentRequiredModal';
import AddVendorPricingModal from './AddVendorPricingModal';

const VendorDetailModal = ({ isOpen, onClose, vendor }) => {
  if (!vendor) return null;

  const toast = useToast();
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendorPricing, setVendorPricing] = useState([]);
  const [selectedPricingData, setSelectedPricingData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vendor) {
      fetchVendorData();
    }
  }, [vendor]);

  const fetchVendorData = async () => {
    if (!vendor) return;

    try {
      setLoading(true);

      const pricingResponse = await api.vendorPricing.getByVendor(vendor.id);
      if (pricingResponse.success) {
        setVendorPricing(pricingResponse.data || []);
      }

    } catch (error) {
      console.error('Error fetching vendor pricing:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vendor pricing',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewPricing = (pricing) => {
    setSelectedPricingData(pricing);
    setIsPricingModalOpen(true);
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'green' : 'red';
  };

  return (
    <Box>
    <Modal isOpen={isOpen} onClose={onClose} size={{base:"sm",md:"6xl"}} scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent   borderRadius="15px" >
        <ModalHeader bgGradient="linear(to-r, blue.400, blue.500)" borderTopRadius={"15px"} color={"white"}  >
          <HStack spacing={3}>
            <Avatar size="md" name={vendor.name} />
            <VStack align="start" spacing={0}>
              <Heading size="lg">{vendor.name}</Heading>
              <Text fontSize="sm" color={"whiteAlpha.700"}>Vendor Details</Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color={"white"} boxSize={20} size={"xl"} />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Box mt={3}>
              <Heading size="md" mb={4}>Basic Information</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <Card>
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <HStack>
                        <Icon as={FiMail} color="red.500" />
                        <Text fontWeight="medium">Email</Text>
                      </HStack>
                      <Text color={"blue.700"}>{vendor.email}</Text>
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
                      <Text>{vendor.phone}</Text>
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
                      <Text>{vendor.location}</Text>
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
                      <Text color={"green.600"} fontWeight={"semibold"}>{new Date(vendor.join_date).toLocaleDateString()}</Text>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Statistics */}
            <Box>
              <Heading size="md" mb={4}>Statistics</Heading>
              <SimpleGrid columns={{ base: 2, md: 2 }} spacing={4}>
                <Card bg="blue.50">
                  <CardBody>
                    <VStack>
                      <Icon as={FiPackage} boxSize={6} color="blue.500" />
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {vendorPricing.length}
                      </Text>
                      <Text fontSize="sm" color="blue.600">Total Products</Text>
                    </VStack>
                  </CardBody>
                </Card>
{/* 
                <Card bg="green.50">
                  <CardBody>
                    <VStack>
                      <Icon as={FiTrendingUp} boxSize={6} color="green.500" />
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        {vendor.orders}
                      </Text>
                      <Text fontSize="sm" color="green.600">Total Orders</Text>
                    </VStack>
                  </CardBody>
                </Card> */}

                <Card bg={vendor.status === 'Active' ? 'green.50' : 'red.50'}>
                  <CardBody>
                    <VStack>
                      <Badge
                        colorScheme={getStatusColor(vendor.status)}
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {vendor.status}
                      </Badge>
                      <Text fontSize="sm" color={vendor.status === 'Active' ? 'green.600' : 'red.600'}>
                        Status
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Vendor Pricing */}
            <Box>
              <HStack spacing={3} mb={4} justify="space-between" align="center">
                <Heading size="md">Vendor Pricing</Heading>
                <HStack spacing={2}>
                  <Button
                    colorScheme="green"
                    variant="ghost"
                    size="sm"
                    leftIcon={<FiPlus />}
                    borderRadius="full"
                    _hover={{
                      bg: "green.100",
                    }}
                    transition="all 0.2s ease"
                    onClick={() => {
                      setSelectedPricingData(null);
                      setIsPricingModalOpen(true);
                    }}
                  >
                    Add Pricing
                  </Button>
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    borderRadius="full"
                    size="sm"
                    leftIcon={<FiFileText />}
                    _hover={{
                      bg: "blue.50",
                      borderColor: "blue.400",
                      transform: "scale(1.02)"
                    }}
                    transition="all 0.2s ease"
                    onClick={() => setIsDocumentsModalOpen(true)}
                  >
                    <Text display={{base:"none", md:"block"}}>Required Documents</Text>
                  </Button>
                </HStack>
              </HStack>
              {loading ? (
                <Box textAlign="center" py={8}>
                  <Spinner color="blue.500" size="lg" />
                  <Text mt={4} color="gray.600">Loading pricing...</Text>
                </Box>
              ) : vendorPricing.length === 0 ? (
                <Box
                  bg="gray.50"
                  borderRadius="xl"
                  p={8}
                  textAlign="center"
                  border="1px dashed"
                  borderColor="gray.300"
                >
                  <Text color="gray.600">No pricing information available</Text>
                </Box>
              ) : (
                <Box
                  bg="white"
                  borderRadius="xl"
                  boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                  border="1px solid"
                  borderColor="gray.100"
                  overflow={{ base: "scroll", md: "hidden" }}
                >
                  <Table variant="simple">
                    <Thead bg="gray.200">
                      <Tr>
                        <Th color={"gray.700"} width="50px">No.</Th>
                        <Th color={"gray.700"}>Country</Th>
                        <Th color={"gray.700"}>Product</Th>
                        <Th color={"gray.700"}>Area Codes</Th>
                        <Th color={"gray.700"}>MRC</Th>
                        <Th color={"gray.700"} textAlign="center">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {vendorPricing.map((pricing, index) => (
                        <Tr key={pricing.id} _hover={{ bg: 'gray.50' }}>
                          <Td>
                            <Text fontWeight="bold" color="blue.600">{index + 1}</Text>
                          </Td>
                          <Td>
                            <Text fontWeight="medium">{pricing.country_name}</Text>
                          </Td>
                          <Td>
                            <Badge borderRadius={"full"} variant="subtle" px={2} colorScheme="blue">
                              {pricing.product_name}
                            </Badge>
                          </Td>
                          <Td>
                              <Text fontSize="sm" fontWeight="medium" maxW="150px" isTruncated>
                                {pricing.area_codes && pricing.area_codes.length > 0
                                  ? pricing.area_codes.join(', ')
                                  : 'All'}
                              </Text>
                          </Td>
                          <Td>
                            <Text fontWeight="medium" color="green.600">
                              {pricing.mrc ? `$${parseFloat(pricing.mrc).toFixed(2)}` : 'N/A'}
                            </Text>
                          </Td>
                  
                          <Td textAlign="center">
                            <Button
                              colorScheme="blue"
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiEye />}
                              borderRadius="full"
                              _hover={{
                                bg: "blue.100",
                              }}
                              transition="all 0.2s ease"
                              onClick={() => handleViewPricing(pricing)}
                            >
                              View
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
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

    <DocumentRequiredModal
      isOpen={isDocumentsModalOpen}
      onClose={() => setIsDocumentsModalOpen(false)}
    />

    <AddVendorPricingModal
      isOpen={isPricingModalOpen}
      onClose={() => {
        setIsPricingModalOpen(false);
        setSelectedPricingData(null);
      }}
      vendorId={vendor.id}
      pricingData={selectedPricingData}
      onSuccess={fetchVendorData}
    />
    </Box>
  );
};

export default VendorDetailModal;