import React, { useRef, useState, useEffect } from 'react';
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Icon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@chakra-ui/react';
import { FaInfoCircle, FaTrash } from 'react-icons/fa';

function NumberSelection({ formData, selectedNumbers = [], onNumberSelectionChange, onConfigure }) {
  const [localSelectedNumbers, setLocalSelectedNumbers] = useState(selectedNumbers);
  const [documents, setDocuments] = useState([]);
  const fileInputRef = useRef(null);

  // Update local state when parent selectedNumbers change
  useEffect(() => {
    setLocalSelectedNumbers(selectedNumbers);
  }, [selectedNumbers]);

  // Generate available numbers from formData
  const generateAvailableNumbers = () => {
    const numbers = [];
    const baseNumbers = {
      us: '1',
      uk: '44',
      ca: '1',
      au: '61'
    };
    
    const prefix = baseNumbers[formData.country] || '1';
    const startNumber = parseInt(formData.areaCode) || 555;
    const quantity = parseInt(formData.quantity) || 3;
    
    for (let i = 0; i < quantity; i++) {
      const id = `${formData.country}-${startNumber}-${i}`;
      const number = `+${prefix} (${startNumber}) ${String(100000 + i).slice(-6)}`;
      numbers.push({
        id: id,
        number: number,
        status: 'Available'
      });
    }
    
    return numbers;
  };

  const availableNumbers = generateAvailableNumbers();

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

  const serviceRestriction = coverageData.restrictions && coverageData.restrictions.toLowerCase() === 'none' ? 'No' : 'Yes';
  const portingAvailability = coverageData.portability && coverageData.portability.toLowerCase() === 'yes' ? 'Yes' : 'No';

  const toggleNumberSelection = (numberId) => {
    const updated = localSelectedNumbers.includes(numberId)
      ? localSelectedNumbers.filter(n => n !== numberId)
      : [...localSelectedNumbers, numberId];
    
    setLocalSelectedNumbers(updated);
    if (onNumberSelectionChange) {
      onNumberSelectionChange({ selectedIds: updated });
    }
  };

  const requiredQuantity = parseInt(formData.quantity) || 1;
  const selectedQuantity = localSelectedNumbers.length;
  const pendingQuantity = Math.max(0, requiredQuantity - selectedQuantity);

  const handleConfigureClick = () => {
    if (onConfigure) {
      onConfigure(localSelectedNumbers);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Grid templateColumns={{ base: "1fr", lg: "1fr" }} gap={6}>
        {/* Left Column - Numbers and Documents */}
        <VStack spacing={6} align="stretch">
          {/* Pricing Card */}
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
                        {pricingData[key]}
                      </Td>
                    ))}
                  </Tr>
                </Tbody>
              </Table>
              <Divider mb={6} />
              <Grid px={2} templateColumns="repeat(4, 1fr)" gap={6}>
                <VStack spacing={1} align="start">
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">Billing Pulse</Text>
                  <Text fontSize="md" color="gray.800" fontWeight="semibold">{pricingData.billingPulse}</Text>
                </VStack>
                <VStack spacing={1} align="start">
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">Estimated Lead Time</Text>
                  <Text fontSize="md" color="gray.800" fontWeight="semibold">{pricingData.estimatedLeadTime}</Text>
                </VStack>
                <VStack spacing={1} align="start">
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">Contract Term</Text>
                  <Text fontSize="md" color="green" fontWeight="bold">{pricingData.contractTerm}</Text>
                </VStack>
                <VStack spacing={1} align="start">
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">Disconnection Notice Term</Text>
                  <Text fontSize="md" color="red.500" fontWeight="bold">{pricingData.disconnectionNoticeTerm}</Text>
                </VStack>
              </Grid>
            </CardBody>
          </Card>

          {/* Select Available Numbers */}
          <Card bg="white" borderRadius="12px" boxShadow="sm" border="1px solid" borderColor="gray.200">
            <CardBody p={6}>
              <Heading size="md" color="gray.800" mb={4}>Select Available Numbers</Heading>
              
              {availableNumbers.length > 0 ? (
                <Box 
                  maxH="400px" 
                  overflowY="auto" 
                  border="1px solid" 
                  borderColor="gray.200" 
                  borderRadius="md" 
                  p={3}
                  sx={{
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      bg: 'gray.100',
                      borderRadius: 'md',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      bg: 'gray.300',
                      borderRadius: 'md',
                      '&:hover': {
                        bg: 'gray.400',
                      },
                    },
                  }}
                >
                  <VStack spacing={3} align="stretch">
                    {availableNumbers.map((number) => (
                      <HStack 
                        key={number.id}
                        p={3}
                        border="1px solid"
                        borderColor={selectedNumbers.includes(number.id) ? 'blue.500' : 'gray.200'}
                        borderRadius="md"
                        cursor="pointer"
                        _hover={{ borderColor: 'blue.300', bg: 'gray.50' }}
                        onClick={() => toggleNumberSelection(number.id)}
                        bg={selectedNumbers.includes(number.id) ? 'blue.50' : 'white'}
                        transition="all 0.2s"
                      >
                        <Text flex={1} fontWeight="medium">{number.number}</Text>
                        <Badge colorScheme={number.status === 'Available' ? 'green' : 'orange'}>
                          {number.status}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              ) : (
                <Text color="gray.500" textAlign="center" py={8}>
                  Currently, there are no available numbers.
                </Text>
              )}

              {/* Quantity Summary */}
              <Grid templateColumns="repeat(3, 1fr)" gap={4} mt={6} p={4} bg="gray.50" borderRadius="md">
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">Required Quantity</Text>
                  <Text fontSize="lg" color="gray.800" fontWeight="bold">{requiredQuantity}</Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">Selected Quantity</Text>
                  <Text fontSize="lg" color="gray.800" fontWeight="bold">{selectedQuantity}</Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">Pending Quantity</Text>
                  <Text fontSize="lg" color="gray.800" fontWeight="bold">{pendingQuantity}</Text>
                </VStack>
              </Grid>
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
          <Icon as={FaInfoCircle} color="blue.500" cursor="pointer" />
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
                      <IconButton
                        aria-label="Delete document"
                        icon={<FaTrash />}
                        variant="ghost"
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDeleteDocument(document.id)}
                      />
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
    </VStack>
  );
}

export default NumberSelection;