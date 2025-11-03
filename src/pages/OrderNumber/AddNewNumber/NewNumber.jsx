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
import NumberSelection from './NumberSelection';
import AddCart from './AddCart';
import PlaceOrder from './PlaceOrder';
import Submitted from './Submitted';
import { FaCheck } from 'react-icons/fa';

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
  const [formData, setFormData] = useState({
    country: '',
    productType: '',
    areaCode: '',
    quantity: ''
  });

  // Removed showPlaceOrder logic since we now navigate to dedicated cart page

  useEffect(() => {
    if (location.state?.productType) {
      const productTypeMap = {
        'DID': 'did',
        'Freephone': 'freephone',
        'Universal Freephone': 'universal',
        'Two Way Voice': 'two-way-voice',
        'Two Way SMS': 'two-way-sms',
        'Mobile': 'mobile'
      };
      const mappedType = productTypeMap[location.state.productType];
      if (mappedType) {
        setSelectedProductType(mappedType);
        setFormData(prev => ({ ...prev, productType: mappedType }));
        if (productTypeRef.current) {
          productTypeRef.current.value = mappedType;
        }
      }
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Utility function to generate mock phone numbers based on search criteria
  const generatePhoneNumbers = (country, areaCode, quantity, productType) => {
    const numbers = [];
    const baseNumbers = {
      us: '1',
      uk: '44',
      ca: '1',
      au: '61'
    };
    
    const prefix = baseNumbers[country] || '1';
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
    if (!selectedNumbersData || selectedNumbersData.length === 0) {
      toast({
        title: 'No Numbers Selected',
        description: 'Please select at least one number to configure',
        status: 'warning',
        duration: 3,
        isClosable: true,
      });
      return;
    }
    
    setShowNumbers(false);
    setShowAddCart(true);
    setCurrentStep(3);
  };

  const handleAddToCart = (cartConfig) => {
    if (!cartConfig || !selectedNumbers || selectedNumbers.length === 0) {
      toast({
        title: 'Invalid Configuration',
        description: 'Please select numbers and complete the configuration',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
      return;
    }
    
    // Create cart item with selected numbers and configuration
    const item = {
      id: Date.now(),
      productType: formData.productType,
      country: formData.country,
      areaCode: formData.areaCode,
      quantity: selectedNumbers.length,
      selectedNumbers: selectedNumbers,
      connectivity: cartConfig.connectivityMode,
      prefix: cartConfig.selectedPrefix
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
                  bg={currentStep >= step.number ? 'blue.500' : 'gray.200'}
                  color={currentStep >= step.number ? 'white' : 'gray.500'}
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
                  color={currentStep >= step.number ? 'blue.600' : 'gray.500'}
                >
                  {step.name}
                </Text>
                {index < steps.length - 1 && (
                  <Divider 
                    flex={1} 
                    borderColor={currentStep > step.number ? 'blue.500' : 'gray.200'} 
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
                  >
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="ca">Canada</option>
                    <option value="au">Australia</option>
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
                  >
                    <option value="did">DID</option>
                    <option value="freephone">Freephone</option>
                    <option value="universal">Universal Freephone</option>
                    <option value="two-way-voice">Two Way Voice</option>
                    <option value="two-way-sms">Two Way SMS</option>
                    <option value="mobile">Mobile</option>
                  </Select>
                </FormControl>

                {/* Area Code */}
                <FormControl isRequired>
                  <FormLabel color="#1a3a52" fontWeight="medium" fontSize="sm">
                    Area Code (Prefix)
                  </FormLabel>
                  <Input 
                    ref={areaCodeRef}
                    placeholder="Enter area code" 
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: "blue.400" }}
                    value={formData.areaCode}
                    onChange={(e) => handleInputChange('areaCode', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, quantityRef)}
                  />
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