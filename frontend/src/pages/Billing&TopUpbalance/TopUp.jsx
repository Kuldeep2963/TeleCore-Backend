import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Heading,
  Grid,
  Wrap,
  WrapItem,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Progress,
  Icon,
  Flex,
  SimpleGrid,
  useToast,
  Badge,
  Alert,
  AlertIcon,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Center,
} from "@chakra-ui/react";
import {
  FaWallet,
  FaCalendar,
  FaCreditCard,
  FaBell,
  FaDollarSign,
  FaShieldAlt,
  FaArrowDown,
  FaArrowUp,
  FaUndoAlt,
  FaFile,
} from "react-icons/fa";
import { FiFile, FiRefreshCw } from "react-icons/fi";
import { RiSecurePaymentFill, RiFlashlightFill } from "react-icons/ri";
import { SiStripe } from "react-icons/si";
import walletService from "../../services/walletService";
import api from "../../services/api";

const TopUp = ({
  userId,
  walletBalance = 50.0,
  onUpdateBalance = () => {},
  refreshTrigger = 0,
}) => {
  const [topupAmount, setTopupAmount] = useState("");
  const [thresholdBalance, setThresholdBalance] = useState(10.0);
  const [thresholdInput, setThresholdInput] = useState(10.0);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(walletBalance);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const toast = useToast();

  const fetchTransactions = async () => {
    if (!userId) return;

    try {
      setLoadingTransactions(true);
      const response = await api.wallet.getTransactions(userId);
      if (response.success) {
        setTransactions(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error fetching transactions",
        description: "Unable to load transaction history",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCurrentBalance();
      fetchTransactions();
    }
  }, [userId, refreshTrigger]);

  // Update local balance when prop changes
  useEffect(() => {
    setCurrentBalance(walletBalance);
  }, [walletBalance]);

  const fetchCurrentBalance = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await walletService.getUserProfile(userId);
      if (response.success) {
        setCurrentBalance(response.data.wallet_balance || 0);
        onUpdateBalance(response.data.wallet_balance || 0);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast({
        title: "Error fetching balance",
        description: "Unable to load current wallet balance",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.600");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const secondaryBg = useColorModeValue("gray.50", "gray.700");

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount) || 0;

    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid top-up amount",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedPayment) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement real payment processing here (Stripe, PayPal, etc.)
      // For now, directly update wallet balance (demo/development mode)

      // Update wallet balance in backend
      const response = await walletService.updateWalletBalance(
        userId,
        amount,
        `Top-up via ${selectedPayment}`
      );

      if (response.success) {
        const newBalance = response.data.newBalance;
        setCurrentBalance(newBalance);
        onUpdateBalance(newBalance);
        setTopupAmount("");
        setSelectedPayment("");
        fetchTransactions();

        toast({
          title: "Top-up successful!",
          description: `$${
            typeof amount === "number" ? amount.toFixed(4) : "0.00"
          } added to your wallet`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(response.message || "Failed to update wallet");
      }
    } catch (error) {
      console.error("Top-up error:", error);
      toast({
        title: "Top-up failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "Unable to process top-up",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetThreshold = async (newThreshold) => {
    const threshold = parseFloat(newThreshold) || 0;
    if (threshold >= 0) {
      try {
        // Save threshold to backend
        if (userId) {
          await walletService.updateWalletThreshold(userId, threshold);
        }

        // Also save to localStorage as fallback
        localStorage.setItem("walletThreshold", threshold.toString());

        setThresholdBalance(threshold);

        toast({
          title: "Threshold updated",
          description: `Notifications will trigger below $${
            typeof threshold === "number" ? threshold.toFixed(4) : "10.00"
          }`,
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error updating threshold:", error);
        toast({
          title: "Error updating threshold",
          description: "Unable to save threshold setting",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Load threshold from backend on component mount
  useEffect(() => {
    if (userId) {
      loadUserThreshold();
    }
  }, [userId]);

  const loadUserThreshold = async () => {
    if (!userId) return;

    try {
      const response = await walletService.getUserProfile(userId);
      if (response.success && response.data.wallet_threshold !== null) {
        const threshold = parseFloat(response.data.wallet_threshold) || 10.0;
        setThresholdBalance(threshold);
        setThresholdInput(threshold);
      } else {
        // Fallback to localStorage if no backend threshold
        const savedThreshold = localStorage.getItem("walletThreshold");
        if (savedThreshold) {
          const threshold = parseFloat(savedThreshold) || 10.0;
          setThresholdBalance(threshold);
          setThresholdInput(threshold);
        } else {
          // Default to 10.00 if nothing is saved
          setThresholdBalance(10.0);
          setThresholdInput(10.0);
        }
      }
    } catch (error) {
      console.error("Error loading threshold:", error);
      // Fallback to localStorage
      const savedThreshold = localStorage.getItem("walletThreshold");
      if (savedThreshold) {
        const threshold = parseFloat(savedThreshold) || 10.0;
        setThresholdBalance(threshold);
        setThresholdInput(threshold);
      } else {
        // Default to 10.00 if nothing is saved
        setThresholdBalance(10.0);
        setThresholdInput(10.0);
      }
    }
  };

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "credit":
        return FaArrowDown;
      case "debit":
        return FaArrowUp;
      case "refund":
        return FaUndoAlt;
      default:
        return FaWallet;
    }
  };

  const getTransactionColor = (type) => {
    switch (type?.toLowerCase()) {
      case "credit":
        return "green";
      case "debit":
        return "red";
      case "refund":
        return "orange";
      default:
        return "blue";
    }
  };

  const getTransactionBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "credit":
        return "green.100";
      case "debit":
        return "red.100";
      case "refund":
        return "orange.100";
      default:
        return "blue.100";
    }
  };

  const getTransactionIconColor = (type) => {
    switch (type?.toLowerCase()) {
      case "credit":
        return "green.600";
      case "debit":
        return "red.600";
      case "refund":
        return "orange.600";
      default:
        return "blue.600";
    }
  };

  const formatTransactionDescription = (description) => {
    if (!description) return "Transaction";
    return description.replace(/_/g, " ");
  };

  const quickAmounts = [10, 25, 50, 100, 200];
  const thresholdOptions = [5, 10, 20, 50];

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: FaCreditCard,
      color: "blue",
    },
    { id: "stripe", name: "Stripe", icon: SiStripe, color: "purple" },
  ];

  const isLowBalance = currentBalance < thresholdBalance;

  return (
    <VStack spacing={6} align="stretch" w={"full"} mx="auto">
      {/* Page Header */}
      <Box textAlign="left">
        <Heading
          size="lg"
          bgGradient="linear(to-r, blue.500, purple.500)"
          bgClip="text"
          mb={3}
        >
          Wallet Management
        </Heading>
        <Text fontSize="md" color="gray.600">
          Manage your balance, set up automatic notifications, and keep your
          account funded
        </Text>
      </Box>

      {isLowBalance && (
        <Alert status="warning" borderRadius="xl" variant="left-accent">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold" color={"red.600"}>
              Low Balance Alert
            </Text>
            <HStack>
              <Text>Your balance</Text>{" "}
              <Text fontWeight={"bold"}>
                $
                {typeof currentBalance === "number"
                  ? currentBalance.toFixed(4)
                  : "0.00"}
              </Text>{" "}
              <Text>is below your threshold</Text>{" "}
              <Text fontWeight={"bold"}>
                $
                {typeof thresholdBalance === "number"
                  ? thresholdBalance.toFixed(4)
                  : "10.00"}
              </Text>
            </HStack>
          </Box>
        </Alert>
      )}

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        {/* Left Column - TopUp & Payment */}
        <VStack spacing={6}>
          {/* Balance Overview Card */}
          <Card
            borderRadius="2xl"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            boxShadow="lg"
            w="100%"
          >
            <CardBody p={{ base: 4, md: 6 }}>
              <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                      CURRENT BALANCE
                    </Text>
                    <Flex align="center">
                      <Heading size="xl" color={accentColor}>
                        $
                        {typeof currentBalance === "number"
                          ? currentBalance.toFixed(4)
                          : "0.00"}
                      </Heading>
                    </Flex>
                  </VStack>
                  <Icon
                    as={FaWallet}
                    w={8}
                    h={8}
                    color={accentColor}
                    opacity={0.8}
                  />
                </Flex>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchCurrentBalance}
                  isLoading={isLoading}
                  loadingText="Refreshing"
                  leftIcon={<FiRefreshCw />}
                  alignSelf="flex-start"
                >
                  Refresh Balance
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* TopUp Card */}
          <Card
            borderRadius="xl"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            boxShadow="lg"
            w="100%"
          >
            <CardBody p={{ base: 4, md: 6 }}>
              <Heading size="md" mb={4}>
                Add Funds
              </Heading>

              <SimpleGrid
                columns={{ base: 1, md: 2 }}
                gap={6}
                alignItems="start"
              >
                {/* Left Column */}
                <VStack spacing={4} align="stretch">
                  {/* Quick Amounts */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Quick Top-up
                    </Text>
                    <Wrap spacing={2}>
                      {quickAmounts.map((amount) => (
                        <WrapItem key={amount}>
                          <Button
                            variant={
                              topupAmount === amount.toString()
                                ? "solid"
                                : "outline"
                            }
                            colorScheme="blue"
                            onClick={() => setTopupAmount(amount.toString())}
                            size="sm"
                            minW="60px"
                            h={8}
                            fontSize="sm"
                            isDisabled={isLoading}
                          >
                            ${amount}
                          </Button>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>

                  {/* Custom Amount */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Custom Amount
                    </Text>
                    <NumberInput
                      value={topupAmount}
                      onChange={setTopupAmount}
                      min={1}
                      precision={2}
                      size="md"
                      isDisabled={isLoading}
                    >
                      <NumberInputField h={10} fontSize="sm" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                </VStack>

                {/* Right Column */}
                <VStack spacing={4} align="stretch">
                  {/* Payment Methods */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Payment Method
                    </Text>
                    <VStack spacing={2}>
                      {paymentMethods.map((method) => (
                        <Button
                          key={method.id}
                          variant={
                            selectedPayment === method.id ? "solid" : "outline"
                          }
                          colorScheme={method.color}
                          leftIcon={<Icon as={method.icon} boxSize={4} />}
                          onClick={() => setSelectedPayment(method.id)}
                          size="sm"
                          w="full"
                          h={10}
                          fontSize="sm"
                          justifyContent="flex-start"
                          isDisabled={isLoading}
                        >
                          {method.name}
                        </Button>
                      ))}
                    </VStack>
                  </Box>

                  {/* TopUp Button */}
                  <Button
                    colorScheme="blue"
                    size="md"
                    h={12}
                    mt={4}
                    fontSize="md"
                    leftIcon={
                      isLoading ? <Spinner size="sm" /> : <RiFlashlightFill />
                    }
                    onClick={handleTopup}
                    isDisabled={
                      !topupAmount ||
                      parseFloat(topupAmount) <= 0 ||
                      !selectedPayment ||
                      isLoading
                    }
                    isLoading={isLoading}
                    loadingText="Processing..."
                    bgGradient="linear(to-r, blue.500, purple.500)"
                    _hover={{
                      bgGradient: "linear(to-r, blue.600, purple.600)",
                    }}
                  >
                    {isLoading
                      ? "Processing..."
                      : `Add $${topupAmount} to Wallet`}
                  </Button>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>

        {/* Right Column - Threshold Settings */}
        <VStack spacing={5}>
          {/* Threshold Card */}
          <Card
            borderRadius="2xl"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            boxShadow="lg"
            w="100%"
          >
            <CardBody p={{ base: 4, md: 6 }}>
              <VStack spacing={6} align="stretch">
                <Flex align="center" justify="space-between">
                  <Heading size="md">Balance Alerts</Heading>
                  <Badge
                    colorScheme={isLowBalance ? "red" : "green"}
                    px={2}
                    borderRadius={"full"}
                    fontSize="xs"
                  >
                    {isLowBalance ? "ACTIVE" : "MONITORING"}
                  </Badge>
                </Flex>

                <Box
                  p={4}
                  bg={useColorModeValue("orange.50", "orange.900")}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="orange.200"
                >
                  <VStack align="center" spacing={2}>
                    <Icon as={FaBell} w={6} h={6} color="orange.500" />
                    <Text fontSize="sm" textAlign="center" fontWeight="medium">
                      Notify me when balance drops below
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                      $
                      {typeof thresholdBalance === "number"
                        ? thresholdBalance.toFixed(4)
                        : "10.00"}
                    </Text>
                    {thresholdInput !== thresholdBalance && (
                      <Text
                        fontSize="xs"
                        color="orange.600"
                        fontWeight="medium"
                      >
                        (Pending update: $
                        {typeof thresholdInput === "number"
                          ? thresholdInput.toFixed(4)
                          : "10.00"}
                        )
                      </Text>
                    )}
                  </VStack>
                </Box>

                {/* Threshold Input */}
                <Box>
                  <Text fontWeight="medium" mb={3}>
                    Set Alert Threshold
                  </Text>
                  <NumberInput
                    value={thresholdInput}
                    onChange={(value) =>
                      setThresholdInput(parseFloat(value) || 0)
                    }
                    min={0}
                    precision={2}
                    size="md"
                    isDisabled={isLoading}
                  >
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FaDollarSign color="gray.300" />
                      </InputLeftElement>
                      <NumberInputField pl={10} />
                    </InputGroup>
                  </NumberInput>
                </Box>

                {/* Quick Threshold Buttons */}
                <Box>
                  <Text fontWeight="medium" mb={3}>
                    Quick Settings
                  </Text>
                  <SimpleGrid columns={4} gap={3}>
                    {thresholdOptions.map((amount) => (
                      <Button
                        key={amount}
                        size="sm"
                        variant="outline"
                        colorScheme="orange"
                        onClick={() => setThresholdInput(amount)}
                        isDisabled={isLoading}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </SimpleGrid>
                </Box>

                {/* Set Threshold Button */}
                <Button
                  colorScheme="orange"
                  variant="outline"
                  leftIcon={<FaBell />}
                  onClick={() => handleSetThreshold(thresholdInput)}
                  isDisabled={isLoading || thresholdInput === thresholdBalance}
                >
                  Update Alert
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Grid>

      <Card
        borderRadius="2xl"
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="lg"
        w="100%"
      >
        <CardBody p={{ base: 4, md: 6 }}>
          <VStack spacing={6} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="md">Transaction History</Heading>
              <Button
                variant="outline"
                borderRadius={"full"}
                size="sm"
                onClick={fetchTransactions}
                isLoading={loadingTransactions}
                loadingText="Refreshing"
                leftIcon={<FiRefreshCw />}
              >
                Refresh
              </Button>
            </Flex>

            {loadingTransactions ? (
              <Center py={8}>
                <Spinner size="lg" color="blue.500" />
              </Center>
            ) : transactions.length > 0 ? (
              <Box
                borderRadius="lg"
                border="1px solid"
                borderColor={useColorModeValue("gray.200", "gray.700")}
                overflow="hidden"
              >
                <TableContainer maxH="500px" overflowY="auto">
                  <Table
                    variant="simple"
                    size="md"
                    sx={{
                      "& thead th": {
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        bg: useColorModeValue("gray.100", "gray.700"),
                        boxShadow:
                          "0 1px 0 " +
                          useColorModeValue("gray.300", "gray.600"),
                      },
                    }}
                  >
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>Type</Th>
                        <Th>Description</Th>
                        <Th isNumeric>Amount</Th>
                        <Th isNumeric>Balance Before</Th>
                        <Th isNumeric>Balance After</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {transactions.map((transaction) => (
                        <Tr key={transaction.id} _hover={{ bg: secondaryBg }}>
                          <Td
                            fontSize="sm"
                            fontWeight={"semibold"}
                            color="gray.600"
                          >
                            <Box>
                              {new Date(
                                transaction.created_at
                              ).toLocaleDateString()}
                              <Text fontSize="xs" color="gray.500" mt={1}>
                                {new Date(
                                  transaction.created_at
                                ).toLocaleTimeString()}
                              </Text>
                            </Box>
                          </Td>
                          <Td>
                            <Badge
                              display="inline-flex"
                              alignItems="center"
                              gap={1}
                              bg={getTransactionBadgeColor(
                                transaction.transaction_type
                              )}
                              color={getTransactionIconColor(
                                transaction.transaction_type
                              )}
                              px={2}
                              py={0.5}
                              borderRadius="full"
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              <Icon
                                as={getTransactionIcon(
                                  transaction.transaction_type
                                )}
                                boxSize={2.5}
                              />
                              {transaction.transaction_type}
                            </Badge>
                          </Td>
                          <Td fontSize="sm" maxW="250px">
                            <Text
                              noOfLines={1}
                              title={formatTransactionDescription(
                                transaction.description
                              )}
                            >
                              {formatTransactionDescription(
                                transaction.description
                              )}
                            </Text>
                          </Td>
                          <Td isNumeric fontWeight="bold" fontSize="sm">
                            <Text
                              color={
                                transaction.transaction_type?.toLowerCase() ===
                                "debit"
                                  ? "red.600"
                                  : "green.600"
                              }
                            >
                              {transaction.transaction_type?.toLowerCase() ===
                              "debit"
                                ? "-"
                                : "+"}
                              ${parseFloat(transaction.amount).toFixed(4)}
                            </Text>
                          </Td>
                          <Td isNumeric fontSize="sm" color="gray.600">
                            ${parseFloat(transaction.balance_before).toFixed(4)}
                          </Td>
                          <Td isNumeric fontWeight="bold" fontSize="sm">
                            <Text
                              color={
                                parseFloat(transaction.balance_after) >=
                                thresholdBalance
                                  ? "green.600"
                                  : "orange.600"
                              }
                            >
                              $
                              {parseFloat(transaction.balance_after).toFixed(4)}
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Center py={8}>
                <VStack spacing={2}>
                  <Icon as={FaWallet} boxSize={8} color="gray.300" />
                  <Text color="gray.500" fontWeight="medium">
                    No transactions yet
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Your transaction history will appear here
                  </Text>
                </VStack>
              </Center>
            )}

            {transactions.length > 0 && (
              <Box pt={4} borderTop="1px solid" borderColor={borderColor}>
                <Flex justify="space-between" fontSize="sm" color="gray.600">
                  <Text>
                    Total Transactions:{" "}
                    <Text as="span" fontWeight="bold" color="gray.800">
                      {transactions.length}
                    </Text>
                  </Text>
                  <Text>
                    Total Credits:{" "}
                    <Text as="span" fontWeight="bold" color="green.600">
                      $
                      {transactions
                        .filter(
                          (t) => t.transaction_type?.toLowerCase() === "credit"
                        )
                        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                        .toFixed(4)}
                    </Text>
                  </Text>
                  <Text>
                    Total Debits:{" "}
                    <Text as="span" fontWeight="bold" color="red.600">
                      $
                      {transactions
                        .filter(
                          (t) => t.transaction_type?.toLowerCase() === "debit"
                        )
                        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                        .toFixed(4)}
                    </Text>
                  </Text>
                </Flex>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default TopUp;
