import React, { useEffect, useState } from 'react';
import { Search, X, Plus, LayoutGrid, SlidersHorizontal, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { Project } from '../../types';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectQuickViewModal } from '../../components/projects/ProjectQuickViewModal';
import { useSettings } from '../../context/SettingsContext';
import { fallbackProjects } from '../../data/fallbackProjects';

export const ProjectsDirectory: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const companyName = settings?.company_name || 'RMVS Web Services';
  const logoUrl = settings?.logo_url || '/logo.png';
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const cached = localStorage.getItem('rmvs_cached_projects');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return fallbackProjects;
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'showcase'>('grid');
  const [quickViewProject, setQuickViewProject] = useState<Project | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const categories = ['All', 'Websites', 'Apps', 'Software', 'Digital Solutions'];

  useEffect(() => { fetchProjects(); }, [selectedCategory]);

  const fetchProjects = async () => {
    try {
      const params: Record<string, string> = {};
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery) params.query = searchQuery;
      const res = await api.get('/projects', { params });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setProjects(res.data);
        if (selectedCategory === 'All' && !searchQuery) {
          localStorage.setItem('rmvs_cached_projects', JSON.stringify(res.data));
        }
      }
    } catch (e) {
      console.warn('Failed to fetch projects', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); fetchProjects(); };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* Hero header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logoUrl} alt={companyName} className="h-8 w-auto object-contain" />
            <p className="text-blue-600 text-xs tracking-widest uppercase font-mono font-semibold">{companyName} Showcase</p>
          </div>
          <h1 className="font-sans font-extrabold text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-slate-900">
            Featured <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">Projects</span>
          </h1>
          <p className="text-slate-600 text-sm mt-3 max-w-xl leading-relaxed">
            Real software systems engineered by our verified developers with real-life imagery. Every project features transparent lead creator attribution.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* View Mode Toggle */}
          <div className="rounded-full p-1 border border-slate-200 bg-white flex items-center gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid size={13} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('showcase')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'showcase'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Showcase View"
            >
              <SlidersHorizontal size={13} />
              <span>Showcase</span>
            </button>
          </div>

          {user && (user.is_verified || user.role === 'super_admin') && (
            <Link
              to="/dashboard/my-projects?action=new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>New Project</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 my-8">
        <div className="rounded-2xl p-5 space-y-4 border border-slate-200 bg-white shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, technologies, or keywords..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors shadow-2xs"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5">
                <Search size={14} /> Search
              </button>
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); fetchProjects(); }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 text-xs flex items-center gap-1 border border-slate-200"
                >
                  <X size={13} /> Reset
                </button>
              )}
            </div>
          </form>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
            <span className="text-slate-500 text-xs self-center mr-1 font-mono font-semibold">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid or Showcase View */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 rounded-3xl animate-pulse bg-slate-100 border border-slate-200" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-slate-200 shadow-sm bg-white">
            <p className="font-sans font-bold text-slate-900 text-2xl mb-2">No projects found</p>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Try adjusting your search query or switching categories.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); fetchProjects(); }}
              className="px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm"
            >
              Reset filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {projects.map((proj) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                onQuickView={(p) => {
                  setQuickViewProject(p);
                  setIsQuickViewOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((p) => {
              const leadAssoc = p.developer_associations?.find((d) => d.is_lead) || p.developer_associations?.[0];
              const leadDev = leadAssoc?.developer;
              const leadUser = leadDev?.user;
              const fallbackImg = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';
              const imgSrc = p.image_url && !p.image_url.includes('1drv.ms') ? p.image_url : fallbackImg;

              return (
                <div
                  key={p.id}
                  className="rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.05)] hover:border-blue-300 hover:shadow-[0_12px_35px_rgba(37,99,235,0.12)] transition-all duration-300 flex flex-col lg:flex-row gap-6 lg:gap-8 items-center bg-white lag-free"
                >
                  <div className="relative w-full lg:w-1/2 h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-100 shrink-0 group border border-slate-100">
                    <img
                      src={imgSrc}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/95 text-blue-600 border border-slate-200 font-semibold shadow-xs backdrop-blur-md">
                        {p.category || 'Platform'}
                      </span>
                      {p.demo_url && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-emerald-600 text-white font-medium shadow-xs backdrop-blur-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setQuickViewProject(p);
                          setIsQuickViewOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white text-slate-800 border border-slate-200 text-xs font-semibold shadow-xs transition-transform hover:scale-105 flex items-center gap-1.5 backdrop-blur-md"
                      >
                        <Eye size={13} className="text-blue-600" />
                        <span>Quick Preview</span>
                      </button>
                      {p.demo_url && (
                        <a
                          href={p.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-full bg-white/95 hover:bg-white text-blue-600 border border-slate-200 shadow-xs transition-transform hover:scale-105 backdrop-blur-md"
                          title="Launch Live Website"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-medium">
                          {p.client_name ? `Client • ${p.client_name}` : 'Engineered Platform'}
                        </span>
                        <span className="text-[10px] font-mono text-blue-700 font-semibold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                          Verified Production
                        </span>
                      </div>

                      <Link to={`/projects/${p.slug}`}>
                        <h3 className="font-sans font-bold text-2xl sm:text-3xl text-slate-900 hover:text-blue-600 transition-colors leading-snug mb-2">
                          {p.name}
                        </h3>
                      </Link>

                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                        {p.short_description || p.description}
                      </p>

                      {p.technologies && p.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {p.technologies.map((t) => (
                            <span
                              key={t.id || t.name}
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-50 text-slate-700 border border-slate-200"
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      {leadUser ? (
                        <Link
                          to={`/developers/${leadUser.username}`}
                          className="flex items-center gap-2 text-xs text-slate-700 hover:text-blue-600 transition-colors"
                        >
                          {leadUser.avatar_url ? (
                            <img src={leadUser.avatar_url} alt={leadUser.full_name} className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-200" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                              {leadUser.full_name.charAt(0)}
                            </div>
                          )}
                          <span className="font-semibold text-slate-900">{leadUser.full_name}</span>
                          <span className="text-[10px] font-mono text-blue-600 font-semibold">Lead</span>
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">RMVS Engineering Squad</span>
                      )}

                      <Link
                        to={`/projects/${p.slug}`}
                        className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>Details</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewProject && (
        <ProjectQuickViewModal
          project={quickViewProject}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </div>
  );
};
