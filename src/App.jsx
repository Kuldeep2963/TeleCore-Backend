import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dash-User/DashboardClient';
import DashboardInternal from './pages/Dash-User/DashboardInternal';
import Vendors from './pages/Vendors';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import DisconnectionRequests from './pages/DisconnectionRequests';
import AddVendorCustomer from './pages/AddVendorCustomer';
import NewNumber from './pages/OrderNumber/AddNewNumber/NewNumber';
import PortNumber from './pages/OrderNumber/PortNumber';
import VanityNumber from './pages/OrderNumber/VanityNumber';
import MyNumbers from './pages/MyNumbers';
import MyOrders from './pages/MyOrders';
import ProductInfo from './pages/ProductInfo';
import Profile from './pages/MyProfile';
import Billing from './pages/Billing&TopUpbalance/Billing';
// import PlaceOrder from './pages/OrderNumber/AddNewNumber/PlaceOrder';
import PlaceOrderPage from './pages/OrderNumber/AddNewNumber/PlaceOrderPage';
import OrderNumberView from './pages/OrderNumberView';
import Login from './pages/Login';
import Rates from './pages/Rates';
import DisconnectionModal from './Modals/DisconnectionModal';
import api from './services/api';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [walletBalance, setWalletBalance] = useState(50.00);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null); // 'Client' or 'Internal'
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    walletBalance: 0
  });
  const [isDisconnectionModalOpen, setIsDisconnectionModalOpen] = useState(false);
  const [selectedNumberForDisconnection, setSelectedNumberForDisconnection] = useState(null);
  const [numbersRefreshTrigger, setNumbersRefreshTrigger] = useState(0);

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
    email: 'sarah@telecore.com',
    password: 'Sarah@123'
  };

  const internalCredentials = {
    email: 'internal@telecore.com',
    password: 'Internal@123'
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

  const handlePlaceOrder = () => {
    // Clear cart after order is placed
    setCartItems([]);
  };

  const updateWalletBalance = (newBalance) => {
    setWalletBalance(newBalance);
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
          <Navbar cartCount={cartItems.length} walletBalance={userProfile.walletBalance} profilePicture={profilePicture} onLogout={handleLogout} userRole={userRole} userProfile={userProfile} />
          <div style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            marginTop: '76px',
            marginLeft: '200px'
          }}>
            <Sidebar userRole={userRole} />
            <div style={{
              flex: 1,
              width: '100%',
              overflow: 'hidden'
            }}>
              <Routes>
                <Route path="/" element={userRole === 'Internal' ? <DashboardInternal userId={userId} userRole={userRole} /> : <Dashboard userId={userId} userRole={userRole} />} />
                <Route path="/dashboard" element={userRole === 'Internal' ? <DashboardInternal userId={userId} userRole={userRole} /> : <Dashboard userId={userId} userRole={userRole} />} />
                <Route path="/order-numbers/new" element={<NewNumber onAddToCart={handleAddToCart} />} />
                <Route path="/order-numbers/vanity" element={<VanityNumber />} />
                <Route path="/order-numbers/port" element={<PortNumber />} />
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
                <Route path="/my-profile" element={<Profile profilePicture={profilePicture} onProfilePictureUpdate={updateProfilePicture} userId={userId} userProfile={userProfile} userRole={userRole} />} />
                <Route path="/billing-invoices" element={<Billing walletBalance={walletBalance} onUpdateBalance={updateWalletBalance} />} />

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