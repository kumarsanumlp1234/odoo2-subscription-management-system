import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/subscriptionService';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Repeat, Calendar, Eye, XCircle, Info, ShieldCheck } from 'lucide-react';

export const CustomerSubscriptionsPage = () => {
  const toast = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await subscriptionService.getSubscriptions({ size: 50 });
      setSubscriptions(res.content || []);
    } catch (err) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (id) => {
    const reason = prompt('Please let us know the reason for cancellation:');
    if (!reason) return;
    try {
      await subscriptionService.cancelSubscription(id, reason);
      toast.info('Subscription cancellation processed');
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel subscription');
    }
  };

  const openDetails = async (id) => {
    try {
      const res = await subscriptionService.getSubscriptionById(id);
      setSelectedSub(res);
      setModalOpen(true);
    } catch (e) {
      toast.error('Could not load details');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Repeat className="w-6 h-6 text-brand-600" />
          My Subscriptions
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Active contracts, scheduled billing dates, inclusions, and self-service management
        </p>
      </div>

      <div className="card-container overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading your subscriptions..." />
        ) : subscriptions.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No Subscriptions Enrolled"
            description="You do not have any active subscriptions yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="table-th">Subscription #</th>
                  <th className="table-th">Cadence Plan</th>
                  <th className="table-th">Start Date</th>
                  <th className="table-th">Next Billing Date</th>
                  <th className="table-th">Recurring Amount</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td font-bold text-brand-700">{sub.subscriptionNumber}</td>
                    <td className="table-td font-medium text-slate-900">{sub.planName}</td>
                    <td className="table-td text-xs text-slate-600">{formatDate(sub.startDate)}</td>
                    <td className="table-td text-xs font-semibold text-slate-800">
                      {formatDate(sub.nextBillingDate)}
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
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(sub.status === 'ACTIVE' || sub.status === 'PAUSED') && (
                          <button
                            onClick={() => handleCancelRequest(sub.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            title="Request Cancellation"
                          >
                            <XCircle className="w-4 h-4" />
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
      </div>

      {/* Subscription Details Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Subscription Details: ${selectedSub?.subscriptionNumber}`}
        subtitle={`Enrolled under ${selectedSub?.planName}`}
        maxWidth="max-w-2xl"
      >
        {selectedSub && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Status:</span>
                <StatusBadge status={selectedSub.status} className="mt-1" />
              </div>
              <div>
                <span className="text-slate-400 block">Next Renewal:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(selectedSub.nextBillingDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Recurring Rate:</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(selectedSub.totalAmount)}
                </span>
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-800 mb-2">Included Products &amp; Services</p>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                {selectedSub.lines?.map((line) => (
                  <div key={line.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{line.productName}</p>
                      {line.variantName && (
                        <p className="text-[11px] text-brand-600 font-medium">
                          Tier: {line.variantName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatCurrency(line.lineTotal)}</p>
                      <p className="text-[10px] text-slate-400">Qty: {line.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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
