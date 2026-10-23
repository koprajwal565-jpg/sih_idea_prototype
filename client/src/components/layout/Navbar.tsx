import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Search,
  Bell,
  MapPin,
  Sparkles,
  User,
  Shield,
  Briefcase,
  Menu,
  X,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AIBookingModal } from '../ai/AIBookingModal';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    isAuthenticated,
    logout,
    switchRole,
    notifications,
    unreadCount,
    markNotificationAsRead,
  } = useAuth();

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        {/* Top utility banner: Indian city selector & Demo Role Switcher */}
        <div className="bg-stone-900 text-stone-300 text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <span>Bengaluru, Karnataka</span>
              <span className="text-stone-600">|</span>
              <span className="text-stone-400">Serving Bellandur, Indiranagar, Koramangala & HSR</span>
            </div>

            {/* Quick Demo Role Switcher */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-stone-400">Quick Role Switch:</span>
              <div className="inline-flex rounded-md bg-stone-800 p-0.5 border border-stone-700">
                <button
                  onClick={() => switchRole('customer')}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    currentUser?.role === 'customer'
                      ? 'bg-brand-600 text-white'
                      : 'text-stone-300 hover:text-white'
                  }`}
                  title="Switch to Demo Customer (Rahul Sharma)"
                >
                  Customer
                </button>
                <button
                  onClick={() => switchRole('provider')}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    currentUser?.role === 'provider'
                      ? 'bg-brand-600 text-white'
                      : 'text-stone-300 hover:text-white'
                  }`}
                  title="Switch to Demo Worker / Pro (Ramesh Kumar)"
                >
                  Worker / Pro
                </button>
                <button
                  onClick={() => switchRole('admin')}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    currentUser?.role === 'admin'
                      ? 'bg-brand-600 text-white'
                      : 'text-stone-300 hover:text-white'
                  }`}
                  title="Switch to Demo Administrator"
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-700 transition-colors">
              <Wrench className="w-5 h-5 transition-transform group-hover:rotate-12" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-1">
                Fix<span className="text-brand-600">Near</span>
              </span>
              <span className="text-[10px] block -mt-1 font-medium text-stone-600">
                Home Services • Bengaluru
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <input
              type="text"
              placeholder="Search electrician, plumber, AC repair, cleaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-100 border border-stone-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-stone-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
          </form>

          {/* Action Links & AI diagnose button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold hover:bg-brand-100 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
              <span>AI Problem Helper</span>
            </button>

            <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-stone-600">
              <Link to="/services" className="hover:text-brand-600 transition-colors">
                Services
              </Link>
              <Link to="/how-it-works" className="hover:text-brand-600 transition-colors">
                How It Works
              </Link>
              <Link to="/become-a-pro" className="hover:text-brand-600 transition-colors">
                Become a Pro
              </Link>
            </nav>

            {/* Notification Bell (Only if authenticated) */}
            {isAuthenticated && currentUser && (
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-surface-100 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Drawer Popover */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                      <span className="font-semibold text-xs text-stone-900">Notifications</span>
                      <span className="text-[11px] text-stone-600">{notifications.length} total</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-stone-600 p-4 text-center">No notifications yet.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationAsRead(n.id)}
                            className={`p-3 text-xs cursor-pointer hover:bg-surface-50 transition-colors ${
                              !n.is_read ? 'bg-brand-50/40 font-medium' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-stone-900">{n.title}</span>
                              {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-600" />}
                            </div>
                            <p className="text-stone-600 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User State & Dashboard Links */}
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.role === 'customer' && (
                  <Link
                    to="/customer/dashboard"
                    className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-stone-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all"
                  >
                    <img
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80'}
                      alt={currentUser.full_name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-medium text-stone-800 hidden sm:inline">
                      {currentUser.full_name.split(' ')[0]}
                    </span>
                  </Link>
                )}

                {currentUser.role === 'provider' && (
                  <Link
                    to="/provider/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-700 text-white text-xs font-semibold hover:bg-brand-800 transition-colors shadow-xs"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Worker Portal</span>
                  </Link>
                )}

                {currentUser.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Admin Panel</span>
                  </Link>
                )}

                {/* Sign Out Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Unauthenticated: Show Sign In & Register buttons */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-surface-100 transition-colors border border-stone-200"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Register</span>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-100 border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-sm"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </form>
            <div className="flex flex-col gap-2 pt-2 text-sm font-medium text-stone-700">
              <Link
                to="/services"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-brand-600"
              >
                Browse Services
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-brand-600"
              >
                How It Works
              </Link>
              <Link
                to="/become-a-pro"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-brand-600"
              >
                Become a Pro
              </Link>
              <Link
                to="/help"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-brand-600"
              >
                Help & Support
              </Link>

              <div className="border-t border-stone-200 pt-2 flex flex-col gap-2">
                {isAuthenticated && currentUser ? (
                  <>
                    <Link
                      to={
                        currentUser.role === 'admin'
                          ? '/admin/dashboard'
                          : currentUser.role === 'provider'
                          ? '/provider/dashboard'
                          : '/customer/dashboard'
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-1 text-brand-700 font-semibold flex items-center gap-1.5"
                    >
                      <User className="w-4 h-4" />
                      <span>{currentUser.role.toUpperCase()} Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-left py-1 text-rose-600 font-semibold flex items-center gap-1.5"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-1 text-stone-800 font-semibold"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-1 text-brand-700 font-semibold"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* AI Assistant Modal */}
      <AIBookingModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </>
  );
};
