import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Badge,
  Box,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { FaFileAlt } from 'react-icons/fa';

function DocumentRequiredModal({ isOpen, onClose, documents = [], title = "Required Documents" }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {documents.length > 0 ? (
            <List spacing={3}>
              {documents.map((doc, index) => (
                <ListItem key={index}>
                  <Box display="flex" alignItems="center">
                    <ListIcon as={FaFileAlt} color="blue.500" />
                    <Text fontWeight="medium">{doc.name}</Text>
                    {doc.required && (
                      <Badge colorScheme="red" ml={2} fontSize="xs">
                        Required
                      </Badge>
                    )}
                  </Box>
                  {doc.description && (
                    <Text fontSize="sm" color="gray.600" ml={6} mt={1}>
                      {doc.description}
                    </Text>
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Text color="gray.500" textAlign="center">
              No required documents specified.
            </Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default DocumentRequiredModal;