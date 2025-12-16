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
  Text,
  Textarea,
  VStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';

const RejectionReasonModal = ({
  isOpen,
  onClose,
  onConfirm,
  phoneNumber = '',
  isLoading = false,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleConfirm = async () => {
    if (!rejectionReason.trim()) {
      return;
    }
    setIsProcessing(true);
    try {
      await onConfirm(rejectionReason.trim());
    } finally {
      setIsProcessing(false);
      setRejectionReason('');
      onClose();
    }
  };

  const isDisabled = isLoading || isProcessing || !rejectionReason.trim();

  const handleClose = () => {
    if (!isProcessing) {
      setRejectionReason('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered closeOnOverlayClick={!isProcessing}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={bgColor} border="1px solid" borderColor={borderColor}>
        <ModalHeader>
          <VStack spacing={3}>
            <Icon as={FaTimes} color="orange.500" boxSize={12} />
            <Text fontSize="lg" fontWeight="semibold" textAlign="center">
              Reject Disconnection Request
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={isProcessing} />

        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Text color="gray.600" fontSize="sm">
              Please provide a reason for rejecting this request for <strong>{phoneNumber}</strong>
            </Text>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              minH="120px"
              resize="vertical"
              isDisabled={isProcessing}
              borderColor={borderColor}
              _focus={{
                borderColor: 'orange.500',
                boxShadow: '0 0 0 1px rgba(255, 140, 0, 0.6)',
              }}
            />
          </VStack>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={handleClose} isDisabled={isProcessing}>
            Cancel
          </Button>
          <Button
            colorScheme="orange"
            onClick={handleConfirm}
            isLoading={isProcessing}
            isDisabled={isDisabled}
            _hover={{
              transform: 'translateY(-1px)',
              shadow: 'md',
            }}
            transition="all 0.2s"
          >
            {isProcessing ? 'Rejecting...' : 'Reject'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RejectionReasonModal;
