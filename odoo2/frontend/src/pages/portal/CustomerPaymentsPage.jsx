import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CreditCard, CheckCircle2, Calendar } from 'lucide-react';

export const CustomerPaymentsPage = () => {
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getPayments({ size: 50 });
      setPayments(res.content || []);
    } catch (err) {
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-brand-600" />
          My Payment History &amp; Receipts
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Settled transactions, bank wire receipts, and payment ledger entries
        </p>
      </div>

      <div className="card-container overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading your payment records..." />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No Payments Recorded"
            description="You do not have any transaction receipts on file."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="table-th">Payment Receipt #</th>
                  <th className="table-th">Invoice Settled</th>
                  <th className="table-th">Payment Method</th>
                  <th className="table-th">Transaction / UTR #</th>
                  <th className="table-th">Payment Date</th>
                  <th className="table-th">Amount Paid</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td font-bold text-brand-700">{p.paymentNumber}</td>
                    <td className="table-td font-semibold text-slate-800">{p.invoiceNumber}</td>
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
      </div>
    </div>
  );
};
