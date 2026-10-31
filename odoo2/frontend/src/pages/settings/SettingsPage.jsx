import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dashboardService } from '../../services/dashboardService';
import {
  Settings,
  Server,
  Database,
  Clock,
  ShieldCheck,
  Mail,
  Building,
  Save,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [testingCron, setTestingCron] = useState(false);

  const handleTestCron = async () => {
    try {
      setTestingCron(true);
      const res = await dashboardService.triggerBillingCycle();
      toast.success(
        `Automated billing cycle test completed! Processed and generated ${res.invoicesGenerated} cycle invoice(s).`
      );
    } catch (err) {
      toast.error(err.message || 'Cron execution failed');
    } finally {
      setTestingCron(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-600" />
            System &amp; Server Infrastructure Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Environment parameters, automated Spring Scheduler configuration, and database connections
          </p>
        </div>

        <button
          onClick={handleTestCron}
          disabled={testingCron}
          className="btn-primary text-xs py-2 inline-flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testingCron ? 'animate-spin' : ''}`} />
          {testingCron ? 'Running Cron Engine...' : 'Run Billing Engine Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Configuration Card */}
        <div className="card-container p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Database Connection</h3>
              <p className="text-xs text-slate-500">MySQL 8.x / 9.x Relational Engine</p>
            </div>
            <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ONLINE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block">JDBC Target URL:</span>
              <p className="font-mono text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200 break-all">
                jdbc:mysql://localhost:3306/brightloop_db?createDatabaseIfNotExist=true
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block">Driver Class:</span>
                <span className="font-semibold text-slate-700">com.mysql.cj.jdbc.Driver</span>
              </div>
              <div>
                <span className="text-slate-400 block">DDL Schema Mode:</span>
                <span className="font-semibold text-emerald-700">Hibernate Auto-Update</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spring Scheduler Billing Engine */}
        <div className="card-container p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recurring Billing Scheduler</h3>
              <p className="text-xs text-slate-500">Spring Boot @Scheduled Cron Engine</p>
            </div>
            <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              ACTIVE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block">Cron Expression:</span>
              <p className="font-mono text-brand-700 font-bold bg-brand-50/50 p-2 rounded-lg border border-brand-200">
                0 0 2 * * ? (Daily at 02:00:00 AM UTC)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block">Duplicate Prevention:</span>
                <span className="font-semibold text-emerald-700">Idempotent BillingRecord Table</span>
              </div>
              <div>
                <span className="text-slate-400 block">Invoice Storage Dir:</span>
                <span className="font-mono text-slate-700">invoices-generated/</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Token Info */}
        <div className="card-container p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security &amp; JWT Tokens</h3>
              <p className="text-xs text-slate-500">Stateless Spring Security &amp; BCrypt</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block">Token Algorithm:</span>
              <span className="font-semibold text-slate-800">HMAC-SHA256 (JJWT 0.12.5)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block">Session Expiration:</span>
                <span className="font-semibold text-slate-800">24 Hours (86,400,000 ms)</span>
              </div>
              <div>
                <span className="text-slate-400 block">Password Hasher:</span>
                <span className="font-semibold text-slate-800">BCrypt (Strength 10)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Branding */}
        <div className="card-container p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Company Profile</h3>
              <p className="text-xs text-slate-500">Invoicing entity headers</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block">Entity Name:</span>
              <span className="font-bold text-slate-900">Brightloop Software Inc.</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block">Base Currency:</span>
                <span className="font-semibold text-slate-800">INR (₹) / USD ($)</span>
              </div>
              <div>
                <span className="text-slate-400 block">Fiscal Jurisdiction:</span>
                <span className="font-semibold text-slate-800">GST India Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
