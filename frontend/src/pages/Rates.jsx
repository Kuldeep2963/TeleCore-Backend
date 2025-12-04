import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Select,
  Button,
  Text,
  Spacer,
  Spinner,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  NumberInput,
  NumberInputField,
  IconButton,
  useToast,
  Grid,
  GridItem,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { FiXCircle, FiEdit2, FiSave, FiX, FiPlus } from "react-icons/fi";
import api from "../services/api";
import Countries from "./Countries";
import { FaDollarSign, FaGlobe } from "react-icons/fa";

const pricingHeadings = {
  did: { nrc: "NRC", mrc: "MRC", ppm: "PPM" },
  freephone: {
    nrc: "NRC",
    mrc: "MRC",
    ppmFix: "PPM Fix",
    ppmMobile: "PPM Mobile",
    ppmPayphone: "PPM Payphone",
  },
  universal: {
    nrc: "NRC",
    mrc: "MRC",
    ppmFix: "PPM Fix",
    ppmMobile: "PPM Mobile",
    ppmPayphone: "PPM Payphone",
  },
  "two-way-voice": {
    nrc: "NRC",
    mrc: "MRC",
    ppmIncoming: "Incoming PPM",
    ppmOutgoingfix: "Outgoing Fix PPM",
    ppmOutgoingmobile: "Outgoing Mobile PPM",
  },
  "two-way-sms": { nrc: "NRC", mrc: "MRC", arc: "ARC", mo: "MO", mt: "MT" },
  mobile: {
    nrc: "NRC",
    mrc: "MRC",
    Incomingppm: "Incoming PPM",
    Outgoingppmfix: "Outgoing Fix PPM",
    Outgoingppmmobile: "Outgoing Mobile PPM",
    incmongsms: "Incoming SMS",
    outgoingsms: "Outgoing SMS",
  },
};

