import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Radio,
  RadioGroup,
  Stack,
  Icon,
  HStack,
  Box,
  Divider,
  Badge,
  useToast
} from '@chakra-ui/react';
import { FiCreditCard, FiDollarSign, FiShield } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { SiStripe } from 'react-icons/si';

import api from '../services/api';

const PaymentModal = ({ isOpen, onClose, amount, onConfirm, title, loading }) => {
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [walletBalance, setWalletBalance] = useState(null);
  const [fetchingBalance, setFetchingBalance] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchWalletBalance();
    }
  }, [isOpen]);

  const fetchWalletBalance = async () => {
    try {
      setFetchingBalance(true);
      const response = await api.auth.getProfile();
      if (response.success) {
        setWalletBalance(parseFloat(response.data.walletBalance));
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    } finally {
      setFetchingBalance(false);
    }
  };

  const handleConfirm = () => {
    if (paymentMethod === 'wallet') {
      if (walletBalance !== null && walletBalance < amount) {
        toast({
          title: 'Insufficient Balance',
          description: 'Please top up your wallet or choose another payment method.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      onConfirm(paymentMethod);
    } else {
      toast({
        title: 'Coming Soon',
        description: 'This payment method is currently unavailable.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{base:"sm",md:"md"}} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl">
        <ModalHeader bgGradient="linear(to-r, blue.500, blue.600)" color="white" borderTopRadius="xl">
          {title || 'Select Payment Method'}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            <Box textAlign="center" py={2}>
              <Text color="gray.500" fontSize="sm" mb={1}>Total Amount to Pay</Text>
              <Text fontSize="3xl" fontWeight="bold" color="green.500">
                ${parseFloat(amount).toFixed(4)}
              </Text>
            </Box>

            <Divider />

            <Text fontWeight="semibold" color="gray.700">Choose Payment Method</Text>
            
            <RadioGroup onChange={setPaymentMethod} value={paymentMethod}>
              <Stack spacing={4}>
                <Box 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  p={4} 
                  borderColor={paymentMethod === 'wallet' ? 'blue.500' : 'gray.200'}
                  bg={paymentMethod === 'wallet' ? 'blue.50' : 'white'}
                  cursor="pointer"
                  onClick={() => setPaymentMethod('wallet')}
                  transition="all 0.2s"
                  _hover={{ borderColor: 'blue.300' }}
                >
                  <Radio value="wallet" colorScheme="blue" w="full">
                    <HStack spacing={3} ml={2} w="full">
                      <Box p={2} bg="blue.100" borderRadius="full" color="blue.600">
                        <Icon as={FaWallet} boxSize={5} />
                      </Box>
                      <Box flex={1}>
                        <Text fontWeight="bold" color="gray.800">My Wallet</Text>
                        <Text fontSize="sm" color="gray.500">
                          Balance: {fetchingBalance ? '...' : `$${(walletBalance || 0).toFixed(4)}`}
                        </Text>
                      </Box>
                      {walletBalance !== null && walletBalance < amount && (
                        <Badge colorScheme="red">Insufficient</Badge>
                      )}
                    </HStack>
                  </Radio>
                </Box>

                <Box 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  p={4} 
                  borderColor={paymentMethod === 'card' ? 'blue.500' : 'gray.200'}
                  bg={paymentMethod === 'card' ? 'blue.50' : 'white'}
                  cursor="pointer"
                  onClick={() => setPaymentMethod('card')}
                  transition="all 0.2s"
                  _hover={{ borderColor: 'blue.300' }}
                  opacity={0.7}
                >
                  <Radio value="card" colorScheme="blue" w="full">
                    <HStack spacing={3} ml={2}>
                      <Box p={2} bg="purple.100" borderRadius="full" color="purple.600">
                        <Icon as={FiCreditCard} boxSize={5} />
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.800">Credit / Debit Card</Text>
                        <Text fontSize="sm" color="gray.500">Visa, Mastercard, Amex</Text>
                      </Box>
                      <Badge ml={6} colorScheme="green" px={2} borderRadius={"full"}>Coming Soon</Badge>
                    </HStack>
                  </Radio>
                </Box>

                <Box 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  p={4} 
                  borderColor={paymentMethod === 'Stripe' ? 'blue.500' : 'gray.200'}
                  bg={paymentMethod === 'Stripe' ? 'blue.50' : 'white'}
                  cursor="pointer"
                  onClick={() => setPaymentMethod('Stripe')}
                  transition="all 0.2s"
                  _hover={{ borderColor: 'blue.300' }}
                  opacity={0.7}
                >
                  <Radio value="Stripe" colorScheme="blue" w="full">
                    <HStack spacing={3} ml={2}>
                      <Box p={2} bg="blue.50" borderRadius="full" color="blue.800">
                        <Icon as={SiStripe} boxSize={5} />
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.800">Stripe</Text>
                        <Text fontSize="sm" color="gray.500">Fast and secure payment</Text>
                      </Box>
                      <Badge ml={4} colorScheme="green" px={2} borderRadius={"full"}>Coming Soon</Badge>
                    </HStack>
                  </Radio>
                </Box>
              </Stack>
            </RadioGroup>
          </VStack>
        </ModalBody>

        <ModalFooter bg="gray.50" borderBottomRadius="xl">
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleConfirm} 
            isLoading={loading}
            loadingText="Processing"
            leftIcon={<FiShield />}
            isDisabled={paymentMethod !== 'wallet' || (walletBalance !== null && walletBalance < amount)}
          >
            Pay Now
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PaymentModal;
