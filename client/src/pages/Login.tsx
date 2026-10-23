import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, KeyRound, UserCheck } from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, currentUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect directly to role dashboard
  React.useEffect(() => {
    if (isAuthenticated && currentUser) {
      const destination =
        currentUser.role === 'admin'
          ? '/admin/dashboard'
          : currentUser.role === 'provider'
          ? '/provider/dashboard'
          : '/customer/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { user } = await login(email.trim(), password);

      // Navigate to intended redirect or dashboard
      const from = (location.state as any)?.from?.pathname;
      if (from && !from.includes('/login') && !from.includes('/register')) {
        // If target matches their role
        if (
          (user.role === 'customer' && from.startsWith('/customer')) ||
          (user.role === 'provider' && from.startsWith('/provider')) ||
          (user.role === 'admin' && from.startsWith('/admin'))
        ) {
          navigate(from, { replace: true });
          return;
        }
      }

      // Default role destinations
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'provider') {
        navigate('/provider/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (role: 'customer' | 'provider' | 'admin') => {
    const creds = DEMO_CREDENTIALS[role];
    setEmail(creds.email);
    setPassword(creds.password);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-700 transition-colors">
              <Wrench className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-stone-900">
              Fix<span className="text-brand-600">Near</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Access your home service bookings, worker jobs, or administration panel
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-stone-200 sm:px-10 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-stone-300 pl-10 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-stone-300 pl-10 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <Button type="submit" size="md" className="w-full mt-2" isLoading={isLoading}>
              Sign In
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="pt-4 border-t border-stone-100">
            <span className="text-[11px] font-semibold text-stone-500 block mb-2 text-center uppercase tracking-wider">
              Quick 1-Click Demo Login:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleFillDemo('customer')}
                className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-surface-100 hover:bg-stone-200 text-stone-800 transition-colors border border-stone-200 text-center"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('provider')}
                className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-surface-100 hover:bg-stone-200 text-stone-800 transition-colors border border-stone-200 text-center"
              >
                Worker / Pro
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-surface-100 hover:bg-stone-200 text-stone-800 transition-colors border border-stone-200 text-center"
              >
                Admin
              </button>
            </div>
            <p className="text-[10px] text-stone-400 text-center mt-2">
              Default password for all demo accounts is <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-600">Password@123</code>
            </p>
          </div>

          <div className="pt-2 text-center text-xs text-stone-600">
            <span>Don't have an account yet? </span>
            <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800 underline decoration-brand-300">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
