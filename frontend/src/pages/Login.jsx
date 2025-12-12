import React, { useState } from "react";
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
  HStack,
  useDisclosure,
  Tooltip,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";
import ForgotPasswordModal from "../Modals/ForgotPasswordModal";
import { FaUser } from "react-icons/fa";
import { FiMail } from "react-icons/fi";

const Login = ({
  onLogin = () => ({ success: false }),
  clientCredentials,
  internalCredentials,
}) => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showPassword, setShowPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = async () => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      const result = await onLogin({
        email: formData.email,
        password: formData.password,
      });

      if (result?.success) {
        navigate("/dashboard", { replace: true });
        return;
      }

      setErrorMessage(result?.message || "Unable to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    onOpen();
  };

  const handleFillClientCredentials = () => {
    if (!clientCredentials) {
      return;
    }
    setFormData({
      email: clientCredentials.email || "",
      password: clientCredentials.password || "",
    });
    setShowPassword(true);
    setErrorMessage("");
  };

  const handleFillInternalCredentials = () => {
    if (!internalCredentials) {
      return;
    }
    setFormData({
      email: internalCredentials.email || "",
      password: internalCredentials.password || "",
    });
    setShowPassword(true);
    setErrorMessage("");
  };

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={8}
      px={{ base: 4, md: 0 }}
    >
      <Box w={{ base: "100%", md: "50%" }} maxW="lg">
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
                transition="all 0.4s ease" // smooth animation
                _hover={{
                  transform: "scale(1.1)", // zoom effect
                }}
              />
            </Box>
          </VStack>

          {/* Login Form */}
          <Box
            bg={cardBg}
            p={{base:4,md:8}}
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
                  color="gray.600"
                  mb={2}
                >
                  User Email
                </FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  size="md"
                  bg="gray.100"
                  color={"gray.600"}
                  // borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{
                    borderColor: "gray.500",
                    boxShadow: "0 0 0 1px gray.500",
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
                    type={showPassword ? "password" : "text"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Enter your Password"
                    size="md"
                    bg="gray.100"
                  color={"gray.600"}

                    // borderColor="gray.300"
                    _hover={{ borderColor: "gray.400" }}
                    _focus={{
                      borderColor: "gray.400",
                      boxShadow: "0 0 0 1px gray.400",
                    }}
                  />
                  <InputRightElement height="100%">
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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
                mt={4}
                isLoading={isLoading}
                rightIcon={<HiArrowRight size={20}/>}
                colorScheme="blue"
                size="md"
                borderRadius={"15px"}
                fontSize="lg"
                fontWeight="semibold"
                onClick={handleLogin}
                isDisabled={isLoading}
                _hover={{
                  scale: 0.95,
                  transform: "rotateY(-15deg)",
                  borderRadius:"20px",
                  boxShadow: "lg",
                }}
                transition="all 0.4s"
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
                _hover={{ textDecoration: "none", color: "blue.700",transform: "scale(1.05)", transition:"all 0.2s" }}
              >
                Forgot password?
              </Button>

              <HStack justify={"center"} spacing={10}>
                <Tooltip
                  label= "Client"
                  placement="left"
                  bg={"blue.50"}
                  fontStyle={"italic"}
                  color={"black"}
                  >
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="ghost"
                  onClick={handleFillClientCredentials}
                >
                  <FaUser/>
                </Button>
                </Tooltip>
                <Tooltip
                  label="Internal"
                  placement="right"
                  bg={"green.50"}
                  color={"black"}
                  fontStyle={"italic"}
                >
                <Button
                  size="sm"
                  colorScheme="green"
                  variant="ghost"
                  onClick={handleFillInternalCredentials}
                >
                  <FaUser/>
                </Button>
                </Tooltip>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      <ForgotPasswordModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default Login;
