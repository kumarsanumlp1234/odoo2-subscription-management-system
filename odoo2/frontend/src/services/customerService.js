import api from './api';

export const customerService = {
  getAllCustomers: async (params = {}) => {
    const res = await api.get('/customers', { params });
    return res.data;
  },

  getCustomerById: async (id) => {
    const res = await api.get(`/customers/${id}`);
    return res.data;
  },

  createCustomer: async (customerData) => {
    const res = await api.post('/customers', customerData);
    return res.data;
  },

  updateCustomer: async (id, customerData) => {
    const res = await api.put(`/customers/${id}`, customerData);
    return res.data;
  },
};
