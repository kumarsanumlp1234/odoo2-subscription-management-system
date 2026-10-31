import api from './api';

export const dashboardService = {
  getSummary: async () => {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },

  getRevenueAnalytics: async () => {
    const res = await api.get('/dashboard/revenue');
    return res.data;
  },

  getSubscriptionAnalytics: async () => {
    const res = await api.get('/dashboard/subscriptions');
    return res.data;
  },

  triggerBillingCycle: async (date) => {
    const res = await api.post('/dashboard/trigger-billing', null, {
      params: date ? { date } : {},
    });
    return res.data;
  },
};
