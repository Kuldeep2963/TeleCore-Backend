import React, { useState } from 'react';
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
  Tooltip
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
  FiEye
} from 'react-icons/fi';
import DocumentRequiredModal from './DocumentRequiredModal';

const VendorDetailModal = ({ isOpen, onClose, vendor }) => {
  if (!vendor) return null;

  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);

  // Required documents for this vendor
  const requiredDocuments = [
    { name: 'Business License', required: true, description: 'Valid business registration certificate' },
    { name: 'Tax Certificate', required: true, description: 'Latest tax clearance certificate' },
    { name: 'ID Proof', required: false, description: 'Government issued ID for authorized signatory' },
    { name: 'Address Proof', required: true, description: 'Utility bill or bank statement showing address' },
    { name: 'Bank Details', required: true, description: 'Bank account details for payment processing' }
  ];

  // Sample products offered by this vendor
  const vendorProducts = [
    {
      id: 1,
      name: 'DID Numbers',
      category: 'Telecom',
      price: '$2.50/month',
      status: 'Active',
      orders: 45
    },
    {
      id: 2,
      name: 'Two Way SMS',
      category: 'Messaging',
      price: '$0.15/message',
      status: 'Active',
      orders: 32
    },
    {
      id: 3,
      name: 'Mobile Numbers',
      category: 'Telecom',
      price: '$3.00/month',
      status: 'Active',
      orders: 28
    },
    {
      id: 4,
      name: 'Freephone',
      category: 'Telecom',
      price: '$4.50/month',
      status: 'Active',
      orders: 18
    }
  ];

  const getStatusColor = (status) => {
    return status === 'Active' ? 'green' : 'red';
  };

  return (
    <Box>
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Avatar size="md" name={vendor.name} />
            <VStack align="start" spacing={0}>
              <Heading size="lg">{vendor.name}</Heading>
              <Text fontSize="sm" color="gray.600">Vendor Details</Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
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
                      <Text>{vendor.email}</Text>
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
                      <Text>{new Date(vendor.joinDate).toLocaleDateString()}</Text>
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
                      <Icon as={FiPackage} boxSize={6} color="blue.500" />
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {vendor.products}
                      </Text>
                      <Text fontSize="sm" color="blue.600">Total Products</Text>
                    </VStack>
                  </CardBody>
                </Card>

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
                </Card>

                <Card bg="purple.50">
                  <CardBody>
                    <VStack>
                      <Icon as={FiStar} boxSize={6} color="purple.500" />
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                        {vendor.rating}
                      </Text>
                      <Text fontSize="sm" color="purple.600">Rating</Text>
                    </VStack>
                  </CardBody>
                </Card>

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

            {/* Products Offered */}
            <Box>
              <HStack spacing={5} mb={4}>
              <Heading size="md">Products Offered</Heading>
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
                          Required Documents
                         </Button>
                         </HStack>
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
                      <Th color={"gray.700"}>Product Name</Th>
                      <Th color={"gray.700"} >Category</Th>
                      <Th color={"gray.700"} >Price List</Th>
                      <Th color={"gray.700"} textAlign="center">Status</Th>
                      <Th color={"gray.700"} textAlign="center">Orders</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {vendorProducts.map((product) => (
                      <Tr key={product.id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <Text fontWeight="medium">{product.name}</Text>
                        </Td>
                        <Td>
                          <Badge borderRadius={"full"} variant="subtle" colorScheme="blue">
                            {product.category}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack>
                          <Button
                            colorScheme="blue"
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiEye />}
                            borderRadius="full"
                            _hover={{
                              bg: "blue.100",
                              borderColor: "blue.400",
                            }}
                            transition="all 0.2s ease"
                            onClick={() => console.log('View clicked for product:', product.name)}
                          >
                            View
                          </Button>
                          </HStack>
                          {/* <Text fontWeight="medium" color="green.600">{product.price}</Text> */}
                        </Td>
                        <Td textAlign="center">
                          <Badge colorScheme={getStatusColor(product.status)} borderRadius={"full"}>
                            {product.status}
                          </Badge>
                        </Td>
                        <Td textAlign="center">
                          <Text fontWeight="medium">{product.orders}</Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
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
       documents={requiredDocuments}
       title={`${vendor.name} - Required Documents`}
     />
    </Box>
  );
};

export default VendorDetailModal;