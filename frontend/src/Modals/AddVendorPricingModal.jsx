import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PRICING_FIELDS_BY_PRODUCT, PRICING_FIELD_LABELS } from '../constants/pricingConstants';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Input,
  useToast,
  Spinner,
  SimpleGrid
} from '@chakra-ui/react';
import { FiEdit, FiPlus } from 'react-icons/fi';
import { transform} from 'framer-motion';

const AddVendorPricingModal = ({ isOpen, onClose, vendorId, pricingData = null, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEnabled, setEditEnabled] = useState(false);

  const [formData, setFormData] = useState({
    product_id: '',
    country_id: '',
    area_codes: '',
    nrc: '',
    mrc: '',
    ppm: '',
    ppm_fix: '',
    ppm_mobile: '',
    ppm_payphone: '',
    arc: '',
    mo: '',
    mt: '',
    incoming_ppm: '',
    outgoing_ppm_fix: '',
    outgoing_ppm_mobile: '',
    incoming_sms: '',
    outgoing_sms: '',
    billing_pulse: '60/60',
    estimated_lead_time: '15 Days',
    contract_term: '1 Month',
    disconnection_notice_term: '1 Month',
    status: 'Active'
  });

  useEffect(() => {
    if (isOpen) {
      if (pricingData) {
        setIsEditMode(true);
        setEditEnabled(false);
        populateEditForm(pricingData);
      } else {
        setIsEditMode(false);
        setEditEnabled(true);
        resetForm();
      }
      fetchData();
    }
  }, [isOpen, pricingData]);

  const populateEditForm = (pricing) => {
    const product = products.find(p => p.id === pricing.product_id);
    const country = countries.find(c => c.id === pricing.country_id);
    
    setFormData({
      product_id: pricing.product_id || '',
      country_id: pricing.country_id || '',
      area_codes: Array.isArray(pricing.area_codes) ? pricing.area_codes.join(',') : (pricing.area_codes || ''),
      nrc: pricing.nrc || '',
      mrc: pricing.mrc || '',
      ppm: pricing.ppm || '',
      ppm_fix: pricing.ppm_fix || '',
      ppm_mobile: pricing.ppm_mobile || '',
      ppm_payphone: pricing.ppm_payphone || '',
      arc: pricing.arc || '',
      mo: pricing.mo || '',
      mt: pricing.mt || '',
      incoming_ppm: pricing.incoming_ppm || '',
      outgoing_ppm_fix: pricing.outgoing_ppm_fix || '',
      outgoing_ppm_mobile: pricing.outgoing_ppm_mobile || '',
      incoming_sms: pricing.incoming_sms || '',
      outgoing_sms: pricing.outgoing_sms || '',
      billing_pulse: pricing.billing_pulse || '60/60',
      estimated_lead_time: pricing.estimated_lead_time || '15 Days',
      contract_term: pricing.contract_term || '1 Month',
      disconnection_notice_term: pricing.disconnection_notice_term || '1 Month',
      status: pricing.status || 'Active'
    });
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      country_id: '',
      area_codes: '',
      nrc: '',
      mrc: '',
      ppm: '',
      ppm_fix: '',
      ppm_mobile: '',
      ppm_payphone: '',
      arc: '',
      mo: '',
      mt: '',
      incoming_ppm: '',
      outgoing_ppm_fix: '',
      outgoing_ppm_mobile: '',
      incoming_sms: '',
      outgoing_sms: '',
      billing_pulse: '60/60',
      estimated_lead_time: '15 Days',
      contract_term: '1 Month',
      disconnection_notice_term: '1 Month',
      status: 'Active'
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, countriesRes] = await Promise.all([
        api.products.getAll(),
        api.countries.getAll()
      ]);

      if (productsRes.success) setProducts(productsRes.data || []);
      if (countriesRes.success) setCountries(countriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products and countries',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getProductType = () => {
    if (!formData.product_id || products.length === 0) return null;
    const product = products.find(p => p.id === formData.product_id);
    return product?.code?.toLowerCase();
  };

  const productType = getProductType();
  const relevantFields = productType ? (PRICING_FIELDS_BY_PRODUCT[productType] || PRICING_FIELDS_BY_PRODUCT.did) : [];

  const handleSubmit = async () => {
    if (!formData.product_id || !formData.country_id) {
      toast({
        title: 'Error',
        description: 'Please select both product and country',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);
      const areaCodes = formData.area_codes
        ? formData.area_codes.split(',').map(code => code.trim()).filter(code => code.length > 0)
        : null;

      const payload = {
        vendor_id: vendorId,
        product_id: formData.product_id,
        country_id: formData.country_id,
        area_codes: areaCodes,
        nrc: formData.nrc ? parseFloat(formData.nrc) : null,
        mrc: formData.mrc ? parseFloat(formData.mrc) : null,
        ppm: formData.ppm ? parseFloat(formData.ppm) : null,
        ppm_fix: formData.ppm_fix ? parseFloat(formData.ppm_fix) : null,
        ppm_mobile: formData.ppm_mobile ? parseFloat(formData.ppm_mobile) : null,
        ppm_payphone: formData.ppm_payphone ? parseFloat(formData.ppm_payphone) : null,
        arc: formData.arc ? parseFloat(formData.arc) : null,
        mo: formData.mo ? parseFloat(formData.mo) : null,
        mt: formData.mt ? parseFloat(formData.mt) : null,
        incoming_ppm: formData.incoming_ppm ? parseFloat(formData.incoming_ppm) : null,
        outgoing_ppm_fix: formData.outgoing_ppm_fix ? parseFloat(formData.outgoing_ppm_fix) : null,
        outgoing_ppm_mobile: formData.outgoing_ppm_mobile ? parseFloat(formData.outgoing_ppm_mobile) : null,
        incoming_sms: formData.incoming_sms ? parseFloat(formData.incoming_sms) : null,
        outgoing_sms: formData.outgoing_sms ? parseFloat(formData.outgoing_sms) : null,
        billing_pulse: formData.billing_pulse,
        estimated_lead_time: formData.estimated_lead_time,
        contract_term: formData.contract_term,
        disconnection_notice_term: formData.disconnection_notice_term,
        status: formData.status,
      };

      let response;
      if (isEditMode && pricingData) {
        response = await api.vendorPricing.update(pricingData.id, payload);
      } else {
        response = await api.vendorPricing.create(payload);
      }

      if (response.success) {
        toast({
          title: 'Success',
          description: isEditMode ? 'Vendor pricing updated successfully' : 'Vendor pricing created successfully',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        resetForm();
        setEditEnabled(false);
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error saving pricing:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save vendor pricing',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'sm', md: '2xl' }} scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent  borderRadius="15px" >
        <ModalHeader  borderTopRadius="15px" bgGradient="linear(to-r, blue.400, blue.500)"
 color="white">
          {isEditMode ? 'View Vendor Pricing' : 'Add Vendor Pricing'}
        </ModalHeader>
        <ModalCloseButton color={"white"}/>
        <ModalBody>
          {loading ? (
            <VStack py={8}>
              <Spinner color="blue.500" size="lg" />
            </VStack>
          ) : (
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Product</FormLabel>
                <Select
                  isDisabled={isEditMode && !editEnabled}
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  placeholder="Select product"
                >
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <FormControl isRequired>
                  <FormLabel>Country</FormLabel>
                  <Select
                    isDisabled={isEditMode && !editEnabled}
                    name="country_id"
                    value={formData.country_id}
                    onChange={handleChange}
                    placeholder="Select country"
                  >
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>
                        {country.countryname}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Area Codes</FormLabel>
                  <Input
                    isDisabled={isEditMode && !editEnabled}
                    name="area_codes"
                    value={formData.area_codes}
                    onChange={handleChange}
                    placeholder="e.g. +212,+213 (comma separated)"
                  />
                </FormControl>
              </SimpleGrid>

              {relevantFields.length > 0 && (
                <>
                  <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">
                    {productType ? `${productType.toUpperCase()} Pricing Fields` : 'Pricing Fields'}
                  </FormLabel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    {relevantFields.map(fieldName => (
                      <FormControl key={fieldName}>
                        <FormLabel>{PRICING_FIELD_LABELS[fieldName]}</FormLabel>
                        <Input
                          isDisabled={isEditMode && !editEnabled}
                          type="number"
                          step="0.0001"
                          name={fieldName}
                          value={formData[fieldName]}
                          onChange={handleChange}
                          placeholder="0.0000"
                        />
                      </FormControl>
                    ))}
                  </SimpleGrid>
                </>
              )}

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <FormControl>
                  <FormLabel>Billing Pulse</FormLabel>
                  <Input
                    isDisabled={isEditMode && !editEnabled}
                    name="billing_pulse"
                    value={formData.billing_pulse}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Estimated Lead Time</FormLabel>
                  <Input
                    isDisabled={isEditMode && !editEnabled}
                    name="estimated_lead_time"
                    value={formData.estimated_lead_time}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Contract Term</FormLabel>
                  <Input
                    isDisabled={isEditMode && !editEnabled}
                    name="contract_term"
                    value={formData.contract_term}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Disconnection Notice</FormLabel>
                  <Input
                    isDisabled={isEditMode && !editEnabled}
                    name="disconnection_notice_term"
                    value={formData.disconnection_notice_term}
                    onChange={handleChange}
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button  borderRadius={"full"} _hover={{transform:"scale(0.95)", transition:"all 0.3s ease-in-out"}} variant="ghost" mr={3} onClick={onClose}>
            {editEnabled ? 'Cancel' : 'Close'}
          </Button>
          {isEditMode && !editEnabled && (
            <Button leftIcon={<FiEdit/>} _hover={{transform:"scale(0.95)", transition:"all 0.3s ease-in-out"}} borderRadius={"full"} colorScheme="blue" onClick={() => setEditEnabled(true)}>
              Edit
            </Button>
          )}
          {editEnabled && (
            <Button leftIcon={<FiPlus/>} borderRadius={"full"} _hover={{transform:"scale(0.95)", transition:"all 0.3s ease-in-out"}} colorScheme="blue" onClick={handleSubmit} isLoading={submitting} loadingText={isEditMode ? "Updating..." : "Creating..."}>
              {isEditMode ? 'Save Changes' : 'Add'}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddVendorPricingModal;
