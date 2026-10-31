import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { FormInput } from '../../components/forms/FormInput';
import { Sparkles, Mail, Send, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warning('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword(email);
      setSubmitted(true);
      toast.success('Password reset instructions generated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to send password reset request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-xl shadow-brand-500/25 mb-4 text-white">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Reset Password</h2>
        <p className="mt-2 text-sm text-slate-400">Enter your email to receive recovery instructions</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100 text-slate-800">
          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">Check Your Email</h3>
              <p className="text-sm text-slate-500 mt-2">
                If an account exists for <span className="font-semibold text-slate-700">{email}</span>, a secure one-time password reset token has been generated.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Link to="/reset-password" className="btn-primary text-xs py-2">
                  Enter Reset Token
                </Link>
                <Link to="/login" className="btn-secondary text-xs py-2">
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <FormInput
                id="email"
                label="Registered Email"
                type="email"
                placeholder="name@company.com"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 mt-2"
              >
                {loading ? 'Sending Request...' : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Reset Link
                  </>
                )}
              </button>

              <div className="pt-4 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
