import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  Input,
  Grid,
  Card,
  CardBody,
  Badge,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Icon,
  useToast
} from '@chakra-ui/react';
import NumberSelection, { defaultPricingData } from './NumberSelection';
import AddCart from './AddCart';
import PlaceOrder from './PlaceOrder';
import Submitted from './Submitted';
import { FaCheck } from 'react-icons/fa';
import api from '../../../services/api';

function NewNumbers({ onAddToCart = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [showNumbers, setShowNumbers] = useState(false);
  const [showAddCart, setShowAddCart] = useState(false);
  const [showSubmitted, setShowSubmitted] = useState(false);
  const [showPlaceOrder, setShowPlaceOrder] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProductType, setSelectedProductType] = useState('');
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [desiredPricingData, setDesiredPricingData] = useState(() => ({ ...defaultPricingData }));
  const [countries, setCountries] = useState(null);
  const [products, setProducts] = useState([]);
  const [areaCodes, setAreaCodes] = useState([]);
  const [formData, setFormData] = useState({
    country: '',
    productType: '',
    areaCode: '',
    quantity: ''
  });

  // Removed showPlaceOrder logic since we now navigate to dedicated cart page

  useEffect(() => {
    // Fetch countries and products from API
    const fetchData = async () => {
      try {
        console.log('Fetching countries and products from API...');

        // Fetch countries
        const countriesResponse = await api.countries.getAll();
        console.log('Countries API response:', countriesResponse);
        if (countriesResponse.success) {
          console.log('Countries data:', countriesResponse.data);
          setCountries(countriesResponse.data);
        } else {
          console.error('Countries API returned unsuccessful:', countriesResponse);
          setCountries([]);
        }

        // Fetch products
        const productsResponse = await api.products.getAll();
        if (productsResponse.success) {
          setProducts(productsResponse.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setCountries([]);
        setProducts([]);
      }
    };

    fetchData();

    if (location.state?.productType) {
      // Product type will be set when countries are loaded
      // For now, store it temporarily
      setSelectedProductType(location.state.productType);
      setFormData(prev => ({ ...prev, productType: location.state.productType }));
    }

    // Handle edit item from cart
    if (location.state?.editItem) {
      const editItem = location.state.editItem;
      const updatedFormData = {
        country: editItem.country || '',
        productType: editItem.productType || '',
        areaCode: editItem.areaCode || '',
        quantity: editItem.quantity || ''
      };

      setFormData(updatedFormData);
      setSelectedProductType(editItem.productType || '');

      // Clear any previous state
      setSelectedNumbers([]);
      setShowNumbers(false);
      setShowAddCart(false);
      setShowSubmitted(false);
      setShowPlaceOrder(false);
      setCurrentStep(1);

      // Update refs after a short delay to ensure DOM is ready
      setTimeout(() => {
        if (countryRef.current) countryRef.current.value = editItem.country || '';
        if (productTypeRef.current) productTypeRef.current.value = editItem.productType || '';
        if (areaCodeRef.current) areaCodeRef.current.value = editItem.areaCode || '';
        if (quantityRef.current) quantityRef.current.value = editItem.quantity || '';
      }, 100);
    }
  }, [location.state]);

  // Create refs for all input fields
  const countryRef = useRef(null);
  const productTypeRef = useRef(null);
  const areaCodeRef = useRef(null);
  const quantityRef = useRef(null);

  // Handle key down for arrow navigation
  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Focus previous element (you can implement this similarly)
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Clear product type and area code when country changes
      if (field === 'country' && prev.country !== value) {
        newData.productType = '';
        newData.areaCode = '';
        setDesiredPricingData(() => ({ ...defaultPricingData }));
        setAreaCodes([]);
      }

      // Clear area code when product type changes
      if (field === 'productType' && prev.productType !== value) {
        newData.areaCode = '';
        setDesiredPricingData(() => ({ ...defaultPricingData }));
        fetchAreaCodes(newData.country, value);
      }

      return newData;
    });
  };

  const fetchAreaCodes = async (countryName, productCode) => {
    if (!countryName || !productCode || !countries || !products) return;

    try {
      // Find country and product IDs
      const selectedCountry = countries.find(c => c.countryname === countryName);
      const selectedProduct = products.find(p => p.code === productCode);

      if (selectedCountry && selectedProduct) {
        const response = await api.numbers.getAreaCodes(selectedCountry.id, selectedProduct.id);
        if (response.success) {
          setAreaCodes(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching area codes:', error);
      setAreaCodes([]);
    }
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
    if (!formData.country || !countries || countries.length === 0 || !products || products.length === 0) {
      return [];
    }

    // Find the selected country and return its available products
    const selectedCountry = countries.find(country => country.countryname === formData.country);
    if (!selectedCountry || !selectedCountry.availableproducts) {
      return [];
    }

    // Filter products that are available for this country
    return products.filter(product => selectedCountry.availableproducts.includes(product.name));
  };

  // Utility function to generate mock phone numbers based on search criteria
  const generatePhoneNumbers = (country, areaCode, quantity, productType) => {
    const numbers = [];

    // Find the country object to get the phone code
    const countryObj = countries && countries.find(c => c.countryname === country);
    const prefix = countryObj ? countryObj.phonecode : '1';
    const startNumber = parseInt(areaCode) || 555;
    
    for (let i = 0; i < parseInt(quantity); i++) {
      const number = `+${prefix} (${startNumber}) ${String(100000 + i).slice(-6)}`;
      numbers.push({
        id: `${country}-${startNumber}-${i}`,
        number: number,
        status: 'Available',
        areaCode: areaCode,
        country: country,
        productType: productType
      });
    }
    
    return numbers;
  };

  const handleClear = () => {
    // Clear all form fields
    setFormData({
      country: '',
      productType: '',
      areaCode: '',
      quantity: ''
    });

    setSelectedNumbers([]);
    setDesiredPricingData(() => ({ ...defaultPricingData }));
    setAreaCodes([]);

    if (countryRef.current) countryRef.current.value = '';
    if (productTypeRef.current) productTypeRef.current.value = '';
    if (areaCodeRef.current) areaCodeRef.current.value = '';
    if (quantityRef.current) quantityRef.current.value = '';

    setShowNumbers(false);
    setShowAddCart(false);
    setCurrentStep(1);

    // Focus back to first field
    countryRef.current?.focus();
  };

  const handleShowNumbers = () => {
    // Validate required fields
    if (!formData.productType || !formData.areaCode || !formData.quantity) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill all required fields (Product Type, Area Code, Quantity)',
        status: 'warning',
        duration: 3,
        isClosable: true,
      });
      return;
    }
    
    // Generate available numbers based on search criteria
    const generatedNumbers = generatePhoneNumbers(
      formData.country || 'us',
      formData.areaCode,
      formData.quantity,
      formData.productType
    );
    
    setSelectedNumbers(generatedNumbers.map(n => n.id));
    setShowNumbers(true);
    setShowAddCart(false);
    setCurrentStep(2);
  };

  // Handle number selection changes from NumberSelection component
  const handleNumberSelectionChange = (numbersData) => {
    setSelectedNumbers(numbersData.selectedIds);
  };

  // Function to handle Configure button click from NumberSelection
  const handleConfigure = (selectedNumbersData) => {
    setShowNumbers(false);
    setShowAddCart(true);
    setCurrentStep(3);
  };

  const handleAddToCart = (cartConfig) => {
    if (!cartConfig) {
      toast({
        title: 'Invalid Configuration',
        description: 'Please complete the configuration',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
      return;
    }

    // Create cart item with configuration
    const item = {
      id: Date.now(),
      productType: formData.productType,
      country: formData.country,
      areaCode: formData.areaCode,
      quantity: formData.quantity,
      selectedNumbers: [],
      connectivity: cartConfig.connectivityMode,
      prefix: cartConfig.selectedPrefix,
      desiredPricing: { ...desiredPricingData },
      pricing: { ...defaultPricingData },
      orderStatus: 'In Progress'
    };

    onAddToCart(item);
    // Navigate to cart page instead of showing inline
    navigate('/order-numbers/place-order');
  };

  // handlePlaceOrder removed - now handled by dedicated cart page

  const handleContinueShopping = () => {
    setShowAddCart(false);
    setShowNumbers(true);
    setCurrentStep(2);
  };

  const renderSteps = () => {
    const steps = [
      { number: 1, name: 'Search' },
      { number: 2, name: 'Configure' },
      { number: 3, name: 'Add to Cart' },
      { number: 4, name: 'Place Order' },
      { number: 5, name: 'Order Submitted' }
    ];

    return (
      <Card bg="white" borderRadius="12px" boxShadow="sm" border="1px solid" borderColor="gray.200">
        <CardBody p={6}>
          <HStack justify="space-between" spacing={4}>
            {steps.map((step, index) => (
              <HStack key={step.number} spacing={3} flex={1}>
                <Box
                  w="32px"
                  h="32px"
                  borderRadius="full"
                  bg={
                    currentStep > step.number ? 'green.500' :
                    currentStep === step.number ? 'blue.500' : 'gray.200'
                  }
                  color={
                    currentStep >= step.number ? 'white' : 'gray.500'
                  }
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  {currentStep > step.number ? <Icon as={FaCheck} boxSize={3} /> : step.number}
                </Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={
                    currentStep > step.number ? 'green.600' :
                    currentStep === step.number ? 'blue.600' : 'gray.500'
                  }
                >
                  {step.name}
                </Text>
                {index < steps.length - 1 && (
                  <Divider
                    flex={1}
                    borderColor={
                      currentStep > step.number ? 'green.500' :
                      currentStep > step.number - 1 ? 'blue.500' : 'gray.200'
                    }
                  />
                )}
              </HStack>
            ))}
          </HStack>
        </CardBody>
      </Card>
    );
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
        {/* Header */}
        <Heading color="#1a3a52" fontSize="3xl" fontWeight="bold">
          Order New Numbers
        </Heading>

        {renderSteps()}

        {/* Order Form - Only show until NumberSelection page */}
        {!(showAddCart || showPlaceOrder || showSubmitted) && (
          <Card bg="white" borderRadius="12px" boxShadow="sm" border="1px solid" borderColor="gray.200">
            <CardBody p={6}>
              <Grid templateColumns={{ base: "1fr", md: "repeat(5, 1fr)" }} gap={6} alignItems="end">
                {/* Country */}
                <FormControl isRequired>
                  <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                    Country
                  </FormLabel>
                  <Select
                    ref={countryRef}
                    placeholder="Select country"
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: "blue.400" }}
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, productTypeRef)}
                    // isDisabled={!countries || countries.length === 0}
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

                {/* Product Type */}
                <FormControl isRequired>
                  <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                    Product Type
                  </FormLabel>
                  <Select
                    ref={productTypeRef}
                    placeholder="Select product type"
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: "blue.400" }}
                    value={formData.productType}
                    onChange={(e) => handleInputChange('productType', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, areaCodeRef)}
                    disabled={!formData.country}
                  >
                    {getAvailableProducts().map(product => (
                      <option key={product.code} value={product.code}>
                        {product.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Area Code */}
                <FormControl isRequired>
                  <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                    Area Code (Prefix)
                  </FormLabel>
                  <Select
                    ref={areaCodeRef}
                    placeholder="Select area code"
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: "blue.400" }}
                    value={formData.areaCode}
                    onChange={(e) => handleInputChange('areaCode', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, quantityRef)}
                    disabled={!formData.country || !formData.productType}
                  >
                    {areaCodes.map(areaCode => (
                      <option key={areaCode} value={areaCode}>
                        {areaCode}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Quantity */}
                <FormControl isRequired>
                  <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                    Quantity 
                  </FormLabel>
                  <NumberInput 
                    min={1}
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: "blue.400" }}
                    value={formData.quantity}
                    onChange={(value) => handleInputChange('quantity', value)}
                  >
                    <NumberInputField 
                      ref={quantityRef}
                      placeholder="Enter quantity"
                      onKeyDown={(e) => handleKeyDown(e, null)}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                {/* Buttons - Aligned with form fields */}
                <FormControl>
                  <FormLabel color="transparent" fontSize="sm" userSelect="none">
                    Actions
                  </FormLabel>
                  <HStack spacing={3}>
                    <Button
                      colorScheme="blue"
                      size="md"
                      flex={2}
                      fontWeight="semibold"
                      width='90px'
                      boxShadow="0 2px 4px rgba(49, 130, 206, 0.25)"
                      _hover={{
                        boxShadow: '0 4px 8px rgba(49, 130, 206, 0.35)'
                      }}
                      transition="all 0.2s ease"
                      onClick={handleShowNumbers}
                    >
                      Show Numbers
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      flex={1}
                      fontWeight="semibold"
                      borderColor="gray.300"
                      color="gray.600"
                      _hover={{
                        bg: "gray.50",
                        borderColor: "gray.400"
                      }}
                      transition="all 0.2s ease"
                      onClick={handleClear}
                    >
                      Clear
                    </Button>
                  </HStack>
                </FormControl>
              </Grid>
            </CardBody>
          </Card>
        )}

        {/* Show Number Selection OR AddCart - Only one at a time */}
        {showNumbers && !showAddCart && (
          <NumberSelection 
            formData={formData}
            selectedNumbers={selectedNumbers}
            onNumberSelectionChange={handleNumberSelectionChange}
            onConfigure={handleConfigure}
            initialStep={currentStep}
            desiredPricingData={desiredPricingData}
            onDesiredPricingChange={setDesiredPricingData}
          />
        )}

        {/* Show AddCart when Configure is clicked */}
        {showAddCart && !showPlaceOrder && (
          <AddCart 
            selectedNumbers={selectedNumbers}
            formData={formData}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Show Submitted when Place Order is clicked */}
        {showSubmitted && (
          <Submitted />
        )}
      </VStack>
    </Box>
  );
}

export default NewNumbers;