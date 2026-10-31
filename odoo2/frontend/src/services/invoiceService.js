import api from './api';

export const invoiceService = {
  getInvoices: async (params = {}) => {
    const res = await api.get('/invoices', { params });
    return res.data;
  },

  getInvoiceById: async (id) => {
    const res = await api.get(`/invoices/${id}`);
    return res.data;
  },

  confirmInvoice: async (id) => {
    const res = await api.post(`/invoices/${id}/confirm`);
    return res.data;
  },

  sendInvoice: async (id) => {
    const res = await api.post(`/invoices/${id}/send`);
    return res.data;
  },

  cancelInvoice: async (id) => {
    const res = await api.post(`/invoices/${id}/cancel`);
    return res.data;
  },

  downloadPdf: async (id, invoiceNumber = 'invoice') => {
    const token = localStorage.getItem('brightloop_token');
    const response = await fetch(`/api/invoices/${id}/pdf`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download invoice PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
