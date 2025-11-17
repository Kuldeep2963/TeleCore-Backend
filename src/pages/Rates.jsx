import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Select,
  Button,
  Text,
  Spacer,
  Spinner,
  Center
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { FiXCircle } from 'react-icons/fi';
import api from '../services/api';

const Rates = () => {
  const [country, setCountry] = useState('');
  const [productType, setProductType] = useState('');
  const [countries, setCountries] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch countries from API
      const countriesResponse = await api.countries.getAll();
      if (countriesResponse.success) {
        const countriesData = countriesResponse.data.map(country => ({
          value: country.code,
          label: `${country.name} (${country.phone_code})`
        }));
        setCountries([{ value: '', label: 'Select Country' }, ...countriesData]);
      }

      // Fetch products from API
      const productsResponse = await api.products.getAll();
      if (productsResponse.success) {
        const productsData = productsResponse.data.map(product => ({
          value: product.code,
          label: product.name
        }));
        setProductTypes([{ value: '', label: 'Select Product Type' }, ...productsData]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    console.log('Searching rates', { country, productType });
  };

  const handleClear = () => {
    setCountry('');
    setProductType('');
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