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
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <img src={logoUrl} alt={companyName} className="h-8 w-auto object-contain" />
          <p className="text-slate-500 text-xs tracking-widest uppercase font-mono">{companyName} Roster</p>
        </div>
        <h1 className="font-instrument italic text-[clamp(2rem,5vw,4rem)] leading-[1.05] text-slate-900">
          Verified <em>Developers</em>
        </h1>
        <p className="text-slate-600 text-sm mt-3 max-w-xl leading-relaxed">
          Browse our hand-verified roster of senior developers, AI engineers, and cloud specialists.
          Collaborate directly without middleman markups.
        </p>
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
                placeholder="Search by name, title, or biography..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-black/10 text-slate-900 text-sm placeholder-slate-400 focus:border-black/30 focus:outline-none transition-colors shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm">
                <Search size={14} /> Search
              </button>
              {(searchQuery || selectedSkill || selectedAvailability || selectedLocation) && (
                <button type="button" onClick={clearFilters} className="px-3.5 py-2.5 rounded-xl liquid-glass text-slate-600 hover:text-black text-xs flex items-center gap-1 border border-black/10">
                  <X size={13} /> Reset
                </button>
              )}
            </div>
          </form>

          {/* Skill pills */}
          <div>
            <span className="text-slate-500 text-xs block mb-2 font-mono">Filter by technology:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSkill('')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedSkill === '' ? 'bg-black text-white shadow-sm' : 'liquid-glass text-slate-600 hover:text-black border border-black/10'}`}
              >
                All Skills
              </button>
              {skillsList.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(selectedSkill === skill ? '' : skill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedSkill === skill ? 'bg-black text-white shadow-sm' : 'liquid-glass text-slate-600 hover:text-black border border-black/10'}`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3 pt-3 border-t border-black/[0.06]">
            <span className="text-slate-500 text-xs font-mono">Availability:</span>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white border border-black/10 text-slate-700 text-xs focus:outline-none focus:border-black/30 transition-colors shadow-sm"
            >
              <option value="">Any Availability</option>
              {availabilityOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="liquid-glass h-60 rounded-3xl animate-pulse border border-black/[0.06]" />
            ))}
          </div>
        ) : developers.length === 0 ? (
          <div className="text-center py-20 liquid-glass rounded-3xl border border-black/[0.08] shadow-sm">
            <p className="font-instrument italic text-slate-900 text-2xl mb-2">No developers found</p>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Try adjusting your search criteria or removing skill filters.</p>
            <button onClick={clearFilters} className="px-5 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
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
