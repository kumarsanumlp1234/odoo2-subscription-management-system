import React, { useState, useEffect } from 'react';
import { taxService } from '../../services/taxService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/forms/FormInput';
import { SelectInput } from '../../components/forms/SelectInput';
import { ReceiptText, Plus, Edit2, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const TaxListPage = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & form states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    taxName: '',
    taxRate: '',
    taxType: 'PERCENTAGE',
    description: '',
  });

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const res = await taxService.getAllTaxes();
      setTaxes(res || []);
    } catch (err) {
      toast.error('Failed to load taxes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tax = null) => {
    if (tax) {
      setSelectedTax(tax);
      setFormData({
        taxName: tax.taxName,
        taxRate: tax.taxRate,
        taxType: tax.taxType || 'PERCENTAGE',
        description: tax.description || '',
      });
    } else {
      setSelectedTax(null);
      setFormData({
        taxName: '',
        taxRate: '',
        taxType: 'PERCENTAGE',
        description: '',
      });
    }
    setModalOpen(true);
  };

  const handleSaveTax = async (e) => {
    e.preventDefault();
    if (!formData.taxName || !formData.taxRate) {
      toast.warning('Tax Name and Rate are required');
      return;
    }

    try {
      setSaving(true);
      if (selectedTax) {
        await taxService.updateTax(selectedTax.id, formData);
        toast.success('Tax rule updated');
      } else {
        await taxService.createTax(formData);
        toast.success('Tax rule created');
      }
      setModalOpen(false);
      fetchTaxes();
    } catch (err) {
      toast.error(err.message || 'Failed to save tax');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ReceiptText className="w-6 h-6 text-brand-600" />
            Tax Configuration &amp; Compliance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Admin-controlled GST rates, CGST, SGST, IGST percentage rules for SaaS invoices
          </p>
        </div>

        {isAdmin && (
          <button onClick={() => handleOpenModal()} className="btn-primary text-xs py-2">
            <Plus className="w-4 h-4" />
            New Tax Rule
          </button>
        )}
      </div>

      <div className="card-container overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading tax rules..." />
        ) : taxes.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="No Taxes Defined"
            description="Configure GST percentage brackets for invoicing."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="table-th">Tax Name</th>
                  <th className="table-th">Rate (%)</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Description</th>
                  <th className="table-th">Status</th>
                  {isAdmin && <th className="table-th text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {taxes.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-td font-semibold text-slate-900">{t.taxName}</td>
                    <td className="table-td font-bold text-brand-700 text-sm">{t.taxRate}%</td>
                    <td className="table-td">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {t.taxType}
                      </span>
                    </td>
                    <td className="table-td text-xs text-slate-500 max-w-sm truncate">
                      {t.description || '—'}
                    </td>
                    <td className="table-td">
                      <StatusBadge status={t.active ? 'ACTIVE' : 'CLOSED'} />
                    </td>
                    {isAdmin && (
                      <td className="table-td text-right">
                        <button
                          onClick={() => handleOpenModal(t)}
                          title="Edit Tax"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedTax ? 'Edit Tax Rule' : 'Create Tax Rule'}
        subtitle="Set percentage rate and description"
      >
        <form onSubmit={handleSaveTax} className="space-y-4">
          <FormInput
            id="taxName"
            label="Tax Name"
            placeholder="e.g. GST 18% (Standard SaaS)"
            value={formData.taxName}
            onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="taxRate"
              label="Tax Rate (%)"
              type="number"
              step="0.01"
              placeholder="18.00"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
              required
            />

            <SelectInput
              id="taxType"
              label="Tax Type"
              options={[{ value: 'PERCENTAGE', label: 'PERCENTAGE (%)' }]}
              value={formData.taxType}
              onChange={(e) => setFormData({ ...formData, taxType: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Description</label>
            <textarea
              rows={2}
              className="block w-full rounded-lg border border-slate-200 text-xs p-2.5"
              placeholder="Legal citation or application scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {saving ? 'Saving...' : selectedTax ? 'Update Tax' : 'Create Tax'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
