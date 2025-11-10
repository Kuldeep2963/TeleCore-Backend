import React, { useState } from 'react';
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
  InputLeftAddon,
  useColorModeValue
} from '@chakra-ui/react';
import { FaWallet, FaCalendar, FaCreditCard } from 'react-icons/fa';

const TopUp = ({ walletBalance = 50.00, onUpdateBalance = () => {} }) => {
  const [topupAmount, setTopupAmount] = useState('');
  const [thresholdBalance, setThresholdBalance] = useState(10.00);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleTopup = () => {
    const amount = parseFloat(topupAmount);
    if (amount > 0) {
      onUpdateBalance(walletBalance + amount);
      setTopupAmount('');
    }
  };

  const handleSetThreshold = (newThreshold) => {
    const threshold = parseFloat(newThreshold);
    if (threshold >= 0) {
      setThresholdBalance(threshold);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      {/* Page Header */}
      <Box>
        <Heading size="lg" color="gray.800" mb={2}>
          TopUp & Balance Management
        </Heading>
        <Text color="gray.600">
          Manage your wallet balance and set spending thresholds
        </Text>
      </Box>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
        {/* TopUp Box */}
        <Card borderRadius="12px" bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={6}>
              <HStack spacing={2} mb={4}>
                <FaWallet color="green" />
                <Text>TopUp Wallet</Text>
              </HStack>
            </Heading>
            
            <VStack spacing={6} align="stretch">
              {/* Current Balance Display */}
              <Box p={4} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontSize="sm" color="gray.600" mb={1}>Current Balance</Text>
                <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                  ${walletBalance.toFixed(2)}
                </Text>
              </Box>

              {/* TopUp Amount Input */}
              <Box>
                <Text fontWeight="semibold" mb={2}>Enter Amount to TopUp</Text>
                <InputGroup>
                  <InputLeftAddon>$</InputLeftAddon>
                  <Input
                    placeholder="Enter amount"
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </InputGroup>
                 {/* TopUp Button */}
              </Box>
                <Button
                
                colorScheme="green"
                size="md"
                leftIcon={<FaCreditCard />}
                onClick={handleTopup}
                isDisabled={!topupAmount || parseFloat(topupAmount) <= 0}
              >
                TopUp Now
              </Button>
              {/* Available Payment Methods */}
              <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                <Text fontWeight="semibold" fontSize="sm" mb={2}>Payment Methods</Text>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm">✓  Credit/Debit Card</Text>
                  <Text fontSize="sm">✓  Paypal</Text>
                  <Text fontSize="sm">✓  Digital Wallets</Text>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Set Threshold Box */}
        <Card borderRadius="12px" bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={6}>
              <HStack spacing={2} mb={4}>
                <FaCalendar color="orange" />
                <Text>Set Threshold Balance</Text>
              </HStack>
            </Heading>
            
            <VStack spacing={6} align="stretch">
              {/* Current Threshold Display */}
              <Box p={4} bg={useColorModeValue('orange.50', 'orange.900')} borderRadius="md" border="1px solid" borderColor="orange.200">
                <Text fontSize="sm" color="gray.600" mb={1}>Current Threshold</Text>
                <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                  ${thresholdBalance.toFixed(2)}
                </Text>
              </Box>

              {/* Threshold Description */}
              <Box p={3} bg={useColorModeValue('yellow.50', 'yellow.900')} borderRadius="md" border="1px solid" borderColor="yellow.200">
                <Text fontSize="sm" color="gray.700">
                  When the balance drops below this limit, you will get an email notification reminding you to top up your account.
                </Text>
              </Box>

              {/* Threshold Amount Input */}
              <Box>
                <Text fontWeight="semibold" mb={2}>Set Threshold Amount</Text>
                <InputGroup>
                  <InputLeftAddon>$</InputLeftAddon>
                  <Input
                    placeholder="Enter threshold amount"
                    type="number"
                    id="thresholdInput"
                    defaultValue={thresholdBalance}
                    min="0"
                    step="0.01"
                  />
                </InputGroup>
              </Box>

              {/* Set Threshold Button */}
              <Button
                colorScheme="orange"
                size="md"
                onClick={() => {
                  const input = document.getElementById('thresholdInput');
                  handleSetThreshold(input.value);
                }}
              >
                Set Threshold
              </Button>

              {/* Quick Set Options */}
              <Box>
                <Text fontWeight="semibold" mb={3}>Quick Set Options</Text>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="orange"
                    onClick={() => handleSetThreshold('5')}
                  >
                    $5
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="orange"
                    onClick={() => handleSetThreshold('10')}
                  >
                    $10
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="orange"
                    onClick={() => handleSetThreshold('20')}
                  >
                    $20
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="orange"
                    onClick={() => handleSetThreshold('50')}
                  >
                    $50
                  </Button>
                </HStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Grid>
    </VStack>
  );
};

export default TopUp;