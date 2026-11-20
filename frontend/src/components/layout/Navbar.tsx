import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell, LogOut, LayoutDashboard, Menu, X, ChevronDown, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import api from '../../api/client';
import type { NotificationItem } from '../../types';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (_) { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (_) { /* ignore */ }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const isActive = (path: string) => location.pathname === path;

  const companyName = settings?.company_name || 'RMVS Web Services';
  const logoUrl = settings?.logo_url || '/logo.png';

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Projects', to: '/projects' },
    { label: 'Developers', to: '/developers' },
    { label: 'Team', to: '/team' },
    { label: 'Services', to: '/services' },
    { label: 'Community', to: '/community', pulse: true },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <header className="sticky top-3 sm:top-4 z-50 w-full px-3 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <nav className="liquid-glass rounded-full px-4 py-2 sm:py-2.5 flex items-center justify-between border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.06)] backdrop-blur-2xl bg-white/90">
          
          {/* Dynamic Brand with Logo */}
          <Link to="/" className="flex items-center group shrink-0 pl-1 py-0.5">
            <img
              src={logoUrl}
              alt={companyName}
              className="h-8 sm:h-9 w-auto max-w-[155px] sm:max-w-[195px] object-contain transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ label, to, pulse }) => (
              <Link
                key={to}
                to={to}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive(to)
                    ? 'text-blue-600 bg-blue-50 border border-blue-200 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {label}
                {pulse && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_8px_#2563eb]" />}
              </Link>
            ))}
          </div>

          {/* Right Action Suite */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                    title="Notifications"
                  >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 bg-white text-slate-800">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider font-mono">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-[11px] text-slate-500 hover:text-blue-600 transition-colors">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4 font-instrument italic">No notifications yet</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 rounded-xl text-xs transition-colors ${
                                n.is_read
                                  ? 'bg-slate-50 text-slate-500'
                                  : 'bg-blue-50 text-slate-900 border-l-2 border-blue-600'
                              }`}
                            >
                              <div className="font-semibold text-slate-900 mb-0.5">{n.title}</div>
                              <p className="text-slate-600 text-[11px]">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dashboard / Workspace Links */}
                {user.role === 'super_admin' ? (
                  <Link
                    to="/ceo"
                    className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <ShieldCheck size={13} />
                    <span>CEO Control</span>
                  </Link>
                ) : user.role === 'developer' ? (
                  <Link
                    to="/dashboard"
                    className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-800 border border-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <LayoutDashboard size={13} />
                    <span>Dev Portal</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-800 border border-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <LayoutDashboard size={13} />
                    <span>Client Portal</span>
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500/40" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 text-[10px] font-instrument italic">
                        {user.full_name.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs text-slate-700 hidden md:block font-medium">
                      {user.role === 'super_admin' ? 'CEO' : user.full_name.split(' ')[0]}
                    </span>
                    {user.is_verified && <CheckCircle2 size={12} className="text-blue-600" />}
                    <ChevronDown size={12} className="text-slate-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 shadow-2xl py-1.5 z-50 bg-white text-slate-800">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-instrument italic text-slate-900">{user.full_name}</p>
                        <p className="text-[10px] text-blue-600 mt-0.5 font-mono">
                          {user.role === 'super_admin' ? 'CEO' : `@${user.username}`}
                        </p>
                      </div>
                      {user.role === 'super_admin' && (
                        <Link to="/ceo" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-slate-50 transition-colors">
                          CEO Control Center
                        </Link>
                      )}
                      <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                        Workspace
                      </Link>
                      {user.role === 'developer' && (
                        <Link to={`/developers/${user.username}`} onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                          Public Profile
                        </Link>
                      )}
                      <Link to="/messages" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                        Direct Messages
                      </Link>
                      <button
                        onClick={() => { setUserMenuOpen(false); logout(); navigate('/'); }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                      >
                        <LogOut size={12} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-3.5 py-1.5 rounded-full text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium">
                  Sign in
                </Link>
                <Link to="/register" className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1">
                  <span>Get Started</span>
                  <span className="text-xs">→</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 rounded-3xl border border-slate-200 bg-white/98 p-4 space-y-1 shadow-2xl text-slate-800">
            {navLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-xs transition-colors ${
                  isActive(to) ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 space-y-2 mt-2">
              {user ? (
                <>
                  {user.role === 'super_admin' ? (
                    <Link to="/ceo" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs text-center font-medium shadow-sm">
                      CEO Control Center
                    </Link>
                  ) : (
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs text-center font-medium border border-slate-200">
                      Workspace
                    </Link>
                  )}
                  <button
                    onClick={() => { setMobileMenuOpen(false); logout(); navigate('/'); }}
                    className="w-full px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 text-xs text-center border border-slate-200 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs text-center border border-slate-200 font-medium">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs text-center font-semibold shadow-sm">
                    Join
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
