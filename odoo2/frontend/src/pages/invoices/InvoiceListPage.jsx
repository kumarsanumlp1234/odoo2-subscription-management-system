import React, { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoiceService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Receipt,
  Download,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  CreditCard,
  Printer,
  Sparkles,
} from 'lucide-react';

export const InvoiceListPage = () => {
  const { isAdmin, isStaff, isCustomer } = useAuth();
  const toast = useToast();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Invoice Detail / Printable Modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [page, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 15,
        search: search || undefined,
        status: statusFilter || undefined,
      };
      const res = await invoiceService.getInvoices(params);
      setInvoices(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchInvoices();
  };

  const handleConfirm = async (id) => {
    try {
      await invoiceService.confirmInvoice(id);
      toast.success('Invoice confirmed');
      fetchInvoices();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSend = async (id) => {
    try {
      await invoiceService.sendInvoice(id);
      toast.success('Invoice sent to customer');
      fetchInvoices();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this invoice?')) return;
    try {
      await invoiceService.cancelInvoice(id);
      toast.warning('Invoice cancelled');
      fetchInvoices();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDownloadPdf = async (id, invNum) => {
    try {
      setDownloading(true);
      await invoiceService.downloadPdf(id, invNum);
      toast.success('Invoice PDF downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Could not download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const openInvoiceDetails = async (id) => {
    try {
      const res = await invoiceService.getInvoiceById(id);
      setSelectedInvoice(res);
      setDetailsModalOpen(true);
    } catch (err) {
      toast.error('Failed to load invoice details');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-brand-600" />
            Invoices &amp; Recurring Billing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated billing engine records, PDF statements, tax snapshots, and payment reconciliation
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice # or customer..."
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
          <option value="">All Invoice Statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="SENT">SENT</option>
          <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
          <option value="PAID">PAID</option>
          <option value="OVERDUE">OVERDUE</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Invoices Table Card */}
      <div className="card-container overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading invoices..." />
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No Invoices Recorded"
            description="Recurring billing generator or subscriptions will automatically create cycle invoices here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="table-th">Invoice #</th>
                  <th className="table-th">Customer</th>
                  <th className="table-th">Billing Cycle Period</th>
                  <th className="table-th">Issue Date</th>
                  <th className="table-th">Due Date</th>
                  <th className="table-th">Total Amount</th>
                  <th className="table-th">Balance Due</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td font-bold text-brand-700">
                      <button
                        onClick={() => openInvoiceDetails(inv.id)}
                        className="hover:underline text-left"
                      >
                        {inv.invoiceNumber}
                      </button>
                    </td>
                    <td className="table-td font-medium text-slate-900">{inv.customerName}</td>
                    <td className="table-td text-xs text-slate-500">
                      {formatDate(inv.billingPeriodStart)} – {formatDate(inv.billingPeriodEnd)}
                    </td>
                    <td className="table-td text-xs text-slate-600">{formatDate(inv.issueDate)}</td>
                    <td className="table-td text-xs text-slate-600">{formatDate(inv.dueDate)}</td>
                    <td className="table-td font-semibold text-slate-900">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="table-td font-semibold">
                      {inv.balanceDue > 0 ? (
                        <span className="text-rose-600">{formatCurrency(inv.balanceDue)}</span>
                      ) : (
                        <span className="text-emerald-600">Settled (₹0.00)</span>
                      )}
                    </td>
                    <td className="table-td">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openInvoiceDetails(inv.id)}
                          title="View Statement"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)}
                          title="Download PDF"
                          disabled={downloading}
                          className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {(isAdmin || isStaff) && (
                          <>
                            {inv.status === 'DRAFT' && (
                              <button
                                onClick={() => handleConfirm(inv.id)}
                                title="Confirm Invoice"
                                className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            {inv.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleSend(inv.id)}
                                title="Send Invoice"
                                className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}

                            {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleCancel(inv.id)}
                                title="Cancel Invoice"
                                className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </>
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

      {/* Invoice Detail / Statement Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Tax Invoice: ${selectedInvoice?.invoiceNumber}`}
        subtitle="Brightloop Software — Official Billing Statement"
        maxWidth="max-w-3xl"
      >
        {selectedInvoice && (
          <div className="space-y-6 text-xs" id="invoice-printable-area">
            {/* Header info */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div>
                <h4 className="text-base font-bold text-slate-900">Brightloop Software Inc.</h4>
                <p className="text-slate-500">Enterprise Recurring Cloud Solutions</p>
                <p className="text-slate-500">GSTIN: 29AAACB1234F1Z5</p>
                <p className="text-slate-500">billing@brightloop.io</p>
              </div>
              <div className="text-right">
                <StatusBadge status={selectedInvoice.status} className="mb-2" />
                <p className="font-bold text-slate-900 text-sm">{selectedInvoice.invoiceNumber}</p>
                <p className="text-slate-500">Issue Date: {formatDate(selectedInvoice.issueDate)}</p>
                <p className="text-slate-500">Due Date: {formatDate(selectedInvoice.dueDate)}</p>
              </div>
            </div>

            {/* Billed To / Billing Period */}
            <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                  Billed To:
                </span>
                <p className="font-bold text-slate-900 text-sm">{selectedInvoice.customerName}</p>
                {selectedInvoice.subscriptionNumber && (
                  <p className="text-brand-700 font-semibold mt-1">
                    Subscription: {selectedInvoice.subscriptionNumber}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                  Billing Period:
                </span>
                <p className="font-semibold text-slate-800">
                  {formatDate(selectedInvoice.billingPeriodStart)} to{' '}
                  {formatDate(selectedInvoice.billingPeriodEnd)}
                </p>
              </div>
            </div>

            {/* Invoice Line Items */}
            <div>
              <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">Tax (Rate/Amt)</th>
                    <th className="px-3 py-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {selectedInvoice.lines?.map((line) => (
                    <tr key={line.id}>
                      <td className="px-3 py-2">
                        <div className="font-semibold text-slate-900">{line.productName}</div>
                        {line.variantName && (
                          <div className="text-[11px] text-brand-600 font-medium">
                            Variant: {line.variantName}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center font-medium">{line.quantity}</td>
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

            {/* Financial Summary */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-right">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax Amount:</span>
                  <span className="font-medium">+{formatCurrency(selectedInvoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Discounts:</span>
                  <span className="font-medium text-emerald-600">
                    -{formatCurrency(selectedInvoice.discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>Paid to Date:</span>
                  <span className="text-emerald-700 font-semibold">
                    {formatCurrency(selectedInvoice.paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-rose-700 pt-1 border-t border-slate-200">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(selectedInvoice.balanceDue)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-secondary text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Statement
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadPdf(selectedInvoice.id, selectedInvoice.invoiceNumber)
                  }
                  className="btn-primary text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
