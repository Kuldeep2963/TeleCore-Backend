import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  HStack,
  Card,
  CardBody,
  Grid,
  GridItem,
  Badge
} from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';
import NumberSelection, { defaultPricingData } from './OrderNumber/AddNewNumber/NumberSelection';

function OrderNumberView({ userRole }) {
  const location = useLocation();
  const orderData = location.state?.orderData;

  const [selectedNumbers, setSelectedNumbers] = useState([]);

  // Check if this is opened from ProductInfo page
  const isFromProductInfo = orderData?.orderNo?.startsWith('PROD-');

  // If no order data is provided, show error or redirect
  if (!orderData) {
    return (
      <Box
        flex={1}
        p={6}
        bg="#f8f9fa"
        height="calc(100vh - 76px)"
        overflowY="auto"
      >
        <VStack spacing={6} align="stretch">
          <Heading color="#1a3a52" fontSize="3xl" fontWeight="bold">
            Order Not Found
          </Heading>
          <Text>No order data provided.</Text>
        </VStack>
      </Box>
    );
  }

  // Transform order data to match NumberSelection component's expected formData format
  const formData = {
    country: orderData.country?.split(' ')[0]?.toLowerCase() || 'us', // Extract country code from "United States (+1)"
    productType: orderData.productType?.toLowerCase() || 'did',
    serviceName: orderData.serviceName?.toLowerCase() || 'voice',
    areaCode: orderData.areaCode?.split(' ')[0] || '800', // Extract area code from "Toll Free (800)"
    quantity: orderData.quantity || 1
  };

  const pricingData = {
    ...defaultPricingData,
    ...(orderData.pricing || {})
  };

  const desiredPricingData = orderData.desiredPricing || {};

  const handleNumberSelectionChange = (selection) => {
    setSelectedNumbers(selection.selectedIds || []);
  };

  const handleConfigure = (numbers) => {
    // Handle configure action - could navigate to next step or show modal
    console.log('Configure clicked with numbers:', numbers);
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
        <HStack spacing={4} align="center">
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            colorScheme="blue"
            onClick={() => window.history.back()}
          >
            {isFromProductInfo ? 'Back to Products' : 'Back to Orders'}
          </Button>
          <Heading color="#1a3a52" fontSize="3xl" fontWeight="bold">
            {isFromProductInfo ? 'Product Details' : 'Order Details'} - {orderData.orderNo}
          </Heading>
        </HStack>

        {/* Order/Product Details Box */}
        <Card bg="white" borderRadius="12px" boxShadow="sm" border="1px solid" borderColor="gray.200">
          <CardBody p={6}>
            <Heading size="md" color="gray.800" mb={4}>
              {isFromProductInfo ? 'Basic Information' : 'Order Information'}
            </Heading>
            {isFromProductInfo ? (
              // Product Information Layout
              <Grid templateColumns="repeat(5, 1fr)" gap={4} alignItems="center">
                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Product Type</Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">{orderData.productType}</Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Region</Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">{orderData.region}</Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Country</Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">{orderData.country}</Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Estimated Delivery Time</Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">{orderData.edt}</Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Area Code</Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">{orderData.areaCode}</Text>
                  </VStack>
                </GridItem>
              </Grid>
            ) : (
              // Order Information Layout
              <Grid templateColumns="repeat(7, 1fr)" gap={4} alignItems="center">
                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Service Name</Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">{orderData.serviceName}</Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Country</Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">{orderData.country}</Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Product Type</Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">{orderData.productType}</Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Area Code</Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">{orderData.areaCode}</Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Order Status</Text>
                    <Badge
                      colorScheme={
                        orderData.orderStatus?.toLowerCase() === 'delivered' ? 'green' :
                        orderData.orderStatus?.toLowerCase() === 'confirmed' ? 'blue' :
                        orderData.orderStatus?.toLowerCase() === 'cancelled' ? 'red' :
                        orderData.orderStatus?.toLowerCase() === 'in progress' ? 'yellow' :
                        orderData.orderStatus?.toLowerCase() === 'amount paid' ? 'purple' : 'gray'
                      }
                      fontSize="sm"
                      borderRadius={"full"}
                      px={2}
                      py={1}
                    >
                      {orderData.orderStatus}
                    </Badge>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Order Date</Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">{orderData.orderDate}</Text>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Created By</Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">System Admin</Text>
                  </VStack>
                </GridItem>
              </Grid>
            )}
          </CardBody>
        </Card>

        <NumberSelection
          formData={formData}
          // selectedNumbers={selectedNumbers}
          onNumberSelectionChange={handleNumberSelectionChange}
          onConfigure={handleConfigure}
          showConfigureButton={false}
          pricingData={pricingData}
          desiredPricingData={desiredPricingData}
          orderStatus={orderData.orderStatus}
          readOnly
          userRole={userRole}
        />
      </VStack>
    </Box>
  );
}

export default OrderNumberView;