import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getDashboardStats = async () => {
  const response = await api.get('/api/dashboard/stats');
  return response.data;
};

export const getCustomers = async () => {
  const response = await api.get('/api/customers');
  return response.data;
};

export const triggerSync = async () => {
  const response = await api.post('/api/sync');
  return response.data;
};

export const getCustomerOrders = async (customerId: number) => {
  const response = await api.get(`/api/customers/${customerId}/orders`);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/api/orders');
  return response.data;
};

export default api;
