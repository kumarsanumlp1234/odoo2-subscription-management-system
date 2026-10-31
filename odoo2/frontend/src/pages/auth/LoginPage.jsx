import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FormInput } from '../../components/forms/FormInput';
import { Sparkles, Mail, Lock, LogIn, ArrowRight, Shield, User, Users } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password });
      toast.success(`Welcome back, ${res.fullName}!`);
      
      const roles = res.roles || [];
      if (roles.includes('ROLE_CUSTOMER') || roles.includes('CUSTOMER')) {
        navigate('/portal/overview');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-xl shadow-brand-500/25 mb-4 text-white">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Brightloop Software</h2>
        <p className="mt-2 text-sm text-slate-400">Subscription & Recurring Billing Management System</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100 text-slate-800">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInput
              id="email"
              label="Work Email"
              type="email"
              placeholder="name@company.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FormInput
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">Secure JWT Authentication</span>
              <Link to="/forgot-password" className="font-semibold text-brand-600 hover:text-brand-500">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 mt-2"
            >
              {loading ? 'Authenticating...' : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center mb-3">
              One-Click Demo Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@brightloop.io', 'Admin@123')}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 text-purple-800 transition-all text-xs"
              >
                <Shield className="w-4 h-4 mb-1 text-purple-600" />
                <span className="font-semibold">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('staff@brightloop.io', 'Admin@123')}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-800 transition-all text-xs"
              >
                <Users className="w-4 h-4 mb-1 text-blue-600" />
                <span className="font-semibold">Staff</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('customer@brightloop.io', 'Admin@123')}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 transition-all text-xs"
              >
                <User className="w-4 h-4 mb-1 text-emerald-600" />
                <span className="font-semibold">Customer</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500">
              Register as Customer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
