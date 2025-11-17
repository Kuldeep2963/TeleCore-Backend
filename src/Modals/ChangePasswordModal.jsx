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
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
  Box,
  HStack
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../services/api';

function ChangePasswordModal({ isOpen, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const validateForm = () => {
    const newErrors = {};

    if (!oldPassword.trim()) {
      newErrors.oldPassword = 'Old password is required';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (oldPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from old password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.changePassword({
        oldPassword,
        newPassword
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Password changed successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Reset form and close modal
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
        onClose();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to change password. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    onClose();
  };

  const PasswordInput = ({ label, value, onChange, show, onToggleShow, error, placeholder }) => (
    <FormControl isInvalid={!!error}>
      <FormLabel fontWeight="semibold" color="gray.700" fontSize="sm">
        {label}
      </FormLabel>
      <InputGroup>
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          bg="white"
          borderColor={error ? 'red.500' : 'gray.300'}
          _focus={{
            borderColor: error ? 'red.500' : 'blue.500',
            boxShadow: error ? '0 0 0 1px red.500' : '0 0 0 1px blue.500'
          }}
          size="md"
        />
        <InputRightElement>
          <IconButton
            icon={show ? <FaEye /> : <FaEyeSlash />}
            size="sm"
            variant="ghost"
            onClick={onToggleShow}
            tabIndex={-1}
            aria-label={show ? 'Show password' : 'Hide password'}
          />
        </InputRightElement>
      </InputGroup>
      {error && (
        <Text fontSize="xs" color="red.500" mt={1}>
          {error}
        </Text>
      )}
    </FormControl>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="12px" boxShadow="0 8px 32px rgba(0, 0, 0, 0.15)">
        <ModalHeader
          bgGradient="linear(to-r, blue.400, blue.500)"
          color="white"
          borderTopRadius="12px"
          fontSize="lg"
          fontWeight="bold"
        >
          Change Password
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody pt={6} pb={4}>
          <VStack spacing={4} align="stretch">
            {/* Info Alert */}
            <Alert
              status="info"
              borderRadius="8px"
              variant="subtle"
              fontSize="sm"
            >
              <AlertIcon />
              <Box>
                <Text fontWeight="medium">Password Requirements:</Text>
                <Text fontSize="xs" mt={1}>
                  • Minimum 8 characters
                  • Must be different from your old password
                </Text>
              </Box>
            </Alert>

            {/* Old Password */}
            <PasswordInput
              label="Old Password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                if (errors.oldPassword) setErrors({ ...errors, oldPassword: '' });
              }}
              show={showOldPassword}
              onToggleShow={() => setShowOldPassword(!showOldPassword)}
              error={errors.oldPassword}
              placeholder="Enter your current password"
            />

            {/* New Password */}
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
              }}
              show={showNewPassword}
              onToggleShow={() => setShowNewPassword(!showNewPassword)}
              error={errors.newPassword}
              placeholder="Enter your new password"
            />

            {/* Confirm Password */}
            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              show={showConfirmPassword}
              onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              error={errors.confirmPassword}
              placeholder="Confirm your new password"
            />

            {/* Password Strength Indicator */}
            {newPassword && (
              <Box
                p={3}
                bg="gray.50"
                borderRadius="8px"
                border="1px solid"
                borderColor="gray.200"
              >
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="xs" fontWeight="semibold" color="gray.600">
                    Password Strength
                  </Text>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color={
                      newPassword.length >= 12
                        ? 'green.600'
                        : newPassword.length >= 8
                        ? 'orange.600'
                        : 'red.600'
                    }
                  >
                    {newPassword.length >= 12
                      ? 'Strong'
                      : newPassword.length >= 8
                      ? 'Medium'
                      : 'Weak'}
                  </Text>
                </HStack>
                <Box height="4px" bg="gray.200" borderRadius="full" overflow="hidden">
                  <Box
                    height="100%"
                    width={
                      newPassword.length >= 12
                        ? '100%'
                        : newPassword.length >= 8
                        ? '60%'
                        : '30%'
                    }
                    bg={
                      newPassword.length >= 12
                        ? 'green.500'
                        : newPassword.length >= 8
                        ? 'orange.500'
                        : 'red.500'
                    }
                    transition="width 0.3s ease"
                  />
                </Box>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter gap={3} pb={4} pt={2}>
          <Button
            variant="outline"
            colorScheme="gray"
            onClick={handleClose}
            isDisabled={loading}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleChangePassword}
            isLoading={loading}
            loadingText="Updating..."
          >
            Change Password
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ChangePasswordModal;