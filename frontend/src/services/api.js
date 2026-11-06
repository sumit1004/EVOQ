import axios from 'axios';

let currentCsrfToken = null;

export function setCsrfToken(token) {
  currentCsrfToken = token;
}

export function getCsrfToken() {
  return currentCsrfToken;
}

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach CSRF token if available
api.interceptors.request.use(
  (config) => {
    if (
      currentCsrfToken &&
      !['get', 'head', 'options'].includes(config.method?.toLowerCase())
    ) {
      config.headers['X-CSRF-Token'] = currentCsrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: capture CSRF token if returned in header or response
api.interceptors.response.use(
  (response) => {
    const csrfHeader =
      response.headers['x-csrf-token'] || response.headers['X-CSRF-Token'];
    if (csrfHeader) {
      setCsrfToken(csrfHeader);
    } else if (response.data?.data?.csrfToken) {
      setCsrfToken(response.data.data.csrfToken);
    }
    return response;
  },
  (error) => {
    const errorData = error.response?.data?.error;
    const message =
      errorData?.message || error.message || 'An unexpected error occurred';
    const code = errorData?.code || 'NETWORK_ERROR';
    const details = errorData?.details || null;

    return Promise.reject({
      message,
      code,
      details,
      status: error.response?.status,
    });
  }
);

export default api;
