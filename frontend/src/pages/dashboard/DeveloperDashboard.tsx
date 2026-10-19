import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Clock, Eye, FolderGit2, MessageSquare,
  Plus, Users, ArrowRight, ExternalLink, Star, Edit3, X,
  Camera, AlertCircle
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { ClientInquiry, Project } from '../../types';
import { CustomerWhatsAppPreferenceCard } from '../../components/dashboard/CustomerWhatsAppPreferenceCard';

export const DeveloperDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [inquiries, setInquiries] = useState<ClientInquiry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    avatar_url: '',
    title: '',
    short_bio: '',
    bio: '',
    location: '',
    availability: 'Available for Projects',
    years_experience: 1,
    skills: [] as string[],
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
    resume_url: '',
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      if (['super_admin', 'developer'].includes(user.role)) {
        const [inqRes, projRes] = await Promise.all([
          api.get('/inquiries/developer'),
          api.get(`/projects?developer_username=${user.username}`),
        ]);
        setInquiries(inqRes.data);
        setProjects(projRes.data);
      } else if (user.role === 'client') {
        const inqRes = await api.get('/inquiries/client');
        setInquiries(inqRes.data);
      }
    } catch (e) {
      console.error('Error loading dashboard data', e);
    }
  };

  const openEditModal = () => {
    if (!user) return;
    const devP = user.developer_profile;
    setFormData({
      full_name: user.full_name || '',
      phone: user.phone || '',
      avatar_url: user.avatar_url || '',
      title: devP?.title || '',
      short_bio: devP?.short_bio || '',
      bio: devP?.bio || '',
      location: devP?.location || '',
      availability: devP?.availability || 'Available for Projects',
      years_experience: devP?.years_experience || 1,
      skills: devP?.skills ? devP.skills.map((s) => s.name) : [],
      github_url: devP?.github_url || '',
      linkedin_url: devP?.linkedin_url || '',
      portfolio_url: devP?.portfolio_url || '',
      resume_url: devP?.resume_url || '',
    });
    setSkillInput('');
    setSaveError(null);
    setIsEditModalOpen(true);
  };

  const handleAddSkill = () => {
    const clean = skillInput.trim();
    if (clean && !formData.skills.includes(clean)) {
      setFormData({ ...formData, skills: [...formData.skills, clean] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      await api.put('/developers/me', {
        ...formData,
        years_experience: Number(formData.years_experience),
      });

      setSaveSuccess('Your profile has been updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3500);
      setIsEditModalOpen(false);
      await refreshUser();
    } catch (err: any) {
      console.error('Error updating profile', err);
      setSaveError(err.response?.data?.detail || 'Failed to update profile. Please verify your inputs.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  const isDeveloper = user.role === 'developer' || user.role === 'super_admin';
  const isApproved = user.status === 'approved' && user.is_verified;
  const isPending = user.status === 'pending';

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">

        {/* Success Alert */}
        {saveSuccess && (
          <div className="liquid-glass rounded-2xl p-4 flex items-center gap-3 border border-emerald-200 bg-emerald-50/80 text-emerald-800 text-sm shadow-2xs">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{saveSuccess}</span>
          </div>
        )}

        {/* Top Welcome Card */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-sm bg-white/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-black/[0.08] shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-black/[0.08] flex items-center justify-center text-slate-900 text-2xl font-bold shadow-2xs">
                {user.full_name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-instrument italic text-3xl text-slate-950">
                  Welcome back, {user.full_name}
                </h1>
                {user.is_verified && (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400 font-mono">
                  @{user.username} · {user.role.toUpperCase()}
                </span>
                {isApproved && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {isDeveloper
                  ? user.developer_profile?.title || 'Full-Stack Developer'
                  : user.client_profile?.company_name || 'Client Account'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openEditModal}
              className="bg-black text-white rounded-full px-4 py-2 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition-all shadow-sm"
            >
              <Edit3 size={13} />
              <span>Edit Profile</span>
            </button>

            {isDeveloper && (
              <Link
                to={`/developers/${user.username}`}
                className="liquid-glass text-slate-800 rounded-full px-4 py-2 text-xs font-semibold flex items-center gap-2 border border-black/10 hover:bg-slate-50 transition-all shadow-2xs"
              >
                <ExternalLink size={13} />
                <span>Full Details</span>
              </Link>
            )}

            {isDeveloper && (
              <Link
                to="/dashboard/my-projects?action=new"
                className="bg-black text-white rounded-full px-4 py-2 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition-all shadow-sm"
              >
                <Plus size={13} />
                <span>Add Project</span>
              </Link>
            )}
          </div>
        </div>

        {/* Verification Status Banner */}
        {user.role === 'developer' && isPending && (
          <div className="liquid-glass rounded-2xl p-5 border border-amber-200 bg-amber-50/60 flex items-start gap-4 text-amber-900 shadow-2xs">
            <Clock size={22} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-instrument italic text-lg text-amber-950">
                Developer Application Pending Review
              </h3>
              <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                Your profile is currently under review by our executive team (CEO Ritesh Lingamallu).
                Once approved, you will receive the{' '}
                <strong className="text-amber-950 font-semibold">Verified Builder Badge</strong>, your profile will be publicly listed,
                and you can publish projects with official attribution.
              </p>
            </div>
          </div>
        )}

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="liquid-glass rounded-2xl p-6 border border-black/[0.08] shadow-sm bg-white/70">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-xs tracking-wider uppercase font-mono">
                {isDeveloper ? 'Client Inquiries' : 'Inquiries Sent'}
              </span>
              <MessageSquare size={16} className="text-slate-400" />
            </div>
            <div className="text-3xl font-bold text-slate-950">{inquiries.length}</div>
            <p className="text-xs text-slate-500 mt-1">Direct project requests</p>
          </div>

          {isDeveloper ? (
            <>
              <div className="liquid-glass rounded-2xl p-6 border border-black/[0.08] shadow-sm bg-white/70">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-xs tracking-wider uppercase font-mono">
                    Projects
                  </span>
                  <FolderGit2 size={16} className="text-slate-400" />
                </div>
                <div className="text-3xl font-bold text-slate-950">{projects.length}</div>
                <p className="text-xs text-slate-500 mt-1">Credited as Lead / Contributor</p>
              </div>

              <div className="liquid-glass rounded-2xl p-6 border border-black/[0.08] shadow-sm bg-white/70">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-xs tracking-wider uppercase font-mono">
                    Impressions
                  </span>
                  <Eye size={16} className="text-slate-400" />
                </div>
                <div className="text-3xl font-bold text-slate-950">
                  {user.developer_profile?.views_count || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">Verified directory views</p>
              </div>
            </>
          ) : (
            <>
              <div className="liquid-glass rounded-2xl p-6 border border-black/[0.08] shadow-sm bg-white/70">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-xs tracking-wider uppercase font-mono">
                    Conversations
                  </span>
                  <Users size={16} className="text-slate-400" />
                </div>
                <div className="text-3xl font-bold text-slate-950">{inquiries.length}</div>
                <p className="text-xs text-slate-500 mt-1">Live direct discussions</p>
              </div>

              <div className="liquid-glass rounded-2xl p-6 border border-black/[0.08] shadow-sm bg-white/70">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-xs tracking-wider uppercase font-mono">
                    Company
                  </span>
                  <Star size={16} className="text-slate-400" />
                </div>
                <div className="text-sm font-semibold text-slate-950 mt-1">
                  {user.client_profile?.company_name || 'Client'}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {user.client_profile?.industry || 'Verified Client'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Inquiries Section */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-sm bg-white/70 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-instrument italic text-2xl text-slate-950">
                {isDeveloper ? 'Incoming Project Inquiries' : 'Your Sent Inquiries'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isDeveloper
                  ? 'Client requirements submitted directly to you from your projects or profile.'
                  : 'Project requests sent to our verified developers.'}
              </p>
            </div>
            <Link
              to="/dashboard/inquiries"
              className="text-xs font-semibold text-slate-600 hover:text-black flex items-center gap-1 transition-colors"
            >
              <span>View All CRM Inquiries</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {inquiries.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-black/10 rounded-2xl bg-slate-50/50">
              <MessageSquare size={34} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">No project inquiries yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {isDeveloper
                  ? 'When clients discover your projects in the showcase, their requests will appear here.'
                  : 'Browse verified developers and submit your first project requirement!'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.06]">
              {inquiries.slice(0, 5).map((inq) => (
                <div
                  key={inq.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-slate-900">{inq.project_name}</h4>
                      <span className="liquid-glass text-slate-700 text-xs px-2.5 py-0.5 rounded-full border border-black/10 bg-slate-50 font-mono">
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 mb-1">{inq.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>
                        {isDeveloper
                          ? `From: ${inq.client?.full_name || 'Client'}`
                          : `Target: ${inq.developer?.user?.full_name || 'Developer'}`}
                      </span>
                      <span>·</span>
                      <span>Scope: {inq.budget_range || 'Production Build'}</span>
                      <span>·</span>
                      <span>Timeline: {inq.timeline || 'Flexible'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to="/dashboard/inquiries"
                      className="liquid-glass text-slate-800 rounded-full px-4 py-1.5 text-xs font-semibold border border-black/10 hover:bg-slate-50 transition-all shadow-2xs"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Projects Section ── */}
        {isDeveloper && (
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-sm bg-white/70 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-instrument italic text-2xl text-slate-950">
                  My Projects &amp; Case Studies
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Portfolio projects attributed to you. You can add new projects and edit your existing projects.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard/my-projects?action=new"
                  className="bg-black text-white rounded-full px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Plus size={13} />
                  <span>Add Project</span>
                </Link>
                <Link
                  to="/dashboard/my-projects"
                  className="liquid-glass text-slate-700 rounded-full px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 border border-black/10 hover:bg-slate-50 transition-colors"
                >
                  <span>Manage All</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-black/10 rounded-2xl bg-slate-50/50">
                <FolderGit2 size={34} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-700">No projects added yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                  Showcase your engineering capabilities! Publish your apps, APIs, websites, or case studies.
                </p>
                <Link
                  to="/dashboard/my-projects?action=new"
                  className="inline-flex items-center gap-1.5 bg-black text-white rounded-full px-5 py-2 text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Plus size={13} /> Add First Project
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="liquid-glass rounded-2xl p-4 border border-black/[0.08] bg-white flex flex-col justify-between shadow-2xs hover:shadow-sm transition-shadow">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {proj.category || 'Engineering'}
                          </span>
                          <h4 className="font-instrument italic text-lg text-slate-950 mt-1">
                            {proj.name}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {proj.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                        {proj.short_description || proj.description}
                      </p>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {proj.technologies.slice(0, 3).map((t) => (
                            <span key={t.id || t.name} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-50 text-slate-600 border border-black/[0.06]">
                              {t.name}
                            </span>
                          ))}
                          {proj.technologies.length > 3 && (
                            <span className="text-[10px] font-mono text-slate-400">+{proj.technologies.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between gap-2">
                      <Link
                        to={`/projects/${proj.slug}`}
                        className="text-xs text-slate-600 hover:text-black font-semibold flex items-center gap-1"
                      >
                        <span>View Project</span>
                        <ExternalLink size={11} />
                      </Link>
                      <Link
                        to="/dashboard/my-projects"
                        className="px-3 py-1 rounded-full liquid-glass text-xs font-medium text-slate-700 hover:text-black border border-black/10 flex items-center gap-1 shadow-2xs"
                      >
                        <Edit3 size={11} />
                        <span>Edit</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── WhatsApp Preferences Section ── */}
        <CustomerWhatsAppPreferenceCard />

      </div>

      {/* ── Edit Profile Modal ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-black/10 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-black/[0.08] flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-base shadow-xs">
                  {formData.full_name ? formData.full_name.charAt(0) : user.username.charAt(0)}
                </div>
                <div>
                  <h2 className="font-instrument italic text-xl text-slate-950">
                    Edit Your Profile
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    @{user.username} · {user.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-black hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-900">
              {saveError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-500" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Profile Picture */}
              <div className="space-y-3 pb-4 border-b border-black/[0.06]">
                <label className="block text-slate-700 text-xs font-semibold uppercase tracking-wider font-mono">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-black/10 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-black/10 flex items-center justify-center text-slate-400">
                      <Camera size={22} />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <input
                      type="url"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                      className="w-full bg-slate-50 border border-black/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black/30"
                    />
                    <p className="text-[11px] text-slate-400">
                      Direct image link (JPG/PNG). Leave empty to use initial letter.
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-black/[0.06]">
                <div>
                  <label className="block text-slate-700 text-xs font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-slate-50 border border-black/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-black/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 ..."
                    className="w-full bg-slate-50 border border-black/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-black/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-medium mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Full-Stack Engineer"
                    className="w-full bg-slate-50 border border-black/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-black/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Bengaluru, India"
                    className="w-full bg-slate-50 border border-black/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-black/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-medium mb-1">Availability</label>
                  <input
                    type="text"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    placeholder="e.g. Available for Projects"
                    className="w-full bg-slate-50 border border-black/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-black/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-medium mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.years_experience}
                    onChange={(e) => setFormData({ ...formData, years_experience: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-black/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-black/30"
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3 pb-4 border-b border-black/[0.06]">
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider font-mono">
                  Skills ({formData.skills.length})
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-black/10 min-h-[48px]">
                  {formData.skills.length === 0 ? (
                    <span className="text-slate-400 text-xs italic">No skills added yet.</span>
                  ) : (
                    formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-white border border-black/10 text-slate-800 text-xs font-mono flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Type skill name and press Enter or click Add"
                    className="flex-1 bg-slate-50 border border-black/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-black/30"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="bg-black text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xs"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Bios */}
              <div className="space-y-3 pb-4 border-b border-black/[0.06]">
                <div>
                  <label className="block text-slate-700 text-xs font-medium mb-1">Short Bio</label>
                  <input
                    type="text"
                    value={formData.short_bio}
                    onChange={(e) => setFormData({ ...formData, short_bio: e.target.value })}
                    placeholder="Brief 1-sentence tagline..."
                    className="w-full bg-slate-50 border border-black/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-black/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-medium mb-1">Full Bio</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Full description of your background and achievements..."
                    className="w-full bg-slate-50 border border-black/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-black/30 resize-none"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-xs font-medium mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full bg-slate-50 border border-black/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-black/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-medium mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-slate-50 border border-black/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-black/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-medium mb-1">Portfolio / Website</label>
                  <input
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-black/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-black/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-medium mb-1">Resume Link</label>
                  <input
                    type="url"
                    value={formData.resume_url}
                    onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-black/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-black/30"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-black/[0.08] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-black hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-black text-white hover:bg-slate-800 disabled:opacity-50 px-6 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                >
                  <span>{isSaving ? 'Saving…' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
