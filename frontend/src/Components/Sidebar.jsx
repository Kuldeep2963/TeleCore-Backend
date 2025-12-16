import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  VStack, 
  Text,
  HStack,
  Icon,
  useColorModeValue,
  Collapse
} from '@chakra-ui/react';
import { 
  FiHome, 
  FiShoppingCart, 
  FiPhone, 
  FiPackage, 
  FiInfo,
  FiChevronRight,
  FiChevronDown,
  FiPlus,
  FiStar,
  FiRefreshCw,
  FiCreditCard,
  FiUsers
} from 'react-icons/fi';


// NavItem component with active state
const NavItem = ({ to, children, icon, onClick, isActive, hasSubItems, isExpanded, onToggle, onItemClick }) => {
  const activeBg = useColorModeValue("blue.50", "blue.900");
  const activeColor = useColorModeValue("blue.700", "blue.200");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  
  return (
    <Box
      as={hasSubItems ? 'div' : Link}
      to={to}
      pl={4}
      py={3}
      pr={1}
      borderRadius="xl"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      bg={isActive ? activeBg : "transparent"}
      color={isActive ? activeColor : "inherit"}
      fontWeight={"semibold"}
      borderLeft={isActive ? "4px solid" : "4px solid transparent"}
      borderLeftColor={isActive ? "blue.500" : "transparent"}
      _hover={{ 
        bg: isActive ? activeBg : hoverBg, 
        textDecoration: "none"
      }}
      transition="all 0.2s ease"
      onClick={() => {
        onClick?.();
        if (!hasSubItems) {
          onItemClick?.();
        }
      }}
      cursor="pointer"
    >
      <HStack spacing={3}>
        <Icon 
          as={icon} 
          boxSize={5} 
          opacity={isActive ? 1 : 0.7}
        />
        <Text fontSize="md" fontWeight={isActive ? "semibold" : "normal"}>
          {children}
        </Text>
      </HStack>
      <HStack spacing={1}>
        {hasSubItems && (
          <Icon 
            as={isExpanded ? FiChevronDown : FiChevronRight} 
            boxSize={4}
            opacity={0.7}
          />
        )}
        {!hasSubItems && isActive && <FiChevronRight size={14} />}
      </HStack>
    </Box>
  );
};

// SubNavItem component for nested items
const SubNavItem = ({ to, children, icon, isActive, onClick, onItemClick }) => {
  const activeBg = useColorModeValue("blue.50", "blue.900");
  const activeColor = useColorModeValue("blue.700", "blue.200");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  
  return (
    <Box
      gap={8}
      as={Link}
      to={to}
      pl={4}
      pr={4}
      py={2}
      borderRadius="xl"
      display="flex"
      alignItems="center"
      bg={isActive ? activeBg : "transparent"}
      color={isActive ? activeColor : "inherit"}
      borderLeft={isActive ? "4px solid" : "4px solid transparent"}
      borderLeftColor={isActive ? "blue.500" : "transparent"}
      _hover={{ 
        bg: isActive ? activeBg : hoverBg, 
        textDecoration: "none"
      }}
      transition="all 0.2s ease"
      onClick={() => {
        onClick?.();
        onItemClick?.();
      }}
    >
      <HStack spacing={5}>
        <Icon 
          as={icon} 
          boxSize={4} 
          opacity={isActive ? 1 : 0.6}
        />
        <Text fontSize="sm" fontWeight={isActive ? "medium" : "normal"}>
          {children}
        </Text>
      </HStack>
    </Box>
  );
};

function Sidebar({ userRole = 'Client', isSidebarOpen = true, onItemClick = () => {} }) {
  const location = useLocation();
  const sidebarBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const [expandedItems, setExpandedItems] = useState({
    orderNumbers: location.pathname.startsWith('/order-numbers')
  });

  const getMenuItems = () => {
    const commonItems = [
      { label: 'Dashboard', path: '/', icon: FiHome },
    ];

    const clientItems = [
      {
        label: 'Order Numbers',
        path: '/order-numbers',
        icon: FiShoppingCart,
        hasSubItems: true,
        subItems: [
          { label: 'New Number', path: '/order-numbers/new', icon: FiPlus },
          // { label: 'Vanity Number', path: '/order-numbers/vanity', icon: FiStar },
          // { label: 'Port Number', path: '/order-numbers/port', icon: FiRefreshCw }
        ]
      },
      { label: 'My Numbers', path: '/my-numbers', icon: FiPhone },
      { label: 'My Orders', path: '/my-orders', icon: FiPackage },
      { label: 'Products Info', path: '/product-info', icon: FiInfo },
      { label: 'Billing & Invoices', path: '/billing-invoices', icon: FiCreditCard}
    ];

    const internalItems = [
      { label: 'Vendors', path: '/vendors', icon: FiUsers },
      { label: 'Customers', path: '/customers', icon: FiUsers },
      { label: 'Orders', path: '/orders', icon: FiPackage },
      { label: 'Invoices', path: '/invoices', icon: FiCreditCard },
      { label: 'Disconnection Requests', path: '/disconnection-requests', icon: FiRefreshCw },
      { label: 'Vendor/Customer', path: '/add-vendor-customer', icon: FiPlus }
    ];

    return userRole === 'Internal'
      ? [...commonItems, ...internalItems]
      : [...commonItems, ...clientItems];
  };

  const menuItems = getMenuItems();

  const handleToggle = (itemLabel) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemLabel]: !prev[itemLabel]
    }));
  };

  const isItemActive = (item) => {
    if (item.hasSubItems) {
      return item.subItems.some(subItem => 
        location.pathname === subItem.path || 
        (subItem.path === '/order-numbers' && location.pathname.startsWith('/order-numbers'))
      );
    }
    return location.pathname === item.path || 
           (item.path === '/' && location.pathname === '/dashboard');
  };

  const isSubItemActive = (subItem) => {
    return location.pathname === subItem.path;
  };

  return (
    <Box
      w="210px"
      bg={sidebarBg}
      p={6}
      pl={1}
      pr={2}
      boxShadow="sm"
      borderRight="1px solid"
      borderColor={borderColor}
      position="fixed"
      left={0}
      top="60px"
      height="calc(100vh - 60px)"
      overflowY="auto"
      display={{ base: isSidebarOpen ? 'block' : 'none', md: 'block' }}
      zIndex={{ base: 999, md: 'auto' }}
      transition="all 0.3s ease"
    >
      <VStack spacing={4} align="stretch">
        {menuItems.map(item => {
          const isActive = isItemActive(item);
          const isExpanded = expandedItems[item.label] || isActive;
          
          return (
            <Box key={item.path}>
              <NavItem
                to={item.path}
                icon={item.icon}
                isActive={isActive}
                hasSubItems={item.hasSubItems}
                isExpanded={isExpanded}
                onToggle={() => item.hasSubItems && handleToggle(item.label)}
                onClick={() => item.hasSubItems && handleToggle(item.label)}
                onItemClick={onItemClick}
              >
                {item.label}
              </NavItem>
              
              {item.hasSubItems && (
                <Collapse in={isExpanded} animateOpacity>
                  <VStack spacing={1} align="stretch" mt={1} ml={2}>
                    {item.subItems.map(subItem => (
                      <SubNavItem
                        key={subItem.path}
                        to={subItem.path}
                        icon={subItem.icon}
                        isActive={isSubItemActive(subItem)}
                        onItemClick={onItemClick}
                      >
                        {subItem.label}
                      </SubNavItem>
                    ))}
                  </VStack>
                </Collapse>
              )}
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
}

export default Sidebar;