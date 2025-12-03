// import React, { useEffect, useState } from 'react';
// import {
//   Box,
//   Container,
//   Heading,
//   Text,
//   VStack,
//   HStack,
//   Button,
//   Input,
//   Select,
//   FormControl,
//   FormLabel,
//   Textarea,
//   Radio,
//   RadioGroup,
//   useColorModeValue
// } from '@chakra-ui/react';
// import api from '../../services/api';

// function PortNumber() {
//   const [countries, setCountries] = useState(null);
//   const [formData, setFormData] = useState({
//     country: '',
//     productType: '',
//     usageVolume: '',
//     bulkNumbersFile: null,
//     documents: [],
//     remarks: ''
//   });

//   const borderColor = useColorModeValue('gray.200', 'gray.700');

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         console.log('Fetching countries with product types from API...');

//         // Fetch countries (assuming countries table contains product type relationships)
//         const countriesResponse = await api.countries.getAll();
//         console.log('Countries API response:', countriesResponse);
//         if (countriesResponse.success) {
//           console.log('Countries data:', countriesResponse.data);
//           setCountries(countriesResponse.data);
//         } else {
//           console.error('Countries API returned unsuccessful:', countriesResponse);
//           setCountries([]);
//         }
//       } catch (error) {
//         console.error('Error fetching countries:', error);
//         setCountries([]);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleInputChange = (field, value) => {
//     setFormData(prev => {
//       const newData = { ...prev, [field]: value };

//       // Clear product type when country changes
//       if (field === 'country' && prev.country !== value) {
//         newData.productType = '';
//       }

//       return newData;
//     });
//   };

//   // Map product names to product objects
//   const mapProductNameToObject = (productName) => {
//     const productMappings = {
//       'DID': { id: 1, code: 'did', name: 'DID' },
//       'Freephone': { id: 2, code: 'freephone', name: 'Freephone' },
//       'Universal Freephone': { id: 3, code: 'universal-freephone', name: 'Universal Freephone' },
//       'Two Way Voice': { id: 4, code: 'two-way-voice', name: 'Two Way Voice' },
//       'Two Way SMS': { id: 5, code: 'two-way-sms', name: 'Two Way SMS' },
//       'Mobile': { id: 6, code: 'mobile', name: 'Mobile' }
//     };
//     return productMappings[productName] || { id: 0, code: productName.toLowerCase().replace(/\s+/g, '-'), name: productName };
//   };

//   // Get available products for the selected country
//   const getAvailableProducts = () => {
//     if (!formData.country || !countries || countries.length === 0) {
//       return [];
//     }

//     // Find the selected country and return its available products
//     const selectedCountry = countries.find(country => country.countryname === formData.country);
//     if (!selectedCountry || !selectedCountry.availableproducts) {
//       return [];
//     }

//     // Map product names to product objects
//     return selectedCountry.availableproducts.map(productName => mapProductNameToObject(productName));
//   };

//   const handleFileUpload = (field, event) => {
//     const file = event.target.files[0];
//     setFormData(prev => ({
//       ...prev,
//       [field]: file
//     }));
//   };

//   const handleClear = () => {
//     setFormData({
//       country: '',
//       productType: '',
//       usageVolume: '',
//       bulkNumbersFile: null,
//       documents: [],
//       remarks: ''
//     });
//   };

//   const handleSubmit = () => {
//     console.log('Form submitted:', formData);
//   };

//   return (
//     <Box 
//       flex={1} 
//       p={6} 
//       bg="#f8f9fa"
//       height="calc(100vh - 76px)"
//       overflowY="auto"
//     >
//       <Box>
//         <VStack spacing={6} align="stretch">
//           <Heading
//             color="#1a3a52"
//             fontSize="3xl"
//             fontWeight="bold"
//             letterSpacing="-0.2px"
//           >
//             Port Number
//           </Heading>

