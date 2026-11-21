import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus, FolderGit2, X, AlertCircle, Edit3, Trash2,
  Activity
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { Project, DeveloperProfile } from '../../types';
import { ProjectCard } from '../../components/projects/ProjectCard';

export const MyProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableDevelopers, setAvailableDevelopers] = useState<DeveloperProfile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'new');
  const [isLoading, setIsLoading] = useState(true);

  // High-Resolution Engineering Poster Presets
  const posterPresets = [
    {
      title: 'Health & TeleMedicine EHR',
      category: 'Software',
      desc: 'Clinical EHR suite with WebRTC video consultation & HIPAA compliance',
      url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Autonomous Fleet & IoT Telematics',
      category: 'Apps',
      desc: 'Edge computing telematics hub for autonomous trucks & heavy machinery',
      url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Clean Energy & Solar Grid',
      category: 'Websites',
      desc: 'Commercial rooftop solar arrays & smart inverter telemetry',
      url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Industrial RO & Water Treatment',
      category: 'Websites',
      desc: 'Heavy industrial reverse osmosis plant & membrane monitoring',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'AI Cloud Analytics & Big Data',
      category: 'Software',
      desc: 'Distributed trace waterfalls and ML anomaly classification',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Cinematic Photography & Studio Proofing',
      category: 'Websites',
      desc: '3D client gallery with interactive proofing & media CDN',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  // Create Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Websites');
  const [status, setStatus] = useState('Published');
  const [currentStage, setCurrentStage] = useState('Sprint 3: WebRTC Video & EHR Integration');
  const [progressPercentage, setProgressPercentage] = useState(65);
  const [completionDate, setCompletionDate] = useState('Dec 2026');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [clientName, setClientName] = useState('');
  const [technologies, setTechnologies] = useState<string[]>(['React', 'FastAPI', 'TypeScript']);
  const [newTech, setNewTech] = useState('');
  const [selectedCoDevId, setSelectedCoDevId] = useState<number | ''>('');
  const [teamMembers, setTeamMembers] = useState<{ developer_id: number; role_in_project: string; is_lead: boolean }[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Form states
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Websites');
  const [editStatus, setEditStatus] = useState('Published');
  const [editCurrentStage, setEditCurrentStage] = useState('');
  const [editProgressPercentage, setEditProgressPercentage] = useState(70);
  const [editCompletionDate, setEditCompletionDate] = useState('');
  const [editShortDescription, setEditShortDescription] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDemoUrl, setEditDemoUrl] = useState('');
  const [editRepoUrl, setEditRepoUrl] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editClientName, setEditClientName] = useState('');
  const [editTechnologies, setEditTechnologies] = useState<string[]>([]);
  const [editNewTech, setEditNewTech] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchMyProjects();
    fetchVerifiedDevelopers();
  }, [user]);

  const fetchMyProjects = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let endpoint = `/projects?developer_username=${user.username}`;
      if (user.role === 'super_admin') {
        endpoint = '/projects';
      }
      const res = await api.get(endpoint);
      setProjects(res.data);
    } catch (e) {
      console.error('Error fetching my projects', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVerifiedDevelopers = async () => {
    try {
      const res = await api.get('/developers');
      setAvailableDevelopers(res.data);
    } catch (e) {
      console.error('Error fetching developers', e);
    }
  };

  const addTech = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies([...technologies, newTech.trim()]);
      setNewTech('');
    }
  };

  const removeTech = (t: string) => {
    setTechnologies(technologies.filter((tech) => tech !== t));
  };

  const addEditTech = () => {
    if (editNewTech.trim() && !editTechnologies.includes(editNewTech.trim())) {
      setEditTechnologies([...editTechnologies, editNewTech.trim()]);
      setEditNewTech('');
    }
  };

  const removeEditTech = (t: string) => {
    setEditTechnologies(editTechnologies.filter((tech) => tech !== t));
  };

  const handleAddCoDev = () => {
    if (!selectedCoDevId) return;
    if (teamMembers.some((m) => m.developer_id === selectedCoDevId)) return;
    setTeamMembers([
      ...teamMembers,
      { developer_id: selectedCoDevId, role_in_project: 'Software Engineer', is_lead: false },
    ]);
    setSelectedCoDevId('');
  };

  const removeTeamMember = (devId: number) => {
    setTeamMembers(teamMembers.filter((m) => m.developer_id !== devId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      let finalTeam = [...teamMembers];
      if (user.developer_profile) {
        if (!finalTeam.some((m) => m.developer_id === user.developer_profile?.id)) {
          finalTeam = [
            { developer_id: user.developer_profile.id, role_in_project: 'Lead Developer', is_lead: true },
            ...finalTeam,
          ];
        }
      }

      if (finalTeam.length === 0 && availableDevelopers.length > 0) {
        finalTeam = [
          { developer_id: availableDevelopers[0].id, role_in_project: 'Lead Developer', is_lead: true },
        ];
      }

      if (finalTeam.length === 0 && user.role !== 'super_admin') {
        setFormError('At least one verified developer must be attributed to this project.');
        setIsSubmitting(false);
        return;
      }

      const isOngoingType = status === 'Ongoing' || status === 'In Progress';

      const payload = {
        name,
        category,
        status,
        progress_percentage: isOngoingType ? Number(progressPercentage) : 100,
        current_stage: isOngoingType ? currentStage : 'Production Live',
        completion_date: completionDate || null,
        short_description: shortDescription,
        description,
        demo_url: demoUrl || null,
        repo_url: repoUrl || null,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
        client_name: clientName || null,
        technologies,
        team_members: finalTeam.length > 0 ? finalTeam : null,
      };

      const res = await api.post('/projects', payload);
      setProjects([res.data, ...projects]);
      setIsModalOpen(false);
      resetCreateForm();
    } catch (err: any) {
      console.error('Failed to create project', err);
      const detail = err.response?.data?.detail;
      const errorMsg =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d: any) => `${d.loc ? d.loc.slice(1).join('.') : 'field'}: ${d.msg}`).join(', ')
          : err.message || 'Failed to create project. Check your inputs.';
      setFormError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setName('');
    setCategory('Websites');
    setStatus('Published');
    setProgressPercentage(65);
    setCurrentStage('Sprint 3: WebRTC Video & EHR Integration');
    setCompletionDate('Dec 2026');
    setShortDescription('');
    setDescription('');
    setDemoUrl('');
    setRepoUrl('');
    setImageUrl('');
    setClientName('');
    setTechnologies(['React', 'FastAPI', 'TypeScript']);
    setTeamMembers([]);
    setSelectedCoDevId('');
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setEditName(proj.name);
    setEditCategory(proj.category || 'Websites');
    setEditStatus(proj.status || 'Published');
    setEditProgressPercentage(proj.progress_percentage ?? 70);
    setEditCurrentStage(proj.current_stage || 'Sprint 2: Architecture & Implementation');
    setEditCompletionDate(proj.completion_date || '');
    setEditShortDescription(proj.short_description || '');
    setEditDescription(proj.description || '');
    setEditDemoUrl(proj.demo_url || '');
    setEditRepoUrl(proj.repo_url || '');
    setEditImageUrl(proj.image_url || '');
    setEditClientName(proj.client_name || '');
    setEditTechnologies(proj.technologies?.map((t) => t.name) || []);
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setIsUpdating(true);
    setEditError(null);

    const isOngoingType = editStatus === 'Ongoing' || editStatus === 'In Progress';

    try {
      const res = await api.put(`/projects/${editingProject.id}`, {
        name: editName,
        category: editCategory,
        status: editStatus,
        progress_percentage: isOngoingType ? Number(editProgressPercentage) : 100,
        current_stage: isOngoingType ? editCurrentStage : 'Production Live',
        completion_date: editCompletionDate || null,
        short_description: editShortDescription,
        description: editDescription,
        demo_url: editDemoUrl || null,
        repo_url: editRepoUrl || null,
        image_url: editImageUrl || null,
        client_name: editClientName || null,
        technologies: editTechnologies,
      });

      setProjects(projects.map((p) => (p.id === editingProject.id ? res.data : p)));
      setEditingProject(null);
    } catch (err: any) {
      console.error('Failed to update project', err);
      const detail = err.response?.data?.detail;
      const errorMsg =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d: any) => `${d.loc ? d.loc.slice(1).join('.') : 'field'}: ${d.msg}`).join(', ')
          : err.message || 'Failed to update project.';
      setEditError(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async (p: Project) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${p.name}"?`);
    if (!confirmDelete) return;

    try {
      await api.delete(`/projects/${p.id}`);
      setProjects(projects.filter((item) => item.id !== p.id));
    } catch (err: any) {
      console.error('Failed to delete project', err);
      alert(err.response?.data?.detail || 'Failed to delete project.');
    }
  };

  const inputCls =
    'w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none px-4 py-3 transition-colors shadow-2xs';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-blue-600 selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <p className="text-blue-600 text-xs tracking-widest uppercase font-mono font-semibold">
                Project Publishing &amp; Ongoing Sprints
              </p>
            </div>
            <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-900">
              Projects &amp; Working Sprints
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Post new working projects with posters and sprint details so clients and visitors can track your ongoing software builds.
            </p>
          </div>

          {user && (user.role === 'developer' || user.role === 'super_admin') && (
            <button
              onClick={() => {
                resetCreateForm();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 py-2.5 text-xs shadow-md hover:scale-105 transition-all self-start sm:self-auto shrink-0 cursor-pointer"
            >
              <Plus size={15} />
              <span>Post New Project / Sprint</span>
            </button>
          )}
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-100 h-80 rounded-3xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-3xl text-center py-20 border border-slate-200 shadow-sm bg-white text-slate-800 p-8 max-w-2xl mx-auto">
            <FolderGit2 size={48} className="mx-auto text-blue-600 mb-4" />
            <h3 className="font-sans font-bold text-2xl text-slate-900 mb-2">No Projects Published Yet</h3>
            <p className="text-slate-600 text-sm max-w-sm mx-auto mb-8">
              Post your first live or ongoing project with authentic posters, sprint milestones, and verified developer attribution.
            </p>
            {user && (user.role === 'developer' || user.role === 'super_admin') ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-7 py-3 text-xs shadow-md transition-all cursor-pointer"
              >
                Post Your First Project
              </button>
            ) : (
              <p className="text-xs text-slate-500 font-mono">
                Log in as an authorized developer to publish projects.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((proj) => {
              const canEdit = user && (
                user.role === 'super_admin' ||
                proj.developer_associations?.some((assoc: any) =>
                  assoc.developer?.user_id === user.id ||
                  assoc.developer?.user?.username === user.username
                )
              );

              return (
                <div key={proj.id} className="space-y-3">
                  <ProjectCard project={proj} />
                  {/* Modification Action Bar */}
                  <div className="rounded-2xl p-3 px-5 flex items-center justify-between gap-3 border border-slate-200 shadow-2xs bg-white text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono">Status:</span>
                      <span className={`text-xs font-semibold font-mono px-2 py-0.5 rounded-full ${
                        proj.status?.toLowerCase() === 'ongoing' || proj.status?.toLowerCase() === 'in progress'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {proj.status}
                      </span>
                    </div>

                    {canEdit ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(proj)}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Edit3 size={12} />
                          <span>Modify</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj)}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono italic">
                        Attributed Contributor
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create Project Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xl bg-white text-slate-800 my-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-800 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <h2 className="font-sans font-bold text-2xl text-slate-900">Post New Project or Active Sprint</h2>
            </div>
            <p className="text-slate-500 text-xs mb-6">
              Share your working projects or production systems with real-life imagery, live progress telemetry, and team attribution.
            </p>

            {formError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Zenith TeleHealth Suite"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={inputCls}
                  >
                    <option value="Websites">Websites</option>
                    <option value="Apps">Mobile Apps</option>
                    <option value="Software">Enterprise Software</option>
                    <option value="Digital Solutions">AI / Digital Solutions</option>
                  </select>
                </div>
              </div>

              {/* Status Picker: Published vs Ongoing Sprint */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Project Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={inputCls}
                  >
                    <option value="Ongoing">⚡ Ongoing (Active Sprint &amp; Development)</option>
                    <option value="In Progress">🛠️ In Progress (Engineering Sprints)</option>
                    <option value="Published">🚀 Published (Production Live)</option>
                    <option value="Draft">📝 Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Client / Enterprise Sponsor</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Apex Health Systems"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Ongoing Sprint Details Box */}
              {(status === 'Ongoing' || status === 'In Progress') && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-900">
                    <Activity size={14} className="text-amber-600" />
                    <span>Ongoing Sprint &amp; Roadmap Details (Visible to Public)</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs tracking-wider uppercase mb-1 font-mono font-semibold">
                      Current Milestone / Sprint Stage *
                    </label>
                    <input
                      type="text"
                      required
                      value={currentStage}
                      onChange={(e) => setCurrentStage(e.target.value)}
                      placeholder="e.g. Sprint 3: Real-Time WebRTC Video & EHR Integration"
                      className={inputCls}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-700 text-xs tracking-wider uppercase font-mono font-semibold">
                          Live Development Progress
                        </label>
                        <span className="text-xs font-bold font-mono text-amber-900">{progressPercentage}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progressPercentage}
                        onChange={(e) => setProgressPercentage(Number(e.target.value))}
                        className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-xs tracking-wider uppercase mb-1 font-mono font-semibold">
                        Target Launch / Release Date *
                      </label>
                      <input
                        type="text"
                        required
                        value={completionDate}
                        onChange={(e) => setCompletionDate(e.target.value)}
                        placeholder="e.g. Dec 2026 or Q1 2027"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Short Summary *</label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="One sentence pitch for the project showcase card…"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Full Project Overview *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Technical specifications, architecture design, key milestones, challenges solved…"
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Poster Presets Selector */}
              <div>
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">
                  Select Project Poster Visual or Custom Image URL
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {posterPresets.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`p-2 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                        imageUrl === preset.url
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="h-16 w-full rounded-lg overflow-hidden bg-slate-200">
                        <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-900 truncate">{preset.title}</span>
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or enter custom poster URL (https://images.unsplash.com/...)"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Live Demo / Staging URL</label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://demo.example.com"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Repository URL</label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Technologies</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {technologies.map((t) => (
                    <span key={t} className="text-xs text-blue-700 font-medium px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-200 bg-blue-50">
                      {t}
                      <button type="button" onClick={() => removeTech(t)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                    placeholder="Add technology (e.g. Next.js, Redis, Docker)"
                    className={inputCls}
                  />
                  <button type="button" onClick={addTech} className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 transition-colors shadow-2xs cursor-pointer">
                    Add
                  </button>
                </div>
              </div>

              {/* Co-Developers */}
              <div>
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Attributed Co-Developers</label>
                {teamMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {teamMembers.map((m) => {
                      const dev = availableDevelopers.find((d) => d.id === m.developer_id);
                      return (
                        <span key={m.developer_id} className="text-xs text-slate-700 px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-200 bg-slate-50 font-mono">
                          <span>{dev ? dev.user.full_name || dev.user.username : `Developer #${m.developer_id}`} ({m.role_in_project})</span>
                          <button type="button" onClick={() => removeTeamMember(m.developer_id)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                {availableDevelopers.length > 0 ? (
                  <div className="flex gap-2">
                    <select
                      value={selectedCoDevId}
                      onChange={(e) => setSelectedCoDevId(e.target.value ? Number(e.target.value) : '')}
                      className={inputCls}
                    >
                      <option value="">Select a registered developer to attribute...</option>
                      {availableDevelopers
                        .filter((d) => d.id !== user?.developer_profile?.id && !teamMembers.some((m) => m.developer_id === d.id))
                        .map((dev) => (
                          <option key={dev.id} value={dev.id}>
                            {dev.user.full_name || dev.user.username} ({dev.title || 'Developer'})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddCoDev}
                      disabled={!selectedCoDevId}
                      className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-40 shrink-0 shadow-2xs cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No other registered developers to attribute yet.</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Posting Project & Alerting CEO…' : 'Post Project & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Project Modal ── */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xl bg-white text-slate-800 my-6">
            <button
              onClick={() => setEditingProject(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-800 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h2 className="font-sans font-bold text-2xl text-slate-900 mb-1">Modify Project / Sprint</h2>
            <p className="text-slate-500 text-xs mb-6">
              Update status, live sprint progress, posters, or specifications for <strong className="text-slate-900">{editingProject.name}</strong>.
            </p>

            {editError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-500" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Category *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className={inputCls}
                  >
                    <option value="Websites">Websites</option>
                    <option value="Apps">Mobile Apps</option>
                    <option value="Software">Enterprise Software</option>
                    <option value="Digital Solutions">AI / Digital Solutions</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className={inputCls}
                  >
                    <option value="Published">🚀 Published (Production Live)</option>
                    <option value="Ongoing">⚡ Ongoing (Active Sprint &amp; Development)</option>
                    <option value="In Progress">🛠️ In Progress (Engineering Sprints)</option>
                    <option value="Draft">📝 Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Client Name</label>
                  <input
                    type="text"
                    value={editClientName}
                    onChange={(e) => setEditClientName(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Ongoing Sprint Details Box in Edit Modal */}
              {(editStatus === 'Ongoing' || editStatus === 'In Progress') && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-900">
                    <Activity size={14} className="text-amber-600" />
                    <span>Ongoing Sprint &amp; Roadmap Milestone Details</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs tracking-wider uppercase mb-1 font-mono font-semibold">
                      Current Milestone / Sprint Stage *
                    </label>
                    <input
                      type="text"
                      value={editCurrentStage}
                      onChange={(e) => setEditCurrentStage(e.target.value)}
                      placeholder="e.g. Sprint 4: Autonomous Map Routing & Fleet Edge"
                      className={inputCls}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-700 text-xs tracking-wider uppercase font-mono font-semibold">
                          Live Progress
                        </label>
                        <span className="text-xs font-bold font-mono text-amber-900">{editProgressPercentage}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editProgressPercentage}
                        onChange={(e) => setEditProgressPercentage(Number(e.target.value))}
                        className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-xs tracking-wider uppercase mb-1 font-mono font-semibold">
                        Target Launch Date
                      </label>
                      <input
                        type="text"
                        value={editCompletionDate}
                        onChange={(e) => setEditCompletionDate(e.target.value)}
                        placeholder="e.g. Jan 2027"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Short Description</label>
                <input
                  type="text"
                  value={editShortDescription}
                  onChange={(e) => setEditShortDescription(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Full Project Overview</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Live Demo URL</label>
                  <input
                    type="url"
                    value={editDemoUrl}
                    onChange={(e) => setEditDemoUrl(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Source Repository URL</label>
                  <input
                    type="url"
                    value={editRepoUrl}
                    onChange={(e) => setEditRepoUrl(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Cover Image URL</label>
                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold">Technologies</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editTechnologies.map((t) => (
                    <span key={t} className="text-xs text-blue-700 font-medium px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-200 bg-blue-50">
                      {t}
                      <button type="button" onClick={() => removeEditTech(t)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editNewTech}
                    onChange={(e) => setEditNewTech(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEditTech(); } }}
                    placeholder="Add technology"
                    className={inputCls}
                  />
                  <button type="button" onClick={addEditTech} className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 transition-colors shadow-2xs cursor-pointer">
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-7 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 shadow-md transition-all cursor-pointer"
                >
                  {isUpdating ? 'Saving Changes…' : 'Save Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
