import api from './api';

export const paymentService = {
  getPayments: async (params = {}) => {
    const res = await api.get('/payments', { params });
    return res.data;
  },

  getPaymentsForInvoice: async (invoiceId) => {
    const res = await api.get(`/payments/invoice/${invoiceId}`);
    return res.data;
  },

  recordPayment: async (paymentData) => {
    const res = await api.post('/payments', paymentData);
    return res.data;
  },
};
