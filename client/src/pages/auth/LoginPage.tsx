import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext.js';
import { Shield, Sparkles, ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export const getRoleDashboardRoute = (role?: string): string => {
  switch (role) {
    case 'Super Admin':
    case 'Admin':
      return '/admin';
    case 'Purchase Manager':
    case 'Procurement Manager':
      return '/purchase-manager';
    case 'Employee / Requester':
    case 'Procurement Officer':
      return '/employee';
    case 'Vendor':
      return '/vendor';
    case 'Inventory Manager':
      return '/inventory';
    case 'Finance Officer':
      return '/app/invoices';
    case 'Department Manager / Approver':
      return '/app/approvals';
    default:
      return '/app';
  }
};

export const LoginPage: React.FC = () => {
  const { login, quickDemoLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);
    if (success) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('procurex_user') || '{}');
        navigate(getRoleDashboardRoute(storedUser.role));
      } catch {
        navigate('/app');
      }
    }
  };

  const handleDemoClick = async (demoEmail: string, roleName?: string) => {
    setSubmitting(true);
    const success = await quickDemoLogin(demoEmail);
    setSubmitting(false);
    if (success) {
      navigate(getRoleDashboardRoute(roleName));
    }
  };

  return (
    <div className="min-h-screen bg-procure-bg flex flex-col justify-center py-8 sm:py-12 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto w-full max-w-[92vw] sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white font-black text-xl shadow-sm">
            P
          </div>
          <span className="font-extrabold text-3xl tracking-tight text-procure-text">
            Procure<span className="text-teal-500">X</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Sign In to Your Workspace
        </h2>
        <p className="text-xs text-procure-muted mt-1">
          Enter your credentials or click any test role below for instant demo access.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card border border-procure-border rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-teal-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {submitting ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-600" /> 1-Click Role Login
              </span>
              <span className="text-[10px] text-slate-400">Password: Password123!</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleDemoClick(acc.email, acc.role)}
                  disabled={submitting}
                  className="p-2 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 text-left transition-all text-[11px]"
                >
                  <div className="font-bold text-slate-800 truncate">{acc.role}</div>
                  <div className="text-[10px] text-slate-400 truncate">{acc.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an enterprise account?{' '}
            <Link to="/register" className="font-bold text-teal-600 hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
