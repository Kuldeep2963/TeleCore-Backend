import React, { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Radio,
  RadioGroup,
  Checkbox,
  Button,
  Divider,
  Card,
  CardBody,
  Heading,
  Badge,
  Input,
  FormControl,
  FormLabel,
  useColorModeValue
} from '@chakra-ui/react';
import { FaShoppingCart } from 'react-icons/fa';

const AddCart = ({ selectedNumbers = [], formData = {}, onAddToCart = () => {} }) => {
  const [connectivityMode, setConnectivityMode] = useState('SIP');
  const [selectedPrefix, setSelectedPrefix] = useState('E.164');
  const [prefixValue, setPrefixValue] = useState('');
  const [routingNumber1, setRoutingNumber1] = useState('');
  const [routingNumber2, setRoutingNumber2] = useState('');
  const [fixValue, setFixValue] = useState('');
  const [mobileValue, setMobileValue] = useState('');
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Get country name from code
  const getCountryName = (countryCode) => {
    const countries = {
      us: 'United States (+1)',
      uk: 'United Kingdom (+44)',
      ca: 'Canada (+1)',
      au: 'Australia (+61)'
    };
    return countries[countryCode] || countryCode;
  };

  const handleAddToCart = () => {
    const cartData = {
      connectivityMode,
      selectedPrefix
    };

    // Add prefix value if "Prefix + E.164" is selected
    if (selectedPrefix === 'Prefix + E.164' && prefixValue) {
      cartData.prefixValue = prefixValue;
    }

    // Add routing numbers if PSTN is selected
    if (connectivityMode === 'PSTN' && (routingNumber1 || routingNumber2)) {
      cartData.routingNumber1 = routingNumber1;
      cartData.routingNumber2 = routingNumber2;
    }

    // Add Fix and Mobile if "Others" prefix is selected in SIP mode
    if (connectivityMode === 'SIP' && selectedPrefix === 'Others' && (fixValue || mobileValue)) {
      cartData.fixValue = fixValue;
      cartData.mobileValue = mobileValue;
      cartData.productType = formData.productType;
    }

    onAddToCart(cartData);
  };

  return (
    <Box maxW="full" >
      <Card borderRadius={"12px"} bg={cardBg} border="1px solid" borderColor={borderColor} shadow="md" mb={6}>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Order Summary */}
            <Box>
              <Heading size="md" color="gray.800" mb={4}>
                Order Summary
              </Heading>
              <HStack spacing={6} wrap="wrap">
                <Box>
                  <Text fontSize="sm" color="gray.700" fontWeight="medium">Product Type</Text>
                  <Badge mt={2} borderRadius={"full"} colorScheme="blue" fontSize="sm" px={3} py={1}>
                    {formData.productType?.toUpperCase() || 'N/A'}
                  </Badge>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.700" fontWeight="medium">Country</Text>
                  <Badge mt={2} borderRadius={"full"} colorScheme="purple" fontSize="sm" px={3} py={1}>
                    {getCountryName(formData.country)}
                  </Badge>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.700" fontWeight="medium">Area Code</Text>
                  <Badge mt={2} borderRadius={"full"} colorScheme="orange" fontSize="sm" px={3} py={1}>
                    {formData.areaCode || 'N/A'}
                  </Badge>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.700" fontWeight="medium">Quantity</Text>
                  <Badge mt={2} borderRadius={"full"} colorScheme="green" fontSize="sm" px={3} py={1}>
                    {formData?.quantity || 0} Numbers
                  </Badge>
                </Box>
              </HStack>
            </Box>

            <Divider />

            {/* Preferred mode of connectivity */}
            <Box>
              <Heading size="md" color="gray.800" mb={4}>
                Preferred mode of connectivity:
              </Heading>
              <RadioGroup value={connectivityMode} onChange={setConnectivityMode}>
                <HStack spacing={8}>
                  <Radio value="SIP" colorScheme="blue">
                    <Text fontWeight="medium">SIP</Text>
                  </Radio>
                  <Radio value="PSTN" colorScheme="blue">
                    <Text fontWeight="medium">PSTN</Text>
                  </Radio>
                </HStack>
              </RadioGroup>
            </Box>

            <Divider />

            {/* Select Prefix - Only show for SIP */}
            {connectivityMode === 'SIP' && (
              <>
                <Box>
                  <Heading size="md" color="gray.800" mb={4}>
                    Select Prefix
                  </Heading>
                  <HStack spacing={8} align="start">
                    <Checkbox 
                      isChecked={selectedPrefix === 'E.164'}
                      onChange={() => setSelectedPrefix('E.164')}
                      colorScheme="blue"
                    >
                      <Text fontWeight="medium">E.164</Text>
                    </Checkbox>
                    <Checkbox 
                      isChecked={selectedPrefix === 'Prefix + E.164'}
                      onChange={() => setSelectedPrefix('Prefix + E.164')}
                      colorScheme="blue"
                    >
                      <Text fontWeight="medium">Prefix + E.164</Text>
                    </Checkbox>
                    <Checkbox 
                      isChecked={selectedPrefix === 'Others'}
                      onChange={() => setSelectedPrefix('Others')}
                      colorScheme="blue"
                    >
                      <Text fontWeight="medium">Others</Text>
                    </Checkbox>
                  </HStack>
                </Box>

                {/* Prefix Input - Show when "Prefix + E.164" is selected */}
                {selectedPrefix === 'Prefix + E.164' && (
                  <Box>
                    <FormControl w={"250px"}>
                      <FormLabel color="gray.800" fontWeight="medium">Prefix</FormLabel>
                      <Input 
                        placeholder="Enter prefix"
                        value={prefixValue}
                        onChange={(e) => setPrefixValue(e.target.value)}
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "blue.400" }}
                      />
                    </FormControl>
                  </Box>
                )}

                <Divider />
              </>
            )}

            {/* Configure Routing Number List - Show for PSTN */}
            {connectivityMode === 'PSTN' && (
              <>
                <Box
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="8px"
                  p={6}
                  bg={cardBg}
                >
                  <Heading size="md" color="gray.800" mb={6}>
                    Configure Routing Number List
                  </Heading>
                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel color="gray.800" fontWeight="medium">PSTN Number</FormLabel>
                      <Input 
                        placeholder="PSTN Number"
                        value={routingNumber1}
                        onChange={(e) => setRoutingNumber1(e.target.value)}
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "blue.400" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="gray.800" fontWeight="medium">Country Name</FormLabel>
                      <Input 
                        placeholder=" Termination Country"
                        value={routingNumber2}
                        onChange={(e) => setRoutingNumber2(e.target.value)}
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "blue.400" }}
                      />
                    </FormControl>
                  </HStack>
                </Box>

                <Divider />
              </>
            )}

            {/* Configure Others - Show when "Others" is selected in SIP mode */}
            {connectivityMode === 'SIP' && selectedPrefix === 'Others' && (
              <>
                <Box
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="8px"
                  p={6}
                  bg={cardBg}
                >
                  <Heading size="md" color="gray.800" mb={6}>
                    Configure Routing Number List
                  </Heading>
                  <HStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel color="gray.800" fontWeight="medium">Fix</FormLabel>
                      <Input 
                        placeholder="Fix"
                        value={fixValue}
                        onChange={(e) => setFixValue(e.target.value)}
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "blue.400" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="gray.800" fontWeight="medium">Mobile</FormLabel>
                      <Input 
                        placeholder="Mobile"
                        value={mobileValue}
                        onChange={(e) => setMobileValue(e.target.value)}
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "blue.400" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="gray.800" fontWeight="medium">Product Type</FormLabel>
                      <Input 
                        value={formData.productType?.toUpperCase() || 'N/A'}
                        isReadOnly={true}
                        bg="gray.100"
                        borderColor="gray.300"
                        cursor="not-allowed"
                      />
                    </FormControl>
                  </HStack>
                </Box>

                <Divider />
              </>
            )}

            {/* Add to Cart Button */}
            <HStack justify={"flex-end"}>
            <Button
              borderRadius={"full"}
              leftIcon={<FaShoppingCart />}
              colorScheme="green"
              size="md"
              w="12%"
              minW={"140px"}
              onClick={handleAddToCart}
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'lg'
              }}
              transition="all 0.2s"
            >
              Add to Cart
            </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default AddCart;