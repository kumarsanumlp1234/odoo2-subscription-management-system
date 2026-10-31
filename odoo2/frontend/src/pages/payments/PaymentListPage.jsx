import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import { invoiceService } from '../../services/invoiceService';
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
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Wallet,
  Receipt,
  FileCheck,
} from 'lucide-react';

export const PaymentListPage = () => {
  const { isAdmin, isStaff } = useAuth();
  const toast = useToast();

  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Record Payment Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: '',
    paymentMethod: 'UPI',
    transactionReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchPayments();
  }, [page]);

  useEffect(() => {
    if (isAdmin || isStaff) {
      loadInvoices();
    }
  }, [isAdmin, isStaff]);

  const loadInvoices = async () => {
    try {
      const res = await invoiceService.getInvoices({ size: 100 });
      // Only invoices with balance due or confirmed/sent
      setInvoices(res.content || []);
    } catch (e) {
      console.warn('Could not load invoices for payment', e);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 15,
        search: search || undefined,
      };
      const res = await paymentService.getPayments(params);
      setPayments(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchPayments();
  };

  const handleInvoiceChange = (invId) => {
    const inv = invoices.find((i) => String(i.id) === String(invId));
    setSelectedInvoice(inv);
    setFormData({
      ...formData,
      invoiceId: invId,
      amount: inv ? inv.balanceDue || inv.totalAmount : '',
      transactionReference: `TXN-${Date.now().toString().slice(-6)}`,
    });
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!formData.invoiceId || !formData.amount || !formData.transactionReference) {
      toast.warning('Invoice, Amount, and Transaction Reference are required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        invoiceId: Number(formData.invoiceId),
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        transactionReference: formData.transactionReference,
        paymentDate: formData.paymentDate,
        notes: formData.notes,
      };

      await paymentService.recordPayment(payload);
      toast.success('Payment recorded successfully! Invoice balance updated.');
      setModalOpen(false);
      fetchPayments();
      loadInvoices();
    } catch (err) {
      toast.error(err.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-brand-600" />
            Payment Collections &amp; Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cash, UPI, NEFT/Bank Transfer, and credit card settlements with balance reconciliation
          </p>
        </div>

        {(isAdmin || isStaff) && (
          <button
            onClick={() => {
              setSelectedInvoice(null);
              setFormData({
                invoiceId: '',
                amount: '',
                paymentMethod: 'UPI',
                transactionReference: `TXN-${Date.now().toString().slice(-6)}`,
                paymentDate: new Date().toISOString().split('T')[0],
                notes: '',
              });
              setModalOpen(true);
            }}
            className="btn-primary text-xs py-2"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search payment #, ref, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </form>
      </div>

      {/* Table */}
      <div className="card-container overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading payment transactions..." />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No Payments Recorded"
            description="Incoming payments against customer invoices will appear in this ledger."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="table-th">Payment #</th>
                  <th className="table-th">Customer</th>
                  <th className="table-th">Invoice Ref</th>
                  <th className="table-th">Method</th>
                  <th className="table-th">Transaction ID</th>
                  <th className="table-th">Payment Date</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td font-bold text-brand-700">{p.paymentNumber}</td>
                    <td className="table-td font-medium text-slate-900">{p.customerName}</td>
                    <td className="table-td text-xs font-semibold text-slate-700">
                      {p.invoiceNumber}
                    </td>
                    <td className="table-td">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="table-td text-xs font-mono text-slate-500">
                      {p.transactionReference}
                    </td>
                    <td className="table-td text-xs text-slate-600">{formatDate(p.paymentDate)}</td>
                    <td className="table-td font-bold text-emerald-700">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="table-td">
                      <StatusBadge status={p.status} />
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

      {/* Record Payment Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Customer Payment"
        subtitle="Match funds to invoice and auto-reconcile balance"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Target Invoice *</label>
            <select
              value={formData.invoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 text-sm p-2 bg-white"
              required
            >
              <option value="">Select Invoice to settle...</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} – {inv.customerName} (Bal: {formatCurrency(inv.balanceDue)}) [
                  {inv.status}]
                </option>
              ))}
            </select>
          </div>

          {selectedInvoice && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <p className="text-slate-500">Invoice Total:</p>
                <p className="font-semibold text-slate-800">
                  {formatCurrency(selectedInvoice.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Already Paid:</p>
                <p className="font-semibold text-emerald-600">
                  {formatCurrency(selectedInvoice.paidAmount)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Outstanding Balance:</p>
                <p className="font-bold text-rose-600">
                  {formatCurrency(selectedInvoice.balanceDue)}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="amount"
              label="Settlement Amount (₹) *"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />

            <SelectInput
              id="paymentMethod"
              label="Payment Method *"
              options={[
                { value: 'UPI', label: 'UPI / QR Code' },
                { value: 'BANK_TRANSFER', label: 'NEFT / RTGS / Bank Wire' },
                { value: 'CARD', label: 'Credit / Debit Card' },
                { value: 'CASH', label: 'Cash Receipt' },
                { value: 'OTHER', label: 'Other Gateway' },
              ]}
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="transactionReference"
              label="Transaction Ref / UTR *"
              placeholder="e.g. UPI-1234567890"
              value={formData.transactionReference}
              onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
              required
            />

            <FormInput
              id="paymentDate"
              label="Payment Date *"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Payment Notes</label>
            <textarea
              rows={2}
              className="block w-full rounded-lg border border-slate-200 text-xs p-2"
              placeholder="Remittance details, bank reference notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              {saving ? 'Recording...' : 'Confirm & Record Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
