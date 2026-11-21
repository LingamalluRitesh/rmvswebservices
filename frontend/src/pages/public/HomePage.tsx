import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, Globe, Smartphone, Code2, TrendingUp,
  FolderGit2, CheckCircle2,
  Sparkles, Check, UserCheck, LayoutGrid, SlidersHorizontal, Search, Eye, ExternalLink,
  ChevronDown, Zap, Activity, Calendar
} from 'lucide-react';
import api from '../../api/client';
import type { Project, DeveloperProfile } from '../../types';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectQuickViewModal } from '../../components/projects/ProjectQuickViewModal';
import { DeveloperCard } from '../../components/developers/DeveloperCard';
import { useSettings } from '../../context/SettingsContext';
import { InteractiveProjectEstimator } from '../../components/home/InteractiveProjectEstimator';
import { fallbackProjects } from '../../data/fallbackProjects';

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
    description: 'Modern, responsive business website designed to showcase professional water purification and treatment services across Andhra Pradesh and Telangana.',
    category: 'Websites',
    demo_url: 'https://www.sreewatersolutions.com/',
    repo_url: undefined,
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
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
      { id: 2, name: 'TypeScript' },
      { id: 4, name: 'Tailwind CSS' }
    ]
  },
  {
    id: 4,
    name: 'Narasimha Stills',
    slug: 'narasimha-stills',
    short_description: 'Cinematic visual portfolio showcasing high-definition photography, wedding moments, and event capturing with interactive gallery design.',
    description: 'High-performance interactive 3D photography showcase featuring cinematic animations, drone visual captures, and responsive visual aesthetics.',
    category: 'Websites',
    demo_url: 'https://photography-website-ahc.pages.dev/',
    repo_url: undefined,
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
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
    description: 'Solar energy platform engineered with responsive layouts, power calculator, commercial installation estimator, and enterprise consultation booking.',
    category: 'Websites',
    demo_url: 'https://www.pbrsolarenergy.com/',
    repo_url: 'https://github.com/LingamalluRitesh/pbr-solar',
    image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
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
  },
  {
    id: 6,
    name: 'RMVS Nexus Enterprise ERP',
    slug: 'rmvs-nexus-erp',
    short_description: 'High-throughput enterprise resource planning and microservices engine with asynchronous database pooling and granular RBAC.',
    description: 'Distributed backend architecture supporting multi-tenant isolation, real-time telemetry streaming, role-based access control, and asynchronous job queues.',
    category: 'Software',
    demo_url: 'https://rmvswebservices.onrender.com/',
    repo_url: undefined,
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
    visibility: 'Public',
    client_name: 'RMVS Enterprise',
    created_at: '2026-10-15T10:00:00.000000Z',
    developer_associations: [
      {
        id: 7,
        role_in_project: 'Lead Architect',
        is_lead: true,
        developer: {
          id: 3,
          title: 'Chief Executive Officer (CEO)',
          availability: 'Available for Advisory',
          years_experience: 5,
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
            { id: 6, name: 'PostgreSQL' },
            { id: 10, name: 'Docker' }
          ]
        }
      }
    ],
    technologies: [
      { id: 1, name: 'Python' },
      { id: 2, name: 'FastAPI' },
      { id: 6, name: 'PostgreSQL' }
    ]
  },
  {
    id: 7,
    name: 'Aura Logistics Mobile App',
    slug: 'aura-logistics-app',
    short_description: 'Cross-platform mobile engineering for real-time fleet telemetry, GPS courier dispatch, and temperature-controlled cold chain tracking.',
    description: 'High-reliability mobile application engineered with offline-first synchronization, biometric login, turn-by-turn route optimization, and live temperature alert push notifications.',
    category: 'Apps',
    demo_url: 'https://rmvswebservices.onrender.com/track',
    repo_url: undefined,
    image_url: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
    visibility: 'Public',
    client_name: 'Aura Freight Systems',
    created_at: '2026-10-20T14:30:00.000000Z',
    developer_associations: [
      {
        id: 8,
        role_in_project: 'Mobile Lead',
        is_lead: true,
        developer: {
          id: 3,
          title: 'Chief Executive Officer (CEO)',
          availability: 'Available for Advisory',
          years_experience: 5,
          user: {
            id: 3,
            username: 'riteshlingamallu8',
            full_name: 'Ritesh Lingamallu',
            role: 'super_admin',
            avatar_url: 'https://media.licdn.com/dms/image/v2/D4D35AQFckrBvrwWh-Q/profile-framedphoto-shrink_800_800/B4DaAWMSiVJIAI-/0/1787078715771?e=1791622800&v=beta&t=5EVFRjqZKuo7-6gVsyWdAueZFzhaO5w9XV2TTdU5TmA',
            is_verified: true,
          },
          skills: [
            { id: 18, name: 'Flutter' },
            { id: 17, name: 'AWS' },
            { id: 1, name: 'Python' }
          ]
        }
      }
    ],
    technologies: [
      { id: 18, name: 'Flutter' },
      { id: 17, name: 'AWS' }
    ]
  },
  {
    id: 8,
    name: 'Synapse AI & WhatsApp Platform',
    slug: 'synapse-ai-automation',
    short_description: 'Autonomous multi-agent orchestration and official Meta WhatsApp Cloud API v21.0 event dispatcher with live webhook analytics.',
    description: 'Enterprise digital intelligence platform integrating custom LLM pipelines, real-time customer conversation routing, automated order milestone notifications, and proactive delivery updates.',
    category: 'Digital Solutions',
    demo_url: 'https://rmvswebservices.onrender.com/ceo',
    repo_url: undefined,
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
    visibility: 'Public',
    client_name: 'Global Commerce Group',
    created_at: '2026-10-25T16:45:00.000000Z',
    developer_associations: [
      {
        id: 9,
        role_in_project: 'Lead AI Architect',
        is_lead: true,
        developer: {
          id: 3,
          title: 'Chief Executive Officer (CEO)',
          availability: 'Available for Advisory',
          years_experience: 5,
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
            { id: 7, name: 'AI/ML' },
            { id: 2, name: 'FastAPI' }
          ]
        }
      }
    ],
    technologies: [
      { id: 1, name: 'Python' },
      { id: 2, name: 'FastAPI' },
      { id: 7, name: 'AI/ML' }
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
    return fallbackProjects;
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
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryPillar, setInquiryPillar] = useState('Websites');
  const [inquiryBudget, setInquiryBudget] = useState('Production Application');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  useEffect(() => {
    // Background refresh: retrieve all public projects (published & ongoing active sprints)
    api.get('/projects?visibility=Public')
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

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInquiry(true);
    try {
      await api.post('/inquiries', {
        name: inquiryName,
        email: inquiryEmail,
        phone: inquiryPhone,
        service: `${inquiryPillar} (${inquiryBudget})`,
        message: inquiryMessage,
      }).catch((err) => console.warn('Inquiry API note:', err.message));

      await api.post('/notifications/phone-alert', {
        event_type: 'direct_consultation_request',
        summary: `New Consultation Request from ${inquiryName}`,
        details: {
          client_name: inquiryName,
          client_email: inquiryEmail,
          client_phone: inquiryPhone || 'Not provided',
          discipline: inquiryPillar,
          scope: inquiryBudget,
          message: inquiryMessage,
        },
      }).catch((err) => console.warn('Phone alert note:', err.message));

      setInquirySubmitted(true);
    } catch (err) {
      console.error(err);
      setInquirySubmitted(true);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const ongoingProjects = projects.filter(
    (p) =>
      p.status?.toLowerCase() === 'ongoing' ||
      p.status?.toLowerCase() === 'in progress' ||
      p.status?.toLowerCase() === 'in development'
  );

  const filteredProjects = projects.filter((p) => {
    let matchesCategory = true;
    if (selectedPillar === 'Ongoing' || selectedPillar === '⚡ Ongoing Works') {
      matchesCategory =
        p.status?.toLowerCase() === 'ongoing' ||
        p.status?.toLowerCase() === 'in progress' ||
        p.status?.toLowerCase() === 'in development';
    } else if (selectedPillar !== 'All') {
      matchesCategory = p.category?.toLowerCase() === selectedPillar.toLowerCase();
    }
    const query = projectSearchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      p.name.toLowerCase().includes(query) ||
      (p.short_description && p.short_description.toLowerCase().includes(query)) ||
      (p.client_name && p.client_name.toLowerCase().includes(query)) ||
      (p.technologies && p.technologies.some((t) => t.name.toLowerCase().includes(query)));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800 overflow-x-hidden selection:bg-blue-600 selection:text-white">

      {/* ─────────────────────────────────────────
          1. HERO STAGE (Crisp Modern White Theme with Real Tech Workspace)
      ───────────────────────────────────────── */}
      <section className="relative min-h-[92vh] sm:min-h-[96vh] pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden rounded-b-[40px] sm:rounded-b-[56px] shadow-sm flex flex-col justify-between px-4 sm:px-8 bg-white border-b border-slate-200/80">
        
        {/* Background Image Container with Luminous Studio Workspace & Night City Skyline */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-white-tech-bg.jpg"
            alt="Futuristic Tech Studio with Analytics Laptop and Skyline"
            className="w-full h-full object-cover object-center brightness-[0.98] contrast-[1.05]"
            loading="eager"
            decoding="async"
          />
          {/* Pristine Modern White Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/55 to-white/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/25 to-white/80" />
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        </div>

        {/* Subtle Brand Watermark */}
        <div className="absolute top-8 sm:top-14 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-10 overflow-hidden">
          <span className="text-[clamp(5.5rem,19vw,16rem)] font-black tracking-tighter text-slate-900/[0.03] uppercase leading-none font-sans block whitespace-nowrap blur-[0.4px]">
            RMVS
          </span>
        </div>

        {/* Hero Content Area */}
        <div className="max-w-6xl mx-auto w-full z-20 my-auto flex flex-col items-center text-center pt-4 sm:pt-6">
          
          {/* Top Tag: — Professional — with Flanking Blue Accent Lines */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center gap-3 mb-5"
          >
            <span className="w-8 sm:w-16 h-[2px] bg-gradient-to-r from-transparent to-blue-600 shadow-xs" />
            <span className="text-blue-600 font-mono text-xs sm:text-sm tracking-[0.25em] uppercase font-bold">
              Professional Business Engineering
            </span>
            <span className="w-8 sm:w-16 h-[2px] bg-gradient-to-l from-transparent to-blue-600 shadow-xs" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-sans font-extrabold text-slate-900 text-[clamp(2.4rem,5.4vw,5rem)] leading-[1.08] tracking-tight drop-shadow-xs max-w-4xl"
          >
            Professional Business Website{' '}
            <span className="relative inline-block bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Design
              <span className="absolute -bottom-1.5 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 rounded-full shadow-xs" />
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mt-6 font-normal"
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
              className="px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 group cursor-pointer"
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
              className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-sm font-medium transition-all shadow-xs flex items-center gap-2 active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] pl-0.5">
                ▶
              </span>
              <span>Play Showcase</span>
            </button>

            {/* Hire Engineers */}
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-sm font-medium transition-all shadow-xs backdrop-blur-md"
            >
              Hire Engineers
            </Link>
          </motion.div>

          {/* Clean Trust Highlights Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-slate-600 font-mono"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 shadow-2xs" />
              <span>100% Verified Creators</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Zero Intermediary Markup</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 shadow-2xs" />
              <span>FastAPI &amp; React &amp; Neon DB</span>
            </div>
          </motion.div>

        </div>

        {/* Scroll Down Cue */}
        <div className="z-20 text-center pt-6 pb-2">
          <div 
            onClick={() => {
              const el = document.getElementById('disciplines-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-xs font-mono tracking-widest uppercase cursor-pointer transition-colors animate-bounce font-semibold"
          >
            <span>Scroll down</span>
            <ChevronDown size={14} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          2. THE 4 CAPABILITIES & GROWTH SOLUTIONS (Clean Light Design)
      ───────────────────────────────────────── */}
      <section id="disciplines-section" className="py-20 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
        <FadeIn>
          {/* Centered Small Pill Badge */}
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-mono uppercase tracking-widest font-bold shadow-2xs">
              <Zap size={13} className="text-blue-600" />
              <span>CORE CAPABILITIES &amp; GROWTH SOLUTIONS</span>
            </span>
          </div>

          {/* Two-Tone Editorial Headline */}
          <h2 className="font-sans font-bold text-3xl sm:text-5xl text-slate-900 text-center max-w-3xl mx-auto leading-tight mb-4">
            Turn every digital requirement into <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">high-performing reality.</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base text-center max-w-2xl mx-auto mb-14 leading-relaxed">
            Direct collaboration with India's premier software engineers. Zero intermediary markup, total transparency, and verified creator attribution.
          </p>

          {/* The 4 Signature Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {/* Card 1: Website Design */}
            <div className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between group bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-blue-400 shadow-[0_4px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.12)] transition-all lag-free">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-5 group-hover:scale-105 transition-all shadow-2xs">
                  <Globe size={22} />
                </div>
                <h3 className="font-sans font-bold text-xl text-slate-900 mb-1">Website Design</h3>
                <p className="text-blue-600 text-[11px] font-mono uppercase tracking-wider mb-3 font-semibold">High-Performance Web Portals</p>
                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  Ultra-responsive web portals, SaaS platforms, and client dashboards engineered with React, TypeScript &amp; Tailwind.
                </p>

                <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                  {['React 18 / Vite', 'FastAPI Backends', 'Mobile-Responsive', 'Speed & SEO Ready'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[11px] text-slate-700">
                      <Check size={12} className="text-blue-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Delivery Tier</span>
                  <span className="text-slate-900 font-semibold text-xs">Production Grade</span>
                </div>
                <Link
                  to="/contact"
                  className="px-4 py-1.5 rounded-full bg-blue-50 hover:bg-blue-600 text-xs font-semibold text-blue-600 hover:text-white border border-blue-200 transition-all flex items-center gap-1 shadow-2xs"
                >
                  Inquire <ArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* Card 2: SEO & Cloud Growth (Featured Card in vibrant blue gradient) */}
            <div className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between group bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-800 text-white border border-blue-400/50 shadow-xl hover:shadow-2xl transition-all transform lg:-translate-y-2 lag-free">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white group-hover:scale-105 transition-all shadow-sm">
                    <TrendingUp size={22} />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/20 text-white font-semibold backdrop-blur-md">
                    Featured
                  </span>
                </div>
                <h3 className="font-sans font-bold text-xl text-white mb-1">SEO &amp; Cloud Growth</h3>
                <p className="text-cyan-200 text-[11px] font-mono uppercase tracking-wider mb-3">Enterprise Cloud &amp; Microservices</p>
                <p className="text-blue-100 text-xs leading-relaxed mb-6">
                  High-throughput FastAPI microservices, Neon PostgreSQL, cloud automation, and automated organic search acceleration.
                </p>

                <div className="space-y-2 mb-6 pt-4 border-t border-white/20">
                  {['Distributed APIs', 'PostgreSQL / Redis', 'Docker & K8s', '99.98% Uptime SLA'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[11px] text-blue-100">
                      <Check size={12} className="text-cyan-200 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-200 font-mono uppercase block">Delivery Tier</span>
                  <span className="text-white font-semibold text-xs">Featured Tier</span>
                </div>
                <Link
                  to="/contact"
                  className="px-4 py-1.5 rounded-full bg-white hover:bg-blue-50 text-xs font-semibold text-blue-900 border border-white/30 transition-all flex items-center gap-1 shadow-sm"
                >
                  Inquire <ArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* Card 3: Mobile & E-Commerce */}
            <div className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between group bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-blue-400 shadow-[0_4px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.12)] transition-all lag-free">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-5 group-hover:scale-105 transition-all shadow-2xs">
                  <Smartphone size={22} />
                </div>
                <h3 className="font-sans font-bold text-xl text-slate-900 mb-1">Mobile &amp; E-Commerce</h3>
                <p className="text-blue-600 text-[11px] font-mono uppercase tracking-wider mb-3 font-semibold">Cross-Platform Mobile</p>
                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  Cross-platform mobile apps in Flutter, frictionless checkout flows, biometric auth, and payment gateway orchestration.
                </p>

                <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                  {['Flutter / Dart', 'React Native', 'Offline-First Cache', 'iOS & Android Native'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[11px] text-slate-700">
                      <Check size={12} className="text-blue-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Delivery Tier</span>
                  <span className="text-slate-900 font-semibold text-xs">Production Grade</span>
                </div>
                <Link
                  to="/contact"
                  className="px-4 py-1.5 rounded-full bg-blue-50 hover:bg-blue-600 text-xs font-semibold text-blue-600 hover:text-white border border-blue-200 transition-all flex items-center gap-1 shadow-2xs"
                >
                  Inquire <ArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* Card 4: 24/7 AI Support */}
            <div className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between group bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-blue-400 shadow-[0_4px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.12)] transition-all lag-free">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-5 group-hover:scale-105 transition-all shadow-2xs">
                  <Zap size={22} />
                </div>
                <h3 className="font-sans font-bold text-xl text-slate-900 mb-1">24/7 AI Support</h3>
                <p className="text-blue-600 text-[11px] font-mono uppercase tracking-wider mb-3 font-semibold">AI &amp; Autonomous Systems</p>
                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  Autonomous intelligent agent integrations, real-time client WhatsApp channels, and continuous 24/7 SLA engineering.
                </p>

                <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                  {['LLM Orchestration', 'Workflow Bots', 'Instant Advisory', 'Telemetry Dashboards'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[11px] text-slate-700">
                      <Check size={12} className="text-blue-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Delivery Tier</span>
                  <span className="text-slate-900 font-semibold text-xs">24/7 Dedicated SLA</span>
                </div>
                <Link
                  to="/contact"
                  className="px-4 py-1.5 rounded-full bg-blue-50 hover:bg-blue-600 text-xs font-semibold text-blue-600 hover:text-white border border-blue-200 transition-all flex items-center gap-1 shadow-2xs"
                >
                  Inquire <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>

          {/* Metrics Capsule Pill */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-6 sm:px-8 py-3.5 rounded-full bg-white border border-slate-200 backdrop-blur-md text-xs sm:text-sm font-mono text-slate-700 shadow-sm max-w-3xl mx-auto">
            <span className="flex items-center gap-2"><span className="text-blue-600 font-bold">500+</span> Projects</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-2"><span className="text-blue-600 font-bold">98%</span> Client Satisfaction</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-2"><span className="text-blue-600 font-bold">24/7</span> Support</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <Link to="/contact" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors">
              Get Free Quote →
            </Link>
          </div>

          {/* Tagline */}
          <div className="mt-5 text-center">
            <span className="text-slate-400 font-mono text-xs tracking-[0.25em] uppercase">
              — {tagline || 'Modern · Fast · Secure · Scalable'} —
            </span>
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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <p className="text-blue-600 text-xs tracking-widest uppercase font-mono font-semibold">Attributed Works & Live Platforms</p>
              </div>
              <h2 className="font-instrument italic text-3xl sm:text-4xl text-slate-900">
                Featured Projects
              </h2>
            </div>

            {/* Interactive View Controls */}
            <div className="flex items-center gap-2.5">
              <div className="rounded-full p-1 bg-white border border-slate-200 flex items-center gap-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setProjectCardView('grid')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    projectCardView === 'grid'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Grid Cards View"
                >
                  <LayoutGrid size={13} />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProjectCardView('showcase')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    projectCardView === 'showcase'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Detailed Showcase View"
                >
                  <SlidersHorizontal size={13} />
                  <span>Showcase</span>
                </button>
              </div>

              <Link
                to="/projects"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-slate-200 hover:border-blue-400 shadow-2xs"
              >
                <span>Directory</span> <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Active Engineering Sprints Callout Banner if ongoing projects exist */}
          {ongoingProjects.length > 0 && selectedPillar === 'All' && !projectSearchQuery && (
            <div className="mb-10 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border border-amber-200/90 shadow-[0_4px_25px_rgba(245,158,11,0.08)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-amber-200/60">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-amber-800">
                      Live Sprint Lab · In Active Development
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span>Ongoing Client Builds &amp; Active Sprints</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                    Discover software systems our engineers are building right now. Live sprint progress, architectural roadmaps, and target deployment dates.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPillar('⚡ Ongoing Works')}
                  className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
                >
                  <span>Filter {ongoingProjects.length} Ongoing Works</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Ongoing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {ongoingProjects.slice(0, 2).map((op) => {
                  const fallbackImg = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';
                  const posterUrl = op.image_url && !op.image_url.includes('1drv.ms') ? op.image_url : fallbackImg;
                  return (
                    <div
                      key={op.id}
                      className="group rounded-2xl bg-white border border-amber-200/80 p-5 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col sm:flex-row gap-4 items-center"
                    >
                      <div className="relative w-full sm:w-44 h-36 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100">
                        <img
                          src={posterUrl}
                          alt={op.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-white">
                          ⚡ Ongoing
                        </span>
                      </div>

                      <div className="flex-1 w-full flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-semibold mb-1">
                            {op.client_name ? `Client · ${op.client_name}` : 'Engineered System'}
                          </p>
                          <Link to={`/projects/${op.slug}`}>
                            <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {op.name}
                            </h4>
                          </Link>
                          <p className="text-xs text-slate-600 line-clamp-1 mt-1 mb-3">
                            {op.short_description || op.description}
                          </p>

                          {/* Progress bar */}
                          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 mb-3">
                            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                              <span className="text-amber-900 font-semibold truncate">{op.current_stage || 'In Development'}</span>
                              <span className="text-amber-950 font-bold ml-1">{op.progress_percentage ?? 60}%</span>
                            </div>
                            <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(5, op.progress_percentage ?? 60))}%` }}
                              />
                            </div>
                            {op.completion_date && (
                              <p className="text-[9px] text-amber-800 font-mono mt-1">
                                Launch: <span className="font-semibold">{op.completion_date}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <Link
                            to={`/projects/${op.slug}`}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <span>Sprint Details</span>
                            <ArrowRight size={11} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setQuickViewProject(op);
                              setIsQuickViewOpen(true);
                            }}
                            className="text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            Quick View
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Filter Pills & Live Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {['All', '⚡ Ongoing Works', 'Websites', 'Apps', 'Software', 'Digital Solutions'].map((cat) => {
                const count = cat === 'All'
                  ? projects.length
                  : cat === '⚡ Ongoing Works'
                  ? projects.filter((p) => p.status?.toLowerCase() === 'ongoing' || p.status?.toLowerCase() === 'in progress' || p.status?.toLowerCase() === 'in development').length
                  : projects.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedPillar(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      selectedPillar === cat
                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        selectedPillar === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
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
                className="w-full pl-9 pr-7 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs transition-all"
              />
              {projectSearchQuery && (
                <button
                  type="button"
                  onClick={() => setProjectSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
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
                <div key={i} className="rounded-3xl h-80 animate-pulse bg-slate-100 border border-slate-200" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-3xl p-10 sm:p-14 border border-slate-200 text-center max-w-2xl mx-auto shadow-sm space-y-4 bg-white">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-600 ring-1 ring-blue-100">
                <FolderGit2 size={24} />
              </div>
              <h3 className="font-instrument italic text-2xl text-slate-900">
                No matching projects found
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
                No projects found for "{projectSearchQuery || selectedPillar}". Try selecting "All" or resetting your search.
              </p>
              <button
                type="button"
                onClick={() => { setSelectedPillar('All'); setProjectSearchQuery(''); }}
                className="px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm"
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
                const fallbackImg = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';
                const imgSrc = p.image_url && !p.image_url.includes('1drv.ms') ? p.image_url : fallbackImg;
                const isOngoing =
                  p.status?.toLowerCase() === 'ongoing' ||
                  p.status?.toLowerCase() === 'in progress' ||
                  p.status?.toLowerCase() === 'in development';

                return (
                  <div
                    key={p.id}
                    className="rounded-3xl p-6 sm:p-8 border border-slate-200/90 bg-white shadow-[0_4px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_35px_rgba(37,99,235,0.12)] hover:border-blue-300 transition-all duration-300 flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lag-free"
                  >
                    {/* Media Preview Column */}
                    <div className="relative w-full lg:w-1/2 h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-100 shrink-0 group border border-slate-100">
                      <img
                        src={imgSrc}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/95 text-blue-600 font-semibold shadow-xs backdrop-blur-md border border-slate-200">
                          {p.category || 'Platform'}
                        </span>
                        {isOngoing ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-amber-500 text-white font-semibold shadow-xs backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            Ongoing Sprint
                          </span>
                        ) : p.demo_url ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-emerald-600 text-white font-medium shadow-xs backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Live
                          </span>
                        ) : null}
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setQuickViewProject(p);
                            setIsQuickViewOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white text-slate-800 text-xs font-semibold border border-slate-200 shadow-xs transition-transform hover:scale-105 flex items-center gap-1.5 backdrop-blur-md"
                        >
                          <Eye size={13} />
                          <span>Quick Preview</span>
                        </button>
                        {p.demo_url && (
                          <a
                            href={p.demo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-full bg-white/95 hover:bg-white text-blue-600 border border-slate-200 shadow-xs transition-transform hover:scale-105 backdrop-blur-md"
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
                          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-medium">
                            {p.client_name ? `Client · ${p.client_name}` : 'Engineered Platform'}
                          </span>
                          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                            isOngoing ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-blue-700 bg-blue-50 border-blue-200'
                          }`}>
                            {isOngoing ? 'Active Sprint' : 'Verified Production'}
                          </span>
                        </div>

                        <Link to={`/projects/${p.slug}`}>
                          <h3 className="font-instrument italic text-2xl sm:text-3xl text-slate-900 hover:text-blue-600 transition-colors leading-snug mb-2.5">
                            {p.name}
                          </h3>
                        </Link>

                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                          {p.short_description || p.description}
                        </p>

                        {/* Ongoing Development Sprint Progress Telemetry */}
                        {isOngoing && (
                          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 shadow-2xs">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                              <span className="text-amber-900 font-semibold flex items-center gap-1.5 truncate">
                                <Activity size={12} className="text-amber-600 shrink-0" />
                                <span className="truncate">{p.current_stage || 'In Active Development'}</span>
                              </span>
                              <span className="text-amber-950 font-bold font-mono ml-2">
                                {p.progress_percentage ?? 60}%
                              </span>
                            </div>
                            <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(5, p.progress_percentage ?? 60))}%` }}
                              />
                            </div>
                            {p.completion_date && (
                              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-800 font-mono">
                                <Calendar size={11} className="text-amber-600 shrink-0" />
                                <span>Target Launch: <strong className="text-amber-950 font-semibold">{p.completion_date}</strong></span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Technology Capsules */}
                        {p.technologies && p.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {p.technologies.map((t) => (
                              <span
                                key={t.id || t.name}
                                className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-50 text-slate-700 border border-slate-200"
                              >
                                {t.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Lead Developer & Actions Strip */}
                      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        {leadUser ? (
                          <Link
                            to={`/developers/${leadUser.username}`}
                            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                          >
                            {leadUser.avatar_url ? (
                              <img src={leadUser.avatar_url} alt={leadUser.full_name} className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-200" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-xs flex items-center justify-center font-instrument italic">
                                {leadUser.full_name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                                <span>{leadUser.full_name}</span>
                                {leadUser.is_verified && <CheckCircle2 size={12} className="text-blue-600" />}
                              </p>
                              <p className="text-[10px] font-mono text-slate-500 uppercase">{leadAssoc?.role_in_project || 'Lead Architect'}</p>
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
                            className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
                          >
                            <Eye size={12} />
                            <span>Quick View</span>
                          </button>
                          {p.demo_url ? (
                            <a
                              href={p.demo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <Globe size={12} />
                              <span>Live Site</span>
                            </a>
                          ) : (
                            <Link
                              to={`/projects/${p.slug}`}
                              className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-200">
            <div>
              <p className="text-blue-600 text-xs tracking-widest uppercase font-mono mb-2 font-semibold">Founding Stewardship</p>
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
            <div className="rounded-3xl p-8 sm:p-10 flex flex-col justify-between border border-slate-200/90 bg-white hover:border-blue-400 shadow-[0_4px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_35px_rgba(37,99,235,0.1)] transition-all lag-free">
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center font-instrument italic text-blue-600 text-2xl shadow-2xs shrink-0">
                      R
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-instrument italic text-2xl text-slate-900">Ritesh Lingamallu</h3>
                        <CheckCircle2 size={16} className="text-blue-600" />
                      </div>
                      <p className="text-blue-600 text-xs tracking-widest uppercase font-mono mt-0.5 font-semibold">
                        Chief Executive Officer
                      </p>
                      <p className="text-slate-500 text-[11px] font-mono mt-0.5">Super Admin · Lead Developer</p>
                    </div>
                  </div>
                </div>

                <p className="font-instrument italic text-xl text-slate-800 leading-relaxed mb-6">
                  "From first commit to final delivery — every step, accountable."
                </p>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                  Leads {companyName}'s core technology standards, distributed systems engineering, and AI-driven automation workflows. Oversees platform verification and developer quality assurance.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {['FastAPI', 'Python', 'React', 'TypeScript', 'AI/ML', 'System Design'].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-50 text-slate-700 border border-slate-200">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link to="/about" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5">
                  <span>Executive Details</span> <ArrowRight size={12} />
                </Link>
                <span className="text-[10px] font-mono text-slate-400">Verified Executive ID #01</span>
              </div>
            </div>

            {/* Core Engineering Squad Card */}
            <div className="rounded-3xl p-8 sm:p-10 flex flex-col justify-between border border-slate-200/90 bg-white hover:border-blue-400 shadow-[0_4px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_35px_rgba(37,99,235,0.1)] transition-all lag-free">
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-instrument italic text-2xl shadow-2xs shrink-0">
                      <Code2 size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-instrument italic text-2xl text-slate-900">Engineering Squad</h3>
                        <CheckCircle2 size={16} className="text-blue-600" />
                      </div>
                      <p className="text-blue-600 text-xs tracking-widest uppercase font-mono mt-0.5 font-semibold">
                        Verified Core Developers
                      </p>
                      <p className="text-slate-500 text-[11px] font-mono mt-0.5">Full Stack · Cloud · Distributed Systems</p>
                    </div>
                  </div>
                </div>

                <p className="font-instrument italic text-xl text-slate-800 leading-relaxed mb-6">
                  "Production-grade code crafted with full transparency and verified attribution."
                </p>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                  Our core software engineers build enterprise solutions, cloud APIs, and responsive web platforms. Each project includes transparent creator attribution and direct client collaboration.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Docker', 'REST APIs'].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-50 text-slate-700 border border-slate-200">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link to="/team" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5">
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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-200">
            <div>
              <p className="text-blue-600 text-xs tracking-widest uppercase font-mono mb-2 font-semibold">Talent Network</p>
              <h2 className="font-instrument italic text-3xl sm:text-4xl text-slate-900">
                Verified Developers
              </h2>
            </div>
            <Link
              to="/developers"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>View Full Roster</span> <ArrowRight size={12} />
            </Link>
          </div>

          {isLoadingDevs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl h-64 animate-pulse bg-slate-100 border border-slate-200" />
              ))}
            </div>
          ) : developers.length === 0 ? (
            <div className="rounded-3xl p-10 sm:p-12 border border-slate-200 text-center max-w-3xl mx-auto shadow-sm space-y-5 bg-white">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-600 ring-1 ring-blue-100">
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
                  className="px-7 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-2"
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
          <div className="rounded-3xl p-8 sm:p-12 border border-slate-200 relative overflow-hidden shadow-sm bg-gradient-to-br from-white via-blue-50/20 to-slate-50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              
              {/* Copy */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200 mb-4 font-semibold">
                  <Sparkles size={11} className="text-blue-600" /> Direct Executive Inquiry
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
                      <Check size={14} className="text-blue-600 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div className="rounded-2xl p-6 sm:p-8 border border-slate-200/90 bg-white shadow-md">
                {inquirySubmitted ? (
                  <div className="py-8 text-center space-y-3">
                    <CheckCircle2 size={36} className="text-blue-600 mx-auto" />
                    <h4 className="font-instrument italic text-2xl text-slate-900">Inquiry Received</h4>
                    <p className="text-slate-600 text-xs leading-relaxed max-w-xs mx-auto">
                      Thank you! Our executive team will review your requirements and reach out within 24 hours. A notification has been automatically dispatched.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-semibold">Your Name</label>
                        <input
                          type="text"
                          required
                          value={inquiryName}
                          onChange={(e) => setInquiryName(e.target.value)}
                          placeholder="e.g. Anand Sharma"
                          className="w-full bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 text-xs px-3.5 py-2.5 focus:border-blue-500 focus:bg-white focus:outline-none shadow-2xs transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-semibold">Email Address</label>
                        <input
                          type="email"
                          required
                          value={inquiryEmail}
                          onChange={(e) => setInquiryEmail(e.target.value)}
                          placeholder="anand@enterprise.com"
                          className="w-full bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 text-xs px-3.5 py-2.5 focus:border-blue-500 focus:bg-white focus:outline-none shadow-2xs transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-semibold">Phone Number</label>
                        <input
                          type="tel"
                          value={inquiryPhone}
                          onChange={(e) => setInquiryPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 text-xs px-3.5 py-2.5 focus:border-blue-500 focus:bg-white focus:outline-none shadow-2xs transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-semibold">Primary Discipline</label>
                        <select
                          value={inquiryPillar}
                          onChange={(e) => setInquiryPillar(e.target.value)}
                          className="w-full bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 text-xs px-3.5 py-2.5 focus:border-blue-500 focus:bg-white focus:outline-none shadow-2xs transition-colors"
                        >
                          <option value="Websites">Websites &amp; Web Apps</option>
                          <option value="Apps">Mobile Applications</option>
                          <option value="Software">Enterprise Software</option>
                          <option value="Digital Solutions">AI &amp; Digital Solutions</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-semibold">Project Scope</label>
                      <select
                        value={inquiryBudget}
                        onChange={(e) => setInquiryBudget(e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 text-xs px-3.5 py-2.5 focus:border-blue-500 focus:bg-white focus:outline-none shadow-2xs transition-colors"
                      >
                        <option value="MVP / Proof of Concept">MVP / Proof of Concept</option>
                        <option value="Production Application">Production Application</option>
                        <option value="Enterprise Microservices">Enterprise Microservices</option>
                        <option value="Multi-Platform Ecosystem">Multi-Platform Ecosystem</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-semibold">Project Overview</label>
                      <textarea
                        rows={3}
                        required
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Briefly describe what you'd like to build, timeline, or key technical goals…"
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 text-xs px-3.5 py-2.5 focus:border-blue-500 focus:bg-white focus:outline-none resize-none shadow-2xs transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingInquiry}
                      className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmittingInquiry ? 'Dispatching...' : 'Submit Consultation Request'} <ArrowRight size={13} />
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
