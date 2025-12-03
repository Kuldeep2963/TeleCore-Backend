import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Badge,
  Spacer
} from '@chakra-ui/react';
import {
  FiUsers,
  FiShoppingCart,
  FiTrendingUp,
  FiArrowRight,
  FiRefreshCw
} from 'react-icons/fi';
import GlobalCoverage from './GlobalCoverage';

const DashboardInternal = ({ userId, userRole }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalCustomers: 0,
    totalOrders: 0,
    confirmedOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();

    // Set up auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [userId, userRole]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Calculate stats from individual API calls for accurate data
      const [ordersResponse, vendorsResponse, customersResponse] = await Promise.all([
        api.orders.getAll(),
        api.vendors.getAll(),
        api.customers.getAll()
      ]);

      const totalOrders = ordersResponse.success ? ordersResponse.data.length : 0;
      const confirmedOrders = ordersResponse.success
        ? ordersResponse.data.filter(order => order.orderStatus === 'Confirmed').length
        : 0;
      const totalVendors = vendorsResponse.success ? vendorsResponse.data.length : 0;
      const totalCustomers = customersResponse.success ? customersResponse.data.length : 0;

      // Calculate total revenue from orders
      const totalRevenue = ordersResponse.success
        ? ordersResponse.data.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        : 0;

      setStats({
        totalVendors,
        totalCustomers,
        totalOrders,
        confirmedOrders,
        totalRevenue
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set to 0 on error
      setStats({
        totalVendors: 0,
        totalCustomers: 0,
        totalOrders: 0,
        confirmedOrders: 0,
        totalRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      label: 'Total Vendors',
      value: stats.totalVendors.toString(),
      change: '+5%',
      icon: FiUsers,
      color: 'blue',
      route: '/vendors'
    },
    {
      label: 'Total Customers',
      value: stats.totalCustomers.toString(),
      change: '+12%',
      icon: FiShoppingCart,
      color: 'green',
      route: '/customers'
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: '+8%',
      icon: FiTrendingUp,
      color: 'purple',
      route: '/orders',
      confirmedCount: stats.confirmedOrders.toString(),
    }
  ];

  const handleViewMore = (route) => {
    navigate(route);
  };

  return (
    <Box
      flex={1}
      p={{base:4,md:8}}
      pr={4}
      pb={4}
      minH="calc(100vh - 76px)"
      overflowY="auto"
    >
      <VStack spacing={8} align="start" maxW="full" mx="auto">
        {/* Header Section */}
        <Box w="full">
          <VStack align="start" spacing={5}>
          <HStack justify="space-between" align="center" w="full">
            <Heading
              color="green"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              letterSpacing="-0.5px"
              textAlign="left"
            >
             Welcome Back !
            </Heading>
            <Button
              borderRadius={"full"}
              leftIcon={<FiRefreshCw />}
              variant="outline"
              size="sm"
              colorScheme="blue"
              onClick={fetchStats}
              isLoading={loading}
              loadingText="Refreshing..."
            >
              Refresh
            </Button>
          </HStack>

            {/* Statistics Cards */}
            <SimpleGrid columns={{ base: 2, md: 3}} spacing={{base:3,md:6}} w="full">
              {statsData.map((stat, index) => (
                <Box
                  key={index}
                  bg="white"
                  p={4}
                  h={"100%"}
                  borderRadius="xl"
                  boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                  border="1px solid"
                  borderColor="gray.100"
                  position="relative"
                  overflow="hidden"
                  _hover={{
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  }}
                  transition="all 0.2s ease"
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    w="full"
                    h="3px"
                    bgGradient={`linear(135deg, ${stat.color}.400, ${stat.color}.600)`}
                  />

                  <VStack align="start" spacing={3} flex="1">
                    <HStack justify="space-between" align="start" w="full">
                      <HStack alignText={"flex-start"} spacing={4}>
                         <Box
                           px={2}
                           py={1}
                           borderRadius={"full"}
                           bgGradient={`linear(135deg, ${stat.color}.50, ${stat.color}.100)`}
                           color={`${stat.color}.600`}
                           >
                           <Icon as={stat.icon} boxSize={5}/>
                          </Box>
                       
                          <VStack spacing={0} align={"start"}>
                            <Text fontSize="xl" fontWeight="bold" color="gray.800">
                              {stat.value}
                            </Text>
                            <Text color="gray.500" fontWeight="medium" fontSize="sm">
                              {stat.label}
                            </Text>
                          </VStack>
                      </HStack>
                      <Badge
                        colorScheme={stat.color}
                        fontSize="xs"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        variant="subtle"
                      >
                        {stat.change}
                      </Badge>
                    </HStack>
          <Spacer/>
                  <HStack w={"full"}>
                    <Button
                      size="sm"
                      borderRadius="full"
                      fontWeight="semibold"
                      rightIcon={<FiArrowRight />}
                      bgGradient={`linear(135deg, ${stat.color}.400, ${stat.color}.600)`}
                      color="white"
                      boxShadow={`0 2px 4px rgba(0, 0, 0, 0.1)`}
                      _hover={{
                        boxShadow: `0 4px 8px rgba(0, 0, 0, 0.15)`,
                        bgGradient: `linear(135deg, ${stat.color}.600, ${stat.color}.400)`
                      }}
                      _active={{
                        transform: 'translateY(0)'
                      }}
                      transition="all 0.2s ease"
                      alignSelf="flex-start"
                      onClick={() => handleViewMore(stat.route)}
                    >
                      View More
                    </Button>
                    <Spacer/>
                     {stat.confirmedCount && (
                             <HStack>
                            <Text color={"green"} fontWeight={"bold"} fontSize={"lg"}>{stat.confirmedCount}</Text>
                            <Text color="gray.600" fontSize="sm">confirmed</Text>
                            </HStack>
                     )}
              </HStack>

                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Box>

        <GlobalCoverage />
      </VStack>
    </Box>
  );
};

export default DashboardInternal;