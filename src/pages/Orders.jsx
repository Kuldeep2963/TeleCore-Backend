import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Divider,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  FiPackage,
  FiSearch,
  FiEye,
  FiCheck,
  FiX,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";
import api from "../services/api";
import { transform } from "framer-motion";

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.orders.getAll();
      if (response.success) {
        setOrders(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load orders",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (String(order.id) || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.companyName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.serviceName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || order.orderStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await api.orders.updateStatus(orderId, newStatus);
      if (response.success) {
        // If status is changed to 'Delivered', update user_id for allocated numbers
        if (newStatus === "Delivered") {
          try {
            await api.numbers.updateUserForOrder(orderId);
          } catch (numberError) {
            console.error("Error updating user_id for numbers:", numberError);
            // Don't fail the whole operation if number update fails
          }
        }

        setOrders(
          orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  orderStatus: newStatus,
                  completedDate:
                    newStatus === "Delivered"
                      ? new Date().toISOString().split("T")[0]
                      : null,
                }
              : order
          )
        );

        toast({
          title: "Order status updated",
          description: `Order ${orderId} status changed to ${newStatus}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (orderStatus) => {
    switch (orderStatus?.toLowerCase()) {
      case "delivered":
        return "green";
      case "confirmed":
        return "blue";
      case "cancelled":
        return "red";
      case "in progress":
        return "yellow";
      case "amount paid":
        return "purple";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (orderStatus) => {
    switch (orderStatus?.toLowerCase()) {
      case "delivered":
        return FiCheck;
      case "confirmed":
        return FiClock;
      case "cancelled":
        return FiX;
      case "in progress":
        return FiClock;
      case "amount paid":
        return FiDollarSign;
      default:
        return FiPackage;
    }
  };

  const handleViewOrder = (order) => {
    // Transform order data to match OrderNumberView expected format
    const transformedOrder = {
      id: order.id,
      orderNo: order.orderNo,
      serviceName: order.serviceName || "N/A",
      country: order.country || "United States (+1)",
      productType: order.productType || (order.serviceName || "").split(" ")[0],
      areaCode: order.areaCode || "Toll Free (800)",
      countryId: order.country_id,
      productId: order.product_id,
      quantity: order.quantity,
      orderStatus: order.orderStatus,
      orderDate: order.orderDate || order.created_at,
      createdBy: order.createdBy || "Unknown",
      pricing: order.pricing || null,
      desiredPricing: order.desiredPricing || null,
      documents: order.documents || [],
    };
    navigate("/order-number-view", {
      state: { orderData: transformedOrder },
    });
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

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (parseFloat(order.totalAmount) || 0),
    0
  );
  const deliveredOrders = orders.filter(
    (order) => order.orderStatus === "Delivered"
  ).length;
  const confirmedOrders = orders.filter(
    (order) => order.orderStatus === "Confirmed"
  ).length;

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
          <HStack justify="space-between" align="center" mb={4}>
            <Box>
              <Heading
                color="gray.800"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                letterSpacing="-0.5px"
              >
                Orders Management
              </Heading>
              <Text color="gray.600" mt={2}>
                Track and manage all customer orders
              </Text>
            </Box>
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
              px={{base:2,md:6}}

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
                  <Icon as={FiPackage} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {orders.length}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Total Orders
                  </Text>
                </Box>
              </HStack>
            </Box>

            <Box
              bg="white"
              p={6}
              px={{base:2,md:6}}

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
                  <Icon as={FiCheck} boxSize={6} />
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {deliveredOrders}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Delivered
                  </Text>
                </Box>
              </HStack>
            </Box>

            <Box
              bg="white"
              p={6}
              px={{base:2,md:6}}

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
                    {confirmedOrders}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Confirmed
                  </Text>
                </Box>
              </HStack>
            </Box>

            <Box
              bg="white"
              p={6}
              px={{base:2,md:6}}

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
                bg={"white"}
                placeholder="Search orders..."
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
              <option value="In Progress">In Progress</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Amount Paid">Amount Paid</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
          </HStack>

          {/* Orders Table */}
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
                  <Th color={"gray.700"}>Order ID</Th>
                  <Th color={"gray.700"}>Customer</Th>
                  <Th color={"gray.700"}>Product Type</Th>
                  <Th color={"gray.700"} textAlign="center">
                    Quantity
                  </Th>
                  <Th color={"gray.700"}>Amount</Th>
                  <Th color={"gray.700"} textAlign="center">
                    Status
                  </Th>
                  <Th w={"11%"} color={"gray.700"}>
                    Order Date
                  </Th>
                  {/* <Th color={"gray.700"}>Vendor</Th> */}
                  <Th color={"gray.700"}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredOrders.map((order) => (
                  <Tr key={order.ordernumber} _hover={{ bg: "gray.50" }}>
                    <Td>
                      <Text fontWeight="medium" color="blue.600">
                        #{order.orderNo}
                      </Text>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">
                          {order.companyName || "N/A"}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge bg={"blue.100"}>
                        <Text>{order.serviceName || "N/A"}</Text>
                      </Badge>
                    </Td>
                    <Td>
                      <Text textAlign={"center"} fontWeight="medium">
                        {order.quantity || 0}
                      </Text>
                    </Td>
                    <Td>
                      <Text color={"green"} fontWeight="bold">
                        {formatCurrency(order.totalAmount || 0)}
                      </Text>
                    </Td>
                    <Td textAlign="center">
                      <Badge
                        colorScheme={getStatusColor(order.orderStatus)}
                        borderRadius={"full"}
                      >
                        <HStack spacing={1}>
                          <Icon
                            as={getStatusIcon(order.orderStatus)}
                            boxSize={3}
                          />
                          <Text>{order.orderStatus || "Pending"}</Text>
                        </HStack>
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString()
                          : "N/A"}
                      </Text>
                    </Td>
                    {/* <Td>
                      <Text fontSize="sm">{order.vendorName || "N/A"}</Text>
                    </Td> */}
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Icon as={FiEye} boxSize={4} />
                        </Button>
                        {order.orderStatus === "In Progress" && (
                          <HStack>
                            <Button
                              size="sm"
                              colorScheme="green"
                              variant="ghost"
                              onClick={() =>
                                handleStatusUpdate(order.id, "Confirmed")
                              }
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() =>
                                handleStatusUpdate(order.id, "Cancelled")
                              }
                            >
                              Reject
                            </Button>
                          </HStack>
                        )}
                        {order.orderStatus === "Amount Paid" && (
                          <Button
                            size="sm"
                            colorScheme="blue"
                            fontWeight={"bold"}
                            variant="ghost"
                            bg="blue.100"
                            borderRadius="full"
                            _hover={(bg) => {
                              return { bg: "blue.200" };
                            }}
                            leftIcon={<FiPackage />}
                            onClick={() =>
                              handleStatusUpdate(order.id, "Delivered")
                            }
                          >
                            Deliver
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
    </Box>
  );
};

export default Orders;
