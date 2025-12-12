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
  Box,
  HStack,
  PinInput,
  PinInputField,
  Spinner,
  Progress
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../services/api';

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

function ForgotPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const toast = useToast();

  const handleRequestOTP = async () => {
    setErrors({});
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.forgotPasswordRequest(email);
      if (response.success) {
        setStep(2);
        setOtpResendTimer(60);
        const timer = setInterval(() => {
          setOtpResendTimer(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        toast({
          title: 'OTP Sent',
          description: 'Please check your email for the OTP',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to send OTP',
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Request OTP error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP. Please try again.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setErrors({});
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.verifyOTP(email, otp);
      if (response.success) {
        setResetToken(response.data.resetToken);
        setStep(3);
        toast({
          title: 'OTP Verified',
          description: 'Please set your new password',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Invalid OTP',
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify OTP. Please try again.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const newErrors = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.resetPasswordWithOTP(resetToken, newPassword);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Password reset successfully! Please login with your new password.',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });

        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to reset password',
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password. Please try again.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResetToken('');
    setErrors({});
    setOtpResendTimer(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size={{ base: 'sm', md: 'md' }} autoFocus={false} blockScrollOnMount={false}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="15px" boxShadow="0 8px 32px rgba(0, 0, 0, 0.15)">
        <ModalHeader
          bgGradient="linear(to-r, blue.400, blue.500)"
          color="white"
          borderTopRadius="12px"
          fontSize="lg"
          fontWeight="bold"
        >
          Reset Password
        </ModalHeader>
        <ModalCloseButton color="white" onClick={handleClose} />

        <ModalBody pt={6} pb={4}>
          <Progress value={step * 33.33} size="sm" colorScheme="blue" mb={4} borderRadius="full" />
          
          <VStack spacing={4} align="stretch">
            {step === 1 && (
              <>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Enter your email address and we'll send you an OTP to reset your password
                </Text>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel fontWeight="semibold" color="gray.700" fontSize="sm">
                    Email Address
                  </FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    placeholder="Enter your email"
                    bg="white"
                    borderColor={errors.email ? 'red.500' : 'gray.300'}
                    _focus={{
                      borderColor: errors.email ? 'red.500' : 'blue.500',
                      boxShadow: errors.email ? '0 0 0 1px red.500' : '0 0 0 1px blue.500'
                    }}
                    size="md"
                  />
                  {errors.email && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      {errors.email}
                    </Text>
                  )}
                </FormControl>
              </>
            )}

            {step === 2 && (
              <>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Enter the 6-digit OTP sent to your email
                </Text>
                <FormControl isInvalid={!!errors.otp}>
                  <FormLabel fontWeight="semibold" color="gray.700" fontSize="sm">
                    One-Time Password
                  </FormLabel>
                  <HStack justify="center" spacing={2}>
                    <PinInput
                      value={otp}
                      onChange={setOtp}
                      size="lg"
                      placeholder="○"
                      isInvalid={!!errors.otp}
                      autoFocus
                    >
                      {Array.from({ length: 6 }).map((_, i) => (
                        <PinInputField key={i} bg="white" borderColor={errors.otp ? 'red.500' : 'gray.300'} />
                      ))}
                    </PinInput>
                  </HStack>
                  {errors.otp && (
                    <Text fontSize="xs" color="red.500" mt={2}>
                      {errors.otp}
                    </Text>
                  )}
                </FormControl>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Didn't receive OTP?{' '}
                  <Button
                    variant="link"
                    fontSize="xs"
                    color="blue.600"
                    onClick={handleRequestOTP}
                    isDisabled={otpResendTimer > 0 || loading}
                    fontWeight="semibold"
                  >
                    {otpResendTimer > 0 ? `Resend in ${otpResendTimer}s` : 'Resend OTP'}
                  </Button>
                </Text>
              </>
            )}

            {step === 3 && (
              <>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Create a new strong password for your account
                </Text>
                <PasswordInput
                  name="newPassword"
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

                <PasswordInput
                  name="confirmPassword"
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
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter gap={3} pb={4} pt={2}>
          <Button
            borderRadius="full"
            size="md"
            variant="outline"
            colorScheme="gray"
            onClick={step === 1 ? handleClose : () => setStep(step - 1)}
            isDisabled={loading}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            colorScheme="blue"
            size="md"
            borderRadius="full"
            onClick={step === 1 ? handleRequestOTP : step === 2 ? handleVerifyOTP : handleResetPassword}
            isLoading={loading}
            loadingText={step === 1 ? 'Sending...' : step === 2 ? 'Verifying...' : 'Resetting...'}
          >
            {step === 1 ? 'Send OTP' : step === 2 ? 'Verify OTP' : 'Reset Password'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ForgotPasswordModal;
