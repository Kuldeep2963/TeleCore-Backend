import React, { useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Badge,
  Text,
  Flex
} from '@chakra-ui/react';
import {
  FiPhone,
  FiPhoneCall,
  FiMessageSquare,
  FiGlobe,
  FiSmartphone
} from 'react-icons/fi';

const GlobalCoverage = () => {
  const [selectedService, setSelectedService] = useState('All');

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

  // Sample data structure showing which services are available in which countries
  const globalCoverage = {
    regions: [
      {
        name: 'Africa',
        countries: [
          { name: 'South Africa', services: ['DID', 'Mobile'] },
          { name: 'Nigeria', services: ['DID', 'Two Way SMS'] },
          { name: 'Egypt', services: ['DID'] }
        ]
      },
      {
        name: 'Asia',
        countries: [
          { name: 'Bahrain', services: ['DID', 'Freephone', 'Two Way Voice'] },
          { name: 'Bangladesh', services: ['DID', 'Two Way SMS', 'Mobile'] },
          { name: 'Brunei', services: ['DID'] },
          { name: 'Cambodia', services: ['DID', 'Mobile'] },
          { name: 'China', services: ['DID', 'Freephone', 'Two Way Voice', 'Two Way SMS'] },
          { name: 'Hong Kong', services: ['DID', 'Freephone', 'Universal Freephone', 'Two Way Voice'] },
          { name: 'India', services: ['DID', 'Freephone', 'Two Way Voice', 'Two Way SMS', 'Mobile'] }
        ]
      },
      {
        name: 'Europe',
        countries: [
          { name: 'Albania', services: ['DID'] },
          { name: 'Austria', services: ['DID', 'Freephone', 'Two Way Voice'] },
          { name: 'Belarus', services: ['DID', 'Mobile'] },
          { name: 'Belgium', services: ['DID', 'Freephone', 'Two Way Voice'] },
          { name: 'Bosnia And Herzegovina', services: ['DID'] },
          { name: 'Bulgaria', services: ['DID', 'Two Way SMS'] }
        ]
      },
      {
        name: 'North America',
        countries: [
          { name: 'Anguilla', services: ['DID'] },
          { name: 'Antigua & Barbuda', services: ['DID', 'Mobile'] },
          { name: 'Bahamas', services: ['DID'] },
          { name: 'Barbados', services: ['DID', 'Two Way Voice'] },
          { name: 'Belize', services: ['DID'] },
          { name: 'Bermuda', services: ['DID', 'Freephone'] }
        ]
      },
      {
        name: 'Oceania',
        countries: [
          { name: 'Australia', services: ['DID', 'Freephone', 'Universal Freephone', 'Two Way Voice', 'Two Way SMS', 'Mobile'] },
          { name: 'New Zealand', services: ['DID', 'Freephone', 'Two Way Voice', 'Mobile'] }
        ]
      },
      {
        name: 'South America',
        countries: [
          { name: 'Argentina', services: ['DID', 'Two Way SMS'] },
          { name: 'Bolivia', services: ['DID'] },
          { name: 'Brazil', services: ['DID', 'Freephone', 'Two Way Voice', 'Mobile'] },
          { name: 'Chile', services: ['DID', 'Two Way SMS'] },
          { name: 'Colombia', services: ['DID', 'Mobile'] },
          { name: 'Curacao', services: ['DID'] },
          { name: 'Ecuador', services: ['DID', 'Two Way Voice'] }
        ]
      }
    ]
  };

  const getFilteredCountries = (region) => {
    return region.countries;
  };

  const getServiceMeta = (serviceName) => {
    return services.find(service => service.name === serviceName);
  };

  const selectedServiceMeta = selectedService === 'All' ? null : getServiceMeta(selectedService);

  return (
    <>
      {/* Global Coverage Section - Non-collapsible and after Available Services */}
      <Heading size="lg" color="gray.800">
        Global Coverage
      </Heading>

      <Box w="full" bg="white" borderRadius="2xl" p={4} pt={2} boxShadow="sm" h={"400px"} overflow={"auto"} border="1px solid" borderColor="gray.200">
        <VStack spacing={6} align="start">
          {/* Service Selector - Horizontal Bar with Icons - Sticky */}
          <Box
            w="full"
            bg={"beige"}
            borderRadius={"full"}
            position="sticky"
            top={0}
            zIndex={2}
          >
            <Flex flexWrap="wrap" justifyContent={"space-between"}>
              <Badge
                key="all"
                colorScheme={selectedService === 'All' ? 'yellow' : ''}
                fontSize="sm"
                px={4}
                py={3}
                borderRadius="full"
                variant={selectedService === 'All' ? 'solid' : 'subtle'}
                cursor="pointer"
                onClick={() => setSelectedService('All')}
                _hover={{ transform: 'translateY(-1px)' }}
                transition="all 0.2s ease"
              >
                <HStack spacing={2}>
                  <Icon as={FiGlobe} boxSize={4} />
                  <Text>All</Text>
                </HStack>
              </Badge>
              {services.map((service, index) => (
                <Badge
                  key={service.name}
                  colorScheme={selectedService === service.name ? 'yellow' : 'beige'}
                  fontSize="sm"
                  px={4}
                  py={3}
                  borderRadius="full"
                  variant={selectedService === service.name ? 'solid' : 'subtle'}
                  cursor="pointer"
                  onClick={() => setSelectedService(service.name)}
                  _hover={{ transform: 'translateY(-1px)' }}
                  transition="all 0.2s ease"
                >
                  <HStack spacing={2}>
                    <Icon
                      as={service.icon}
                      boxSize={4}
                      color={service.iconColor}
                      sx={{ 'path': { strokeWidth: selectedService === service.name ? 2.75 : 2.25 } }}
                    />
                    <Text fontWeight="semibold" color={selectedService === service.name ? service.iconColor : 'gray.700'}>
                      {service.title}
                    </Text>
                  </HStack>
                </Badge>
              ))}
            </Flex>
          </Box>

          {/* Regions Grid with Service Icons - Scrollable content */}
          <SimpleGrid columns={{ base: 1, md: 3, lg: 6 }} spacing={5} w="full">
            {globalCoverage.regions.map((region, index) => {
              const filteredCountries = getFilteredCountries(region);

              return (
                <Box key={index}>
                  {/* Sticky Region Heading */}
                  <Heading
                    fontWeight={"bold"}
                    size="sm"
                    color="red.600"
                    mb={3}
                    position="sticky"
                    // top={"60px"}
                    zIndex={1}
                    bg="blackAlpha.300"
                    borderRadius={"12px"}
                    p={2}
                  >
                    {region.name}
                  </Heading>
                  <VStack align="start" spacing={2}>
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country, countryIndex) => (
                        <HStack key={countryIndex} spacing={3} w="full">
                          <Text color="black" fontSize="sm" flex={1}>
                            {country.name}
                          </Text>
                          <HStack spacing={1}>
                            {selectedService === 'All'
                              ? country.services.map((service, serviceIndex) => {
                                  const serviceMeta = getServiceMeta(service);
                                  const IconComponent = serviceMeta?.icon || FiPhone;
                                  return (
                                    <Icon
                                      key={serviceIndex}
                                      as={IconComponent}
                                      boxSize={4}
                                      color={serviceMeta?.iconColor || 'blue.500'}
                                      title={service}
                                      strokeWidth={3}
                                      _hover={{ transform: 'scale(1.1)' }}
                                      transition="transform 0.2s ease"
                                    />
                                  );
                                })
                              : country.services.includes(selectedService) && selectedServiceMeta
                                ? (
                                    <Icon
                                      as={selectedServiceMeta.icon || FiPhone}
                                      boxSize={4}
                                      color={selectedServiceMeta.iconColor || 'blue.500'}
                                      title={selectedService}
                                      strokeWidth={3}
                                    />
                                  )
                                : null}
                          </HStack>
                        </HStack>
                      ))
                    ) : (
                      <Text color="gray.700" fontSize="sm" fontStyle="italic">
                        No {selectedService === 'All' ? '' : selectedService + ' '}coverage
                      </Text>
                    )}
                  </VStack>
                </Box>
              );
            })}
          </SimpleGrid>
        </VStack>
      </Box>
    </>
  );
};

export default GlobalCoverage;