// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import PlaceOrder from './PlaceOrder';
// import Submitted from './Submitted';
// import { Box, VStack } from '@chakra-ui/react';

// const PlaceOrderPage = ({ cartItems = [], formData = {}, onPlaceOrder = () => {}, onRemoveFromCart = () => {} }) => {
//   const navigate = useNavigate();
//   const [isSubmitted, setIsSubmitted] = useState(false);

//   const handleContinueShopping = () => {
//     navigate('/order-numbers/new');
//   };

//   const handleEditItem = (itemToEdit) => {
//     // Remove the item from cart
//     onRemoveFromCart(itemToEdit.id);
//     // Navigate back to NewNumber page with the item data for editing
//     navigate('/order-numbers/new', {
//       state: {
//         editItem: itemToEdit
//       }
//     });
//   };

//   const handlePlaceOrder = async (orderData) => {
//     try {
//       await onPlaceOrder();
//       setIsSubmitted(true);
//     } catch (error) {
//       console.error('Order placement failed:', error);
//     }
//   };

//   if (isSubmitted) {
//     return (
//       <Box
//         flex={1}
//         p={6}
//         bg="#f8f9fa"
//         height="calc(100vh - 76px)"
//         overflowY="auto"
//       >
//         <VStack spacing={6} align="stretch">
//           <Submitted />
//         </VStack>
//       </Box>
//     );
//   }

//   return (
//     <PlaceOrder
//       cartItems={cartItems}
//       formData={formData}
//       onPlaceOrder={handlePlaceOrder}
//       onContinueShopping={handleContinueShopping}
//       onRemoveFromCart={onRemoveFromCart}
//       onEditItem={handleEditItem}
//     />
//   );
// };

// export default PlaceOrderPage;




import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlaceOrder from './PlaceOrder';
import Submitted from './Submitted';
import { Box, VStack, useToast } from '@chakra-ui/react';

const PlaceOrderPage = ({ cartItems = [], formData = {}, onPlaceOrder = () => {}, onRemoveFromCart = () => {} }) => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const toast = useToast();

  const handleContinueShopping = () => {
    navigate('/order-numbers/new');
  };

  const handleEditItem = (itemToEdit) => {
    // Remove the item from cart
    onRemoveFromCart(itemToEdit.id);
    // Navigate back to NewNumber page with the item data for editing
    navigate('/order-numbers/new', {
      state: {
        editItem: itemToEdit
      }
    });
  };

  const handlePlaceOrder = async (orderData) => {
    if (isPlacingOrder) return;
    
    setIsPlacingOrder(true);
    try {
      const result = await onPlaceOrder(orderData);
      if (result && result.success) {
        setIsSubmitted(true);
        toast({
          title: 'Order Placed Successfully',
          description: 'Your order has been placed successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(result?.message || 'Order placement failed');
      }
    } catch (error) {
      console.error('Order placement failed:', error);
      toast({
        title: 'Order Placement Failed',
        description: error.message || 'Failed to place order. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isSubmitted) {
    return (
      <Box
        flex={1}
        p={6}
        bg="#f8f9fa"
        height="calc(100vh - 76px)"
        overflowY="auto"
      >
        <VStack spacing={6} align="stretch">
          <Submitted />
        </VStack>
      </Box>
    );
  }

  return (
    <PlaceOrder
      cartItems={cartItems}
      formData={formData}
      onPlaceOrder={handlePlaceOrder}
      onContinueShopping={handleContinueShopping}
      onRemoveFromCart={onRemoveFromCart}
      onEditItem={handleEditItem}
      isPlacingOrder={isPlacingOrder}
    />
  );
};

export default PlaceOrderPage;