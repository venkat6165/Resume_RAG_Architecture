import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add unique request tracing ID
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers['X-Request-ID'] = crypto.randomUUID();
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor: graceful toast handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data: any = error.response.data;
      const message = data?.message || data?.error || 'An unexpected error occurred';
      if (status === 404) {
        toast.error(`Not found: ${message}`);
      } else if (status === 413) {
        toast.error('File size exceeds maximum upload limit');
      } else if (status === 500) {
        toast.error(`Server error: ${message}`);
      } else {
        toast.error(message);
      }
    } else if (error.request) {
      toast.error('Network error. Unable to reach backend server at ' + API_BASE_URL);
    } else {
      toast.error('Request initialization failed');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
