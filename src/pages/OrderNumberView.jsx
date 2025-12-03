import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  HStack,
  Card,
  CardBody,
  Grid,
  GridItem,
  Badge,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import NumberSelection, {
  defaultPricingData,
} from "./OrderNumber/AddNewNumber/NumberSelection";
import api from "../services/api";

function OrderNumberView({ userRole }) {
  const location = useLocation();
  const orderData = location.state?.orderData;
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [allocatedNumbers, setAllocatedNumbers] = useState([]);
  const [newNumber, setNewNumber] = useState("");
  const toast = useToast();

  // Check if this is opened from ProductInfo page
  const isFromProductInfo = orderData?.orderNo?.startsWith("PROD-");

  // Load allocated numbers from database
  useEffect(() => {
    const loadAllocatedNumbers = async () => {
      if (orderData?.id && !isFromProductInfo) {
        try {
          const response = await api.numbers.getByOrder(orderData.id);
          if (response.success) {
            // Transform database numbers to match frontend format
            const transformedNumbers = response.data.map((num) => ({
              id: num.id,
              number: num.number,
              allocatedAt: num.created_at,
              status: num.status,
            }));
            setAllocatedNumbers(transformedNumbers);
          }
        } catch (error) {
          console.error("Error loading allocated numbers:", error);
        }
      }
    };

    loadAllocatedNumbers();
  }, [orderData?.id, isFromProductInfo]);

  // Check if order status shows allocated numbers box
  const showAllocatedNumbers = ["amount paid", "delivered"].includes(
    orderData?.orderStatus?.toLowerCase()
  );

  // Check if allocated numbers are editable
  const canEditAllocatedNumbers =
    userRole === "Internal" &&
    orderData?.orderStatus?.toLowerCase() === "amount paid";

  // Add allocated number
  const handleAddAllocatedNumber = async () => {
    if (!canEditAllocatedNumbers) {
      toast({
        title: "Access Denied",
        description:
          'Only internal users can add numbers when order status is "Amount Paid"',
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!newNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const numberData = {
        orderId: orderData.id,
        number: newNumber.trim(),
        countryId: orderData.countryId, // Need to get this from order data
        productId: orderData.productId, // Need to get this from order data
        areaCode: orderData.areaCode,
      };

      const response = await api.numbers.create(numberData);
      if (response.success) {
        // Add the new number to local state
        const newNumberObj = {
          id: response.data.id,
          number: response.data.number,
          allocatedAt: response.data.created_at,
          status: response.data.status,
        };

        setAllocatedNumbers((prev) => [...prev, newNumberObj]);
        setNewNumber("");

        toast({
          title: "Number Added",
          description: "Phone number allocated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error adding allocated number:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to allocate number",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Remove allocated number
  const handleRemoveAllocatedNumber = async (id) => {
    if (!canEditAllocatedNumbers) {
      toast({
        title: "Access Denied",
        description:
          'Only internal users can remove numbers when order status is "Amount Paid"',
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await api.numbers.delete(id);
      if (response.success) {
        setAllocatedNumbers((prev) => prev.filter((num) => num.id !== id));

        toast({
          title: "Number Removed",
          description: "Phone number removed successfully",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error removing allocated number:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove number",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // If no order data is provided, show error or redirect
  if (!orderData) {
    return (
      <Box
        flex={1}
        p={6}
        bg="#f8f9fa"
        height="calc(100vh - 76px)"
        overflowY="auto"
      >
        <VStack spacing={6} align="stretch">
          <Heading color="#1a3a52" fontSize="3xl" fontWeight="bold">
            Order Not Found
          </Heading>
          <Text>No order data provided.</Text>
        </VStack>
      </Box>
    );
  }

  // Transform order data to match NumberSelection component's expected formData format
  const formData = {
    country: orderData.country || "United States (+1)", // Use full country name
    productType: orderData.productType?.toLowerCase() || "did",
    serviceName: orderData.serviceName?.toLowerCase() || "voice",
    areaCode: orderData.areaCode?.split(" ")[0] || "800", // Extract area code from "Toll Free (800)"
    quantity: orderData.quantity || 1,
  };

  // Transform pricing data to match NumberSelection expected format
  const transformPricingData = (rawPricing) => {
    if (!rawPricing) return {};
    return {
      nrc: rawPricing.nrc ? `$${parseFloat(rawPricing.nrc).toFixed(4)}` : "",
      mrc: rawPricing.mrc ? `$${parseFloat(rawPricing.mrc).toFixed(4)}` : "",
      ppm: rawPricing.ppm ? `$${parseFloat(rawPricing.ppm).toFixed(4)}` : "",
      ppmFix: rawPricing.ppm_fix
        ? `$${parseFloat(rawPricing.ppm_fix).toFixed(4)}`
        : "",
      ppmMobile: rawPricing.ppm_mobile
        ? `$${parseFloat(rawPricing.ppm_mobile).toFixed(4)}`
        : "",
      ppmPayphone: rawPricing.ppm_payphone
        ? `$${parseFloat(rawPricing.ppm_payphone).toFixed(4)}`
        : "",
      arc: rawPricing.arc ? `$${parseFloat(rawPricing.arc).toFixed(4)}` : "",
      mo: rawPricing.mo ? `$${parseFloat(rawPricing.mo).toFixed(4)}` : "",
      mt: rawPricing.mt ? `$${parseFloat(rawPricing.mt).toFixed(4)}` : "",
      Incomingppm: rawPricing.incoming_ppm
        ? `$${parseFloat(rawPricing.incoming_ppm).toFixed(4)}`
        : "",
      Outgoingppmfix: rawPricing.outgoing_ppm_fix
        ? `$${parseFloat(rawPricing.outgoing_ppm_fix).toFixed(4)}`
        : "",
      Outgoingppmmobile: rawPricing.outgoing_ppm_mobile
        ? `$${parseFloat(rawPricing.outgoing_ppm_mobile).toFixed(4)}`
        : "",
      incmongsms: rawPricing.incoming_sms
        ? `$${parseFloat(rawPricing.incoming_sms).toFixed(4)}`
        : "",
      outgoingsms: rawPricing.outgoing_sms
        ? `$${parseFloat(rawPricing.outgoing_sms).toFixed(4)}`
        : "",
      billingPulse: rawPricing.billing_pulse || "",
      estimatedLeadTime: rawPricing.estimated_lead_time || "",
      contractTerm: rawPricing.contract_term || "",
      disconnectionNoticeTerm: rawPricing.disconnection_notice_term || "",
    };
  };

  // For base pricing, let NumberSelection fetch from pricing_plans
  const pricingData = {
    ...defaultPricingData,
    // Don't include orderData.pricing here - let it fetch general pricing
  };

  // For desired pricing, use order-specific pricing from order_pricing table
  const desiredPricingData = transformPricingData(orderData.pricing);

  const handleNumberSelectionChange = (selection) => {
    setSelectedNumbers(selection.selectedIds || []);
  };

  const handleConfigure = (numbers) => {
    // Handle configure action - could navigate to next step or show modal
    console.log("Configure clicked with numbers:", numbers);
  };

  return (
    <Box
      flex={1}
      p={6}
      bg="#f8f9fa"
      height="calc(100vh - 76px)"
      overflowY="auto"
    >
      <VStack spacing={6} align="stretch">
        <HStack spacing={4} align="center">
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            colorScheme="blue"
            onClick={() => window.history.back()}
          >
            {isFromProductInfo ? "Back to Products" : "Back to Orders"}
          </Button>
          <Heading color="#1a3a52" fontSize="3xl" fontWeight="bold">
            {isFromProductInfo ? "Product Details" : "Order Details"} -{" "}
            {orderData.orderNo}
          </Heading>
        </HStack>

        {/* Order/Product Details Box */}
        <Card
          bg="white"
          borderRadius="12px"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <CardBody p={6}>
            <Heading size="md" color="gray.800" mb={4}>
              {isFromProductInfo ? "Basic Information" : "Order Information"}
            </Heading>
            {isFromProductInfo ? (
              // Product Information Layout
              <Grid
                templateColumns="repeat(5, 1fr)"
                gap={4}
                alignItems="center"
              >
                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Product Type
                    </Text>
                    <Badge bg={"blue.100"}>
                      <Text fontSize="sm" fontWeight="semibold">
                        {orderData.productType}
                      </Text>
                    </Badge>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Region
                    </Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">
                      {orderData.region}
                    </Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Country
                    </Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">
                      {orderData.country}
                    </Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Estimated Delivery Time
                    </Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">
                      {orderData.edt}
                    </Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Area Code
                    </Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">
                      {orderData.areaCode}
                    </Text>
                  </VStack>
                </GridItem>
              </Grid>
            ) : (
              // Order Information Layout
              <Grid
                templateColumns="repeat(7, 1fr)"
                gap={4}
                alignItems="center"
              >
                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Service Name
                    </Text>
                    <Badge bg="blue.100" borderRadius={"full"} px={2} py={0}>
                      <Text fontSize="sm" color="gray.800" fontWeight="bold">
                        {orderData.serviceName}
                      </Text>
                    </Badge>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Country
                    </Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">
                      {orderData.country}
                    </Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Product Type
                    </Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">
                      {orderData.productType}
                    </Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Area Code
                    </Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">
                      {orderData.areaCode}
                    </Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Order Status
                    </Text>
                    <Badge
                      colorScheme={
                        orderData.orderStatus?.toLowerCase() === "delivered"
                          ? "green"
                          : orderData.orderStatus?.toLowerCase() === "confirmed"
                          ? "blue"
                          : orderData.orderStatus?.toLowerCase() === "cancelled"
                          ? "red"
                          : orderData.orderStatus?.toLowerCase() ===
                            "in progress"
                          ? "yellow"
                          : orderData.orderStatus?.toLowerCase() ===
                            "amount paid"
                          ? "purple"
                          : "gray"
                      }
                      fontSize="sm"
                      borderRadius={"full"}
                      px={2}
                      py={0}
                    >
                      {orderData.orderStatus}
                    </Badge>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Order Date
                    </Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">
                      {orderData.orderDate.split("T")[0]}
                    </Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Created By
                    </Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">
                      {orderData.createdBy}
                    </Text>
                  </VStack>
                </GridItem>
              </Grid>
            )}
          </CardBody>
        </Card>

        {/* Allocated Numbers Box - Only show for Amount Paid or Delivered status */}
        {showAllocatedNumbers && (
          <Card
            bg="white"
            borderRadius="12px"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <CardBody p={6}>
              <HStack justify="space-between" align="start" mb={4}>
                <VStack align="start" spacing={0}>
                  <Heading size="md" color="gray.800">
                    Allocated Numbers
                    {!canEditAllocatedNumbers && (
                      <Badge
                        ml={2}
                        colorScheme="gray"
                        fontSize="xs"
                        verticalAlign="middle"
                      >
                        Read Only
                      </Badge>
                    )}
                  </Heading>
                </VStack>
                <HStack
                  px={3}
                  border={"1px solid gray"}
                  borderRadius={"full"}
                  bg={"blue.50"}
                  spacing={8}
                >
                  <HStack spacing={2} align="center">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Allocated
                    </Text>
                    <Text fontSize="2xl" color="blue.600" fontWeight="bold">
                      {allocatedNumbers.length}
                    </Text>
                  </HStack>
                  <HStack spacing={2} align="center">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Needed
                    </Text>
                    <Text fontSize="2xl" color="green.600" fontWeight="bold">
                      {orderData.quantity}
                    </Text>
                  </HStack>
                  {allocatedNumbers.length < orderData.quantity && (
                    <HStack spacing={2} align="center">
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Pending
                      </Text>
                      <Text fontSize="2xl" color="orange.600" fontWeight="bold">
                        {orderData.quantity - allocatedNumbers.length}
                      </Text>
                    </HStack>
                  )}
                </HStack>
              </HStack>

              {/* Add Number Input - Only show when editable */}
              {canEditAllocatedNumbers && (
                <HStack mb={4} spacing={3}>
                  <Input
                    placeholder="Enter the number (e.g., +1 234 567 8900)"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddAllocatedNumber();
                      }
                    }}
                    size="md"
                  />
                  <IconButton
                    borderRadius="full"
                    aria-label="Add number"
                    icon={<FaPlus />}
                    colorScheme="green"
                    onClick={handleAddAllocatedNumber}
                  />
                </HStack>
              )}

              {/* Allocated Numbers Table */}
              {allocatedNumbers.length > 0 ? (
                <Box
                  overflow="hidden"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Table variant="simple">
                    <Thead bg="gray.300">
                      <Tr>
                        <Th color="gray.800">No.</Th>
                        <Th color="gray.800">Phone Number</Th>
                        <Th color="gray.800">Status</Th>
                        <Th color="gray.800">Allocated Date</Th>
                        {canEditAllocatedNumbers && (
                          <Th color="gray.800">Actions</Th>
                        )}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {allocatedNumbers.map((number, index) => (
                        <Tr key={number.id}>
                          <Td fontWeight="medium">{index + 1}</Td>
                          <Td fontWeight="semibold" color="blue.600">
                            {number.number}
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                number.status === "Active" ? "green" : "gray"
                              }
                              borderRadius="full"
                              px={2}
                              py={1}
                            >
                              {number.status}
                            </Badge>
                          </Td>
                          <Td>
                            {new Date(number.allocatedAt).toLocaleDateString()}
                          </Td>
                          {canEditAllocatedNumbers && (
                            <Td>
                              <IconButton
                                aria-label="Remove number"
                                icon={<FaTrash />}
                                variant="ghost"
                                colorScheme="red"
                                size="sm"
                                onClick={() =>
                                  handleRemoveAllocatedNumber(number.id)
                                }
                              />
                            </Td>
                          )}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Box
                  border="2px dashed"
                  borderColor="gray.300"
                  borderRadius="md"
                  p={4}
                  textAlign="center"
                  bg="gray.50"
                >
                  <Text color="gray.500" fontSize="md">
                    {canEditAllocatedNumbers
                      ? "No numbers allocated yet. Add a phone number above."
                      : "No numbers allocated yet."}
                  </Text>
                </Box>
              )}
            </CardBody>
          </Card>
        )}

        <NumberSelection
          formData={formData}
          onNumberSelectionChange={handleNumberSelectionChange}
          onConfigure={handleConfigure}
          showConfigureButton={false}
          pricingData={pricingData}
          desiredPricingData={isFromProductInfo ? {} : desiredPricingData}
          orderStatus={orderData.orderStatus}
          readOnly
          userRole={userRole}
          documents={orderData.documents}
          orderId={orderData.id}
          hideDesiredPricing={isFromProductInfo}
        />
      </VStack>
    </Box>
  );
}

export default OrderNumberView;
