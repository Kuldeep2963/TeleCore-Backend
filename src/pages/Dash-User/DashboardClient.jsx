import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FiCheck
} from 'react-icons/fi';
import { LuHeading6 } from 'react-icons/lu';
import GlobalCoverage from './GlobalCoverage';

function Dashboard() {
  const navigate = useNavigate();



  const stats = [
    { 
      label: 'Active Numbers', 
      value: '24', 
      change: '+12%',
      icon: FiUsers,
      color: 'blue'
    },
    { 
      label: 'Total Orders', 
      value: '156', 
      change: '+8%',
      icon: FiBarChart2,
      color: 'green'
    },
    { 
      label: 'Countries', 
      value: '18', 
      change: '+2',
      icon: FiWorld,
      color: 'purple'
    },
    
  ];

  const services = [
    {
      id: 1,
      title: 'DID',
      name: 'DID',
      description: 'In-country numbers for global coverage.',
      icon: FiPhone,
      gradient: 'linear(135deg, #3182CE 0%, #2C5282 100%)',
      iconColor: 'blue.500'
    },
    {
      id: 2,
      title: 'Freephone',
      name: 'Freephone',
      description: 'Local toll-free numbers for easy customer access.',
      icon: FiPhoneCall,
      gradient: 'linear(135deg, #D69E2E 0%, #B7791F 100%)',
      iconColor: 'orange.500'
    },
    {
      id: 3,
      title: 'Universal Freephone',
      name: 'Universal Freephone',
      description: 'One toll-free number for multiple countries.',
      icon: FiGlobe,
      gradient: 'linear(135deg, #2D3748 0%, #1A202C 100%)',
      iconColor: 'purple.500'
    },
    {
      id: 4,
      title: 'Two Way Voice',
      name: 'Two Way Voice',
      description: 'Seamless, reliable two-way calling.',
      icon: FiPhoneCall,
      gradient: 'linear(135deg, #38A169 0%, #22543D 100%)',
      iconColor: 'green.500'
    },
    {
      id: 5,
      title: 'Two Way SMS',
      name: 'Two Way SMS',
      description: 'Effective two-way sms communication.',
      icon: FiMessageSquare,
      gradient: 'linear(135deg, #ED8936 0%, #C05621 100%)',
      iconColor: 'red.500'
    },
    {
      id: 6,
      title: 'Mobile',
      name: 'Mobile',
      description: 'All-in-one voice and sms numbers.',
      icon: FiSmartphone,
      gradient: 'linear(135deg, #9F7AEA 0%, #6B46C1 100%)',
      iconColor: 'teal.500'
    }
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
          <Heading
            color="gray.800"
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
            letterSpacing="-0.5px"
            textAlign="left"
          >
            Welcome Back!
          </Heading>
          
        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={5} w="full">
          {stats.map((stat, index) => (
            <Box
              key={index}
              bg="white"
              p={8}
              pl={4}
              h={"90px"}
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
                 <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={1}>
                {stat.value}
              </Text>
              <Text color="gray.500" fontWeight="medium" fontSize="sm">
                {stat.label}
              </Text>
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

          <Grid
            templateColumns={{ base: "1fr", md: "repeat(1, 1fr)", lg: "repeat(3, 1fr)" }}
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
        </Box>

        <GlobalCoverage />
      </VStack>
    </Box>
  );
}

export default Dashboard;







