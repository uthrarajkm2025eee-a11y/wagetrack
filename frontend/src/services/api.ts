import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const formattedError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
      status: error.response?.status || 500,
      path: error.response?.data?.path || '',
    };
    return Promise.reject(formattedError);
  }
);

export default api;
