import React from 'react';
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
  useColorModeValue
} from '@chakra-ui/react';
import { FaExclamationTriangle } from 'react-icons/fa';

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel"
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg={bgColor} border="1px solid" borderColor={borderColor}>
        <ModalHeader>
          <VStack spacing={3}>
            <Icon
              as={FaExclamationTriangle}
              color="red.500"
              boxSize={12}
            />
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
              {title}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <Text color="gray.600" textAlign="center">
            {message}
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            colorScheme="red"
            onClick={handleConfirm}
            _hover={{
              transform: 'translateY(-1px)',
              shadow: 'md'
            }}
            transition="all 0.2s"
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteConfirmationModal;