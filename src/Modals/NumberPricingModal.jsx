import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
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
  Divider
} from '@chakra-ui/react';

function NumberPricingModal({ isOpen, onClose, selectedNumber }) {
  // Pricing data based on product type
  const getPricingData = (productType) => {
    const pricingHeadings = {
      did: { nrc: 'NRC', mrc: 'MRC', ppm: 'PPM' },
      freephone: { nrc: 'NRC', mrc: 'MRC', ppmFix: 'PPM Fix', ppmMobile: 'PPM Mobile', ppmPayphone: 'PPM Payphone' },
      universal: { nrc: 'NRC', mrc: 'MRC', ppmFix: 'PPM Fix', ppmMobile: 'PPM Mobile', ppmPayphone: 'PPM Payphone' },
      'two-way-voice': { nrc: 'NRC', mrc: 'MRC', ppmIncoming: 'Incoming PPM', ppmOutgoingfix: 'Outgoing Fix PPM', ppmOutgoingmobile: 'Outgoing Mobile PPM' },
      'two-way-sms': { nrc: 'NRC', mrc: 'MRC', arc: 'ARC', mo: 'MO', mt: 'MT' },
      mobile: { nrc: 'NRC', mrc: 'MRC', Incomingppm: 'Incoming PPM', Outgoingppmfix: 'Outgoing Fix PPM', Outgoingppmmobile: 'Outgoing Mobile PPM', incmongsms: 'Incoming SMS', outgoingsms: 'Outgoing SMS' }
    };

    const pricingData = {
      nrc: '$24.00',
      mrc: '$24.00',
      ppm: '$0.0380',
      ppmFix: '$0.0250',
      ppmMobile: '$0.0350',
      ppmPayphone: '$0.0450',
      ppmIncoming: '$0.0200',
      ppmOutgoingfix: '$0.0300',
      ppmOutgoingmobile: '$0.0400',
      arc: '$0.0150',
      mo: '$0.0120',
      mt: '$0.0180',
      Incomingppm: '$0.0220',
      Outgoingppmfix: '$0.0320',
      Outgoingppmmobile: '$0.0420',
      incmongsms: '$0.0100',
      outgoingsms: '$0.0160',
      billingPulse: '60/60',
      estimatedLeadTime: '15 Days',
      contractTerm: '1 Month',
      disconnectionNoticeTerm: '1 Month'
    };

    return {
      headings: pricingHeadings[productType?.toLowerCase()] || pricingHeadings.did,
      data: pricingData
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"5xl"} scrollBehavior="inside" isCentered isScrollable  >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Number Details - {selectedNumber?.number}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {selectedNumber && (
            <VStack spacing={4} align="stretch">
              {/* Number Information */}
              <Card bg="white" borderRadius="12px" boxShadow="sm" border="1px solid" borderColor="gray.200">
                <CardBody p={3}>
                  <Heading size="md" color="gray.800" mb={4}>Number Information</Heading>
                  <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                    <VStack spacing={1} align="start">
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">Country</Text>
                      <Text fontSize="md" color="gray.800" fontWeight="semibold">{selectedNumber.country}</Text>
                    </VStack>
                    <VStack spacing={1} align="start">
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">Product Type</Text>
                      <Text fontSize="md" color="gray.800" fontWeight="semibold">{selectedNumber.productType}</Text>
                    </VStack>
                    <VStack spacing={1} align="start">
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">Area Code</Text>
                      <Text fontSize="md" color="gray.800" fontWeight="semibold">{selectedNumber.areaCode}</Text>
                    </VStack>
                    <VStack spacing={1} align="start">
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">Number</Text>
                      <Text fontSize="md" color="gray.800" fontWeight="semibold">{selectedNumber.number}</Text>
                    </VStack>
                  </Grid>
                </CardBody>
              </Card>

              {/* Pricing Card */}
              <Card bg="white" borderRadius="12px" boxShadow="sm" border="1px solid" borderColor="gray.200">
                <CardBody>
                  <Heading size="md" color="gray.800" mb={4}>Pricing</Heading>
                  {(() => {
                    const pricingInfo = getPricingData(selectedNumber.productType);
                    return (
                      <>
                        <Table variant="simple" mb={6}>
                          <Thead bg="gray.200">
                            <Tr>
                              {Object.keys(pricingInfo.headings).map((key) => (
                                <Th fontSize={"sm"} key={key} textAlign="center" color="gray.800" fontWeight="semibold">
                                  {pricingInfo.headings[key]}
                                </Th>
                              ))}
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr>
                              {Object.keys(pricingInfo.headings).map((key) => (
                                <Td key={key} textAlign="center" fontSize="lg" color="green" fontWeight="bold">
                                  {pricingInfo.data[key]}
                                </Td>
                              ))}
                            </Tr>
                          </Tbody>
                        </Table>
                        <Divider mb={6} />
                        <Grid px={2} templateColumns="repeat(4, 1fr)" gap={6}>
                          <VStack spacing={1} align="start">
                            <Text fontSize="sm" color="gray.600" fontWeight="medium">Billing Pulse</Text>
                            <Text fontSize="md" color="gray.800" fontWeight="semibold">{pricingInfo.data.billingPulse}</Text>
                          </VStack>
                          <VStack spacing={1} align="start">
                            <Text fontSize="sm" color="gray.600" fontWeight="medium">Estimated Lead Time</Text>
                            <Text fontSize="md" color="gray.800" fontWeight="semibold">{pricingInfo.data.estimatedLeadTime}</Text>
                          </VStack>
                          <VStack spacing={1} align="start">
                            <Text fontSize="sm" color="gray.600" fontWeight="medium">Contract Term</Text>
                            <Text fontSize="md" color="green" fontWeight="bold">{pricingInfo.data.contractTerm}</Text>
                          </VStack>
                          <VStack spacing={1} align="start">
                            <Text fontSize="sm" color="gray.600" fontWeight="medium">Disconnection Notice Term</Text>
                            <Text fontSize="md" color="red.500" fontWeight="bold">{pricingInfo.data.disconnectionNoticeTerm}</Text>
                          </VStack>
                        </Grid>
                      </>
                    );
                  })()}
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