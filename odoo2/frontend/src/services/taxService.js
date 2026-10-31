import api from './api';

export const taxService = {
  getAllTaxes: async () => {
    const res = await api.get('/taxes');
    return res.data;
  },

  getActiveTaxes: async () => {
    const res = await api.get('/taxes/active');
    return res.data;
  },

  getTaxById: async (id) => {
    const res = await api.get(`/taxes/${id}`);
    return res.data;
  },

  createTax: async (taxData) => {
    const res = await api.post('/taxes', taxData);
    return res.data;
  },

  updateTax: async (id, taxData) => {
    const res = await api.put(`/taxes/${id}`, taxData);
    return res.data;
  },
};
