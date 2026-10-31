import React from 'react';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import { Modal } from './Modal';

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info'
  loading = false,
}) => {
  const iconMap = {
    danger: <AlertTriangle className="w-6 h-6 text-rose-600" />,
    warning: <AlertCircle className="w-6 h-6 text-amber-600" />,
    info: <HelpCircle className="w-6 h-6 text-brand-600" />,
  };

  const bgMap = {
    danger: 'bg-rose-50 border-rose-100',
    warning: 'bg-amber-50 border-amber-100',
    info: 'bg-brand-50 border-brand-100',
  };

  const btnClassMap = {
    danger: 'btn-danger',
    warning: 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 transition-all shadow-sm',
    info: 'btn-primary',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-3 rounded-xl border ${bgMap[type]} shrink-0`}>
          {iconMap[type]}
        </div>
        <div className="pt-1">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="btn-secondary"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={btnClassMap[type]}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};
