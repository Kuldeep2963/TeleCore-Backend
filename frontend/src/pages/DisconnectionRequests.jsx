import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Divider,
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
  Tooltip,
  Spinner,
  Center,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiRefreshCw,
  FiSearch,
  FiEye,
  FiCheck,
  FiX,
  FiClock,
  FiPhone,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import { FaQuestion, FaUnlink } from "react-icons/fa";
import api from "../services/api";
import NumberDisconnectModal from "../Modals/NumberDisconnectModal";
import ConfirmationModal from "../Modals/DeleteConfirmationModal";
import RejectionReasonModal from "../Modals/RejectionReasonModal";

const DisconnectionRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isApproveOpen,
    onOpen: onApproveOpen,
    onClose: onApproveClose,
  } = useDisclosure();
  const {
    isOpen: isRejectOpen,
    onOpen: onRejectOpen,
    onClose: onRejectClose,
  } = useDisclosure();
  const [requestToConfirm, setRequestToConfirm] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isRejectReasonOpen, setIsRejectReasonOpen] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetchDisconnectionRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDisconnectionRequests = async () => {
    try {
      setLoading(true);
      const response = await api.disconnectionRequests.getAll();
      if (response.success) {
        // Transform the data to match the expected format
        const transformedRequests = response.data.map((request) => ({
          id: request.id,
          customer: request.customer_name || "N/A",
          customerEmail: request.customer_email || "N/A",
          phoneNumber: request.number || "N/A",
          requestDate: new Date(request.requested_at)
            .toISOString()
            .split("T")[0],
          reason: request.notes || "No reason provided",
          status: request.status,
          productType: request.product_name || "N/A",
        }));
        setRequests(transformedRequests);
      } else {
        toast({
          title: "Error",
          description: "Failed to load disconnection requests",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error fetching disconnection requests:", error);
      toast({
        title: "Error",
        description: "Failed to load disconnection requests",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter requests based on search term and status
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.phoneNumber.includes(searchTerm) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "green";
      case "Rejected":
        return "red";
      case "Pending":
        return "yellow";
      default:
        return "gray";
    }
  };

  const handleOpenApproveConfirmation = (request) => {
    setRequestToConfirm(request);
    setConfirmAction("approve");
    onApproveOpen();
  };

  const handleOpenRejectConfirmation = (request) => {
    setRequestToConfirm(request);
    setConfirmAction("reject");
    setIsRejectReasonOpen(true);
  };

  const handleApprove = async () => {
    if (!requestToConfirm) return;

    try {
      const response = await api.disconnectionRequests.updateStatus(
        requestToConfirm.id,
        "Approved"
      );
      if (response.success) {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestToConfirm.id
              ? { ...req, status: "Approved" }
              : req
          )
        );
        toast({
          title: "Request Approved",
          description: `Disconnection request for ${requestToConfirm.phoneNumber} has been approved.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: "Failed to approve disconnection request",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleReject = async (rejectionReason) => {
    if (!requestToConfirm) return;

    try {
      const response = await api.disconnectionRequests.updateStatus(
        requestToConfirm.id,
        "Rejected",
        rejectionReason
      );
      if (response.success) {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestToConfirm.id
              ? { ...req, status: "Rejected" }
              : req
          )
        );
        toast({
          title: "Request Rejected",
          description: `Disconnection request for ${requestToConfirm.phoneNumber} has been rejected.`,
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Failed to reject disconnection request",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleOpenDisconnectModal = () => {
    onOpen();
  };

  const handleDisconnectSuccess = () => {
    fetchDisconnectionRequests();
  };

  const getStats = () => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "Pending").length;
    const approved = requests.filter((r) => r.status === "Approved").length;
    const rejected = requests.filter((r) => r.status === "Rejected").length;

    return { total, pending, approved, rejected };
  };

  const stats = getStats();

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
      p={{ base: 4, md: 6 }}
      pl={{ base: 4, md: 8 }}
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
          <Button
            size={{ base: "sm", md: "sm" }}
            borderColor={"red.700"}
            variant={"outline"}
            borderRadius={"full"}
            onClick={handleOpenDisconnectModal}
          >
            <HStack spacing={2}>
              <FaUnlink color="#C53030" />
              <Text display={{ base: "none", md: "block" }} color={"red.700"}>
                Disconnect Number
              </Text>
            </HStack>
          </Button>
        </HStack>
        <Divider
          pt={2}
          mb={2}
          borderRadius={"full"}
          border="0"
          bgGradient="linear(to-r, gray.400, gray.300, transparent)"
        />
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
                  <Text fontSize="sm" color="gray.600">
                    Total Requests
                  </Text>
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
                  <Text fontSize="sm" color="gray.600">
                    Pending
                  </Text>
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
                  <Text fontSize="sm" color="gray.600">
                    Approved
                  </Text>
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
                  <Text fontSize="sm" color="gray.600">
                    Rejected
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <HStack spacing={4} wrap="wrap">
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by customer, number, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="white"
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
            bg="white"
            border="1px solid"
            borderColor="gray.200"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </Select>
        </HStack>

        {/* Requests Table */}
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
              <Tr
                sx={{
                  "& > th": {
                    bg: "blue.500",
                    color: "white",
                    fontWeight: "semibold",
                    fontSize: "sm",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    boxShadow: "inset 0 -1px 0 0 rgba(0,0,0,0.1)",
                    letterSpacing: "0.3px",
                    borderBottom: "2px solid",
                    borderColor: "gray.400",
                    textAlign: "center",
                    cursor: "pointer",
                    _hover: { bg: "blue.600" },
                  },
                }}
              >
                <Th color={"gray.700"} textAlign="center">
                  Request No.
                </Th>
                <Th color={"gray.700"} textAlign="center">
                  Customer
                </Th>
                <Th w={"12%"} color={"gray.700"} textAlign="center">
                  Phone Number
                </Th>
                <Th color={"gray.700"} textAlign="center">
                  Product Type
                </Th>
                <Th w={"11%"} color={"gray.700"} textAlign="center">
                  Request Date
                </Th>
                <Th color={"gray.700"} textAlign="center">
                  Reason
                </Th>
                <Th color={"gray.700"} textAlign="center">
                  Status
                </Th>
                <Th color={"gray.700"} textAlign="center">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredRequests.map((request, index) => (
                <Tr key={request.id}>
                  <Td textAlign={"center"} color={"blue.500"} fontWeight="bold">
                    {index + 1}
                  </Td>
                  <Td>
                    <HStack>
                      <Avatar size="sm" name={request.customer} />
                      <Box>
                        <Text fontWeight="medium">{request.customer}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {request.customerEmail}
                        </Text>
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
                    <Badge px={2} borderRadius={"full"} colorScheme="blue">
                      {request.productType}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack>
                      <Text>{request.requestDate}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Tooltip
                      bg={"blue.50"}
                      fontStyle={"italic"}
                      color={"black"}
                      label={request.reason}
                      hasArrow
                      arrowSize={12}
                      placement="top"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="gray.200"
                      boxShadow="lg"
                      p={4}
                      maxW="300px"
                      fontSize="sm"
                      whiteSpace={"normal"}
                      fontWeight="semibold"
                      lineHeight="tall"
                    >
                      <Icon as={FaQuestion} color={"red.500"} />
                      <Text></Text>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Badge
                      borderRadius={"full"}
                      px={2}
                      colorScheme={getStatusColor(request.status)}
                    >
                      {request.status}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      {request.status === "Pending" ? (
                        <>
                          <Button
                            borderRadius={"full"}
                            size="xs"
                            colorScheme="green"
                            variant="outline"
                            leftIcon={<FiCheck />}
                            onClick={() =>
                              handleOpenApproveConfirmation(request)
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            borderRadius={"full"}
                            size="xs"
                            colorScheme="red"
                            variant="outline"
                            leftIcon={<FiX />}
                            onClick={() =>
                              handleOpenRejectConfirmation(request)
                            }
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
              <Icon as={FiRefreshCw} boxSize={6} color="gray.500" mb={4} />
              <Text fontStyle="italic" fontSize="sm" color="gray.600">
                No disconnection requests found matching your criteria.
              </Text>
            </Box>
          )}
        </Box>
      </VStack>

      <NumberDisconnectModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleDisconnectSuccess}
      />

      <ConfirmationModal
        isOpen={isApproveOpen}
        onClose={onApproveClose}
        onConfirm={handleApprove}
        title="Approve Disconnection Request"
        message={`Are you sure you want to approve the disconnection request for ${requestToConfirm?.phoneNumber}? This action cannot be undone.`}
        confirmText="Approve"
        cancelText="Cancel"
        type="approve"
      />

      <RejectionReasonModal
        isOpen={isRejectReasonOpen}
        onClose={() => setIsRejectReasonOpen(false)}
        onConfirm={handleReject}
        phoneNumber={requestToConfirm?.phoneNumber}
      />
    </Box>
  );
};

export default DisconnectionRequests;
