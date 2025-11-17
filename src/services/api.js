const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
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
  },

  invoices: {
    getAll: () => apiCall('/invoices'),
    getById: (id) => apiCall(`/invoices/${id}`),
    create: (data) => apiCall('/invoices', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/invoices/${id}`, { method: 'DELETE' }),
    updateStatus: (id, status, paidDate) => apiCall(`/invoices/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, paid_date: paidDate }) }),
  },

  numbers: {
    getAll: () => apiCall('/numbers'),
    getById: (id) => apiCall(`/numbers/${id}`),
    getAreaCodes: (countryId, productId) => apiCall(`/numbers/area-codes/${countryId}/${productId}`),
  },

  pricing: {
    getAll: () => apiCall('/pricing'),
    getByProduct: (productId) => apiCall(`/pricing?product_id=${productId}`),
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
};

export default api;
