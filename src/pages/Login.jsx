import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  Divider,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton,
  Image,
  Select,
  HStack
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin = () => ({ success: false }), clientCredentials, internalCredentials }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hintBg = useColorModeValue('gray.50', 'gray.700');
  const hintBorder = useColorModeValue('gray.200', 'gray.500');
  const hintText = useColorModeValue('gray.600', 'gray.100');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async () => {
    setErrorMessage('');
    const result = await onLogin({
      email: formData.email,
      password: formData.password
    });

    if (result?.success) {
      navigate('/dashboard', { replace: true });
      return;
    }

    setErrorMessage(result?.message || 'Unable to login');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  const handleFillClientCredentials = () => {
    if (!clientCredentials) {
      return;
    }
    setFormData({
      email: clientCredentials.email || '',
      password: clientCredentials.password || ''
    });
    setShowPassword(false);
    setErrorMessage('');
  };

  const handleFillInternalCredentials = () => {
    if (!internalCredentials) {
      return;
    }
    setFormData({
      email: internalCredentials.email || '',
      password: internalCredentials.password || ''
    });
    setShowPassword(false);
    setErrorMessage('');
  };

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={8}
    >
      <Box w={{base:"100%", md:"50%"}} maxW="lg">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={2} textAlign="center">
            <Box display="flex" justifyContent="center">
              <Image
                src="/TeleCore.png"
                alt="TeleCore Logo"
                width="250px"
                height="auto"
                objectFit="contain"
              />
            </Box>
          </VStack>

          {/* Login Form */}
          <Box
            bg={cardBg}
            p={8}
            borderRadius="xl"
            boxShadow="lg"
            border="1px solid"
            borderColor={borderColor}
          >
            <VStack spacing={6} align="stretch">
              <Text
              fontSize="2xl"
              fontWeight="semibold"
              color="gray.800"
              align={"center"}
            >
              Login
            </Text>
              {/* User Email */}
              <FormControl isRequired>
                <FormLabel 
                  fontSize="sm" 
                  fontWeight="semibold" 
                  color="gray.700"
                  mb={2}
                >
                  User Email
                </FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  size="lg"
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: 'blue.400' }}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px blue.500'
                  }}
                />
              </FormControl>

              {/* Password */}
              <FormControl isRequired>
                <FormLabel 
                  fontSize="sm" 
                  fontWeight="semibold" 
                  color="gray.700"
                  mb={2}
                >
                  Password
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    size="lg"
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'blue.400' }}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px blue.500'
                    }}
                  />
                  <InputRightElement height="100%">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {errorMessage && (
                <Text color="red.500" fontSize="sm" fontWeight="semibold">
                  {errorMessage}
                </Text>
              )}

              {/* Login Button */}
              <Button
                colorScheme="blue"
                size="md"
                fontSize="lg"
                fontWeight="semibold"
                onClick={handleLogin}
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg'
                }}
                transition="all 0.2s"
              >
                Login
              </Button>

              {/* Forgot Password Link */}
              <Button
                variant="link"
                color="blue.600"
                fontSize="sm"
                fontWeight="medium"
                onClick={handleForgotPassword}
                _hover={{ textDecoration: 'none', color: 'blue.700' }}
              >
                Forgot password?
              </Button>

              
              <HStack spacing={3} justify={"center"}>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={handleFillClientCredentials}
                  >
                    Client Login
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="green"
                    variant="outline"
                    onClick={handleFillInternalCredentials}
                  >
                    Internal Login
                  </Button>
                </HStack>
              
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default Login;




