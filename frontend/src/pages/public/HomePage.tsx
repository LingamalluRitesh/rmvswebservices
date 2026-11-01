import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, Globe, Smartphone, Code2, TrendingUp,
  FolderGit2, CheckCircle2,
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
      { id: 2, name: 'TypeScript' },
      { id: 4, name: 'Tailwind CSS' }
    ]
  }
];

export const HomePage: React.FC = () => {
  const { settings } = useSettings();
  const companyName = settings?.company_name || 'RMVS Web Services';
  const tagline = settings?.tagline || 'Next-Gen Cloud & Software Engineering';

  // Projects state initialized with local cache or instant fallback
  const [projects, setProjects] = useState<Project[]>(() => {
    const cached = localStorage.getItem('rmvs_cached_projects');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return fallbackInitialProjects;
  });

  const [developers, setDevelopers] = useState<DeveloperProfile[]>(() => {
    const cached = localStorage.getItem('rmvs_cached_developers');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return [];
  });

  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingDevs, setIsLoadingDevs] = useState(false);

  // Selected pillar filter
  const [selectedPillar, setSelectedPillar] = useState<string>('All');
  const [projectCardView, setProjectCardView] = useState<'grid' | 'showcase'>('grid');
  const [projectSearchQuery, setProjectSearchQuery] = useState('');

  // Quick View Modal
  const [quickViewProject, setQuickViewProject] = useState<Project | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Direct Consultation Inquiry Form
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPillar, setInquiryPillar] = useState('Websites');
  const [inquiryBudget, setInquiryBudget] = useState('Production Application');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  useEffect(() => {
    // Background refresh
    api.get('/projects?visibility=Public&status=Published')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProjects(res.data);
          localStorage.setItem('rmvs_cached_projects', JSON.stringify(res.data));
        }
      })
      .catch((e) => console.warn('Projects background refresh notice:', e.message))
      .finally(() => setIsLoadingProjects(false));

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
    <div className="bg-[#060b19] min-h-screen text-slate-100 overflow-x-hidden selection:bg-blue-600 selection:text-white">

      {/* ─────────────────────────────────────────
          1. HERO STAGE (BizNext Electric Blue Theme from Pinterest)
      ───────────────────────────────────────── */}
      <section className="relative min-h-[92vh] sm:min-h-[96vh] pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden rounded-b-[40px] sm:rounded-b-[56px] shadow-2xl flex flex-col justify-between px-4 sm:px-8 bg-[#060b19]">
        
        {/* Background Image Container with Luminous Studio Workspace & Night City Skyline */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-biznext-bg.jpg"
            alt="Futuristic Tech Studio with Analytics Laptop and Night Skyline"
            className="w-full h-full object-cover object-center brightness-[0.75] contrast-[1.1]"
            loading="eager"
            decoding="async"
          />
          {/* Obsidian & Midnight Blue Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060b19] via-[#060b19]/60 to-[#060b19]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060b19]/80 via-transparent to-[#060b19]/80" />
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
        </div>

        {/* Subtle Brand Watermark */}
        <div className="absolute top-8 sm:top-14 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-10 overflow-hidden">
          <span className="text-[clamp(5.5rem,19vw,16rem)] font-black tracking-tighter text-blue-500/[0.04] uppercase leading-none font-sans block whitespace-nowrap blur-[0.4px]">
            RMVS
          </span>
        </div>

        {/* Hero Content Area */}
        <div className="max-w-6xl mx-auto w-full z-20 my-auto flex flex-col items-center text-center pt-4 sm:pt-6">
          
          {/* Top Tag: — Professional — with Flanking Glowing Cyan Lines */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center gap-3 mb-5"
          >
            <span className="w-8 sm:w-16 h-[2px] bg-gradient-to-r from-transparent to-cyan-400 shadow-[0_0_8px_#38bdf8]" />
            <span className="text-cyan-400 font-mono text-xs sm:text-sm tracking-[0.25em] uppercase font-semibold text-glow">
              Professional Business Engineering
            </span>
            <span className="w-8 sm:w-16 h-[2px] bg-gradient-to-l from-transparent to-cyan-400 shadow-[0_0_8px_#38bdf8]" />
          </motion.div>

          {/* Main Headline (Exact BizNext Layout) */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-sans font-extrabold text-white text-[clamp(2.4rem,5.4vw,5rem)] leading-[1.08] tracking-tight drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)] max-w-4xl"
          >
            Professional Business Website{' '}
            <span className="relative inline-block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              Design
              <span className="absolute -bottom-1.5 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full shadow-[0_0_12px_#38bdf8]" />
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mt-6 drop-shadow-md font-normal"
          >
            Modern Layout for Startups and Companies. Architecting enterprise web portals, cloud microservices, and mobile apps with India's premier verified engineering squad.
          </motion.p>

          {/* Centered Pill Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mt-8"
          >
            {/* Signature Electric Blue CTA */}
            <Link
              to="/projects"
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white text-sm font-semibold shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 group cursor-pointer"
            >
              <span>Start Exploring</span>
              <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-xs group-hover:translate-x-0.5 transition-transform">
                ›
              </span>
            </Link>

            {/* Quick Showcase Modal Trigger */}
            <button
              type="button"
              onClick={() => {
                const topProject = projects[0] || fallbackInitialProjects[0];
                setQuickViewProject(topProject);
                setIsQuickViewOpen(true);
              }}
              className="px-6 py-3.5 rounded-full bg-[#0a1228]/85 hover:bg-blue-900/30 text-white border border-blue-500/30 hover:border-cyan-400/50 text-sm font-medium transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center gap-2 active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-cyan-300 flex items-center justify-center text-[10px] pl-0.5">
                ▶
              </span>
              <span>Play Showcase</span>
            </button>

            {/* Hire Engineers */}
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-full bg-[#0a1228]/85 hover:bg-blue-900/30 text-slate-200 hover:text-white border border-blue-500/30 hover:border-cyan-400/50 text-sm font-medium transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md"
            >
              Hire Engineers
            </Link>
          </motion.div>

          {/* ─────────────────────────────────────────
              THE 4 FLOATING FROSTED GLASS FEATURE CARDS (BizNext Reference)
          ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full max-w-6xl mt-12 text-left"
          >
            {/* Card 1: Website Design */}
            <div className="rounded-3xl p-6 bg-[#0a1228]/80 backdrop-blur-xl border border-blue-500/25 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-cyan-400/40 hover:shadow-[0_15px_35px_rgba(37,99,235,0.25)] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,102,255,0.2)]">
                  <Globe size={22} />
                </div>
                <h3 className="font-sans font-bold text-lg text-white mb-1.5">Website Design</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Ultra-responsive web portals and SaaS platforms engineered with React, TypeScript & Tailwind.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-blue-500/15 flex items-center justify-between text-[11px] font-mono text-cyan-400">
                <span>Speed & SEO Ready</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Card 2: SEO & Cloud Growth (FEATURED / ACTIVE CARD - Glowing Blue Gradient in BizNext reference) */}
            <div className="rounded-3xl p-6 bg-gradient-to-b from-blue-600 via-blue-700 to-blue-900 text-white border border-blue-400/50 shadow-[0_0_35px_rgba(37,99,235,0.6)] hover:shadow-[0_0_45px_rgba(37,99,235,0.85)] transition-all flex flex-col justify-between group transform lg:-translate-y-2">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    <TrendingUp size={22} />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/20 text-white font-semibold backdrop-blur-md">
                    Featured
                  </span>
                </div>
                <h3 className="font-sans font-bold text-lg text-white mb-1.5">SEO & Cloud Growth</h3>
                <p className="text-blue-100 text-xs leading-relaxed">
                  High-throughput FastAPI microservices, Neon PostgreSQL, and automated organic search acceleration.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/20 flex items-center justify-between text-[11px] font-mono text-cyan-200">
                <span>99.98% Uptime SLA</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Card 3: Mobile & E-Commerce */}
            <div className="rounded-3xl p-6 bg-[#0a1228]/80 backdrop-blur-xl border border-blue-500/25 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-cyan-400/40 hover:shadow-[0_15px_35px_rgba(37,99,235,0.25)] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,102,255,0.2)]">
                  <Smartphone size={22} />
                </div>
                <h3 className="font-sans font-bold text-lg text-white mb-1.5">Mobile & E-Commerce</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Cross-platform mobile apps in Flutter, frictionless checkout flows, and payment gateway orchestration.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-blue-500/15 flex items-center justify-between text-[11px] font-mono text-cyan-400">
                <span>iOS & Android Native</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Card 4: 24/7 AI Support */}
            <div className="rounded-3xl p-6 bg-[#0a1228]/80 backdrop-blur-xl border border-blue-500/25 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-cyan-400/40 hover:shadow-[0_15px_35px_rgba(37,99,235,0.25)] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,102,255,0.2)]">
                  <Zap size={22} />
                </div>
                <h3 className="font-sans font-bold text-lg text-white mb-1.5">24/7 AI Support</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Autonomous intelligent agent integrations, real-time client WhatsApp channels, and continuous SLA.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-blue-500/15 flex items-center justify-between text-[11px] font-mono text-cyan-400">
                <span>Instant Advisory</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </motion.div>

          {/* Metrics Capsule Pill (Exact BizNext Reference) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-6 sm:px-8 py-3 rounded-full bg-[#081026]/90 border border-blue-500/30 backdrop-blur-md text-xs sm:text-sm font-mono text-slate-300 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
          >
            <span className="flex items-center gap-2"><span className="text-cyan-400 font-bold">500+</span> Projects</span>
            <span className="text-blue-500/40">|</span>
            <span className="flex items-center gap-2"><span className="text-cyan-400 font-bold">98%</span> Client Satisfaction</span>
            <span className="text-blue-500/40">|</span>
            <span className="flex items-center gap-2"><span className="text-cyan-400 font-bold">24/7</span> Support</span>
            <span className="text-blue-500/40 hidden sm:inline">|</span>
            <Link to="/contact" className="text-cyan-400 hover:text-white font-semibold flex items-center gap-1 transition-colors">
              Get Free Quote →
            </Link>
          </motion.div>

          {/* Bottom Tagline */}
          <div className="mt-4 text-center">
            <span className="text-slate-400 font-mono text-xs tracking-[0.25em] uppercase">
              — {tagline || 'Modern · Fast · Secure · Scalable'} —
            </span>
          </div>

        </div>

        {/* Scroll Down Cue */}
        <div className="z-20 text-center pt-4 pb-2">
          <div 
            onClick={() => {
              const el = document.getElementById('disciplines-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-cyan-400/80 hover:text-cyan-300 text-xs font-mono tracking-widest uppercase cursor-pointer transition-colors animate-bounce"
          >
            <span>Scroll down</span>
            <ChevronDown size={14} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          2. THE 4 PILLARS & EDITORIAL HEADER
      ───────────────────────────────────────── */}
      <section id="disciplines-section" className="py-20 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
        <FadeIn>
          {/* Centered Small Pill Badge */}
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-300 text-xs font-mono uppercase tracking-widest shadow-[0_0_15px_rgba(0,102,255,0.2)]">
              <Zap size={13} className="text-cyan-400" />
              <span>CORE CAPABILITIES</span>
            </span>
          </div>

          {/* Two-Tone Editorial Headline */}
          <h2 className="font-sans font-bold text-3xl sm:text-5xl text-white text-center max-w-3xl mx-auto leading-tight mb-4">
            Turn every digital requirement into <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">high-performing reality.</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base text-center max-w-2xl mx-auto mb-14 leading-relaxed">
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
                className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between group bg-[#0a1228]/80 hover:bg-[#0e1938] border border-blue-500/20 hover:border-cyan-400/40 shadow-lg hover:shadow-[0_10px_30px_rgba(37,99,235,0.25)] transition-all"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,102,255,0.2)]">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-instrument italic text-2xl text-white mb-1">{title}</h3>
                  <p className="text-cyan-400 text-[11px] font-mono uppercase tracking-wider mb-4">{subtitle}</p>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">{desc}</p>

                  <div className="space-y-2 mb-6 pt-4 border-t border-blue-500/15">
                    {specs.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-[11px] text-slate-300">
                        <Check size={12} className="text-cyan-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-500/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Delivery Tier</span>
                    <span className="text-white font-semibold text-xs">Production Grade</span>
                  </div>
                  <Link
                    to="/contact"
                    className="px-4 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600 text-xs font-medium text-cyan-300 hover:text-white border border-blue-500/30 transition-all flex items-center gap-1 shadow-sm"
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
          3. PROJECTS SHOWCASE SECTION
      ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto" id="projects-section">
        <FadeIn>
          {/* Section Header with View Modes */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-blue-500/20">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
                <p className="text-cyan-400 text-xs tracking-widest uppercase font-mono">Attributed Works & Live Platforms</p>
              </div>
              <h2 className="font-instrument italic text-3xl sm:text-4xl text-white">
                Featured Projects
              </h2>
            </div>

            {/* Interactive View Controls */}
            <div className="flex items-center gap-2.5">
              <div className="rounded-full p-1 bg-[#0a1228]/80 border border-blue-500/25 flex items-center gap-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setProjectCardView('grid')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    projectCardView === 'grid'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                      : 'text-slate-400 hover:text-white'
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
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Detailed Showcase View"
                >
                  <SlidersHorizontal size={13} />
                  <span>Showcase</span>
                </button>
              </div>

              <Link
                to="/projects"
                className="text-xs text-cyan-300 hover:text-white font-semibold transition-colors flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0a1228]/80 border border-blue-500/25 hover:border-blue-400/50"
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
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                        : 'bg-[#0a1228]/80 text-slate-400 hover:text-white border border-blue-500/20'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        selectedPillar === cat ? 'bg-white/20 text-white' : 'bg-blue-950/80 text-cyan-300'
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
                className="w-full pl-9 pr-7 py-1.5 rounded-full bg-[#070e22] border border-blue-500/25 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-all shadow-xs"
              />
              {projectSearchQuery && (
                <button
                  type="button"
                  onClick={() => setProjectSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
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
                <div key={i} className="rounded-3xl h-80 animate-pulse bg-[#0a1228]/60 border border-blue-500/15" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-3xl p-10 sm:p-14 border border-blue-500/25 text-center max-w-2xl mx-auto shadow-md space-y-4 bg-[#0a1228]/80">
              <div className="w-14 h-14 rounded-full bg-blue-950/60 flex items-center justify-center mx-auto text-cyan-400 ring-1 ring-blue-500/30">
                <FolderGit2 size={24} />
              </div>
              <h3 className="font-instrument italic text-2xl text-white">
                No matching projects found
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
                No projects found for "{projectSearchQuery || selectedPillar}". Try selecting "All" or resetting your search.
              </p>
              <button
                type="button"
                onClick={() => { setSelectedPillar('All'); setProjectSearchQuery(''); }}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : projectCardView === 'grid' ? (
            /* 1. Grid Cards Mode */
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
            /* 2. Detailed Showcase Mode */
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
                    className="rounded-3xl p-6 sm:p-8 border border-blue-500/25 bg-[#0a1228]/85 shadow-md hover:shadow-[0_10px_35px_rgba(37,99,235,0.25)] transition-all duration-300 flex flex-col lg:flex-row gap-6 lg:gap-8 items-center"
                  >
                    {/* Media Preview Column */}
                    <div className="relative w-full lg:w-1/2 h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-900 shrink-0 group">
                      <img
                        src={imgSrc}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.85]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#060b19] via-transparent to-transparent" />

                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#070e22]/90 text-cyan-300 font-semibold shadow-sm backdrop-blur-md border border-blue-500/30">
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
                          className="px-3.5 py-1.5 rounded-full bg-[#0a142e]/90 hover:bg-blue-600/40 text-cyan-200 text-xs font-medium border border-blue-500/30 shadow-sm transition-transform hover:scale-105 flex items-center gap-1.5 backdrop-blur-md"
                        >
                          <Eye size={13} />
                          <span>Quick Preview</span>
                        </button>
                        {p.demo_url && (
                          <a
                            href={p.demo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-full bg-[#0a142e]/90 hover:bg-blue-600/40 text-cyan-200 border border-blue-500/30 shadow-sm transition-transform hover:scale-105 backdrop-blur-md"
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
                          <span className="text-[10px] font-mono text-cyan-300 font-semibold px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/30">
                            Verified Production
                          </span>
                        </div>

                        <Link to={`/projects/${p.slug}`}>
                          <h3 className="font-instrument italic text-2xl sm:text-3xl text-white hover:text-cyan-300 transition-colors leading-snug mb-2.5">
                            {p.name}
                          </h3>
                        </Link>

                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                          {p.short_description || p.description}
                        </p>

                        {/* Technology Capsules */}
                        {p.technologies && p.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {p.technologies.map((t) => (
                              <span
                                key={t.id || t.name}
                                className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#070e22] text-cyan-300 border border-blue-500/20"
                              >
                                {t.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Lead Developer & Actions Strip */}
                      <div className="pt-4 border-t border-blue-500/15 flex flex-wrap items-center justify-between gap-3">
                        {leadUser ? (
                          <Link
                            to={`/developers/${leadUser.username}`}
                            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                          >
                            {leadUser.avatar_url ? (
                              <img src={leadUser.avatar_url} alt={leadUser.full_name} className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-500/30" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-950 text-cyan-300 text-xs flex items-center justify-center font-instrument italic">
                                {leadUser.full_name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-semibold text-white flex items-center gap-1">
                                <span>{leadUser.full_name}</span>
                                {leadUser.is_verified && <CheckCircle2 size={12} className="text-cyan-400" />}
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
                            className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white border border-blue-500/30 hover:border-blue-400/60 bg-[#0a1228] transition-colors flex items-center gap-1.5"
                          >
                            <Eye size={12} />
                            <span>Quick View</span>
                          </button>
                          {p.demo_url ? (
                            <a
                              href={p.demo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <Globe size={12} />
                              <span>Live Site</span>
                            </a>
                          ) : (
                            <Link
                              to={`/projects/${p.slug}`}
                              className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
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
          4. EXECUTIVE LEADERSHIP & GOVERNANCE
      ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-blue-500/20">
            <div>
              <p className="text-cyan-400 text-xs tracking-widest uppercase font-mono mb-2">Founding Stewardship</p>
              <h2 className="font-instrument italic text-3xl sm:text-4xl text-white">
                Executive Leadership
              </h2>
            </div>
            <span className="text-slate-400 text-xs font-mono hidden sm:block">
              {companyName} Headquarters · Hyderabad
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* CEO Card */}
            <div className="rounded-3xl p-8 sm:p-10 flex flex-col justify-between border border-blue-500/25 bg-[#0a1228]/85 hover:border-cyan-400/40 shadow-xl transition-all">
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center font-instrument italic text-cyan-300 text-2xl shadow-inner shrink-0">
                      R
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-instrument italic text-2xl text-white">Ritesh Lingamallu</h3>
                        <CheckCircle2 size={16} className="text-cyan-400" />
                      </div>
                      <p className="text-cyan-400 text-xs tracking-widest uppercase font-mono mt-0.5">
                        Chief Executive Officer
                      </p>
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">Super Admin · Lead Developer</p>
                    </div>
                  </div>
                </div>

                <p className="font-instrument italic text-xl text-cyan-100 leading-relaxed mb-6">
                  "From first commit to final delivery — every step, accountable."
                </p>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                  Leads {companyName}'s core technology standards, distributed systems engineering, and AI-driven automation workflows. Oversees platform verification and developer quality assurance.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {['FastAPI', 'Python', 'React', 'TypeScript', 'AI/ML', 'System Design'].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#070e22] text-cyan-300 border border-blue-500/20">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-blue-500/15 flex items-center justify-between">
                <Link to="/about" className="text-xs font-semibold text-cyan-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Executive Details</span> <ArrowRight size={12} />
                </Link>
                <span className="text-[10px] font-mono text-slate-400">Verified Executive ID #01</span>
              </div>
            </div>

            {/* Core Engineering Squad Card */}
            <div className="rounded-3xl p-8 sm:p-10 flex flex-col justify-between border border-blue-500/25 bg-[#0a1228]/85 hover:border-cyan-400/40 shadow-xl transition-all">
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-instrument italic text-2xl shadow-inner shrink-0">
                      <Code2 size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-instrument italic text-2xl text-white">Engineering Squad</h3>
                        <CheckCircle2 size={16} className="text-cyan-400" />
                      </div>
                      <p className="text-cyan-400 text-xs tracking-widest uppercase font-mono mt-0.5">
                        Verified Core Developers
                      </p>
                      <p className="text-slate-400 text-[11px] font-mono mt-0.5">Full Stack · Cloud · Distributed Systems</p>
                    </div>
                  </div>
                </div>

                <p className="font-instrument italic text-xl text-cyan-100 leading-relaxed mb-6">
                  "Production-grade code crafted with full transparency and verified attribution."
                </p>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                  Our core software engineers build enterprise solutions, cloud APIs, and responsive web platforms. Each project includes transparent creator attribution and direct client collaboration.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Docker', 'REST APIs'].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#070e22] text-cyan-300 border border-blue-500/20">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-blue-500/15 flex items-center justify-between">
                <Link to="/team" className="text-xs font-semibold text-cyan-400 hover:text-white transition-colors flex items-center gap-1.5">
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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-blue-500/20">
            <div>
              <p className="text-cyan-400 text-xs tracking-widest uppercase font-mono mb-2">Talent Network</p>
              <h2 className="font-instrument italic text-3xl sm:text-4xl text-white">
                Verified Developers
              </h2>
            </div>
            <Link
              to="/developers"
              className="text-xs text-cyan-400 hover:text-white font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>View Full Roster</span> <ArrowRight size={12} />
            </Link>
          </div>

          {isLoadingDevs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl h-64 animate-pulse bg-[#0a1228]/60 border border-blue-500/15" />
              ))}
            </div>
          ) : developers.length === 0 ? (
            <div className="rounded-3xl p-10 sm:p-12 border border-blue-500/25 text-center max-w-3xl mx-auto shadow-md space-y-5 bg-[#0a1228]/80">
              <div className="w-14 h-14 rounded-full bg-blue-950/60 flex items-center justify-center mx-auto text-cyan-400 ring-1 ring-blue-500/30">
                <UserCheck size={24} />
              </div>
              <div>
                <h3 className="font-instrument italic text-2xl sm:text-3xl text-white mb-2">
                  Developer Network Primed
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto">
                  Are you an experienced full-stack engineer, AI practitioner, or systems engineer? Register to earn public attribution and receive direct inquiries.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/register?type=developer"
                  className="px-7 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all inline-flex items-center gap-2"
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
          <div className="rounded-3xl p-8 sm:p-12 border border-blue-500/25 relative overflow-hidden shadow-2xl bg-[#0a1228]/90">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              
              {/* Copy */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-blue-950/80 text-cyan-300 border border-blue-500/30 mb-4">
                  <Sparkles size={11} className="text-cyan-400" /> Direct Executive Inquiry
                </span>
                <h3 className="font-instrument italic text-3xl sm:text-4xl text-white mb-4 leading-tight">
                  Have a project in mind? Let's engineer it.
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Connect directly with {companyName} leadership and verified developers. Tell us your goals, select your target discipline, and receive a comprehensive project blueprint.
                </p>
                <div className="space-y-3">
                  {[
                    'Direct communication with lead developers — zero middlemen',
                    'Fixed-scope deliverables with milestone-based engineering sprints',
                    'Full source code ownership and verified creator attribution',
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check size={14} className="text-cyan-400 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div className="rounded-2xl p-6 sm:p-8 border border-blue-500/25 bg-[#070e22]/95 shadow-xl">
                {inquirySubmitted ? (
                  <div className="py-8 text-center space-y-3">
                    <CheckCircle2 size={36} className="text-cyan-400 mx-auto" />
                    <h4 className="font-instrument italic text-2xl text-white">Inquiry Received</h4>
                    <p className="text-slate-300 text-xs leading-relaxed max-w-xs mx-auto">
                      Thank you! Our executive team will review your requirements and reach out within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={inquiryName}
                          onChange={(e) => setInquiryName(e.target.value)}
                          placeholder="e.g. Anand Sharma"
                          className="w-full bg-[#050a17] border border-blue-500/25 rounded-xl text-white text-xs px-3.5 py-2.5 focus:border-cyan-400 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={inquiryEmail}
                          onChange={(e) => setInquiryEmail(e.target.value)}
                          placeholder="anand@enterprise.com"
                          className="w-full bg-[#050a17] border border-blue-500/25 rounded-xl text-white text-xs px-3.5 py-2.5 focus:border-cyan-400 focus:outline-none shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Primary Discipline</label>
                        <select
                          value={inquiryPillar}
                          onChange={(e) => setInquiryPillar(e.target.value)}
                          className="w-full bg-[#050a17] border border-blue-500/25 rounded-xl text-white text-xs px-3.5 py-2.5 focus:border-cyan-400 focus:outline-none shadow-sm"
                        >
                          <option value="Websites" className="bg-[#050a17] text-white">Websites &amp; Web Apps</option>
                          <option value="Apps" className="bg-[#050a17] text-white">Mobile Applications</option>
                          <option value="Software" className="bg-[#050a17] text-white">Enterprise Software</option>
                          <option value="Digital Solutions" className="bg-[#050a17] text-white">AI &amp; Digital Solutions</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Project Scope</label>
                        <select
                          value={inquiryBudget}
                          onChange={(e) => setInquiryBudget(e.target.value)}
                          className="w-full bg-[#050a17] border border-blue-500/25 rounded-xl text-white text-xs px-3.5 py-2.5 focus:border-cyan-400 focus:outline-none shadow-sm"
                        >
                          <option value="MVP / Proof of Concept" className="bg-[#050a17] text-white">MVP / Proof of Concept</option>
                          <option value="Production Application" className="bg-[#050a17] text-white">Production Application</option>
                          <option value="Enterprise Microservices" className="bg-[#050a17] text-white">Enterprise Microservices</option>
                          <option value="Multi-Platform Ecosystem" className="bg-[#050a17] text-white">Multi-Platform Ecosystem</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Project Overview</label>
                      <textarea
                        rows={3}
                        required
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Briefly describe what you'd like to build, timeline, or key technical goals…"
                        className="w-full bg-[#050a17] border border-blue-500/25 rounded-xl text-white text-xs px-3.5 py-2.5 focus:border-cyan-400 focus:outline-none resize-none shadow-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
