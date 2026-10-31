import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  CalendarCheck2,
  FileText,
  Repeat,
  Receipt,
  CreditCard,
  Percent,
  ReceiptText,
  BarChart3,
  UserCheck,
  Settings,
  Sparkles,
  UserCircle,
  HelpCircle,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin, isStaff, isCustomer } = useAuth();

  // Navigation items based on RBAC rules
  const adminNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Subscription Plans', path: '/plans', icon: CalendarCheck2 },
    { name: 'Quotations', path: '/quotations', icon: FileText },
    { name: 'Subscriptions', path: '/subscriptions', icon: Repeat },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Discounts', path: '/discounts', icon: Percent },
    { name: 'Taxes', path: '/taxes', icon: ReceiptText },
    { name: 'Financial Reports', path: '/reports', icon: BarChart3 },
    { name: 'Staff Management', path: '/staff', icon: UserCheck },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  const staffNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Quotations', path: '/quotations', icon: FileText },
    { name: 'Subscriptions', path: '/subscriptions', icon: Repeat },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Payments', path: '/payments', icon: CreditCard },
  ];

  const customerNavItems = [
    { name: 'Overview', path: '/portal/overview', icon: LayoutDashboard },
    { name: 'My Subscriptions', path: '/portal/subscriptions', icon: Repeat },
    { name: 'My Invoices', path: '/portal/invoices', icon: Receipt },
    { name: 'Payment History', path: '/portal/payments', icon: CreditCard },
    { name: 'My Profile', path: '/portal/profile', icon: UserCircle },
  ];

  let navItems = isCustomer ? customerNavItems : isStaff ? staffNavItems : adminNavItems;

  const roleLabel = isAdmin ? 'Administrator' : isStaff ? 'Operations Staff' : 'Customer';
  const roleBadgeColor = isAdmin
    ? 'bg-purple-900/60 text-purple-300 border-purple-700/50'
    : isStaff
    ? 'bg-blue-900/60 text-blue-300 border-blue-700/50'
    : 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50';

  return (
    <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 selection:bg-brand-500">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80 bg-slate-900/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white text-base tracking-tight leading-tight">
            Brightloop
          </span>
          <span className="text-[10px] uppercase font-semibold text-brand-400 tracking-wider">
            Subscription OS
          </span>
        </div>
      </div>

      {/* User Role Tag */}
      <div className="px-6 py-3 border-b border-slate-800/60 bg-slate-900/30 flex items-center justify-between">
        <div className="truncate">
          <p className="text-xs font-medium text-white truncate">{user?.fullName || 'User'}</p>
          <span
            className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}
          >
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Brightloop v1.0 Enterprise</span>
        <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="API Connected" />
      </div>
    </aside>
  );
};
