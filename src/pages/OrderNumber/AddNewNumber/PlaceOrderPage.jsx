import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlaceOrder from './PlaceOrder';
import Submitted from './Submitted';
import { Box, VStack } from '@chakra-ui/react';

const PlaceOrderPage = ({ cartItems = [], onPlaceOrder = () => {}, onRemoveFromCart = () => {} }) => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handlePlaceOrder = () => {
    onPlaceOrder();
    setIsSubmitted(true);
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
      onPlaceOrder={handlePlaceOrder}
      onContinueShopping={handleContinueShopping}
      onRemoveFromCart={onRemoveFromCart}
      onEditItem={handleEditItem}
    />
  );
};

export default PlaceOrderPage;