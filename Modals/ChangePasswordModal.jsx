import React, { useState, memo } from 'react';
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

// PasswordInput component defined outside to prevent recreation on each render
const PasswordInput = memo(({ label, value, onChange, show, onToggleShow, error, placeholder, name }) => (
  <FormControl isInvalid={!!error}>
    <FormLabel fontWeight="semibold" color="gray.700" fontSize="sm">
      {label}
    </FormLabel>
    <InputGroup>
      <Input
        key={name}
        name={name}
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
));

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
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size={{base:"sm",md:"md"}} autoFocus={false} blockScrollOnMount={false}>
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
              Enter your current password and choose a new one.
            </Alert>

            {/* Old Password */}
            <PasswordInput
              name="oldPassword"
              label="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              show={showOldPassword}
              onToggleShow={() => setShowOldPassword(!showOldPassword)}
              error={errors.oldPassword}
              placeholder="Enter your current password"
            />

            {/* New Password */}
            <PasswordInput
              name="newPassword"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              show={showNewPassword}
              onToggleShow={() => setShowNewPassword(!showNewPassword)}
              error={errors.newPassword}
              placeholder="Enter your new password"
            />

            {/* Confirm Password */}
            <PasswordInput
              name="confirmPassword"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              show={showConfirmPassword}
              onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              error={errors.confirmPassword}
              placeholder="Confirm your new password"
            />
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