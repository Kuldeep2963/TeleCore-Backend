import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Select,
  Button,
  Text,
  Heading,
  Spinner,
  Center,
  useToast,
  IconButton,
  Input,
  FormControl,
  FormLabel,
  SimpleGrid,
  Badge,
  Divider,
} from "@chakra-ui/react";
import { FiEdit2, FiSave, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import api from "../services/api";
import AddCountryModal from "../Modals/AddCountryModal";

const Countries = () => {
  const [countries, setCountries] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingCountry, setEditingCountry] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCountryData, setNewCountryData] = useState({
    countryname: "",
    phonecode: "",
    products: [],
  });
  const toast = useToast();

  useEffect(() => {
    fetchCountriesAndProducts();
  }, []);

  const fetchCountriesAndProducts = async () => {
    try {
      setLoading(true);
      const [countriesRes, productsRes] = await Promise.all([
        api.countries.getAll(),
        api.products.getAll(),
      ]);

      if (countriesRes.success) {
        setCountries(countriesRes.data);
        if (countriesRes.data.length > 0) {
          setSelectedCountry();
        }
      }

      if (productsRes.success) {
        setProducts(productsRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load countries and products",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const parseAvailableProducts = (availableproducts) => {
    if (!availableproducts) return [];

    if (Array.isArray(availableproducts)) {
      return availableproducts;
    }

    if (typeof availableproducts === "string") {
      try {
        return JSON.parse(availableproducts);
      } catch (e) {
        return [];
      }
    }

    if (typeof availableproducts === "object") {
      return [availableproducts];
    }

    return [];
  };

  const getCountryProducts = (country) => {
    const productsData = parseAvailableProducts(country.availableproducts);
    return productsData.map((item) => {
      if (typeof item === "string") {
        return {
          name: item,
          areaCodes: [],
        };
      }
      return {
        name: item.name || item.code || "",
        areaCodes: item.areaCodes || item.areacodes || [],
      };
    });
  };

  const currentCountry = countries.find(
    (c) => c.countryname === selectedCountry
  );
  const currentProducts = currentCountry
    ? getCountryProducts(currentCountry)
    : [];

  const handleEditStart = (country) => {
    setEditingCountry(country.id);
    setEditValues({
      countryname: country.countryname,
      phonecode: country.phonecode,
      products: getCountryProducts(country),
    });
  };

  const handleEditCancel = () => {
    setEditingCountry(null);
    setEditValues({});
  };

  const handleProductAreaCodeChange = (productIndex, areaCodeIndex, value) => {
    const updatedProducts = [...editValues.products];
    if (!updatedProducts[productIndex].areaCodes) {
      updatedProducts[productIndex].areaCodes = [];
    }
    updatedProducts[productIndex].areaCodes[areaCodeIndex] = value;
    setEditValues({ ...editValues, products: updatedProducts });
  };

  const handleAddAreaCode = (productIndex) => {
    const updatedProducts = [...editValues.products];
    if (!updatedProducts[productIndex].areaCodes) {
      updatedProducts[productIndex].areaCodes = [];
    }
    updatedProducts[productIndex].areaCodes.push("");
    setEditValues({ ...editValues, products: updatedProducts });
  };

  const handleRemoveAreaCode = (productIndex, areaCodeIndex) => {
    const updatedProducts = [...editValues.products];
    updatedProducts[productIndex].areaCodes.splice(areaCodeIndex, 1);
    setEditValues({ ...editValues, products: updatedProducts });
  };

  const handleAddProductToEdit = (product) => {
    const exists = editValues.products?.find((p) => p.name === product.name);
    if (!exists) {
      setEditValues({
        ...editValues,
        products: [
          ...(editValues.products || []),
          { name: product.name, areaCodes: [] },
        ],
      });
    }
  };

  const handleRemoveProductFromEdit = (productIndex) => {
    setEditValues({
      ...editValues,
      products: editValues.products?.filter((_, i) => i !== productIndex),
    });
  };

  const handleSaveCountry = async () => {
    try {
      const updateData = {
        countryname: editValues.countryname,
        phonecode: editValues.phonecode,
        availableproducts: editValues.products,
      };

      await api.countries.update(editingCountry, updateData);

      toast({
        title: "Success",
        description: "Country updated successfully",
        status: "success",
        duration: 3000,
      });

      setEditingCountry(null);
      await fetchCountriesAndProducts();
    } catch (error) {
      console.error("Error updating country:", error);
      toast({
        title: "Error",
        description: "Failed to update country",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddNewCountry = async () => {
    try {
      if (!newCountryData.countryname || !newCountryData.phonecode) {
        toast({
          title: "Validation Error",
          description: "Please enter country name and phone code",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      const createData = {
        countryname: newCountryData.countryname,
        phonecode: newCountryData.phonecode,
        availableproducts: newCountryData.products,
      };

      await api.countries.create(createData);

      toast({
        title: "Success",
        description: "Country added successfully",
        status: "success",
        duration: 3000,
      });

      setIsAddModalOpen(false);
      setNewCountryData({ countryname: "", phonecode: "", products: [] });
      await fetchCountriesAndProducts();
    } catch (error) {
      console.error("Error adding country:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add country",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddProductToNew = (product) => {
    const exists = newCountryData.products.find((p) => p.name === product.name);
    if (!exists) {
      setNewCountryData({
        ...newCountryData,
        products: [
          ...newCountryData.products,
          { name: product.name, areaCodes: [] },
        ],
      });
    }
  };

  const handleRemoveProductFromNew = (productIndex) => {
    setNewCountryData({
      ...newCountryData,
      products: newCountryData.products.filter((_, i) => i !== productIndex),
    });
  };

  const handleNewProductAreaCodeChange = (
    productIndex,
    areaCodeIndex,
    value
  ) => {
    const updatedProducts = [...newCountryData.products];
    if (!updatedProducts[productIndex].areaCodes) {
      updatedProducts[productIndex].areaCodes = [];
    }
    updatedProducts[productIndex].areaCodes[areaCodeIndex] = value;
    setNewCountryData({ ...newCountryData, products: updatedProducts });
  };

  const handleAddNewAreaCode = (productIndex) => {
    const updatedProducts = [...newCountryData.products];
    if (!updatedProducts[productIndex].areaCodes) {
      updatedProducts[productIndex].areaCodes = [];
    }
    updatedProducts[productIndex].areaCodes.push("");
    setNewCountryData({ ...newCountryData, products: updatedProducts });
  };

  const handleRemoveNewAreaCode = (productIndex, areaCodeIndex) => {
    const updatedProducts = [...newCountryData.products];
    updatedProducts[productIndex].areaCodes.splice(areaCodeIndex, 1);
    setNewCountryData({ ...newCountryData, products: updatedProducts });
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading as="h1" size="lg">
            Countries Management
          </Heading>
          <Button
            size={"sm"}
            leftIcon={<FiPlus />}
            colorScheme="blue"
            borderRadius="full"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Country
          </Button>
          </HStack>
           <Divider
            pt={2}
            borderRadius={"full"}
            border="0"
            bgGradient="linear(to-r, gray.300, gray.200, transparent)"
          />
        

        {countries.length > 0 && (
          <HStack spacing={4} p={1}>
            <Text fontWeight="bold" fontSize="sm">
              Select Country:
            </Text>
            <Select
              bg={"white"}
              placeholder="Select country"
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setEditingCountry(null);
              }}
              maxW="300px"
              borderRadius="full"
            >
              {countries.map((country) => (
                <option key={country.id} value={country.countryname}>
                  {country.countryname} ({country.phonecode})
                </option>
              ))}
            </Select>
          </HStack>
        )}

        {currentCountry && (
          <Box bg="white" p={6} borderRadius="md" boxShadow="sm">
            <HStack justify="space-between" align="center" mb={6}>
              <VStack align="start" spacing={1}>
                <Heading size="md">{currentCountry.countryname}</Heading>
                <Text fontSize="sm" color="gray.600">
                  Phone Code: {currentCountry.phonecode}
                </Text>
              </VStack>
              {products.length > 0 && (
                <HStack spacing={3} align="center">
                  <Text fontWeight="bold" color={"green"} fontSize="sm">
                    Add Product:
                  </Text>
                  <Select
                    w={"300px"}
                    placeholder="Select product to add"
                    borderRadius="full"
                    onChange={(e) => {
                      const product = products.find(
                        (p) => p.id === e.target.value
                      );
                      if (product) {
                        handleAddProductToEdit(product);
                      }
                      e.target.value = "";
                    }}
                  >
                    {products
                      .filter(
                        (p) =>
                          !editValues.products?.some((ep) => ep.name === p.name)
                      )
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.code})
                        </option>
                      ))}
                  </Select>
                </HStack>
              )}

              {editingCountry !== currentCountry.id && (
                <Button
                  leftIcon={<FiEdit2 />}
                  colorScheme="blue"
                  variant="outline"
                  borderRadius={"full"}
                  size="sm"
                  onClick={() => handleEditStart(currentCountry)}
                >
                  Edit Country
                </Button>
              )}
            </HStack>

            {editingCountry === currentCountry.id ? (
              <VStack spacing={6} align="stretch">
                {/* <HStack spacing={8}>
                <FormControl>
                  <FormLabel>Country Name</FormLabel>
                  <Input
                    value={editValues.countryname}
                    onChange={(e) => setEditValues({ ...editValues, countryname: e.target.value })}
                    placeholder="Country name"
                    borderRadius="10px"
                    readOnly
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone Code</FormLabel>
                  <Input
                    value={editValues.phonecode}
                    onChange={(e) => setEditValues({ ...editValues, phonecode: e.target.value })}
                    placeholder="+1, +44, etc."
                    borderRadius="10px"
                    readOnly
                  />
                </FormControl>
              </HStack> */}
                <Divider />

                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Heading size="sm">Products & Area Codes</Heading>
                  </HStack>
                  {editValues.products?.map((product, productIndex) => (
                    <Box
                      key={productIndex}
                      p={4}
                      bg="gray.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      <HStack mb={4} justify="space-between">
                        <Badge borderRadius={"full"} colorScheme="blue" px={2}>
                          {product.name}
                        </Badge>
                        <IconButton
                          icon={<FiTrash2 />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() =>
                            handleRemoveProductFromEdit(productIndex)
                          }
                          aria-label="Remove product"
                        />
                      </HStack>

                      <SimpleGrid columns={5} spacing={3} w="full">
                        {product.areaCodes?.map((areaCode, codeIndex) => (
                          <HStack key={codeIndex} spacing={2}>
                            <Input
                              value={areaCode}
                              onChange={(e) =>
                                handleProductAreaCodeChange(
                                  productIndex,
                                  codeIndex,
                                  e.target.value
                                )
                              }
                              placeholder="Area code"
                              size="sm"
                              borderRadius="8px"
                            />
                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() =>
                                handleRemoveAreaCode(productIndex, codeIndex)
                              }
                              aria-label="Remove"
                            />
                          </HStack>
                        ))}
                      </SimpleGrid>
                      <Button
                        w="70px"
                        size="xs"
                        borderRadius="full"
                        variant="outline"
                        leftIcon={<FiPlus />}
                        onClick={() => handleAddAreaCode(productIndex)}
                        colorScheme="blue"
                        mt={3}
                      >
                        Add
                      </Button>
                    </Box>
                  ))}
                </VStack>

                <HStack spacing={3} pt={4}>
                  <Button
                    size={"sm"}
                    leftIcon={<FiSave />}
                    colorScheme="green"
                    onClick={handleSaveCountry}
                    borderRadius="full"
                  >
                    Save Changes
                  </Button>
                  <Button
                    size={"sm"}
                    leftIcon={<FiX />}
                    variant="outline"
                    onClick={handleEditCancel}
                    borderRadius="full"
                  >
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <VStack align="stretch" spacing={4}>
                {currentProducts.length > 0 ? (
                  currentProducts.map((product, index) => (
                    <Box
                      key={index}
                      p={4}
                      bg="gray.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      <Heading size="sm" mb={3}>
                        {product.name}
                      </Heading>
                      {product.areaCodes && product.areaCodes.length > 0 ? (
                        <HStack flexWrap="wrap" spacing={5}>
                          {product.areaCodes.map((code, codeIndex) => (
                            <Badge
                              px={2}
                              borderRadius={"12px"}
                              fontSize={"sm"}
                              key={codeIndex}
                              bg={"green.400"}
                              variant="solid"
                            >
                              {code}
                            </Badge>
                          ))}
                        </HStack>
                      ) : (
                        <Text color="gray.500" fontSize="sm">
                          No area codes defined
                        </Text>
                      )}
                    </Box>
                  ))
                ) : (
                  <Center py={8}>
                    <Text color="gray.500">
                      No products available for this country
                    </Text>
                  </Center>
                )}
              </VStack>
            )}
          </Box>
        )}

        <AddCountryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          newCountryData={newCountryData}
          setNewCountryData={setNewCountryData}
          products={products}
          handleAddNewCountry={handleAddNewCountry}
          handleAddProductToNew={handleAddProductToNew}
          handleRemoveProductFromNew={handleRemoveProductFromNew}
          handleNewProductAreaCodeChange={handleNewProductAreaCodeChange}
          handleAddNewAreaCode={handleAddNewAreaCode}
          handleRemoveNewAreaCode={handleRemoveNewAreaCode}
        />
      </VStack>
    </Box>
  );
};

export default Countries;
