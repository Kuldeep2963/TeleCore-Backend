import  axios  from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const walletService = {
  // Update wallet balance
  updateWalletBalance: async (userId, amount, description = 'Top-up') => {
    const response = await api.patch(`/users/${userId}/wallet`, {
      amount,
      description
    });
    return response.data;
  },

  // Get user profile (to get current balance)
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Get wallet transactions
  getWalletTransactions: async (userId) => {
    const response = await api.get(`/wallet/transactions/${userId}`);
    return response.data;
  },

  // Update wallet threshold
  updateWalletThreshold: async (userId, threshold) => {
    const response = await api.patch(`/users/${userId}/wallet-threshold`, {
      threshold
    });
    return response.data;
  }
};

export default walletService;