const Rates = () => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("");
  const [countries, setCountries] = useState([]);
  const [products, setProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [pricingData, setPricingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const toast = useToast();

  const currentHeadings =
    pricingHeadings[selectedProductType] || pricingHeadings.did;

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await api.countries.getAll();
      if (response.success) {
        setCountries(response.data);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast({
        title: "Error",
        description: "Failed to load countries",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.products.getAll();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        status: "error",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchProducts();
  }, [toast]);

  const handleCountryChange = (countryName) => {
    setSelectedCountry(countryName);
    setSelectedProductType("");
    setPricingData([]);
    setHasSearched(false);
    if (countryName) {
      const country = countries.find((c) => c.countryname === countryName);
      if (country) {
        let availableProductsList = [];
        if (Array.isArray(country.availableproducts)) {
          availableProductsList = country.availableproducts
            .map((item) =>
              typeof item === "string" ? item : item.name || item.code || ""
            )
            .filter(Boolean);
        } else if (typeof country.availableproducts === "string") {
          try {
            const parsed = JSON.parse(country.availableproducts);
            availableProductsList = Array.isArray(parsed)
              ? parsed
                  .map((item) =>
                    typeof item === "string"
                      ? item
                      : item.name || item.code || ""
                  )
                  .filter(Boolean)
              : [parsed.name || parsed.code || ""];
          } catch (e) {
            console.warn("Failed to parse availableproducts:", e);
          }
        } else if (
          typeof country.availableproducts === "object" &&
          country.availableproducts !== null
        ) {
          if (
            country.availableproducts.name ||
            country.availableproducts.code
          ) {
            availableProductsList = [
              country.availableproducts.name || country.availableproducts.code,
            ];
          }
        }
        setAvailableProducts(availableProductsList);
      }
    } else {
      setAvailableProducts([]);
    }
  };

  const handleSearch = async () => {
    if (!selectedCountry) {
      toast({
        title: "Please select a country",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    try {
      setSearchLoading(true);
      let response;
      if (selectedProductType) {
        const product = products.find(
          (p) => p.code?.toLowerCase() === selectedProductType?.toLowerCase()
        );
        const country = countries.find(
          (c) => c.countryname?.toLowerCase() === selectedCountry?.toLowerCase()
        );
        if (product && country) {
          response = await api.pricing.getByProduct(product.id, country.id);
        } else {
          response = { success: false };
        }
      } else {
        response = await api.pricing.getByCountry(selectedCountry);
      }
      if (response.success) {
        const filtered = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setPricingData(filtered);
      } else {
        setPricingData([]);
      }
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching pricing:", error);
      toast({
        title: "Error",
        description: "Failed to load pricing data",
        status: "error",
        duration: 3000,
      });
      setPricingData([]);
      setHasSearched(true);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditValues({ ...row });
  };

  const handleInputChange = (field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const fieldMap = {
        nrc: "nrc",
        mrc: "mrc",
        ppm: "ppm",
        ppmFix: "ppm_fix",
        ppmMobile: "ppm_mobile",
        ppmPayphone: "ppm_payphone",
        arc: "arc",
        mo: "mo",
        mt: "mt",
        ppmIncoming: "incoming_ppm",
        ppmOutgoingfix: "outgoing_ppm_fix",
        ppmOutgoingmobile: "outgoing_ppm_mobile",
        incmongsms: "incoming_sms",
        outgoingsms: "outgoing_sms",
        Incomingppm: "incoming_ppm",
        Outgoingppmfix: "outgoing_ppm_fix",
        Outgoingppmmobile: "outgoing_ppm_mobile",
      };
      const updateData = {};
      Object.values(fieldMap).forEach((field) => {
        const value = editValues[field];
        if (value !== undefined && value !== null && value !== "") {
          const parsed = parseFloat(value);
          if (!isNaN(parsed)) {
            updateData[field] = parsed;
          }
        }
      });

      const additionalFields = [
        "billing_pulse",
        "estimated_lead_time",
        "contract_term",
        "disconnection_notice_term",
      ];
      additionalFields.forEach((field) => {
        const value = editValues[field];
        if (value !== undefined && value !== null && value !== "") {
          updateData[field] = value;
        }
      });

      if (isCreatingNew) {
        const product = products.find(
          (p) => p.code?.toLowerCase() === selectedProductType?.toLowerCase()
        );
        const country = countries.find(
          (c) => c.countryname?.toLowerCase() === selectedCountry?.toLowerCase()
        );
        
        if (!product || !country) {
          toast({
            title: "Error",
            description: "Product or country not found",
            status: "error",
            duration: 3000,
          });
          return;
        }

        const createData = {
          product_id: product.id,
          country_id: country.id,
          ...updateData,
        };

        await api.pricing.create(createData);
        toast({
          title: "Success",
          description: "Pricing created successfully",
          status: "success",
          duration: 3000,
        });
      } else {
        await api.pricing.update(editingId, updateData);
        toast({
          title: "Success",
          description: "Pricing updated successfully",
          status: "success",
          duration: 3000,
        });
      }

      setEditingId(null);
      setIsCreatingNew(false);
      handleSearch();
    } catch (error) {
      console.error("Error saving pricing:", error);
      toast({
        title: "Error",
        description: "Failed to save pricing",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
    setIsCreatingNew(false);
  };

  const handleClear = () => {
    setSelectedCountry("");
    setSelectedProductType("");
    setAvailableProducts([]);
    setPricingData([]);
    setHasSearched(false);
    setEditingId(null);
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <Box p={{base:4,md:6}} pt={6} bg="gray.50">
      <Tabs variant="soft-rounded" colorScheme="blue">
        <Box>
          <TabList gap={6} p={2}>
            <Tab
              borderRadius="full"
              _selected={{
                bg: "blue.100",
                color: "gray.600",
                borderColor: "blue.500",
              }}
              px={2}
              py={1}
              fontWeight="semibold"
            >
              <HStack>
                <FaDollarSign />
                <Text> Rates Management</Text>
              </HStack>
            </Tab>
            <Tab
              borderRadius="full"
              _selected={{
                bg: "blue.100",
                color: "gray.600",
                borderColor: "blue.500",
              }}
              px={4}
              py={1}
              fontWeight="semibold"
            >
              <HStack>
                <FaGlobe />
                <Text> Countries</Text>
              </HStack>
            </Tab>
          </TabList>
        </Box>
        <TabPanels>
          <TabPanel p={2}>
            <Box mt={4} >
              <VStack spacing={6} align="stretch">
                <Heading as="h1" size="lg" color={"blue.600"}>
                  Rates Management
                </Heading>
                <Divider
                  pt={2}
                  borderRadius={"full"}
                  border="0"
                  bgGradient="linear(to-r, gray.300, gray.200, transparent)"
                />
                <Box
                  display="flex"
                  flexDirection={{ base: "column", md: "row" }}
                  spacing={4}
                  p={3}
                  gap={4}
                >
                  <VStack spacing={2} flex={1}>
                    <Text fontWeight="semibold" fontSize="sm">
                      Select Country
                    </Text>
                    <Select
                      bg="white"
                      borderRadius={"full"}
                      value={selectedCountry}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      placeholder="Select country"
                    >
                      {countries.map((country) => (
                        <option key={country.id} value={country.countryname}>
                          {country.countryname} ({country.phonecode})
                        </option>
                      ))}
                    </Select>
                  </VStack>

                  <VStack spacing={2} flex={1}>
                    <Text fontWeight="semibold" fontSize="sm">
                      Select Product Type
                    </Text>
                    <Select
                      bg="white"
                      borderRadius={"full"}
                      value={selectedProductType}
                      onChange={(e) => setSelectedProductType(e.target.value)}
                      placeholder="product type"
                      isDisabled={availableProducts.length === 0}
                    >
                      {products
                        .filter((product) =>
                          availableProducts.some(
                            (ap) =>
                              ap.toLowerCase() === product.code.toLowerCase() ||
                              ap.toLowerCase() === product.name.toLowerCase()
                          )
                        )
                        .map((product) => (
                          <option key={product.id} value={product.code}>
                            {product.name} ({product.code})
                          </option>
                        ))}
                    </Select>
                  </VStack>

                  <Spacer display={{ base: "none", md: "block" }} />

                  <HStack spacing={5} flexDirection={{ base: "column", md: "row" }} w={{ base: "full", md: "auto" }}>
                    <Button
                      variant="ghost"
                      borderRadius={"full"}
                      leftIcon={<FaSearch />}
                      colorScheme="blue"
                      onClick={handleSearch}
                      isLoading={searchLoading}
                      isDisabled={!selectedCountry}
                      w={{ base: "full", md: "auto" }}
                    >
                      Search
                    </Button>
                    <Button
                      borderRadius={"full"}
                      leftIcon={<FiXCircle />}
                      onClick={handleClear}
                      w={{ base: "full", md: "auto" }}
                    >
                      Clear
                    </Button>
                  </HStack>
                </Box>
                
                {(pricingData.length > 0 || (selectedCountry && selectedProductType && !searchLoading)) && (
                  <Box
                    bg="white"
                    borderRadius="md"
                    boxShadow="sm"
                    overflowX="auto"
                  >
                    {pricingData.length === 0 && hasSearched && selectedCountry && selectedProductType && (
                      <HStack p={4} borderBottomWidth="1px">
                        <Text fontSize="sm" color="gray.600">
                          No pricing data found. Create new pricing for this product and country.
                        </Text>
                        <Spacer />
                        <Button
                          leftIcon={<FiPlus />}
                          colorScheme="green"
                          size="sm"
                          borderRadius="full"
                          onClick={() => setIsCreatingNew(true)}
                          isDisabled={isCreatingNew}
                        >
                          Create New Pricing
                        </Button>
                      </HStack>
                    )}
                    {(pricingData.length > 0 || isCreatingNew) && (
                      <Table variant="simple">
                        <Thead bg="gray.200">
                          <Tr>
                            {Object.entries(currentHeadings).map(
                              ([key, label]) => (
                                <Th
                                  color={"gray.700"}
                                  key={key}
                                  py={3}
                                  px={4}
                                  textAlign="left"
                                  fontWeight="bold"
                                  whiteSpace="nowrap"
                                >
                                  {label}
                                </Th>
                              )
                            )}
                            <Th
                              py={3}
                              px={4}
                              color={"gray.700"}
                              textAlign="left"
                              fontWeight="bold"
                              whiteSpace="nowrap"
                            >
                              Actions
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {(pricingData.length > 0 ? pricingData : [{ id: "new" }]).map((row) => (
                          <Tr key={row.id} borderBottomWidth="1px">
                            {Object.entries(currentHeadings).map(([key]) => {
                              const fieldMap = {
                                nrc: "nrc",
                                mrc: "mrc",
                                ppm: "ppm",
                                ppmFix: "ppm_fix",
                                ppmMobile: "ppm_mobile",
                                ppmPayphone: "ppm_payphone",
                                arc: "arc",
                                mo: "mo",
                                mt: "mt",
                                ppmIncoming: "incoming_ppm",
                                ppmOutgoingfix: "outgoing_ppm_fix",
                                ppmOutgoingmobile: "outgoing_ppm_mobile",
                                incmongsms: "incoming_sms",
                                outgoingsms: "outgoing_sms",
                                Incomingppm: "incoming_ppm",
                                Outgoingppmfix: "outgoing_ppm_fix",
                                Outgoingppmmobile: "outgoing_ppm_mobile",
                              };
                              const fieldName = fieldMap[key];
                              const value = row[fieldName];
                              return (
                                <Td
                                  color={"green"}
                                  fontWeight={"medium"}
                                  key={key}
                                  py={3}
                                  px={4}
                                >
                                  {editingId === row.id ? (
                                    <NumberInput
                                      value={editValues[fieldName] || ""}
                                      onChange={(val) =>
                                        handleInputChange(fieldName, val)
                                      }
                                      precision={4}
                                      size="sm"
                                    >
                                      <NumberInputField />
                                    </NumberInput>
                                  ) : value ? (
                                    `$${parseFloat(value).toFixed(4)}`
                                  ) : (
                                    "-"
                                  )}
                                </Td>
                              );
                            })}
                            <Td py={3} px={4}>
                              {editingId === row.id ? (
                                <HStack spacing={2}>
                                  <IconButton
                                    borderRadius={"full"}
                                    icon={<FiSave />}
                                    size="sm"
                                    colorScheme="green"
                                    onClick={handleSave}
                                    aria-label="Save"
                                    // variant={"ghost"}
                                  />
                                  <IconButton
                                    icon={<FiX />}
                                    borderRadius={"full"}
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancel}
                                    aria-label="Cancel"
                                  />
                                </HStack>
                              ) : (
                                <IconButton
                                  icon={<FiEdit2 />}
                                  size="sm"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={() => handleEdit(row)}
                                  aria-label="Edit"
                                />
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                        </Table>
                    )}
                    {(pricingData.length > 0 || isCreatingNew) && (
                      <>
                        <Divider my={6} />
                        <Box px={4} pb={4}>
                          <Heading size="sm" mb={4} color="gray.700">
                            Additional Details
                          </Heading>
                          <Grid
                            templateColumns={{
                              base: "2",
                              md: "2fr 2fr",
                              lg: "1fr",
                            }}
                            gap={6}
                          >
                            {(pricingData.length > 0 ? pricingData : isCreatingNew ? [{ id: "new" }] : []).map((row) => (
                              <Box key={row.id}>
                                <HStack spacing={3} align="start">
                                  <HStack spacing={6} w="full">
                                    <Text
                                      fontSize="xs"
                                      color="gray.600"
                                      fontWeight="medium"
                                    >
                                      Billing Pulse:
                                    </Text>
                                    {editingId === row.id ? (
                                      <Input
                                        borderRadius={"full"}
                                        size="sm"
                                        value={editValues.billing_pulse || ""}
                                        onChange={(e) =>
                                          handleInputChange(
                                            "billing_pulse",
                                            e.target.value
                                          )
                                        }
                                      />
                                    ) : (
                                      <Text
                                        fontSize="sm"
                                        fontWeight={"bold"}
                                        color="gray.800"
                                      >
                                        {row.billing_pulse || "-"}
                                      </Text>
                                    )}
                                  </HStack>
                                  <HStack spacing={6} w="full">
                                    <Text
                                      fontSize="xs"
                                      color="gray.600"
                                      fontWeight="medium"
                                    >
                                      Est. Lead Time:
                                    </Text>
                                    {editingId === row.id ? (
                                      <Input
                                        borderRadius={"full"}
                                        size="sm"
                                        value={
                                          editValues.estimated_lead_time || ""
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            "estimated_lead_time",
                                            e.target.value
                                          )
                                        }
                                      />
                                    ) : (
                                      <Text
                                        fontSize="sm"
                                        fontWeight={"bold"}
                                        color="gray.800"
                                      >
                                        {row.estimated_lead_time || "-"}
                                      </Text>
                                    )}
                                  </HStack>
                                  <HStack spacing={6} w="full">
                                    <Text
                                      fontSize="xs"
                                      color="gray.600"
                                      fontWeight="medium"
                                    >
                                      Contract Term:
                                    </Text>
                                    {editingId === row.id ? (
                                      <Input
                                        borderRadius={"full"}
                                        size="sm"
                                        value={editValues.contract_term || ""}
                                        onChange={(e) =>
                                          handleInputChange(
                                            "contract_term",
                                            e.target.value
                                          )
                                        }
                                      />
                                    ) : (
                                      <Text
                                        fontSize="sm"
                                        color="green.600"
                                        fontWeight="semibold"
                                      >
                                        {row.contract_term || "-"}
                                      </Text>
                                    )}
                                  </HStack>
                                  <HStack spacing={6} w="full">
                                    <Text
                                      fontSize="xs"
                                      color="gray.600"
                                      fontWeight="medium"
                                    >
                                      Disc. Notice Term:
                                    </Text>
                                    {editingId === row.id ? (
                                      <Input
                                        borderRadius={"full"}
                                        size="sm"
                                        value={
                                          editValues.disconnection_notice_term ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            "disconnection_notice_term",
                                            e.target.value
                                          )
                                        }
                                      />
                                    ) : (
                                      <Text
                                        fontSize="sm"
                                        color="red.500"
                                        fontWeight="semibold"
                                      >
                                        {row.disconnection_notice_term || "-"}
                                      </Text>
                                    )}
                                  </HStack>
                                </HStack>
                              </Box>
                            ))}
                          </Grid>
                        </Box>
                      </>
                    )}
                  </Box>
                )}


              </VStack>
            </Box>
          </TabPanel>

          <TabPanel p={0}>
            <Countries />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Rates;
