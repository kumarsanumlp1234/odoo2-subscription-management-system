import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staffService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { FormInput } from '../../components/forms/FormInput';
import { UserCheck, Plus, Search, Edit2, Shield, Lock, Power } from 'lucide-react';

export const StaffListPage = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    department: 'Operations',
    designation: 'Subscription Specialist',
    employeeCode: '',
  });

  useEffect(() => {
    fetchStaff();
  }, [page]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 15,
        search: search || undefined,
      };
      const res = await staffService.getAllStaff(params);
      setStaffList(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load internal staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchStaff();
  };

  const handleOpenModal = (staff = null) => {
    if (staff) {
      setSelectedStaff(staff);
      setFormData({
        fullName: staff.fullName,
        email: staff.email,
        password: '',
        phoneNumber: staff.phoneNumber || '',
        department: staff.department || 'Operations',
        designation: staff.designation || 'Subscription Specialist',
        employeeCode: staff.employeeCode || '',
      });
    } else {
      setSelectedStaff(null);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        department: 'Operations',
        designation: 'Subscription Specialist',
        employeeCode: `BL-STAFF-${Date.now().toString().slice(-3)}`,
      });
    }
    setModalOpen(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      toast.warning('Name and Email are required');
      return;
    }

    if (!selectedStaff && !formData.password) {
      toast.warning('Password is required for new staff accounts');
      return;
    }

    try {
      setSaving(true);
      if (selectedStaff) {
        await staffService.updateStaff(selectedStaff.id, formData);
        toast.success('Staff account updated');
      } else {
        await staffService.createStaff(formData);
        toast.success('Internal staff account created');
      }
      setModalOpen(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.message || 'Failed to save staff account');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await staffService.updateStaffStatus(id, !currentStatus);
      toast.info(`Staff account ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchStaff();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-brand-600" />
            Internal Staff &amp; Team Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Admin privilege controls: add billing managers, operational specialists, and manage access
          </p>
        </div>

        {isAdmin && (
          <button onClick={() => handleOpenModal()} className="btn-primary text-xs py-2">
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
        )}
      </div>

      {/* Filter / Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by staff name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </form>
      </div>

      {/* Table */}
      <div className="card-container overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading team members..." />
        ) : staffList.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No Staff Accounts Found"
            description="Add operational staff to manage customer subscriptions and invoices."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="table-th">Staff Member</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Designation</th>
                  <th className="table-th">Employee Code</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td">
                      <div className="font-semibold text-slate-900">{s.fullName}</div>
                      <div className="text-xs text-slate-500">{s.email}</div>
                    </td>
                    <td className="table-td text-xs font-medium text-slate-700">
                      {s.department || 'Operations'}
                    </td>
                    <td className="table-td text-xs text-slate-600">
                      {s.designation || 'Staff'}
                    </td>
                    <td className="table-td text-xs font-mono text-brand-700 font-semibold">
                      {s.employeeCode || 'BL-EMP'}
                    </td>
                    <td className="table-td">
                      <StatusBadge status={s.active ? 'ACTIVE' : 'CLOSED'} />
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(s)}
                          title="Edit Staff"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(s.id, s.active)}
                          title={s.active ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-lg ${
                            s.active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedStaff ? 'Edit Staff Account' : 'Add Internal Staff Member'}
        subtitle="Manage operations access and permissions"
      >
        <form onSubmit={handleSaveStaff} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="fullName"
              label="Full Name *"
              placeholder="e.g. Sarah Jenkins"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />

            <FormInput
              id="email"
              label="Staff Email *"
              type="email"
              placeholder="sarah@brightloop.io"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {!selectedStaff && (
            <FormInput
              id="password"
              label="Initial Password *"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 symbol"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="department"
              label="Department"
              placeholder="Operations / Billing"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />

            <FormInput
              id="designation"
              label="Designation"
              placeholder="Subscription Lead"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />
          </div>

          <FormInput
            id="employeeCode"
            label="Employee ID Code"
            placeholder="BL-EMP-005"
            value={formData.employeeCode}
            onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Saving...' : selectedStaff ? 'Update Staff' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
