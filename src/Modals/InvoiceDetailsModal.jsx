import React from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
  VStack, Grid, Box, Text, Divider, Flex, Badge, HStack
} from '@chakra-ui/react';

const InvoiceDetailsModal = ({ isOpen, onClose, invoice }) => {
  if (!invoice) return null;

  const getStatusColor = (status) => {
    const s = (status || '').toString().toLowerCase();
    if (s === 'paid') return 'green';
    if (s === 'pending') return 'yellow';
    if (s === 'overdue') return 'red';
    return 'gray';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{base:"sm",md:"2xl"}}>
      <ModalOverlay backdropFilter="blur(4px)"/>
      <ModalContent>
        <ModalHeader>Invoice Details - {invoice.id || invoice.invoiceNumber}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* Basic Information */}
            <Grid templateColumns="1fr 1fr" gap={2}>
              <Box>
                <Text fontWeight="semibold" color="gray.600">Customer:</Text>
                <Text color={"purple"} fontWeight="semibold">{invoice.service || invoice.name}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color="gray.600">Invoice Date:</Text>
                <Text fontWeight="500">{invoice.date || invoice.invoiceDate}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color="gray.600">Due Date:</Text>
                <Text fontWeight="500">{invoice.dueDate||"-"}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color="gray.600">Period:</Text>
                <Text fontWeight="500">{invoice.period}</Text>
              </Box>
            </Grid>

            <Divider />

            {/* Billing Information */}
            <Grid templateColumns="1fr 1fr" gap={2}>
              <Box>
                <Text fontWeight="semibold" color="gray.600">MRC Amount:</Text>
                <Text fontWeight="500" color="blue.600">${Number(invoice.mrcAmount || invoice.price || 0).toFixed(2)}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color="gray.600">Usage Amount:</Text>
                <Text fontWeight="500" color="purple.600">${Number(invoice.usageAmount || 0).toFixed(2)}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color="gray.600">Quantity:</Text>
                <Text fontWeight="500">{invoice.quantity || 1}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color="gray.600">Total Cost:</Text>
                <Text fontWeight="500" color="green.600">${Number(invoice.totalCost || invoice.amount || 0).toFixed(2)}</Text>
              </Box>
            </Grid>

            <Divider />

            {/* Location and Product Information */}
            <Grid templateColumns="1fr 1fr" gap={2}>
              <Box>
                <Text fontWeight="semibold" color="gray.600">Country:</Text>
                <Text fontWeight="500">{invoice.countryName || '-'}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color="gray.600">Product:</Text>
                <Text fontWeight="500">{invoice.productType || '-'}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color="gray.600">Area Code:</Text>
                <Text fontWeight="500">{invoice.areaCode || '-'}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color="gray.600">Next Billing Date:</Text>
                <Text fontWeight="500">{invoice.nextBilling || invoice.toDate || '-'}</Text>
              </Box>
            </Grid>

            <Divider />

            {/* Additional Information */}
            <Grid templateColumns="1fr 1fr" gap={2}>
              <Box>
                <Text fontWeight="semibold" color="gray.600">Billing Period:</Text>
                <Text fontWeight="500">{invoice.period || '-'}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color="gray.600">Pay Date:</Text>
                <Text fontWeight="500">{invoice.payDate ||"-"}</Text>
              </Box>
            </Grid>

            <Divider />

            {/* Status and Total */}
            <Flex justify="space-between" align="center">
              <Badge colorScheme={getStatusColor(invoice.status)} fontSize="md" px={3} py={1}>
                 {invoice.status}
              </Badge>
              <Box textAlign="right">
                <Text fontWeight="bold">Total Amount:</Text>
                <Text fontWeight="bold" fontSize="xl" color="green.600">
                  ${Number(invoice.totalCost || invoice.amount || 0).toFixed(2)}
                </Text>
              </Box>
            </Flex>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InvoiceDetailsModal;