//           <Box
//             bg="white"
//             borderRadius="12px"
//             p={6}
//             boxShadow="sm"
//             border="1px solid"
//             borderColor={borderColor}
//           >
//             <VStack spacing={6} align="stretch">
//               <HStack>
//               {/* Country */}
//               <FormControl isRequired>
//                 <FormLabel fontWeight="semibold" color="gray.700" mb={4}>
//                   Country *
//                 </FormLabel>
//                 <Select
//                   value={formData.country}
//                   onChange={(e) => handleInputChange('country', e.target.value)}
//                   bg="white"
//                   borderColor="gray.300"
//                   size="md"
//                   isDisabled={!countries || countries.length === 0}
//                 >
//                   {countries && countries.length > 0 ? (
//                     countries.map(country => (
//                       <option key={country.countryname} value={country.countryname}>
//                         {country.countryname} ({country.phonecode})
//                       </option>
//                     ))
//                   ) : (
//                     <option value="" disabled>
//                       {countries === null ? 'Loading countries...' : 'No countries available'}
//                     </option>
//                   )}
//                 </Select>
//               </FormControl>

//               {/* Product Type */}
//               <FormControl isRequired>
//                 <FormLabel fontWeight="semibold" color="gray.700" mb={4}>
//                   Product Type *
//                 </FormLabel>
//                 <Select
//                   value={formData.productType}
//                   onChange={(e) => handleInputChange('productType', e.target.value)}
//                   bg="white"
//                   borderColor="gray.300"
//                   size="md"
//                   disabled={!formData.country}
//                 >
//                   <option value="">
//                     {formData.country ? 'Select product type' : 'Select country first'}
//                   </option>
//                   {getAvailableProducts().map(product => (
//                     <option key={product.code} value={product.code}>
//                       {product.name}
//                     </option>
//                   ))}
//                 </Select>
//               </FormControl>
//              </HStack>
//               {/* Estimated Usage Volume */}
//               <FormControl isRequired>
//                 <FormLabel fontWeight="semibold" color="gray.700" mb={4}>
//                   Estimated Usage Volume (Minutes or SMS per month) *
//                 </FormLabel>
//                 <RadioGroup 
//                   value={formData.usageVolume}
//                   onChange={(value) => handleInputChange('usageVolume', value)}
//                 >
//                   <HStack spacing={6} align="start">
//                     <Radio value="<10000">&lt;10000</Radio>
//                     <Radio value="1000-10000">1000 - 10,000</Radio>
//                     <Radio value="10000-100000">10,000 - 100,000</Radio>
//                     <Radio value=">100000">&gt;100,000</Radio>
//                   </HStack>
//                 </RadioGroup>
//               </FormControl>

//               {/* Divider */}
//               <Box borderTop="1px solid" borderColor="gray.300" pt={4}></Box>

//               {/* Upload Bulk Numbers */}
//               <FormControl isRequired w={"60%"}>
//                 <FormLabel fontWeight="semibold" color="gray.700" mb={4}>
//                   Upload Bulk Numbers *
//                 </FormLabel>
//                 <HStack spacing={6} align="stretch">
//                   <Box
//                     flex={1}
//                     border="2px dashed"
//                     borderColor="gray.300"
//                     borderRadius="md"
//                     p={6}
//                     textAlign="center"
//                     cursor="pointer"
//                     _hover={{ borderColor: 'blue.400' }}
//                     transition="all 0.2s"
//                     position="relative"
//                   >
//                     <Input
//                       type="file"
//                       accept=".xls,.xlsx,.csv"
//                       onChange={(e) => handleFileUpload('bulkNumbersFile', e)}
//                       position="absolute"
//                       opacity={0}
//                       width="100%"
//                       height="100%"
//                       cursor="pointer"
//                       left={0}
//                       top={0}
//                     />
//                     <VStack spacing={2}>
//                       <Text fontWeight="medium" color="gray.600">
//                         Choose files
//                       </Text>
//                     </VStack>
//                   </Box>
                  
