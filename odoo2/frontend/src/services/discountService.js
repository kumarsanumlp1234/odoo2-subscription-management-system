import api from './api';

export const discountService = {
  getDiscounts: async (params = {}) => {
    const res = await api.get('/discounts', { params });
    return res.data;
  },

  getActiveDiscounts: async () => {
    const res = await api.get('/discounts/active');
    return res.data;
  },

  getDiscountById: async (id) => {
    const res = await api.get(`/discounts/${id}`);
    return res.data;
  },

  createDiscount: async (discountData) => {
    const res = await api.post('/discounts', discountData);
    return res.data;
  },

  updateDiscount: async (id, discountData) => {
    const res = await api.put(`/discounts/${id}`, discountData);
    return res.data;
  },

  deleteDiscount: async (id) => {
    const res = await api.delete(`/discounts/${id}`);
    return res;
  },
};
