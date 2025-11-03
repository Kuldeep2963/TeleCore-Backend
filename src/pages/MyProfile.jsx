import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  FormControl,
  FormLabel,
  useColorModeValue
} from '@chakra-ui/react';

function Profile() {
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const userData = {
    firstName: 'Meenu',
    lastName: 'Vashishtha',
    email: 'meenu.vashishtha@paitelecomm.cc',
    phone: '917838666761',
    address: 'Flat 1512, 15/F, Lucky Center, No. 165-171 Wan Chai Road, Wan Chai, Hong Kong'
  };

  return (
    <Box 
      flex={1} 
      p={6} 
      bg="#f8f9fa"
      height="calc(100vh - 76px)"
      overflowY="auto"
    >
      <Container maxW="container.md">
        <VStack spacing={6} align="stretch">
          <Heading
            color="#1a3a52"
            fontSize="3xl"
            fontWeight="bold"
            letterSpacing="-0.2px"
          >
            User Information
          </Heading>

          <Box
            bg="white"
            borderRadius="12px"
            p={6}
            boxShadow="sm"
            border="1px solid"
            borderColor={borderColor}
          >
            <VStack spacing={6} align="stretch">
              {/* First Name & Last Name */}
              <HStack spacing={6} align="start">
                <FormControl flex={1}>
                  <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                    First Name
                  </FormLabel>
                  <Input 
                    value={userData.firstName}
                    bg="white"
                    borderColor="gray.300"
                    size="md"
                    readOnly
                  />
                </FormControl>
                
                <FormControl flex={1}>
                  <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                    Last Name
                  </FormLabel>
                  <Input 
                    value={userData.lastName}
                    bg="white"
                    borderColor="gray.300"
                    size="md"
                    readOnly
                  />
                </FormControl>
              </HStack>

              {/* Email & Phone */}
              <HStack spacing={6} align="start">
                <FormControl flex={1}>
                  <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                    Email Address
                  </FormLabel>
                  <Input 
                    value={userData.email}
                    bg="white"
                    borderColor="gray.300"
                    size="md"
                    readOnly
                  />
                </FormControl>
                
                <FormControl flex={1}>
                  <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                    Phone
                  </FormLabel>
                  <Input 
                    value={userData.phone}
                    bg="white"
                    borderColor="gray.300"
                    size="md"
                    readOnly
                  />
                </FormControl>
              </HStack>

              {/* Address */}
              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.700" mb={2}>
                  Address
                </FormLabel>
                <Input 
                  value={userData.address}
                  bg="white"
                  borderColor="gray.300"
                  size="md"
                  readOnly
                />
              </FormControl>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default Profile;