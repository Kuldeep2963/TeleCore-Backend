import React, { useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './Components/Sidebar';
import Dashboard from './pages/Dashboard';
import NewNumber from './pages/OrderNumber/AddNewNumber/NewNumber';
import PortNumber from './pages/OrderNumber/PortNumber';
import VanityNumber from './pages/OrderNumber/VanityNumber';
import MyNumbers from './pages/MyNumbers';
import MyOrders from './pages/MyOrders';
import ProductInfo from './pages/ProductInfo';
import Profile from './pages/MyProfile';
import Billing from './pages/Billing&TopUpbalance/Billing';
import PlaceOrder from './pages/OrderNumber/AddNewNumber/PlaceOrder';
import PlaceOrderPage from './pages/OrderNumber/AddNewNumber/PlaceOrderPage';
import Login from './pages/Login';
import Rates from './pages/Rates';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [walletBalance, setWalletBalance] = useState(50.00);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const handleLogin = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const isValid =
      normalizedEmail === sampleCredentials.email.toLowerCase() &&
      password === sampleCredentials.password;

    if (isValid) {
      setIsAuthenticated(true);
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
  };

  return (
    <Router>
      {isAuthenticated ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          backgroundColor: '#f8f9fa',
          color: '#333',
          margin: 0,
          padding: 0,
          minHeight: '100vh'
        }}>
          <Navbar cartCount={cartItems.length} walletBalance={walletBalance} onLogout={handleLogout} />
          <div style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            marginTop: '76px',
            marginLeft: '200px'
          }}>
            <Sidebar />
            <div style={{
              flex: 1,
              width: '100%',
              overflow: 'hidden'
            }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/order-numbers/new" element={<NewNumber onAddToCart={handleAddToCart} />} />
                <Route path="/order-numbers/vanity" element={<VanityNumber />} />
                <Route path="/order-numbers/port" element={<PortNumber />} />
                <Route path="/order-numbers/place-order" element={<PlaceOrderPage cartItems={cartItems} onPlaceOrder={handlePlaceOrder} onRemoveFromCart={handleRemoveFromCart} />} />
                <Route path="/order-numbers" element={<NewNumber onAddToCart={handleAddToCart} />} />
                <Route path="/my-numbers" element={<MyNumbers />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/product-info" element={<ProductInfo />} />
                <Route path="/rates" element={<Rates />} />
                <Route path="/my-profile" element={<Profile />} />
                <Route path="/billing-invoices" element={<Billing walletBalance={walletBalance} onUpdateBalance={updateWalletBalance} />} />
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