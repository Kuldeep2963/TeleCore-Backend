import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Input,
  IconButton,
  VStack,
  HStack,
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
  Icon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Spinner,
  Center,
  useToast
} from '@chakra-ui/react';
import { FaInfoCircle, FaTrash, FaEye } from 'react-icons/fa';
import DocumentRequiredModal from '../../../Modals/DocumentRequiredModal';
import api from '../../../services/api';

export const defaultPricingData = {
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

function NumberSelection({
  formData,
  selectedNumbers = [],
  onNumberSelectionChange,
  onConfigure,
  showConfigureButton = true,
  pricingData: pricingDataProp,
  desiredPricingData,
  onDesiredPricingChange = () => {},
  orderStatus,
  readOnly = false,
  userRole
}) {
  const [documents, setDocuments] = useState([]);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [bargainData, setBargainData] = useState({});
  const [fetchedPricingData, setFetchedPricingData] = useState(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [countries, setCountries] = useState([]);
  const fileInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchPricingData();
  }, [formData.productType, formData.country, countries]);

  const fetchCountries = async () => {
    try {
      console.log('Fetching countries from API...');
      const response = await api.countries.getAll();
      console.log('Countries API response:', response);
      if (response.success) {
        console.log('Countries data:', response.data);
        setCountries(response.data);
      } else {
        console.error('Countries API returned unsuccessful:', response);
        // Fallback to some test data if API fails
        console.log('Using fallback country data');
        setCountries([
          { id: 1, code: 'us', name: 'United States', phone_code: '+1' },
          { id: 2, code: 'uk', name: 'United Kingdom', phone_code: '+44' },
          { id: 3, code: 'ca', name: 'Canada', phone_code: '+1' },
          { id: 4, code: 'au', name: 'Australia', phone_code: '+61' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      // Fallback to some test data if API fails
      console.log('Using fallback country data due to error');
      setCountries([
        { id: 1, code: 'us', name: 'United States', phone_code: '+1' },
        { id: 2, code: 'uk', name: 'United Kingdom', phone_code: '+44' },
        { id: 3, code: 'ca', name: 'Canada', phone_code: '+1' },
        { id: 4, code: 'au', name: 'Australia', phone_code: '+61' }
      ]);
    }
  };

  const fetchPricingData = async () => {
    if (!formData.productType || !formData.country) {
      return;
    }

    try {
      setLoadingPricing(true);

      // Map product type to product ID (this would need proper mapping)
      // For now, we'll use a simple mapping
      const productTypeMap = {
        'did': 1, // DID
        'freephone': 2, // Freephone
        'universal': 3, // Universal Freephone
        'two-way-voice': 4, // Two Way Voice
        'two-way-sms': 5, // Two Way SMS
        'mobile': 6 // Mobile
      };

      // Build country code map dynamically from API data
      const countryCodeMap = {};
      countries.forEach((country, index) => {
        countryCodeMap[country.code] = country.id || index + 1;
      });

      const productId = productTypeMap[formData.productType];
      const countryId = countryCodeMap[formData.country];

      if (productId && countryId) {
        const response = await api.pricing.getByProduct(productId, countryId);
        if (response.success) {
          // Transform the pricing data to match the expected format
          const pricing = response.data;
          const transformedPricing = {
            nrc: `$${pricing.nrc || 0}`,
            mrc: `$${pricing.mrc || 0}`,
            ppm: `$${pricing.ppm || 0}`,
            ppmFix: `$${pricing.ppm_fix || 0}`,
            ppmMobile: `$${pricing.ppm_mobile || 0}`,
            ppmPayphone: `$${pricing.ppm_payphone || 0}`,
            arc: `$${pricing.arc || 0}`,
            mo: `$${pricing.mo || 0}`,
            mt: `$${pricing.mt || 0}`,
            Incomingppm: `$${pricing.incoming_ppm || 0}`,
            Outgoingppmfix: `$${pricing.outgoing_ppm_fix || 0}`,
            Outgoingppmmobile: `$${pricing.outgoing_ppm_mobile || 0}`,
            incmongsms: `$${pricing.incoming_sms || 0}`,
            outgoingsms: `$${pricing.outgoing_sms || 0}`,
            billingPulse: pricing.billing_pulse || '60/60',
            estimatedLeadTime: pricing.estimated_lead_time || '15 Days',
            contractTerm: pricing.contract_term || '1 Month',
            disconnectionNoticeTerm: pricing.disconnection_notice_term || '1 Month'
          };
          setFetchedPricingData(transformedPricing);
        }
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      // Fall back to default pricing if API fails
      setFetchedPricingData(null);
    } finally {
      setLoadingPricing(false);
    }
  };

  // Define pricing headings based on product type
  const pricingHeadings = {
    did: { nrc: 'NRC', mrc: 'MRC', ppm: 'PPM' },
    freephone: { nrc: 'NRC', mrc: 'MRC', ppmFix: 'PPM Fix', ppmMobile: 'PPM Mobile', ppmPayphone: 'PPM Payphone' },
    universal: { nrc: 'NRC', mrc: 'MRC', ppmFix: 'PPM Fix', ppmMobile: 'PPM Mobile', ppmPayphone: 'PPM Payphone' },
    'two-way-voice': { nrc: 'NRC', mrc: 'MRC', ppmIncoming: 'Incoming PPM', ppmOutgoingfix: 'Outgoing Fix PPM', ppmOutgoingmobile: 'Outgoing Mobile PPM' },
    'two-way-sms': { nrc: 'NRC', mrc: 'MRC', arc: 'ARC', mo: 'MO', mt: 'MT' },
    mobile: { nrc: 'NRC', mrc: 'MRC', Incomingppm: 'Incoming PPM', Outgoingppmfix: 'Outgoing Fix PPM', Outgoingppmmobile: 'Outgoing Mobile PPM', incmongsms: 'Incoming SMS', outgoingsms: 'Outgoing SMS' }
  };

  const currentHeadings = pricingHeadings[formData.productType] || pricingHeadings.did;

  const mergedPricingData = useMemo(() => ({
    ...defaultPricingData,
    ...(fetchedPricingData || {}),
    ...(pricingDataProp || {})
  }), [fetchedPricingData, pricingDataProp]);

  const pricingData = mergedPricingData;

  const desiredPricingMap = useMemo(() => {
    const next = {};
    Object.keys(currentHeadings).forEach((key) => {
      next[key] = desiredPricingData?.[key] ?? mergedPricingData[key] ?? '';
    });
    return next;
  }, [currentHeadings, desiredPricingData, mergedPricingData]);

  useEffect(() => {
    setBargainData(desiredPricingMap);
  }, [desiredPricingMap]);

  const handleDesiredPricingChange = (key, value) => {
    if (readOnly) {
      return;
    }
    setBargainData((prev) => {
      const next = { ...prev, [key]: value };
      onDesiredPricingChange(next);
      return next;
    });
  };

const statusKey = orderStatus ? orderStatus.toLowerCase() : '';
const showBasePricing = !['confirmed', 'delivered', 'amount paid'].includes(statusKey);
const desiredPricingHeading = ['confirmed', 'delivered', 'amount paid'].includes(statusKey) ? 'Pricing' : 'Desired Pricings';

  const coverageData = {
    restrictions: 'None',
    channels: 'SMS, Voice',
    portability: 'Yes',
    fix: 'Supported',
    mobile: 'Supported',
    payphone: 'Not Supported'
  };

  const channelDetails = {
    defaultChannels: '2',
    maximumChannels: '10',
    extraChannelPrice: '$45.00'
  };

  // Required documents for number ordering
  const requiredDocuments = [
    { name: 'Business License', required: true, description: 'Valid business registration certificate' },
    { name: 'Tax Certificate', required: true, description: 'Latest tax clearance certificate' },
    { name: 'ID Proof', required: false, description: 'Government issued ID for authorized signatory' },
    { name: 'Address Proof', required: true, description: 'Utility bill or bank statement showing address' },
    { name: 'Bank Details', required: true, description: 'Bank account details for payment processing' }
  ];

  const formatDocumentType = (file) => {
    if (file.type) {
      const parts = file.type.split('/');
      return (parts[1] || file.type).toUpperCase();
    }
    const segments = file.name.split('.');
    return segments.length > 1 ? segments.pop().toUpperCase() : 'UNKNOWN';
  };

  const handleChooseFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const { files } = event.target;
    if (!files || files.length === 0) {
      return;
    }
    const timestamp = Date.now();
    const newDocuments = Array.from(files).map((file, index) => ({
      id: `${timestamp}-${index}`,
      name: file.name,
      type: formatDocumentType(file),
      uploadedAt: new Date().toISOString(),
      file
    }));
    setDocuments((prev) => [...prev, ...newDocuments]);
    event.target.value = '';
  };

  const handleDeleteDocument = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleViewDocument = (document) => {
    if (document.file) {
      const url = URL.createObjectURL(document.file);
      window.open(url, '_blank');
    }
  };

  const serviceRestriction = coverageData.restrictions && coverageData.restrictions.toLowerCase() === 'none' ? 'No' : 'Yes';
  const portingAvailability = coverageData.portability && coverageData.portability.toLowerCase() === 'yes' ? 'Yes' : 'No';





  const handleConfigureClick = () => {
    if (onConfigure) {
      onConfigure([]);
    }
  };

  if (loadingPricing) {
    return (
      <Center py={8}>
        <Spinner size="lg" color="blue.500" />
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Grid templateColumns={{ base: "1fr", lg: "1fr" }} gap={6}>
        {/* Left Column - Numbers and Documents */}
        <VStack spacing={6} align="stretch">
          {/* Pricing Card */}
          {showBasePricing && (
            <Card bg="white" borderRadius="12px" boxShadow="sm" border="1px solid" borderColor="gray.200">
              <CardBody p={6}>
                <Heading size="md" color="gray.800" mb={4}>Pricing</Heading>
                <Table variant="simple" mb={6}>
                  <Thead bg="gray.200">
                    <Tr>
                      {Object.keys(currentHeadings).map((key) => (
                        <Th fontSize={"sm"} key={key} textAlign="center" color="gray.800" fontWeight="semibold">
                          {currentHeadings[key]}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      {Object.keys(currentHeadings).map((key) => (
                        <Td key={key} textAlign="center" fontSize="lg" color="green" fontWeight="bold">
                          {pricingData[key] ?? '—'}
                        </Td>
                      ))}
                    </Tr>
                  </Tbody>
                </Table>
                <Divider mb={6} />
                <Grid px={2} templateColumns="repeat(4, 1fr)" gap={6}>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Billing Pulse</Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">{pricingData.billingPulse ?? '—'}</Text>
                  </VStack>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Estimated Lead Time</Text>
                    <Text fontSize="md" color="gray.800" fontWeight="semibold">{pricingData.estimatedLeadTime ?? '—'}</Text>
                  </VStack>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Contract Term</Text>
                    <Text fontSize="md" color="green" fontWeight="bold">{pricingData.contractTerm ?? '—'}</Text>
                  </VStack>
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Disconnection Notice Term</Text>
                    <Text fontSize="md" color="red.500" fontWeight="bold">{pricingData.disconnectionNoticeTerm ?? '—'}</Text>
                  </VStack>
                </Grid>
              </CardBody>
            </Card>
          )}

          {/* Bargain Card */}
          <Card bg="white" borderRadius="12px" boxShadow="sm" border="1px solid" borderColor="gray.200">
            <CardBody p={6}>
              <Heading size="md" color="gray.800" mb={4}>{desiredPricingHeading}</Heading>
              <Table variant="simple" mb={6}>
                <Thead bg="gray.200">
                  <Tr>
                    {Object.keys(currentHeadings).map((key) => (
                      <Th fontSize={"sm"} key={key} textAlign="center" color="gray.800" fontWeight="semibold">
                        {currentHeadings[key]}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    {Object.keys(currentHeadings).map((key) => (
                      <Td key={key} textAlign="center">
                        <Input
                          value={bargainData[key] || ''}
                          onChange={(e) => handleDesiredPricingChange(key, e.target.value)}
                          size="sm"
                          textAlign="center"
                          fontSize="lg"
                          fontWeight="bold"
                          color="green"
                          isReadOnly={readOnly}
                        />
                      </Td>
                    ))}
                  </Tr>
                </Tbody>
              </Table>
            </CardBody>
          </Card>

          {/* Documents Required */}
         <Card bg="white" borderRadius="12px" boxShadow="sm" border="1px solid" borderColor="gray.200">
  <CardBody p={6}>
    <Heading size="md" color="gray.800" mb={4}>Documents Required</Heading>
    
    <VStack spacing={6} align="stretch">
      {/* Required Docs */}
      <Box >
        <HStack gap={8}>
        <VStack>
        <HStack gap={6} >
          <Text fontWeight="semibold" color="gray.700">Required Docs</Text>
          <Icon as={FaInfoCircle} color="blue.500" cursor="pointer" onClick={() => setIsDocumentsModalOpen(true)} />
        </HStack>
        <Text fontSize="sm" color="gray.600" mb={2}>click the info icon for details</Text>
        </VStack>
        <Box 
          border="2px dashed" 
          borderColor="gray.300" 
          borderRadius="md" 
          p={4} 
          textAlign="center"
          mb={4}
          cursor="pointer"
          _hover={{ bg: "gray.50" }}
          onClick={handleChooseFile}
          tabIndex={0}
          role="button"
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleChooseFile();
            }
          }}
        >
          <VStack spacing={2}>
            <Text fontWeight="medium">Choose files</Text>
            <Text fontSize="sm" color="gray.500">
              Maximum file size: 10 MB<br />
              File type: pdf, jpeg, png, doc, docx
            </Text>
          </VStack>
        </Box>
        <Input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          display="none"
          accept=".pdf,.jpeg,.jpg,.png,.doc,.docx"
        />
        </HStack>
        
        <Divider/>
      </Box>

      {/* uploaded documents */}
      <Box>
        <Box overflow="hidden" borderRadius="md" border="1px solid" borderColor="gray.200">
          <Table variant="simple">
            <Thead bg="gray.300">
              <Tr>
                <Th color={"gray.800"}>No.</Th>
                <Th color={"gray.800"}>Document Name</Th>
                <Th color={"gray.800"}>Document Type</Th>
                <Th color={"gray.800"}>Uploaded Date</Th>
                <Th color={"gray.800"}>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {documents.length > 0 ? (
                documents.map((document, index) => (
                  <Tr key={document.id}>
                    <Td fontWeight="medium">{index + 1}</Td>
                    <Td>{document.name}</Td>
                    <Td textTransform="uppercase">{document.type}</Td>
                    <Td>{new Date(document.uploadedAt).toLocaleString()}</Td>
                    <Td>
                      {userRole === 'Internal' ? (
                        <IconButton
                          aria-label="View document"
                          icon={<FaEye />}
                          variant="ghost"
                          colorScheme="blue"
                          size="sm"
                          onClick={() => handleViewDocument(document)}
                        />
                      ) : (
                        <IconButton
                          aria-label="Delete document"
                          icon={<FaTrash />}
                          variant="ghost"
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleDeleteDocument(document.id)}
                        />
                      )}
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={5} textAlign="center" color="gray.500">No documents uploaded.</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
          
        </Box>
      </Box>
    </VStack>
  </CardBody>
</Card>

        <Card bg="white" borderRadius="12px" h={"250px"} boxShadow="sm" border="1px solid" borderColor="gray.200">
          <CardBody p={6}>
            <Heading size="md" color="gray.800" mb={4}>Service Details</Heading>
            <Tabs variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab>Coverage</Tab>
                <Tab>Restriction</Tab>
                <Tab>Channels</Tab>
                <Tab>Portability</Tab>
              </TabList>
              <TabPanels mt={4}>
                <TabPanel px={0}>
                  <Table variant="simple">
                    <Thead bg="gray.100">
                      <Tr>
                        <Th color="gray.700">Fix</Th>
                        <Th color="gray.700">Mobile</Th>
                        <Th color="gray.700">Payphone</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>{coverageData.fix}</Td>
                        <Td>{coverageData.mobile}</Td>
                        <Td>{coverageData.payphone}</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TabPanel>
                <TabPanel>
                  <HStack spacing={6}>
                  <Text fontSize="md" color="gray.700">Service Restriction:</Text>
                  <Text fontSize="lg" fontWeight="bold" color={serviceRestriction === 
                    'No' ? 'green.600' : 'red.600'}>{serviceRestriction}</Text>
                  </HStack>
                </TabPanel>
                <TabPanel px={0}>
                  <Table variant="simple">
                    <Thead bg="gray.100">
                      <Tr>
                        <Th color="gray.700">Default Channels</Th>
                        <Th color="gray.700">Maximum Channels</Th>
                        <Th color="gray.700">Price of Extra Channels/Month</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>{channelDetails.defaultChannels}</Td>
                        <Td>{channelDetails.maximumChannels}</Td>
                        <Td>{channelDetails.extraChannelPrice}</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TabPanel>
                <TabPanel>
                  <HStack spacing={6}>
                  <Text fontSize="md" color="gray.700">Porting Availability:</Text>
                  <Text fontSize="lg" fontWeight="bold" color={portingAvailability === 'Yes' ? 
                    'green.600' : 'red.600'}>{portingAvailability}</Text>
                  </HStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
        </VStack>
      </Grid>
      {showConfigureButton && (
        <HStack justify="flex-end">
          <Button
            onClick={handleConfigureClick}
            colorScheme="green"
            size="md"
            w="12%"
            borderRadius="full"
            fontWeight="semibold"
            boxShadow="0 2px 4px rgba(49, 130, 206, 0.25)"
            _hover={{
              boxShadow: '0 4px 12px rgba(49, 130, 206, 0.35)'
            }}
            transition="all 0.2s ease"
          >
            Configure
          </Button>
        </HStack>
      )}

      <DocumentRequiredModal
        isOpen={isDocumentsModalOpen}
        onClose={() => setIsDocumentsModalOpen(false)}
        documents={requiredDocuments}
        title="Required Documents"
      />
    </VStack>
  );
}

export default NumberSelection;