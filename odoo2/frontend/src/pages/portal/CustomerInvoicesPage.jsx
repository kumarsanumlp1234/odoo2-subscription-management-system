import React, { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoiceService';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Receipt, Download, Eye, Calendar, Printer } from 'lucide-react';

export const CustomerInvoicesPage = () => {
  const toast = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoiceService.getInvoices({ size: 50 });
      setInvoices(res.content || []);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (id, invNum) => {
    try {
      await invoiceService.downloadPdf(id, invNum);
      toast.success('Invoice PDF downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Download failed');
    }
  };

  const openDetails = async (id) => {
    try {
      const res = await invoiceService.getInvoiceById(id);
      setSelectedInvoice(res);
      setModalOpen(true);
    } catch (e) {
      toast.error('Could not load invoice details');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Receipt className="w-6 h-6 text-brand-600" />
          My Invoices &amp; Statements
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review itemized tax billing statements and download official signed PDFs
        </p>
      </div>

      <div className="card-container overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading your invoices..." />
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No Invoices Issued"
            description="You do not have any billing cycle invoices generated yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="table-th">Invoice #</th>
                  <th className="table-th">Billing Period</th>
                  <th className="table-th">Issue Date</th>
                  <th className="table-th">Due Date</th>
                  <th className="table-th">Total Amount</th>
                  <th className="table-th">Balance Due</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">PDF Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td font-bold text-brand-700">
                      <button onClick={() => openDetails(inv.id)} className="hover:underline">
                        {inv.invoiceNumber}
                      </button>
                    </td>
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
                        <span className="text-emerald-600">Settled</span>
                      )}
                    </td>
                    <td className="table-td">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDetails(inv.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)}
                          className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Tax Invoice: ${selectedInvoice?.invoiceNumber}`}
        subtitle="Official Brightloop Billing Statement"
        maxWidth="max-w-2xl"
      >
        {selectedInvoice && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <p className="font-bold text-slate-900 text-sm">Brightloop Software Inc.</p>
                <p className="text-slate-500">GSTIN: 29AAACB1234F1Z5</p>
              </div>
              <StatusBadge status={selectedInvoice.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Billing Period:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(selectedInvoice.billingPeriodStart)} to{' '}
                  {formatDate(selectedInvoice.billingPeriodEnd)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Due Date:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(selectedInvoice.dueDate)}
                </span>
              </div>
            </div>

            {/* Lines */}
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
              {selectedInvoice.lines?.map((line) => (
                <div key={line.id} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{line.productName}</p>
                    {line.variantName && (
                      <p className="text-[11px] text-brand-600">Variant: {line.variantName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(line.lineTotal)}</p>
                    <p className="text-[10px] text-slate-500">Tax: {line.taxRate}%</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-right font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span>{formatCurrency(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax:</span>
                <span>+{formatCurrency(selectedInvoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-200">
                <span>Total Amount:</span>
                <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-700">
                <span>Balance Due:</span>
                <span>{formatCurrency(selectedInvoice.balanceDue)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-secondary text-xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadPdf(selectedInvoice.id, selectedInvoice.invoiceNumber)
                  }
                  className="btn-primary text-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
