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

export const defaultPricingData = {};

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
  userRole,
  documents: documentsFromOrder = [],
  orderId = null,
  hideDesiredPricing = false
}) {
  const [documents, setDocuments] = useState([]);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [bargainData, setBargainData] = useState({});
  const [fetchedPricingData, setFetchedPricingData] = useState(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [loadingServiceDetails, setLoadingServiceDetails] = useState(false);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [loadingRequiredDocuments, setLoadingRequiredDocuments] = useState(false);
  const [countries, setCountries] = useState([]);
  const [products, setProducts] = useState([]);
  const [coverageData, setCoverageData] = useState(null);
  const [channelDetails, setChannelDetails] = useState(null);
  const [loadingCoverageChannel, setLoadingCoverageChannel] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    fetchCountries();
    fetchProducts();
  }, []);

  useEffect(() => {
    // Load documents from order when in read-only mode
    if (readOnly && Array.isArray(documentsFromOrder)) {
      const loadedDocuments = documentsFromOrder.map((doc, index) => {
        // doc can be an array [filename, originalname, mimetype, size, uploadDate] or an object
        if (Array.isArray(doc)) {
          const [filename, originalname, mimetype, size, uploadDate] = doc;
          return {
            id: `order-doc-${index}`,
            name: originalname,
            type: mimetype?.split('/')[1]?.toUpperCase() || 'UNKNOWN',
            uploadedAt: uploadDate,
            filename: filename,
            size: size
          };
        } else if (typeof doc === 'object' && doc !== null) {
          return {
            id: `order-doc-${index}`,
            name: doc.originalname || doc.name || 'Unknown',
            type: doc.mimetype?.split('/')[1]?.toUpperCase() || doc.type || 'UNKNOWN',
            uploadedAt: doc.uploadDate || doc.uploadedAt,
            filename: doc.filename,
            size: doc.size
          };
        }
        return null;
      }).filter(Boolean);
      setDocuments(loadedDocuments);
    }
  }, [readOnly, documentsFromOrder]);

  useEffect(() => {
    console.log('Form data changed:', { productType: formData.productType, country: formData.country });
    console.log('Countries:', countries);
    console.log('Products:', products);
    fetchPricingData();
    fetchServiceDetails();
    fetchRequiredDocuments();
  }, [formData.productType, formData.country, countries, products]);

  const fetchCountries = async () => {
    try {
      console.log('Fetching countries...');
      const response = await api.countries.getAll();
      console.log('Countries response:', response);
      if (response.success) {
        console.log('Countries loaded:', response.data);
        setCountries(response.data);
      } else {
        console.error('Countries API returned unsuccessful:', response);
        setCountries([]);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([]);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const response = await api.products.getAll();
      console.log('Products response:', response);
      if (response.success) {
        console.log('Products with codes:', response.data);
        setProducts(response.data);
      } else {
        console.error('Products API returned unsuccessful:', response);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchPricingData = async () => {
    // Always fetch general pricing data from pricing_plans for base pricing
    if (!formData.productType || !formData.country) {
      return;
    }

    try {
      setLoadingPricing(true);

      const product = products.find(p => p.code?.toLowerCase() === formData.productType?.toLowerCase());
      const country = countries.find(c => c.countryname?.toLowerCase().includes(formData.country?.toLowerCase().split(' ')[0]));

      console.log('Fetching pricing - Product:', product, 'Country:', country);

      if (product && country) {
        const response = await api.pricing.getByProduct(product.id, country.id);
        console.log('Pricing response:', response);
        if (response.success) {
          const pricing = response.data;
          const formatPrice = (value) => `$${parseFloat(value || 0).toFixed(4)}`;
          const transformedPricing = {
            nrc: formatPrice(pricing.nrc),
            mrc: formatPrice(pricing.mrc),
            ppm: formatPrice(pricing.ppm),
            ppmFix: formatPrice(pricing.ppm_fix),
            ppmMobile: formatPrice(pricing.ppm_mobile),
            ppmPayphone: formatPrice(pricing.ppm_payphone),
            arc: formatPrice(pricing.arc),
            mo: formatPrice(pricing.mo),
            mt: formatPrice(pricing.mt),
            Incomingppm: formatPrice(pricing.incoming_ppm),
            Outgoingppmfix: formatPrice(pricing.outgoing_ppm_fix),
            Outgoingppmmobile: formatPrice(pricing.outgoing_ppm_mobile),
            incmongsms: formatPrice(pricing.incoming_sms),
            outgoingsms: formatPrice(pricing.outgoing_sms),
            billingPulse: pricing.billing_pulse || '',
            estimatedLeadTime: pricing.estimated_lead_time || '',
            contractTerm: pricing.contract_term || '',
            disconnectionNoticeTerm: pricing.disconnection_notice_term || ''
          };
          setFetchedPricingData(transformedPricing);
        } else {
          console.error('Pricing API returned unsuccessful:', response);
        }
      } else {
        console.log('Product or country not found');
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      setFetchedPricingData(null);
    } finally {
      setLoadingPricing(false);
    }
  };

  const fetchServiceDetails = async () => {
    if (!formData.productType || !formData.country) {
      return;
    }

    try {
      setLoadingServiceDetails(true);
      setLoadingCoverageChannel(true);

      const product = products.find(p => p.code?.toLowerCase() === formData.productType?.toLowerCase());
      const country = countries.find(c => c.countryname?.toLowerCase().includes(formData.country?.toLowerCase().split(' ')[0]));

      if (product && country) {
        const response = await api.serviceDetails.getByProductCountry(product.id, country.id);
        if (response.success) {
          setServiceDetails(response.data);
          
          const data = response.data;
          setCoverageData({
            restrictions: data.restrictions || '',
            channels: data.channels || '',
            portability: data.portability || '',
            fix: data.fix_coverage || '',
            mobile: data.mobile_coverage || '',
            payphone: data.payphone_coverage || ''
          });
          
          setChannelDetails({
            defaultChannels: data.default_channels || '',
            maximumChannels: data.maximum_channels || '',
            extraChannelPrice: `$${data.extra_channel_price || 0}`
          });
        }
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
      setServiceDetails(null);
      setCoverageData(null);
      setChannelDetails(null);
    } finally {
      setLoadingServiceDetails(false);
      setLoadingCoverageChannel(false);
    }
  };

  const fetchRequiredDocuments = async () => {
    if (!formData.productType || !formData.country) {
      return;
    }

    try {
      setLoadingRequiredDocuments(true);

      const product = products.find(p => p.code?.toLowerCase() === formData.productType?.toLowerCase());
      const country = countries.find(c => c.countryname?.toLowerCase().includes(formData.country?.toLowerCase().split(' ')[0]));

      if (product && country) {
        const response = await api.requiredDocuments.getByProductCountry(product.id, country.id);
        if (response.success) {
          setRequiredDocuments(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching required documents:', error);
      setRequiredDocuments([]);
    } finally {
      setLoadingRequiredDocuments(false);
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
    ...(pricingDataProp || {}) // order_pricing takes precedence only if fetched data is missing
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

  const handleFileChange = async (event) => {
    const { files } = event.target;
    if (!files || files.length === 0) {
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();

      Array.from(files).forEach(file => {
        formData.append('documents', file);
      });

      // Upload files to server
      const response = await api.documents.upload('temp', formData);
           console.log("Response:", response);
           console.log("Response:", formData);

      if (response.success) {
        // Update local state with uploaded file info
        const newDocuments = response.data.uploadedFiles.map((uploadedFile, index) => ({
          id: `uploaded-${Date.now()}-${index}`,
          name: uploadedFile.originalname,
          type: uploadedFile.mimetype.split('/')[1]?.toUpperCase() || 'UNKNOWN',
          uploadedAt: uploadedFile.uploadDate,
          filename: uploadedFile.filename, // Store server filename for later use
          size: uploadedFile.size
        }));

        setDocuments((prev) => [...prev, ...newDocuments]);

        toast({
          title: 'Documents uploaded',
          description: `${files.length} document(s) uploaded successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload documents',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }

    event.target.value = '';
  };

  const handleDeleteDocument = async (id) => {
    if (readOnly) {
      toast({
        title: 'Access Denied',
        description: 'Cannot delete documents in read-only mode',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const document = documents.find(doc => doc.id === id);
    if (document && document.filename) {
      try {
        // Use actual orderId if available (for existing orders), otherwise use 'temp' (for new orders)
        const deleteOrderId = orderId || 'temp';
        await api.documents.delete(deleteOrderId, document.filename);
      } catch (error) {
        console.error('Delete error:', error);
        // Continue with local deletion even if server delete fails
      }
    }

    // Remove from local state
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleViewDocument = async (document) => {
    if (document.filename) {
      try {
        // Use actual orderId if available (for existing orders), otherwise use 'temp' (for new orders)
        const downloadOrderId = orderId || 'temp';
        const response = await api.documents.download(downloadOrderId, document.filename);

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        } else {
          throw new Error('Download failed');
        }
      } catch (error) {
        console.error('Download error:', error);
        toast({
          title: 'Download failed',
          description: 'Failed to download document',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else if (document.file) {
      // Fallback for local files
      const url = URL.createObjectURL(document.file);
      window.open(url, '_blank');
    }
  };

  const serviceRestriction = coverageData?.restrictions && coverageData.restrictions.toLowerCase() === 'none' ? 'No' : 'Yes';
  const portingAvailability = coverageData?.portability && coverageData.portability.toLowerCase() === 'yes' ? 'Yes' : 'No';





  const handleConfigureClick = () => {
    if (onConfigure) {
      onConfigure({
        documents,
        bargainData,
        country: formData.country,
        productType: formData.productType,
        areaCode: formData.areaCode
      });
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
          {!hideDesiredPricing && (
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
          )}

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
        {!readOnly ? (
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
        ) : (
          <Box 
            border="2px dashed" 
            borderColor="gray.300" 
            borderRadius="md" 
            p={4} 
            textAlign="center"
            mb={4}
            bg="gray.50"
            opacity={0.6}
          >
            <VStack spacing={2}>
              <Text fontWeight="medium" color="gray.500">Upload Disabled</Text>
              <Text fontSize="sm" color="gray.500">
                This order is in read-only mode
              </Text>
            </VStack>
          </Box>
        )}
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
                      {readOnly || userRole === 'Internal' ? (
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
                        <Td>{coverageData?.fix || '—'}</Td>
                        <Td>{coverageData?.mobile || '—'}</Td>
                        <Td>{coverageData?.payphone || '—'}</Td>
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
                        <Td>{channelDetails?.defaultChannels || '—'}</Td>
                        <Td>{channelDetails?.maximumChannels || '—'}</Td>
                        <Td>{channelDetails?.extraChannelPrice || '—'}</Td>
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
        documents={requiredDocuments && requiredDocuments.length > 0 ? requiredDocuments : []}
        title="Required Documents"
      />
    </VStack>
  );
}

export default NumberSelection;