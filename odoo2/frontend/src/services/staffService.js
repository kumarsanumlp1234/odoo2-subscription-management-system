import api from './api';

export const staffService = {
  getAllStaff: async (params = {}) => {
    const res = await api.get('/admin/staff', { params });
    return res.data;
  },

  getStaffById: async (id) => {
    const res = await api.get(`/admin/staff/${id}`);
    return res.data;
  },

  createStaff: async (staffData) => {
    const res = await api.post('/admin/staff', staffData);
    return res.data;
  },

  updateStaff: async (id, staffData) => {
    const res = await api.put(`/admin/staff/${id}`, staffData);
    return res.data;
  },

  updateStaffStatus: async (id, active) => {
    const res = await api.patch(`/admin/staff/${id}/status`, { active });
    return res;
  },
};
