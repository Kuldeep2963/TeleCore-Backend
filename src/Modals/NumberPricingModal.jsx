import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Badge,
  Card,
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
    if (!selectedNumber?.product_id || !selectedNumber?.country_id) {
      setError('Missing product or country information');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.pricing.getByProduct(selectedNumber.product_id, selectedNumber.country_id);
      
      if (response.success && response.data) {
        setPricingData(response.data);
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
    const fieldMaps = {
      did: ['nrc', 'mrc', 'ppm'],
      freephone: ['nrc', 'mrc', 'ppm_fix', 'ppm_mobile', 'ppm_payphone'],
      universal: ['nrc', 'mrc', 'ppm_fix', 'ppm_mobile', 'ppm_payphone'],
      'two-way-voice': ['nrc', 'mrc', 'incoming_ppm', 'outgoing_ppm_fix', 'outgoing_ppm_mobile'],
      'two-way-sms': ['nrc', 'mrc', 'arc', 'mo', 'mt'],
      mobile: ['nrc', 'mrc', 'incoming_ppm', 'outgoing_ppm_fix', 'outgoing_ppm_mobile', 'incoming_sms', 'outgoing_sms']
    };

    const fieldLabels = {
      nrc: 'NRC',
      mrc: 'MRC',
      ppm: 'PPM',
      ppm_fix: 'PPM Fix',
      ppm_mobile: 'PPM Mobile',
      ppm_payphone: 'PPM Payphone',
      incoming_ppm: 'Incoming PPM',
      outgoing_ppm_fix: 'Outgoing Fix PPM',
      outgoing_ppm_mobile: 'Outgoing Mobile PPM',
      arc: 'ARC',
      mo: 'MO',
      mt: 'MT',
      incoming_sms: 'Incoming SMS',
      outgoing_sms: 'Outgoing SMS'
    };

    const code = productCode?.toLowerCase() || 'did';
    const fields = fieldMaps[code] || fieldMaps.did;

    return {
      fields,
      labels: fieldLabels
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"5xl"} scrollBehavior="inside" isCentered isScrollable>
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

              <Card bg="white" borderRadius="12px" boxShadow="sm" border="1px solid" borderColor="gray.200">
                <CardBody>
                  <Heading size="md" color="gray.800" mb={4}>Pricing</Heading>
                  {loading ? (
                    <Center py={8}>
                      <Spinner size="lg" color="blue.500" />
                    </Center>
                  ) : error ? (
                    <Text color="red.500" textAlign="center">{error}</Text>
                  ) : pricingData ? (
                    <>
                      <Table variant="simple" mb={6}>
                        <Thead bg="gray.200">
                          <Tr>
                            {getPricingFields(pricingData.product_code).fields.map((field) => (
                              <Th fontSize={"sm"} key={field} textAlign="center" color="gray.800" fontWeight="semibold">
                                {getPricingFields(pricingData.product_code).labels[field]}
                              </Th>
                            ))}
                          </Tr>
                        </Thead>
                        <Tbody>
                          <Tr>
                            {getPricingFields(pricingData.product_code).fields.map((field) => (
                              <Td key={field} textAlign="center" fontSize="lg" color="green" fontWeight="bold">
                                {formatPrice(pricingData[field])}
                              </Td>
                            ))}
                          </Tr>
                        </Tbody>
                      </Table>
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
                </CardBody>
              </Card>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default NumberPricingModal;