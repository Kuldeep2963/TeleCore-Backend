import React, { useState, useEffect } from "react";
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
  Center,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFileText,
  FiDownload,
} from "react-icons/fi";
import { FaEdit } from "react-icons/fa";
import api from "../services/api";
import PaymentModal from "../Modals/PaymentModal";

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const [invoicesResponse, ordersResponse] = await Promise.all([
        api.invoices.getAll(),
        api.orders.getAll(),
      ]);

      if (invoicesResponse.success) {
        const ordersMap = {};
        if (ordersResponse.success && Array.isArray(ordersResponse.data)) {
          for (const order of ordersResponse.data) {
            ordersMap[order.id] = order;
          }
        }

        const enrichedInvoices = invoicesResponse.data.map((invoice) => ({
          ...invoice,
          quantity: ordersMap[invoice.order_id]?.quantity || 1,
        }));
        setInvoices(enrichedInvoices);
      } else {
        toast({
          title: "Error",
          description: "Failed to load invoices",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const [customers, setCustomers] = useState([]);
  const [newInvoice, setNewInvoice] = useState({
    customer_id: "",
    amount: "",
    due_date: "",
    notes: "",
  });
  const [editingUsage, setEditingUsage] = useState(null);
  const [newUsageAmount, setNewUsageAmount] = useState("");
  const [newRatePerMinute, setNewRatePerMinute] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");

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
      console.error("Error fetching customers:", error);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      (invoice.invoice_number || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (invoice.customer_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (invoice.customer_email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = async () => {
    if (!newInvoice.customer_id || !newInvoice.amount || !newInvoice.due_date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        status: "error",
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
        notes: newInvoice.notes || null,
      });

      if (response.success) {
        setNewInvoice({
          customer_id: "",
          amount: "",
          due_date: "",
          notes: "",
        });
        onClose();
        await fetchInvoices();

        toast({
          title: "Invoice created",
          description: "The invoice has been created successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        status: "error",
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
    const usageAmount = Number(invoice.usage_amount) || 0;
    const ratePerMin = Number(invoice.rate_per_minute) || 0;
    const totalSecs = Number(invoice.duration) || 0;

    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;

    setNewUsageAmount(usageAmount.toFixed(4));
    setNewRatePerMinute(ratePerMin.toFixed(4));
    setDurationMinutes(mins.toString());
    setDurationSeconds(secs.toString());
  };

  const calculateUsageAmount = (rate, minutes, seconds) => {
    const rate_num = parseFloat(rate) || 0;
    const mins_num = parseInt(minutes) || 0;
    const secs_num = parseInt(seconds) || 0;
    const totalMinutes = mins_num + secs_num / 60;
    const result = rate_num * totalMinutes;
    return isNaN(result) ? 0 : result;
  };

  const handleDurationChange = () => {
    const calculated = calculateUsageAmount(
      newRatePerMinute,
      durationMinutes,
      durationSeconds
    );
    setNewUsageAmount(calculated.toFixed(4));
  };

  const handleRateChange = (value) => {
    setNewRatePerMinute(value);
    const calculated = calculateUsageAmount(
      value,
      durationMinutes,
      durationSeconds
    );
    setNewUsageAmount(calculated.toFixed(4));
  };

  const handleMinutesChange = (value) => {
    setDurationMinutes(value);
    const calculated = calculateUsageAmount(
      newRatePerMinute,
      value,
      durationSeconds
    );
    setNewUsageAmount(calculated.toFixed(4));
  };

  const handleSecondsChange = (value) => {
    const secs = parseInt(value) || 0;
    if (secs >= 60) {
      setDurationSeconds("59");
    } else {
      setDurationSeconds(value);
    }
    const calculated = calculateUsageAmount(
      newRatePerMinute,
      durationMinutes,
      value
    );
    setNewUsageAmount(calculated.toFixed(4));
  };

  const handleSaveUsageAmount = async () => {
    if (!editingUsage) return;

    try {
      const updatedAmount = parseFloat(newUsageAmount) || 0;
      const updatedRate = parseFloat(newRatePerMinute) || 0;
      const mins = parseInt(durationMinutes) || 0;
      const secs = parseInt(durationSeconds) || 0;
      const updatedDuration = mins * 60 + secs;

      // Validation
      if (isNaN(updatedRate) || isNaN(updatedDuration)) {
        toast({
          title: "Validation Error",
          description: "Rate and duration must be valid numbers",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      console.log("Sending update:", {
        id: editingUsage.id,
        usage_amount: updatedAmount,
        rate_per_minute: updatedRate,
        duration: updatedDuration,
      });

      // Make API call to update usage amount, rate, and duration
      const response = await api.invoices.update(editingUsage.id, {
        usage_amount: updatedAmount,
        rate_per_minute: updatedRate,
        duration: updatedDuration,
      });

      if (response.success) {
        // Update local state with the response data
        const updatedInvoices = invoices.map((invoice) =>
          invoice.id === editingUsage.id
            ? {
                ...invoice,
                usage_amount: parseFloat(response.data.usage_amount),
                amount: parseFloat(response.data.amount),
                rate_per_minute: parseFloat(response.data.rate_per_minute),
                duration: parseInt(response.data.duration),
              }
            : invoice
        );
        setInvoices(updatedInvoices);

        toast({
          title: "Invoice updated",
          description: `Invoice ${
            editingUsage.invoice_number || editingUsage.id
          } has been updated successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setEditingUsage(null);
        setNewUsageAmount("");
        setNewRatePerMinute("");
        setDurationMinutes("");
        setDurationSeconds("");
      } else {
        throw new Error(response.message || "Failed to update invoice");
      }
    } catch (error) {
      console.error("Update invoice error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancelEditUsage = () => {
    setEditingUsage(null);
    setNewUsageAmount("");
    setNewRatePerMinute("");
    setDurationMinutes("");
    setDurationSeconds("");
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async (method) => {
    if (!selectedInvoiceForPayment) return;

    if (method === "wallet") {
      setPaymentLoading(true);
      try {
        const response = await api.invoices.pay(selectedInvoiceForPayment.id);
        if (response.success) {
          setInvoices(
            invoices.map((invoice) =>
              invoice.id === selectedInvoiceForPayment.id
                ? {
                    ...invoice,
                    status: "Paid",
                    paid_date: new Date().toISOString(),
                  }
                : invoice
            )
          );

          toast({
            title: "Payment successful",
            description: "Invoice marked as paid",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          setIsPaymentModalOpen(false);
          setSelectedInvoiceForPayment(null);
        }
      } catch (error) {
        console.error("Error paying invoice:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to process payment",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setPaymentLoading(false);
      }
    }
  };

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      const response = await api.invoices.downloadPDF(invoiceId);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Invoice_${invoiceNumber}_${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: `Invoice ${invoiceNumber} downloaded successfully.`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to download invoice PDF.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Download invoice PDF error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to download invoice PDF",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "green";
      case "pending":
        return "yellow";
      case "overdue":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return FiCheckCircle;
      case "pending":
        return FiClock;
      case "overdue":
        return FiXCircle;
      default:
        return FiFileText;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <Center flex={1} minH="calc(100vh - 76px)">
        <Spinner size="lg" color="blue.500" />
      </Center>
    );
  }

  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + (parseFloat(invoice.amount) || 0),
    0
  );
  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === "Paid"
  ).length;
  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status === "Pending"
  ).length;
  const overdueInvoices = invoices.filter(
    (invoice) => invoice.status === "Overdue"
  ).length;

  return (
    <Box
      flex={1}
      p={{ base: 5, md: 8 }}
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
              px={{ base: 3, md: 6 }}
              borderRadius="xl"
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
              border="1px solid"
              borderColor="gray.100"
            >
              <HStack spacing={4}>
                <Box
                  display="flex" // Add this
                  alignItems="center" // Center vertically
                  justifyContent="center"
                  p={2}
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
              px={{ base: 3, md: 6 }}
              borderRadius="xl"
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
              border="1px solid"
              borderColor="gray.100"
            >
              <HStack spacing={4}>
                <Box
                  display="flex" // Add this
                  alignItems="center" // Center vertically
                  justifyContent="center"
                  p={2}
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
              px={{ base: 3, md: 6 }}
              borderRadius="xl"
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
              border="1px solid"
              borderColor="gray.100"
            >
              <HStack spacing={4}>
                <Box
                  display="flex" // Add this
                  alignItems="center" // Center vertically
                  justifyContent="center"
                  p={2}
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
              px={{ base: 3, md: 6 }}
              borderRadius="xl"
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
              border="1px solid"
              borderColor="gray.100"
            >
              <HStack spacing={4}>
                <Box
                  display="flex" // Add this
                  alignItems="center" // Center vertically
                  justifyContent="center"
                  p={2}
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
                bg={"white"}
                placeholder="Search invoices..."
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
            overflow={"auto"}
            h={"400px"}
          >
            <Table variant="simple">
              <Thead>
                <Tr sx={{
                          '& > th': {
                            bg: "blue.500",
                            color: "white",
                            fontWeight: "semibold",
                            fontSize: "sm",
                            position: "sticky",
                            top:0,
                            zIndex:1,
                            boxShadow: "inset 0 -1px 0 0 rgba(0,0,0,0.1)",
                            letterSpacing: "0.3px",
                            borderBottom: "2px solid",
                            borderColor: "gray.400",
                            textAlign: "center",
                            cursor: "pointer",
                            _hover: { bg: "blue.600" }
                          }
                        }}>
                  <Th color={"gray.700"}>Invoice ID</Th>
                  <Th color={"gray.700"}>Customer</Th>
                  <Th w="12%" color={"gray.700"}>
                    MRC Amount
                  </Th>
                  <Th w="12%" color={"gray.700"}>
                    Usage Amount
                  </Th>
                  <Th color={"gray.700"}>Amount</Th>
                  <Th color={"gray.700"} textAlign={"center"}>
                    Status
                  </Th>
                  <Th color={"gray.700"}>Issue Date</Th>
                  <Th color={"gray.700"}>Due Date</Th>
                  <Th color={"gray.700"} textAlign={"center"}>
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredInvoices.map((invoice) => (
                  <Tr key={invoice.id} _hover={{ bg: "gray.50" }}>
                    <Td>
                      <Text fontWeight="medium" color="blue.600">
                        {invoice.invoice_number || `#${invoice.id}`}
                      </Text>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">
                          {invoice.customer_name || "N/A"}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text color="blue.700" fontWeight="semibold">
                        {formatCurrency(Number(invoice.mrc_amount) || 0)}
                      </Text>
                    </Td>
                    <Td>
                      <Text color="purple" fontWeight="semibold">
                        {formatCurrency(Number(invoice.usage_amount) || 0)}
                      </Text>
                    </Td>
                    <Td>
                      <Text color="green" fontWeight="bold">
                        {formatCurrency(
                          (Number(invoice.mrc_amount) || 0) +
                            (Number(invoice.usage_amount) || 0)
                        )}
                      </Text>
                    </Td>
                    <Td textAlign="center">
                      <Badge
                        px={2}
                        colorScheme={getStatusColor(
                          invoice.status || "Pending"
                        )}
                        borderRadius={"full"}
                      >
                        <HStack spacing={1}>
                          <Icon
                            as={getStatusIcon(invoice.status || "Pending")}
                            boxSize={3}
                          />
                          <Text>{invoice.status || "Pending"}</Text>
                        </HStack>
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {invoice.created_at
                          ? new Date(invoice.created_at).toLocaleDateString()
                          : "N/A"}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {invoice.due_date
                          ? new Date(invoice.due_date).toLocaleDateString()
                          : "N/A"}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() =>
                            handleDownloadPDF(
                              invoice.id,
                              invoice.invoice_number
                            )
                          }
                          title="Download PDF"
                        >
                          <Icon as={FiDownload} boxSize={4} />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="orange"
                          onClick={() => handleEditUsageAmount(invoice)}
                          isDisabled={invoice.status === "Paid"}
                        >
                          <Icon as={FaEdit} boxSize={4} />
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

      {/* Edit Invoice Modal */}
      <Modal
        isOpen={!!editingUsage}
        onClose={handleCancelEditUsage}
        size={{ base: "sm", md: "xl" }}
      >
        <ModalOverlay />
        <ModalContent borderRadius={"15px"}>
          <ModalHeader
            borderTopRadius={"15px"}
            bgGradient="linear(to-r,blue.400,blue.500)"
            color={"white"}
          >
            {" "}
            Invoice - {editingUsage?.invoice_number || editingUsage?.id}
          </ModalHeader>
          <ModalCloseButton color={"white"} />
          <ModalBody mt={3} pb={6}>
            {editingUsage && (
              <VStack spacing={2} align="stretch">
                <Box>
                  <HStack spacing={6}>
                    <Text fontWeight="semibold" color="gray.600" mb={2}>
                      Current MRC Amount:
                    </Text>
                    <Text
                      mb={2}
                      fontWeight="bold"
                      fontSize="lg"
                      color="blue.600"
                    >
                      ${parseFloat(editingUsage.mrc_amount || 0).toFixed(4)}
                    </Text>
                  </HStack>
                </Box>
                <Box>
                  <HStack spacing={6}>
                    <Text fontWeight="semibold" color="gray.600" mb={2}>
                      Current Usage Amount:
                    </Text>
                    <Text
                      mb={2}
                      fontWeight="bold"
                      fontSize="lg"
                      color="purple.600"
                    >
                      ${(parseFloat(editingUsage.usage_amount) || 0).toFixed(4)}
                    </Text>
                  </HStack>
                </Box>
                <Divider />
                <Box>
                  <Box>
                    <Text fontWeight="semibold" color="gray.600" mb={2}>
                      Rate per Minute:
                    </Text>
                    <InputGroup>
                      <InputLeftElement
                        pointerEvents="none"
                        color="gray.600"
                        fontSize="1.2em"
                      >
                        $
                      </InputLeftElement>
                      <Input
                        type="number"
                        step="0.0001"
                        min="0"
                        bg={"white"}
                        borderColor={"gray.300"}
                        value={newRatePerMinute}
                        onChange={(e) => handleRateChange(e.target.value)}
                        placeholder="Enter rate per minute"
                        size="md"
                      />
                    </InputGroup>
                  </Box>

                  <Box mt={2}>
                    <Text fontWeight="semibold" color="gray.600" mb={2}>
                      Duration
                    </Text>
                    <HStack spacing={2}>
                      <Box flex={1}>
                        <Text fontSize="sm" color="gray.500" mb={1}>
                          Minutes
                        </Text>
                        <Input
                          type="number"
                          min="0"
                          value={durationMinutes}
                          onChange={(e) => handleMinutesChange(e.target.value)}
                          bg={"white"}
                          placeholder="Minutes"
                          size="md"
                        />
                      </Box>
                      <Box flex={1}>
                        <Text fontSize="sm" color="gray.500" mb={1}>
                          Seconds (0-59)
                        </Text>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={durationSeconds}
                          onChange={(e) => handleSecondsChange(e.target.value)}
                          bg={"white"}
                          placeholder="Seconds"
                          size="md"
                        />
                      </Box>
                    </HStack>
                  </Box>
                </Box>
                <Box>
                  <Text fontWeight="semibold" color="gray.600" mb={2}>
                    Calculated Usage Amount:
                  </Text>
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      color="gray.300"
                      fontSize="1.2em"
                    >
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newUsageAmount}
                      isReadOnly
                      bg="gray.200"
                      placeholder="0.00"
                      size="md"
                    />
                  </InputGroup>
                </Box>

                <Box>
                  <HStack spacing={6}>
                    <Text fontWeight="semibold" color="gray.600" m={2}>
                      New Total Amount:
                    </Text>
                    <Text
                      fontSize="xl"
                      fontWeight="bold"
                      m={2}
                      color="green.600"
                    >
                      $
                      {(
                        parseFloat(editingUsage.mrc_amount || 0) +
                        parseFloat(newUsageAmount || 0)
                      ).toFixed(4)}
                    </Text>
                  </HStack>
                </Box>

                <Flex justify="flex-end" gap={3} mt={4}>
                  <Button
                    borderRadius={"full"}
                    variant="outline"
                    onClick={handleCancelEditUsage}
                  >
                    Cancel
                  </Button>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    borderRadius={"full"}
                    onClick={handleSaveUsageAmount}
                  >
                    Save
                  </Button>
                </Flex>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={selectedInvoiceForPayment?.amount || 0}
        onConfirm={handlePaymentConfirm}
        title={`Pay for Invoice #${selectedInvoiceForPayment?.invoice_number}`}
        loading={paymentLoading}
      />
    </Box>
  );
};

export default Invoices;
