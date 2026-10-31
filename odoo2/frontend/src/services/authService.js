import api from './api';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data?.token) {
      localStorage.setItem('brightloop_token', res.data.token);
      localStorage.setItem('brightloop_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  register: async (data) => {
    const res = await api.post('/auth/register', data);
    if (res.data?.token) {
      localStorage.setItem('brightloop_token', res.data.token);
      localStorage.setItem('brightloop_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res;
  },

  resetPassword: async (token, newPassword) => {
    const res = await api.post('/auth/reset-password', { token, newPassword });
    return res;
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('brightloop_token');
    localStorage.removeItem('brightloop_user');
  },

  getStoredUser: () => {
    try {
      const u = localStorage.getItem('brightloop_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },
};
