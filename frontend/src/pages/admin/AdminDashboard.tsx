import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, RefreshCw, Users,
  FolderGit2, MessageSquare, Edit3, Trash2, ExternalLink, X, Plus,
  AlertCircle, Settings as SettingsIcon,
  Activity, Key, UserPlus, Clock, Check, Smartphone, Package
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import type { DashboardStats, ClientInquiry, User, Project, CompanySettings, ActivityLog } from '../../types';
import { WhatsAppAutomationTab } from '../../components/admin/WhatsAppAutomationTab';
import { OrdersManagementTab } from '../../components/admin/OrdersManagementTab';

export const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { settings, updateSettings, refreshSettings } = useSettings();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [inquiries, setInquiries] = useState<ClientInquiry[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [activeTab, setActiveTab] = useState<'overview' | 'whatsapp' | 'orders' | 'team' | 'projects' | 'clients' | 'inquiries' | 'brand' | 'activity'>('overview');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add Developer Modal
  const [isAddDevOpen, setIsAddDevOpen] = useState(false);
  const [newDevForm, setNewDevForm] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
    title: 'Senior Software Engineer',
    department: 'Core Engineering',
    phone: '',
    location: 'Hyderabad, India',
    years_experience: 3,
    skills: 'Python, FastAPI, React, TypeScript',
    bio: '',
  });

  // Edit Developer Modal
  const [editingDev, setEditingDev] = useState<any | null>(null);
  const [editDevForm, setEditDevForm] = useState({
    title: '',
    department: '',
    status: 'approved',
    is_active: true,
    full_name: '',
    bio: '',
    skills: '',
    location: '',
    years_experience: 1,
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
  });

  // Reset Password Modal
  const [resetPwUser, setResetPwUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Brand Settings Form state
  const [brandForm, setBrandForm] = useState<Partial<CompanySettings>>({});

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      loadAdminData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (settings) {
      setBrandForm({
        company_name: settings.company_name || '',
        logo_url: settings.logo_url || '',
        favicon_url: settings.favicon_url || '',
        tagline: settings.tagline || '',
        description: settings.description || '',
        primary_color: settings.primary_color || '#0066FF',
        secondary_color: settings.secondary_color || '#00F2FE',
        email: settings.email || '',
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        website: settings.website || '',
        github_url: settings.github_url || '',
        linkedin_url: settings.linkedin_url || '',
        twitter_url: settings.twitter_url || '',
        youtube_url: settings.youtube_url || '',
        address: settings.address || '',
        business_hours: settings.business_hours || '',
        footer_copyright: settings.footer_copyright || '',
      });
    }
  }, [settings]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, devRes, usersRes, projRes, inqRes, actRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/developers'),
        api.get('/admin/users'),
        api.get('/admin/projects'),
        api.get('/admin/inquiries'),
        api.get('/activity'),
      ]);
      setStats(statsRes.data);
      setDevelopers(devRes.data);
      setAllUsers(usersRes.data);
      setAllProjects(projRes.data);
      setInquiries(inqRes.data);
      setActivityLogs(actRes.data);
    } catch (e) {
      console.error('Error loading admin data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 4000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // 1. Create Developer
  const handleCreateDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const skillsArray = newDevForm.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.post('/admin/developers', {
        ...newDevForm,
        skills: skillsArray,
      });
      showNotification(`Developer ${newDevForm.full_name} created successfully!`);
      setIsAddDevOpen(false);
      setNewDevForm({
        email: '',
        username: '',
        full_name: '',
        password: '',
        title: 'Senior Software Engineer',
        department: 'Core Engineering',
        phone: '',
        location: 'Hyderabad, India',
        years_experience: 3,
        skills: 'Python, FastAPI, React, TypeScript',
        bio: '',
      });
      loadAdminData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Failed to create developer', true);
    }
  };

  // 2. Open Edit Developer
  // 2. Open Edit Developer
  const openEditDeveloper = (dev: any) => {
    setEditingDev(dev);
    const p = dev.developer_profile;
    setEditDevForm({
      title: dev.title || p?.title || 'Software Engineer',
      department: dev.department || p?.department || 'Core Engineering',
      status: dev.status || dev.user?.status || 'approved',
      is_active: dev.is_active ?? dev.user?.is_active ?? true,
      full_name: dev.full_name || dev.user?.full_name || '',
      bio: dev.bio || dev.short_bio || p?.bio || p?.short_bio || '',
      skills: (dev.skills || p?.skills || []).map((s: any) => s.name || s).join(', '),
      location: dev.location || p?.location || '',
      years_experience: dev.years_experience ?? p?.years_experience ?? 1,
      github_url: dev.github_url || p?.github_url || '',
      linkedin_url: dev.linkedin_url || p?.linkedin_url || '',
      portfolio_url: dev.portfolio_url || p?.portfolio_url || '',
    });
  };

  // 3. Save Edit Developer
  const handleSaveDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDev) return;
    try {
      const devId = editingDev.id || editingDev.user_id || editingDev.user?.id;
      await api.put(`/admin/developers/${devId}/designation`, {
        title: editDevForm.title,
        department: editDevForm.department,
      });

      await api.put(`/admin/developers/${devId}/status`, {
        status: editDevForm.status,
        is_active: editDevForm.is_active,
      });

      const name = editingDev.full_name || editingDev.user?.full_name || 'Developer';
      showNotification(`Developer ${name} updated successfully!`);
      setEditingDev(null);
      loadAdminData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Failed to update developer', true);
    }
  };

  // Toggle Verify Developer
  const handleToggleVerify = async (dev: any) => {
    try {
      const devId = dev.id || dev.user_id || dev.user?.id;
      const res = await api.put(`/admin/developers/${devId}/verify`);
      const newStatus = res.data.is_verified ? 'verified (badge visible)' : 'unverified';
      const name = dev.full_name || dev.user?.full_name || 'Developer';
      showNotification(`${name} is now ${newStatus}!`);
      loadAdminData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Failed to toggle verification', true);
    }
  };

  // Approve Registered Developer (Make Profile Live)
  const handleApproveDeveloper = async (dev: any) => {
    try {
      const devId = dev.id || dev.user_id || dev.user?.id;
      await api.post(`/admin/developers/${devId}/approve`);
      const name = dev.full_name || dev.user?.full_name || 'Developer';
      showNotification(`${name} approved successfully! Profile is now live on the website.`);
      loadAdminData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Failed to approve developer', true);
    }
  };

  // Reject Registered Developer
  const handleRejectDeveloper = async (dev: any) => {
    const name = dev.full_name || dev.user?.full_name || 'Developer';
    if (!window.confirm(`Are you sure you want to reject the application for ${name}?`)) return;
    try {
      const devId = dev.id || dev.user_id || dev.user?.id;
      await api.post(`/admin/developers/${devId}/reject`);
      showNotification(`Application for ${name} rejected.`);
      loadAdminData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Failed to reject application', true);
    }
  };

  // 4. Delete Developer
  const handleDeleteDeveloper = async (devId: number, name: string) => {
    if (!window.confirm(`Are you sure you want to completely remove developer ${name}?`)) return;
    try {
      await api.delete(`/admin/developers/${devId}`);
      showNotification(`Developer ${name} deleted.`);
      loadAdminData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Failed to delete developer', true);
    }
  };

  // 5. Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwUser || !newPassword) return;
    try {
      await api.post(`/admin/users/${resetPwUser.id}/reset-password`, {
        new_password: newPassword,
      });
      showNotification(`Password for ${resetPwUser.full_name} reset successfully!`);
      setResetPwUser(null);
      setNewPassword('');
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Failed to reset password', true);
    }
  };

  // 6. Update Inquiry Status
  const handleInquiryStatus = async (inqId: number, status: string) => {
    try {
      await api.put(`/inquiries/${inqId}/status`, { status });
      showNotification(`Inquiry updated to ${status}`);
      loadAdminData();
    } catch (err: any) {
      showNotification('Failed to update inquiry status', true);
    }
  };

  // 7. Save Brand Settings
  const handleSaveBrandSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(brandForm);
      showNotification('Company branding and settings saved successfully!');
      refreshSettings();
    } catch (err: any) {
      showNotification('Failed to save settings', true);
    }
  };

  // Access Control: Strict CEO (super_admin) check
  if (!currentUser || currentUser.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-6">
        <div className="liquid-glass rounded-3xl p-10 text-center max-w-md w-full border border-black/[0.08] shadow-sm bg-white/70">
          <ShieldCheck size={48} className="mx-auto text-slate-400 mb-4" />
          <h2 className="font-instrument italic text-2xl text-slate-950 mb-2">Restricted Access</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            This Control Center is reserved exclusively for Chief Executive Officer Ritesh Lingamallu.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            <span>Sign in as CEO</span>
          </Link>
        </div>
      </div>
    );
  }

  // Filter clients
  const clientsList = allUsers.filter((u) => u.role === 'client');

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Executive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.08]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img
                src={settings?.logo_url || '/logo.png'}
                alt="Logo"
                className="h-8 w-auto object-contain"
              />
              <p className="text-slate-400 text-xs tracking-wider uppercase font-mono">
                {settings?.company_name || 'Company'} · Executive Control Center
              </p>
            </div>
            <h1 className="font-instrument italic text-3xl sm:text-4xl text-slate-950">
              CEO Command Suite
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Logged in as <span className="text-slate-950 font-semibold">{currentUser.full_name}</span> (Chief Executive Officer)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              disabled={isLoading}
              className="p-2.5 rounded-full liquid-glass border border-black/10 text-slate-700 hover:text-black hover:bg-slate-50 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setIsAddDevOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <UserPlus size={14} />
              <span>Add Developer</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-black/[0.06] pb-4">
          {[
            { id: 'overview', label: 'Overview & Analytics', icon: Activity },
            { id: 'whatsapp', label: 'WhatsApp Automation', icon: Smartphone },
            { id: 'orders', label: 'Orders & Deliveries', icon: Package },
            { id: 'team', label: `Engineering Team (${developers.length})`, icon: Users },
            { id: 'projects', label: `Projects (${allProjects.length})`, icon: FolderGit2 },
            { id: 'clients', label: `Clients (${clientsList.length})`, icon: ShieldCheck },
            { id: 'inquiries', label: `Inquiries (${inquiries.length})`, icon: MessageSquare },
            { id: 'brand', label: 'Brand & Settings', icon: SettingsIcon },
            { id: 'activity', label: 'Activity Logs', icon: Clock },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === id
                  ? 'bg-black text-white shadow-sm font-semibold'
                  : 'liquid-glass text-slate-600 hover:text-black border border-black/10'
              }`}
            >
              <Icon size={13} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB 1: OVERVIEW & ANALYTICS ── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Developers', val: stats?.total_developers ?? 0, icon: Users },
                { label: 'Active Developers', val: stats?.active_developers ?? 0, icon: CheckCircle2 },
                { label: 'Total Projects', val: stats?.total_projects ?? 0, icon: FolderGit2 },
                { label: 'Completed Projects', val: stats?.completed_projects ?? 0, icon: Check },
                { label: 'Total Clients', val: stats?.total_clients ?? 0, icon: ShieldCheck },
                { label: 'Open Inquiries', val: stats?.open_inquiries ?? 0, icon: MessageSquare },
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} className="liquid-glass rounded-2xl p-5 border border-black/[0.08] bg-white/70">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <Icon size={16} />
                  </div>
                  <div className="text-3xl font-instrument italic text-slate-950 font-bold">{val}</div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Quick Summary Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="liquid-glass rounded-3xl p-6 border border-black/[0.08] bg-white/70 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-instrument italic text-2xl text-slate-950">Company Hierarchy Status</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Operational</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  CEO Ritesh Lingamallu holds full administrative control over developers, projects, and platform configuration.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b border-black/[0.04]">
                    <span className="text-slate-500 font-mono">1. Chief Executive Officer:</span>
                    <span className="font-semibold text-slate-900">Ritesh Lingamallu (Active)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-black/[0.04]">
                    <span className="text-slate-500 font-mono">2. Core Developers Count:</span>
                    <span className="font-semibold text-slate-900">{developers.length} Developers</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-mono">3. Registered Clients:</span>
                    <span className="font-semibold text-slate-900">{clientsList.length} Clients</span>
                  </div>
                </div>
              </div>

              <div className="liquid-glass rounded-3xl p-6 border border-black/[0.08] bg-white/70 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-instrument italic text-2xl text-slate-950">Recent System Audit Trail</h3>
                  <button onClick={() => setActiveTab('activity')} className="text-xs text-slate-600 hover:text-black font-mono">
                    View all &rarr;
                  </button>
                </div>
                <div className="space-y-2">
                  {activityLogs.slice(0, 4).length > 0 ? (
                    activityLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-black/[0.04] text-xs flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-900">{log.action}</span>
                          <span className="text-slate-500 ml-2 font-mono">{log.entity_type}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 font-instrument italic py-4 text-center">No activity recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: WHATSAPP AUTOMATION ── */}
        {activeTab === 'whatsapp' && (
          <WhatsAppAutomationTab showNotification={showNotification} />
        )}

        {/* ── TAB: ORDERS & DELIVERIES ── */}
        {activeTab === 'orders' && (
          <OrdersManagementTab showNotification={showNotification} onViewWhatsAppLogs={() => setActiveTab('whatsapp')} />
        )}

        {/* ── TAB 2: TEAM MANAGEMENT & REGISTRATIONS ── */}
        {activeTab === 'team' && (() => {
          const newRegisteredDevelopers = developers.filter(
            (d) => (d.status === 'pending' || !d.is_verified)
          );
          const activeApprovedDevelopers = developers.filter(
            (d) => d.status === 'approved' && d.is_verified
          );

          return (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-instrument italic text-2xl text-slate-950">Engineering Team &amp; Registrations</h3>
                  <p className="text-slate-500 text-xs">
                    Review and approve new registered developers, manage core engineers, and update dynamic designations.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddDevOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
                >
                  <UserPlus size={13} /> Add Developer
                </button>
              </div>

              {/* ── SECTION 1: NEW REGISTERED DEVELOPERS ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-instrument italic text-xl text-slate-950">
                      New Registered Developers
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      {newRegisteredDevelopers.length} Pending Review
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                    Approve applicants to display them immediately on the public website.
                  </p>
                </div>

                <div className="liquid-glass rounded-3xl border border-amber-200/70 overflow-hidden shadow-sm bg-white/80">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-amber-50/60 border-b border-amber-200/50 text-slate-600 uppercase font-mono tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3.5 px-4">Applicant Developer</th>
                          <th className="py-3.5 px-4">Desired Title</th>
                          <th className="py-3.5 px-4">Department</th>
                          <th className="py-3.5 px-4">Experience &amp; Skills</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Approval Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.04]">
                        {newRegisteredDevelopers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-slate-400 font-instrument italic text-sm">
                              No pending developer registrations. All applicants have been reviewed and approved!
                            </td>
                          </tr>
                        ) : (
                          newRegisteredDevelopers.map((dev) => {
                            const devId = dev.id || dev.user_id || dev.user?.id;
                            const fullName = dev.full_name || dev.user?.full_name || 'Unnamed Developer';
                            const username = dev.username || dev.user?.username || '';
                            const email = dev.email || dev.user?.email || 'No email';
                            const phone = dev.phone || dev.user?.phone;
                            const avatarUrl = dev.avatar_url || dev.user?.avatar_url;
                            const title = dev.title || dev.developer_profile?.title || 'Software Engineer';
                            const department = dev.department || dev.developer_profile?.department || 'Core Engineering';
                            const yearsExp = dev.years_experience ?? dev.developer_profile?.years_experience ?? 1;
                            const skills = dev.skills || dev.developer_profile?.skills || [];

                            return (
                              <tr key={devId} className="hover:bg-amber-50/30 transition-colors">
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-3">
                                    {avatarUrl ? (
                                      <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover ring-1 ring-black/10" />
                                    ) : (
                                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-instrument italic font-semibold text-sm">
                                        {fullName.charAt(0)}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-semibold text-slate-900">{fullName}</div>
                                      <div className="text-[11px] text-slate-400 font-mono">
                                        {username ? `@${username}` : ''} {username && email ? '·' : ''} {email}
                                        {phone ? ` · ${phone}` : ''}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="font-mono text-slate-800 font-medium">{title}</span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700">
                                    {department}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="space-y-1">
                                    <span className="text-slate-600 font-mono">{yearsExp} yrs exp</span>
                                    {skills.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {skills.slice(0, 3).map((s: any) => (
                                          <span key={s.id || s.name || s} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 text-slate-600">
                                            {s.name || s}
                                          </span>
                                        ))}
                                        {skills.length > 3 && (
                                          <span className="text-[9px] font-mono text-slate-400">+{skills.length - 3}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-200">
                                    Pending Review
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleApproveDeveloper(dev)}
                                      className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                                      title="Approve & Publish to Website"
                                    >
                                      <Check size={12} />
                                      <span>Approve &amp; Go Live</span>
                                    </button>
                                    <button
                                      onClick={() => handleRejectDeveloper(dev)}
                                      className="p-1.5 rounded-lg liquid-glass border border-black/10 text-slate-400 hover:text-rose-600"
                                      title="Reject Application"
                                    >
                                      <X size={13} />
                                    </button>
                                    <button
                                      onClick={() => openEditDeveloper(dev)}
                                      className="p-1.5 rounded-lg liquid-glass border border-black/10 text-slate-600 hover:text-black"
                                      title="Edit Profile Details"
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDeveloper(devId, fullName)}
                                      className="p-1.5 rounded-lg liquid-glass border border-black/10 text-slate-400 hover:text-rose-600"
                                      title="Delete"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: CORE ENGINEERING SQUAD (APPROVED) ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-instrument italic text-xl text-slate-950">
                      Core Engineering Squad
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {activeApprovedDevelopers.length} Live on Website
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                    Verified engineers displayed on the public roster.
                  </p>
                </div>

                <div className="liquid-glass rounded-3xl border border-black/[0.08] overflow-hidden shadow-sm bg-white/70">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 border-b border-black/[0.06] text-slate-500 uppercase font-mono tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3.5 px-4">Developer</th>
                          <th className="py-3.5 px-4">Dynamic Designation</th>
                          <th className="py-3.5 px-4">Department</th>
                          <th className="py-3.5 px-4">Status &amp; Verification</th>
                          <th className="py-3.5 px-4">Experience</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.04]">
                        {activeApprovedDevelopers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400 font-instrument italic text-sm">
                              No approved developers yet. Approve registered developers above or click "Add Developer".
                            </td>
                          </tr>
                        ) : (
                          activeApprovedDevelopers.map((dev) => {
                            const devId = dev.id || dev.user_id || dev.user?.id;
                            const fullName = dev.full_name || dev.user?.full_name || 'Unnamed Developer';
                            const username = dev.username || dev.user?.username || '';
                            const email = dev.email || dev.user?.email || 'No email';
                            const phone = dev.phone || dev.user?.phone;
                            const avatarUrl = dev.avatar_url || dev.user?.avatar_url;
                            const title = dev.title || dev.developer_profile?.title || 'Software Engineer';
                            const department = dev.department || dev.developer_profile?.department || 'Core Engineering';
                            const status = dev.status || dev.user?.status || 'approved';
                            const isVerified = dev.is_verified ?? dev.user?.is_verified ?? true;
                            const yearsExp = dev.years_experience ?? dev.developer_profile?.years_experience ?? 0;

                            return (
                              <tr key={devId} className="hover:bg-black/[0.01] transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    {avatarUrl ? (
                                      <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-black/10" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-instrument italic text-slate-900 text-sm">
                                        {fullName.charAt(0)}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                        {fullName}
                                        {isVerified && (
                                          <CheckCircle2 size={13} className="text-emerald-600 fill-emerald-100" />
                                        )}
                                      </div>
                                      <div className="text-[11px] text-slate-400 font-mono">
                                        {username ? `@${username}` : ''} {username && email ? '·' : ''} {email}
                                        {phone ? ` · ${phone}` : ''}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-mono text-slate-800 font-medium">
                                    {title}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700">
                                    {department}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800">
                                      {status}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Verified &amp; Live
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-slate-600 font-mono">
                                  {yearsExp} yrs
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleToggleVerify(dev)}
                                      className="p-1.5 rounded-lg border bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors"
                                      title="Toggle Verification Status"
                                    >
                                      <ShieldCheck size={13} />
                                    </button>
                                    <button
                                      onClick={() => openEditDeveloper(dev)}
                                      className="p-1.5 rounded-lg liquid-glass border border-black/10 text-slate-600 hover:text-black"
                                      title="Edit Designation & Profile"
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                    <button
                                      onClick={() => { setResetPwUser({ id: devId, full_name: fullName }); setNewPassword(''); }}
                                      className="p-1.5 rounded-lg liquid-glass border border-black/10 text-slate-600 hover:text-black"
                                      title="Reset Password"
                                    >
                                      <Key size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDeveloper(devId, fullName)}
                                      className="p-1.5 rounded-lg liquid-glass border border-black/10 text-slate-400 hover:text-rose-600"
                                      title="Delete Developer"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── TAB 3: PROJECTS ── */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-instrument italic text-2xl text-slate-950">Platform Deliverables &amp; Projects</h3>
                <p className="text-slate-500 text-xs">All projects engineered with verified creator attribution.</p>
              </div>
              <Link
                to="/dashboard/my-projects?action=new"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Plus size={13} /> New Project
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {allProjects.map((p) => (
                <div key={p.id} className="liquid-glass rounded-3xl p-6 border border-black/[0.08] bg-white/70 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {p.category}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.status}
                      </span>
                    </div>
                    <h4 className="font-instrument italic text-xl text-slate-950">{p.name}</h4>
                    <p className="text-slate-600 text-xs line-clamp-2 mt-1">{p.short_description || p.description}</p>
                    
                    {/* Attributed Developers */}
                    <div className="mt-4 pt-3 border-t border-black/[0.04]">
                      <p className="text-[10px] font-mono uppercase text-slate-400 mb-1.5">Attributed Team:</p>
                      <div className="flex flex-wrap gap-1">
                        {p.developer_associations.map((assoc) => (
                          <span key={assoc.id} className="text-[11px] font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                            {assoc.developer?.user?.full_name} ({assoc.role_in_project})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between">
                    <Link to={`/projects/${p.slug}`} className="text-xs font-semibold text-slate-900 hover:text-black flex items-center gap-1">
                      <span>View Showcase</span> <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: CLIENTS ── */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-instrument italic text-2xl text-slate-950">Client Directory</h3>
              <p className="text-slate-500 text-xs">Registered clients and enterprise partners.</p>
            </div>

            <div className="liquid-glass rounded-3xl border border-black/[0.08] overflow-hidden bg-white/70">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-black/[0.06] text-slate-500 uppercase font-mono tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {clientsList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400 font-instrument italic">
                        No clients registered yet. Clients appear here upon registering or submitting consultations.
                      </td>
                    </tr>
                  ) : (
                    clientsList.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-4 font-semibold text-slate-900">{c.full_name}</td>
                        <td className="py-3 px-4 text-slate-600 font-mono">{c.client_profile?.company_name || 'Individual'}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{c.email}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono">{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 5: INQUIRIES ── */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-instrument italic text-2xl text-slate-950">Client Consultations &amp; Inquiries</h3>
              <p className="text-slate-500 text-xs">Direct consultation requests from prospective clients.</p>
            </div>

            <div className="space-y-4">
              {inquiries.length === 0 ? (
                <div className="liquid-glass rounded-3xl p-12 text-center text-slate-400 font-instrument italic bg-white/70 border border-black/[0.08]">
                  No inquiries received yet.
                </div>
              ) : (
                inquiries.map((inq) => (
                  <div key={inq.id} className="liquid-glass rounded-3xl p-6 border border-black/[0.08] bg-white/70 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {inq.project_type || 'Consultation'}
                        </span>
                        <h4 className="font-instrument italic text-xl text-slate-950 mt-1">{inq.project_name}</h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          From: {inq.client_name || inq.client?.full_name || 'Anonymous Client'} ({inq.client_email || inq.client?.email}) · {new Date(inq.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">Status:</span>
                        <select
                          value={inq.status}
                          onChange={(e) => handleInquiryStatus(inq.id, e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-black/10 bg-white text-xs font-mono font-semibold focus:outline-none"
                        >
                          {['New', 'Contacted', 'In Discussion', 'Proposal', 'In Progress', 'Completed', 'Closed'].map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-black/[0.04] whitespace-pre-wrap font-sans">
                      {inq.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── TAB 6: BRAND & SETTINGS ── */}
        {activeTab === 'brand' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h3 className="font-instrument italic text-2xl text-slate-950">Company Branding &amp; Platform Configuration</h3>
              <p className="text-slate-500 text-xs">Update your official company identity, logos, contacts, and legal notices.</p>
            </div>

            <form onSubmit={handleSaveBrandSettings} className="liquid-glass rounded-3xl p-8 border border-black/[0.08] bg-white/70 space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-2">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={brandForm.company_name || ''}
                    onChange={(e) => setBrandForm({ ...brandForm, company_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 text-slate-900 text-sm focus:border-black/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-2">Tagline</label>
                  <input
                    type="text"
                    value={brandForm.tagline || ''}
                    onChange={(e) => setBrandForm({ ...brandForm, tagline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 text-slate-900 text-sm focus:border-black/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-2">Logo URL</label>
                  <input
                    type="text"
                    value={brandForm.logo_url || ''}
                    onChange={(e) => setBrandForm({ ...brandForm, logo_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 text-slate-900 text-sm focus:border-black/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-2">Official Email</label>
                  <input
                    type="email"
                    value={brandForm.email || ''}
                    onChange={(e) => setBrandForm({ ...brandForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 text-slate-900 text-sm focus:border-black/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-2">Platform Description</label>
                <textarea
                  rows={3}
                  value={brandForm.description || ''}
                  onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 text-slate-900 text-sm focus:border-black/30 focus:outline-none resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-2">Phone</label>
                  <input
                    type="text"
                    value={brandForm.phone || ''}
                    onChange={(e) => setBrandForm({ ...brandForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 text-slate-900 text-sm focus:border-black/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-2">Website</label>
                  <input
                    type="text"
                    value={brandForm.website || ''}
                    onChange={(e) => setBrandForm({ ...brandForm, website: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 text-slate-900 text-sm focus:border-black/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-2">Business Hours</label>
                  <input
                    type="text"
                    value={brandForm.business_hours || ''}
                    onChange={(e) => setBrandForm({ ...brandForm, business_hours: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 text-slate-900 text-sm focus:border-black/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-2">Headquarters Address</label>
                <input
                  type="text"
                  value={brandForm.address || ''}
                  onChange={(e) => setBrandForm({ ...brandForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 text-slate-900 text-sm focus:border-black/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-2">Footer Copyright Text</label>
                <input
                  type="text"
                  value={brandForm.footer_copyright || ''}
                  onChange={(e) => setBrandForm({ ...brandForm, footer_copyright: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 text-slate-900 text-sm focus:border-black/30 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-black/[0.06] flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 7: ACTIVITY LOGS ── */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-instrument italic text-2xl text-slate-950">Executive Audit Trail</h3>
              <p className="text-slate-500 text-xs">Immutable chronological activity logs for compliance and accountability.</p>
            </div>

            <div className="liquid-glass rounded-3xl border border-black/[0.08] overflow-hidden bg-white/70">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-black/[0.06] text-slate-500 uppercase font-mono tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity Type</th>
                    <th className="py-3 px-4">Entity ID</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {activityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-instrument italic">
                        No activity records found yet.
                      </td>
                    </tr>
                  ) : (
                    activityLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-3 px-4 text-slate-400 font-mono">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{log.action}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{log.entity_type || '-'}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{log.entity_id || '-'}</td>
                        <td className="py-3 px-4 text-slate-700">{log.user?.full_name || 'CEO'}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{log.ip_address || '127.0.0.1'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── MODAL 1: ADD DEVELOPER ── */}
        {isAddDevOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-black/10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                <h3 className="font-instrument italic text-2xl text-slate-950">Add Verified Developer</h3>
                <button onClick={() => setIsAddDevOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-black">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateDeveloper} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newDevForm.full_name}
                      onChange={(e) => setNewDevForm({ ...newDevForm, full_name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={newDevForm.username}
                      onChange={(e) => setNewDevForm({ ...newDevForm, username: e.target.value })}
                      placeholder="e.g. rahul-sharma"
                      className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={newDevForm.email}
                      onChange={(e) => setNewDevForm({ ...newDevForm, email: e.target.value })}
                      placeholder="rahul@company.com"
                      className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={newDevForm.password}
                      onChange={(e) => setNewDevForm({ ...newDevForm, password: e.target.value })}
                      placeholder="Initial password"
                      className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-1">Designation / Title *</label>
                    <input
                      type="text"
                      required
                      value={newDevForm.title}
                      onChange={(e) => setNewDevForm({ ...newDevForm, title: e.target.value })}
                      placeholder="Senior Full Stack Engineer"
                      className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-1">Department *</label>
                    <input
                      type="text"
                      required
                      value={newDevForm.department}
                      onChange={(e) => setNewDevForm({ ...newDevForm, department: e.target.value })}
                      placeholder="Core Engineering"
                      className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-1">Skills (comma separated) *</label>
                  <input
                    type="text"
                    required
                    value={newDevForm.skills}
                    onChange={(e) => setNewDevForm({ ...newDevForm, skills: e.target.value })}
                    placeholder="Python, FastAPI, React, TypeScript"
                    className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06]">
                  <button
                    type="button"
                    onClick={() => setIsAddDevOpen(false)}
                    className="px-4 py-2 rounded-full border border-black/10 text-slate-600 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    Create Developer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL 2: EDIT DEVELOPER ── */}
        {editingDev && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-black/10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                <div>
                  <h3 className="font-instrument italic text-2xl text-slate-950">Edit Developer</h3>
                  <p className="text-slate-400 text-xs font-mono">{editingDev.full_name || editingDev.user?.full_name} (@{editingDev.username || editingDev.user?.username})</p>
                </div>
                <button onClick={() => setEditingDev(null)} className="p-1 rounded-full text-slate-400 hover:text-black">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveDeveloper} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-1">Dynamic Designation *</label>
                    <input
                      type="text"
                      required
                      value={editDevForm.title}
                      onChange={(e) => setEditDevForm({ ...editDevForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-1">Department *</label>
                    <input
                      type="text"
                      required
                      value={editDevForm.department}
                      onChange={(e) => setEditDevForm({ ...editDevForm, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-1">Account Status</label>
                    <select
                      value={editDevForm.status}
                      onChange={(e) => setEditDevForm({ ...editDevForm, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs focus:outline-none"
                    >
                      <option value="approved">Approved / Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-1">Years Experience</label>
                    <input
                      type="number"
                      value={editDevForm.years_experience}
                      onChange={(e) => setEditDevForm({ ...editDevForm, years_experience: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-semibold uppercase font-mono mb-1">Professional Bio</label>
                  <textarea
                    rows={3}
                    value={editDevForm.bio}
                    onChange={(e) => setEditDevForm({ ...editDevForm, bio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06]">
                  <button
                    type="button"
                    onClick={() => setEditingDev(null)}
                    className="px-4 py-2 rounded-full border border-black/10 text-slate-600 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL 3: RESET PASSWORD ── */}
        {resetPwUser && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-black/10 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                <h3 className="font-instrument italic text-xl text-slate-950">Reset Password</h3>
                <button onClick={() => setResetPwUser(null)} className="p-1 rounded-full text-slate-400 hover:text-black">
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Set a new password for <span className="font-semibold text-slate-900">{resetPwUser.full_name}</span> ({resetPwUser.email}).
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-slate-700 text-xs font-mono uppercase mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.06]">
                  <button
                    type="button"
                    onClick={() => setResetPwUser(null)}
                    className="px-4 py-1.5 rounded-full border border-black/10 text-slate-600 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
