import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import Dashboard from './pages/Dash-User/DashboardClient';
import DashboardInternal from './pages/Dash-User/DashboardInternal';
import Vendors from './pages/Vendors';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import DisconnectionRequests from './pages/DisconnectionRequests';
import AddVendorCustomer from './pages/AddVendorCustomer';
import NewNumber from './pages/OrderNumber/AddNewNumber/NewNumber';
// import PortNumber from './pages/OrderNumber/PortNumber';
// import VanityNumber from './pages/OrderNumber/VanityNumber';
import MyNumbers from './pages/MyNumbers';
import MyOrders from './pages/MyOrders';
import ProductInfo from './pages/ProductInfo';
import Profile from './pages/MyProfile';
import Billing from './pages/Billing&TopUpbalance/Billing';
import TopUp from './pages/Billing&TopUpbalance/TopUp';
import PlaceOrderPage from './pages/OrderNumber/AddNewNumber/PlaceOrderPage';
import OrderNumberView from './pages/OrderNumberView';
import Rates from './pages/Rates';
import Login from './pages/Login';
import DisconnectionModal from './Modals/DisconnectionModal';
import api from './services/api';

// Helper function to parse pricing values
const parsePricingValue = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    const cleaned = value.replace('$', '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  return typeof value === 'number' ? value : null;
};

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [walletBalance, setWalletBalance] = useState(50.00);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    walletBalance: 0
  });
  const [isDisconnectionModalOpen, setIsDisconnectionModalOpen] = useState(false);
  const [selectedNumberForDisconnection, setSelectedNumberForDisconnection] = useState(null);
  const [numbersRefreshTrigger, setNumbersRefreshTrigger] = useState(0);
  const [walletRefreshTrigger, setWalletRefreshTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (windowWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [windowWidth]);

  // Load authentication state from sessionStorage on component mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('isAuthenticated');
    const savedRole = sessionStorage.getItem('userRole');
    const savedUserId = sessionStorage.getItem('userId');
    const savedToken = sessionStorage.getItem('authToken');

    if (savedAuth === 'true' && savedToken) {
      setIsAuthenticated(true);
      if (savedRole) {
        setUserRole(savedRole);
      }
      if (savedUserId) {
        setUserId(savedUserId);
      }

      // Fetch profile data
      const fetchProfile = async () => {
        try {
          const profileResponse = await api.auth.getProfile();
          if (profileResponse.success) {
            const profileData = profileResponse.data;
            setUserProfile({
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || '',
              email: profileData.email || '',
              walletBalance: profileData.walletBalance || 0
            });
            setWalletBalance(profileData.walletBalance || 0);
            setProfilePicture(profileData.profilePicture || null);
          } else {
            // If profile fetch fails, clear authentication
            console.warn('Profile fetch failed, clearing authentication');
            setIsAuthenticated(false);
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('isAuthenticated');
            sessionStorage.removeItem('userRole');
            sessionStorage.removeItem('userId');
          }
        } catch (profileError) {
          console.error('Profile fetch error:', profileError);
          // If profile fetch fails, clear authentication to prevent white page
          setIsAuthenticated(false);
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('isAuthenticated');
          sessionStorage.removeItem('userRole');
          sessionStorage.removeItem('userId');
        }
      };

      fetchProfile();
    }
  }, []);

  const clientCredentials = {
    email: 'ankit.tyagi@telecore.com',
    password: 'Ankit@12345'
  };

  const internalCredentials = {
    email: 'kuldeep.tyagi@telecore.com',
    password: 'Kuldeep@12345'
  };

  const handleAddToCart = (item) => {
    if (!item) {
      return;
    }
    setCartItems((prev) => [
      ...prev,
      {
        ...item,
        id: item.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      }
    ]);
  };

  const handleRemoveFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePlaceOrder = async (orderDataParam) => {
    try {
      // Use cartItems from state or from parameter if provided
      const itemsToProcess = cartItems.length > 0 ? cartItems : [];

      if (itemsToProcess.length === 0) {
        throw new Error('Cart is empty. No items to order.');
      }

      console.log('Placing order for', itemsToProcess.length, 'items');

      // Get or create customer
      let customerId;
      try {
        const customerResponse = await api.customers.getMe();
        if (customerResponse.success) {
          customerId = customerResponse.data.id;
          console.log('Found existing customer:', customerId);
        } else {
          throw new Error('Customer not found');
        }
      } catch (customerError) {
        console.log('Customer not found, creating new customer...');
        // Create customer using user profile data
        const createCustomerResponse = await api.customers.create({
          company_name: userProfile.firstName + ' ' + userProfile.lastName || 'New Customer',
          contact_person: userProfile.firstName + ' ' + userProfile.lastName || 'New Customer',
          email: userProfile.email,
          user_id: userId,
          status: 'Active'
        });
        
        if (createCustomerResponse.success) {
          customerId = createCustomerResponse.data.id;
          console.log('Created new customer:', customerId);
        } else {
          throw new Error('Failed to create customer: ' + (createCustomerResponse.message || 'Unknown error'));
        }
      }

      // Create orders for each cart item
      const orderPromises = itemsToProcess.map(async (item) => {
        console.log('Processing cart item:', {
          productId: item.productId,
          countryId: item.countryId,
          productType: item.productType,
          country: item.country,
          areaCode: item.areaCode,
          quantity: item.quantity,
          totalAmount: item.totalAmount
        });

        // Validate required fields
        if (!item.productId || !item.countryId) {
          console.error('Invalid cart item - missing productId or countryId:', item);
          throw new Error(`Invalid order item: Missing required product or country information for ${item.productType}`);
        }

        // Convert documents to the format expected by backend
        let documentsArray = null;
        if (item.documents && item.documents.length > 0) {
          documentsArray = item.documents.map(doc => ({
            filename: doc.filename || doc.name || '',
            name: doc.name || '',
            type: doc.type || 'application/octet-stream',
            size: doc.size || 0,
            uploadedAt: doc.uploadedAt || new Date().toISOString()
          }));
        }

        const orderData = {
          customer_id: customerId,
          vendor_id: null,
          product_id: item.productId,
          country_id: item.countryId,
          area_code: item.areaCode,
          quantity: item.quantity || 1,
          total_amount: 0,
          status: 'In Progress',
          documents: documentsArray
        };

        console.log('Sending order data:', orderData);

        const orderResponse = await api.orders.create(orderData);
        console.log('Order response:', orderResponse);
        
        if (!orderResponse.success) {
          const errorMsg = orderResponse.message || 'Unknown error from server';
          throw new Error(`Failed to create order: ${errorMsg}`);
        }

        console.log('Order created successfully:', orderResponse.data.id);

        // Save desired pricing to order_pricing table if it exists
        if (item.desiredPricing) {
          const pricingData = {
            pricing_type: 'desired',
            nrc: parsePricingValue(item.desiredPricing.nrc),
            mrc: parsePricingValue(item.desiredPricing.mrc),
            ppm: parsePricingValue(item.desiredPricing.ppm),
            ppm_fix: parsePricingValue(item.desiredPricing.ppm_fix),
            ppm_mobile: parsePricingValue(item.desiredPricing.ppm_mobile),
            ppm_payphone: parsePricingValue(item.desiredPricing.ppm_payphone),
            arc: parsePricingValue(item.desiredPricing.arc),
            mo: parsePricingValue(item.desiredPricing.mo),
            mt: parsePricingValue(item.desiredPricing.mt),
            incoming_ppm: parsePricingValue(item.desiredPricing.incoming_ppm),
            outgoing_ppm_fix: parsePricingValue(item.desiredPricing.outgoing_ppm_fix),
            outgoing_ppm_mobile: parsePricingValue(item.desiredPricing.outgoing_ppm_mobile),
            incoming_sms: parsePricingValue(item.desiredPricing.incoming_sms),
            outgoing_sms: parsePricingValue(item.desiredPricing.outgoing_sms)
          };

          // Remove null values
          Object.keys(pricingData).forEach(key => {
            if (pricingData[key] === null) {
              delete pricingData[key];
            }
          });

          if (Object.keys(pricingData).length > 1) { // More than just pricing_type
            try {
              await api.orders.createPricing(orderResponse.data.id, pricingData);
              console.log('Desired pricing saved successfully');
            } catch (pricingError) {
              console.error('Failed to save desired pricing:', pricingError);
              // Don't throw error here - pricing is optional
            }
          }
        }

        return orderResponse.data;
      });

      // Wait for all orders to be created
      await Promise.all(orderPromises);

      // Clear cart after successful order creation
      setCartItems([]);
      console.log('All orders placed successfully. Cart cleared.');
      
      return { success: true, message: 'Order placed successfully' };
    } catch (error) {
      console.error('Place order error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      throw new Error('Failed to place order: ' + errorMessage);
    }
  };

  const updateWalletBalance = (newBalance) => {
    setWalletBalance(newBalance);
    setUserProfile(prev => ({
      ...prev,
      walletBalance: newBalance
    }));
    // Trigger wallet refresh
    setWalletRefreshTrigger(prev => prev + 1);
  };

  const updateProfilePicture = (newPicture) => {
    setProfilePicture(newPicture);
  };

  const handleLogin = async ({ email, password }) => {
    try {
      const response = await api.auth.login({ email, password });

      if (response.success) {
        const { token, user } = response.data;

        // Store token and user info
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('userRole', user.role);
        sessionStorage.setItem('userId', user.id);

        setIsAuthenticated(true);
        setUserRole(user.role);
        setUserId(user.id);

        // Fetch full profile data
        try {
          const profileResponse = await api.auth.getProfile();
          if (profileResponse.success) {
            const profileData = profileResponse.data;
            setUserProfile({
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || '',
              email: profileData.email || '',
              walletBalance: profileData.walletBalance || 0
            });
            setWalletBalance(profileData.walletBalance || 0);
            setProfilePicture(profileData.profilePicture || null);
          }
        } catch (profileError) {
          console.error('Profile fetch error:', profileError);
        }

        return { success: true };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    setIsAuthenticated(false);
    setCartItems([]);
    setUserRole('Client');
    setUserId(null);
    // Clear authentication state from sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userId');
  };

  const handleDisconnectionRequested = (number) => {
    setSelectedNumberForDisconnection(number);
    setIsDisconnectionModalOpen(true);
  };

  const handleDisconnectionSuccess = (numberId) => {
    // Trigger refresh of numbers list
    setNumbersRefreshTrigger(prev => prev + 1);
  };

  const handleDisconnectionModalClose = () => {
    setIsDisconnectionModalOpen(false);
    setSelectedNumberForDisconnection(null);
  };

  const handleRefreshWallet = () => {
    setWalletRefreshTrigger(prev => prev + 1);
  };

  return (
    <Router>
      {isAuthenticated ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          backgroundColor:'#f8f9fa',
          color: '#333',
          margin: 0,
          padding: 0,
          minHeight: '100vh'
        }}>
          <Navbar 
            cartCount={cartItems.length} 
            walletBalance={userProfile.walletBalance} 
            profilePicture={profilePicture} 
            onLogout={handleLogout} 
            userRole={userRole} 
            userProfile={userProfile}
            onRefreshWallet={handleRefreshWallet}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <div style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            marginTop: '76px',
            marginLeft: windowWidth >= 768 && isSidebarOpen ? '200px' : '0px',
            transition: 'margin-left 0.3s ease'
          }}>
            <Sidebar userRole={userRole} isSidebarOpen={isSidebarOpen} onItemClick={() => {
              if (windowWidth < 768) {
                setIsSidebarOpen(false);
              }
            }} />
            <div style={{
              flex: 1,
              width: '100%',
              overflow: 'hidden'
            }}>
              <Routes>
                <Route path="/" element={userRole === 'Internal' ? <DashboardInternal userId={userId} userRole={userRole} /> : <Dashboard userId={userId} userRole={userRole} />} />
                <Route path="/dashboard" element={userRole === 'Internal' ? <DashboardInternal userId={userId} userRole={userRole} /> : <Dashboard userId={userId} userRole={userRole} />} />
                <Route path="/order-numbers/new" element={<NewNumber onAddToCart={handleAddToCart} />} />
                {/* <Route path="/order-numbers/vanity" element={<VanityNumber />} /> */}
                {/* <Route path="/order-numbers/port" element={<PortNumber />} /> */}
                <Route path="/order-numbers/place-order" element={<PlaceOrderPage cartItems={cartItems} onPlaceOrder={handlePlaceOrder} onRemoveFromCart={handleRemoveFromCart} />} />
                <Route path="/order-numbers" element={<NewNumber onAddToCart={handleAddToCart} />} />
                <Route
                  path="/my-numbers"
                  element={
                    <MyNumbers
                      onRequestDisconnection={handleDisconnectionRequested}
                      refreshTrigger={numbersRefreshTrigger}
                    />
                  }
                />
                <Route path="/my-orders" element={<MyOrders userId={userId} userRole={userRole} />} />
                <Route path="/order-number-view" element={<OrderNumberView userRole={userRole} />} />
                <Route path="/product-info" element={<ProductInfo />} />
                <Route path="/rates" element={<Rates />} />
                <Route 
                  path="/my-profile" 
                  element={
                    <Profile 
                      profilePicture={profilePicture} 
                      onProfilePictureUpdate={updateProfilePicture} 
                      userId={userId} 
                      userProfile={userProfile} 
                      userRole={userRole} 
                    />
                  } 
                />
                <Route
                  path="/billing-invoices"
                  element={
                    <Billing
                      userId={userId}
                      walletBalance={walletBalance}
                      onUpdateBalance={updateWalletBalance}
                    />
                  }
                />
                {/* Add TopUp route */}
                <Route 
                  path="/top-up" 
                  element={
                    <TopUp 
                      userId={userId}
                      walletBalance={walletBalance}
                      onUpdateBalance={updateWalletBalance}
                      refreshTrigger={walletRefreshTrigger}
                    />
                  } 
                />

                {/* Internal and Admin routes */}
                {(userRole === 'Internal' || userRole === 'Admin') && (
                  <>
                    <Route path="/vendors" element={<Vendors />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/disconnection-requests" element={<DisconnectionRequests />} />
                    <Route path="/add-vendor-customer" element={<AddVendorCustomer />} />
                  </>
                )}

                {/* Admin-only routes */}
                {userRole === 'Admin' && (
                  <>
                    {/* Admin can access all routes, additional admin-specific routes can be added here */}
                  </>
                )}
              </Routes>
            </div>
          </div>

          {/* Disconnection Modal */}
          <DisconnectionModal
            isOpen={isDisconnectionModalOpen}
            onClose={handleDisconnectionModalClose}
            number={selectedNumberForDisconnection}
            onSuccess={handleDisconnectionSuccess}
          />
        </div>
      ) : (
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} clientCredentials={clientCredentials} internalCredentials={internalCredentials} />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;