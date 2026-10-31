import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionService } from '../../services/subscriptionService';
import { invoiceService } from '../../services/invoiceService';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DashboardCard } from '../../components/common/DashboardCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Repeat,
  Calendar,
  AlertCircle,
  Receipt,
  CreditCard,
  Download,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const CustomerOverviewPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [subRes, invRes, payRes] = await Promise.all([
        subscriptionService.getSubscriptions({ size: 5 }),
        invoiceService.getInvoices({ size: 5 }),
        paymentService.getPayments({ size: 5 }),
      ]);
      setSubscriptions(subRes.content || []);
      setInvoices(invRes.content || []);
      setPayments(payRes.content || []);
    } catch (err) {
      toast.error('Failed to load customer portal metrics');
    } finally {
      setLoading(false);
    }
  };

  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE');
  const outstandingAmount = invoices.reduce((sum, inv) => sum + (Number(inv.balanceDue) || 0), 0);
  const nextBillingSub = activeSubs[0];

  const handleDownloadPdf = async (id, invNum) => {
    try {
      await invoiceService.downloadPdf(id, invNum);
      toast.success('Invoice PDF downloaded');
    } catch (err) {
      toast.error('Could not download PDF');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading customer portal overview..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome, {user?.fullName || 'Valued Customer'}!
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Customer Portal
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your digital subscriptions, download invoices, and track payment receipts
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="Active Subscriptions"
          value={activeSubs.length}
          subtitle={`Total plans enrolled: ${subscriptions.length}`}
          icon={Repeat}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
        />

        <DashboardCard
          title="Next Scheduled Renewal"
          value={nextBillingSub ? formatDate(nextBillingSub.nextBillingDate) : 'None'}
          subtitle={nextBillingSub ? `${nextBillingSub.planName}` : 'No upcoming billings'}
          icon={Calendar}
          iconColor="text-brand-600"
          iconBg="bg-brand-50 border-brand-100"
        />

        <DashboardCard
          title="Current Balance Due"
          value={formatCurrency(outstandingAmount)}
          subtitle={outstandingAmount > 0 ? 'Pending invoice payments' : 'All accounts settled'}
          icon={AlertCircle}
          iconColor={outstandingAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}
          iconBg={outstandingAmount > 0 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}
        />
      </div>

      {/* Recent Invoices Card */}
      <div className="card-container p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Invoices &amp; Statements
            </h3>
            <p className="text-xs text-slate-500">Download official tax invoices as PDF</p>
          </div>
          <Link
            to="/portal/invoices"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View All Invoices <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {invoices.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No invoices generated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Invoice #</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Period</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Due Date</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600">Total</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600">Balance</th>
                  <th className="px-3 py-2 text-center font-semibold text-slate-600">Status</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-bold text-brand-700">{inv.invoiceNumber}</td>
                    <td className="px-3 py-2 text-slate-500">
                      {formatDate(inv.billingPeriodStart)} – {formatDate(inv.billingPeriodEnd)}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{formatDate(inv.dueDate)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-900">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-rose-600">
                      {formatCurrency(inv.balanceDue)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)}
                        className="p-1 rounded text-brand-600 hover:bg-brand-50"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Subscriptions Card */}
      <div className="card-container p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Enrolled Subscriptions
            </h3>
            <p className="text-xs text-slate-500">Recurring services currently active</p>
          </div>
          <Link
            to="/portal/subscriptions"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Manage Subscriptions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {subscriptions.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No subscriptions enrolled.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-700 text-sm">
                    {sub.subscriptionNumber}
                  </span>
                  <StatusBadge status={sub.status} />
                </div>
                <p className="font-semibold text-slate-800 text-sm">{sub.planName}</p>
                <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-200">
                  <span>Next Renewal:</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(sub.nextBillingDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Recurring Rate:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(sub.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
