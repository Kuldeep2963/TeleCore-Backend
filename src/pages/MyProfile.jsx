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
  useToast,
  Card,
  CardBody,
  Grid,
  GridItem,
  Badge,
  Divider,
  Flex,
  SimpleGrid,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  Tooltip,
  Skeleton,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { EditIcon, PhoneIcon, EmailIcon, LockIcon } from '@chakra-ui/icons';
import { FaUser, FaMapMarkerAlt, FaCamera, FaShieldAlt, FaWallet } from 'react-icons/fa';
import { FiBriefcase } from 'react-icons/fi';
import { MdSecurity, MdPerson } from 'react-icons/md';
import api from '../services/api';

function Profile({ profilePicture, onProfilePictureUpdate, userId, userProfile, userRole }) {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    companyName: ''
  });
  const toast = useToast();
  const fileInputRef = useRef(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const subtleBg = useColorModeValue('gray.50', 'gray.700');

  // Fetch customer data for client users
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (userId) {
        setLoading(true);
        try {
          if (userRole === 'Client') {
            // Fetch customer data for current user
            const customerResponse = await api.customers.getMe();
            if (customerResponse.success) {
              setCustomerData(customerResponse.data);
              // Initialize form data with customer data
              setFormData({
                firstName: userProfile.firstName || '',
                lastName: userProfile.lastName || '',
                email: userProfile.email || '',
                phone: customerResponse.data.phone || '',
                address: customerResponse.data.location || '',
                companyName: customerResponse.data.company_name || ''
              });
            }
          } else {
            // Initialize form data for non-client users
            setFormData({
              firstName: userProfile.firstName || '',
              lastName: userProfile.lastName || '',
              email: userProfile.email || '',
              phone: '',
              address: '',
              companyName: ''
            });
          }
        } catch (error) {
          console.error('Failed to fetch profile data:', error);
          // Initialize form data even if fetch fails
          setFormData({
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            email: userProfile.email || '',
            phone: '',
            address: '',
            companyName: ''
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCustomerData();
  }, [userRole, userId, userProfile, toast]);

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file (JPEG, PNG, etc.)',
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
          description: 'Please select an image smaller than 5MB',
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
                title: 'Profile picture updated!',
                description: 'Your profile picture has been successfully updated.',
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
            } else {
              throw new Error(response.message || 'Failed to save profile picture');
            }
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      // Here you would typically make API calls to update the user profile
      // For now, we'll just show a success message
      setIsEditing(false);
      toast({
        title: 'Profile updated!',
        description: 'Your profile information has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original values
    setFormData({
      firstName: userProfile.firstName || '',
      lastName: userProfile.lastName || '',
      email: userProfile.email || '',
      phone: customerData?.phone || '',
      address: customerData?.location || '',
      companyName: customerData?.company_name || ''
    });
    setIsEditing(false);
  };

  const userData = {
    firstName: formData.firstName || 'N/A',
    lastName: formData.lastName || 'N/A',
    email: formData.email || 'N/A',
    phone: formData.phone || 'Not available',
    address: formData.address || 'Not available',
    companyName: formData.companyName || 'N/A',
    role: userRole || 'Client',
    joinDate: customerData?.join_date || new Date().toISOString().split('T')[0]
  };

  if (loading) {
    return (
      <Box flex={1} p={6} bg="#f8f9fa" height="calc(100vh - 76px)" overflowY="auto">
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            <Skeleton height="40px" width="300px" />
            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <Skeleton height="120px" width="120px" borderRadius="full" />
                  <SimpleGrid columns={2} gap={4} width="100%">
                    <Skeleton height="60px" />
                    <Skeleton height="60px" />
                    <Skeleton height="60px" />
                    <Skeleton height="60px" />
                    <Skeleton height="60px" />
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      flex={1} 
      p={6} 
      bg="#f8f9fa"
      minHeight="calc(100vh - 76px)"
      overflowY="auto"
    >
      <Container maxW="6xl">
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
          <Box>
            <Heading
              color="#1a3a52"
              fontSize="4xl"
              fontWeight="bold"
              letterSpacing="-0.5px"
              mb={2}
            >
              Profile Settings
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Manage your personal information and account settings
            </Text>
          </Box>

          <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={8}>
            {/* Left Column - Profile Overview */}
            <VStack spacing={6} align="stretch">
              {/* Profile Card */}
              <Card 
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="2xl"
                boxShadow="lg"
              >
                <CardBody p={6}>
                  <VStack spacing={4} align="center">
                    <Box position="relative">
                      <Avatar
                        size="2xl"
                        src={profilePicture}
                        name={`${userData.firstName} ${userData.lastName}`}
                        bg={accentColor}
                        color="white"
                        fontSize="2xl"
                        fontWeight="bold"
                      />
                      <Tooltip label="Change profile picture">
                        <IconButton
                          aria-label="Change profile picture"
                          icon={<FaCamera />}
                          size="sm"
                          colorScheme="blue"
                          borderRadius="full"
                          position="absolute"
                          bottom={2}
                          right={2}
                          onClick={handleEditProfilePicture}
                          _hover={{
                            transform: 'scale(1.1)',
                            boxShadow: 'lg'
                          }}
                          transition="all 0.2s"
                        />
                      </Tooltip>
                    </Box>

                    <VStack spacing={3} textAlign="center">
                      <Heading size="lg" color="gray.800">
                        {userData.firstName} {userData.lastName}
                      </Heading>
                      <Badge 
                        colorScheme={
                          userData.role === 'Admin' ? 'red' : 
                          userData.role === 'Internal' ? 'purple' : 'blue'
                        }
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {userData.role}
                      </Badge>
                      <Text color="gray.600" fontSize="sm">
                        Member since {new Date(userData.joinDate).toLocaleDateString()}
                      </Text>
                    </VStack>

                    <Divider />

                    <VStack spacing={2} align="stretch" width="100%">
                      {userRole === 'Client' && (
                        <HStack spacing={3}>
                          <FiBriefcase color="gray.500"  />
                          <Text fontSize="sm" color="gray.600">{userData.companyName}</Text>
                        </HStack>
                      )}
                      <HStack spacing={3}>
                        <EmailIcon color="gray.500" />
                        <Text fontSize="sm" color="gray.600">{userData.email}</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <PhoneIcon color="gray.500" />
                        <Text fontSize="sm" color="gray.600">{userData.phone}</Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Quick Stats Card */}
              <Card 
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="2xl"
                boxShadow="lg"
              >
                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color="gray.800">Account Overview</Heading>
                    <VStack spacing={3} align="stretch">
                      {userRole === 'Client' && (
                        <HStack justify="space-between">
                          <Text color="gray.600">Company</Text>
                          <Text fontWeight="medium">{userData.companyName}</Text>
                        </HStack>
                      )}
                      <HStack justify="space-between">
                        <Text color="gray.600">Status</Text>
                        <Badge colorScheme="green" borderRadius="full">Active</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Role</Text>
                        <Text fontWeight="medium">{userData.role}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Member since</Text>
                        <Text fontWeight="medium">
                          {new Date(userData.joinDate).toLocaleDateString()}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>

            {/* Right Column - Profile Details */}
            <VStack spacing={6} align="stretch">
              {/* Personal Information Card */}
              <Card 
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="2xl"
                boxShadow="lg"
              >
                <CardBody p={6}>
                  <VStack spacing={6} align="stretch">
                    <Flex justify="space-between" align="center">
                      <Heading size="md" color="gray.800">
                        Personal Information
                      </Heading>
                      <Button
                        leftIcon={<EditIcon />}
                        borderRadius={"full"}
                        colorScheme={isEditing ? "gray" : "blue"}
                        variant={isEditing ? "outline" : "outline"}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                      </Button>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                      <FormControl>
                        <FormLabel fontWeight="semibold" color="gray.700" display="flex" alignItems="center" gap={2}>
                          <MdPerson color="#4A5568" />
                          First Name
                        </FormLabel>
                        <Input
                          value={userData.firstName}
                          bg={isEditing ? "white" : subtleBg}
                          borderColor={borderColor}
                          size="md"
                          readOnly={!isEditing}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          _readOnly={{
                            bg: subtleBg,
                            cursor: 'not-allowed'
                          }}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="semibold" color="gray.700" display="flex" alignItems="center" gap={2}>
                          <MdPerson color="#4A5568" />
                          Last Name
                        </FormLabel>
                        <Input
                          value={userData.lastName}
                          bg={isEditing ? "white" : subtleBg}
                          borderColor={borderColor}
                          size="md"
                          readOnly={!isEditing}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          _readOnly={{
                            bg: subtleBg,
                            cursor: 'not-allowed'
                          }}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="semibold" color="gray.700" display="flex" alignItems="center" gap={2}>
                          <EmailIcon color="#4A5568" />
                          Email Address
                        </FormLabel>
                        <InputGroup>
                          <Input
                            type="email"
                            value={userData.email}
                            bg={subtleBg}
                            borderColor={borderColor}
                            size="md"
                            readOnly
                            _readOnly={{
                              bg: subtleBg,
                              cursor: 'not-allowed'
                            }}
                          />
                          <InputRightElement>
                            <LockIcon color="gray.400" />
                          </InputRightElement>
                        </InputGroup>
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          Contact support to change your email
                        </Text>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="semibold" color="gray.700" display="flex" alignItems="center" gap={2}>
                          <PhoneIcon color="#4A5568" />
                          Phone Number
                        </FormLabel>
                        <Input
                          value={userData.phone}
                          bg={isEditing ? "white" : subtleBg}
                          borderColor={borderColor}
                          size="md"
                          readOnly={!isEditing}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          _readOnly={{
                            bg: subtleBg,
                            cursor: 'not-allowed'
                          }}
                        />
                      </FormControl>
                    </SimpleGrid>

                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700" display="flex" alignItems="center" gap={2}>
                        <FaMapMarkerAlt color="#4A5568" />
                        Address
                      </FormLabel>
                      <Input
                        value={userData.address}
                        bg={isEditing ? "white" : subtleBg}
                        borderColor={borderColor}
                        size="md"
                        readOnly={!isEditing}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        _readOnly={{
                          bg: subtleBg,
                          cursor: 'not-allowed'
                        }}
                      />
                    </FormControl>

                    {userRole === 'Client' && (
                      <FormControl>
                        <FormLabel fontWeight="semibold" color="gray.700" display="flex" alignItems="center" gap={2}>
                          <FiBriefcase color="#4A5568" />
                          Company Name
                        </FormLabel>
                        <Input
                          value={userData.companyName}
                          bg={subtleBg}
                          borderColor={borderColor}
                          size="md"
                          readOnly
                          _readOnly={{
                            bg: subtleBg,
                            cursor: 'not-allowed'
                          }}
                        />
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          Company information is managed separately
                        </Text>
                      </FormControl>
                    )}

                    {isEditing && (
                      <HStack spacing={3} justify="flex-end" pt={4}>
                        <Button
                          size={"sm"}
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button
                          size={"sm"}
                          colorScheme="blue"
                          onClick={handleSaveChanges}
                        >
                          Save Changes
                        </Button>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Security & Preferences Card */}
              {/* <Card 
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="2xl"
                boxShadow="lg"
              >
                <CardBody p={6}>
                  <VStack spacing={6} align="stretch">
                    <Heading size="md" color="gray.800">
                      Security & Preferences
                    </Heading>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                      <Button
                        leftIcon={<MdSecurity />}
                        variant="outline"
                        justifyContent="flex-start"
                        height="auto"
                        py={4}
                        textAlign="left"
                      >
                        <Box>
                          <Text fontWeight="semibold">Change Password</Text>
                          <Text fontSize="sm" color="gray.600">Update your account password</Text>
                        </Box>
                      </Button>

                      <Button
                        leftIcon={<FaShieldAlt />}
                        variant="outline"
                        justifyContent="flex-start"
                        height="auto"
                        py={4}
                        textAlign="left"
                      >
                        <Box>
                          <Text fontWeight="semibold">Two-Factor Auth</Text>
                          <Text fontSize="sm" color="gray.600">Enable 2FA for extra security</Text>
                        </Box>
                      </Button>

                      <Button
                        leftIcon={<FaWallet />}
                        variant="outline"
                        justifyContent="flex-start"
                        height="auto"
                        py={4}
                        textAlign="left"
                      >
                        <Box>
                          <Text fontWeight="semibold">Payment Methods</Text>
                          <Text fontSize="sm" color="gray.600">Manage your payment options</Text>
                        </Box>
                      </Button>

                      <Button
                        leftIcon={<FaUser />}
                        variant="outline"
                        justifyContent="flex-start"
                        height="auto"
                        py={4}
                        textAlign="left"
                      >
                        <Box>
                          <Text fontWeight="semibold">Privacy Settings</Text>
                          <Text fontSize="sm" color="gray.600">Control your privacy options</Text>
                        </Box>
                      </Button>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card> */}
            </VStack>
          </Grid>
        </VStack>

        {/* Hidden file input */}
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleProfilePictureChange}
          accept="image/*"
          display="none"
        />
      </Container>
    </Box>
  );
}

export default Profile;