import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FormInput } from '../../components/forms/FormInput';
import { Sparkles, Mail, Lock, User, Building, Phone, UserPlus } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Password criteria check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast.error(
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.'
      );
      return;
    }

    try {
      setLoading(true);
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        companyName: formData.companyName,
        password: formData.password,
      });
      toast.success('Registration successful! Welcome to Brightloop.');
      navigate('/portal/overview');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
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
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Customer Account</h2>
        <p className="mt-2 text-sm text-slate-400">Join Brightloop Subscription Management Platform</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100 text-slate-800">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                id="fullName"
                label="Full Name"
                placeholder="John Doe"
                icon={User}
                value={formData.fullName}
                onChange={handleChange}
                required
              />

              <FormInput
                id="email"
                label="Email Address"
                type="email"
                placeholder="john@company.com"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                id="phoneNumber"
                label="Phone Number"
                placeholder="+91 9876543210"
                icon={Phone}
                value={formData.phoneNumber}
                onChange={handleChange}
              />

              <FormInput
                id="companyName"
                label="Company / Organization"
                placeholder="Acme Corp"
                icon={Building}
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                id="password"
                label="Password"
                type="password"
                placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                required
              />

              <FormInput
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <p className="text-[11px] text-slate-500">
              * Must contain &gt;8 characters with uppercase, lowercase, and special symbol.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 mt-2"
            >
              {loading ? 'Creating Account...' : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register Now
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
