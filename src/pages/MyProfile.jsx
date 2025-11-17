import React, { useState, useRef, useEffect } from 'react';
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
  useColorModeValue,
  Avatar,
  IconButton,
  useToast
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { FaCamera } from 'react-icons/fa';
import api from '../services/api';

function Profile({ profilePicture, onProfilePictureUpdate, userId, userProfile, userRole }) {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();
  const fileInputRef = useRef(null);

  // Fetch customer data for client users
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (userRole === 'Client' && userId) {
        setLoading(true);
        try {
          // Find customer by user_id
          const customersResponse = await api.customers.getAll();
          if (customersResponse.success) {
            const customer = customersResponse.data.find(c => c.user_id === userId);
            if (customer) {
              setCustomerData(customer);
            }
          }
        } catch (error) {
          console.error('Failed to fetch customer data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCustomerData();
  }, [userRole, userId]);

  // Use real user data from props, with customer data for additional fields
  const userData = {
    firstName: userProfile.firstName || 'N/A',
    lastName: userProfile.lastName || 'N/A',
    email: userProfile.email || 'N/A',
    phone: customerData?.phone || 'Not available',
    address: customerData?.location || 'Not available'
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target.result;

        try {
          // Update local state immediately for UI feedback
          onProfilePictureUpdate(imageDataUrl);

          // Save to backend
          if (userId) {
            const response = await api.users.updateProfilePicture(userId, imageDataUrl);
            if (response.success) {
              toast({
                title: 'Profile picture updated',
                description: 'Your profile picture has been successfully saved.',
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
            } else {
              throw new Error(response.message || 'Failed to save profile picture');
            }
          } else {
            toast({
              title: 'Error',
              description: 'User ID not available. Please try logging in again.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          }
        } catch (error) {
          console.error('Failed to update profile picture:', error);
          toast({
            title: 'Update failed',
            description: 'Failed to save profile picture. Please try again.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfilePicture = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box 
      flex={1} 
      p={6} 
      bg="#f8f9fa"
      height="calc(100vh - 76px)"
      overflowY="auto"
    >
      <Container maxW="container.xl">
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
              {/* Profile Picture */}
              <HStack spacing={6} align="center" justify="center">
                <VStack spacing={4} align="center">
                  <Box position="relative">
                    <Avatar
                      size="xl"
                      src={profilePicture}
                      name={`${userData.firstName} ${userData.lastName}`}
                      bg="blue.500"
                      color="white"
                    />
                    <IconButton
                      aria-label="Change profile picture"
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="green"
                      variant="solid"
                      borderRadius="full"
                      position="absolute"
                      bottom={0}
                      right={0}
                      onClick={handleEditProfilePicture}
                      _hover={{
                        transform: 'scale(1.1)',
                        transition: 'all 0.2s'
                      }}
                    />
                  </Box>
                  {/* <Button
                    leftIcon={<FaCamera />}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    onClick={handleEditProfilePicture}
                  >
                    Change Profile Picture
                  </Button> */}
                </VStack>
              </HStack>

              {/* Hidden file input */}
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePictureChange}
                accept="image/*"
                display="none"
              />

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