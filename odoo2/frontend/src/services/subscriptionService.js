import api from './api';

export const subscriptionService = {
  getSubscriptions: async (params = {}) => {
    const res = await api.get('/subscriptions', { params });
    return res.data;
  },

  getSubscriptionById: async (id) => {
    const res = await api.get(`/subscriptions/${id}`);
    return res.data;
  },

  createSubscription: async (subscriptionData) => {
    const res = await api.post('/subscriptions', subscriptionData);
    return res.data;
  },

  confirmSubscription: async (id) => {
    const res = await api.post(`/subscriptions/${id}/confirm`);
    return res.data;
  },

  activateSubscription: async (id) => {
    const res = await api.post(`/subscriptions/${id}/activate`);
    return res.data;
  },

  pauseSubscription: async (id, reason) => {
    const res = await api.post(`/subscriptions/${id}/pause`, { reason });
    return res.data;
  },

  resumeSubscription: async (id) => {
    const res = await api.post(`/subscriptions/${id}/resume`);
    return res.data;
  },

  closeSubscription: async (id, reason) => {
    const res = await api.post(`/subscriptions/${id}/close`, { reason });
    return res.data;
  },

  cancelSubscription: async (id, reason) => {
    const res = await api.post(`/subscriptions/${id}/cancel`, { reason });
    return res.data;
  },

  renewSubscription: async (id) => {
    const res = await api.post(`/subscriptions/${id}/renew`);
    return res.data;
  },
};
