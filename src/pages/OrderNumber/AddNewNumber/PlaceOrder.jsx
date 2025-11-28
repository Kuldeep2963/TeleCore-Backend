// import React, { useState } from 'react';
// import {
//   Box,
//   Container,
//   VStack,
//   HStack,
//   Text,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   Button,
//   Card,
//   CardBody,
//   Heading,
//   Divider,
//   Badge,
//   Icon,
//   IconButton,
//   useColorModeValue,
//   useDisclosure
// } from '@chakra-ui/react';
// import { FaEdit, FaTrash, FaShoppingBag, FaArrowLeft, FaCheck } from 'react-icons/fa';
// import DeleteConfirmationModal from '../../../Modals/DeleteConfirmationModal';

// const PlaceOrder = ({ cartItems = [], formData = {}, onPlaceOrder = () => {}, onContinueShopping = () => {}, onRemoveFromCart = () => {}, onEditItem = () => {}, initialStep = 4 }) => {
//   const cardBg = useColorModeValue('white', 'gray.800');
//   const borderColor = useColorModeValue('gray.200', 'gray.600');
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [itemToDelete, setItemToDelete] = useState(null);

//   // Get country name from code
//   const getCountryName = (countryCode) => {
//     const countries = {
//       us: 'United States (+1)',
//       uk: 'United Kingdom (+44)',
//       ca: 'Canada (+1)',
//       au: 'Australia (+61)'
//     };
//     return countries[countryCode] || countryCode;
//   };

//   // Transform cartItems for display
//   const displayItems = cartItems.map((item, index) => ({
//     id: index + 1,
//     itemId: item.id, // Keep the actual item ID for actions
//     productType: item.productType?.toUpperCase() || 'N/A',
//     countryName: getCountryName(item.country),
//     areaCode: item.areaCode || 'N/A',
//     quantity: item.quantity || 0,
//     connectivity: item.connectivity || 'SIP',
//     prefix: item.prefix || 'E.164'
//   }));

//   // Use displayItems if cartItems exist, otherwise show empty state
//   const itemsToDisplay = displayItems.length > 0 ? displayItems : [];

//   const handleEdit = (itemId) => {
//     // Find the cart item to edit
//     const itemToEdit = cartItems.find(item => item.id === itemId);
//     if (itemToEdit && onEditItem) {
//       onEditItem(itemToEdit);
//     }
//   };

//   const handleDelete = (itemId) => {
//     setItemToDelete(itemId);
//     onOpen();
//   };

//   const handleConfirmDelete = () => {
//     if (itemToDelete && onRemoveFromCart) {
//       onRemoveFromCart(itemToDelete);
//     }
//     setItemToDelete(null);
//   };

//   const handleContinueShoppingClick = () => {
//     if (onContinueShopping) {
//       onContinueShopping();
//     }
//   };

//   const handlePlaceOrder = () => {
//     if (onPlaceOrder) {
//       onPlaceOrder({
//         cartItems,
//         formData
//       });
//     }
//   };

//   return (
//     <Box
//       flex={1}
//       p={6}
//       bg="#f8f9fa"
//       height="calc(100vh - 76px)"
//       overflowY="auto"
//     >
//       <VStack spacing={6} align="stretch">
//         {/* Page Header */}
//         <Box >
//           <Heading size="xl" color="gray.800" mb={2}>
//             Cart
//           </Heading>
//           <Text color="gray.600">
//             Review your items before placing the order
//           </Text>
//         </Box>

