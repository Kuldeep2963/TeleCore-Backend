import React, { useState } from 'react';
import {
  Box, 
  Flex, 
  Text, 
  Avatar, 
  HStack, 
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  VStack,
  Badge,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react';
import { FaFileExcel, FaShoppingCart, FaUser, FaCog, FaKey, FaSignOutAlt, FaWallet } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from '../Modals/ChangePasswordModal';

function Navbar({ cartCount = 0, walletBalance = 0, profilePicture = null, onLogout = () => {}, userRole = 'Client', userProfile = {} }) {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleCartClick = () => {
    navigate('/order-numbers/place-order');
  };

  const handleProfileClick = () => {
    navigate('/my-profile');
  };

  const handleChangePasswordClick = () => {
    onOpen();
  };

  const handleLogoutClick = () => {
    onLogout();
  };

  const handleRatesClick = () => {
    navigate('/rates');
  };

  const handleWalletClick = () => {
    navigate('/billing-invoices?tab=topup');
  };

  return (
    <Box
      bgGradient="linear(to-r,whiteAlpha.200,gray.100, gray.200,gray.300)"
      backdropFilter="blur(20px)"
      borderBottom="1px solid"
      borderColor="rgba(148, 163, 184, 0.1)"
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)"
      px={4}
      py={1}
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      height="60px"
      sx={{
        WebkitBackdropFilter: "blur(20px)", // Safari support
      }}
    >
      <Flex justify="space-between" align="center" height="100%">
        {/* Logo */}
        <Image 
          src="/TeleCore.png" 
          alt="TeleCore Logo" 
          width="160px"
          height="100px"
          objectFit="contain"
        />
        
        {/* Right Section - All items in a single row */}
        <HStack spacing={4}>
          {/* Excel Icon */}
            <IconButton
              icon={<FaFileExcel />}
              variant="ghost"
              color="#1a3a52"
              _hover={{ 
                bg: 'rgba(26, 58, 82, 0.1)',
                transform: 'scale(1.1)',
                borderRadius:'full'
        
              }}
              size="lg"
              transition="all 0.2s ease"
              onClick={handleRatesClick}
            />
          
          {/* Cart and Wallet - Only for Clients */}
          {userRole === 'Client' && (
            <>
              {/* Cart Icon */}
              <Box position="relative" display="inline-block">
                <IconButton
                  icon={<FaShoppingCart />}
                  variant="ghost"
                  color="#1a3a52"
                  _hover={{
                    bg: 'rgba(26, 58, 82, 0.1)',
                      borderRadius:'full',
                    transform: 'scale(1.1)'
                  }}
                  size="lg"
                  transition="all 0.2s ease"
                  onClick={handleCartClick}
                />
                {cartCount > 0 && (
                  <Badge
                    position="absolute"
                    top="-3px"
                    right="-2px"
                    borderRadius="full"
                    bg="red.500"
                    color="white"
                    fontSize="11px"
                    fontWeight="bold"
                    minW="20px"
                    h="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Box>

              {/* Wallet Balance */}
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                px={3}
                py={2}
                borderRadius="full"
                bg="rgba(26, 58, 82, 0.1)"
                cursor="pointer"
                onClick={handleWalletClick}
              >
                <FaWallet color="#1a3a52" size={16} />
                <Text fontWeight="bold" fontSize="18px" color="green.500">
                  ${walletBalance}
                </Text>
              </Box>
            </>
          )}
          
          {/* Profile with Chakra Menu */}
          <Menu>
              <MenuButton 
                as={IconButton}
                icon={
                  <HStack spacing={2}>
                    <Avatar
                      size="sm"
                      src={profilePicture}
                      name={`${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'User'}
                      bg={profilePicture ? "transparent" : "linear(135deg, #667eea 0%, #764ba2 100%)"}
                      bgGradient={profilePicture ? "none" : "linear(135deg, #667eea 0%, #764ba2 100%)"}
                      color="white"
                      fontWeight="600"
                      width="30px"
                      height="30px"
                      fontSize="10px"
                    />
                    <Text fontWeight="500" fontSize="14px" color="#1a3a52">
                      {`${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'User'}
                    </Text>
                  </HStack>
                }
                variant="ghost"
                color="#1a3a52"
                _hover={{ 
                  bg: 'rgba(26, 58, 82, 0.1)',
                  borderRadius:'full'
                }}
                size="md"
                transition="all 0.2s ease"
                px={3}
              />

            <MenuList 
              minW="200px" 
              borderRadius="8px" 
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.15)"
              border="1px solid"
              borderColor="gray.200"
              py={0}
            >
              {/* Profile Section */}
              <VStack 
                spacing={1} 
                px={3} 
                py={3} 
                borderBottom="1px solid" 
                borderColor="gray.100"
                align="stretch"
              >
                <Text fontWeight="600" fontSize="14px" color="#1a3a52">
                  {`${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'User'}
                </Text>
                <Text fontSize="12px" color="gray.600">
                  {userProfile.email || ''}
                </Text>
              </VStack>

              {/* Menu Items */}
              <MenuItem
                icon={<FaUser size={14} />}
                _hover={{ bg: 'blue.50', color: 'blue.600' }}
                py={2}
                px={3}
                onClick={handleProfileClick}
              >
                <Text fontSize="14px">Profile</Text>
              </MenuItem>
              
              <MenuItem
                icon={<FaKey size={14} />}
                _hover={{ bg: 'blue.50', color: 'blue.600' }}
                py={2}
                px={3}
                onClick={handleChangePasswordClick}
              >
                <Text fontSize="14px">Change Password</Text>
              </MenuItem>
              
              <MenuDivider />

              <MenuItem
                icon={<FaSignOutAlt size={14} />}
                _hover={{ bg: 'red.50', color: 'red.600' }}
                py={2}
                px={3}
                onClick={handleLogoutClick}
              >
                <Text fontSize="14px">Logout</Text>
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Change Password Modal */}
      <ChangePasswordModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}

export default Navbar;