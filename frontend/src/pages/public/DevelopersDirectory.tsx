import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import api from '../../api/client';
import type { DeveloperProfile } from '../../types';
import { DeveloperCard } from '../../components/developers/DeveloperCard';
import { ContactDeveloperModal } from '../../components/inquiries/ContactDeveloperModal';
import { useSettings } from '../../context/SettingsContext';

export const DevelopersDirectory: React.FC = () => {
  const { settings } = useSettings();
  const companyName = settings?.company_name || 'RMVS Web Services';
  const logoUrl = settings?.logo_url || '/logo.png';

  const [developers, setDevelopers] = useState<DeveloperProfile[]>(() => {
    try {
      const cached = localStorage.getItem('rmvs_cached_developers');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isLoading, setIsLoading] = useState(developers.length === 0);
  const [selectedDevForContact, setSelectedDevForContact] = useState<DeveloperProfile | null>(null);

  const skillsList = ['Python', 'FastAPI', 'React', 'TypeScript', 'SQL', 'PostgreSQL', 'AI/ML', 'Docker', 'Kubernetes', 'Node.js', 'Flutter', 'AWS'];
  const availabilityOptions = ['Available for Projects', 'Available for Consulting & Advisory', 'Available for Enterprise Projects', 'Full-time', 'Busy'];

  useEffect(() => { fetchDevelopers(); }, [selectedSkill, selectedAvailability]);

  const fetchDevelopers = async () => {
    if (developers.length === 0) setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchQuery) params.query = searchQuery;
      if (selectedSkill) params.skill = selectedSkill;
      if (selectedAvailability) params.availability = selectedAvailability;
      if (selectedLocation) params.location = selectedLocation;
      const res = await api.get('/developers', { params });
      setDevelopers(res.data);
      if (!selectedSkill && !selectedAvailability && !searchQuery && !selectedLocation) {
        localStorage.setItem('rmvs_cached_developers', JSON.stringify(res.data));
      }
    } catch (e) { console.warn('Error fetching developers', e); }
    finally { setIsLoading(false); }
  };

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); fetchDevelopers(); };
  const clearFilters = () => { setSearchQuery(''); setSelectedSkill(''); setSelectedAvailability(''); setSelectedLocation(''); fetchDevelopers(); };

  return (
    <div className="min-h-screen bg-[#060b19] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <img src={logoUrl} alt={companyName} className="h-8 w-auto object-contain" />
          <p className="text-cyan-400 text-xs tracking-widest uppercase font-mono">{companyName} Roster</p>
        </div>
        <h1 className="font-sans font-extrabold text-[clamp(2rem,5vw,4rem)] leading-[1.05] text-white">
          Verified <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">Developers</span>
        </h1>
        <p className="text-slate-300 text-sm mt-3 max-w-xl leading-relaxed">
          Browse our hand-verified roster of senior developers, AI engineers, and cloud specialists.
          Collaborate directly without middleman markups.
        </p>
      </div>

      {/* Filter bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10">
        <div className="rounded-2xl p-5 space-y-4 border border-blue-500/25 bg-[#0a1228]/85 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, title, or biography..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070e22] border border-blue-500/30 text-white text-sm placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all flex items-center gap-1.5 shadow-sm">
                <Search size={14} /> Search
              </button>
              {(searchQuery || selectedSkill || selectedAvailability || selectedLocation) && (
                <button type="button" onClick={clearFilters} className="px-3.5 py-2.5 rounded-xl bg-[#070e22] text-slate-300 hover:text-white text-xs flex items-center gap-1 border border-blue-500/30">
                  <X size={13} /> Reset
                </button>
              )}
            </div>
          </form>

          {/* Skill pills */}
          <div>
            <span className="text-cyan-400 text-xs block mb-2 font-mono">Filter by technology:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSkill('')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedSkill === '' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm' : 'bg-[#070e22] text-slate-300 hover:text-white border border-blue-500/20 hover:border-cyan-400/40'}`}
              >
                All Skills
              </button>
              {skillsList.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(selectedSkill === skill ? '' : skill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedSkill === skill ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm' : 'bg-[#070e22] text-slate-300 hover:text-white border border-blue-500/20 hover:border-cyan-400/40'}`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3 pt-3 border-t border-blue-500/15">
            <span className="text-cyan-400 text-xs font-mono">Availability:</span>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#070e22] border border-blue-500/30 text-white text-xs focus:outline-none focus:border-cyan-400 transition-colors shadow-sm"
            >
              <option value="" className="bg-[#070e22]">Any Availability</option>
              {availabilityOptions.map((opt) => (<option key={opt} value={opt} className="bg-[#070e22]">{opt}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-60 rounded-3xl animate-pulse bg-[#0a1228]/60 border border-blue-500/15" />
            ))}
          </div>
        ) : developers.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-blue-500/25 shadow-xl bg-[#0a1228]/80">
            <p className="font-sans font-bold text-white text-2xl mb-2">No developers found</p>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">Try adjusting your search criteria or removing skill filters.</p>
            <button onClick={clearFilters} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all shadow-sm">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {developers.map((dev) => (
              <DeveloperCard key={dev.id} developer={dev} onContactClick={(d) => setSelectedDevForContact(d)} />
            ))}
          </div>
        )}
      </div>

      {selectedDevForContact && (
        <ContactDeveloperModal
          developer={selectedDevForContact}
          isOpen={!!selectedDevForContact}
          onClose={() => setSelectedDevForContact(null)}
        />
      )}
    </div>
  );
};
