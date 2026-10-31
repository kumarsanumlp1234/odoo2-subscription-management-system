/**
 * Currency, Date and Status formatting utilities
 */

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null) return '₹0.00';
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateStr;
  }
};

export const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'ACTIVE':
    case 'PAID':
    case 'ACCEPTED':
    case 'SUCCESS':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
    case 'CONFIRMED':
    case 'SENT':
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20';
    case 'PENDING':
    case 'DRAFT':
    case 'QUOTATION':
    case 'PARTIALLY_PAID':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
    case 'PAUSED':
      return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20';
    case 'OVERDUE':
    case 'FAILED':
    case 'REJECTED':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';
    case 'CLOSED':
    case 'CANCELLED':
    case 'REFUNDED':
    case 'EXPIRED':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20';
  }
};
