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
  HStack,
  Box,
  Icon,
  useToast,
  Input,
  FormControl,
  FormLabel,
  Select,
  Spinner,
  Center
} from '@chakra-ui/react';
import { FaExclamationTriangle, FaUnlink } from 'react-icons/fa';
import api from '../services/api';

function NumberDisconnectModal({ isOpen, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [customersRes, numbersRes] = await Promise.all([
        api.customers.getAll(),
        api.numbers.getAll()
      ]);

      if (customersRes.success) {
        setCustomers(customersRes.data);
      }
      if (numbersRes.success) {
        setNumbers(numbersRes.data.filter(n => n.status === 'Active'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setLoadingData(false);
    }
  };

  const getCustomerNumbers = () => {
    if (!selectedCustomer) return [];
    return numbers.filter(n => n.customer_id === selectedCustomer.id);
  };

  const getCountriesForCustomer = () => {
    const customerNumbers = getCustomerNumbers();
    const uniqueCountries = [...new Set(customerNumbers.map(n => n.country_name))];
    const countryIds = [...new Set(customerNumbers.map(n => n.country_id))];
    
    return customerNumbers
      .filter((n, idx, arr) => arr.findIndex(x => x.country_id === n.country_id) === idx)
      .sort((a, b) => a.country_name.localeCompare(b.country_name));
  };

  const getNumbersByCountry = () => {
    const customerNumbers = getCustomerNumbers();
    if (!selectedCountry) return customerNumbers;
    
    return customerNumbers
      .filter(n => n.country_id === selectedCountry.country_id)
      .sort((a, b) => a.number.localeCompare(b.number));
  };

  const handleDisconnect = async () => {
    if (!selectedNumber) {
      toast({
        title: 'Error',
        description: 'Please select a number to disconnect',
        status: 'error',
        duration:2000,
        isClosable: true,
      });
      return;
    }

    if (confirmationInput !== selectedNumber?.number) {
      toast({
        title: 'Error',
        description: 'Phone number confirmation does not match',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.numbers.disconnect(selectedNumber.id);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Number disconnected successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        if (onSuccess) {
          onSuccess(selectedNumber.id);
        }

        setConfirmationInput('');
        setSelectedCustomer(null);
        setSelectedCountry(null);
        setSelectedNumber(null);
        onClose();
      } else {
        throw new Error(response.message || 'Failed to disconnect number');
      }
    } catch (error) {
      console.error('Disconnect number error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to disconnect number',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setConfirmationInput('');
    setSelectedCustomer(null);
    setSelectedCountry(null);
    setSelectedNumber(null);
    onClose();
  };

  const customerNumbers = getCustomerNumbers();
  const availableCountries = getCountriesForCustomer();
  const numbersByCountry = getNumbersByCountry();
  const isConfirmed = confirmationInput === selectedNumber?.number;

  if (loadingData && !selectedCustomer && customers.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size={{base:"sm",md:"lg"}} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={FaUnlink} color="red.500" />
              <Text>Disconnect Number</Text>
            </HStack>
          </ModalHeader>
          <ModalBody>
            <Center minH="200px">
              <Spinner size="lg" color="red.500" />
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{base:"sm",md:"lg"}} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FaUnlink} color="red.500" />
            <Text>Disconnect Number</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {!selectedCustomer ? (
              <>
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" mb={2}>
                    Step 1: Select a Customer
                  </FormLabel>
                  <Select
                    placeholder="Select a customer..."
                    onChange={(e) => {
                      const cust = customers.find(c => c.id === e.target.value);
                      setSelectedCustomer(cust);
                      setSelectedCountry(null);
                      setSelectedNumber(null);
                      setConfirmationInput('');
                    }}
                    borderRadius="md"
                    focusBorderColor="red.500"
                    isDisabled={loadingData}
                  >
                    {customers.map(cust => (
                      <option key={cust.id} value={cust.id}>
                        {cust.company_name || cust.contact_person} ({cust.email})
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </>
            ) : !selectedCountry ? (
              <>
                <Box
                  bg="blue.50"
                  borderRadius="md"
                  p={3}
                  border="1px solid"
                  borderColor="blue.200"
                >
                  <HStack spacing={2}>
                    <Text fontSize="sm" color="blue.700">
                      <Text as="span" fontWeight="semibold">Selected Customer:</Text> {selectedCustomer?.company_name || selectedCustomer?.contact_person}
                    </Text>
                  </HStack>
                </Box>

                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" mb={2}>
                    Step 2: Select a Country
                  </FormLabel>
                  <Select
                    placeholder="Select a country..."
                    onChange={(e) => {
                      const country = availableCountries.find(c => c.country_id === e.target.value);
                      setSelectedCountry(country);
                      setSelectedNumber(null);
                      setConfirmationInput('');
                    }}
                    borderRadius="md"
                    focusBorderColor="red.500"
                  >
                    {availableCountries.map(country => (
                      <option key={country.country_id} value={country.country_id}>
                        {country.country_name} ({availableCountries.filter(c => c.country_id === country.country_id).length} number{availableCountries.filter(c => c.country_id === country.country_id).length !== 1 ? 's' : ''})
                      </option>
                    ))}
                  </Select>
                  {availableCountries.length === 0 && (
                    <Text fontSize="sm" color="orange.600" mt={2}>
                      This customer has no active numbers
                    </Text>
                  )}
                </FormControl>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setConfirmationInput('');
                  }}
                  colorScheme="gray"
                >
                  ← Back to Customer Selection
                </Button>
              </>
            ) : !selectedNumber ? (
              <>
                <Box
                  bg="blue.50"
                  borderRadius="md"
                  p={3}
                  border="1px solid"
                  borderColor="blue.200"
                >
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="blue.700">
                      <Text as="span" fontWeight="semibold">Selected Customer:</Text> {selectedCustomer?.company_name || selectedCustomer?.contact_person}
                    </Text>
                    <Text fontSize="sm" color="blue.700">
                      <Text as="span" fontWeight="semibold">Selected Country:</Text> {selectedCountry?.country_name}
                    </Text>
                  </VStack>
                </Box>

                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" mb={2}>
                    Step 3: Select a Number to Disconnect
                  </FormLabel>
                  <Select
                    placeholder="Select a number..."
                    onChange={(e) => {
                      const num = numbersByCountry.find(n => n.id === e.target.value);
                      setSelectedNumber(num);
                      setConfirmationInput('');
                    }}
                    borderRadius="md"
                    focusBorderColor="red.500"
                  >
                    {numbersByCountry.map(num => (
                      <option key={num.id} value={num.id}>
                        {num.number} - {num.product_name || 'N/A'}
                      </option>
                    ))}
                  </Select>
                  {numbersByCountry.length === 0 && (
                    <Text fontSize="sm" color="orange.600" mt={2}>
                      No active numbers for this country
                    </Text>
                  )}
                </FormControl>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCountry(null);
                    setConfirmationInput('');
                  }}
                  colorScheme="gray"
                >
                  ← Back to Country Selection
                </Button>
              </>
            ) : (
              <>
                <Box
                  bg="red.50"
                  borderRadius="md"
                  p={4}
                  border="1px solid"
                  borderColor="red.200"
                >
                  <HStack spacing={3} align="start">
                    <Icon as={FaExclamationTriangle} color="red.500" mt={1} flexShrink={0} />
                    <VStack spacing={2} align="start" flex={1}>
                      <Text fontWeight="semibold" color="red.800">
                        Warning: This action cannot be undone
                      </Text>
                      <Text fontSize="sm" color="red.700">
                        Phone Number: <Text as="span" fontWeight="bold">{selectedNumber?.number}</Text>
                      </Text>
                      <Text fontSize="sm" color="red.700">
                        Country: {selectedNumber?.country_name || 'N/A'} | Product: {selectedNumber?.product_name || 'N/A'}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <FormControl isRequired>
                  <FormLabel fontWeight="semibold">
                    Confirm by entering the phone number
                  </FormLabel>
                  <Input
                    placeholder="Enter phone number to confirm"
                    value={confirmationInput}
                    onChange={(e) => setConfirmationInput(e.target.value)}
                    borderRadius="md"
                    focusBorderColor="red.500"
                    isDisabled={isSubmitting}
                  />
                  <Text fontSize="xs" color="gray.600" mt={2}>
                    Type the phone number exactly as shown above to proceed
                  </Text>
                </FormControl>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedNumber(null);
                    setConfirmationInput('');
                  }}
                  isDisabled={isSubmitting}
                  colorScheme="gray"
                >
                  ← Back to Number Selection
                </Button>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              size={"sm"}
              borderRadius={"full"}
              variant="ghost"
              onClick={handleCancel}
              isDisabled={isSubmitting}
              colorScheme="gray"
            >
              Cancel
            </Button>
            <Button
              size={"sm"}
              
              borderRadius={"full"}
              colorScheme="red"
              onClick={handleDisconnect}
              isLoading={isSubmitting}
              loadingText="Disconnecting..."
              isDisabled={!selectedNumber || !isConfirmed}
            >
              Disconnect Number
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default NumberDisconnectModal;
