import api from './api';

export const planService = {
  getPlans: async (params = {}) => {
    const res = await api.get('/plans', { params });
    return res.data;
  },

  getActivePlans: async () => {
    const res = await api.get('/plans/active');
    return res.data;
  },

  getPlanById: async (id) => {
    const res = await api.get(`/plans/${id}`);
    return res.data;
  },

  createPlan: async (planData) => {
    const res = await api.post('/plans', planData);
    return res.data;
  },

  updatePlan: async (id, planData) => {
    const res = await api.put(`/plans/${id}`, planData);
    return res.data;
  },

  deletePlan: async (id) => {
    const res = await api.delete(`/plans/${id}`);
    return res;
  },
};
