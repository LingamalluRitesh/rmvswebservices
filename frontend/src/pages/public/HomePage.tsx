import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, Globe, Smartphone, Code2, TrendingUp,
  ShieldCheck, FolderGit2, CheckCircle2,
  Sparkles, Check, UserCheck
} from 'lucide-react';
import api from '../../api/client';
import type { Project, DeveloperProfile } from '../../types';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { DeveloperCard } from '../../components/developers/DeveloperCard';
import { useSettings } from '../../context/SettingsContext';

/* ─────────────────────────────────────────
   Reusable FadeIn wrapper
───────────────────────────────────────── */
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   Instant Fallback Production Cache
───────────────────────────────────────── */
const fallbackInitialProjects: Project[] = [
  {
    id: 5,
    name: 'SreeWaterSolutions',
    slug: 'sreewatersolutions',
    short_description: 'Professional water purification and treatment systems provider delivering reliable RO, commercial water systems, and 24/7 maintenance.',
    description: 'Modern, responsive business website designed to showcase professional water purification and treatment services across Andhra Pradesh.',
    category: 'Websites',
    demo_url: 'https://www.sreewatersolutions.com/',
    repo_url: undefined,
    image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
    status: 'Published',
    visibility: 'Public',
    client_name: 'Sree Water Solutions',
    created_at: '2026-10-03T12:11:58.916434Z',
    developer_associations: [
      {
        id: 6,
        role_in_project: 'Lead Developer',
        is_lead: true,
        developer: {
          id: 3,
          title: 'Chief Executive Officer (CEO)',
          availability: 'Available for Advisory',
          years_experience: 3,
          user: {
            id: 3,
            username: 'riteshlingamallu8',
            full_name: 'Ritesh Lingamallu',
            role: 'super_admin',
            avatar_url: 'https://media.licdn.com/dms/image/v2/D4D35AQFckrBvrwWh-Q/profile-framedphoto-shrink_800_800/B4DaAWMSiVJIAI-/0/1787078715771?e=1791622800&v=beta&t=5EVFRjqZKuo7-6gVsyWdAueZFzhaO5w9XV2TTdU5TmA',
            is_verified: true,
          },
          skills: [
            { id: 1, name: 'Python' },
            { id: 2, name: 'FastAPI' },
            { id: 3, name: 'React' },
            { id: 4, name: 'TypeScript' }
          ]
        }
      }
    ],
    technologies: [
      { id: 1, name: 'React' },
      { id: 2, name: 'TypeScript' }
    ]
  },
  {
    id: 4,
    name: 'Narasimha Stills',
    slug: 'narasimha-stills',
    short_description: 'Cinematic visual portfolio showcasing high-definition photography, wedding moments, and event capturing with interactive gallery design.',
    description: 'High-performance interactive 3D photography showcase featuring cinematic animations and responsive visual aesthetics.',
    category: 'Websites',
    demo_url: 'https://photography-website-ahc.pages.dev/',
    repo_url: undefined,
    image_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&q=80',
    status: 'Published',
    visibility: 'Public',
    client_name: 'NS Photography',
    created_at: '2026-10-03T08:38:35.229999Z',
    developer_associations: [
      {
        id: 4,
        role_in_project: 'Lead Developer',
        is_lead: true,
        developer: {
          id: 9,
          title: 'Frontend Developer',
          availability: 'Available for Projects',
          years_experience: 3,
          user: {
            id: 10,
            username: 'ltmani',
            full_name: 'Lingamallu Tharun Manikanta',
            role: 'developer',
            avatar_url: 'https://media.licdn.com/dms/image/v2/D4D35AQFtxR6DWcGtdg/profile-framedphoto-shrink_400_400/B4DaEBy0FRKcAU-/0/1791031460559?e=1791637200&v=beta&t=2HzQSmqWMdSf-V_hkIqtTvAWwu-XO7XyoykFVDv5gP4',
            is_verified: true,
          },
          skills: [
            { id: 3, name: 'React' },
            { id: 4, name: 'TypeScript' },
            { id: 26, name: 'JavaScript' }
          ]
        }
      }
    ],
    technologies: [
      { id: 3, name: 'React' },
      { id: 4, name: 'TypeScript' }
    ]
  },
  {
    id: 1,
    name: 'PBR Solar Energy',
    slug: 'pbr-solar-energy',
    short_description: 'Modern, responsive solar-energy platform designed to showcase sustainable clean energy engineering and industrial installations.',
    description: 'Solar energy platform engineered with responsive layouts, power calculator, and enterprise consultation booking.',
    category: 'Websites',
    demo_url: 'https://www.pbrsolarenergy.com/',
    repo_url: 'https://github.com/LingamalluRitesh/pbr-solar',
    image_url: '/projects/project-1-landing.png',
    status: 'Published',
    visibility: 'Public',
    client_name: 'PBR Solar Energy',
    created_at: '2026-09-26T07:58:03.192480Z',
    developer_associations: [
      {
        id: 1,
        role_in_project: 'Lead Architect',
        is_lead: true,
        developer: {
          id: 3,
          title: 'Chief Executive Officer (CEO)',
          availability: 'Available for Advisory',
          years_experience: 3,
          user: {
            id: 3,
            username: 'riteshlingamallu8',
            full_name: 'Ritesh Lingamallu',
            role: 'super_admin',
            avatar_url: 'https://media.licdn.com/dms/image/v2/D4D35AQFckrBvrwWh-Q/profile-framedphoto-shrink_800_800/B4DaAWMSiVJIAI-/0/1787078715771?e=1791622800&v=beta&t=5EVFRjqZKuo7-6gVsyWdAueZFzhaO5w9XV2TTdU5TmA',
            is_verified: true,
          },
          skills: [
            { id: 2, name: 'FastAPI' },
            { id: 3, name: 'React' },
            { id: 4, name: 'TypeScript' }
          ]
        }
      }
    ],
    technologies: [
      { id: 1, name: 'FastAPI' },
      { id: 2, name: 'React' }
    ]
  }
];

