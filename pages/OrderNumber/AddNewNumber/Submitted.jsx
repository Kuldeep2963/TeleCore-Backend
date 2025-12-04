import React from 'react';
import {
  VStack,
  Text,
  Card,
  CardBody,
  Heading,
  Icon
} from '@chakra-ui/react';
import { FaCheck } from 'react-icons/fa';

const Submitted = () => {
  return (
    <VStack spacing={6} align="stretch">
      {/* Success Message */}
      <Card bg="white" borderRadius="12px" boxShadow="sm" border="1px solid" borderColor="gray.200">
        <CardBody p={6} textAlign="center">
          <Icon as={FaCheck} boxSize={16} color="green.500" mb={4} />
          <Heading size="lg" color="gray.800" mb={2}>
            Order Submitted Successfully!
          </Heading>
          <Text color="gray.600">
            Your order has been submitted. You will receive a confirmation email shortly.
          </Text>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Submitted;