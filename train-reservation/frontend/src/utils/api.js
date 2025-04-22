import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

export const register = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

export const getTrains = async () => {
  try {
    const response = await api.get('/trains');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch trains' };
  }
};

export const createReservation = async (trainId, seats, passengerName) => {
  try {
    const response = await api.post('/reservations', { trainId, seats, passengerName });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create reservation' };
  }
};

export const getBookings = async () => {
  try {
    const response = await api.get('/bookings');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch bookings' };
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Health check failed' };
  }
};

export default api; 