import React, { useState, useEffect } from 'react';
import { PRICING_FIELDS_BY_PRODUCT, PRICING_FIELD_LABELS, PRICING_HEADINGS } from '../constants/pricingConstants';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Badge,
  Card,
  Box,
  CardBody,
  Heading,
  Text,
  VStack,
  Grid,
  GridItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
  Spinner,
  Center
} from '@chakra-ui/react';
import api from '../services/api';

function NumberPricingModal({ isOpen, onClose, selectedNumber }) {
  const [pricingData, setPricingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && selectedNumber) {
      fetchPricingData();
    }
  }, [isOpen, selectedNumber]);

  const fetchPricingData = async () => {
    if (!selectedNumber?.order_id) {
      setError('Missing order information');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.orders.getPricing(selectedNumber.order_id);
      
      if (response.success && response.data) {
        const currentPricing = Array.isArray(response.data) 
          ? response.data.find(p => p.pricing_type === 'current') || response.data[0]
          : response.data;
        
        if (currentPricing && selectedNumber?.product_id && selectedNumber?.country_id) {
          try {
            const pricingPlanResponse = await api.pricing.getByProduct(selectedNumber.product_id, selectedNumber.country_id);
            if (pricingPlanResponse.success && pricingPlanResponse.data) {
              const planData = pricingPlanResponse.data;
              const mergedPricing = {
                ...currentPricing,
                billing_pulse: planData.billing_pulse,
                estimated_lead_time: planData.estimated_lead_time,
                contract_term: planData.contract_term,
                disconnection_notice_term: planData.disconnection_notice_term
              };
              setPricingData(mergedPricing);
            } else {
              setPricingData(currentPricing);
            }
          } catch (err) {
            console.warn('Could not fetch additional pricing metadata:', err);
            setPricingData(currentPricing);
          }
        } else {
          setPricingData(currentPricing);
        }
      } else {
        setError('Pricing data not available');
      }
    } catch (err) {
      console.error('Error fetching pricing data:', err);
      setError('Failed to load pricing information');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '-';
    return typeof price === 'number' ? `$${price.toFixed(4)}` : price;
  };

  const getPricingFields = (productCode) => {
    const code = productCode?.toLowerCase() || 'did';
    const fields = PRICING_FIELDS_BY_PRODUCT[code] || PRICING_FIELDS_BY_PRODUCT.did;
    const headings = PRICING_HEADINGS[code] || PRICING_HEADINGS.did;

    const labels = {};
    fields.forEach((field) => {
      labels[field] = headings[field] || PRICING_FIELD_LABELS[field] || field;
    });

    return {
      fields,
      labels
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{base:"sm",md:"5xl"}} scrollBehavior="inside" isCentered isScrollable>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader>
          Number Details - {selectedNumber?.number}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {selectedNumber && (
            <VStack spacing={4} align="stretch">
              <Card bg="white" borderRadius="12px" boxShadow="sm" border="1px solid" borderColor="gray.200">
                <CardBody p={3}>
                  <Heading size="md" color="gray.800" mb={4}>Number Information</Heading>
                  <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                    <VStack spacing={1} align="start">
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">Country</Text>
                      <Text fontSize="md" color="gray.800" fontWeight="semibold">{selectedNumber.country_name}</Text>
                    </VStack>
                    <VStack spacing={1} align="start">
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">Product Type</Text>
                      <Text fontSize="md" color="gray.800" fontWeight="semibold">{selectedNumber.product_name}</Text>
                    </VStack>
                    <VStack spacing={1} align="start">
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">Area Code</Text>
                      <Text fontSize="md" color="gray.800" fontWeight="semibold">{selectedNumber.area_code}</Text>
                    </VStack>
                    <VStack spacing={1} align="start">
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">Number</Text>
                      <Text fontSize="md" color="gray.800" fontWeight="semibold">{selectedNumber.number}</Text>
                    </VStack>
                  </Grid>
                </CardBody>
              </Card>
                 <Box>
                  <Heading size="md" color="gray.800" mb={4}>{selectedNumber.product_name} Pricing</Heading>
                  {loading ? (
                    <Center py={8}>
                      <Spinner size="lg" color="blue.500" />
                    </Center>
                  ) : error ? (
                    <Text color="red.500" textAlign="center">{error}</Text>
                  ) : pricingData ? (
                    <>
                      {(() => {
                        const pricingFields = getPricingFields(pricingData.product_code);
                        return (
                          <Table variant="simple" mb={6}>
                            <Thead bg="gray.200">
                              <Tr>
                                {pricingFields.fields.map((field) => (
                                  <Th fontSize={"sm"} key={field} textAlign="center" color="gray.800" fontWeight="semibold">
                                    {pricingFields.labels[field]}
                                  </Th>
                                ))}
                              </Tr>
                            </Thead>
                            <Tbody>
                              <Tr>
                                {pricingFields.fields.map((field) => (
                                  <Td key={field} textAlign="center" fontSize="lg" color="green" fontWeight="bold">
                                    {formatPrice(pricingData[field])}
                                  </Td>
                                ))}
                              </Tr>
                            </Tbody>
                          </Table>
                        );
                      })()}
                      <Divider mb={6} />
                      <Grid px={2} templateColumns="repeat(4, 1fr)" gap={6}>
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">Billing Pulse</Text>
                          <Text fontSize="md" color="gray.800" fontWeight="semibold">{pricingData.billing_pulse || '-'}</Text>
                        </VStack>
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">Estimated Lead Time</Text>
                          <Text fontSize="md" color="gray.800" fontWeight="semibold">{pricingData.estimated_lead_time || '-'}</Text>
                        </VStack>
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">Contract Term</Text>
                          <Text fontSize="md" color="green" fontWeight="bold">{pricingData.contract_term || '-'}</Text>
                        </VStack>
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">Disconnection Notice Term</Text>
                          <Text fontSize="md" color="red.500" fontWeight="bold">{pricingData.disconnection_notice_term || '-'}</Text>
                        </VStack>
                      </Grid>
                    </>
                  ) : (
                    <Text color="gray.600" textAlign="center">No pricing data available</Text>
                  )}
                  </Box>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default NumberPricingModal;