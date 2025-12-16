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
  VStack,
  Icon,
  useColorModeValue,
  Spinner
} from '@chakra-ui/react';
import { FaExclamationTriangle, FaCheck, FaCheckCircle, FaTimes } from 'react-icons/fa';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "delete",
  isLoading = false,
  size = { base: "sm", md: "md" }
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [isProcessing, setIsProcessing] = useState(false);

  const getIcon = () => {
    switch (type.toLowerCase()) {
      case 'delete':
      case 'disconnect':
        return FaExclamationTriangle;
      case 'approve':
        return FaCheckCircle;
      case 'reject':
        return FaTimes;
      case 'confirm':
        return FaCheck;
      default:
        return FaExclamationTriangle;
    }
  };

  const getIconColor = () => {
    switch (type.toLowerCase()) {
      case 'delete':
      case 'disconnect':
        return 'red.500';
      case 'approve':
        return 'green.500';
      case 'reject':
        return 'orange.500';
      case 'confirm':
        return 'blue.500';
      default:
        return 'red.500';
    }
  };

  const getButtonColor = () => {
    switch (type.toLowerCase()) {
      case 'delete':
      case 'disconnect':
        return 'red';
      case 'approve':
        return 'green';
      case 'reject':
        return 'orange';
      case 'confirm':
        return 'blue';
      default:
        return 'red';
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  const isDisabled = isLoading || isProcessing;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={size} closeOnOverlayClick={!isDisabled}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={bgColor} border="1px solid" borderColor={borderColor}>
        <ModalHeader>
          <VStack spacing={3}>
            <Icon
              as={getIcon()}
              color={getIconColor()}
              boxSize={12}
            />
            <Text fontSize="lg" fontWeight="semibold" textAlign="center">
              {title}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={isDisabled} />

        <ModalBody pb={6}>
          <Text color="gray.600" textAlign="center">
            {message}
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
            isDisabled={isDisabled}
          >
            {cancelText}
          </Button>
          <Button
            colorScheme={getButtonColor()}
            onClick={handleConfirm}
            isLoading={isProcessing}
            isDisabled={isDisabled}
            _hover={{
              transform: 'translateY(-1px)',
              shadow: 'md'
            }}
            transition="all 0.2s"
          >
            {isProcessing ? 'Processing...' : confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;