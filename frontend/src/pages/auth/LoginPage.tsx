import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import api from '../../api/client';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const companyName = settings?.company_name || 'RMVS Web Services';
  const logoUrl = settings?.logo_url || '/logo.png';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email_or_username: identifier.trim(), password });
      login(res.data.access_token, res.data.user);
      if (res.data.user.role === 'super_admin') {
        navigate('/ceo');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex items-center justify-center px-4 py-16 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link to="/" className="inline-block mb-4">
            <img src={logoUrl} alt={companyName} className="h-12 w-auto max-w-[240px] mx-auto object-contain transition-transform hover:scale-[1.02]" />
          </Link>
          <h2 className="font-sans font-bold text-slate-900 text-2xl">Sign in to your account</h2>
          <p className="text-slate-500 text-xs mt-1">Access projects, community channels, and workspace controls.</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 space-y-6 border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.05)] bg-white">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-2">Email or Username</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600" size={15} />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your registered email or username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors shadow-2xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600" size={15} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors shadow-2xs"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors">
                Register as Developer or Client
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