//                   <VStack flex={1} spacing={1} align="start">
//                     <Text fontSize="sm" color="gray.500">
//                       Maximum file size: 10 MB
//                     </Text>
//                     <Text fontSize="sm" color="gray.500">
//                       File type: xls, xlsx, csv
//                     </Text>
//                   </VStack>

//                   {/* Download Template Button */}
//                   <Button
//                     flex={1}
//                     variant="outline"
//                     colorScheme="blue"
//                     size="sm"
//                     alignSelf="flex-start"
//                   >
//                     Download Template
//                   </Button>

//                   {/* Show uploaded file */}
//                   {formData.bulkNumbersFile && (
//                     <Text fontSize="sm" color="green.600" fontWeight="medium">
//                       Uploaded: {formData.bulkNumbersFile.name}
//                     </Text>
//                   )}
//                 </HStack>
//               </FormControl>

//               {/* Upload Documents */}
//               <FormControl w={"60%"}>
//                 <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
//                   Upload Documents
//                 </FormLabel>
//                 <HStack spacing={6} align="stretch">
//                   <Box
//                     flex={1}
//                     border="2px dashed"
//                     borderColor="gray.300"
//                     borderRadius="md"
//                     p={6}
//                     textAlign="center"
//                     cursor="pointer"
//                     _hover={{ borderColor: 'blue.400' }}
//                     transition="all 0.2s"
//                     position="relative"
//                   >
//                     <Input
//                       type="file"
//                       multiple
//                       accept=".pdf,.jpeg,.png,.doc,.docx"
//                       onChange={(e) => handleFileUpload('documents', e)}
//                       position="absolute"
//                       opacity={0}
//                       width="100%"
//                       height="100%"
//                       cursor="pointer"
//                       left={0}
//                       top={0}
//                     />
//                     <VStack spacing={2}>
//                       <Text fontWeight="medium" color="gray.600">
//                         Choose files
//                       </Text>
//                     </VStack>
//                   </Box>
                  
//                   <VStack flex={2} spacing={1} align="start">
//                     <Text fontSize="sm" color="gray.500">
//                       Maximum file size: 10 MB
//                     </Text>
//                     <Text fontSize="sm" color="gray.500">
//                       File type: pdf, jpeg, png, doc, docx
//                     </Text>
//                   </VStack>

//                   {/* Show uploaded documents */}
//                   {formData.documents && formData.documents.name && (
//                     <Text fontSize="sm" color="green.600" fontWeight="medium">
//                       Uploaded: {formData.documents.name}
//                     </Text>
//                   )}
//                 </HStack>
//               </FormControl>

//               {/* Remarks */}
//               <FormControl>
//                 <FormLabel fontWeight="semibold" color="gray.700" mb={4}>
//                   Remarks
//                 </FormLabel>
//                 <Textarea 
//                   placeholder="Enter your text here"
//                   value={formData.remarks}
//                   onChange={(e) => handleInputChange('remarks', e.target.value)}
//                   bg="white"
//                   borderColor="gray.300"
//                   minH="100px"
//                   resize="vertical"
//                   size="md"
//                 />
//               </FormControl>

//               {/* Action Buttons */}
//               <HStack spacing={4} justify="flex-end" pt={4}>
//                 <Button
//                   borderRadius={"full"}
//                   variant="outline"
//                   colorScheme="gray"
//                   onClick={handleClear}
//                   size="md"
//                   px={6}
//                 >
//                   Clear
//                 </Button>
//                 <Button
//                   borderRadius="full"         
//                   colorScheme="blue"
//                   onClick={handleSubmit}
//                   size="md"
//                   px={6}
//                   isDisabled={!formData.country || !formData.productType || !formData.usageVolume || !formData.bulkNumbersFile}
//                 >
//                   Submit Query
//                 </Button>
//               </HStack>
//             </VStack>
//           </Box>
//         </VStack>
//       </Box>
//     </Box>
//   );
// }

// export default PortNumber;