import axios from 'axios';

// Create axios instance with environment-based configuration
const api = axios.create({
    // In production, use the backend URL from environment variable
    // In development, the Vite proxy handles /api requests
    baseURL: import.meta.env.VITE_API_URL || '',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Backend URL for static files (uploads, etc.)
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - could redirect to login
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export default api;