//         {/* Product Type Section */}
//         <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
//           <CardBody>
//             {itemsToDisplay.length > 0 ? (
//               <Box overflow="hidden" borderRadius="md" border="1px solid" borderColor={borderColor}>
//                 <Table variant="simple">
//                   <Thead>
//                     <Tr
//                       sx={{
//                         '& > th': {
//                           bg: "gray.100",
//                           color: "gray.700",
//                           fontWeight: "semibold",
//                           fontSize: "sm",
//                           letterSpacing: "0.3px",
//                           borderBottom: "2px solid",
//                           borderColor: "blue.400",
//                           textAlign: "center",
//                           py: 3
//                         }
//                       }}
//                     >
//                       <Th w={"5%"}>No.</Th>
//                       <Th>Product Type</Th>
//                       <Th>Country Name</Th>
//                       <Th>Area code (Prefix)</Th>
//                       <Th>Quantity</Th>
//                       <Th width="20%">Action</Th>
//                     </Tr>
//                   </Thead>
//                   <Tbody>
//                     {itemsToDisplay.map((item) => (
//                       <Tr key={item.id} _hover={{ bg: 'gray.50' }}>
//                         <Td>{item.id}</Td>
//                         <Td>{item.productType}</Td>
//                         <Td textAlign="center">
//                           <Badge borderRadius={"15px"} colorScheme="blue" fontSize="sm" px={3} py={1}>
//                             {item.countryName}
//                           </Badge>
//                         </Td>
//                         <Td textAlign="center" fontWeight="medium">
//                           {item.areaCode}
//                         </Td>
//                         <Td textAlign="center" fontSize="lg" fontWeight="bold">
//                           {item.quantity}
//                         </Td>
//                         <Td textAlign="center">
//                           <HStack spacing={2} justify="center">
//                             <Button
//                               leftIcon={<FaEdit />}
//                               colorScheme="blue"
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handleEdit(item.itemId)}
//                             >
//                               Edit
//                             </Button>
//                             <Button
//                               leftIcon={<FaTrash />}
//                               colorScheme="red"
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handleDelete(item.itemId)}
//                             >
//                               Delete
//                             </Button>
//                           </HStack>
//                         </Td>
//                       </Tr>
//                     ))}
//                   </Tbody>
//                 </Table>
//               </Box>
//             ) : (
//               <Box textAlign="center" py={8}>
//                 <Text color="gray.500" fontSize="lg">
//                   Your cart is empty. Please add items to proceed.
//                 </Text>
//               </Box>
//             )}
//           </CardBody>
//         </Card>

//         {/* Action Buttons */}
//         <HStack spacing={4} justify="flex-end" >
//           <Button
//             leftIcon={<FaArrowLeft />}
//             variant="outline"
//             colorScheme="blue"
//             size="md"
//             onClick={handleContinueShoppingClick}
//             px={8}
//           >
//             Continue Shopping
//           </Button>
//           {cartItems.length > 0 && (
//             <Button
//               leftIcon={<FaShoppingBag />}
//               colorScheme="green"
//               size="md"
//               onClick={handlePlaceOrder}
//               px={8}
//               _hover={{
//                 transform: 'translateY(-2px)',
//                 shadow: 'lg'
//               }}
//               transition="all 0.2s"
//             >
//               Place Order
//             </Button>
//           )}
//         </HStack>
//       </VStack>

//       {/* Delete Confirmation Modal */}
//       <DeleteConfirmationModal
//         isOpen={isOpen}
//         onClose={onClose}
//         onConfirm={handleConfirmDelete}
//         title="Remove Item from Cart"
//         message="Are you sure you want to remove this item from your cart? This action cannot be undone."
//         confirmText="Remove"
//         cancelText="Keep Item"
//       />
//     </Box>
//   );
// };

// export default PlaceOrder;




import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Card,
  CardBody,
  Heading,
  Divider,
  Badge,
  Icon,
  IconButton,
  useColorModeValue,
  useDisclosure,
  Spinner
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaShoppingBag, FaArrowLeft, FaCheck } from 'react-icons/fa';
import DeleteConfirmationModal from '../../../Modals/DeleteConfirmationModal';

