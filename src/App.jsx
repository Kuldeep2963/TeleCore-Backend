import React, { useMemo, useState, useEffect } from 'react';
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

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [walletBalance, setWalletBalance] = useState(50.00);
  const [disconnectionRequests, setDisconnectionRequests] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [userRole, setUserRole] = useState('Client'); // 'Client' or 'Internal'

  const updateOrderDisconnectionStatus = (orderId, status) => {
    setDisconnectionRequests(prevRequests =>
      prevRequests.map(request =>
        request.orderId === orderId ? { ...request, status } : request
      )
    );
  };

  // Load authentication state from localStorage on component mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedRole = localStorage.getItem('userRole');

    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      if (savedRole) {
        setUserRole(savedRole);
      }
    }
  }, []);

  const sampleCredentials = useMemo(() => ({
    email: 'sarah@telecore.com',
    password: 'Sarah@123'
  }), []);

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

  const handleLogin = ({ email, password, role }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const isValid =
      normalizedEmail === sampleCredentials.email.toLowerCase() &&
      password === sampleCredentials.password;

    if (isValid) {
      setIsAuthenticated(true);
      setUserRole(role || 'Client');
      // Save authentication state to localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', role || 'Client');
      return { success: true };
    }

    return {
      success: false,
      message: 'Invalid email or password'
    };
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCartItems([]);
    setUserRole('Client');
    // Clear authentication state from localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
  };

  const handleDisconnectionRequested = ({ number, linkedOrderId }) => {
    if (!linkedOrderId) {
      return;
    }

    updateOrderDisconnectionStatus(linkedOrderId, 'Pending');

    const requestPayload = {
      phoneNumber: number,
      orderId: linkedOrderId,
      status: 'Pending',
      requestedAt: new Date().toISOString()
    };

    setDisconnectionRequests(prev => [...prev, requestPayload]);

    const existingRequests = JSON.parse(localStorage.getItem('disconnectionRequests') || '[]');
    localStorage.setItem(
      'disconnectionRequests',
      JSON.stringify([...existingRequests, requestPayload])
    );
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
          <Navbar cartCount={cartItems.length} walletBalance={walletBalance} profilePicture={profilePicture} onLogout={handleLogout} userRole={userRole} />
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
                <Route path="/" element={userRole === 'Internal' ? <DashboardInternal /> : <Dashboard />} />
                <Route path="/dashboard" element={userRole === 'Internal' ? <DashboardInternal /> : <Dashboard />} />
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
                    />
                  }
                />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/order-number-view" element={<OrderNumberView />} />
                <Route path="/product-info" element={<ProductInfo />} />
                <Route path="/rates" element={<Rates />} />
                <Route path="/my-profile" element={<Profile profilePicture={profilePicture} onProfilePictureUpdate={updateProfilePicture} />} />
                <Route path="/billing-invoices" element={<Billing walletBalance={walletBalance} onUpdateBalance={updateWalletBalance} />} />

                {/* Internal-only routes */}
                {userRole === 'Internal' && (
                  <>
                    <Route path="/vendors" element={<Vendors />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/disconnection-requests" element={<DisconnectionRequests />} />
                    <Route path="/add-vendor-customer" element={<AddVendorCustomer />} />
                  </>
                )}
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} sampleCredentials={sampleCredentials} />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;