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
  Card,
  CardBody,
  Divider,
  Tooltip
} from '@chakra-ui/react';
import {
  FiRefreshCw,
  FiSearch,
  FiEye,
  FiCheck,
  FiX,
  FiClock,
  FiPhone,
  FiUser,
  FiCalendar
} from 'react-icons/fi';
import { FaQuestion } from 'react-icons/fa';

const DisconnectionRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const toast = useToast();
  const navigate = useNavigate();

  // Sample disconnection requests data
  const [requests, setRequests] = useState([
    {
      id: '#DIS-001',
      customer: 'John Smith',
      customerEmail: 'john.smith@email.com',
      phoneNumber: '+1 (555) 123-4567',
      requestDate: '2024-01-15',
      reason: 'Moving to new provider',
      status: 'Pending',
      productType: 'DID'
    },
    {
      id: '#DIS-002',
      customer: 'Sarah Johnson',
      customerEmail: 'sarah.johnson@email.com',
      phoneNumber: '+1 (555) 987-6543',
      requestDate: '2024-01-14',
      reason: 'Business closure',
      status: 'Approved',
      productType: 'Freephone'
    },
    {
      id: '#DIS-003',
      customer: 'Mike Davis',
      customerEmail: 'mike.davis@email.com',
      phoneNumber: '+44 20 1234 5678',
      requestDate: '2024-01-13',
      reason: 'Cost optimization',
      status: 'Rejected',
      productType: 'DID'
    },
    {
      id: '#DIS-004',
      customer: 'Emma Wilson',
      customerEmail: 'emma.wilson@email.com',
      phoneNumber: '+61 2 1234 5678',
      requestDate: '2024-01-12',
      reason: 'Temporary suspension',
      status: 'Pending',
      productType: 'Two Way Voice'
    }
  ]);

  // Filter requests based on search term and status
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.phoneNumber.includes(searchTerm) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'green';
      case 'Rejected': return 'red';
      case 'Pending': return 'yellow';
      default: return 'gray';
    }
  };

  const handleApprove = (id) => {
    setRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status: 'Approved' } : req
    ));
    toast({
      title: 'Request Approved',
      description: `Disconnection request ${id} has been approved.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleReject = (id) => {
    setRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status: 'Rejected' } : req
    ));
    toast({
      title: 'Request Rejected',
      description: `Disconnection request ${id} has been rejected.`,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  };

  const getStats = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'Pending').length;
    const approved = requests.filter(r => r.status === 'Approved').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;

    return { total, pending, approved, rejected };
  };

  const stats = getStats();

  return (
    <Box
      flex={1}
      p={6}
      bg="#f8f9fa"
      height="calc(100vh - 76px)"
      overflowY="auto"
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Heading color="#1a3a52" fontSize="3xl" fontWeight="bold">
            Disconnection Requests
          </Heading>
        </HStack>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg="white" borderRadius="12px" boxShadow="sm">
            <CardBody>
              <HStack spacing={3}>
                <Icon as={FiRefreshCw} boxSize={6} color="blue.500" />
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {stats.total}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Total Requests</Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card bg="white" borderRadius="12px" boxShadow="sm">
            <CardBody>
              <HStack spacing={3}>
                <Icon as={FiClock} boxSize={6} color="yellow.500" />
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
                    {stats.pending}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Pending</Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card bg="white" borderRadius="12px" boxShadow="sm">
            <CardBody>
              <HStack spacing={3}>
                <Icon as={FiCheck} boxSize={6} color="green.500" />
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {stats.approved}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Approved</Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card bg="white" borderRadius="12px" boxShadow="sm">
            <CardBody>
              <HStack spacing={3}>
                <Icon as={FiX} boxSize={6} color="red.500" />
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="red.600">
                    {stats.rejected}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Rejected</Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <Card bg="white" borderRadius="12px" boxShadow="sm">
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search by customer, number, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="full"
                />
              </InputGroup>

              <Select
                borderRadius="full"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                maxW="200px"
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Requests Table */}
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
                  <Th color={"gray.700"} textAlign="center">Request ID</Th>
                  <Th color={"gray.700"} textAlign="center">Customer</Th>
                  <Th w={"12%"} color={"gray.700"} textAlign="center">Phone Number</Th>
                  <Th color={"gray.700"} textAlign="center">Product Type</Th>
                  <Th w={"11%"} color={"gray.700"} textAlign="center">Request Date</Th>
                  <Th color={"gray.700"} textAlign="center">Reason</Th>
                  <Th color={"gray.700"} textAlign="center">Status</Th>
                  <Th color={"gray.700"} textAlign="center">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredRequests.map((request) => (
                  <Tr key={request.id} >
                    <Td fontWeight="medium">{request.id}</Td>
                    <Td>
                      <HStack>
                        <Avatar size="sm" name={request.customer} />
                        <Box>
                          <Text fontWeight="medium">{request.customer}</Text>
                          <Text fontSize="sm" color="gray.600">{request.customerEmail}</Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack>
                        <Icon as={FiPhone} color="blue.500" />
                        <Text>{request.phoneNumber}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge colorScheme="blue">{request.productType}</Badge>
                    </Td>
                    <Td>
                      <HStack>
                        <Text>{request.requestDate}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Tooltip
                         label={request.reason}
                         hasArrow
                         arrowSize={12}
                         placement="top"
                         bg="white"
                         color="gray.800"
                         borderRadius="lg"
                         border="1px solid"
                         borderColor="gray.200"
                         boxShadow="lg"
                         p={4}
                         maxW="300px"
                         fontSize="sm"
                           // fontStyle={"italic"}
                         fontWeight="normal"
                         lineHeight="tall"
                         _dark={{
                            bg: "gray.800",
                            color: "white",
                            borderColor: "gray.600",
                             }}
                       >
                      <Icon as={FaQuestion} color={"red.500"}/>
                      <Text></Text>
                      </Tooltip>
                    </Td>
                    <Td>
                      <Badge borderRadius={"full"} colorScheme={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        {request.status === 'Pending' ? (
                        <>
                         <Button
                           size="xs"
                           colorScheme="green"
                           variant="outline"
                           leftIcon={<FiCheck />}
                           onClick={() => handleApprove(request.id)}
                         >
                         Approve
                        </Button>
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="outline"
                          leftIcon={<FiX />}
                          onClick={() => handleReject(request.id)}
                        >
                          Reject
                       </Button>
                    </>
                    ) : (
                       <Text fontSize="sm" color="gray.500" fontStyle="italic">
                         Action Taken
                       </Text>
                      )}
                </HStack>
               </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {filteredRequests.length === 0 && (
              <Box p={8} textAlign="center">
                <Icon as={FiRefreshCw} boxSize={12} color="gray.400" mb={4} />
                <Text fontSize="lg" color="gray.600">
                  No disconnection requests found matching your criteria.
                </Text>
              </Box>
            )}
          </Box>
      </VStack>
    </Box>
  );
};

export default DisconnectionRequests;