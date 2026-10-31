import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { customerService } from '../../services/customerService';
import { FormInput } from '../../components/forms/FormInput';
import { UserCircle, Building, Mail, Phone, MapPin, Save, ShieldCheck } from 'lucide-react';

export const CustomerProfilePage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    companyName: '',
    gstNumber: '',
    billingAddressLine1: '',
    city: '',
    state: '',
    postalCode: '',
  });

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const res = await customerService.getCustomerById(user.id);
      if (res) {
        setFormData({
          fullName: res.fullName || user.fullName || '',
          email: res.email || user.email || '',
          phoneNumber: res.phoneNumber || '',
          companyName: res.companyName || '',
          gstNumber: res.gstNumber || '',
          billingAddressLine1: res.billingAddressLine1 || '',
          city: res.city || '',
          state: res.state || '',
          postalCode: res.postalCode || '',
        });
      }
    } catch (e) {
      console.warn('Could not load detailed profile, using session defaults');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await customerService.updateCustomer(user.id, formData);
      toast.success('Profile and billing details updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-brand-600" />
          My Customer Account &amp; Billing Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Maintain your organization details, GSTIN number, and official invoicing address
        </p>
      </div>

      <div className="card-container p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="fullName"
              label="Contact Person Name *"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />

            <FormInput
              id="email"
              label="Work Email *"
              type="email"
              value={formData.email}
              disabled
              helperText="Managed by account credentials"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="phoneNumber"
              label="Direct Phone Number"
              placeholder="+91 9876543210"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />

            <FormInput
              id="companyName"
              label="Company Name"
              placeholder="Acme Technologies Pvt Ltd"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>

          <FormInput
            id="gstNumber"
            label="GSTIN Number (for B2B Input Tax Credit)"
            placeholder="29ABCDE1234F1Z5"
            value={formData.gstNumber}
            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
          />

          <FormInput
            id="billingAddressLine1"
            label="Billing Street Address"
            placeholder="Suite 404, Tech Park"
            value={formData.billingAddressLine1}
            onChange={(e) => setFormData({ ...formData, billingAddressLine1: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-3">
            <FormInput
              id="city"
              label="City"
              placeholder="Bengaluru"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />

            <FormInput
              id="state"
              label="State"
              placeholder="Karnataka"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />

            <FormInput
              id="postalCode"
              label="Postal Code"
              placeholder="560103"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary text-xs py-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
