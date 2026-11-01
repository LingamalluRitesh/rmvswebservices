import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, Globe, Smartphone, Code2, TrendingUp,
  ShieldCheck, FolderGit2, CheckCircle2,
  Sparkles, Check, UserCheck, LayoutGrid, SlidersHorizontal, Search, Eye, ExternalLink,
  ChevronDown, Zap
} from 'lucide-react';
import api from '../../api/client';
import type { Project, DeveloperProfile } from '../../types';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectQuickViewModal } from '../../components/projects/ProjectQuickViewModal';
import { DeveloperCard } from '../../components/developers/DeveloperCard';
import { useSettings } from '../../context/SettingsContext';
import { InteractiveProjectEstimator } from '../../components/home/InteractiveProjectEstimator';

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
  const [projectCardView, setProjectCardView] = useState<'grid' | 'showcase'>('grid');
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [quickViewProject, setQuickViewProject] = useState<Project | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
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

  const filteredProjects = projects.filter((p) => {
    const matchesCategory = selectedPillar === 'All' || p.category?.toLowerCase() === selectedPillar.toLowerCase();
    const query = projectSearchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      p.name.toLowerCase().includes(query) ||
      (p.short_description && p.short_description.toLowerCase().includes(query)) ||
      (p.client_name && p.client_name.toLowerCase().includes(query)) ||
      (p.technologies && p.technologies.some((t) => t.name.toLowerCase().includes(query)));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen text-slate-900 overflow-x-hidden">

      {/* ─────────────────────────────────────────
          1. HERO STAGE (Panoramic Skyline Executive Office & Cloud Engine)
      ───────────────────────────────────────── */}
      <section className="relative min-h-[90vh] sm:min-h-[94vh] pt-24 sm:pt-32 pb-20 sm:pb-24 overflow-hidden rounded-b-[40px] sm:rounded-b-[56px] shadow-2xl flex flex-col justify-between px-4 sm:px-8 bg-slate-950">
        
        {/* Background Image Container with Panoramic City View Office */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-office-bg.jpg"
            alt="Modern Executive Tech Office with Glass Walls and City Skyline View"
            className="w-full h-full object-cover object-center brightness-[0.94] contrast-[1.05]"
            loading="eager"
            decoding="async"
          />
          {/* Multi-stop cinematic gradients for rich depth & high legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
        </div>

        {/* Massive Translucent Watermark Brand Typography ("RMVS" / "Wattbank" style) */}
        <div className="absolute top-8 sm:top-14 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-10 overflow-hidden">
          <span className="text-[clamp(5.5rem,19vw,16rem)] font-black tracking-tighter text-white/[0.13] uppercase leading-none font-sans block whitespace-nowrap blur-[0.4px]">
            RMVS
          </span>
        </div>

        {/* Main Hero Content Grid (2 Columns: Value Proposition + Monolithic Hardware Card) */}
        <div className="max-w-6xl mx-auto w-full z-20 my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center pt-4 sm:pt-6">
          
          {/* Left Column: Bold Headline & Stadium Pill CTA */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Top refined badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass bg-white/10 backdrop-blur-md text-white text-xs font-mono tracking-widest uppercase border border-white/20 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span>Next-Gen Cloud Engineering</span>
              <span className="text-white/40">•</span>
              <span className="text-white/80">{tagline}</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="font-sans font-extrabold text-white text-[clamp(2.5rem,5.5vw,4.8rem)] leading-[1.08] tracking-tight drop-shadow-lg"
            >
              Get More Value <br />
              From Your Tech Stack.
            </motion.h1>

            {/* Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-white/85 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed drop-shadow-sm font-normal"
            >
              Architecting enterprise websites, high-concurrency mobile apps, and autonomous cloud software.
              Design • Develop • Grow Together with India's premier verified engineering squad.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3.5 pt-2"
            >
              {/* Signature Stadium Pill Button with circular arrow */}
              <Link
                to="/projects"
                className="px-7 py-3.5 rounded-full bg-white text-slate-950 text-sm font-semibold hover:bg-slate-100 shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition-all flex items-center gap-2.5 group active:scale-95"
              >
                <span>Start Exploring</span>
                <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-xs group-hover:translate-x-0.5 transition-transform">
                  ›
                </span>
              </Link>

              <Link
                to="/register"
                className="px-6 py-3.5 rounded-full liquid-glass bg-white/10 text-white border border-white/25 hover:bg-white/20 text-sm font-medium transition-all shadow-sm"
              >
                Hire Engineers
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Monolithic Hardware / Cloud Engine Card (Exact WattBank style) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.25 }}
              className="relative w-full max-w-[320px] sm:max-w-[360px]"
            >
              {/* Monolithic Device Chassis */}
              <div className="rounded-3xl bg-white/[0.95] backdrop-blur-2xl p-6 sm:p-7 border border-white/60 shadow-[0_35px_80px_rgba(0,0,0,0.55)] text-slate-900 transition-transform duration-500 hover:scale-[1.01]">
                
                {/* Hardware Header with Brand Mark & Status */}
                <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] mb-5">
                  <div className="flex items-center gap-2">
                    <img src="/logo-icon.png" alt="RMVS" className="w-5 h-5 object-contain" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800">
                      RMVS WebEngine
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    Online 99.9%
                  </span>
                </div>

                {/* Glowing Emerald Vertical LED Indicator Line (Exact Wattbank style) */}
                <div className="py-4 flex flex-col items-center justify-center">
                  <div className="w-1.5 h-16 rounded-full bg-emerald-400 shadow-[0_0_20px_#34d399,0_0_8px_#10b981] animate-pulse" />
                  <p className="mt-3 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Live Production Core
                  </p>
                </div>

                {/* Real-time System Specs & Telemetry */}
                <div className="space-y-2.5 pt-2 pb-3">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-black/[0.05] flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Architecture</span>
                    <span className="font-mono font-semibold text-slate-900">FastAPI & React</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-black/[0.05] flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Cloud Database</span>
                    <span className="font-mono font-semibold text-emerald-700">PostgreSQL (Neon)</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-black/[0.05] flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-slate-700" />
                      <span>Engineering Squad</span>
                    </span>
                    <span className="font-mono font-semibold text-slate-900">100% Verified</span>
                  </div>
                </div>

                {/* Floating Glass "Play Showcase" Pill Button (Matches the reference "Play" button) */}
                <button
                  type="button"
                  onClick={() => {
                    const topProject = projects[0] || fallbackInitialProjects[0];
                    setQuickViewProject(topProject);
                    setIsQuickViewOpen(true);
                  }}
                  className="absolute -bottom-4 -right-2 sm:-right-4 px-5 py-2.5 rounded-full liquid-glass bg-white text-slate-900 border border-black/10 shadow-[0_12px_30px_rgba(0,0,0,0.25)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-xs font-semibold cursor-pointer z-30"
                >
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] pl-0.5">
                    ▶
                  </span>
                  <span>Play Showcase</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Centered Scroll Down Cue (Exact Wattbank style) */}
        <div className="z-20 text-center pt-6 pb-2">
          <div 
            onClick={() => {
              const el = document.getElementById('disciplines-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-mono tracking-widest uppercase cursor-pointer transition-colors animate-bounce"
          >
            <span>Scroll down</span>
            <ChevronDown size={14} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          2. THE 4 PILLARS & EDITORIAL HEADER (Wattbank Aesthetic)
      ───────────────────────────────────────── */}
      <section id="disciplines-section" className="py-20 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
        <FadeIn>
          {/* Centered Small Pill Badge */}
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-black/10 text-slate-800 text-xs font-mono uppercase tracking-widest shadow-2xs">
              <Zap size={13} className="text-amber-600" />
              <span>CORE CAPABILITIES</span>
            </span>
          </div>

          {/* Two-Tone Editorial Headline */}
          <h2 className="font-sans font-bold text-3xl sm:text-5xl text-slate-950 text-center max-w-3xl mx-auto leading-tight mb-4">
            Turn every digital requirement into <span className="text-slate-400 font-medium">high-performing reality.</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base text-center max-w-2xl mx-auto mb-14 leading-relaxed">
            Direct collaboration with India's premier software engineers. Zero intermediary markup, total transparency, and verified creator attribution.
          </p>

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
          2.5 INTERACTIVE PROJECT SCOPE ESTIMATOR
      ───────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <FadeIn>
          <InteractiveProjectEstimator />
        </FadeIn>
      </section>

      {/* ─────────────────────────────────────────
          3. PROJECTS SHOWCASE SECTION (Interactive Cards & Showcase Modes)
      ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto" id="projects-section">
        <FadeIn>
          {/* Section Header with View Modes */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-black/[0.08]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-slate-500 text-xs tracking-widest uppercase font-mono">Attributed Works & Live Platforms</p>
              </div>
              <h2 className="font-instrument italic text-3xl sm:text-4xl text-slate-900">
                Featured Projects
              </h2>
            </div>

            {/* Interactive View Controls */}
            <div className="flex items-center gap-2.5">
              <div className="liquid-glass rounded-full p-1 border border-black/10 flex items-center gap-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setProjectCardView('grid')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    projectCardView === 'grid'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-slate-600 hover:text-black hover:bg-black/[0.04]'
                  }`}
                  title="Grid Cards View"
                >
                  <LayoutGrid size={13} />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProjectCardView('showcase')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    projectCardView === 'showcase'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-slate-600 hover:text-black hover:bg-black/[0.04]'
                  }`}
                  title="Detailed Showcase View"
                >
                  <SlidersHorizontal size={13} />
                  <span>Showcase</span>
                </button>
              </div>

              <Link
                to="/projects"
                className="text-xs text-slate-700 hover:text-black font-semibold transition-colors flex items-center gap-1.5 px-3.5 py-2 rounded-full liquid-glass border border-black/10 hover:border-black/20"
              >
                <span>Directory</span> <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Interactive Filter Pills & Live Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {['All', 'Websites', 'Apps', 'Software', 'Digital Solutions'].map((cat) => {
                const count = cat === 'All'
                  ? projects.length
                  : projects.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedPillar(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      selectedPillar === cat
                        ? 'bg-black text-white shadow-xs'
                        : 'liquid-glass text-slate-600 hover:text-black hover:bg-black/[0.04] border border-black/[0.08]'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        selectedPillar === cat ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                value={projectSearchQuery}
                onChange={(e) => setProjectSearchQuery(e.target.value)}
                placeholder="Search projects & stack..."
                className="w-full pl-9 pr-7 py-1.5 rounded-full bg-slate-50 border border-black/10 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-black/30 transition-all shadow-xs"
              />
              {projectSearchQuery && (
                <button
                  type="button"
                  onClick={() => setProjectSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Projects Rendering */}
          {isLoadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="liquid-glass rounded-3xl h-80 animate-pulse border border-black/[0.06]" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="liquid-glass rounded-3xl p-10 sm:p-14 border border-black/[0.08] text-center max-w-2xl mx-auto shadow-md space-y-4">
              <div className="w-14 h-14 rounded-full liquid-glass flex items-center justify-center mx-auto text-slate-600 ring-1 ring-black/10">
                <FolderGit2 size={24} />
              </div>
              <h3 className="font-instrument italic text-2xl text-slate-900">
                No matching projects found
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto">
                No projects found for "{projectSearchQuery || selectedPillar}". Try selecting "All" or resetting your search.
              </p>
              <button
                type="button"
                onClick={() => { setSelectedPillar('All'); setProjectSearchQuery(''); }}
                className="px-5 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : projectCardView === 'grid' ? (
            /* 1. Grid Cards Mode (High interactivity, spotlight hover, quick preview) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filteredProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onQuickView={(proj) => {
                    setQuickViewProject(proj);
                    setIsQuickViewOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            /* 2. Detailed Showcase Mode (Panoramic rich cards with deep architecture specs) */
            <div className="space-y-8">
              {filteredProjects.map((p) => {
                const leadAssoc = p.developer_associations?.find((d) => d.is_lead) || p.developer_associations?.[0];
                const leadDev = leadAssoc?.developer;
                const leadUser = leadDev?.user;
                const fallbackImg = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80';
                const imgSrc = p.image_url && !p.image_url.includes('1drv.ms') ? p.image_url : fallbackImg;

                return (
                  <div
                    key={p.id}
                    style={{ transform: 'translateZ(0)' }}
                    className="liquid-glass rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row gap-6 lg:gap-8 items-center"
                  >
                    {/* Media Preview Column */}
                    <div className="relative w-full lg:w-1/2 h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-900 shrink-0 group">
                      <img
                        src={imgSrc}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.85]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/90 text-slate-900 font-semibold shadow-sm backdrop-blur-md">
                          {p.category || 'Platform'}
                        </span>
                        {p.demo_url && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-emerald-500/90 text-white font-medium shadow-sm backdrop-blur-md">
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
                          className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 text-xs font-medium shadow-sm transition-transform hover:scale-105 flex items-center gap-1.5"
                        >
                          <Eye size={13} />
                          <span>Quick Preview</span>
                        </button>
                        {p.demo_url && (
                          <a
                            href={p.demo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-sm transition-transform hover:scale-105"
                            title="Launch Live Application"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Specs Column */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-5">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                            {p.client_name ? `Client · ${p.client_name}` : 'Engineered Platform'}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-600 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                            Verified Production
                          </span>
                        </div>

                        <Link to={`/projects/${p.slug}`}>
                          <h3 className="font-instrument italic text-2xl sm:text-3xl text-slate-900 hover:text-black transition-colors leading-snug mb-2.5">
                            {p.name}
                          </h3>
                        </Link>

                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                          {p.short_description || p.description}
                        </p>

                        {/* Technology Capsules */}
                        {p.technologies && p.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {p.technologies.map((t) => (
                              <span
                                key={t.id || t.name}
                                className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700 border border-black/[0.06]"
                              >
                                {t.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Lead Developer & Actions Strip */}
                      <div className="pt-4 border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-3">
                        {leadUser ? (
                          <Link
                            to={`/developers/${leadUser.username}`}
                            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                          >
                            {leadUser.avatar_url ? (
                              <img src={leadUser.avatar_url} alt={leadUser.full_name} className="w-8 h-8 rounded-full object-cover ring-1 ring-black/10" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 text-xs flex items-center justify-center font-instrument italic">
                                {leadUser.full_name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                                <span>{leadUser.full_name}</span>
                                {leadUser.is_verified && <CheckCircle2 size={12} className="text-slate-700" />}
                              </p>
                              <p className="text-[10px] font-mono text-slate-400 uppercase">{leadAssoc?.role_in_project || 'Lead Architect'}</p>
                            </div>
                          </Link>
                        ) : (
                          <div />
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setQuickViewProject(p);
                              setIsQuickViewOpen(true);
                            }}
                            className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 hover:text-black border border-black/10 hover:border-black/20 bg-white transition-colors flex items-center gap-1.5"
                          >
                            <Eye size={12} />
                            <span>Quick View</span>
                          </button>
                          {p.demo_url ? (
                            <a
                              href={p.demo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-5 py-2 rounded-full bg-black hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <Globe size={12} />
                              <span>Live Site</span>
                            </a>
                          ) : (
                            <Link
                              to={`/projects/${p.slug}`}
                              className="px-5 py-2 rounded-full bg-black hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <span>Explore</span>
                              <ArrowRight size={12} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* Interactive Project Quick-View Modal */}
      <ProjectQuickViewModal
        project={quickViewProject}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </div>
  );
};
