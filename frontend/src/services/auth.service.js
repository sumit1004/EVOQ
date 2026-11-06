import api, { setCsrfToken } from './api.js';

export const authService = {
  async register(email, username, password) {
    const res = await api.post('/auth/register', { email, username, password });
    return res.data.data;
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.data.csrfToken) {
      setCsrfToken(res.data.data.csrfToken);
    }
    return res.data.data;
  },

  async me() {
    const res = await api.get('/auth/me');
    if (res.data.data.csrfToken) {
      setCsrfToken(res.data.data.csrfToken);
    }
    return res.data.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      setCsrfToken(null);
    }
  },

  async logoutAll() {
    try {
      await api.post('/auth/logout-all');
    } finally {
      setCsrfToken(null);
    }
  },

  async forgotPassword(email) {
    const res = await api.post('/auth/password/forgot', { email });
    return res.data.data;
  },

  async resetPassword(token, newPassword) {
    const res = await api.post('/auth/password/reset', { token, newPassword });
    return res.data.data;
  },

  async verifyEmail(token) {
    const res = await api.post('/auth/verify-email', { token });
    return res.data.data;
  },

  async resendVerification(email) {
    const res = await api.post('/auth/resend-verification', { email });
    return res.data.data;
  },
};

