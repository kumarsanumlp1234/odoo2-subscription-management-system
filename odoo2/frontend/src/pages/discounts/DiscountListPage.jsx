import React, { useState, useEffect } from 'react';
import { discountService } from '../../services/discountService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { FormInput } from '../../components/forms/FormInput';
import { SelectInput } from '../../components/forms/SelectInput';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Percent, Plus, Search, Edit2, Trash2, Tag, Calendar, CheckCircle2 } from 'lucide-react';

export const DiscountListPage = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal & form states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    discountName: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minimumPurchaseAmount: '0.00',
    minimumQuantity: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maximumUsage: 100,
  });

  useEffect(() => {
    fetchDiscounts();
  }, [page]);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 15,
        search: search || undefined,
      };
      const res = await discountService.getDiscounts(params);
      setDiscounts(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchDiscounts();
  };

  const handleOpenModal = (disc = null) => {
    if (disc) {
      setSelectedDiscount(disc);
      setFormData({
        discountName: disc.discountName,
        discountType: disc.discountType,
        discountValue: disc.discountValue,
        minimumPurchaseAmount: disc.minimumPurchaseAmount || '0.00',
        minimumQuantity: disc.minimumQuantity || 1,
        startDate: disc.startDate || new Date().toISOString().split('T')[0],
        endDate: disc.endDate || '',
        maximumUsage: disc.maximumUsage || 100,
      });
    } else {
      setSelectedDiscount(null);
      setFormData({
        discountName: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minimumPurchaseAmount: '0.00',
        minimumQuantity: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maximumUsage: 100,
      });
    }
    setModalOpen(true);
  };

  const handleSaveDiscount = async (e) => {
    e.preventDefault();
    if (!formData.discountName || !formData.discountValue) {
      toast.warning('Name and Value are required');
      return;
    }

    try {
      setSaving(true);
      if (selectedDiscount) {
        await discountService.updateDiscount(selectedDiscount.id, formData);
        toast.success('Discount updated');
      } else {
        await discountService.createDiscount(formData);
        toast.success('Discount rule created');
      }
      setModalOpen(false);
      fetchDiscounts();
    } catch (err) {
      toast.error(err.message || 'Failed to save discount');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this discount?')) return;
    try {
      await discountService.deleteDiscount(id);
      toast.success('Discount deactivated');
      fetchDiscounts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Percent className="w-6 h-6 text-brand-600" />
            Promotional &amp; Recurring Discounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fixed amount and percentage vouchers with usage thresholds and date boundaries
          </p>
        </div>

        {isAdmin && (
          <button onClick={() => handleOpenModal()} className="btn-primary text-xs py-2">
            <Plus className="w-4 h-4" />
            New Discount Code
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search discounts by code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </form>
      </div>

      {/* Table */}
      <div className="card-container overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading discounts..." />
        ) : discounts.length === 0 ? (
          <EmptyState
            icon={Percent}
            title="No Discounts Found"
            description="Create percentage or fixed currency discounts for subscription campaigns."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="table-th">Promo Code</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Discount Value</th>
                  <th className="table-th">Min Purchase</th>
                  <th className="table-th">Usage Progress</th>
                  <th className="table-th">Validity</th>
                  <th className="table-th">Status</th>
                  {isAdmin && <th className="table-th text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {discounts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td font-bold text-brand-700 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-brand-500" />
                      {d.discountName}
                    </td>
                    <td className="table-td">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {d.discountType}
                      </span>
                    </td>
                    <td className="table-td font-bold text-slate-900">
                      {d.discountType === 'PERCENTAGE'
                        ? `${d.discountValue}%`
                        : formatCurrency(d.discountValue)}
                    </td>
                    <td className="table-td text-xs text-slate-600">
                      {formatCurrency(d.minimumPurchaseAmount)}
                    </td>
                    <td className="table-td">
                      <div className="w-28">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>{d.usageCount || 0} used</span>
                          <span>{d.maximumUsage || '∞'} max</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-brand-600 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                ((d.usageCount || 0) / (d.maximumUsage || 1)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-xs text-slate-500">
                      {formatDate(d.startDate)} – {formatDate(d.endDate)}
                    </td>
                    <td className="table-td">
                      <StatusBadge status={d.active ? 'ACTIVE' : 'CLOSED'} />
                    </td>
                    {isAdmin && (
                      <td className="table-td text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenModal(d)}
                            title="Edit Discount"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDiscount(d.id)}
                            title="Deactivate Discount"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
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
        title={selectedDiscount ? 'Edit Discount Voucher' : 'Create Discount Voucher'}
        subtitle="Configure value, thresholds, and limits"
      >
        <form onSubmit={handleSaveDiscount} className="space-y-4">
          <FormInput
            id="discountName"
            label="Promo Code / Name"
            placeholder="e.g. WELCOME10 or ENTERPRISE500"
            value={formData.discountName}
            onChange={(e) => setFormData({ ...formData, discountName: e.target.value.toUpperCase() })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              id="discountType"
              label="Discount Type"
              options={[
                { value: 'PERCENTAGE', label: 'PERCENTAGE (%)' },
                { value: 'FIXED_AMOUNT', label: 'FIXED AMOUNT (₹)' },
              ]}
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              required
            />

            <FormInput
              id="discountValue"
              label={formData.discountType === 'PERCENTAGE' ? 'Discount Rate (%)' : 'Amount (₹)'}
              type="number"
              step="0.01"
              placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '500.00'}
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="minimumPurchaseAmount"
              label="Minimum Order Subtotal (₹)"
              type="number"
              step="0.01"
              value={formData.minimumPurchaseAmount}
              onChange={(e) =>
                setFormData({ ...formData, minimumPurchaseAmount: e.target.value })
              }
            />

            <FormInput
              id="maximumUsage"
              label="Maximum Usage Count"
              type="number"
              min="1"
              value={formData.maximumUsage}
              onChange={(e) =>
                setFormData({ ...formData, maximumUsage: parseInt(e.target.value) || 100 })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="startDate"
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />

            <FormInput
              id="endDate"
              label="Expiry Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
              {saving ? 'Saving...' : selectedDiscount ? 'Update Discount' : 'Create Discount'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
