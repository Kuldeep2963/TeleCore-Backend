import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Heading,
  Grid,
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
} from '@chakra-ui/react';
import {
  FaWallet,
  FaCalendar,
  FaCreditCard,
  FaBell,
  FaDollarSign,
  FaShieldAlt
} from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import {
  RiSecurePaymentFill,
  RiFlashlightFill
} from 'react-icons/ri';
import { SiStripe } from 'react-icons/si';
import walletService from '../../services/walletService';

const TopUp = ({
  userId,
  walletBalance = 50.00,
  onUpdateBalance = () => {},
  refreshTrigger = 0
}) => {
  const [topupAmount, setTopupAmount] = useState('');
  const [thresholdBalance, setThresholdBalance] = useState(10.00); // Default threshold
  const [thresholdInput, setThresholdInput] = useState(10.00); // Temporary input value
  const [selectedPayment, setSelectedPayment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(walletBalance);
  const toast = useToast();



  // Fetch current balance when component mounts or refreshTrigger changes
  useEffect(() => {
    if (userId) {
      fetchCurrentBalance();
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
      console.error('Error fetching balance:', error);
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

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.600');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const secondaryBg = useColorModeValue('gray.50', 'gray.700');

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
        setTopupAmount('');
        setSelectedPayment('');

        toast({
          title: "Top-up successful!",
          description: `$${typeof amount === 'number' ? amount.toFixed(2) : '0.00'} added to your wallet`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(response.message || 'Failed to update wallet');
      }
    } catch (error) {
      console.error('Top-up error:', error);
      toast({
        title: "Top-up failed",
        description: error.response?.data?.message || error.message || "Unable to process top-up",
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
        localStorage.setItem('walletThreshold', threshold.toString());

        setThresholdBalance(threshold);

        toast({
          title: "Threshold updated",
          description: `Notifications will trigger below $${typeof threshold === 'number' ? threshold.toFixed(2) : '10.00'}`,
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error updating threshold:', error);
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
        const threshold = parseFloat(response.data.wallet_threshold) || 10.00;
        setThresholdBalance(threshold);
        setThresholdInput(threshold);
      } else {
        // Fallback to localStorage if no backend threshold
        const savedThreshold = localStorage.getItem('walletThreshold');
        if (savedThreshold) {
          const threshold = parseFloat(savedThreshold) || 10.00;
          setThresholdBalance(threshold);
          setThresholdInput(threshold);
        } else {
          // Default to 10.00 if nothing is saved
          setThresholdBalance(10.00);
          setThresholdInput(10.00);
        }
      }
    } catch (error) {
      console.error('Error loading threshold:', error);
      // Fallback to localStorage
      const savedThreshold = localStorage.getItem('walletThreshold');
      if (savedThreshold) {
        const threshold = parseFloat(savedThreshold) || 10.00;
        setThresholdBalance(threshold);
        setThresholdInput(threshold);
      } else {
        // Default to 10.00 if nothing is saved
        setThresholdBalance(10.00);
        setThresholdInput(10.00);
      }
    }
  };

  const quickAmounts = [10, 25, 50, 100, 200];
  const thresholdOptions = [5, 10, 20, 50];

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: FaCreditCard, color: 'blue' },
    { id: 'stripe', name: 'Stripe', icon: SiStripe, color: 'purple' }
  ];

  const isLowBalance = currentBalance < thresholdBalance;

  return (
    <VStack spacing={6} align="stretch" w={"full"} mx="auto">
      {/* Page Header */}
      <Box textAlign="left">
        <Heading size="lg" bgGradient="linear(to-r, blue.500, purple.500)" bgClip="text" mb={3}>
          Wallet Management
        </Heading>
        <Text fontSize="md" color="gray.600">
          Manage your balance, set up automatic notifications, and keep your account funded
        </Text>
      </Box>

      {isLowBalance && (
        <Alert status="warning" borderRadius="xl" variant="left-accent">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold" color={"red.600"}>Low Balance Alert</Text>
            <HStack>
            
              <Text>Your balance</Text> <Text fontWeight={"bold"}>${typeof currentBalance === 'number' ? currentBalance.toFixed(2) : '0.00'}</Text> <Text>is below your threshold</Text> <Text fontWeight={"bold"}>${typeof thresholdBalance === 'number' ? thresholdBalance.toFixed(2) : '10.00'}</Text>
            
            </HStack>
          </Box>
        </Alert>
      )}

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
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
            <CardBody p={{base:4,md:8}}>
              <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                      CURRENT BALANCE
                    </Text>
                    <Flex align="center">
                      <Heading size="2xl" color={accentColor}>
                        ${typeof currentBalance === 'number' ? currentBalance.toFixed(2) : '0.00'}
                      </Heading>
                    </Flex>
                  </VStack>
                  <Icon as={FaWallet} w={12} h={12} color={accentColor} opacity={0.8} />
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
            borderRadius="2xl" 
            bg={cardBg} 
            border="1px solid" 
            borderColor={borderColor}
            boxShadow="lg"
            w="100%"
          >
            <CardBody p={{base:4,md:8}}>
              <VStack spacing={6} align="stretch">
                <Heading size="md" mb={2}>
                  Add Funds to Wallet
                </Heading>

                {/* Quick Amount Buttons */}
                <Box>
                  <Text fontWeight="medium" mb={3}>Quick Top-up</Text>
                  <SimpleGrid columns={5} gap={{base:3,md:12}}>
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={topupAmount === amount.toString() ? 'solid' : 'outline'}
                        colorScheme="blue"
                        onClick={() => setTopupAmount(amount.toString())}
                        size="sm"
                        isDisabled={isLoading}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </SimpleGrid>
                </Box>

                {/* Custom Amount Input */}
                <Box>
                  <Text fontWeight="medium" mb={3}>Custom Amount</Text>
                  <NumberInput
                    value={topupAmount}
                    onChange={(value) => setTopupAmount(value)}
                    min={1}
                    precision={2}
                    size="lg"
                    isDisabled={isLoading}
                  >
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FaDollarSign color="gray.300" />
                      </InputLeftElement>
                      <NumberInputField pl={10} placeholder="0.00" />
                    </InputGroup>
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Box>

                {/* Payment Methods */}
                <Box>
                  <Text fontWeight="medium" mb={3}>Payment Method</Text>
                  <SimpleGrid columns={{ base: 1, md: 2}} gap={3}>
                    {paymentMethods.map((method) => (
                      <Button
                        key={method.id}
                        variant={selectedPayment === method.id ? 'solid' : 'outline'}
                        colorScheme={method.color}
                        leftIcon={<Icon as={method.icon} />}
                        onClick={() => setSelectedPayment(method.id)}
                        height="auto"
                        py={3}
                        whiteSpace="normal"
                        textAlign="center"
                        isDisabled={isLoading}
                      >
                        {method.name}
                      </Button>
                    ))}
                  </SimpleGrid>
                </Box>

                {/* TopUp Button */}
                <Button
                  colorScheme="blue"
                  size="lg"
                  // height="50px"
                  fontSize="lg"
                  leftIcon={isLoading ? <Spinner size="sm" /> : <RiFlashlightFill />}
                  onClick={handleTopup}
                  isDisabled={!topupAmount || parseFloat(topupAmount) <= 0 || !selectedPayment || isLoading}
                  bgGradient="linear(to-r, blue.500, purple.500)"
                  _hover={{
                    bgGradient: "linear(to-r, blue.600, purple.600)",
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl'
                  }}
                  transition="all 0.2s"
                  isLoading={isLoading}
                  loadingText="Processing..."
                >
                  {isLoading ? 'Processing...' : `Add $${topupAmount || '0.00'} to Wallet`}
                </Button>

                {/* Security Badge */}
                <Flex justify="center" align="center" color="gray.500" fontSize="sm">
                  <Icon as={RiSecurePaymentFill} mr={2} />
                  <Text>Secure payment · Encrypted transaction</Text>
                </Flex>
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* Right Column - Threshold Settings */}
        <VStack spacing={6}>
          {/* Threshold Card */}
          <Card 
            borderRadius="2xl" 
            bg={cardBg} 
            border="1px solid" 
            borderColor={borderColor}
            boxShadow="lg"
            w="100%"
          >
            <CardBody p={{base:4,md:8}}>
              <VStack spacing={6} align="stretch">
                <Flex align="center" justify="space-between">
                  <Heading size="md">Balance Alerts</Heading>
                  <Badge colorScheme={isLowBalance ? 'red' : 'green'} px={2} borderRadius={"full"} fontSize="xs">
                    {isLowBalance ? 'ACTIVE' : 'MONITORING'}
                  </Badge>
                </Flex>

                <Box 
                  p={4} 
                  bg={useColorModeValue('orange.50', 'orange.900')} 
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
                      ${typeof thresholdBalance === 'number' ? thresholdBalance.toFixed(2) : '10.00'}
                    </Text>
                    {thresholdInput !== thresholdBalance && (
                      <Text fontSize="xs" color="orange.600" fontWeight="medium">
                        (Pending update: ${typeof thresholdInput === 'number' ? thresholdInput.toFixed(2) : '10.00'})
                      </Text>
                    )}
                  </VStack>
                </Box>

                {/* Threshold Input */}
                <Box>
                  <Text fontWeight="medium" mb={3}>Set Alert Threshold</Text>
                  <NumberInput
                    value={thresholdInput}
                    onChange={(value) => setThresholdInput(parseFloat(value) || 0)}
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
                  <Text fontWeight="medium" mb={3}>Quick Settings</Text>
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

                {/* Info Text */}
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  You'll receive email notifications when your balance approaches this limit
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Features Card */}
          <Card 
            borderRadius="2xl" 
            bg={cardBg} 
            border="1px solid" 
            borderColor={borderColor}
            boxShadow="lg"
            w="100%"
          >
            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                <Heading size="sm">Wallet Features</Heading>
                < VStack spacing={3} align="start">
                  <Flex align="center">
                    <Icon as={FaShieldAlt} color="green.500" mr={3} />
                    <Text fontSize="sm">Secure transactions</Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={FaBell} color="blue.500" mr={3} />
                    <Text fontSize="sm">Low balance alerts</Text>
                  </Flex>
                  
                  <Flex align="center">
                    <Icon as={RiFlashlightFill} color="purple.500" mr={3} />
                    <Text fontSize="sm">Instant top-ups</Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={FaWallet} color="orange.500" mr={3} />
                    <Text fontSize="sm">Real-time balance updates</Text>
                  </Flex>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Grid>
    </VStack>
  );
};

export default TopUp;