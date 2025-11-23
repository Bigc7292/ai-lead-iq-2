import axios, { AxiosInstance, AxiosError } from 'axios';

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;

            if (status === 401) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            } else if (status === 403) {
                console.error('Access forbidden:', error.response.data);
            } else if (status === 404) {
                console.error('Resource not found:', error.response.data);
            } else if (status >= 500) {
                console.error('Server error:', error.response.data);
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('Network error - no response from server');
        } else {
            // Something else happened
            console.error('Request error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
