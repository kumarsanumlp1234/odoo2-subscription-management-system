import React, { useState, useEffect } from 'react';
import { quotationService } from '../../services/quotationService';
import { customerService } from '../../services/customerService';
import { planService } from '../../services/planService';
import { productService } from '../../services/productService';
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
import {
  FileText,
  Plus,
  Search,
  Send,
  CheckCircle,
  XCircle,
  Repeat,
  ArrowRight,
  Eye,
  Trash2,
} from 'lucide-react';

export const QuotationListPage = () => {
  const { isAdmin, isStaff, isCustomer } = useAuth();
  const toast = useToast();

  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [saving, setSaving] = useState(false);

  // New Quotation form state
  const [customerId, setCustomerId] = useState('');
  const [planId, setPlanId] = useState('');
  const [validityDays, setValidityDays] = useState(15);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([
    { productId: '', variantId: '', quantity: 1, unitPrice: 0, taxRate: 18, discountAmount: 0 },
  ]);

  useEffect(() => {
    fetchQuotations();
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
      console.warn('Could not load quotation dropdowns', e);
    }
  };

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 15,
        search: search || undefined,
        status: statusFilter || undefined,
      };
      const res = await quotationService.getQuotations(params);
      setQuotations(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchQuotations();
  };

  const handleAddLine = () => {
    setLines([
      ...lines,
      { productId: '', variantId: '', quantity: 1, unitPrice: 0, taxRate: 18, discountAmount: 0 },
    ]);
  };

  const handleRemoveLine = (index) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, idx) => idx !== index));
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

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    if (!customerId || !planId) {
      toast.warning('Please select a Customer and Subscription Plan');
      return;
    }

    if (lines.some((l) => !l.productId)) {
      toast.warning('Please select a product for all line items');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        customerId: Number(customerId),
        planId: Number(planId),
        validityDays: Number(validityDays) || 15,
        notes,
        lineItems: lines.map((l) => ({
          productId: Number(l.productId),
          variantId: l.variantId ? Number(l.variantId) : null,
          quantity: Number(l.quantity) || 1,
          unitPrice: Number(l.unitPrice) || 0,
          taxRate: Number(l.taxRate) || 0,
          discountAmount: Number(l.discountAmount) || 0,
        })),
      };

      await quotationService.createQuotation(payload);
      toast.success('Quotation created successfully');
      setCreateModalOpen(false);
      fetchQuotations();
    } catch (err) {
      toast.error(err.message || 'Failed to create quotation');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (id) => {
    try {
      await quotationService.sendQuotation(id);
      toast.success('Quotation sent to customer');
      fetchQuotations();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAccept = async (id) => {
    try {
      await quotationService.acceptQuotation(id);
      toast.success('Quotation ACCEPTED!');
      fetchQuotations();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await quotationService.rejectQuotation(id);
      toast.warning('Quotation marked as REJECTED');
      fetchQuotations();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleConvertToSub = async (id) => {
    try {
      const res = await quotationService.convertToSubscription(id);
      toast.success(`Quotation successfully converted to Subscription: ${res.subscriptionNumber}!`);
      fetchQuotations();
    } catch (err) {
      toast.error(err.message || 'Conversion failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-600" />
            Quotations &amp; Proposals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Predefined templates, customer proposals, and 1-click conversion into active subscriptions
          </p>
        </div>

        {(isAdmin || isStaff) && (
          <button
            onClick={() => {
              setCustomerId('');
              setPlanId('');
              setValidityDays(15);
              setLines([
                { productId: '', variantId: '', quantity: 1, unitPrice: 0, taxRate: 18, discountAmount: 0 },
              ]);
              setCreateModalOpen(true);
            }}
            className="btn-primary text-xs py-2"
          >
            <Plus className="w-4 h-4" />
            New Quotation
          </button>
        )}
      </div>

      {/* Filter / Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by quote # or customer..."
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
          <option value="SENT">SENT</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>
      </div>

      {/* Table */}
      <div className="card-container overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading quotations..." />
        ) : quotations.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Quotations Found"
            description="Create quotations for potential clients and convert them to recurring billing upon agreement."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="table-th">Quote #</th>
                  <th className="table-th">Customer</th>
                  <th className="table-th">Subscription Plan</th>
                  <th className="table-th">Total Amount</th>
                  <th className="table-th">Valid Until</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td font-bold text-brand-700">{q.quotationNumber}</td>
                    <td className="table-td font-medium text-slate-900">{q.customerName}</td>
                    <td className="table-td text-xs text-slate-700">{q.planName}</td>
                    <td className="table-td font-semibold text-slate-900">
                      {formatCurrency(q.totalAmount)}
                    </td>
                    <td className="table-td text-xs text-slate-500">{formatDate(q.expiryDate)}</td>
                    <td className="table-td">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedQuotation(q);
                            setDetailsModalOpen(true);
                          }}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(isAdmin || isStaff) && q.status === 'DRAFT' && (
                          <button
                            onClick={() => handleSend(q.id)}
                            title="Send to Customer"
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                          >
                            <Send className="w-3 h-3" />
                            Send
                          </button>
                        )}

                        {q.status === 'SENT' && (
                          <>
                            <button
                              onClick={() => handleAccept(q.id)}
                              title="Mark Accepted"
                              className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(q.id)}
                              title="Mark Rejected"
                              className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {(isAdmin || isStaff) && q.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleConvertToSub(q.id)}
                            title="Convert to Live Subscription"
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
                          >
                            <Repeat className="w-3 h-3" />
                            Convert to Sub
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

      {/* Create Quotation Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Draft Subscription Quotation"
        subtitle="Snapshot pricing, line items, and validity duration"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4">
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
                    {c.companyName || c.fullName} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Plan Cadence *</label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 text-sm p-2 bg-white"
                required
              >
                <option value="">Select Plan...</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.planName} ({p.billingInterval} {p.billingFrequency})
                  </option>
                ))}
              </select>
            </div>

            <FormInput
              id="validityDays"
              label="Validity (Days)"
              type="number"
              min="1"
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
              required
            />
          </div>

          {/* Line Items Builder */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Quotation Line Items
              </label>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line
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
                        onClick={() => handleRemoveLine(idx)}
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

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Internal Notes</label>
            <textarea
              rows={2}
              className="block w-full rounded-lg border border-slate-200 text-xs p-2"
              placeholder="Terms and conditions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
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
              {saving ? 'Creating Quotation...' : 'Create Quotation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quotation Detail Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Quotation Details: ${selectedQuotation?.quotationNumber}`}
        subtitle={`Issued to ${selectedQuotation?.customerName}`}
        maxWidth="max-w-2xl"
      >
        {selectedQuotation && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-400 block">Status:</span>
                <StatusBadge status={selectedQuotation.status} className="mt-1" />
              </div>
              <div>
                <span className="text-slate-400 block">Cadence Plan:</span>
                <span className="font-semibold text-slate-800">{selectedQuotation.planName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Valid Until:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(selectedQuotation.expiryDate)}
                </span>
              </div>
            </div>

            {/* Line items list */}
            <div>
              <p className="font-semibold text-slate-800 mb-2">Itemized Lines</p>
              <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {selectedQuotation.lines?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">{item.productName}</div>
                        {item.variantName && (
                          <div className="text-[11px] text-brand-600 font-semibold">
                            Variant: {item.variantName}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {formatCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-right font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span>{formatCurrency(selectedQuotation.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax:</span>
                <span>+{formatCurrency(selectedQuotation.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Discount:</span>
                <span>-{formatCurrency(selectedQuotation.discount)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Amount:</span>
                <span>{formatCurrency(selectedQuotation.totalAmount)}</span>
              </div>
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
    </div>
  );
};
