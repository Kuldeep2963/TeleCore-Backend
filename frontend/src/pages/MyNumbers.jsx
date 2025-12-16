import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Button,
  Icon,
  Select,
  Flex,
  InputGroup,
  Input,
  Spacer,
  InputRightElement,
  Spinner,
  Center,
  useToast,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  List,
  ListItem,
  useDisclosure,
  Portal,
  Tooltip,
} from "@chakra-ui/react";
import {
  FaFileExcel,
  FaEye,
  FaSearch,
  FaUnlink,
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaExclamationCircle,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import NumberPricingModal from "../Modals/NumberPricingModal";
import api from "../services/api";
import * as XLSX from 'xlsx';


function MyNumbers({ onRequestDisconnection, refreshTrigger }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [disconnectRequests, setDisconnectRequests] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [numbers, setNumbers] = useState([]);
  const {
    isOpen: isOrderDropdownOpen,
    onOpen: onOrderDropdownOpen,
    onClose: onOrderDropdownClose,
  } = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [disconnectionRequests, setDisconnectionRequests] = useState([]);

  const toast = useToast();

  useEffect(() => {
    fetchNumbers();
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchNumbers();
    }
  }, [refreshTrigger]);

  const fetchNumbers = async () => {
    try {
      setLoading(true);
      const [numbersResponse, requestsResponse] = await Promise.all([
        api.numbers.getAll(),
        api.disconnectionRequests.getAll(),
      ]);

      if (numbersResponse.success) {
        setNumbers(numbersResponse.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load numbers",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }

      if (requestsResponse.success) {
        setDisconnectionRequests(requestsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching numbers:", error);
      toast({
        title: "Error",
        description: "Failed to load numbers",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getDisconnectionRequest = (numberId) => {
    return disconnectionRequests.find((req) => req.number_id === numberId);
  };

  // Get unique orders with order number and ID
  const uniqueOrders = useMemo(() => {
    const ordersMap = {};
    numbers
      .filter((n) => n.order_id && n.order_number)
      .forEach((n) => {
        if (!ordersMap[n.order_id]) {
          ordersMap[n.order_id] = n.order_number;
        }
      });

    return Object.entries(ordersMap)
      .map(([id, number]) => ({ id, number }))
      .sort((a, b) => a.number.localeCompare(b.number));
  }, [numbers]);

  // Filter orders based on search term
  const filteredOrders = useMemo(() => {
    if (!orderSearchTerm.trim()) {
      return uniqueOrders;
    }
    const searchLower = orderSearchTerm.toLowerCase();
    return uniqueOrders.filter((order) =>
      order.number.toLowerCase().includes(searchLower)
    );
  }, [uniqueOrders, orderSearchTerm]);

  // Filter numbers based on search term and order ID
  const filteredNumbers = useMemo(() => {
    let result = numbers;

    if (selectedOrderId) {
      result = result.filter((number) => number.order_id === selectedOrderId);
    }

    if (!searchTerm.trim()) {
      return result;
    }

    const searchLower = searchTerm.toLowerCase();
    return result.filter(
      (number) =>
        number.country_name.toLowerCase().includes(searchLower) ||
        number.product_name.toLowerCase().includes(searchLower) ||
        number.area_code.toLowerCase().includes(searchLower) ||
        number.number.toLowerCase().includes(searchLower)
    );
  }, [numbers, searchTerm, selectedOrderId]);

  const handleDisconnectClick = (number) => {
    if (!onRequestDisconnection) {
      return;
    }
    onRequestDisconnection(number);
  };

  // Pagination calculations based on filtered numbers
  const totalResults = filteredNumbers.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, totalResults);
  const currentNumbers = filteredNumbers.slice(startIndex, endIndex);

  // Reset to first page when search or order filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedOrderId]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      const orderCombobox = document.getElementById("order-combobox");
      if (orderCombobox && !orderCombobox.contains(e.target)) {
        onOrderDropdownClose();
      }
    };

    if (isOrderDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOrderDropdownOpen, onOrderDropdownClose]);


const handleExportToExcel = () => {
  const exportData = filteredNumbers.map((number, index) => ({
    "No.": startIndex + index + 1,
    Country: number.country_name,
    "Product Type": number.product_name,
    "Area Code": number.area_code,
    Number: number.number,
    Status: number.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'My Numbers');
  XLSX.writeFile(workbook, 'My_Numbers.xlsx');
};

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleResultsPerPageChange = (e) => {
    setResultsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing results per page
  };

  const handleViewNumber = (number) => {
    setSelectedNumber(number);
    setIsPricingModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPricingModalOpen(false);
    setSelectedNumber(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleOrderSearchChange = (e) => {
    setOrderSearchTerm(e.target.value);
    if (!isOrderDropdownOpen) {
      onOrderDropdownOpen();
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrderId(order.id);
    setOrderSearchTerm(order.number);
    onOrderDropdownClose();
  };

  const clearOrderFilter = () => {
    setSelectedOrderId("");
    setOrderSearchTerm("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "green";
      case "Inactive":
        return "gray";
      case "Disconnected":
        return "red";
    }
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
      p={{ base: 4, md: 6 }}
      pb={1}
      bg="#f8f9fa"
      height="calc(100vh - 76px)"
      overflowY="auto"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Heading
            color="#1a3a52"
            fontSize="3xl"
            fontWeight="bold"
            letterSpacing="-0.2px"
          >
            My Numbers
          </Heading>
          <HStack spacing={6}>
            <Spacer />
            <Box position="relative" w="300px" id="order-combobox">
              <InputGroup>
                <Input
                  placeholder="All Orders"
                  value={orderSearchTerm}
                  onChange={handleOrderSearchChange}
                  onFocus={onOrderDropdownOpen}
                  bg="white"
                  borderRadius="full"
                  boxShadow="lg"
                  autoComplete="off"
                />
                <InputRightElement width="2.5rem">
                  {orderSearchTerm ? (
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={clearOrderFilter}
                      variant="ghost"
                      color="gray.500"
                      _hover={{ color: "gray.700" }}
                    >
                      ✕
                    </Button>
                  ) : null}
                </InputRightElement>
              </InputGroup>
              {isOrderDropdownOpen && filteredOrders.length > 0 && (
                <Box
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  bg="white"
                  borderRadius="md"
                  boxShadow="lg"
                  zIndex={10}
                  mt={1}
                  maxH="200px"
                  overflowY="auto"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <List spacing={0}>
                    {filteredOrders.map((order) => (
                      <ListItem
                        key={order.id}
                        p={3}
                        cursor="pointer"
                        _hover={{ bg: "blue.50" }}
                        onClick={() => handleSelectOrder(order)}
                        borderBottom="1px solid"
                        borderColor="gray.100"
                      >
                        <Text fontSize="sm">{order.number}</Text>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
            <InputGroup w="250px">
              <Input
                boxShadow="lg"
                type="text"
                bg="white"
                placeholder="Search . . . ."
                borderRadius="full"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <InputRightElement width="4.5rem">
                {searchTerm ? (
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={clearSearch}
                    variant="ghost"
                    color="gray.500"
                    _hover={{ color: "gray.700" }}
                  >
                    ✕
                  </Button>
                ) : (
                  <Icon as={FaSearch} color="gray.400" />
                )}
              </InputRightElement>
            </InputGroup>
            <Button
              leftIcon={<Icon as={FaFileExcel} />}
              onClick={handleExportToExcel}
              colorScheme="blue"
              variant="ghost"
              borderRadius="full"
              fontWeight="medium"
              isDisabled={filteredNumbers.length === 0}
            >
              Export
            </Button>
          </HStack>
        </HStack>

        {/* Search Results Info
        {searchTerm && (
          <Box
            bg="blue.50"
            borderRadius="md"
            p={3}
            border="1px solid"
            borderColor="blue.200"
          >
            <Text fontSize="sm" color="blue.700" fontWeight="medium">
              Found {filteredNumbers.length} number(s) matching "{searchTerm}"
              {filteredNumbers.length === 0 && ' - Try a different search term'}
            </Text>
          </Box>
        )} */}

        {/* Allocation Summary */}

        <Box
          mt={2}
          bg="white"
          borderRadius="xl"
          boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
          border="1px solid"
          borderColor="gray.100"
          overflow={"auto"}
          h="470px"
        >
          <Table variant="simple">
            <Thead position="sticky" top={0} bg="white" zIndex={1}>
              <Tr
               sx={{
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
                        }}
              >
                <Th width="10%">No.</Th>
                <Th>Country</Th>
                <Th>Product Type</Th>
                <Th>Area Code</Th>
                <Th>Number</Th>
                <Th>Status</Th>
                <Th width="20%">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentNumbers.length > 0 ? (
                currentNumbers.map((number, index) => (
                  <Tr key={number.id} _hover={{ bg: "gray.50" }}>
                    <Td
                      color={"blue.500"}
                      fontWeight={"bold"}
                      textAlign="center"
                    >
                      {startIndex + index + 1}
                    </Td>
                    <Td
                      fontWeight={"semibold"}
                      color={"green"}
                      textAlign="center"
                    >
                      {number.country_name}
                    </Td>

                    <Td textAlign="center">
                      <Badge colorScheme="blue" borderRadius={"full"} px={2}>
                        {number.product_name}
                      </Badge>
                    </Td>

                    <Td fontWeight={"semibold"} textAlign="center">
                      {number.area_code}
                    </Td>
                    <Td textAlign="center">{number.number}</Td>
                    <Td textAlign="center">
                      <Badge
                        px={2}
                        colorScheme={getStatusColor(number.status)}
                        borderRadius="full"
                      >
                        {number.status || "N/A"}
                      </Badge>
                    </Td>
                    <Td textAlign="center">
                      <HStack spacing={2} justify="center">
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          leftIcon={<Icon as={FaEye} />}
                          onClick={() => handleViewNumber(number)}
                        >
                          View
                        </Button>
                        {number.status !== "Disconnected" && (() => {
                          const disconnectionRequest = getDisconnectionRequest(number.id);
                          const status = disconnectionRequest?.status;
                          const rejectionReason = disconnectionRequest?.notes;

                          return (
                            <Tooltip
                              label={status === "Rejected" ? (rejectionReason || "No reason provided") : ""}
                              isDisabled={status !== "Rejected"}
                              hasArrow
                              placement="top"
                              borderRadius="lg"
                              bg="orange.50"
                              color="black"
                              fontSize="sm"
                              fontStyle="italic"
                              padding={2}
                              maxW={"200px"}
                            >
                              <Button
                                size="sm"
                                colorScheme={status === "Rejected" ? "orange" : "red"}
                                variant="ghost"
                                leftIcon={status === "Rejected" ? <Icon as={FaExclamationCircle}/>
                                : <Icon as={FaUnlink} />}
                                onClick={() => handleDisconnectClick(number)}
                                isDisabled={
                                  status === "Pending" ||
                                  status === "Approved" ||
                                  status === "Completed"
                                }
                              >
                                {status === "Pending"
                                  ? "Pending..."
                                  : status === "Rejected"
                                  ? "Rejected"
                                  : status === "Completed"
                                  ? "Disconnected"
                                  : "Disconnect"}
                              </Button>
                            </Tooltip>
                          );
                        })()}
                      </HStack>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td
                    colSpan={7}
                    textAlign="center"
                    color="gray.600"
                    py={8}
                    fontStyle="italic"
                    fontSize="md"
                  >
                    <VStack spacing={3} justify="center">
                      <Icon as={FiRefreshCw} boxSize={6} color="gray.500" />
                      <Text>
                        {searchTerm
                          ? "No numbers found matching your search"
                          : "No numbers purchased yet"}
                      </Text>
                    </VStack>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination Section */}
        {totalResults > 0 && (
          <Box
            bg="white"
            borderRadius="12px"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            px={4}
            py={2}
          >
            <Flex justify="space-between" align="center">
              {/* Results per page selector */}
              <HStack spacing={2}>
                <Text fontSize="sm" color="gray.600">
                  Show
                </Text>
                <Select
                  size="sm"
                  value={resultsPerPage}
                  onChange={handleResultsPerPageChange}
                  width="auto"
                  borderRadius="md"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Select>
                <Text fontSize="sm" color="gray.600">
                  results per page
                </Text>
              </HStack>

              {/* Pagination controls */}
              <HStack spacing={2}>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1}
                  borderRadius="md"
                >
                  <FaChevronCircleLeft />
                </Button>

                <Text fontSize="sm" color="gray.600" px={2}>
                  Page {currentPage} of {totalPages}
                </Text>

                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage + 1)}
                  isDisabled={currentPage === totalPages}
                  borderRadius="md"
                >
                  <FaChevronCircleRight />
                </Button>
              </HStack>

              {/* Results count */}
              <Text fontSize="sm" color="gray.600">
                Results {startIndex + 1} - {endIndex} of {totalResults}
                {searchTerm && ` (filtered from ${numbers.length} total)`}
              </Text>
            </Flex>
          </Box>
        )}
      </VStack>

      {/* Pricing Modal */}
      <NumberPricingModal
        isOpen={isPricingModalOpen}
        onClose={handleCloseModal}
        selectedNumber={selectedNumber}
      />
    </Box>
  );
}

export default MyNumbers;
