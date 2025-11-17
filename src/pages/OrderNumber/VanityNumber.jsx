import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  Textarea,
  useColorModeValue
} from '@chakra-ui/react';
import api from '../../services/api';

function VanityNumber() {
  const [countries, setCountries] = useState(null);
  const [formData, setFormData] = useState({
    country: '',
    productType: '',
    areaCode: '',
    description: '',
    documents: []
  });

  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching countries with product types from API...');

        // Fetch countries (assuming countries table contains product type relationships)
        const countriesResponse = await api.countries.getAll();
        console.log('Countries API response:', countriesResponse);
        if (countriesResponse.success) {
          console.log('Countries data:', countriesResponse.data);
          setCountries(countriesResponse.data);
        } else {
          console.error('Countries API returned unsuccessful:', countriesResponse);
          setCountries([]);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountries([]);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Clear product type when country changes
      if (field === 'country' && prev.country !== value) {
        newData.productType = '';
      }

      return newData;
    });
  };

  // Map product names to product objects
  const mapProductNameToObject = (productName) => {
    const productMappings = {
      'DID': { id: 1, code: 'did', name: 'DID' },
      'Freephone': { id: 2, code: 'freephone', name: 'Freephone' },
      'Universal Freephone': { id: 3, code: 'universal-freephone', name: 'Universal Freephone' },
      'Two Way Voice': { id: 4, code: 'two-way-voice', name: 'Two Way Voice' },
      'Two Way SMS': { id: 5, code: 'two-way-sms', name: 'Two Way SMS' },
      'Mobile': { id: 6, code: 'mobile', name: 'Mobile' }
    };
    return productMappings[productName] || { id: 0, code: productName.toLowerCase().replace(/\s+/g, '-'), name: productName };
  };

  // Get available products for the selected country
  const getAvailableProducts = () => {
    if (!formData.country || !countries || countries.length === 0) {
      return [];
    }

    // Find the selected country and return its available products
    const selectedCountry = countries.find(country => country.countryname === formData.country);
    if (!selectedCountry || !selectedCountry.availableproducts) {
      return [];
    }

    // Map product names to product objects
    return selectedCountry.availableproducts.map(productName => mapProductNameToObject(productName));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const handleClear = () => {
    setFormData({
      country: '',
      productType: '',
      areaCode: '',
      description: '',
      documents: []
    });
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
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
          <Heading
            color="#1a3a52"
            fontSize="3xl"
            fontWeight="bold"
            letterSpacing="-0.2px"
          >
            Vanity Numbers
          </Heading>

          <Box
            bg="white"
            borderRadius="12px"
            p={6}
            boxShadow="sm"
            border="1px solid"
            borderColor={borderColor}
          >
            <VStack spacing={6} align="stretch">
              {/* Country and Product Type */}
              <HStack spacing={6} align="start">
                <FormControl isRequired flex={1}>
                  <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                    Country 
                  </FormLabel>
                  <Select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    bg="white"
                    borderColor="gray.300"
                    size="md"
                    isDisabled={!countries || countries.length === 0}
                  >
                    {countries && countries.length > 0 ? (
                      countries.map(country => (
                        <option key={country.countryname} value={country.countryname}>
                          {country.countryname} ({country.phonecode})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {countries === null ? 'Loading countries...' : 'No countries available'}
                      </option>
                    )}
                  </Select>
                </FormControl>
                
                <FormControl isRequired flex={1}>
                  <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                    Product Type 
                  </FormLabel>
                  <Select
                    value={formData.productType}
                    onChange={(e) => handleInputChange('productType', e.target.value)}
                    bg="white"
                    borderColor="gray.300"
                    size="md"
                    disabled={!formData.country}
                  >
                    <option value="">
                      {formData.country ? 'Select product type' : 'Select country first'}
                    </option>
                    {getAvailableProducts().map(product => (
                      <option key={product.code} value={product.code}>
                        {product.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                 {/* Area Code */}
              <FormControl isRequired flex={1}>
                <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                  Area Code (Prefix) 
                </FormLabel>
                <Select 
                  value={formData.areaCode}
                  onChange={(e) => handleInputChange('areaCode', e.target.value)}
                  bg="white"
                  borderColor="gray.300"
                  size="md"
                >
                  <option value="">Select area code</option>
                  <option value="800">800</option>
                  <option value="888">888</option>
                  <option value="877">877</option>
                  <option value="866">866</option>
                  <option value="855">855</option>
                  <option value="844">844</option>
                  <option value="833">833</option>
                </Select>
              </FormControl>

              </HStack>

             
              {/* Description */}
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                  Description 
                </FormLabel>
                <Textarea 
                  placeholder="Enter your text here"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  bg="white"
                  borderColor="gray.300"
                  minH="120px"
                  resize="vertical"
                  size="md"
                />
              </FormControl>

              {/* Upload Documents */}
              <FormControl w={"60%"}>
                <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                  Upload Documents
                </FormLabel>
                <HStack spacing={6} align="stretch">
                  <Box
                    flex={2}
                    border="2px dashed"
                    borderColor="gray.300"
                    borderRadius="md"
                    p={6}
                    textAlign="center"
                    cursor="pointer"
                    _hover={{ borderColor: 'blue.400' }}
                    transition="all 0.2s"
                    position="relative"
                  >
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      position="absolute"
                      opacity={0}
                      width="100%"
                      height="100%"
                      cursor="pointer"
                      left={0}
                      top={0}
                    />
                    <VStack spacing={2}>
                      <Text fontWeight="medium" color="gray.600">
                        Choose files
                      </Text>
                    </VStack>
                  </Box>
                  
                  <VStack flex={1} spacing={1} align="start">
                    <Text fontSize="sm" color="gray.500">
                      Maximum file size: 10 MB
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      File type: pdf, jpeg, png, doc, docx
                    </Text>
                  </VStack>

                  {/* Uploaded files list */}
                  {formData.documents.length > 0 && (
                    <Box mt={3}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                        Uploaded Files:
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {formData.documents.map((file, index) => (
                          <HStack 
                            key={index} 
                            justify="space-between" 
                            bg="gray.50" 
                            p={3} 
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                          >
                            <Text fontSize="sm" color="gray.600" isTruncated flex={1}>
                              {file.name}
                            </Text>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => {
                                const newDocs = [...formData.documents];
                                newDocs.splice(index, 1);
                                setFormData(prev => ({ ...prev, documents: newDocs }));
                              }}
                            >
                              Remove
                            </Button>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </HStack>
              </FormControl>

              {/* Action Buttons */}
              <HStack spacing={4} justify="flex-end" pt={4}>
                <Button
                  borderRadius={"full"}
                  variant="outline"
                  colorScheme="gray"
                  onClick={handleClear}
                  size="md"
                  px={6}
                >
                  Clear
                </Button>
                <Button
                  borderRadius={"full"}
                  colorScheme="blue"
                  onClick={handleSubmit}
                  size="md"
                  px={6}
                  isDisabled={!formData.country || !formData.productType || !formData.areaCode || !formData.description}
                >
                  Submit Enquiry
                </Button>
              </HStack>
            </VStack>
          </Box>
        </VStack>
        </Box>
  );
}

export default VanityNumber;