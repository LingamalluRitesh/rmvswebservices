import React, { useEffect, useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { Project } from '../../types';
import { ProjectCard } from '../../components/projects/ProjectCard';
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
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logoUrl} alt={companyName} className="h-8 w-auto object-contain" />
            <p className="text-slate-500 text-xs tracking-widest uppercase font-mono">{companyName} Showcase</p>
          </div>
          <h1 className="font-instrument italic text-[clamp(2rem,5vw,4rem)] leading-[1.05] text-slate-900">
            Featured <em>Projects</em>
          </h1>
          <p className="text-slate-600 text-sm mt-3 max-w-xl leading-relaxed">
            Real software systems engineered by our verified developers. Every project features permanent creator attribution.
          </p>
        </div>
        {user && (user.is_verified || user.role === 'super_admin') && (
          <Link
            to="/dashboard/my-projects?action=new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-slate-800 shadow-sm transition-colors shrink-0"
          >
            <Plus size={14} />
            <span>New Project</span>
          </Link>
        )}
      </div>

      {/* Filter bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10">
        <div className="liquid-glass rounded-2xl p-5 space-y-4 border border-black/[0.08] shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, technologies, or keywords..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-black/10 text-slate-900 text-sm placeholder-slate-400 focus:border-black/30 focus:outline-none transition-colors shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm">
                <Search size={14} /> Search
              </button>
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); fetchProjects(); }}
                  className="px-3.5 py-2.5 rounded-xl liquid-glass text-slate-600 hover:text-black text-xs flex items-center gap-1 border border-black/10"
                >
                  <X size={13} /> Reset
                </button>
              )}
            </div>
          </form>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-black/[0.06]">
            <span className="text-slate-500 text-xs self-center mr-1 font-mono">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-black text-white shadow-sm'
                    : 'liquid-glass text-slate-600 hover:text-black border border-black/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="liquid-glass h-72 rounded-2xl animate-pulse border border-black/[0.06]" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 liquid-glass rounded-3xl border border-black/[0.08] shadow-sm">
            <p className="font-instrument italic text-slate-900 text-2xl mb-2">No projects found</p>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Try adjusting your search query or switching categories.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); fetchProjects(); }}
              className="px-5 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
