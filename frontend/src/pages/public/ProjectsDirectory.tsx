import React, { useEffect, useState } from 'react';
import { Search, X, Plus, LayoutGrid, SlidersHorizontal, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { Project } from '../../types';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectQuickViewModal } from '../../components/projects/ProjectQuickViewModal';
import { useSettings } from '../../context/SettingsContext';

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
    return [];
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'showcase'>('grid');
  const [quickViewProject, setQuickViewProject] = useState<Project | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(projects.length === 0);

  const categories = ['All', 'AI/ML', 'SaaS', 'Websites', 'Mobile Apps', 'Software', 'CRM', 'Web Platforms', 'Automation'];

  useEffect(() => { fetchProjects(); }, [selectedCategory]);

  const fetchProjects = async () => {
    if (projects.length === 0) setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery) params.query = searchQuery;
      const res = await api.get('/projects', { params });
      setProjects(res.data);
      if (selectedCategory === 'All' && !searchQuery) {
        localStorage.setItem('rmvs_cached_projects', JSON.stringify(res.data));
      }
    } catch (e) { console.warn('Failed to fetch projects', e); }
    finally { setIsLoading(false); }
  };

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); fetchProjects(); };

  return (
    <div className="min-h-screen bg-[#060b19] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Hero header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logoUrl} alt={companyName} className="h-8 w-auto object-contain" />
            <p className="text-cyan-400 text-xs tracking-widest uppercase font-mono">{companyName} Showcase</p>
          </div>
          <h1 className="font-sans font-extrabold text-[clamp(2rem,5vw,4rem)] leading-[1.05] text-white">
            Featured <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">Projects</span>
          </h1>
          <p className="text-slate-300 text-sm mt-3 max-w-xl leading-relaxed">
            Real software systems engineered by our verified developers. Every project features permanent creator attribution.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* View Mode Toggle */}
          <div className="rounded-full p-1 border border-blue-500/30 bg-[#0a1228] flex items-center gap-1 shadow-md">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid size={13} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('showcase')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'showcase'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>New Project</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10">
        <div className="rounded-2xl p-5 space-y-4 border border-blue-500/25 bg-[#0a1228]/85 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, technologies, or keywords..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070e22] border border-blue-500/30 text-white text-sm placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all flex items-center gap-1.5 shadow-sm">
                <Search size={14} /> Search
              </button>
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); fetchProjects(); }}
                  className="px-3.5 py-2.5 rounded-xl bg-[#070e22] text-slate-300 hover:text-white text-xs flex items-center gap-1 border border-blue-500/30"
                >
                  <X size={13} /> Reset
                </button>
              )}
            </div>
          </form>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-blue-500/15">
            <span className="text-cyan-400 text-xs self-center mr-1 font-mono">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm'
                    : 'bg-[#070e22] text-slate-300 hover:text-white border border-blue-500/20 hover:border-cyan-400/40'
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
              <div key={i} className="h-72 rounded-3xl animate-pulse bg-[#0a1228]/60 border border-blue-500/15" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-blue-500/25 shadow-lg bg-[#0a1228]/80">
            <p className="font-sans font-bold text-white text-2xl mb-2">No projects found</p>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">Try adjusting your search query or switching categories.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); fetchProjects(); }}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all shadow-sm"
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
              const fallbackImg = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80';
              const imgSrc = p.image_url && !p.image_url.includes('1drv.ms') ? p.image_url : fallbackImg;

              return (
                <div
                  key={p.id}
                  style={{ transform: 'translateZ(0)' }}
                  className="rounded-3xl p-6 sm:p-8 border border-blue-500/25 shadow-xl hover:border-cyan-400/40 hover:shadow-[0_10px_35px_rgba(37,99,235,0.25)] transition-all duration-300 flex flex-col lg:flex-row gap-6 lg:gap-8 items-center bg-[#0a1228]/85"
                >
                  <div className="relative w-full lg:w-1/2 h-64 sm:h-72 rounded-2xl overflow-hidden bg-[#070e22] shrink-0 group border border-blue-500/20">
                    <img
                      src={imgSrc}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.85]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060b19] via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#070e22]/90 text-cyan-300 border border-blue-500/30 font-semibold shadow-sm backdrop-blur-md">
                        {p.category || 'Platform'}
                      </span>
                      {p.demo_url && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-medium shadow-sm backdrop-blur-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
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
                        className="px-3.5 py-1.5 rounded-full bg-[#070e22]/90 hover:bg-[#0e1938] text-white border border-blue-500/30 text-xs font-medium shadow-sm transition-transform hover:scale-105 flex items-center gap-1.5 backdrop-blur-md"
                      >
                        <Eye size={13} className="text-cyan-400" />
                        <span>Quick Preview</span>
                      </button>
                      {p.demo_url && (
                        <a
                          href={p.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-full bg-[#070e22]/90 hover:bg-[#0e1938] text-cyan-300 hover:text-white border border-blue-500/30 shadow-sm transition-transform hover:scale-105 backdrop-blur-md"
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
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                          {p.client_name ? `Client • ${p.client_name}` : 'Engineered Platform'}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/30">
                          Verified Production
                        </span>
                      </div>

                      <Link to={`/projects/${p.slug}`}>
                        <h3 className="font-sans font-bold text-2xl sm:text-3xl text-white hover:text-cyan-300 transition-colors leading-snug mb-2">
                          {p.name}
                        </h3>
                      </Link>

                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                        {p.short_description || p.description}
                      </p>

                      {p.technologies && p.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {p.technologies.map((t) => (
                            <span
                              key={t.id || t.name}
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#070e22] text-cyan-300 border border-blue-500/25"
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-blue-500/15 flex items-center justify-between">
                      {leadUser ? (
                        <Link
                          to={`/developers/${leadUser.username}`}
                          className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors"
                        >
                          {leadUser.avatar_url ? (
                            <img src={leadUser.avatar_url} alt={leadUser.full_name} className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500/40" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-900/60 border border-blue-500/30 text-cyan-300 flex items-center justify-center text-[10px] font-bold">
                              {leadUser.full_name.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium text-white">{leadUser.full_name}</span>
                          <span className="text-[10px] font-mono text-cyan-400">Lead</span>
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">RMVS Engineering Squad</span>
                      )}

                      <Link
                        to={`/projects/${p.slug}`}
                        className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold hover:shadow-[0_0_12px_rgba(37,99,235,0.5)] transition-all flex items-center gap-1.5"
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
