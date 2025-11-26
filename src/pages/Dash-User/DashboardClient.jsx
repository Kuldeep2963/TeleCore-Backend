import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Box,
  Grid,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Badge,
  Flex
} from '@chakra-ui/react';
import {
  FiPhone,
  FiPhoneCall,
  FiMessageSquare,
  FiGlobe,
  FiSmartphone,
  FiTrendingUp,
  FiArrowRight,
  FiUsers,
  FiGlobe as FiWorld,
  FiBarChart2,
  FiCheck,
  FiRefreshCw
} from 'react-icons/fi';
import { LuHeading6 } from 'react-icons/lu';
import GlobalCoverage from './GlobalCoverage';

function Dashboard({ userId, userRole }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeNumbers: 0,
    totalOrders: 0,
    invoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchProducts();

    // Set up auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [userId, userRole]);

  const fetchProducts = async () => {
    try {
      const productsResponse = await api.products.getAll();
      if (productsResponse.success) {
        // Map products to services format
        const mappedServices = productsResponse.data.map((product, index) => ({
          id: product.id || index + 1,
          title: product.name || product.title,
          name: product.name || product.title,
          description: product.description || 'Service description',
          icon: getServiceIcon(product.name || product.title),
          gradient: getServiceGradient(index),
          iconColor: getServiceIconColor(index)
        }));
        setServices(mappedServices);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to empty array
      setServices([]);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Calculate stats from individual API calls for accurate data
      const [ordersResponse, numbersResponse, invoicesResponse] = await Promise.all([
        api.orders.getAll({ user_id: userId }),
        api.numbers.getAll(),
        api.invoices.getAll()
      ]);

      const totalOrders = ordersResponse.success ? ordersResponse.data.length : 0;
      // Active numbers are those not disconnected (disconnection_status is not 'Completed')
      const activeNumbers = numbersResponse.success
        ? numbersResponse.data.filter(num => num.disconnection_status !== 'Completed').length
        : 0;

      // Calculate invoice counts by status
      let pendingInvoices = 0;
      let overdueInvoices = 0;
      let totalInvoices = 0;

      if (invoicesResponse.success) {
        console.log('All invoices:', invoicesResponse.data.map(inv => ({ id: inv.id, customer_id: inv.customer_id, status: inv.status })));
        console.log('Current userId:', userId);

        const userInvoices = invoicesResponse.data.filter(inv => inv.customer_id == userId);
        totalInvoices = userInvoices.length;

        // Debug: log invoice statuses
        console.log('User invoices:', userInvoices.map(inv => ({ id: inv.id, status: inv.status })));

        pendingInvoices = userInvoices.filter(inv => inv.status?.toLowerCase() === 'pending').length;
        overdueInvoices = userInvoices.filter(inv => inv.status?.toLowerCase() === 'overdue').length;

        console.log('Invoice counts:', { totalInvoices, pendingInvoices, overdueInvoices });
      }

      // Calculate total spent from orders
      const totalSpent = ordersResponse.success
        ? ordersResponse.data.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        : 0;

      setStats({
        activeNumbers,
        totalOrders,
        invoices: totalInvoices,
        pendingInvoices,
        overdueInvoices,
        totalSpent
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set to 0 on error
      setStats({
        activeNumbers: 0,
        totalOrders: 0,
        invoices: 0,
        pendingInvoices: 0,
        overdueInvoices: 0,
        totalSpent: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for service mapping
  const getServiceIcon = (productName) => {
    const iconMap = {
      'DID': FiPhone,
      'Freephone': FiPhoneCall,
      'Universal Freephone': FiGlobe,
      'Two Way Voice': FiPhoneCall,
      'Two Way SMS': FiMessageSquare,
      'Mobile': FiSmartphone
    };
    return iconMap[productName] || FiPhone;
  };

  const getServiceGradient = (index) => {
    const gradients = [
      'linear(135deg, #3182CE 0%, #2C5282 100%)',
      'linear(135deg, #D69E2E 0%, #B7791F 100%)',
      'linear(135deg, #2D3748 0%, #1A202C 100%)',
      'linear(135deg, #38A169 0%, #22543D 100%)',
      'linear(135deg, #ED8936 0%, #C05621 100%)',
      'linear(135deg, #9F7AEA 0%, #6B46C1 100%)'
    ];
    return gradients[index % gradients.length];
  };

  const getServiceIconColor = (index) => {
    const colors = ['blue.500', 'orange.500', 'purple.500', 'green.500', 'red.500', 'teal.500'];
    return colors[index % colors.length];
  };

  const statsData = [
    {
      label: 'Active Numbers',
      value: stats.activeNumbers.toString(),
      // change: '+12%',
      icon: FiUsers,
      color: 'blue'
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toString(),
      // change: '+8%',
      icon: FiBarChart2,
      color: 'green'
    },
    {
      label: 'Pending Invoices',
      value: stats.pendingInvoices.toString(),
      // change: '+5',
      icon: FiBarChart2,
      color: 'orange'
    },
    {
      label: 'Overdue Invoices',
      value: stats.overdueInvoices.toString(),
      // change: '+5',
      icon: FiBarChart2,
      color: 'red'
    },

  ];
  return (
    <Box
      flex={1}
      p={8}
      pr={5}
      pb={5}
      minH="calc(100vh - 76px)"
      overflowY="auto"
    >
      <VStack spacing={8} align="start" maxW="full" mx="auto">
        {/* Header Section */}
        <Box w="full">
          <VStack align="start" spacing={5}>
          <HStack justify="space-between" align="center" w="full">
            <Heading
              color="gray.800"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              letterSpacing="-0.5px"
              textAlign="left"
            >
              Welcome Back!
            </Heading>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              size="sm"
              colorScheme="blue"
              onClick={fetchStats}
              isLoading={loading}
              loadingText="Refreshing..."
            >
              Refresh Stats
            </Button>
          </HStack>
          
        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
          {statsData.map((stat, index) => (
            <Box
              key={index}
              bg="white"
              p={4}
              h={"65px"}
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
              
              <HStack justify="space-between" align="start">
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
                 <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={1}>
                {stat.value}
              </Text>
              <Text color="gray.500" fontWeight="medium" fontSize="sm">
                {stat.label}
              </Text>
              </HStack>
                {/* <Badge 
                  colorScheme={stat.color}
                  fontSize="xs"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  variant="subtle"
                >
                  {stat.change}
                </Badge> */}
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
        </VStack>
        </Box>

        {/* Services Grid */}
        <Box w="full">
          <HStack justify="space-between" align="center" mb={6}>
            <Box>
              <Heading size="lg" color="gray.800">
                Available Services
              </Heading>
            </Box>
            <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
              {services.length} Services
            </Badge>
          </HStack>

          {services.length > 0 ? (
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(6, 1fr)" }}
              gap={6}
            >
              {services.map(service => (
              <Box
                key={service.id}
                bg="white"
                borderRadius="2xl"
                p={3}
                boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                border="1px solid"
                borderColor="white"
                _hover={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  borderColor: 'gray.100'
                }}
                transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                display="flex"
                flexDirection="column"
                height="100%"
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  w="100px"
                  h="100px"
                  bgGradient={service.gradient}
                  opacity="0.03"
                  borderRadius="full"
                  transform="translate(30px, -30px)"
                />
                
                <VStack align="start" spacing={4} flex="1" position="relative" zIndex={1}>
                  <HStack justify="space-between" w="full">
                    <HStack spacing={3}>
                      <Box
                        h={"9"}
                        p={2}
                        borderRadius="full"
                        bgGradient={service.gradient}
                        color="white"
                        boxShadow="0 2px 4px rgba(0, 0, 0, 0.15)"
                      >
                        <Icon as={service.icon} boxSize={5}/>
                      </Box>
                      <Heading
                        size="md"
                        fontWeight="bold"
                        color="gray.800"
                      >
                        {service.title}
                      </Heading>
                    </HStack>
                  </HStack>
                  
                  <Text
                    color="gray.600"
                    lineHeight="1.6"
                    fontSize="md"
                    flex="1"
                  >
                    {service.description}
                  </Text>
                </VStack>
                
                <Box mt={4} position="center" zIndex={1}>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    borderRadius="full"
                    fontWeight="semibold"
                    rightIcon={<FiArrowRight />}
                    bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    boxShadow="0 4px 6px -1px rgba(102, 126, 234, 0.3)"
                    _hover={{
                      boxShadow: '0 10px 15px -3px rgba(102, 126, 234, 0.4)',
                      bgGradient: 'linear(135deg, #764ba2 0%, #667eea 100%)'
                    }}
                    _active={{
                      transform: 'translateY(0)'
                    }}
                    transition="all 0.3s ease"
                    onClick={() => navigate('/order-numbers/new', { state: { productType: service.name } })}
                  >
                    Order Now
                  </Button>
                </Box>
              </Box>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={8}>
              <Text color="gray.500">Loading services...</Text>
            </Box>
          )}
        </Box>

        <GlobalCoverage />
      </VStack>
    </Box>
  );
}

export default Dashboard;