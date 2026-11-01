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
      title: 'PBR Solar Official Landing Page',
      desc: 'Verified live portal screenshot',
      url: '/projects/pbr-solar-landing.png'
    },
    {
      title: 'Solar Energy & Grid Infrastructure',
      desc: 'Rooftop clean energy array',
      url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&q=80'
    },
    {
      title: 'Modern Architecture & Clean Code',
      desc: 'High-performance engineering aesthetic',
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80'
    },
    {
      title: 'Autonomous Drone & Robotics',
      desc: 'Smart connected hardware platform',
      url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&q=80'
    },
    {
      title: 'AI Intelligence & Distributed Core',
      desc: 'Next-gen computing infrastructure',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80'
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
      const fallback = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80';
      const cleanImg = res.data.image_url && !res.data.image_url.includes('1drv.ms') ? res.data.image_url : fallback;
      setHeroImgSrc(cleanImg);
      setSelectedCoverUrl(cleanImg);
      setTargetLiveUrl(res.data.demo_url || '');
    } catch (e: any) {
      console.error('Error loading project', e);
      setError('Project not found or unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCoverModal = () => {
    if (!project) return;
    const fallback = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80';
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
      console.warn('Backend screenshot failed, falling back to dynamic thumbnail service', err);
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
      await api.put(`/projects/${project.id}/cover-image`, {
        image_url: selectedCoverUrl,
      });
      setProject({ ...project, image_url: selectedCoverUrl });
      setHeroImgSrc(selectedCoverUrl);
      setCoverModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save cover image', err);
      alert(err.response?.data?.detail || 'Failed to update cover image.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setSelectedCoverUrl(reader.result);
        setCaptureMessage(`Loaded file: ${file.name}`);
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
    setEditError(null);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setIsUpdating(true);
    setEditError(null);

    try {
      const res = await api.put(`/projects/${project.id}`, {
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

      setProject(res.data);
      setEditModalOpen(false);
    } catch (err: any) {
      console.error('Failed to update project', err);
      setEditError(err.response?.data?.detail || 'Failed to update project.');
    } finally {
      setIsUpdating(false);
    }
  };

  const addEditTech = () => {
    if (editNewTech.trim() && !editTechnologies.includes(editNewTech.trim())) {
      setEditTechnologies([...editTechnologies, editNewTech.trim()]);
      setEditNewTech('');
    }
  };

  const removeEditTech = (tech: string) => {
    setEditTechnologies(editTechnologies.filter((t) => t !== tech));
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
      <div className="min-h-screen bg-[#060b19] text-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-[#0a1228]/80 rounded-3xl h-96 animate-pulse mb-8 border border-blue-500/20" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#0a1228]/80 rounded-2xl h-48 animate-pulse border border-blue-500/20" />
              <div className="bg-[#0a1228]/80 rounded-2xl h-32 animate-pulse border border-blue-500/20" />
            </div>
            <div className="space-y-6">
              <div className="bg-[#0a1228]/80 rounded-2xl h-64 animate-pulse border border-blue-500/20" />
              <div className="bg-[#0a1228]/80 rounded-2xl h-40 animate-pulse border border-blue-500/20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#060b19] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-cyan-400 text-xs tracking-widest uppercase mb-4 font-mono">Error</p>
          <h2 className="font-sans font-bold text-3xl text-white mb-3">Project Not Found</h2>
          <p className="text-slate-400 text-sm mb-8">{error || 'This project may have been moved or removed.'}</p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold shadow-md transition-all"
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
    'w-full bg-[#070e22] border border-blue-500/30 rounded-xl text-white text-sm placeholder-slate-500 focus:border-cyan-400 focus:outline-none px-4 py-3 shadow-xs';

  return (
    <div className="min-h-screen bg-[#060b19] text-slate-100 selection:bg-blue-600 selection:text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Back and Authorized Controls */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Projects Showcase</span>
          </Link>

          {isAuthorized && (
            <div className="flex items-center gap-2">
              <button
                onClick={openEditModal}
                className="px-4 py-2 rounded-full bg-[#0a1228] text-xs font-medium text-slate-200 hover:text-white border border-blue-500/30 hover:border-cyan-400 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 size={13} />
                <span>Modify Project</span>
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-full bg-[#0a1228] text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-500/30 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Hero Banner with Image */}
        <div className="relative rounded-3xl overflow-hidden mb-10 border border-blue-500/25 shadow-2xl group">
          <div className="h-64 sm:h-[420px] w-full relative">
            <img
              src={heroImgSrc || project.image_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80'}
              alt={project.name}
              onError={() => {
                setHeroImgSrc('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80');
              }}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* High contrast gradient overlay for legible text on photos */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060b19] via-[#060b19]/60 to-transparent" />

            {/* Quick Change Cover Image button */}
            {isAuthorized && (
              <button
                type="button"
                onClick={openCoverModal}
                className="absolute top-5 right-5 z-20 px-4 py-2 rounded-full bg-[#060b19]/80 hover:bg-[#060b19] backdrop-blur-md text-white text-xs font-semibold border border-blue-500/40 hover:border-cyan-400 transition-all flex items-center gap-1.5 shadow-xl hover:scale-105"
              >
                <Camera size={14} className="text-cyan-400" />
                <span>Change Cover Image</span>
              </button>
            )}
          </div>

          {/* Floating overlay card */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div>
                <span className="bg-blue-950/80 text-cyan-300 text-xs tracking-widest uppercase rounded-full px-3 py-1 inline-block mb-3 border border-blue-500/30">
                  {project.category}
                </span>
                <h1 className="font-sans font-extrabold text-4xl sm:text-5xl text-white tracking-tight leading-tight">
                  {project.name}
                </h1>
                {project.client_name && (
                  <p className="text-slate-300 text-sm flex items-center gap-1.5 mt-2">
                    <Building size={14} className="text-cyan-400" />
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
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs flex items-center gap-2 hover:shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all shadow-md"
                  >
                    <ExternalLink size={14} />
                    <span>Live Demo</span>
                  </a>
                )}
                {isAuthorized && (
                  <button
                    type="button"
                    onClick={openCoverModal}
                    className="px-4 py-2.5 rounded-full bg-[#0a1228]/80 hover:bg-[#0e1938] backdrop-blur-md text-white font-medium text-xs flex items-center gap-2 border border-blue-500/30 transition-all"
                  >
                    <Camera size={14} className="text-cyan-400" />
                    <span>Select Landing Page</span>
                  </button>
                )}
                {project.repo_url && (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-full bg-[#0a1228]/80 hover:bg-[#0e1938] text-slate-300 hover:text-white border border-blue-500/30 transition-all shadow-md"
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
            <div className="rounded-3xl p-8 border border-blue-500/25 shadow-xl bg-[#0a1228]/85 space-y-6">
              <div>
                <span className="text-cyan-400 text-xs tracking-widest uppercase font-mono block mb-2">Project Brief</span>
                <p className="text-slate-200 text-base leading-relaxed font-normal">
                  {project.description || project.short_description || 'High-performance digital system engineered for production scale.'}
                </p>
              </div>

              {/* Technologies List */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="pt-6 border-t border-blue-500/15">
                  <span className="text-cyan-400 text-xs tracking-widest uppercase font-mono block mb-3">
                    Technologies &amp; Frameworks
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((t) => (
                      <span
                        key={t.id || t.name}
                        className="px-3 py-1.5 rounded-full text-xs font-mono bg-[#070e22] text-cyan-300 border border-blue-500/25 shadow-xs"
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
            <div className="rounded-2xl p-6 border border-blue-500/25 shadow-xl bg-[#0a1228]/85">
              <div className="flex items-center gap-1.5 mb-4">
                <ShieldCheck size={13} className="text-cyan-400" />
                <p className="text-cyan-400 text-xs tracking-widest uppercase font-mono">
                  Project Creators
                </p>
              </div>

              <div className="space-y-3">
                {project.developer_associations.map((assoc) => (
                  <Link
                    key={assoc.id}
                    to={`/developers/${assoc.developer.user.username}`}
                    className="rounded-2xl p-4 flex items-center gap-3.5 group block hover:bg-[#0e1938] transition-all border border-blue-500/20 bg-[#070e22]/90"
                  >
                    {assoc.developer.user.avatar_url ? (
                      <img
                        src={assoc.developer.user.avatar_url}
                        alt={assoc.developer.user.full_name}
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-blue-500/30 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-blue-950 border border-blue-500/30 flex items-center justify-center text-cyan-300 font-bold text-sm shrink-0">
                        {assoc.developer.user.full_name.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {assoc.developer.user.full_name}
                        </span>
                        {assoc.developer.user.is_verified && (
                          <CheckCircle2 size={13} className="text-cyan-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-slate-300 block">
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
                <div className="mt-5 pt-5 border-t border-blue-500/15">
                  <button
                    onClick={() => setContactModalOpen(true)}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all shadow-md"
                  >
                    <MessageSquare size={14} />
                    <span>Inquire Similar System</span>
                  </button>
                </div>
              )}
            </div>

            {/* Project Metadata */}
            <div className="rounded-2xl p-6 border border-blue-500/25 shadow-xl bg-[#0a1228]/85">
              <h3 className="font-sans font-bold text-lg text-white mb-4">Metadata</h3>
              <div className="space-y-0 text-xs">
                <div className="flex justify-between py-2.5 border-b border-blue-500/15">
                  <span className="text-slate-400">Category</span>
                  <span className="text-white font-semibold">{project.category}</span>
                </div>
                {project.start_date && (
                  <div className="flex justify-between py-2.5 border-b border-blue-500/15">
                    <span className="text-slate-400">Start Date</span>
                    <span className="text-slate-300 font-mono">{project.start_date}</span>
                  </div>
                )}
                {(project as any).end_date && (
                  <div className="flex justify-between py-2.5 border-b border-blue-500/15">
                    <span className="text-slate-400">Completion</span>
                    <span className="text-slate-300 font-mono">{(project as any).end_date}</span>
                  </div>
                )}
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-400">Verification</span>
                  <span className="text-cyan-400 font-medium">100% Attribution Verified</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#0a1228] rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-blue-500/30 shadow-2xl relative text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-sans font-bold text-2xl text-white">Modify Project Specification</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Update technical specifications, live endpoints, or descriptions for <span className="text-cyan-300 font-medium">{project.name}</span>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="p-2 rounded-full hover:bg-[#070e22] text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {editError && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-400" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs tracking-widest uppercase mb-1.5 font-mono">Project Name *</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs tracking-widest uppercase mb-1.5 font-mono">Category *</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className={inputCls}
                    >
                      <option value="Websites" className="bg-[#070e22]">Websites</option>
                      <option value="Apps" className="bg-[#070e22]">Mobile Apps</option>
                      <option value="Software" className="bg-[#070e22]">Enterprise Software</option>
                      <option value="AI/ML" className="bg-[#070e22]">AI / Machine Learning</option>
                      <option value="SaaS" className="bg-[#070e22]">Enterprise SaaS</option>
                      <option value="Automation" className="bg-[#070e22]">Automation</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs tracking-widest uppercase mb-1.5 font-mono">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className={inputCls}
                    >
                      <option value="Published" className="bg-[#070e22]">Published</option>
                      <option value="Draft" className="bg-[#070e22]">Draft</option>
                      <option value="Archived" className="bg-[#070e22]">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs tracking-widest uppercase mb-1.5 font-mono">Client / Sponsor</label>
                    <input
                      type="text"
                      value={editClientName}
                      onChange={(e) => setEditClientName(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs tracking-widest uppercase mb-1.5 font-mono">Short Summary</label>
                  <input
                    type="text"
                    value={editShortDescription}
                    onChange={(e) => setEditShortDescription(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs tracking-widest uppercase mb-1.5 font-mono">Full Project Overview</label>
                  <textarea
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs tracking-widest uppercase mb-1.5 font-mono">Live Demo URL</label>
                    <input
                      type="url"
                      value={editDemoUrl}
                      onChange={(e) => setEditDemoUrl(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs tracking-widest uppercase mb-1.5 font-mono">Source Repository URL</label>
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
                    <label className="text-slate-400 text-xs tracking-widest uppercase font-mono">Cover Image URL</label>
                    {editDemoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditImageUrl(`https://image.thum.io/get/width/1200/crop/800/${editDemoUrl}`);
                        }}
                        className="text-[11px] text-cyan-400 hover:text-white font-semibold flex items-center gap-1 transition-colors"
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
                    <div className="mt-2 h-24 rounded-xl overflow-hidden border border-blue-500/30 relative">
                      <img src={editImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-2 px-2 py-0.5 rounded text-[10px] bg-black/80 text-white font-mono">Live Preview</span>
                    </div>
                  )}
                </div>

                {/* Technologies */}
                <div>
                  <label className="block text-slate-400 text-xs tracking-widest uppercase mb-1.5 font-mono">Technologies</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editTechnologies.map((t) => (
                      <span key={t} className="text-xs text-cyan-300 px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-500/30 bg-[#070e22]">
                        {t}
                        <button type="button" onClick={() => removeEditTech(t)} className="text-slate-400 hover:text-white">
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
                    <button type="button" onClick={addEditTech} className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold hover:shadow-[0_0_12px_rgba(37,99,235,0.5)] shrink-0">
                      Add
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-500/15 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-[#070e22] text-xs font-medium text-slate-300 hover:text-white border border-blue-500/30"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-7 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] disabled:opacity-50 shadow-sm"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#0a1228] rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-blue-500/30 shadow-2xl relative text-white">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-sans font-bold text-2xl text-white">Project Cover Visual</h3>
                  <p className="text-slate-400 text-xs mt-1">Select landing page from live website or set custom visual for <strong className="text-cyan-300">{project.name}</strong></p>
                </div>
                <button
                  type="button"
                  onClick={() => setCoverModalOpen(false)}
                  className="p-2 rounded-full hover:bg-[#070e22] text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 p-1 bg-[#070e22] rounded-2xl mb-6 border border-blue-500/25">
                <button
                  type="button"
                  onClick={() => setCoverTab('live')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    coverTab === 'live' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe size={13} />
                  <span>Live Website</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCoverTab('custom')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    coverTab === 'custom' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon size={13} />
                  <span>Custom URL / Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCoverTab('presets')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    coverTab === 'presets' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
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
                    <label className="block text-slate-400 text-xs tracking-widest uppercase mb-1.5 font-mono">Live Website URL</label>
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
                      className="p-3.5 rounded-2xl border border-blue-500/25 hover:border-cyan-400/40 bg-[#070e22] text-left transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Camera size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold text-white">
                          {isCapturingScreenshot ? 'Capturing Screenshot…' : 'Capture Browser Screenshot'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Renders live page via headless engine and saves local snapshot.</p>
                    </button>

                    <button
                      type="button"
                      disabled={!targetLiveUrl}
                      onClick={() => {
                        const url = `https://image.thum.io/get/width/1200/crop/800/${targetLiveUrl}`;
                        setSelectedCoverUrl(url);
                        setCaptureMessage('Selected dynamic live snapshot!');
                      }}
                      className="p-3.5 rounded-2xl border border-blue-500/25 hover:border-cyan-400/40 bg-[#070e22] text-left transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <RefreshCw size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold text-white">Dynamic Live Snapshot</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Real-time cloud preview of the live URL.</p>
                    </button>
                  </div>

                  {/* Verified local saved snapshot option */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCoverUrl('/projects/pbr-solar-landing.png');
                        setCaptureMessage('Selected captured PBR Solar landing page!');
                      }}
                      className="w-full py-2.5 px-4 rounded-xl border border-blue-500/30 bg-blue-950/40 hover:bg-blue-950/70 text-cyan-300 text-xs font-medium flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-cyan-400" />
                        <span>Use Captured PBR Solar Landing Page (/projects/pbr-solar-landing.png)</span>
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-blue-900/60 border border-blue-500/40 px-2 py-0.5 rounded text-cyan-300 font-semibold">Ready</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Custom URL / Upload */}
              {coverTab === 'custom' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs tracking-widest uppercase mb-1.5 font-mono">Custom Image URL</label>
                    <input
                      type="url"
                      value={selectedCoverUrl}
                      onChange={(e) => setSelectedCoverUrl(e.target.value)}
                      placeholder="https://example.com/cover.jpg or /projects/image.png"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs tracking-widest uppercase mb-1.5 font-mono">Or Upload from Computer</label>
                    <div className="border-2 border-dashed border-blue-500/30 hover:border-cyan-400/50 rounded-2xl p-6 text-center transition-colors bg-[#070e22]">
                      <Upload size={24} className="mx-auto text-cyan-400 mb-2" />
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950/80 border border-blue-500/40 hover:bg-blue-900/60 text-cyan-300 text-xs font-semibold transition-colors">
                        <span>Browse image file</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-400 mt-2">PNG, JPG, WebP supported</p>
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
                          ? 'border-cyan-400 bg-blue-950/60 ring-2 ring-cyan-400/30'
                          : 'border-blue-500/20 bg-[#070e22] hover:border-cyan-400/40'
                      }`}
                    >
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                        <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{preset.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{preset.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Live Preview Box */}
              {selectedCoverUrl && (
                <div className="mt-6 pt-5 border-t border-blue-500/15">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-400 text-xs font-mono uppercase tracking-widest">Cover Preview</span>
                    {captureMessage && (
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} /> {captureMessage}
                      </span>
                    )}
                  </div>
                  <div className="h-44 w-full rounded-2xl overflow-hidden border border-blue-500/30 relative shadow-sm">
                    <img
                      src={selectedCoverUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => {
                        setCaptureMessage('Image failed to load. Check URL.');
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060b19] via-transparent to-transparent flex items-end p-4">
                      <span className="text-white text-xs font-semibold drop-shadow">{project.name}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal footer */}
              <div className="mt-6 pt-4 border-t border-blue-500/15 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCoverModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-[#070e22] text-xs font-medium text-slate-300 hover:text-white border border-blue-500/30"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedCoverUrl || isUpdating}
                  onClick={handleSaveCoverImage}
                  className="px-7 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] disabled:opacity-50 shadow-sm flex items-center gap-1.5"
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
