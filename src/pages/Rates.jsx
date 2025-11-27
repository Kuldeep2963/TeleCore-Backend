import React, { useState, useEffect } from 'react';
import { Box, Heading, VStack, HStack, Select, Button, Text, Spacer, Spinner, Center, Table, Thead, Tbody, Tr, Th, Td, Input, NumberInput, NumberInputField, IconButton, useToast } from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { FiXCircle, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import api from '../services/api';

const pricingHeadings = {
  did: { nrc: 'NRC', mrc: 'MRC', ppm: 'PPM' },
  freephone: { nrc: 'NRC', mrc: 'MRC', ppmFix: 'PPM Fix', ppmMobile: 'PPM Mobile', ppmPayphone: 'PPM Payphone' },
  universal: { nrc: 'NRC', mrc: 'MRC', ppmFix: 'PPM Fix', ppmMobile: 'PPM Mobile', ppmPayphone: 'PPM Payphone' },
  'two-way-voice': { nrc: 'NRC', mrc: 'MRC', ppmIncoming: 'Incoming PPM', ppmOutgoingfix: 'Outgoing Fix PPM', ppmOutgoingmobile: 'Outgoing Mobile PPM' },
  'two-way-sms': { nrc: 'NRC', mrc: 'MRC', arc: 'ARC', mo: 'MO', mt: 'MT' },
  mobile: { nrc: 'NRC', mrc: 'MRC', Incomingppm: 'Incoming PPM', Outgoingppmfix: 'Outgoing Fix PPM', Outgoingppmmobile: 'Outgoing Mobile PPM', incmongsms: 'Incoming SMS', outgoingsms: 'Outgoing SMS' }
};

const Rates = () => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProductType, setSelectedProductType] = useState('');
  const [countries, setCountries] = useState([]);
  const [products, setProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [pricingData, setPricingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const toast = useToast();

  const currentHeadings = pricingHeadings[selectedProductType] || pricingHeadings.did;

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await api.countries.getAll();
      if (response.success) {
        setCountries(response.data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load countries',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.products.getAll();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        status: 'error',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchProducts();
  }, [toast]);

  const handleCountryChange = (countryName) => {
    setSelectedCountry(countryName);
    setSelectedProductType('');
    setPricingData([]);
    if (countryName) {
      const country = countries.find(c => c.countryname === countryName);
      if (country) {
        let availableProductsList = [];
        if (Array.isArray(country.availableproducts)) {
          availableProductsList = country.availableproducts.map(item =>
            typeof item === 'string' ? item : item.name || item.code || ''
          ).filter(Boolean);
        } else if (typeof country.availableproducts === 'string') {
          try {
            const parsed = JSON.parse(country.availableproducts);
            availableProductsList = Array.isArray(parsed)
              ? parsed.map(item =>
                typeof item === 'string' ? item : item.name || item.code || ''
              ).filter(Boolean)
              : [parsed.name || parsed.code || ''];
          } catch (e) {
            console.warn('Failed to parse availableproducts:', e);
          }
        } else if (typeof country.availableproducts === 'object' && country.availableproducts !== null) {
          if (country.availableproducts.name || country.availableproducts.code) {
            availableProductsList = [country.availableproducts.name || country.availableproducts.code];
          }
        }
        setAvailableProducts(availableProductsList);
      }
    } else {
      setAvailableProducts([]);
    }
  };

  const handleSearch = async () => {
    if (!selectedCountry) {
      toast({
        title: 'Please select a country',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    try {
      setSearchLoading(true);
      let response;
      if (selectedProductType) {
        const product = products.find(p => p.code?.toLowerCase() === selectedProductType?.toLowerCase());
        const country = countries.find(c => c.countryname?.toLowerCase() === selectedCountry?.toLowerCase());
        if (product && country) {
          response = await api.pricing.getByProduct(product.id, country.id);
        } else {
          response = { success: false };
        }
      } else {
        response = await api.pricing.getByCountry(selectedCountry);
      }
      if (response.success) {
        const filtered = Array.isArray(response.data) ? response.data : [response.data];
        setPricingData(filtered);
      } else {
        toast({
          title: 'No pricing found',
          description: 'No pricing data available for the selected criteria',
          status: 'info',
          duration: 3000,
        });
        setPricingData([]);
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pricing data',
        status: 'error',
        duration: 3000,
      });
      setPricingData([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditValues({ ...row });
  };

  const handleInputChange = (field, value) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const fieldMap = {
        nrc: 'nrc',
        mrc: 'mrc',
        ppm: 'ppm',
        ppmFix: 'ppm_fix',
        ppmMobile: 'ppm_mobile',
        ppmPayphone: 'ppm_payphone',
        arc: 'arc',
        mo: 'mo',
        mt: 'mt',
        ppmIncoming: 'incoming_ppm',
        ppmOutgoingfix: 'outgoing_ppm_fix',
        ppmOutgoingmobile: 'outgoing_ppm_mobile',
        incmongsms: 'incoming_sms',
        outgoingsms: 'outgoing_sms',
        Incomingppm: 'incoming_ppm',
        Outgoingppmfix: 'outgoing_ppm_fix',
        Outgoingppmmobile: 'outgoing_ppm_mobile'
      };
      const updateData = {};
      Object.values(fieldMap).forEach(field => {
        if (editValues[field] !== undefined && editValues[field] !== null && editValues[field] !== '') {
          updateData[field] = parseFloat(editValues[field]);
        }
      });
      await api.pricing.update(editingId, updateData);
      toast({
        title: 'Success',
        description: 'Pricing updated successfully',
        status: 'success',
        duration: 3000,
      });
      setEditingId(null);
      handleSearch();
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast({
        title: 'Error',
        description: 'Failed to update pricing',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleClear = () => {
    setSelectedCountry('');
    setSelectedProductType('');
    setAvailableProducts([]);
    setPricingData([]);
    setEditingId(null);
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="lg">
          Rates Management
        </Heading>

        <HStack spacing={4} bg="white" p={6} borderRadius="md" boxShadow="sm">
          <VStack spacing={2} flex={1}>
            <Text fontWeight="bold" fontSize="sm">Select Country</Text>
            <Select
              borderRadius={"15px"}
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              placeholder="Select country"
            >
              {countries.map((country) => (
                <option key={country.id} value={country.countryname}>
                  {country.countryname} ({country.phonecode})
                </option>
              ))}
            </Select>
          </VStack>

          <VStack spacing={2} flex={1}>
            <Text fontWeight="bold" fontSize="sm">Select Product Type</Text>
            <Select
              borderRadius={"15px"}
              value={selectedProductType}
              onChange={(e) => setSelectedProductType(e.target.value)}
              placeholder="product type"
              isDisabled={availableProducts.length === 0}
            >
              {products
                .filter(product =>
                  availableProducts.some(
                    ap =>
                      ap.toLowerCase() === product.code.toLowerCase() ||
                      ap.toLowerCase() === product.name.toLowerCase()
                  )
                )
                .map((product) => (
                  <option key={product.id} value={product.code}>
                    {product.name} ({product.code})
                  </option>
                ))}
            </Select>
          </VStack>

          <Spacer />

          <HStack spacing={5}>
            <Button
              variant="ghost"
              borderRadius={"full"}
              leftIcon={<FaSearch />}
              colorScheme="blue"
              onClick={handleSearch}
              isLoading={searchLoading}
              isDisabled={!selectedCountry}
            >
              Search
            </Button>
            <Button
              borderRadius={"full"}
              
              leftIcon={<FiXCircle />}
              onClick={handleClear}
            >
              Clear
            </Button>
          </HStack>
        </HStack>

        {pricingData.length > 0 && (
          <Box bg="white" borderRadius="md" boxShadow="sm" overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.100">
                <Tr>
                  {Object.entries(currentHeadings).map(([key, label]) => (
                    <Th
                      key={key}
                      py={3}
                      px={4}
                      textAlign="left"
                      fontWeight="bold"
                      whiteSpace="nowrap"
                    >
                      {label}
                    </Th>
                  ))}
                  <Th py={3} px={4} textAlign="left" fontWeight="bold" whiteSpace="nowrap">
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {pricingData.map((row) => (
                  <Tr key={row.id} borderBottomWidth="1px">
                    {Object.entries(currentHeadings).map(([key]) => {
                      const fieldMap = {
                        nrc: 'nrc',
                        mrc: 'mrc',
                        ppm: 'ppm',
                        ppmFix: 'ppm_fix',
                        ppmMobile: 'ppm_mobile',
                        ppmPayphone: 'ppm_payphone',
                        arc: 'arc',
                        mo: 'mo',
                        mt: 'mt',
                        ppmIncoming: 'incoming_ppm',
                        ppmOutgoingfix: 'outgoing_ppm_fix',
                        ppmOutgoingmobile: 'outgoing_ppm_mobile',
                        incmongsms: 'incoming_sms',
                        outgoingsms: 'outgoing_sms',
                        Incomingppm: 'incoming_ppm',
                        Outgoingppmfix: 'outgoing_ppm_fix',
                        Outgoingppmmobile: 'outgoing_ppm_mobile'
                      };
                      const fieldName = fieldMap[key];
                      const value = row[fieldName];
                      return (
                        <Td key={key} py={3} px={4}>
                          {editingId === row.id ? (
                            <NumberInput
                              value={editValues[fieldName] || ''}
                              onChange={(val) => handleInputChange(fieldName, val)}
                              precision={4}
                              size="sm"
                            >
                              <NumberInputField />
                            </NumberInput>
                          ) : (
                            value ? `$${parseFloat(value).toFixed(4)}` : '-'
                          )}
                        </Td>
                      );
                    })}
                    <Td py={3} px={4}>
                      {editingId === row.id ? (
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FiSave />}
                            size="sm"
                            colorScheme="green"
                            onClick={handleSave}
                            aria-label="Save"
                          />
                          <IconButton
                            icon={<FiX />}
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            aria-label="Cancel"
                          />
                        </HStack>
                      ) : (
                        <IconButton
                          icon={<FiEdit2 />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => handleEdit(row)}
                          aria-label="Edit"
                        />
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {!searchLoading && pricingData.length === 0 && selectedCountry && (
          <Center py={8}>
            <Text color="gray.500">No pricing data found for {selectedCountry}</Text>
          </Center>
        )}
      </VStack>
    </Box>
  );
};

export default Rates;