export const HomePage: React.FC = () => {
  const { settings } = useSettings();
  const companyName = settings?.company_name || 'RMVS Web Services';
  const tagline = settings?.tagline || 'DESIGN • DEVELOP • GROW TOGETHER';

  // Instant Stale-While-Revalidate Cache: Render immediately in 0ms!
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const cached = localStorage.getItem('rmvs_cached_projects');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return fallbackInitialProjects;
  });

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

  const [selectedPillar, setSelectedPillar] = useState('All');
  const [isLoadingProjects, setIsLoadingProjects] = useState(projects.length === 0);
  const [isLoadingDevs, setIsLoadingDevs] = useState(developers.length === 0);

  // Inquiry Form State in CTA
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPillar, setInquiryPillar] = useState('Websites');
  const [inquiryBudget, setInquiryBudget] = useState('Production Application');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  useEffect(() => {
    // Fetch live published projects in background
    api.get('/projects')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProjects(res.data);
          localStorage.setItem('rmvs_cached_projects', JSON.stringify(res.data));
        }
      })
      .catch((e) => console.warn('Projects background refresh notice:', e.message))
      .finally(() => setIsLoadingProjects(false));

    // Fetch verified developers roster in background
    api.get('/developers')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setDevelopers(res.data);
          localStorage.setItem('rmvs_cached_developers', JSON.stringify(res.data));
        }
      })
      .catch((e) => console.warn('Developers background refresh notice:', e.message))
      .finally(() => setIsLoadingDevs(false));
  }, []);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
  };

  const filteredProjects = selectedPillar === 'All'
    ? projects
    : projects.filter((p) => p.category?.toLowerCase() === selectedPillar.toLowerCase());

  return (
    <div className="bg-white min-h-screen text-slate-900 overflow-x-hidden">

      {/* ─────────────────────────────────────────
          1. HERO SECTION (White Theme Luxury Glass)
      ───────────────────────────────────────── */}
      <section className="relative pt-12 sm:pt-20 pb-20 sm:pb-28 overflow-hidden bg-white flex flex-col items-center justify-center text-center px-4 sm:px-6">
        
        {/* Hardware-Accelerated Ambient Backlight (Zero scroll lag) */}
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(238, 242, 255, 0.75) 0%, rgba(248, 250, 252, 0.35) 50%, transparent 70%)',
            transform: 'translateZ(0)'
          }}
        />

        <div className="max-w-5xl mx-auto z-10 flex flex-col items-center">
          
          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass text-slate-700 text-xs font-mono tracking-widest uppercase mb-8 border border-black/[0.08] shadow-sm"
          >
            <img src="/logo-icon.png" alt={companyName} className="w-4 h-4 object-contain" />
            <span>Websites</span>
            <span className="text-slate-300">•</span>
            <span>Apps</span>
            <span className="text-slate-300">•</span>
            <span>Software</span>
            <span className="text-slate-300">•</span>
            <span>Digital Solutions</span>
          </motion.div>

          {/* Majestic Instrument Serif Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="font-instrument text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.08] text-slate-950 tracking-tight mb-4 max-w-4xl"
          >
            Engineering <em>Digital Legacies.</em>
          </motion.h1>

          {/* Small, refined tagline badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100/90 border border-black/[0.08] text-slate-600 text-xs sm:text-sm font-mono uppercase tracking-[0.2em] font-medium shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>{tagline}</span>
            </span>
          </motion.div>

          {/* Subtitle with clean max-width */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="max-w-2xl mx-auto text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed mb-10"
          >
            {companyName} bridges visionary enterprises with India's premier verified software engineers.
            Zero middleman markup, direct collaboration, and transparent creator attribution for every line of code.
          </motion.p>

          {/* Hero Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-14"
          >
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-slate-800 shadow-md transition-all flex items-center gap-2"
            >
              Start a Project <ArrowRight size={15} />
            </Link>
            <Link
              to="/projects"
              className="px-8 py-3.5 rounded-full liquid-glass text-slate-800 hover:text-black text-sm hover:bg-black/[0.04] border border-black/10 transition-all flex items-center gap-2"
            >
              Explore Projects
            </Link>
          </motion.div>

          {/* ── Floating Command & Filter Toolbar (Light Glass) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="liquid-glass rounded-3xl sm:rounded-full p-2.5 sm:p-3 border border-black/[0.08] shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2 px-2 sm:px-4">
                
                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 py-1">
                  {['All', 'Websites', 'Apps', 'Software', 'Digital Solutions'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedPillar(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedPillar === cat
                          ? 'bg-black text-white shadow-sm'
                          : 'text-slate-600 hover:text-black hover:bg-black/[0.04]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Specs / Guarantees Tag */}
                <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-500 font-mono py-1 pr-2">
                  <span className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <ShieldCheck size={13} className="text-slate-700" />
                    <span>Verified Attribution</span>
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-800 font-medium">Production Engineering</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          2. THE 4 PILLARS OF RMVS WEB SERVICES (From Official Logo)
      ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 pb-4 border-b border-black/[0.08]">
            <div>
              <p className="text-slate-500 text-xs tracking-widest uppercase font-mono mb-2">Core Engineering Disciplines</p>
              <h2 className="font-instrument italic text-3xl sm:text-4xl text-slate-900">
                Four Pillars of Innovation
              </h2>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm max-w-md sm:text-right">
              Direct engineering partnerships in India. Zero intermediary fees, total creator ownership.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {[
              {
                icon: Globe,
                title: 'Websites',
                subtitle: 'High-Performance Web Portals',
                desc: 'Responsive web apps, client portals, and digital platforms engineered with React, TypeScript & FastAPI.',
                specs: ['React / Vite', 'FastAPI Backends', 'Mobile-Responsive', 'SEO Optimized'],
              },
              {
                icon: Smartphone,
                title: 'Apps',
                subtitle: 'Cross-Platform Mobile',
                desc: 'Native-feel iOS & Android applications engineered with Flutter and React Native.',
                specs: ['Flutter / Dart', 'React Native', 'Offline-First Cache', 'Biometric Auth'],
              },
              {
                icon: Code2,
                title: 'Software',
                subtitle: 'Enterprise Microservices',
                desc: 'Distributed backends, high-throughput APIs, cloud automation, and high-concurrency database schemas.',
                specs: ['Distributed APIs', 'PostgreSQL / Redis', 'Docker & K8s', 'Event-Driven'],
              },
              {
                icon: TrendingUp,
                title: 'Digital Solutions',
                subtitle: 'AI & Business Intelligence',
                desc: 'Autonomous AI agents, predictive business analytics, and automated cloud workflows.',
                specs: ['LLM Orchestration', 'Data Pipelines', 'Workflow Bots', 'Telemetry Dashboards'],
              },
            ].map(({ icon: Icon, title, subtitle, desc, specs }) => (
              <div
                key={title}
                className="liquid-glass rounded-3xl p-6 sm:p-7 flex flex-col justify-between group hover:bg-slate-50/50 transition-all border border-black/[0.08] hover:border-black/20 shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl liquid-glass flex items-center justify-center text-slate-800 mb-5 group-hover:scale-105 transition-all ring-1 ring-black/10">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-instrument italic text-2xl text-slate-900 mb-1">{title}</h3>
                  <p className="text-slate-400 text-[11px] font-mono uppercase tracking-wider mb-4">{subtitle}</p>
                  <p className="text-slate-600 text-xs leading-relaxed mb-6">{desc}</p>

                  <div className="space-y-2 mb-6 pt-4 border-t border-black/[0.06]">
                    {specs.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-[11px] text-slate-600">
                        <Check size={12} className="text-slate-800 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-black/[0.08] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Delivery Tier</span>
                    <span className="text-slate-900 font-semibold text-xs">Production Grade</span>
                  </div>
                  <Link
                    to="/contact"
                    className="px-4 py-1.5 rounded-full liquid-glass text-xs font-medium text-slate-800 hover:text-black hover:bg-black/[0.04] border border-black/10 transition-colors flex items-center gap-1"
                  >
                    Inquire <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ─────────────────────────────────────────
          3. PROJECTS SHOWCASE SECTION (Connected to Live DB)
      ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-black/[0.08]">
            <div>
              <p className="text-slate-500 text-xs tracking-widest uppercase font-mono mb-2">Attributed Works</p>
              <h2 className="font-instrument italic text-3xl sm:text-4xl text-slate-900">
                Featured Projects
              </h2>
            </div>
            <Link
              to="/projects"
              className="text-xs text-slate-600 hover:text-black font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Explore All Details</span> <ArrowRight size={12} />
            </Link>
          </div>

          {isLoadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="liquid-glass rounded-3xl h-80 animate-pulse" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            /* Symmetrical, perfectly fitted Studio Commissioning Card for Clean Slate */
            <div className="liquid-glass rounded-3xl p-10 sm:p-14 border border-black/[0.08] text-center max-w-3xl mx-auto shadow-md space-y-6">
              <div className="w-16 h-16 rounded-full liquid-glass flex items-center justify-center mx-auto text-slate-600 ring-1 ring-black/10">
                <FolderGit2 size={26} />
              </div>
              <div>
                <h3 className="font-instrument italic text-2xl sm:text-3xl text-slate-900 mb-3">
                  Project Showcase Ready
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-lg mx-auto">
                  Your platform is freshly connected to the backend. Verified developers and administrators can publish projects with full technical specifications and creator attribution.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/register?type=developer"
                  className="px-7 py-3 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 shadow-md transition-all flex items-center gap-2"
                >
                  Register as Developer <ArrowRight size={13} />
                </Link>
                <Link
                  to="/login"
                  className="px-7 py-3 rounded-full liquid-glass text-slate-800 hover:text-black border border-black/10 text-xs hover:bg-black/[0.04] transition-all"
                >
                  Admin Sign In
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {filteredProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </FadeIn>
      </section>

      {/* ─────────────────────────────────────────
          4. EXECUTIVE LEADERSHIP & GOVERNANCE (Symmetrical 2-Column Cards)
      ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-black/[0.08]">
            <div>
              <p className="text-slate-500 text-xs tracking-widest uppercase font-mono mb-2">Founding Stewardship</p>
              <h2 className="font-instrument italic text-3xl sm:text-4xl text-slate-900">
                Executive Leadership
              </h2>
            </div>
            <span className="text-slate-500 text-xs font-mono hidden sm:block">
              {companyName} Headquarters · Hyderabad
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* CEO Card */}
            <div className="liquid-glass rounded-3xl p-8 sm:p-10 flex flex-col justify-between border border-black/[0.08] hover:border-black/20 shadow-sm hover:shadow-md transition-all">
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-black/10 flex items-center justify-center font-instrument italic text-slate-900 text-2xl shadow-inner shrink-0">
                      R
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-instrument italic text-2xl text-slate-900">Ritesh Lingamallu</h3>
                        <CheckCircle2 size={16} className="text-slate-700" />
                      </div>
                      <p className="text-slate-500 text-xs tracking-widest uppercase font-mono mt-0.5">
                        Chief Executive Officer
                      </p>
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">Super Admin · Lead Developer</p>
                    </div>
                  </div>
                </div>

                <p className="font-instrument italic text-xl text-slate-900 leading-relaxed mb-6">
                  "From first commit to final delivery — every step, accountable."
                </p>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                  Leads {companyName}'s core technology standards, distributed systems engineering, and AI-driven automation workflows. Oversees platform verification and developer quality assurance.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {['FastAPI', 'Python', 'React', 'TypeScript', 'AI/ML', 'System Design'].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-full text-[10px] font-mono liquid-glass text-slate-700 border border-black/10">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-black/[0.08] flex items-center justify-between">
                <Link to="/about" className="text-xs font-semibold text-slate-700 hover:text-black transition-colors flex items-center gap-1.5">
                  <span>Executive Details</span> <ArrowRight size={12} />
                </Link>
                <span className="text-[10px] font-mono text-slate-400">Verified Executive ID #01</span>
              </div>
            </div>

            {/* Core Engineering Squad Card */}
            <div className="liquid-glass rounded-3xl p-8 sm:p-10 flex flex-col justify-between border border-black/[0.08] hover:border-black/20 shadow-sm hover:shadow-md transition-all">
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center font-instrument italic text-2xl shadow-inner shrink-0">
                      <Code2 size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-instrument italic text-2xl text-slate-900">Engineering Squad</h3>
                        <CheckCircle2 size={16} className="text-slate-700" />
                      </div>
                      <p className="text-slate-500 text-xs tracking-widest uppercase font-mono mt-0.5">
                        Verified Core Developers
                      </p>
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">Full Stack · Cloud · Distributed Systems</p>
                    </div>
                  </div>
                </div>

                <p className="font-instrument italic text-xl text-slate-900 leading-relaxed mb-6">
                  "Production-grade code crafted with full transparency and verified attribution."
                </p>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                  Our core software engineers build enterprise solutions, cloud APIs, and responsive web platforms. Each project includes transparent creator attribution and direct client collaboration.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Docker', 'REST APIs'].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-full text-[10px] font-mono liquid-glass text-slate-700 border border-black/10">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-black/[0.08] flex items-center justify-between">
                <Link to="/team" className="text-xs font-semibold text-slate-700 hover:text-black transition-colors flex items-center gap-1.5">
                  <span>Meet The Team</span> <ArrowRight size={12} />
                </Link>
                <span className="text-[10px] font-mono text-slate-400">Verified Technical Squad</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ─────────────────────────────────────────
          5. VERIFIED DEVELOPERS ROSTER
      ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-black/[0.08]">
            <div>
              <p className="text-slate-500 text-xs tracking-widest uppercase font-mono mb-2">Talent Network</p>
              <h2 className="font-instrument italic text-3xl sm:text-4xl text-slate-900">
                Verified Developers
              </h2>
            </div>
            <Link
              to="/developers"
              className="text-xs text-slate-600 hover:text-black font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>View Full Roster</span> <ArrowRight size={12} />
            </Link>
          </div>

          {isLoadingDevs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="liquid-glass rounded-3xl h-64 animate-pulse" />
              ))}
            </div>
          ) : developers.length === 0 ? (
            <div className="liquid-glass rounded-3xl p-10 sm:p-12 border border-black/[0.08] text-center max-w-3xl mx-auto shadow-md space-y-5">
              <div className="w-14 h-14 rounded-full liquid-glass flex items-center justify-center mx-auto text-slate-600 ring-1 ring-black/10">
                <UserCheck size={24} />
              </div>
              <div>
                <h3 className="font-instrument italic text-2xl sm:text-3xl text-slate-900 mb-2">
                  Developer Network Primed
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
                  Are you an experienced full-stack engineer, AI practitioner, or systems engineer? Register to earn public attribution and receive direct inquiries.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/register?type=developer"
                  className="px-7 py-3 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 shadow-sm transition-all inline-flex items-center gap-2"
                >
                  Join Verified Roster <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {developers.slice(0, 3).map((dev) => (
                <DeveloperCard key={dev.id} developer={dev} />
              ))}
            </div>
          )}
        </FadeIn>
      </section>

      {/* ─────────────────────────────────────────
          6. DIRECT CLIENT CONSULTATION & INQUIRY SUITE
      ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <FadeIn>
          <div className="liquid-glass rounded-3xl p-8 sm:p-12 border border-black/[0.08] relative overflow-hidden shadow-xl bg-slate-50/40">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              
              {/* Copy */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest liquid-glass text-slate-700 border border-black/10 mb-4">
                  <Sparkles size={11} className="text-slate-600" /> Direct Executive Inquiry
                </span>
                <h3 className="font-instrument italic text-3xl sm:text-4xl text-slate-900 mb-4 leading-tight">
                  Have a project in mind? Let's engineer it.
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Connect directly with {companyName} leadership and verified developers. Tell us your goals, select your target discipline, and receive a comprehensive project blueprint.
                </p>
                <div className="space-y-3">
                  {[
                    'Direct communication with lead developers — zero middlemen',
                    'Fixed-scope deliverables with milestone-based engineering sprints',
                    'Full source code ownership and verified creator attribution',
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2.5 text-xs text-slate-700">
                      <Check size={14} className="text-slate-900 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div className="liquid-glass rounded-2xl p-6 sm:p-8 border border-black/[0.08] bg-white/90 shadow-md">
                {inquirySubmitted ? (
                  <div className="py-8 text-center space-y-3">
                    <CheckCircle2 size={36} className="text-slate-800 mx-auto" />
                    <h4 className="font-instrument italic text-2xl text-slate-900">Inquiry Received</h4>
                    <p className="text-slate-600 text-xs leading-relaxed max-w-xs mx-auto">
                      Thank you! Our executive team will review your requirements and reach out within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={inquiryName}
                          onChange={(e) => setInquiryName(e.target.value)}
                          placeholder="e.g. Anand Sharma"
                          className="w-full bg-white border border-black/10 rounded-xl text-slate-900 text-xs px-3.5 py-2.5 focus:border-black/30 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={inquiryEmail}
                          onChange={(e) => setInquiryEmail(e.target.value)}
                          placeholder="anand@enterprise.com"
                          className="w-full bg-white border border-black/10 rounded-xl text-slate-900 text-xs px-3.5 py-2.5 focus:border-black/30 focus:outline-none shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Primary Discipline</label>
                        <select
                          value={inquiryPillar}
                          onChange={(e) => setInquiryPillar(e.target.value)}
                          className="w-full bg-white border border-black/10 rounded-xl text-slate-900 text-xs px-3.5 py-2.5 focus:border-black/30 focus:outline-none shadow-sm"
                        >
                          <option value="Websites">Websites &amp; Web Apps</option>
                          <option value="Apps">Mobile Applications</option>
                          <option value="Software">Enterprise Software</option>
                          <option value="Digital Solutions">AI &amp; Digital Solutions</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Project Scope</label>
                        <select
                          value={inquiryBudget}
                          onChange={(e) => setInquiryBudget(e.target.value)}
                          className="w-full bg-white border border-black/10 rounded-xl text-slate-900 text-xs px-3.5 py-2.5 focus:border-black/30 focus:outline-none shadow-sm"
                        >
                          <option value="MVP / Proof of Concept">MVP / Proof of Concept</option>
                          <option value="Production Application">Production Application</option>
                          <option value="Enterprise Microservices">Enterprise Microservices</option>
                          <option value="Multi-Platform Ecosystem">Multi-Platform Ecosystem</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Project Overview</label>
                      <textarea
                        rows={3}
                        required
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Briefly describe what you'd like to build, timeline, or key technical goals…"
                        className="w-full bg-white border border-black/10 rounded-xl text-slate-900 text-xs px-3.5 py-2.5 focus:border-black/30 focus:outline-none resize-none shadow-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      Submit Consultation Request <ArrowRight size={13} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
};
