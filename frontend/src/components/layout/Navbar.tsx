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
        <nav className="liquid-glass rounded-full px-4 py-2 sm:py-2.5 flex items-center justify-between border border-blue-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl bg-[#081026]/85">
          
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
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive(to)
                    ? 'text-cyan-300 bg-blue-600/20 border border-blue-500/30 shadow-xs font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
                {pulse && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />}
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
                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors relative"
                    title="Notifications"
                  >
                    <Bell size={15} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-[0_0_8px_#06b6d4]">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl liquid-glass border border-blue-500/20 shadow-2xl p-4 z-50 bg-[#0a1228]/95 text-white">
                      <div className="flex items-center justify-between pb-3 border-b border-blue-500/15 mb-3">
                        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-[11px] text-slate-400 hover:text-cyan-300 transition-colors">
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
                                  ? 'bg-slate-900/60 text-slate-400'
                                  : 'bg-blue-950/40 text-slate-100 border-l-2 border-cyan-400'
                              }`}
                            >
                              <div className="font-semibold text-white mb-0.5">{n.title}</div>
                              <p className="text-slate-300 text-[11px]">{n.message}</p>
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
                    className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)]"
                  >
                    <ShieldCheck size={13} />
                    <span>CEO Control</span>
                  </Link>
                ) : user.role === 'developer' ? (
                  <Link
                    to="/dashboard"
                    className="px-3.5 py-1.5 rounded-full liquid-glass text-xs font-medium text-slate-200 hover:text-white hover:bg-white/5 border border-blue-500/20 flex items-center gap-1.5 transition-colors"
                  >
                    <LayoutDashboard size={13} />
                    <span>Dev Portal</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="px-3.5 py-1.5 rounded-full liquid-glass text-xs font-medium text-slate-200 hover:text-white hover:bg-white/5 border border-blue-500/20 flex items-center gap-1.5 transition-colors"
                  >
                    <LayoutDashboard size={13} />
                    <span>Client Portal</span>
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full hover:bg-white/5 transition-colors"
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-6 h-6 rounded-full object-cover ring-1 ring-cyan-500/40" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-[10px] font-instrument italic">
                        {user.full_name.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs text-slate-200 hidden md:block font-medium">
                      {user.role === 'super_admin' ? 'CEO' : user.full_name.split(' ')[0]}
                    </span>
                    {user.is_verified && <CheckCircle2 size={12} className="text-cyan-400" />}
                    <ChevronDown size={12} className="text-slate-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl liquid-glass border border-blue-500/20 shadow-2xl py-1.5 z-50 bg-[#0a1228]/95 text-white">
                      <div className="px-4 py-2.5 border-b border-blue-500/15">
                        <p className="text-xs font-instrument italic text-white">{user.full_name}</p>
                        <p className="text-[10px] text-cyan-400 mt-0.5 font-mono">
                          {user.role === 'super_admin' ? 'CEO' : `@${user.username}`}
                        </p>
                      </div>
                      {user.role === 'super_admin' && (
                        <Link to="/ceo" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-white/5 transition-colors">
                          CEO Control Center
                        </Link>
                      )}
                      <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        Workspace
                      </Link>
                      {user.role === 'developer' && (
                        <Link to={`/developers/${user.username}`} onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                          Public Profile
                        </Link>
                      )}
                      <Link to="/messages" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        Direct Messages
                      </Link>
                      <button
                        onClick={() => { setUserMenuOpen(false); logout(); navigate('/'); }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
                      >
                        <LogOut size={12} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-3.5 py-1.5 rounded-full text-xs text-slate-300 hover:text-white transition-colors font-medium">
                  Sign in
                </Link>
                <Link to="/register" className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white text-xs font-semibold hover:brightness-110 shadow-[0_0_20px_rgba(37,99,235,0.45)] transition-all flex items-center gap-1">
                  <span>Get Started</span>
                  <span className="text-xs">→</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 rounded-3xl liquid-glass border border-blue-500/20 bg-[#081026]/95 p-4 space-y-1 shadow-2xl text-white">
            {navLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-xs transition-colors ${
                  isActive(to) ? 'bg-blue-600/20 text-cyan-300 font-semibold border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="pt-3 border-t border-blue-500/20 space-y-2 mt-2">
              {user ? (
                <>
                  {user.role === 'super_admin' ? (
                    <Link to="/ceo" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs text-center font-medium shadow-sm">
                      CEO Control Center
                    </Link>
                  ) : (
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl bg-[#0a142e] text-cyan-300 text-xs text-center font-medium border border-blue-500/30">
                      Workspace
                    </Link>
                  )}
                  <button
                    onClick={() => { setMobileMenuOpen(false); logout(); navigate('/'); }}
                    className="w-full px-4 py-2 rounded-xl bg-blue-950/80 text-slate-300 hover:text-white text-xs text-center border border-blue-500/20 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl bg-[#0a142e] text-slate-200 text-xs text-center border border-blue-500/30 font-medium">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs text-center font-semibold shadow-sm">
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
