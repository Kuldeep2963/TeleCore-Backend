import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Badge,
  VStack,
  HStack,
  Heading,
  Text,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button,
  useColorModeValue,
  SimpleGrid,
  Flex,
  Spinner,
  Center,
  Spacer,
} from "@chakra-ui/react";
import { DownloadIcon, SearchIcon, ViewIcon } from "@chakra-ui/icons";
import { FiXCircle, FiUpload } from "react-icons/fi";
import api from "../services/api";
import {FaChevronCircleRight, FaChevronCircleLeft } from "react-icons/fa";

function Products() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [filters, setFilters] = useState({
    country: "",
    productType: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    country: "",
    productType: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch countries
      const countriesResponse = await api.countries.getAll();
      if (countriesResponse.success) {
        setCountries(countriesResponse.data);
      }

      // Fetch products
      const productsResponse = await api.products.getAll();
      if (productsResponse.success) {
        setProductTypes(productsResponse.data);
      }

      // Fetch pricing data to create product info
      const pricingResponse = await api.pricing.getAll();
      if (pricingResponse.success) {
        // Transform pricing data into product info format
        let productInfo = transformPricingToProductInfo(
          pricingResponse.data,
          countriesResponse.data,
          productsResponse.data
        );

        // Fetch area codes for each product
        productInfo = await fetchAreaCodesForProducts(productInfo);
        setProducts(productInfo);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const transformPricingToProductInfo = (
    pricingData,
    countriesData,
    productsData
  ) => {
    const productInfo = [];

    pricingData.forEach((pricing, index) => {
      const country = countriesData.find((c) => c.id === pricing.country_id);
      const product = productsData.find((p) => p.id === pricing.product_id);

      if (country && product) {
        productInfo.push({
          id: index + 1,
          country: `${country.countryname} (${country.phonecode})`,
          region: getRegionFromCountry(country.countryname),
          productType: product.name,
          areaCode: "Loading...", // Will be populated by fetchAreaCodesForProducts
          edt: pricing.estimated_lead_time || "15 Days",
          inventoryCount: 0, // This would need inventory data
          countryId: country.id,
          productId: product.id,
          pricing: pricing,
        });
      }
    });

    return productInfo;
  };

  const fetchAreaCodesForProducts = async (productInfo) => {
    try {
      const BATCH_SIZE = 10;
      const updatedProducts = [...productInfo];

      for (let i = 0; i < productInfo.length; i += BATCH_SIZE) {
        const batch = productInfo.slice(i, i + BATCH_SIZE);

        const batchResults = await Promise.allSettled(
          batch.map(async (product, batchIndex) => {
            try {
              const areaCodes = await api.numbers.getAreaCodes(
                product.countryId,
                product.productId
              );
              const actualIndex = i + batchIndex;

              if (
                areaCodes.success &&
                areaCodes.data &&
                areaCodes.data.length > 0
              ) {
                updatedProducts[actualIndex] = {
                  ...product,
                  areaCode: areaCodes.data.join(", "),
                };
              } else {
                updatedProducts[actualIndex] = {
                  ...product,
                  areaCode: "Available",
                };
              }
              return true;
            } catch (error) {
              console.warn(
                `Error fetching area codes for country ${product.countryId}, product ${product.productId}:`,
                error
              );
              const actualIndex = i + batchIndex;
              updatedProducts[actualIndex] = {
                ...product,
                areaCode: "Available",
              };
              return false;
            }
          })
        );

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return updatedProducts;
    } catch (error) {
      console.error("Error fetching area codes:", error);
      return productInfo;
    }
  };

  const getRegionFromCountry = (countryName) => {
    // Simple region mapping - this could be enhanced
    const regionMap = {
      "United States": "North America",
      Canada: "North America",
      "United Kingdom": "Europe",
      Australia: "Oceania",
      Myanmar: "Asia",
      Singapore: "Asia",
    };
    return regionMap[countryName] || "Unknown";
  };

  // Get available product types for selected country
  const getAvailableProductTypes = () => {
    if (!filters.country) {
      return productTypes;
    }
    const availableTypes = new Set();
    products.forEach((product) => {
      if (product.country.toLowerCase().includes(filters.country.toLowerCase())) {
        availableTypes.add(product.productType);
      }
    });
    return productTypes.filter((pt) => availableTypes.has(pt.name));
  };

  // Filter products based on applied filters
  const filteredProducts = products.filter((product) => {
    if (
      appliedFilters.country &&
      !product.country.toLowerCase().includes(appliedFilters.country.toLowerCase())
    )
      return false;
    if (appliedFilters.productType && product.productType !== appliedFilters.productType)
      return false;
    return true;
  });

  // Pagination calculations
  const totalResults = filteredProducts.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, totalResults);
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleResultsPerPageChange = (e) => {
    setResultsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const pageBg = useColorModeValue("#f8f9fa", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("#1a3a52", "white");
  const subheadingColor = useColorModeValue("gray.800", "gray.900");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const mutedTextColor = useColorModeValue("gray.700", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("gray.200", "gray.700");
  const rowHoverBg = useColorModeValue("#f8fafc", "gray.700");
  const inputBg = useColorModeValue("white", "gray.900");

  const handleExportExcel = () => {
    console.log("Export to Excel");
  };

  const handleSearch = () => {
    setAppliedFilters({
      country: filters.country,
      productType: filters.productType,
    });
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFilters({
      country: "",
      productType: "",
    });
    setAppliedFilters({
      country: "",
      productType: "",
    });
    setCurrentPage(1);
  };

  const handleViewProduct = (product) => {
    // Transform product data to match OrderNumberView expected format
    const orderData = {
      orderNo: `PROD-${product.id}`,
      country: product.country,
      productType: product.productType.toLowerCase(),
      serviceName: product.productType.toLowerCase().replace("-", " "),
      areaCode: product.areaCode,
      quantity: 1, // Default quantity for product view
      orderStatus: "Available",
      orderDate: new Date().toISOString().split("T")[0], // Today's date
      region: product.region, // Add region for product view
      createdBy: "System", // Product view doesn't have a specific creator
      edt: product.edt, // Estimated Delivery Time
    };

    navigate("/order-number-view", { state: { orderData } });
  };

  if (loading) {
    return (
      <Center flex={1} minH="calc(100vh - 76px)">
        <Spinner size="lg" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box
      flex={1}
      py={6}
      px={{ base: 2, md: 6 }}
      bg={pageBg}
      height="calc(100vh - 76px)"
      overflowY="auto"
    >
      <Box w={"full"} p={2}>
        <VStack align="flex-start" spacing={2} mb={4}>
          <HStack>
          <Heading
            as="h1"
            color={headingColor}
            fontSize="3xl"
            fontWeight="bold"
          >
            Products
          </Heading>
          {/* <Spacer/>
          <Button
              size={"sm"}
              leftIcon={<FiUpload />}
              colorScheme="green"
              borderRadius={"full"}
              variant="outline"
              onClick={handleExportExcel}
            >
              Export
            </Button>
             */}
          </HStack>

        </VStack>

        <Box borderRadius="16px" p={{ base: 5, md: 6 }} mb={3}>
          <VStack align="flex-start" spacing={4} w="full">
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={4}
              w="full"
            >
              <Box>
                <Text color={mutedTextColor} fontSize="sm" mb={2}>
                  Country
                </Text>
                <Select
                  borderRadius={"full"}
                  placeholder="Select Country"
                  value={filters.country}
                  onChange={(e) =>
                    setFilters({ ...filters, country: e.target.value })
                  }
                  bg={inputBg}
                  color={textColor}
                  borderColor={borderColor}
                  focusBorderColor="blue.400"
                >
                  {countries.map((country) => (
                    <option
                      key={country.countryname}
                      value={country.countryname}
                    >
                      {country.countryname} ({country.phonecode})
                    </option>
                  ))}
                </Select>
              </Box>
              <Box>
                <Text color={mutedTextColor} fontSize="sm" mb={2}>
                  Product Type
                </Text>
                <Select
                  placeholder="Select Product Type"
                  value={filters.productType}
                  borderRadius={"full"}
                  onChange={(e) =>
                    setFilters({ ...filters, productType: e.target.value })
                  }
                  bg={inputBg}
                  color={textColor}
                  borderColor={borderColor}
                  focusBorderColor="blue.400"
                  isDisabled={!filters.country}
                >
                  {getAvailableProductTypes().map((product) => (
                    <option key={product.code} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box display="flex" alignItems="flex-end">
                <HStack spacing={3} w="full">
                  <Button
                    borderRadius={"full"}
                    leftIcon={<SearchIcon />}
                    colorScheme="blue"
                    onClick={handleSearch}
                    flex={1}
                  >
                    Search
                  </Button>
                  <Button
                    borderRadius={"full"}
                    leftIcon={<FiXCircle />}
                    variant="outline"
                    colorScheme="gray"
                    onClick={handleClear}
                    flex={1}
                  >
                    Clear
                  </Button>
                </HStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Box>
            
        <Box
        h={"500px"}
         bg="white"
            borderRadius="xl"
            boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
            border="1px solid"
            borderColor="gray.100"
            overflow={"auto"}
        >
          
          <Table variant="simple" size="md">
            <Thead bg={headerBg} borderTopRadius={"12px"}>
              <Tr sx={{
                          '& > th': {
                            bg: "blue.500",
                            color: "white",
                            fontWeight: "semibold",
                            fontSize: "sm",
                            position: "sticky",
                            top:0,
                            zIndex:1,
                            boxShadow: "inset 0 -1px 0 0 rgba(0,0,0,0.1)",
                            letterSpacing: "0.3px",
                            borderBottom: "2px solid",
                            borderColor: "gray.400",
                            textAlign: "center",
                            cursor: "pointer",
                            _hover: { bg: "blue.600" }
                          }
                        }}>
                <Th
                  fontSize={"sm"}
                  color={subheadingColor}
                  fontWeight="semibold"
                >
                  No.
                </Th>
                <Th
                  fontSize={"sm"}
                  color={subheadingColor}
                  fontWeight="semibold"
                >
                  Country
                </Th>
                <Th
                  fontSize={"sm"}
                  color={subheadingColor}
                  fontWeight="semibold"
                >
                  Region
                </Th>
                <Th
                  fontSize={"sm"}
                  color={subheadingColor}
                  fontWeight="semibold"
                >
                  Product Type
                </Th>
                <Th
                  fontSize={"sm"}
                  color={subheadingColor}
                  fontWeight="semibold"
                >
                  Area Code
                </Th>
                <Th
                  fontSize={"sm"}
                  color={subheadingColor}
                  fontWeight="semibold"
                >
                  EDT
                </Th>
                {/* <Th fontSize={"sm"} color={subheadingColor} fontWeight="semibold">Inventory Count</Th> */}
                <Th
                  fontSize={"sm"}
                  color={subheadingColor}
                  fontWeight="semibold"
                >
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <Tr
                    key={product.id}
                    _hover={{ bg: rowHoverBg }}
                    transition="background-color 0.2s"
                  >
                    <Td textAlign={"center"} color={"blue.600"} fontWeight="medium">
                      {product.id}
                    </Td>
                    <Td textAlign={"center"} fontWeight={"semibold"} color={textColor}>
                      {product.country}
                    </Td>
                    <Td textAlign={"center"} fontWeight={"medium"} color="green">
                      {product.region}
                    </Td>
                    <Td color={"Gray.00"} textAlign={"center"}>
                      <Badge bg="blue.100" borderRadius={"full"} px={2}>
                        {product.productType}
                      </Badge>
                    </Td>
                    <Td textAlign={"center"} color={textColor}fontWeight={"medium"}>{product.areaCode}</Td>
                    <Td textAlign={"center"} color={"green"} >{product.edt}</Td>
                    {/* <Td color={textColor}>{product.inventoryCount}</Td> */}
                    <Td textAlign={"center"}>
                      <Button
                        variant="ghost"
                        colorScheme="blue"
                        borderRadius={"full"}
                        size="sm"
                        leftIcon={<ViewIcon />}
                        onClick={() => handleViewProduct(product)}
                      >
                        View
                      </Button>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td
                    colSpan={8}
                    textAlign="center"
                    color="gray.400"
                    py={8}
                    fontSize="sm"
                  >
                    No products found
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination Section */}
        {totalResults > 0 && (
          <Box
            mt={4}
            bg={cardBg}
            borderRadius="16px"
            boxShadow="sm"
            border="1px solid"
            borderColor={borderColor}
            px={4}
            py={2}
            overflow={"auto"}
          >
            <Flex justify="space-between" align="center">
              {/* Results per page selector */}
              <HStack spacing={2}>
                <Text fontSize="sm" color={mutedTextColor}>
                  Show
                </Text>
                <Select
                  size="sm"
                  value={resultsPerPage}
                  onChange={handleResultsPerPageChange}
                  width="auto"
                  borderRadius="md"
                  bg={inputBg}
                  borderColor={borderColor}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Select>
                <Text fontSize="sm" color={mutedTextColor}>
                  results per page
                </Text>
              </HStack>

              {/* Pagination controls */}
              <HStack spacing={2}>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1}
                  borderRadius="md"
                >
                  <FaChevronCircleLeft />
                </Button>

                <Text fontSize="sm" color={mutedTextColor} px={2}>
                  Page {currentPage} of {totalPages}
                </Text>

                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage + 1)}
                  isDisabled={currentPage === totalPages}
                  borderRadius="md"
                >
                  <FaChevronCircleRight />
                </Button>
              </HStack>

              {/* Results count */}
              <Text fontSize="sm" color={mutedTextColor}>
                Results {startIndex + 1} - {endIndex} from the {totalResults}
              </Text>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Products;
