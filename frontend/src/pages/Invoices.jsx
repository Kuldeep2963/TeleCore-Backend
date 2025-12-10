import React, { useState, useEffect } from 'react';
import {
  Box,
  Divider,
  Flex,
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
  useDisclosure,
  Spinner,
  Center
} from '@chakra-ui/react';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFileText,
  FiDownload
} from 'react-icons/fi';
import { FaEdit } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import api from '../services/api';

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const [invoicesResponse, ordersResponse] = await Promise.all([
        api.invoices.getAll(),
        api.orders.getAll()
      ]);
      
      if (invoicesResponse.success) {
        const ordersMap = {};
        if (ordersResponse.success && Array.isArray(ordersResponse.data)) {
          for (const order of ordersResponse.data) {
            ordersMap[order.id] = order;
          }
        }
        
        const enrichedInvoices = invoicesResponse.data.map(invoice => ({
          ...invoice,
          quantity: ordersMap[invoice.order_id]?.quantity || 1
        }));
        setInvoices(enrichedInvoices);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load invoices',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoices',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }



  const [customers, setCustomers] = useState([]);
  const [newInvoice, setNewInvoice] = useState({
    customer_id: '',
    amount: '',
    due_date: '',
    notes: ''
  });
  const [editingUsage, setEditingUsage] = useState(null);
  const [newUsageAmount, setNewUsageAmount] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.customers.getAll();
      if (response.success) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = (invoice.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = async () => {
    if (!newInvoice.customer_id || !newInvoice.amount || !newInvoice.due_date) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await api.invoices.create({
        customer_id: parseInt(newInvoice.customer_id),
        amount: parseFloat(newInvoice.amount),
        due_date: newInvoice.due_date,
        notes: newInvoice.notes || null
      });

      if (response.success) {
        setNewInvoice({
          customer_id: '',
          amount: '',
          due_date: '',
          notes: ''
        });
        onClose();
        await fetchInvoices();

        toast({
          title: 'Invoice created',
          description: 'The invoice has been created successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // const handleStatusUpdate = async (invoiceId, newStatus) => {
  //   try {
  //     const response = await api.invoices.updateStatus(invoiceId, newStatus);
  //     if (response.success) {
  //       setInvoices(invoices.map(invoice =>
  //         invoice.id === invoiceId
  //           ? { ...invoice, status: newStatus }
  //           : invoice
  //       ));

  //       toast({
  //         title: 'Invoice status updated',
  //         description: `Invoice ${invoiceId} status changed to ${newStatus}`,
  //         status: 'success',
  //         duration: 3000,
  //         isClosable: true,
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error updating invoice status:', error);
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to update invoice status',
  //       status: 'error',
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   }
  // };

  const handleEditUsageAmount = (invoice) => {
    setEditingUsage(invoice);
    setNewUsageAmount(invoice.usage_amount?.toString() || '0');
  };

  const handleSaveUsageAmount = async () => {
    if (!editingUsage) return;

    try {
      const updatedAmount = parseFloat(newUsageAmount) || 0;

      // Make API call to update usage amount
      const response = await api.invoices.updateUsage(editingUsage.id, { usage_amount: updatedAmount });

      if (response.success) {
        // Update local state with the response data
        const updatedInvoices = invoices.map(invoice =>
          invoice.id === editingUsage.id
            ? {
                ...invoice,
                usage_amount: parseFloat(response.data.usage_amount),
                amount: parseFloat(response.data.amount)
              }
            : invoice
        );
        setInvoices(updatedInvoices);

        toast({
          title: "Usage amount updated",
          description: `Usage amount for invoice ${editingUsage.invoice_number || editingUsage.id} has been updated to $${updatedAmount.toFixed(2)}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setEditingUsage(null);
        setNewUsageAmount('');
      } else {
        throw new Error(response.message || 'Failed to update usage amount');
      }
    } catch (error) {
      console.error('Update usage amount error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update usage amount",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancelEditUsage = () => {
    setEditingUsage(null);
    setNewUsageAmount('');
  };

  const generateInvoicePDF = (invoiceData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    const formatDate = (date) =>
      date
        ? new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "N/A";

    const currency = (amount) => `$${Number(amount || 0).toFixed(2)}`;

    const drawSectionTitle = (title) => {
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text(title, 20, y);
      y += 8;
      doc.setFont(undefined, "normal");
      doc.setFontSize(10);
    };

    const drawLine = () => {
      doc.setDrawColor(0);
      doc.line(20, y, pageWidth - 20, y);
      y += 10;
    };

    const drawRow = (label, value) => {
      doc.setFont(undefined, "normal");
      doc.text(label, 20, y);
      doc.text(String(value), pageWidth - 90, y);
      y += 7;
    };

    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("INVOICE", pageWidth / 2, y, { align: "center" });
    y += 15;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    drawRow("Invoice Number:", invoiceData.invoice_number || "N/A");
    drawRow("Invoice Date:", formatDate(invoiceData.invoice_date || invoiceData.created_at));
    drawRow("Customer:", invoiceData.customer_name || "N/A");
    drawRow("Due Date:", formatDate(invoiceData.due_date));

    if (invoiceData.customer_email) drawRow("Email:", invoiceData.customer_email);
    if (invoiceData.customer_phone) drawRow("Phone:", invoiceData.customer_phone);
    if (invoiceData.country_name || invoiceData.area_code)
      drawRow(
        "Location:",
        `${invoiceData.country_name || ""} ${invoiceData.area_code || ""}`.trim()
      );

    drawLine();

    drawSectionTitle("Invoice Details");

    const detailRows = [
      ["Period", invoiceData.period || "N/A"],
      ["From Date", formatDate(invoiceData.from_date)],
      ["To Date", formatDate(invoiceData.to_date)],
      ["Product", invoiceData.product_name || "N/A"],
      ["Product Type", invoiceData.product_type || "N/A"],
      ["Quantity", invoiceData.quantity || "N/A"],
    ];

    detailRows.forEach(([label, value]) => drawRow(label + ":", value));

    drawLine();

    drawSectionTitle("Charges");

    drawRow("MRC Amount:", currency(invoiceData.mrc_amount));
    drawRow("Usage Amount:", currency(invoiceData.usage_amount));

    drawLine();

    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    doc.text("Total Amount:", 20, y);
    doc.text(currency(invoiceData.amount), pageWidth - 90, y);
    y += 12;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    drawRow("Status:", invoiceData.status || "N/A");

    if (invoiceData.paid_date) drawRow("Paid Date:", formatDate(invoiceData.paid_date));

    if (invoiceData.notes) {
      y += 8;
      doc.setFont(undefined, "bold");
      doc.text("Notes:", 20, y);
      y += 7;

      doc.setFont(undefined, "normal");

      const wrapped = doc.splitTextToSize(String(invoiceData.notes), pageWidth - 40);
      doc.text(wrapped, 20, y);
    }

    const fileName = `Invoice_${invoiceData.invoice_number}_${new Date()
      .toISOString()
      .split("T")[0]}.pdf`;

    doc.save(fileName);
  };

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      const response = await api.invoices.getDetails(invoiceId);

      if (response.success && response.data) {
        generateInvoicePDF(response.data);
        toast({
          title: 'Success',
          description: `Invoice ${invoiceNumber} downloaded successfully.`,
          status: 'success',
          duration: 2000,
          isClosable: true
        });
      } else {
        console.error('Response not successful:', response);
        toast({
          title: 'Error',
          description: response?.message || 'Failed to fetch invoice details.',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Download invoice PDF error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download invoice PDF',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
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

  if (loading) {
    return (
      <Center flex={1} minH="calc(100vh - 76px)">
        <Spinner size="lg" color="blue.500" />
      </Center>
    );
  }

  const totalRevenue = invoices.reduce((sum, invoice) => sum + (parseFloat(invoice.amount) || 0), 0);
  const paidInvoices = invoices.filter(invoice => invoice.status === 'Paid').length;
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'Pending').length;
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'Overdue').length;

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
                Invoices
              </Heading>
              <Text color="gray.600" mt={2}>
                Create and manage customer invoices
              </Text>
            </Box>
            {/* <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              size="sm"
              onClick={onOpen}
              borderRadius="full"
            >
              Create Invoice
            </Button>  */}
          </HStack>
              <Divider
                      pt={2}
                      mb={4}
                      borderRadius={"full"}
                      border="0"
                      bgGradient="linear(to-r, gray.400, gray.300, transparent)"
                    />
          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full" mb={6}>
            <Box
              bg="white"
              p={6}
              px={{base:3,md:6}}

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
              px={{base:3,md:6}}

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
              px={{base:3,md:6}}

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
              px={{base:3,md:6}}

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
            overflow={{base:"scroll",md:"hidden"}}
          >
            <Table variant="simple">
              <Thead bg="gray.200">
                <Tr>
                  <Th color={"gray.700"} >Invoice ID</Th>
                  <Th color={"gray.700"} >Customer</Th>
                  <Th w='12%' color={"gray.700"} >MRC Amount</Th>
                  <Th w='12%' color={"gray.700"} >Usage Amount</Th>
                  <Th color={"gray.700"} >Amount</Th>
                  <Th color={"gray.700"} textAlign={"center"}>Status</Th>
                  <Th color={"gray.700"} >Issue Date</Th>
                  <Th color={"gray.700"} >Due Date</Th>
                  <Th color={"gray.700"} textAlign={'center'} >Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredInvoices.map((invoice) => (
                  <Tr key={invoice.id} _hover={{ bg: 'gray.50' }}>
                    <Td>
                      <Text fontWeight="medium" color="blue.600">
                        {invoice.invoice_number || `#${invoice.id}`}
                      </Text>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{invoice.customer_name || 'N/A'}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text color='blue.700' fontWeight="semibold">{formatCurrency((Number(invoice.mrc_amount) || 0) * (Number(invoice.quantity) || 1))}</Text>
                    </Td>
                    <Td>
                      <Text color='purple' fontWeight="semibold">{formatCurrency(Number(invoice.usage_amount) || 0)}</Text>
                    </Td>
                    <Td>
                      <Text color='green' fontWeight="bold">{formatCurrency(((Number(invoice.mrc_amount) || 0) * (Number(invoice.quantity) || 1)) + (Number(invoice.usage_amount) || 0))}</Text>
                    </Td>
                    <Td textAlign="center">
                      <Badge px={2} colorScheme={getStatusColor(invoice.status || 'Pending')} borderRadius={"full"}>
                        <HStack spacing={1}>
                          <Icon as={getStatusIcon(invoice.status || 'Pending')} boxSize={3} />
                          <Text>{invoice.status || 'Pending'}</Text>
                        </HStack>
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : 'N/A'}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
                          title="Download PDF"
                        >
                          <Icon as={FiDownload} boxSize={4} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="orange"
                          onClick={() => handleEditUsageAmount(invoice)}
                        >
                          <Icon as={FaEdit} boxSize={4} />
                        </Button>
                        {/* {invoice.status === 'Pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => handleStatusUpdate(invoice.id, 'Paid')}
                          >
                            <Icon as={FiCheckCircle} boxSize={4} />
                          </Button>
                        )} */}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>
       {/* <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Invoice</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Customer</FormLabel>
                <Select
                  placeholder="Select a customer"
                  value={newInvoice.customer_id}
                  onChange={(e) => setNewInvoice({...newInvoice, customer_id: e.target.value})}
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company_name}
                    </option>
                  ))}
                </Select>
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
                  value={newInvoice.due_date}
                  onChange={(e) => setNewInvoice({...newInvoice, due_date: e.target.value})}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  placeholder="Enter invoice notes"
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
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
      </Modal> */}

      {/* Edit Usage Amount Modal */}
      <Modal isOpen={!!editingUsage} onClose={handleCancelEditUsage} size={{base:"sm",md:"lg"}}>
        <ModalOverlay />
        <ModalContent borderRadius={"15px"}>
          <ModalHeader borderTopRadius={"15px"} bgGradient="linear(to-r,blue.400,blue.500)" color={"white"} > Usage Amount - {editingUsage?.invoice_number || editingUsage?.id}</ModalHeader>
          <ModalCloseButton color={"white"} />
          <ModalBody mt={3} pb={6}>
            {editingUsage && (
              <VStack spacing={2} align="stretch">
                <Box>
                  <HStack spacing={6}>
                  <Text fontWeight="semibold" color="gray.600" mb={2}>Current MRC Amount:</Text>
                  <Text mb={2} fontWeight='bold' fontSize="lg" color="blue.600">${(parseFloat(editingUsage.mrc_amount || 0) * (editingUsage.quantity || 1)).toFixed(2)}</Text>
                  </HStack>
                </Box>
                <Box>
                  <HStack spacing={6}>
                  <Text fontWeight="semibold" color="gray.600" mb={2}>Current Usage Amount:</Text>
                  <Text mb={2} fontWeight='bold' fontSize="lg" color="purple.600">${(parseFloat(editingUsage.usage_amount) || 0).toFixed(2)}</Text>
                  </HStack>
                </Box>
                <Divider />
                <Box>
                  <Text fontWeight="semibold" color="gray.600" mb={2}>New Usage Amount:</Text>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newUsageAmount}
                      onChange={(e) => setNewUsageAmount(e.target.value)}
                      placeholder="0.00"
                      size="lg"
                    />
                  </InputGroup>
                </Box>
                <Box>
                  <HStack spacing={6}>
                  <Text fontWeight="semibold" color="gray.600" m={2}>New Total Amount:</Text>
                  <Text fontSize="xl" fontWeight="bold" m={2} color="green.600">
                    ${(parseFloat(editingUsage.mrc_amount || 0) * (editingUsage.quantity || 1) + parseFloat(newUsageAmount || 0)).toFixed(2)}
                  </Text>
                  </HStack>
                </Box>
                <Flex justify="flex-end" gap={3} mt={4}>
                  <Button borderRadius={"full"} variant="outline" onClick={handleCancelEditUsage}>
                    Cancel
                  </Button>
                  <Button
                    leftIcon={<FiPlus/>}
                    colorScheme="blue"
                    borderRadius={"full"}
                    onClick={handleSaveUsageAmount}
                    isDisabled={!newUsageAmount || parseFloat(newUsageAmount) < 0}
                  >
                    Save
                  </Button>
                </Flex>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Invoices;