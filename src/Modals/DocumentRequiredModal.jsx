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
  // Default documents if none are provided
  const defaultDocuments = [
    {
      name: "Business Registration",
      required: true,
      description: "Official business registration certificate or license"
    },
    {
      name: "Identity Proof",
      required: true,
      description: "Government-issued ID with address and contact details such as passport"
    },
     {
      name: "Bussiness Case / Use Case",
      required: true,
      description: ""
    }
  ];

  // Use provided documents or default ones
  const displayDocuments = documents.length > 0 ? documents : defaultDocuments;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {displayDocuments.length > 0 ? (
            <List spacing={3}>
              {displayDocuments.map((doc, index) => (
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