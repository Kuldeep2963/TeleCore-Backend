import React from "react";
import {
  Box,
  VStack,
  HStack,
  Select,
  Button,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Badge,
  Divider,
  Text,
  SimpleGrid,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiPlus, FiTrash2, FiMapPin } from "react-icons/fi";

const AddCountryModal = ({
  isOpen,
  onClose,
  newCountryData,
  setNewCountryData,
  products,
  handleAddNewCountry,
  handleAddProductToNew,
  handleRemoveProductFromNew,
  handleNewProductAreaCodeChange,
  handleAddNewAreaCode,
  handleRemoveNewAreaCode,
}) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.600");

  return (
    <Modal  isOpen={isOpen} onClose={onClose} size={{base:"sm",md:"xl"}}>
      <ModalOverlay backdropFilter="blur(4px)"  />
      <ModalContent>
        <ModalHeader bg="blue.50" borderBottom="1px solid" borderColor="gray.200">
          <HStack spacing={3}>
            <Box p={2} bg="blue.100" borderRadius="lg">
              <FiMapPin size={20} color="#3182CE" />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                Add New Country
              </Text>
              <Text fontSize="sm" color="gray.600">
                Configure country details and available products
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody maxH="60vh" overflowY="auto" py={6}>
          <VStack spacing={6} align="stretch">
            {/* Basic Country Information */}
            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.700">
                  Country Name
                </FormLabel>
                <Input
                  value={newCountryData.countryname}
                  onChange={(e) =>
                    setNewCountryData({
                      ...newCountryData,
                      countryname: e.target.value,
                    })
                  }
                  placeholder="e.g., United States"
                  borderRadius="lg"
                  size="md"
                  bg={cardBg}
                  borderColor={borderColor}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.700">
                  Phone Code
                </FormLabel>
                <Input
                  value={newCountryData.phonecode}
                  onChange={(e) =>
                    setNewCountryData({
                      ...newCountryData,
                      phonecode: e.target.value,
                    })
                  }
                  placeholder="e.g., +1"
                  borderRadius="lg"
                  size="md"
                  bg={cardBg}
                  borderColor={borderColor}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                />
              </FormControl>
            </SimpleGrid>

            <Divider borderColor="gray.300" />

            {/* Products Section */}
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Heading size="md" color="gray.800">
                    Products & Area Codes
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    Add available products and their area codes
                  </Text>
                </VStack>
                
                {products.length > 0 && (
                  <FormControl w="auto">
                    <Select
                      placeholder="Add Product"
                      borderRadius="lg"
                      size="md"
                      bg={cardBg}
                      borderColor={borderColor}
                      _focus={{ borderColor: "blue.500" }}
                      onChange={(e) => {
                        const product = products.find(
                          (p) => p.id === e.target.value
                        );
                        if (product) {
                          handleAddProductToNew(product);
                        }
                        e.target.value = "";
                      }}
                      isDisabled={!newCountryData.countryname || !newCountryData.phonecode}
                      
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.code})
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </HStack>

              {/* Products List */}
              {/* {newCountryData.products.length === 0 ? (
                <Box
                  p={2}
                  textAlign="center"
                  bg="gray.50"
                  borderRadius="lg"
                  border="2px dashed"
                  borderColor="gray.300"
                >
                  <FiPlus size={15} color="#9CA3AF" style={{ margin: '0 auto 10px' }} />
                  <Text color="gray.500" fontSize="xs">
                    No products added yet. Select a product to get started.
                  </Text>
                </Box>
              ) : ( */}
                <VStack spacing={4} align="stretch">
                  {newCountryData.products.map((product, productIndex) => (
                    <Box
                      key={productIndex}
                      p={3}
                      pl={4}
                      bg={cardBg}
                      borderRadius="xl"
                      border="1px solid"
                      borderColor={borderColor}
                      boxShadow="sm"
                      _hover={{ boxShadow: "md" }}
                      transition="all 0.2s"
                    >
                      {/* Product Header */}
                      <Flex justify="space-between" align="center" mb={2}>
                        <Badge 
                          colorScheme="blue" 
                          fontSize="sm" 
                          py={1} 
                          px={3} 
                          borderRadius="full"
                          bg="blue.50"
                          color="blue.700"
                          border="1px solid"
                          borderColor="blue.200"
                        >
                          {product.name}
                        </Badge>
                        <IconButton
                          icon={<FiTrash2 />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleRemoveProductFromNew(productIndex)}
                          aria-label="Remove product"
                        />
                      </Flex>

                      {/* Area Codes Section */}
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                            Area Codes
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {product.areaCodes?.length || 0} added
                          </Text>
                        </HStack>

                        {product.areaCodes && product.areaCodes.length > 0 && (
                          <SimpleGrid columns={3} spacing={3}>
                            {product.areaCodes.map((areaCode, codeIndex) => (
                              <HStack 
                                key={codeIndex} 
                                spacing={1}
                                bg="white"
                                px={2}
                                borderRadius="lg"
                                border="1px solid"
                                borderColor="gray.400"
                                _hover={{ borderColor: "blue.300" }}
                              >
                                <Input
                                  value={areaCode}
                                  onChange={(e) =>
                                    handleNewProductAreaCodeChange(
                                      productIndex,
                                      codeIndex,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Code"
                                  size="sm"
                                  borderRadius="md"
                                  border="none"
                                  _focus={{ boxShadow: "none" }}
                                  fontSize="sm"
                                  fontWeight="medium"
                                />
                                <IconButton
                                  icon={<FiTrash2 size={14} />}
                                  size="xs"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() =>
                                    handleRemoveNewAreaCode(productIndex, codeIndex)
                                  }
                                  aria-label="Remove area code"
                                  minW="auto"
                                  w="24px"
                                  h="24px"
                                />
                              </HStack>
                            ))}
                          </SimpleGrid>
                        )}

                        {/* Add Area Code Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<FiPlus size={14} />}
                          onClick={() => handleAddNewAreaCode(productIndex)}
                          colorScheme="blue"
                          borderRadius="full"
                          w="fit-content"
                          alignSelf="flex-start"
                        > Add
                        </Button>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              {/* )} */}
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter bg="gray.100" borderTop="1px solid" borderColor="gray.200">
          <HStack spacing={3}>
            <Button
              variant="outline"
              borderRadius="full"
              onClick={() => {
                onClose();
                setNewCountryData({
                  countryname: "",
                  phonecode: "",
                  products: [],
                });
              }}
              size="md"
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              borderRadius="full"
              onClick={handleAddNewCountry}
              leftIcon={<FiPlus />}
              size="md"
              isDisabled={!newCountryData.countryname || !newCountryData.phonecode}
              _disabled={{
                bg: "gray.300",
                color: "gray.500",
                cursor: "not-allowed",
              }}
            >
              Add Country
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddCountryModal;