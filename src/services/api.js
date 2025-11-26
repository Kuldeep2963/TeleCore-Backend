const API_BASE_URL = '/api';

const getAuthToken = () => {
  return sessionStorage.getItem('authToken');
};

const apiCall = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    if (!response.ok) {
      // Handle unauthorized access
      if (response.status === 401) {
        // Clear session storage and redirect to login
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('userId');
        window.location.href = '/';
        throw new Error('Authentication required');
      }
      
      let errorMessage = `API Error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        // Could not parse error response
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

const api = {
  auth: {
    login: (data) => apiCall('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => apiCall('/auth/logout', { method: 'POST' }),
    getProfile: () => apiCall('/auth/profile'),
    changePassword: (data) => apiCall('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
  },

  vendors: {
    getAll: () => apiCall('/vendors'),
    getById: (id) => apiCall(`/vendors/${id}`),
    create: (data) => apiCall('/vendors', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/vendors/${id}`, { method: 'DELETE' }),
  },

  customers: {
    getAll: () => apiCall('/customers'),
    getById: (id) => apiCall(`/customers/${id}`),
    getMe: () => {
      return apiCall('/customers/me').catch(error => {
        if (error.message && error.message.includes('401')) {
          console.warn('Not authenticated for getMe');
          throw new Error('Customer not found - authentication issue');
        }
        throw error;
      });
    },
    create: (data) => apiCall('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/customers/${id}`, { method: 'DELETE' }),
  },

  orders: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiCall(`/orders${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => apiCall(`/orders/${id}`),
    create: (data) => apiCall('/orders', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/orders/${id}`, { method: 'DELETE' }),
    updateStatus: (id, status) => apiCall(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    // ADDED MISSING METHOD
    createPricing: (orderId, data) => apiCall(`/orders/${orderId}/pricing`, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    getPricing: (orderId) => apiCall(`/orders/${orderId}/pricing`),
  },

  invoices: {
    getAll: () => apiCall('/invoices'),
    getById: (id) => apiCall(`/invoices/${id}`),
    getDetails: (id) => apiCall(`/invoices/${id}/details`),
    create: (data) => apiCall('/invoices', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/invoices/${id}`, { method: 'DELETE' }),
    updateStatus: (id, status, paidDate) => apiCall(`/invoices/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, paid_date: paidDate }) }),
    updateUsage: (id, data) => apiCall(`/invoices/${id}/usage`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  numbers: {
    getAll: () => apiCall('/numbers'),
    getById: (id) => apiCall(`/numbers/${id}`),
    getAreaCodes: (countryId, productId) => apiCall(`/numbers/area-codes/${countryId}/${productId}`),
    create: (data) => apiCall('/numbers', { method: 'POST', body: JSON.stringify(data) }),
    getByOrder: (orderId) => apiCall(`/numbers/order/${orderId}`),
    updateUserForOrder: (orderId) => apiCall(`/numbers/order/${orderId}/user`, { method: 'PUT', body: JSON.stringify({}) }),
    delete: (id) => apiCall(`/numbers/${id}`, { method: 'DELETE' }),
  },

  pricing: {
    getAll: () => apiCall('/pricing'),
    getByProduct: (productId, countryId) => apiCall(`/pricing/product/${productId}/country/${countryId}`),
  },

  disconnectionRequests: {
    getAll: () => apiCall('/disconnection-requests'),
    getById: (id) => apiCall(`/disconnection-requests/${id}`),
    create: (data) => apiCall('/disconnection-requests', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/disconnection-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id, status, notes) => apiCall(`/disconnection-requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
    delete: (id) => apiCall(`/disconnection-requests/${id}`, { method: 'DELETE' }),
  },

  users: {
    getByEmail: (email) => apiCall(`/users/by-email/${encodeURIComponent(email)}`),
    updateProfilePicture: (userId, profilePictureUrl) => apiCall(`/users/${userId}/profile-picture`, {
      method: 'PATCH',
      body: JSON.stringify({ profile_picture_url: profilePictureUrl })
    }),
    getDashboardStats: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiCall(`/users/stats/dashboard${queryString ? `?${queryString}` : ''}`);
    },
  },

  countries: {
    getAll: () => apiCall('/countries'),
    getById: (id) => apiCall(`/countries/${id}`),
  },

  products: {
    getAll: () => apiCall('/products'),
    getById: (id) => apiCall(`/products/${id}`),
  },

  stats: {
    getDashboardStats: () => apiCall('/stats'),
  },

  documents: {
    upload: (orderId, formData) => {
      const token = getAuthToken();
      return fetch(`${API_BASE_URL}/orders/documents/upload/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      }).then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('isAuthenticated');
            sessionStorage.removeItem('userRole');
            sessionStorage.removeItem('userId');
            window.location.href = '/';
            throw new Error('Authentication required');
          }
          throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
      });
    },
    getByOrderId: (orderId) => apiCall(`/documents/${orderId}`),
    download: (orderId, filename) => {
      const token = getAuthToken();
      return fetch(`${API_BASE_URL}/documents/download/${orderId}/${filename}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
    },
    delete: (orderId, filename) => apiCall(`/documents/${orderId}/${filename}`, { method: 'DELETE' }),
  },
};

export default api;