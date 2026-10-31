import api from './api';

export const quotationService = {
  getQuotations: async (params = {}) => {
    const res = await api.get('/quotations', { params });
    return res.data;
  },

  getQuotationById: async (id) => {
    const res = await api.get(`/quotations/${id}`);
    return res.data;
  },

  createQuotation: async (quotationData) => {
    const res = await api.post('/quotations', quotationData);
    return res.data;
  },

  sendQuotation: async (id) => {
    const res = await api.post(`/quotations/${id}/send`);
    return res.data;
  },

  acceptQuotation: async (id) => {
    const res = await api.post(`/quotations/${id}/accept`);
    return res.data;
  },

  rejectQuotation: async (id) => {
    const res = await api.post(`/quotations/${id}/reject`);
    return res.data;
  },

  convertToSubscription: async (id) => {
    const res = await api.post(`/quotations/${id}/convert-to-subscription`);
    return res.data;
  },

  getTemplates: async () => {
    const res = await api.get('/quotations/templates');
    return res.data;
  },

  createTemplate: async (templateData) => {
    const res = await api.post('/quotations/templates', templateData);
    return res.data;
  },
};
