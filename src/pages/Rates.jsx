import React, { useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Select,
  Button,
  Text,
  Spacer
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { FiXCircle } from 'react-icons/fi';

const Rates = () => {
  const [country, setCountry] = useState('');
  const [productType, setProductType] = useState('');

  const countries = [
    { value: '', label: 'Select Country' },
    { value: 'us', label: 'United States (+1)' },
    { value: 'uk', label: 'United Kingdom (+44)' },
    { value: 'ca', label: 'Canada (+1)' },
    { value: 'au', label: 'Australia (+61)' }
  ];

  const productTypes = [
    { value: '', label: 'Select Product Type' },
    { value: 'did', label: 'DID' },
    { value: 'universal-freephone', label: 'Universal Freephone' },
    { value: 'two-way-sms', label: ' Two Way SMS' },
    { value: 'two-way-voice', label: 'Two Way Voice' },
    { value: 'mobile', label: 'Mobile'}

  ];

  const handleSearch = () => {
    console.log('Searching rates', { country, productType });
  };

  const handleClear = () => {
    setCountry('');
    setProductType('');
  };

  return (
    <Box
      flex={1}
      p={8}
      bg="#f8f9fa"
      height="calc(100vh - 76px)"
      overflowY="auto"
    >
      <VStack spacing={6} align="stretch">
        <Heading
          color="#1a3a52"
          fontSize="3xl"
          fontWeight="bold"
          letterSpacing="-0.2px"
        >
          Rates
        </Heading>

        <Box
          bg="white"
          borderRadius="12px"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          p={5}
        >
          <VStack align="stretch" spacing={4}>
            
            <HStack spacing={4} align="center">
              <VStack flex={3} align={"start"} spacing={1}>
              <Text fontWeight={"bold"}>Country</Text>
              <Select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {countries.map((option) => (
                  <option key={option.value || 'placeholder'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              </VStack>
              <VStack flex={3} spacing={1} align={"start"}>
                <Text fontWeight={"bold"}>Product Type</Text>
              <Select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              >
                {productTypes.map((option) => (
                  <option key={option.value || 'placeholder'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              </VStack>
              <Spacer/>
              <HStack flex={1} spacing={5} align={"center"}>
                <Button
                  borderRadius={"full"}
                  leftIcon={<FaSearch/>}
                  colorScheme="blue"
                  onClick={handleSearch}
                >
                  Search
                </Button>
                <Button
                  borderRadius={"full"}
                  variant="outline"
                  leftIcon={<FiXCircle />}
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default Rates;