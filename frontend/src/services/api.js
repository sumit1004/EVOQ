import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
 * CSRF token will be injected via an interceptor once
 * the authentication system is implemented in Step 5-6.
 */

export default api;

