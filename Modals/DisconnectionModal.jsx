import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Textarea,
  Text,
  VStack,
  HStack,
  Box,
  Icon,
  useToast
} from '@chakra-ui/react';
import { FaExclamationTriangle } from 'react-icons/fa';
import api from '../services/api';

function DisconnectionModal({ isOpen, onClose, number, onSuccess }) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for disconnection',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.disconnectionRequests.create({
        number_id: number.id,
        order_id: number.order_id,
        notes: reason.trim()
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Disconnection request submitted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Call success callback to update UI
        if (onSuccess) {
          onSuccess(number.id);
        }

        // Close modal and reset form
        setReason('');
        onClose();
      } else {
        throw new Error(response.message || 'Failed to submit disconnection request');
      }
    } catch (error) {
      console.error('Disconnection request error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit disconnection request',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{base:"md",md:"lg"}} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FaExclamationTriangle} color="orange.500" />
            <Text>Request Number Disconnection</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box
              bg="orange.50"
              borderRadius="md"
              p={4}
              border="1px solid"
              borderColor="orange.200"
            >
              <HStack spacing={3} align="start">
                <Icon as={FaExclamationTriangle} color="orange.500" mt={1} />
                <VStack spacing={2} align="start" flex={1}>
                  <Text fontWeight="semibold" color="orange.800">
                    Number: {number?.number}
                  </Text>
                  <Text fontSize="sm" color="orange.700">
                    Country: {number?.country_name || number?.country} | Product: {number?.product_name || number?.productType}
                  </Text>
                  <Text fontSize="sm" color="orange.700">
                    This action will create a disconnection request that needs to be reviewed and approved by our internal team.
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <VStack spacing={2} align="stretch">
              <Text fontWeight="semibold" fontSize="md">
                Reason for Disconnection *
              </Text>
              <Textarea
                placeholder="Please provide a detailed reason for requesting disconnection of this number..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                resize="vertical"
                borderRadius="md"
                focusBorderColor="blue.500"
                isDisabled={isSubmitting}
              />
              <Text fontSize="sm" color="gray.600">
                Minimum 10 characters required
              </Text>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="ghost"
              onClick={handleCancel}
              isDisabled={isSubmitting}
              colorScheme="gray"
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Submitting..."
              isDisabled={!reason.trim() || reason.trim().length < 10}
            >
              Send Request
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default DisconnectionModal;