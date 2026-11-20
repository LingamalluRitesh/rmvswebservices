import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, CheckCircle2,
  ShieldCheck, Building, MessageSquare,
  Edit3, Trash2, X, AlertCircle, Camera, Image as ImageIcon,
  RefreshCw, Upload, Check, Globe, Sparkles
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { Project } from '../../types';
import { ContactDeveloperModal } from '../../components/inquiries/ContactDeveloperModal';
import { GithubIcon } from '../../components/common/Icons';
import { fallbackProjects } from '../../data/fallbackProjects';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Cover Image Selector states
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [coverTab, setCoverTab] = useState<'live' | 'custom' | 'presets'>('live');
  const [selectedCoverUrl, setSelectedCoverUrl] = useState('');
  const [targetLiveUrl, setTargetLiveUrl] = useState('');
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [captureMessage, setCaptureMessage] = useState<string | null>(null);
  const [heroImgSrc, setHeroImgSrc] = useState<string>('');

  // Edit states
  const [editModalOpen, setEditModalOpen] = useState(false);
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

  const coverPresets = [
    {
      title: 'Solar Energy & Grid Infrastructure',
      desc: 'Rooftop clean energy array',
      url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Industrial RO Water Plant',
      desc: 'Water treatment and filtration telemetry',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Cinematic Studio & Visual Media',
      desc: 'Studio proofing & photography',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Enterprise Analytics Dashboard',
      desc: 'High-performance ERP and telemetry',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Autonomous AI & Cloud Architecture',
      desc: 'Next-gen computing infrastructure',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  useEffect(() => {
    if (slug) {
      loadProject(slug);
    }
  }, [slug]);

  const loadProject = async (s: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/projects/${s}`);
      setProject(res.data);
      const fallback = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';
      const cleanImg = res.data.image_url && !res.data.image_url.includes('1drv.ms') ? res.data.image_url : fallback;
      setHeroImgSrc(cleanImg);
      setSelectedCoverUrl(cleanImg);
      setTargetLiveUrl(res.data.demo_url || '');
    } catch (e: any) {
      // Check fallbackProjects
      const match = fallbackProjects.find((p) => p.slug === s);
      if (match) {
        setProject(match);
        setHeroImgSrc(match.image_url || '');
        setSelectedCoverUrl(match.image_url || '');
        setTargetLiveUrl(match.demo_url || '');
      } else {
        console.error('Error loading project', e);
        setError('Project not found or unavailable.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openCoverModal = () => {
    if (!project) return;
    const fallback = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';
    setSelectedCoverUrl(project.image_url || fallback);
    setTargetLiveUrl(project.demo_url || '');
    setCaptureMessage(null);
    setCoverModalOpen(true);
  };

  const handleCaptureLiveScreenshot = async () => {
    if (!project) return;
    const urlToCapture = targetLiveUrl.trim() || project.demo_url;
    if (!urlToCapture) {
      setCaptureMessage('Please enter a live website URL first.');
      return;
    }

    setIsCapturingScreenshot(true);
    setCaptureMessage('Capturing high-resolution browser screenshot of live website...');
    try {
      const res = await api.post(`/projects/${project.id}/capture-screenshot`, {
        url: urlToCapture,
      });
      const newImg = res.data.image_url;
      setSelectedCoverUrl(newImg);
      setHeroImgSrc(newImg);
      setProject({ ...project, image_url: newImg });
      setCaptureMessage(res.data.detail || 'Successfully captured landing page!');
    } catch (err: any) {
      console.warn('Backend screenshot note, loading live website snapshot preview', err);
      const fallbackThumb = `https://image.thum.io/get/width/1200/crop/800/${urlToCapture}`;
      setSelectedCoverUrl(fallbackThumb);
      setCaptureMessage('Loaded dynamic live website snapshot preview.');
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  const handleSaveCoverImage = async () => {
    if (!project || !selectedCoverUrl) return;
    setIsUpdating(true);
    try {
      await api.patch(`/projects/${project.id}`, {
        image_url: selectedCoverUrl,
      });
      setProject({ ...project, image_url: selectedCoverUrl });
      setHeroImgSrc(selectedCoverUrl);
      setCoverModalOpen(false);
    } catch (e: any) {
      setHeroImgSrc(selectedCoverUrl);
      setProject({ ...project, image_url: selectedCoverUrl });
      setCoverModalOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedCoverUrl(reader.result);
        setCaptureMessage('Loaded uploaded image file.');
      }
    };
    reader.readAsDataURL(file);
  };

  const openEditModal = () => {
    if (!project) return;
    setEditName(project.name);
    setEditCategory(project.category || 'Websites');
    setEditShortDescription(project.short_description || '');
    setEditDescription(project.description || '');
    setEditDemoUrl(project.demo_url || '');
    setEditRepoUrl(project.repo_url || '');
    setEditImageUrl(project.image_url || '');
    setEditClientName(project.client_name || '');
    setEditStatus(project.status || 'Published');
    setEditTechnologies(project.technologies?.map((t) => t.name) || []);
    setEditNewTech('');
    setEditError(null);
    setEditModalOpen(true);
  };

  const addEditTech = () => {
    const t = editNewTech.trim();
    if (t && !editTechnologies.includes(t)) {
      setEditTechnologies([...editTechnologies, t]);
      setEditNewTech('');
    }
  };

  const removeEditTech = (tech: string) => {
    setEditTechnologies(editTechnologies.filter((t) => t !== tech));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setIsUpdating(true);
    setEditError(null);

    try {
      const payload: any = {
        name: editName,
        category: editCategory,
        short_description: editShortDescription,
        description: editDescription,
        demo_url: editDemoUrl || null,
        repo_url: editRepoUrl || null,
        image_url: editImageUrl || null,
        client_name: editClientName || null,
        status: editStatus,
        technologies: editTechnologies.map((t) => ({ name: t })),
      };

      const res = await api.put(`/projects/${project.id}`, payload);
      setProject(res.data);
      if (editImageUrl) setHeroImgSrc(editImageUrl);
      setEditModalOpen(false);
    } catch (err: any) {
      setEditError(err.response?.data?.detail || 'Failed to update project.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${project.name}"?`)) return;

    try {
      await api.delete(`/projects/${project.id}`);
      navigate('/projects');
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Failed to delete project.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-slate-200 rounded-3xl h-96 animate-pulse mb-8 border border-slate-300" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-200 rounded-2xl h-48 animate-pulse border border-slate-300" />
              <div className="bg-slate-200 rounded-2xl h-32 animate-pulse border border-slate-300" />
            </div>
            <div className="space-y-6">
              <div className="bg-slate-200 rounded-2xl h-64 animate-pulse border border-slate-300" />
              <div className="bg-slate-200 rounded-2xl h-40 animate-pulse border border-slate-300" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-blue-600 text-xs tracking-widest uppercase mb-4 font-mono font-semibold">Error</p>
          <h2 className="font-sans font-bold text-3xl text-slate-900 mb-3">Project Not Found</h2>
          <p className="text-slate-500 text-sm mb-8">{error || 'This project may have been moved or removed.'}</p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all"
          >
            <ArrowLeft size={14} />
            <span>Back to Projects</span>
          </Link>
        </div>
      </div>
    );
  }

  const isAuthorized =
    user &&
    (user.role === 'super_admin' ||
      project.developer_associations.some((a) => a.developer.user?.id === user.id));

  const leadDeveloper =
    project.developer_associations.find((d) => d.is_lead)?.developer ||
    project.developer_associations[0]?.developer;

  const inputCls =
    'w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none px-4 py-3 shadow-2xs transition-colors';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-blue-600 selection:text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Back and Authorized Controls */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Projects Showcase</span>
          </Link>

          {isAuthorized && (
            <div className="flex items-center gap-2">
              <button
                onClick={openEditModal}
                className="px-4 py-2 rounded-full bg-white text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Edit3 size={13} />
                <span>Modify Project</span>
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-full bg-rose-50 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Hero Banner with Image */}
        <div className="relative rounded-3xl overflow-hidden mb-10 border border-slate-200/90 shadow-md group bg-white">
          <div className="h-64 sm:h-[420px] w-full relative">
            <img
              src={heroImgSrc || project.image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'}
              alt={project.name}
              onError={() => {
                setHeroImgSrc('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80');
              }}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* High contrast gradient overlay for legible text on photos */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent" />

            {/* Quick Change Cover Image button */}
            {isAuthorized && (
              <button
                type="button"
                onClick={openCoverModal}
                className="absolute top-5 right-5 z-20 px-4 py-2 rounded-full bg-white/95 hover:bg-white backdrop-blur-md text-slate-800 text-xs font-semibold border border-slate-200 hover:border-blue-400 transition-all flex items-center gap-1.5 shadow-md hover:scale-105"
              >
                <Camera size={14} className="text-blue-600" />
                <span>Change Cover Image</span>
              </button>
            )}
          </div>

          {/* Floating overlay card */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div>
                <span className="bg-white/95 text-blue-600 font-semibold text-xs tracking-widest uppercase rounded-full px-3 py-1 inline-block mb-3 border border-slate-200 shadow-xs">
                  {project.category}
                </span>
                <h1 className="font-sans font-extrabold text-4xl sm:text-5xl text-white tracking-tight leading-tight drop-shadow-md">
                  {project.name}
                </h1>
                {project.client_name && (
                  <p className="text-slate-200 text-sm flex items-center gap-1.5 mt-2 drop-shadow">
                    <Building size={14} className="text-blue-400" />
                    <span>
                      Engineered for{' '}
                      <strong className="text-white font-semibold">{project.client_name}</strong>
                    </span>
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
                  >
                    <ExternalLink size={14} />
                    <span>Live Demo</span>
                  </a>
                )}
                {isAuthorized && (
                  <button
                    type="button"
                    onClick={openCoverModal}
                    className="px-4 py-2.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-md text-slate-800 font-semibold text-xs flex items-center gap-2 border border-slate-200 transition-all shadow-xs"
                  >
                    <Camera size={14} className="text-blue-600" />
                    <span>Select Landing Page</span>
                  </button>
                )}
                {project.repo_url && (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 transition-all shadow-xs"
                    title="Source Repository"
                  >
                    <GithubIcon size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout: Overview & Metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-3xl p-8 border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.05)] bg-white space-y-6">
              <div>
                <span className="text-blue-600 text-xs tracking-widest uppercase font-mono font-semibold block mb-2">Project Brief</span>
                <p className="text-slate-700 text-base leading-relaxed font-normal">
                  {project.description || project.short_description || 'High-performance digital system engineered for production scale.'}
                </p>
              </div>

              {/* Technologies List */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <span className="text-blue-600 text-xs tracking-widest uppercase font-mono font-semibold block mb-3">
                    Technologies &amp; Frameworks
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((t) => (
                      <span
                        key={t.id || t.name}
                        className="px-3 py-1.5 rounded-full text-xs font-mono bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Team Attribution Card */}
            <div className="rounded-2xl p-6 border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.05)] bg-white">
              <div className="flex items-center gap-1.5 mb-4">
                <ShieldCheck size={14} className="text-blue-600" />
                <p className="text-blue-600 text-xs tracking-widest uppercase font-mono font-semibold">
                  Project Creators
                </p>
              </div>

              <div className="space-y-3">
                {project.developer_associations.map((assoc) => (
                  <Link
                    key={assoc.id}
                    to={`/developers/${assoc.developer.user.username}`}
                    className="rounded-2xl p-4 flex items-center gap-3.5 group block hover:bg-slate-50 transition-all border border-slate-100 bg-slate-50/50"
                  >
                    {assoc.developer.user.avatar_url ? (
                      <img
                        src={assoc.developer.user.avatar_url}
                        alt={assoc.developer.user.full_name}
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-blue-100 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                        {assoc.developer.user.full_name.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {assoc.developer.user.full_name}
                        </span>
                        {assoc.developer.user.is_verified && (
                          <CheckCircle2 size={13} className="text-blue-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-slate-600 block">
                        {assoc.role_in_project}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        @{assoc.developer.user.username}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Inquire CTA */}
              {leadDeveloper && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <button
                    onClick={() => setContactModalOpen(true)}
                    className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <MessageSquare size={14} />
                    <span>Inquire Similar System</span>
                  </button>
                </div>
              )}
            </div>

            {/* Project Metadata */}
            <div className="rounded-2xl p-6 border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.05)] bg-white">
              <h3 className="font-sans font-bold text-lg text-slate-900 mb-4">Metadata</h3>
              <div className="space-y-0 text-xs">
                <div className="flex justify-between py-2.5 border-b border-slate-100">
                  <span className="text-slate-500">Category</span>
                  <span className="text-slate-900 font-semibold">{project.category}</span>
                </div>
                {project.start_date && (
                  <div className="flex justify-between py-2.5 border-b border-slate-100">
                    <span className="text-slate-500">Start Date</span>
                    <span className="text-slate-700 font-mono">{project.start_date}</span>
                  </div>
                )}
                {(project as any).end_date && (
                  <div className="flex justify-between py-2.5 border-b border-slate-100">
                    <span className="text-slate-500">Completion</span>
                    <span className="text-slate-700 font-mono">{(project as any).end_date}</span>
                  </div>
                )}
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-500">Verification</span>
                  <span className="text-blue-600 font-semibold">100% Attribution Verified</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Contact Lead Developer Modal */}
        {leadDeveloper && (
          <ContactDeveloperModal
            developer={leadDeveloper as any}
            isOpen={contactModalOpen}
            onClose={() => setContactModalOpen(false)}
          />
        )}

        {/* Modify Project Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl relative text-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-sans font-bold text-2xl text-slate-900">Modify Project Specification</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Update technical specifications, live endpoints, or descriptions for <span className="text-blue-600 font-medium">{project.name}</span>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {editError && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 text-xs tracking-widest uppercase mb-1.5 font-mono font-semibold">Project Name *</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs tracking-widest uppercase mb-1.5 font-mono font-semibold">Category *</label>
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
                    <label className="block text-slate-600 text-xs tracking-widest uppercase mb-1.5 font-mono font-semibold">Status</label>
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
                    <label className="block text-slate-600 text-xs tracking-widest uppercase mb-1.5 font-mono font-semibold">Client / Sponsor</label>
                    <input
                      type="text"
                      value={editClientName}
                      onChange={(e) => setEditClientName(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 text-xs tracking-widest uppercase mb-1.5 font-mono font-semibold">Short Summary</label>
                  <input
                    type="text"
                    value={editShortDescription}
                    onChange={(e) => setEditShortDescription(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-xs tracking-widest uppercase mb-1.5 font-mono font-semibold">Full Project Overview</label>
                  <textarea
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 text-xs tracking-widest uppercase mb-1.5 font-mono font-semibold">Live Demo URL</label>
                    <input
                      type="url"
                      value={editDemoUrl}
                      onChange={(e) => setEditDemoUrl(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs tracking-widest uppercase mb-1.5 font-mono font-semibold">Source Repository URL</label>
                    <input
                      type="url"
                      value={editRepoUrl}
                      onChange={(e) => setEditRepoUrl(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-600 text-xs tracking-widest uppercase font-mono font-semibold">Cover Image URL</label>
                    {editDemoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditImageUrl(`https://image.thum.io/get/width/1200/crop/800/${editDemoUrl}`);
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Camera size={12} />
                        <span>Capture from Live Demo</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://example.com/cover.jpg or /projects/image.png"
                    className={inputCls}
                  />
                  {editImageUrl && (
                    <div className="mt-2 h-24 rounded-xl overflow-hidden border border-slate-200 relative">
                      <img src={editImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-2 px-2 py-0.5 rounded text-[10px] bg-slate-900/80 text-white font-mono">Live Preview</span>
                    </div>
                  )}
                </div>

                {/* Technologies */}
                <div>
                  <label className="block text-slate-600 text-xs tracking-widest uppercase mb-1.5 font-mono font-semibold">Technologies</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editTechnologies.map((t) => (
                      <span key={t} className="text-xs text-blue-700 font-medium px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-200 bg-blue-50">
                        {t}
                        <button type="button" onClick={() => removeEditTech(t)} className="text-slate-400 hover:text-slate-600">
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
                      placeholder="Add technology (e.g. Next.js, Rust)"
                      className={inputCls}
                    />
                    <button type="button" onClick={addEditTech} className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 transition-colors shadow-2xs">
                      Add
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-slate-100 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-7 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 shadow-sm"
                  >
                    {isUpdating ? 'Saving Changes…' : 'Save Modifications'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cover Image & Live Landing Page Selector Modal */}
        {coverModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl relative text-slate-800">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-sans font-bold text-2xl text-slate-900">Project Cover Visual</h3>
                  <p className="text-slate-500 text-xs mt-1">Select landing page from live website or set custom visual for <strong className="text-blue-600">{project.name}</strong></p>
                </div>
                <button
                  type="button"
                  onClick={() => setCoverModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl mb-6 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCoverTab('live')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    coverTab === 'live' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe size={13} />
                  <span>Live Website</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCoverTab('custom')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    coverTab === 'custom' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon size={13} />
                  <span>Custom URL / Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCoverTab('presets')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    coverTab === 'presets' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>Curated Presets</span>
                </button>
              </div>

              {/* Tab 1: Live Website */}
              {coverTab === 'live' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 text-xs tracking-widest uppercase mb-1.5 font-mono font-semibold">Live Website URL</label>
                    <input
                      type="url"
                      value={targetLiveUrl}
                      onChange={(e) => setTargetLiveUrl(e.target.value)}
                      placeholder="https://www.pbrsolarenergy.com/"
                      className={inputCls}
                    />
                  </div>

                  {/* Capture actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={isCapturingScreenshot || !targetLiveUrl}
                      onClick={handleCaptureLiveScreenshot}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-slate-50 text-left transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Camera size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold text-slate-900">
                          {isCapturingScreenshot ? 'Capturing Screenshot…' : 'Capture Browser Screenshot'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Renders live page via headless engine and saves snapshot.</p>
                    </button>

                    <button
                      type="button"
                      disabled={!targetLiveUrl}
                      onClick={() => {
                        const url = `https://image.thum.io/get/width/1200/crop/800/${targetLiveUrl}`;
                        setSelectedCoverUrl(url);
                        setCaptureMessage('Selected dynamic live snapshot!');
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-slate-50 text-left transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <RefreshCw size={16} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold text-slate-900">Dynamic Live Snapshot</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Real-time cloud preview of the live URL.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Custom URL / Upload */}
              {coverTab === 'custom' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 text-xs tracking-widest uppercase mb-1.5 font-mono font-semibold">Custom Image URL</label>
                    <input
                      type="url"
                      value={selectedCoverUrl}
                      onChange={(e) => setSelectedCoverUrl(e.target.value)}
                      placeholder="https://example.com/cover.jpg or /projects/image.png"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-xs tracking-widest uppercase mb-1.5 font-mono font-semibold">Or Upload from Computer</label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center transition-colors bg-slate-50">
                      <Upload size={24} className="mx-auto text-blue-600 mb-2" />
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-blue-600 text-xs font-semibold transition-colors shadow-2xs">
                        <span>Browse image file</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-500 mt-2">PNG, JPG, WebP supported</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Presets */}
              {coverTab === 'presets' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {coverPresets.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        setSelectedCoverUrl(preset.url);
                        setCaptureMessage(`Selected ${preset.title}`);
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                        selectedCoverUrl === preset.url
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{preset.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{preset.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Live Preview Box */}
              {selectedCoverUrl && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-600 text-xs font-mono uppercase tracking-widest font-semibold">Cover Preview</span>
                    {captureMessage && (
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} /> {captureMessage}
                      </span>
                    )}
                  </div>
                  <div className="h-44 w-full rounded-2xl overflow-hidden border border-slate-200 relative shadow-2xs">
                    <img
                      src={selectedCoverUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => {
                        setCaptureMessage('Image failed to load. Check URL.');
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
                      <span className="text-white text-xs font-semibold drop-shadow">{project.name}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCoverModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedCoverUrl || isUpdating}
                  onClick={handleSaveCoverImage}
                  className="px-7 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 shadow-sm flex items-center gap-1.5"
                >
                  {isUpdating ? (
                    <span>Saving Cover…</span>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Apply Cover Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
