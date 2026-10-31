import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { FormInput } from '../../components/forms/FormInput';
import { Sparkles, Key, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !newPassword) {
      toast.warning('Please enter both the reset token and your new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error(
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.'
      );
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(token, newPassword);
      toast.success('Password updated successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. Token may have expired.');
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
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Set New Password</h2>
        <p className="mt-2 text-sm text-slate-400">Enter your secure reset token and choose a new password</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100 text-slate-800">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInput
              id="token"
              label="Reset Token"
              placeholder="Paste token received"
              icon={Key}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />

            <FormInput
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 symbol"
              icon={Lock}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <FormInput
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter password"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 mt-2"
            >
              {loading ? 'Resetting Password...' : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save New Password
                </>
              )}
            </button>

            <div className="pt-4 text-center">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
