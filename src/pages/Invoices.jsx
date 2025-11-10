import React, { useState } from 'react';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure
} from '@chakra-ui/react';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFileText
} from 'react-icons/fi';

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Sample invoice data
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-001',
      customer: 'John Smith',
      customerEmail: 'john.smith@email.com',
      amount: 250.00,
      status: 'Paid',
      issueDate: '2024-11-01',
      dueDate: '2024-11-15',
      description: 'DID Numbers - 5 numbers'
    },
    {
      id: 'INV-002',
      customer: 'Sarah Johnson',
      customerEmail: 'sarah.j@email.com',
      amount: 180.00,
      status: 'Pending',
      issueDate: '2024-10-30',
      dueDate: '2024-11-13',
      description: 'Two Way SMS service'
    },
    {
      id: 'INV-003',
      customer: 'Mike Chen',
      customerEmail: 'mike.chen@email.com',
      amount: 120.00,
      status: 'Overdue',
      issueDate: '2024-10-28',
      dueDate: '2024-11-11',
      description: 'Mobile Numbers - 2 numbers'
    },
    {
      id: 'INV-004',
      customer: 'Emma Davis',
      customerEmail: 'emma.davis@email.com',
      amount: 75.00,
      status: 'Paid',
      issueDate: '2024-10-25',
      dueDate: '2024-11-08',
      description: 'Freephone service'
    }
  ]);

  const [newInvoice, setNewInvoice] = useState({
    customer: '',
    customerEmail: '',
    amount: '',
    dueDate: '',
    description: ''
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = () => {
    if (!newInvoice.customer || !newInvoice.amount || !newInvoice.dueDate) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const invoice = {
      id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      ...newInvoice,
      amount: parseFloat(newInvoice.amount),
      status: 'Pending',
      issueDate: new Date().toISOString().split('T')[0]
    };

    setInvoices([invoice, ...invoices]);
    setNewInvoice({
      customer: '',
      customerEmail: '',
      amount: '',
      dueDate: '',
      description: ''
    });
    onClose();

    toast({
      title: 'Invoice created',
      description: 'The invoice has been created successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleStatusUpdate = (invoiceId, newStatus) => {
    setInvoices(invoices.map(invoice =>
      invoice.id === invoiceId
        ? { ...invoice, status: newStatus }
        : invoice
    ));

    toast({
      title: 'Invoice status updated',
      description: `Invoice ${invoiceId} status changed to ${newStatus}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'green';
      case 'pending': return 'yellow';
      case 'overdue': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return FiCheckCircle;
      case 'pending': return FiClock;
      case 'overdue': return FiXCircle;
      default: return FiFileText;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidInvoices = invoices.filter(invoice => invoice.status === 'Paid').length;
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'Pending').length;
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'Overdue').length;

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
                Invoices
              </Heading>
              <Text color="gray.600" mt={2}>
                Create and manage customer invoices
              </Text>
            </Box>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              size="sm"
              onClick={onOpen}
              borderRadius="full"
            >
              Create Invoice
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
                  <Icon as={FiFileText} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {invoices.length}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Total Invoices
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
                  <Icon as={FiCheckCircle} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {paidInvoices}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Paid
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
                    {pendingInvoices}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Pending
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
                placeholder="Search invoices..."
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
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </Select>
          </HStack>

          {/* Invoices Table */}
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
                  <Th color={"gray.700"} >Invoice ID</Th>
                  <Th color={"gray.700"} >Customer</Th>
                  <Th color={"gray.700"} >Amount</Th>
                  <Th color={"gray.700"} textAlign={"center"}>Status</Th>
                  <Th color={"gray.700"} >Issue Date</Th>
                  <Th color={"gray.700"} >Due Date</Th>
                  <Th color={"gray.700"} >Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredInvoices.map((invoice) => (
                  <Tr key={invoice.id} _hover={{ bg: 'gray.50' }}>
                    <Td>
                      <Text fontWeight="medium" color="blue.600">
                        {invoice.id}
                      </Text>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{invoice.customer}</Text>
                        <Text fontSize="sm" color="gray.500">{invoice.customerEmail}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontWeight="medium">{formatCurrency(invoice.amount)}</Text>
                    </Td>
                    <Td textAlign="center">
                      <Badge colorScheme={getStatusColor(invoice.status)} borderRadius={"full"}>
                        <HStack spacing={1}>
                          <Icon as={getStatusIcon(invoice.status)} boxSize={3} />
                          <Text>{invoice.status}</Text>
                        </HStack>
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{new Date(invoice.issueDate).toLocaleDateString()}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{new Date(invoice.dueDate).toLocaleDateString()}</Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button size="sm" variant="ghost" colorScheme="blue">
                          <Icon as={FiEdit} boxSize={4} />
                        </Button>
                        {invoice.status === 'Pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => handleStatusUpdate(invoice.id, 'Paid')}
                          >
                            <Icon as={FiCheckCircle} boxSize={4} />
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

      {/* Create Invoice Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Invoice</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Customer Name</FormLabel>
                <Input
                  placeholder="Enter customer name"
                  value={newInvoice.customer}
                  onChange={(e) => setNewInvoice({...newInvoice, customer: e.target.value})}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Customer Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter customer email"
                  value={newInvoice.customerEmail}
                  onChange={(e) => setNewInvoice({...newInvoice, customerEmail: e.target.value})}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Amount</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Due Date</FormLabel>
                <Input
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Enter invoice description"
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateInvoice}>
              Create Invoice
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Invoices;