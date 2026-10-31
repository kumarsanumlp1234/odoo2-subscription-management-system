import React, { useState, useEffect } from 'react';
import { planService } from '../../services/planService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { FormInput } from '../../components/forms/FormInput';
import { SelectInput } from '../../components/forms/SelectInput';
import { formatCurrency } from '../../utils/formatters';
import {
  CalendarCheck2,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Pause,
  Repeat,
} from 'lucide-react';

export const PlanListPage = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal & form states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    planName: '',
    description: '',
    billingFrequency: 'MONTHLY',
    billingInterval: 1,
    basePrice: '',
    minimumQuantity: 1,
    autoClose: false,
    allowEarlyClosure: true,
    allowPause: true,
    allowManualRenewal: true,
  });

  useEffect(() => {
    fetchPlans();
  }, [page]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 15,
        search: search || undefined,
      };
      const res = await planService.getPlans(params);
      setPlans(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchPlans();
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setSelectedPlan(plan);
      setFormData({
        planName: plan.planName,
        description: plan.description || '',
        billingFrequency: plan.billingFrequency,
        billingInterval: plan.billingInterval || 1,
        basePrice: plan.basePrice,
        minimumQuantity: plan.minimumQuantity || 1,
        autoClose: plan.autoClose || false,
        allowEarlyClosure: plan.allowEarlyClosure !== false,
        allowPause: plan.allowPause !== false,
        allowManualRenewal: plan.allowManualRenewal !== false,
      });
    } else {
      setSelectedPlan(null);
      setFormData({
        planName: '',
        description: '',
        billingFrequency: 'MONTHLY',
        billingInterval: 1,
        basePrice: '',
        minimumQuantity: 1,
        autoClose: false,
        allowEarlyClosure: true,
        allowPause: true,
        allowManualRenewal: true,
      });
    }
    setModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!formData.planName || !formData.basePrice) {
      toast.warning('Plan Name and Base Price are required');
      return;
    }

    try {
      setSaving(true);
      if (selectedPlan) {
        await planService.updatePlan(selectedPlan.id, formData);
        toast.success('Subscription plan updated');
      } else {
        await planService.createPlan(formData);
        toast.success('Subscription plan created');
      }
      setModalOpen(false);
      fetchPlans();
    } catch (err) {
      toast.error(err.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this plan?')) return;
    try {
      await planService.deletePlan(id);
      toast.success('Plan deactivated');
      fetchPlans();
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate plan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-brand-600" />
            Subscription Plan Templates
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Define recurring intervals, pause allowances, renewal mechanisms, and auto-closure rules
          </p>
        </div>

        {isAdmin && (
          <button onClick={() => handleOpenModal()} className="btn-primary text-xs py-2">
            <Plus className="w-4 h-4" />
            New Subscription Plan
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search plans by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </form>
      </div>

      <div className="card-container overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading subscription plans..." />
        ) : plans.length === 0 ? (
          <EmptyState
            icon={CalendarCheck2}
            title="No Plans Defined"
            description="Create recurring plans such as Monthly Starter or Annual Enterprise."
            action={
              isAdmin ? (
                <button onClick={() => handleOpenModal()} className="btn-primary text-xs">
                  <Plus className="w-4 h-4" />
                  Create Plan
                </button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="table-th">Plan Name</th>
                  <th className="table-th">Cadence / Interval</th>
                  <th className="table-th">Base Price</th>
                  <th className="table-th">Lifecycle Rules</th>
                  <th className="table-th">Status</th>
                  {isAdmin && <th className="table-th text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {plans.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td">
                      <div className="font-semibold text-slate-900">{p.planName}</div>
                      {p.description && (
                        <div className="text-xs text-slate-400 truncate max-w-xs">
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td className="table-td">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Clock className="w-3 h-3" />
                        Every {p.billingInterval} {p.billingFrequency?.toLowerCase()}
                      </span>
                    </td>
                    <td className="table-td font-semibold text-slate-900">
                      {formatCurrency(p.basePrice)}
                    </td>
                    <td className="table-td">
                      <div className="flex flex-wrap gap-1 text-[11px]">
                        {p.allowPause && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Pause OK
                          </span>
                        )}
                        {p.allowEarlyClosure && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            Early Close
                          </span>
                        )}
                        {p.autoClose && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            Auto Close
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-td">
                      <StatusBadge status={p.active ? 'ACTIVE' : 'CLOSED'} />
                    </td>
                    {isAdmin && (
                      <td className="table-td text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenModal(p)}
                            title="Edit Plan"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePlan(p.id)}
                            title="Deactivate Plan"
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

      {/* Plan Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
        subtitle="Set recurring schedule and lifecycle rules"
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          <FormInput
            id="planName"
            label="Plan Name"
            placeholder="e.g. Quarterly Growth Tier"
            value={formData.planName}
            onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              id="billingFrequency"
              label="Cadence Frequency"
              options={[
                { value: 'DAILY', label: 'DAILY' },
                { value: 'WEEKLY', label: 'WEEKLY' },
                { value: 'MONTHLY', label: 'MONTHLY' },
                { value: 'YEARLY', label: 'YEARLY' },
              ]}
              value={formData.billingFrequency}
              onChange={(e) => setFormData({ ...formData, billingFrequency: e.target.value })}
              required
            />

            <FormInput
              id="billingInterval"
              label="Interval Multiplier"
              type="number"
              min="1"
              value={formData.billingInterval}
              onChange={(e) => setFormData({ ...formData, billingInterval: parseInt(e.target.value) || 1 })}
              required
              helperText="e.g. 3 for every 3 months"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="basePrice"
              label="Base Plan Price (₹)"
              type="number"
              step="0.01"
              placeholder="1000.00"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              required
            />

            <FormInput
              id="minimumQuantity"
              label="Minimum Quantity"
              type="number"
              min="1"
              value={formData.minimumQuantity}
              onChange={(e) => setFormData({ ...formData, minimumQuantity: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Description</label>
            <textarea
              rows={2}
              className="block w-full rounded-lg border border-slate-200 text-sm p-2.5 focus:border-brand-500"
              placeholder="Terms, SLA, and inclusions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Lifecycle Toggles */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <p className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
              Lifecycle Governance Rules
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowPause}
                onChange={(e) => setFormData({ ...formData, allowPause: e.target.checked })}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>Allow Customer/Staff to Pause &amp; Resume Subscriptions</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowEarlyClosure}
                onChange={(e) => setFormData({ ...formData, allowEarlyClosure: e.target.checked })}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>Allow Early Cancellation / Closure</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoClose}
                onChange={(e) => setFormData({ ...formData, autoClose: e.target.checked })}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>Auto-Close Subscriptions when expiry date is reached</span>
            </label>
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
              {saving ? 'Saving...' : selectedPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
