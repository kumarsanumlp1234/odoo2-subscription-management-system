import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dashboardService } from '../../services/dashboardService';
import {
  Bell,
  Play,
  LogOut,
  User,
  ChevronDown,
  Loader2,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin, isStaff } = useAuth();
  const toast = useToast();
  const [runningBilling, setRunningBilling] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleRunBilling = async () => {
    try {
      setRunningBilling(true);
      const res = await dashboardService.triggerBillingCycle();
      toast.success(
        `Automated billing cycle executed! Generated ${res.invoicesGenerated || 0} invoice(s).`
      );
    } catch (err) {
      toast.error(err.message || 'Failed to trigger billing cycle');
    } finally {
      setRunningBilling(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left section: status breadcrumb */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
          Production Workspace
        </span>
        <span className="hidden md:inline text-xs text-slate-400">
          Subscription Management Platform
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Trigger Automated Billing Scheduler Button for Admin/Staff */}
        {(isAdmin || isStaff) && (
          <button
            onClick={handleRunBilling}
            disabled={runningBilling}
            title="Trigger Automated Daily Recurring Billing Scheduler now"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors shadow-sm disabled:opacity-50"
          >
            {runningBilling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{runningBilling ? 'Billing...' : 'Run Billing Engine'}</span>
          </button>
        )}

        {/* Notifications Icon */}
        <button
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
              {user?.fullName ? user.fullName.substring(0, 2) : 'BL'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.fullName || 'User'}
              </p>
              <p className="text-[11px] text-slate-400 leading-tight">{user?.email}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 hidden md:block" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-40">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-medium text-slate-500">Signed in as</p>
                  <p className="text-xs font-semibold text-slate-800 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
