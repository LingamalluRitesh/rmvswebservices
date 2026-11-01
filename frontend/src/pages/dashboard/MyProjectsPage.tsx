import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, FolderGit2, X, AlertCircle, Edit3, Trash2 } from 'lucide-react';
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

  // Create Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Websites');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [clientName, setClientName] = useState('');
  const [technologies, setTechnologies] = useState<string[]>(['React', 'FastAPI']);
  const [newTech, setNewTech] = useState('');
  const [selectedCoDevId, setSelectedCoDevId] = useState<number | ''>('');
  const [teamMembers, setTeamMembers] = useState<{ developer_id: number; role_in_project: string; is_lead: boolean }[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Form states
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Websites');
  const [editShortDescription, setEditShortDescription] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDemoUrl, setEditDemoUrl] = useState('');
  const [editRepoUrl, setEditRepoUrl] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editClientName, setEditClientName] = useState('');
  const [editStatus, setEditStatus] = useState('Published');
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

      const payload = {
        name,
        category,
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
    setShortDescription('');
    setDescription('');
    setDemoUrl('');
    setRepoUrl('');
    setImageUrl('');
    setClientName('');
    setTechnologies(['React', 'FastAPI']);
    setTeamMembers([]);
    setSelectedCoDevId('');
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setEditName(proj.name);
    setEditCategory(proj.category || 'Websites');
    setEditShortDescription(proj.short_description || '');
    setEditDescription(proj.description || '');
    setEditDemoUrl(proj.demo_url || '');
    setEditRepoUrl(proj.repo_url || '');
    setEditImageUrl(proj.image_url || '');
    setEditClientName(proj.client_name || '');
    setEditStatus(proj.status || 'Published');
    setEditTechnologies(proj.technologies?.map((t) => t.name) || []);
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setIsUpdating(true);
    setEditError(null);

    try {
      const res = await api.put(`/projects/${editingProject.id}`, {
        name: editName,
        category: editCategory,
        short_description: editShortDescription,
        description: editDescription,
        demo_url: editDemoUrl || null,
        repo_url: editRepoUrl || null,
        image_url: editImageUrl || null,
        client_name: editClientName || null,
        status: editStatus,
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
    'w-full bg-[#070e22] border border-blue-500/30 text-white rounded-xl text-slate-100 text-sm placeholder-slate-400 focus:border-black/30 focus:outline-none px-4 py-3 transition-colors shadow-2xs';

  return (
    <div className="min-h-screen bg-[#060b19] text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-instrument italic text-3xl sm:text-4xl text-white">
              Projects &amp; Attribution
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Publish, modify, or inspect projects engineered by you or your team.
            </p>
          </div>

          {user && (user.role === 'developer' || user.role === 'super_admin') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-slate-800 transition-colors self-start sm:self-auto shrink-0 shadow-sm"
            >
              <Plus size={15} />
              <span>Add New Project</span>
            </button>
          )}
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#070e22] text-slate-300/70 h-80 rounded-3xl animate-pulse border border-black/[0.05]" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="liquid-glass rounded-3xl text-center py-20 border border-blue-500/25 shadow-sm bg-[#0a1228]/85 text-white p-8">
            <FolderGit2 size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="font-instrument italic text-3xl text-white mb-2">No Projects Published Yet</h3>
            <p className="text-slate-600 text-sm max-w-sm mx-auto mb-8">
              Your database is completely clean! You can now create and publish your first project with full attribution.
            </p>
            {user && (user.role === 'developer' || user.role === 'super_admin') ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-full px-7 py-3 text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
              >
                Publish Your First Project
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
                  <div className="liquid-glass rounded-2xl p-3 px-5 flex items-center justify-between gap-3 border border-blue-500/25 shadow-2xs bg-[#0a1228]/85 text-white">
                    <span className="text-xs text-slate-500 font-mono">
                      Status: <span className="text-slate-100 font-semibold">{proj.status}</span>
                    </span>
                    {canEdit ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(proj)}
                          className="px-3.5 py-1.5 rounded-full liquid-glass text-xs font-medium text-slate-700 hover:text-black hover:bg-[#070e22] text-slate-300 border border-blue-500/25 transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <Edit3 size={12} />
                          <span>Modify</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj)}
                          className="px-3.5 py-1.5 rounded-full liquid-glass text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 shadow-2xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto liquid-glass rounded-3xl border border-blue-500/25 p-6 sm:p-8 shadow-2xl bg-[#0a1228] text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-black rounded-full liquid-glass border border-blue-500/25 transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="font-instrument italic text-2xl text-white mb-1">Add New Project</h2>
            <p className="text-slate-500 text-xs mb-6">
              Projects require at least one verified developer. You will be automatically attributed as Lead Developer.
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
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Autonomous Telemetry Grid"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={inputCls}
                  >
                    <option value="Websites">Websites</option>
                    <option value="Apps">Mobile Apps</option>
                    <option value="Software">Enterprise Software</option>
                    <option value="AI/ML">AI / Machine Learning</option>
                    <option value="SaaS">Enterprise SaaS</option>
                    <option value="Automation">Automation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Short Summary *</label>
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
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Full Project Overview *</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Technical specifications, system design, key highlights, challenges solved…"
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Client / Enterprise Sponsor</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Apex Dynamics Ltd"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Cover Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Live Demo URL</label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://demo.example.com"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Repository URL</label>
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
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Technologies</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {technologies.map((t) => (
                    <span key={t} className="liquid-glass text-xs text-slate-700 px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-500/25 bg-[#070e22] text-slate-300 font-mono">
                      {t}
                      <button type="button" onClick={() => removeTech(t)} className="text-slate-400 hover:text-black">
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
                    placeholder="Add technology (e.g. Redis, PyTorch, Docker)"
                    className={inputCls}
                  />
                  <button type="button" onClick={addTech} className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs font-semibold hover:bg-slate-800 shrink-0 shadow-sm">
                    Add
                  </button>
                </div>
              </div>

              {/* Co-Developers / Team Attribution */}
              <div>
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Attributed Co-Developers</label>
                {teamMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {teamMembers.map((m) => {
                      const dev = availableDevelopers.find((d) => d.id === m.developer_id);
                      return (
                        <span key={m.developer_id} className="liquid-glass text-xs text-slate-700 px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-500/25 bg-[#070e22] text-slate-300 font-mono">
                          <span>{dev ? dev.user.full_name || dev.user.username : `Developer #${m.developer_id}`} ({m.role_in_project})</span>
                          <button type="button" onClick={() => removeTeamMember(m.developer_id)} className="text-slate-400 hover:text-black">
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
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 shrink-0 shadow-sm"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No other registered developers to attribute yet.</p>
                )}
              </div>

              <div className="pt-4 border-t border-blue-500/15 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full liquid-glass text-xs font-medium text-slate-600 hover:text-black border border-blue-500/25"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? 'Publishing…' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Project Modal (Modify Published Projects) ── */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto liquid-glass rounded-3xl border border-blue-500/25 p-6 sm:p-8 shadow-2xl bg-[#0a1228] text-white">
            <button
              onClick={() => setEditingProject(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-black rounded-full liquid-glass border border-blue-500/25 transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="font-instrument italic text-2xl text-white mb-1">Modify Published Project</h2>
            <p className="text-slate-500 text-xs mb-6">
              Update technical details, live endpoints, descriptions, or status for <span className="text-slate-100 font-medium">{editingProject.name}</span>.
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
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Category *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className={inputCls}
                  >
                    <option value="Websites">Websites</option>
                    <option value="Apps">Mobile Apps</option>
                    <option value="Software">Enterprise Software</option>
                    <option value="AI/ML">AI / Machine Learning</option>
                    <option value="SaaS">Enterprise SaaS</option>
                    <option value="Automation">Automation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className={inputCls}
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Client Name</label>
                  <input
                    type="text"
                    value={editClientName}
                    onChange={(e) => setEditClientName(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Short Description</label>
                <input
                  type="text"
                  value={editShortDescription}
                  onChange={(e) => setEditShortDescription(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Full Project Overview</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Live Demo URL</label>
                  <input
                    type="url"
                    value={editDemoUrl}
                    onChange={(e) => setEditDemoUrl(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Source Repository URL</label>
                  <input
                    type="url"
                    value={editRepoUrl}
                    onChange={(e) => setEditRepoUrl(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Cover Image URL</label>
                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono">Technologies</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editTechnologies.map((t) => (
                    <span key={t} className="liquid-glass text-xs text-slate-700 px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-500/25 bg-[#070e22] text-slate-300 font-mono">
                      {t}
                      <button type="button" onClick={() => removeEditTech(t)} className="text-slate-400 hover:text-black">
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
                  <button type="button" onClick={addEditTech} className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs font-semibold hover:bg-slate-800 shrink-0 shadow-sm">
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-blue-500/15 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-5 py-2.5 rounded-full liquid-glass text-xs font-medium text-slate-600 hover:text-black border border-blue-500/25"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-7 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 shadow-sm"
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
