import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/subscriptionService';
import { customerService } from '../../services/customerService';
import { planService } from '../../services/planService';
import { productService } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { Pagination } from '../../components/common/Pagination';
import { FormInput } from '../../components/forms/FormInput';
import { SelectInput } from '../../components/forms/SelectInput';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  Repeat,
  Plus,
  Search,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  Eye,
  Calendar,
  History,
  ShieldAlert,
  ArrowRight,
  User,
  Trash2,
} from 'lucide-react';

export const SubscriptionListPage = () => {
  const { user, isAdmin, isStaff, isCustomer } = useAuth();
  const toast = useToast();

  const [subscriptions, setSubscriptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Detail / History / Action modals
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    type: 'danger',
  });
  const [actionReason, setActionReason] = useState('');
  const [saving, setSaving] = useState(false);

  // New Subscription Form
  const [customerId, setCustomerId] = useState('');
  const [planId, setPlanId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState('Net 15');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([
    { productId: '', variantId: '', quantity: 1, unitPrice: 0, taxRate: 18, discountAmount: 0 },
  ]);

  useEffect(() => {
    fetchSubscriptions();
  }, [page, statusFilter]);

  useEffect(() => {
    if (isAdmin || isStaff) {
      loadDependencies();
    }
  }, [isAdmin, isStaff]);

  const loadDependencies = async () => {
    try {
      const [custRes, planRes, prodRes] = await Promise.all([
        customerService.getAllCustomers({ size: 100 }),
        planService.getActivePlans(),
        productService.getActiveProducts(),
      ]);
      setCustomers(custRes.content || []);
      setPlans(planRes || []);
      setProducts(prodRes || []);
    } catch (e) {
      console.warn('Could not load subscription form dropdowns', e);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 15,
        search: search || undefined,
        status: statusFilter || undefined,
      };
      const res = await subscriptionService.getSubscriptions(params);
      setSubscriptions(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchSubscriptions();
  };

  const handleProductSelect = (index, prodId) => {
    const prod = products.find((p) => String(p.id) === String(prodId));
    const newLines = [...lines];
    newLines[index].productId = prodId;
    newLines[index].variantId = '';
    newLines[index].unitPrice = prod ? prod.salesPrice : 0;
    setLines(newLines);
  };

  const handleVariantSelect = (index, variantId) => {
    const newLines = [...lines];
    newLines[index].variantId = variantId;
    const prod = products.find((p) => String(p.id) === String(newLines[index].productId));
    if (prod && variantId) {
      const v = prod.variants?.find((varItem) => String(varItem.id) === String(variantId));
      if (v) {
        newLines[index].unitPrice = Number(prod.salesPrice) + Number(v.additionalPrice);
      }
    } else if (prod) {
      newLines[index].unitPrice = prod.salesPrice;
    }
    setLines(newLines);
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    if (!customerId || !planId) {
      toast.warning('Please select a customer and plan');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        customerId: Number(customerId),
        planId: Number(planId),
        startDate,
        paymentTerms,
        notes,
        lines: lines.map((l) => ({
          productId: Number(l.productId),
          variantId: l.variantId ? Number(l.variantId) : null,
          quantity: Number(l.quantity) || 1,
          unitPrice: Number(l.unitPrice) || 0,
          taxRate: Number(l.taxRate) || 0,
          discountAmount: Number(l.discountAmount) || 0,
        })),
      };

      await subscriptionService.createSubscription(payload);
      toast.success('Subscription contract created!');
      setCreateModalOpen(false);
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.message || 'Failed to create subscription');
    } finally {
      setSaving(false);
    }
  };

  // State Machine Action Handlers
  const handleConfirm = async (id) => {
    try {
      await subscriptionService.confirmSubscription(id);
      toast.success('Subscription confirmed');
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleActivate = async (id) => {
    try {
      await subscriptionService.activateSubscription(id);
      toast.success('Subscription ACTIVATED and ready for automated billing!');
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePause = async (id) => {
    const reason = prompt('Please enter a reason for pausing this subscription:', 'Customer request temporary hold');
    if (reason === null) return;
    try {
      await subscriptionService.pauseSubscription(id, reason);
      toast.info('Subscription paused');
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResume = async (id) => {
    try {
      await subscriptionService.resumeSubscription(id);
      toast.success('Subscription resumed to ACTIVE state');
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleClose = async (id) => {
    const reason = prompt('Reason for contract closure:', 'Completed terms');
    if (reason === null) return;
    try {
      await subscriptionService.closeSubscription(id, reason);
      toast.warning('Subscription marked as CLOSED');
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt('Reason for cancellation:', 'Customer churn');
    if (reason === null) return;
    try {
      await subscriptionService.cancelSubscription(id, reason);
      toast.error('Subscription CANCELLED');
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRenew = async (id) => {
    try {
      await subscriptionService.renewSubscription(id);
      toast.success('Subscription renewed for next cycle!');
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openDetails = async (id) => {
    try {
      const res = await subscriptionService.getSubscriptionById(id);
      setSelectedSub(res);
      setDetailsModalOpen(true);
    } catch (err) {
      toast.error('Failed to load subscription details');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Repeat className="w-6 h-6 text-brand-600" />
            Recurring Subscriptions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            State-machine governed contracts: Draft → Quotation → Confirmed → Active → Closed / Paused
          </p>
        </div>

        {(isAdmin || isStaff) && (
          <button
            onClick={() => {
              setCustomerId('');
              setPlanId('');
              setLines([
                { productId: '', variantId: '', quantity: 1, unitPrice: 0, taxRate: 18, discountAmount: 0 },
              ]);
              setCreateModalOpen(true);
            }}
            className="btn-primary text-xs py-2"
          >
            <Plus className="w-4 h-4" />
            New Subscription
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search sub # or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:border-brand-500"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="PAUSED">PAUSED</option>
          <option value="CLOSED">CLOSED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <div className="card-container overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading subscriptions..." />
        ) : subscriptions.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No Subscriptions Found"
            description="Active recurring billing schedules will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="table-th">Subscription #</th>
                  <th className="table-th">Customer</th>
                  <th className="table-th">Plan</th>
                  <th className="table-th">Next Billing Date</th>
                  <th className="table-th">Recurring Total</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td font-bold text-brand-700">
                      <button
                        onClick={() => openDetails(sub.id)}
                        className="hover:underline text-left"
                      >
                        {sub.subscriptionNumber}
                      </button>
                    </td>
                    <td className="table-td font-medium text-slate-900">{sub.customerName}</td>
                    <td className="table-td text-xs text-slate-700">{sub.planName}</td>
                    <td className="table-td text-xs font-semibold text-slate-800">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(sub.nextBillingDate)}
                      </span>
                    </td>
                    <td className="table-td font-semibold text-slate-900">
                      {formatCurrency(sub.totalAmount)}
                    </td>
                    <td className="table-td">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDetails(sub.id)}
                          title="View Details & Audit Log"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(isAdmin || isStaff) && (
                          <>
                            {sub.status === 'DRAFT' && (
                              <button
                                onClick={() => handleConfirm(sub.id)}
                                title="Confirm Contract"
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                              </button>
                            )}

                            {sub.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleActivate(sub.id)}
                                title="Activate & Schedule Billing"
                                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" /> Activate
                              </button>
                            )}

                            {sub.status === 'ACTIVE' && (
                              <>
                                <button
                                  onClick={() => handlePause(sub.id)}
                                  title="Pause Subscription"
                                  className="p-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100"
                                >
                                  <Pause className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleClose(sub.id)}
                                  title="Close Subscription"
                                  className="p-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {sub.status === 'PAUSED' && (
                              <button
                                onClick={() => handleResume(sub.id)}
                                title="Resume Subscription"
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" /> Resume
                              </button>
                            )}

                            {sub.status === 'CLOSED' && (
                              <button
                                onClick={() => handleRenew(sub.id)}
                                title="Renew for another term"
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Renew
                              </button>
                            )}
                          </>
                        )}

                        {/* Customer / Staff cancellation */}
                        {(sub.status === 'ACTIVE' || sub.status === 'PAUSED') && (
                          <button
                            onClick={() => handleCancel(sub.id)}
                            title="Cancel Contract"
                            className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
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

      {/* Subscription Detail & Audit Log Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Subscription: ${selectedSub?.subscriptionNumber}`}
        subtitle={`Contract for ${selectedSub?.customerName}`}
        maxWidth="max-w-3xl"
      >
        {selectedSub && (
          <div className="space-y-5 text-xs">
            {/* Status & Billing dates banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-400 block">Status:</span>
                <StatusBadge status={selectedSub.status} className="mt-1" />
              </div>
              <div>
                <span className="text-slate-400 block">Cadence:</span>
                <span className="font-semibold text-slate-800">{selectedSub.billingFrequency}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Next Billing:</span>
                <span className="font-semibold text-brand-700">
                  {formatDate(selectedSub.nextBillingDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Terms:</span>
                <span className="font-semibold text-slate-800">{selectedSub.paymentTerms}</span>
              </div>
            </div>

            {/* Itemized Lines */}
            <div>
              <p className="font-semibold text-slate-800 mb-2">Contract Line Items</p>
              <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">Tax (Rate/Amt)</th>
                    <th className="px-3 py-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {selectedSub.lines?.map((line) => (
                    <tr key={line.id}>
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">{line.productName}</div>
                        {line.variantName && (
                          <div className="text-[11px] text-brand-600 font-semibold">
                            Variant: {line.variantName}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">{line.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(line.unitPrice)}</td>
                      <td className="px-3 py-2 text-right text-slate-500">
                        {line.taxRate}% ({formatCurrency(line.taxAmount)})
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {formatCurrency(line.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subscription History State Transition Trail */}
            <div>
              <p className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-brand-600" />
                State Machine Transition Audit Log
              </p>
              {selectedSub.history && selectedSub.history.length > 0 ? (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white max-h-48 overflow-y-auto">
                  {selectedSub.history.map((hist) => (
                    <div key={hist.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={hist.previousState} />
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <StatusBadge status={hist.newState} />
                        </div>
                        {hist.reason && (
                          <p className="text-[11px] text-slate-500 mt-1">Reason: {hist.reason}</p>
                        )}
                      </div>
                      <div className="text-right text-slate-400">
                        <p className="font-medium text-slate-700">{hist.changedBy || 'System'}</p>
                        <p className="text-[10px]">{formatDateTime(hist.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  Initial contract creation record
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Subscription Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Recurring Subscription"
        subtitle="Initialize contract terms, pricing lines, and schedule"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateSubscription} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Customer *</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 text-sm p-2 bg-white"
                required
              >
                <option value="">Select Customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName || c.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Cadence Plan *</label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 text-sm p-2 bg-white"
                required
              >
                <option value="">Select Plan...</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.planName}
                  </option>
                ))}
              </select>
            </div>

            <FormInput
              id="startDate"
              label="Contract Start Date *"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {/* Line items builder */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Subscription Products &amp; Surcharges
              </label>
              <button
                type="button"
                onClick={() =>
                  setLines([
                    ...lines,
                    { productId: '', variantId: '', quantity: 1, unitPrice: 0, taxRate: 18, discountAmount: 0 },
                  ])
                }
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto p-1">
              {lines.map((line, idx) => {
                const prod = products.find((p) => String(p.id) === String(line.productId));
                const variants = prod?.variants || [];

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="sm:col-span-4">
                      <select
                        value={line.productId}
                        onChange={(e) => handleProductSelect(idx, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 p-1.5 bg-white text-xs"
                        required
                      >
                        <option value="">Select Product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <select
                        value={line.variantId}
                        onChange={(e) => handleVariantSelect(idx, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 p-1.5 bg-white text-xs"
                        disabled={variants.length === 0}
                      >
                        <option value="">Base Product</option>
                        {variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.variantName} (+₹{v.additionalPrice})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 p-1.5 bg-white text-xs text-center"
                        title="Quantity"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) => handleLineChange(idx, 'unitPrice', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 p-1.5 bg-white text-xs text-right"
                        title="Unit Price"
                      />
                    </div>

                    <div className="sm:col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => lines.length > 1 && setLines(lines.filter((_, i) => i !== idx))}
                        disabled={lines.length === 1}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Creating Subscription...' : 'Create Subscription'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
