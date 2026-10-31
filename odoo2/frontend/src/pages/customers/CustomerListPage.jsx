import React, { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { FormInput } from '../../components/forms/FormInput';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
} from 'lucide-react';

export const CustomerListPage = () => {
  const { isAdmin, isStaff } = useAuth();
  const toast = useToast();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal & form states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    gstNumber: '',
    billingAddressLine1: '',
    city: '',
    state: '',
    postalCode: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 15,
        search: search || undefined,
      };
      const res = await customerService.getAllCustomers(params);
      setCustomers(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchCustomers();
  };

  const handleOpenModal = (cust = null) => {
    if (cust) {
      setSelectedCustomer(cust);
      setFormData({
        fullName: cust.fullName,
        email: cust.email,
        phoneNumber: cust.phoneNumber || '',
        companyName: cust.companyName || '',
        gstNumber: cust.gstNumber || '',
        billingAddressLine1: cust.billingAddressLine1 || '',
        city: cust.city || '',
        state: cust.state || '',
        postalCode: cust.postalCode || '',
      });
    } else {
      setSelectedCustomer(null);
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        companyName: '',
        gstNumber: '',
        billingAddressLine1: '',
        city: '',
        state: '',
        postalCode: '',
      });
    }
    setModalOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      toast.warning('Full Name and Email are required');
      return;
    }

    try {
      setSaving(true);
      if (selectedCustomer) {
        await customerService.updateCustomer(selectedCustomer.id, formData);
        toast.success('Customer profile updated');
      } else {
        await customerService.createCustomer(formData);
        toast.success('Customer account registered');
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            Customer Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accounts, GSTIN numbers, billing addresses, and linked subscriptions
          </p>
        </div>

        {(isAdmin || isStaff) && (
          <button onClick={() => handleOpenModal()} className="btn-primary text-xs py-2">
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        )}
      </div>

      {/* Filter / Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </form>
      </div>

      {/* Table */}
      <div className="card-container overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading customer directory..." />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Customers Found"
            description="Add customers to issue quotations and manage recurring subscriptions."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="table-th">Customer / Company</th>
                  <th className="table-th">Contact Info</th>
                  <th className="table-th">GSTIN Number</th>
                  <th className="table-th">Location</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td">
                      <div className="font-semibold text-slate-900">{c.fullName}</div>
                      {c.companyName && (
                        <div className="text-xs text-brand-600 font-medium flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" />
                          {c.companyName}
                        </div>
                      )}
                    </td>
                    <td className="table-td text-xs space-y-0.5">
                      <div className="text-slate-700 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {c.email}
                      </div>
                      {c.phoneNumber && (
                        <div className="text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {c.phoneNumber}
                        </div>
                      )}
                    </td>
                    <td className="table-td text-xs font-mono font-medium text-slate-700">
                      {c.gstNumber || '—'}
                    </td>
                    <td className="table-td text-xs text-slate-600">
                      {c.city ? `${c.city}, ${c.state || ''}` : '—'}
                    </td>
                    <td className="table-td">
                      <StatusBadge status={c.active ? 'ACTIVE' : 'CLOSED'} />
                    </td>
                    <td className="table-td text-right">
                      <button
                        onClick={() => handleOpenModal(c)}
                        title="Edit Customer"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
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
        title={selectedCustomer ? 'Edit Customer Profile' : 'Add New Customer'}
        subtitle="Customer contact and invoicing tax information"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="fullName"
              label="Contact Person Name *"
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />

            <FormInput
              id="email"
              label="Email Address *"
              type="email"
              placeholder="john@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="phoneNumber"
              label="Phone Number"
              placeholder="+91 9876543210"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />

            <FormInput
              id="companyName"
              label="Company Legal Name"
              placeholder="Acme Technologies Pvt Ltd"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>

          <FormInput
            id="gstNumber"
            label="GSTIN Identification Number"
            placeholder="29ABCDE1234F1Z5"
            value={formData.gstNumber}
            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
          />

          <FormInput
            id="billingAddressLine1"
            label="Billing Street Address"
            placeholder="Suite 404, Tech Park"
            value={formData.billingAddressLine1}
            onChange={(e) => setFormData({ ...formData, billingAddressLine1: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-3">
            <FormInput
              id="city"
              label="City"
              placeholder="Bengaluru"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />

            <FormInput
              id="state"
              label="State"
              placeholder="Karnataka"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />

            <FormInput
              id="postalCode"
              label="Postal Code"
              placeholder="560103"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Saving...' : selectedCustomer ? 'Update Profile' : 'Add Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