const PlaceOrder = ({ 
  cartItems = [], 
  formData = {}, 
  onPlaceOrder = () => {}, 
  onContinueShopping = () => {}, 
  onRemoveFromCart = () => {}, 
  onEditItem = () => {}, 
  isPlacingOrder = false,
  initialStep = 4 
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [itemToDelete, setItemToDelete] = useState(null);

  // Get country name from code
  const getCountryName = (countryCode) => {
    const countries = {
      us: 'United States (+1)',
      uk: 'United Kingdom (+44)',
      ca: 'Canada (+1)',
      au: 'Australia (+61)'
    };
    return countries[countryCode] || countryCode;
  };

  // Transform cartItems for display
  const displayItems = cartItems.map((item, index) => ({
    id: index + 1,
    itemId: item.id, // Keep the actual item ID for actions
    productType: item.productType?.toUpperCase() || 'N/A',
    countryName: getCountryName(item.country),
    areaCode: item.areaCode || 'N/A',
    quantity: item.quantity || 0,
    connectivity: item.connectivity || 'SIP',
    prefix: item.prefix || 'E.164'
  }));

  // Use displayItems if cartItems exist, otherwise show empty state
  const itemsToDisplay = displayItems.length > 0 ? displayItems : [];

  const handleEdit = (itemId) => {
    // Find the cart item to edit
    const itemToEdit = cartItems.find(item => item.id === itemId);
    if (itemToEdit && onEditItem) {
      onEditItem(itemToEdit);
    }
  };

  const handleDelete = (itemId) => {
    setItemToDelete(itemId);
    onOpen();
  };

  const handleConfirmDelete = () => {
    if (itemToDelete && onRemoveFromCart) {
      onRemoveFromCart(itemToDelete);
    }
    setItemToDelete(null);
  };

  const handleContinueShoppingClick = () => {
    if (onContinueShopping) {
      onContinueShopping();
    }
  };

  const handlePlaceOrder = () => {
    if (onPlaceOrder) {
      onPlaceOrder({
        cartItems,
        formData
      });
    }
  };

  return (
    <Box
      flex={1}
      p={10}
      bg="#f8f9fa"
      height="calc(100vh - 76px)"
      overflowY="auto"
    >
      <VStack spacing={6} align="stretch">
        {/* Page Header */}
        <Box >
          <Heading size="xl" color="gray.800" mb={2}>
            Cart
          </Heading>
          <Text color="gray.600">
            Review your items before placing the order
          </Text>
        </Box>

        {/* Product Type Section */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            {itemsToDisplay.length > 0 ? (
              <Box overflow="hidden" borderRadius="md" border="1px solid" borderColor={borderColor}>
                <Table variant="simple">
                  <Thead>
                    <Tr
                      sx={{
                        '& > th': {
                          bg: "gray.100",
                          color: "gray.700",
                          fontWeight: "semibold",
                          fontSize: "sm",
                          letterSpacing: "0.3px",
                          borderBottom: "2px solid",
                          borderColor: "blue.400",
                          textAlign: "center",
                          py: 3
                        }
                      }}
                    >
                      <Th w={"5%"}>No.</Th>
                      <Th>Product Type</Th>
                      <Th>Country Name</Th>
                      <Th>Area code (Prefix)</Th>
                      <Th>Quantity</Th>
                      <Th width="20%">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {itemsToDisplay.map((item) => (
                      <Tr key={item.id} _hover={{ bg: 'gray.50' }}>
                        <Td>{item.id}</Td>
                        <Td>{item.productType}</Td>
                        <Td textAlign="center">
                          <Badge borderRadius={"15px"} colorScheme="blue" fontSize="sm" px={3} py={1}>
                            {item.countryName}
                          </Badge>
                        </Td>
                        <Td textAlign="center" fontWeight="medium">
                          {item.areaCode}
                        </Td>
                        <Td textAlign="center" fontSize="lg" fontWeight="bold">
                          {item.quantity}
                        </Td>
                        <Td textAlign="center">
                          <HStack spacing={2} justify="center">
                            <Button
                              leftIcon={<FaEdit />}
                              colorScheme="blue"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item.itemId)}
                            >
                              Edit
                            </Button>
                            <Button
                              leftIcon={<FaTrash />}
                              colorScheme="red"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.itemId)}
                            >
                              Delete
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box textAlign="center" py={2} >
                <Text color="gray.500" fontSize="md">
                  Your cart is empty. Please add items to proceed.
                </Text>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <HStack spacing={4} justify="flex-end" >
          <Button
            borderRadius={"full"}
            leftIcon={<FaArrowLeft />}
            variant="outline"
            colorScheme="blue"
            size="md"
            onClick={handleContinueShoppingClick}
            px={8}
          >
            Continue Shopping
          </Button>
          {cartItems.length > 0 && (
            <Button
              leftIcon={isPlacingOrder ? <Spinner size="sm" /> : <FaShoppingBag />}
              colorScheme="green"
              size="md"
              onClick={handlePlaceOrder}
              px={8}
              isLoading={isPlacingOrder}
              loadingText="Placing Order..."
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'lg'
              }}
              transition="all 0.2s"
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
            </Button>
          )}
        </HStack>
      </VStack>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirmDelete}
        title="Remove Item from Cart"
        message="Are you sure you want to remove this item from your cart? This action cannot be undone."
        confirmText="Remove"
        cancelText="Keep Item"
      />
    </Box>
  );
};

export default PlaceOrder;