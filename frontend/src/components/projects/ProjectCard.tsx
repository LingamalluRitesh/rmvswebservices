import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight, Layers, Users, ShieldCheck, Eye } from 'lucide-react';
import type { Project } from '../../types';
import { GithubIcon } from '../common/Icons';

interface ProjectCardProps {
  project: Project;
  onQuickView?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const fallbackUrl = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80';
  const [imgSrc, setImgSrc] = useState(() => {
    if (project.image_url && !project.image_url.includes('1drv.ms')) {
      return project.image_url;
    }
    return fallbackUrl;
  });

  const leadAssoc = project.developer_associations?.find((d) => d.is_lead) || project.developer_associations?.[0];
  const leadDev = leadAssoc?.developer;
  const leadUser = leadDev?.user;
  const contributorCount = project.developer_associations?.length || 1;

  // Mouse spotlight tracking for interactive glow without layout repaints
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ transform: 'translateZ(0)' }}
      className="relative group rounded-3xl overflow-hidden bg-slate-900 border border-black/[0.08] shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-end h-[420px] sm:h-[460px]"
    >
      {/* Interactive Cursor Spotlight Glow */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.12), transparent 40%)'
        }}
      />

      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={imgSrc}
          alt={project.name}
          loading="lazy"
          decoding="async"
          onError={() => setImgSrc(fallbackUrl)}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
            isHovered ? 'scale-105 brightness-[0.72]' : 'scale-100 brightness-[0.82]'
          }`}
        />
        {/* Cinematic Multi-stop Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent" />
      </div>

      {/* Top Header / Badges Bar */}
      <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-mono bg-white/90 text-slate-900 font-semibold border border-black/10 shadow-sm backdrop-blur-md">
            {project.category || 'Platform'}
          </span>
          {project.demo_url && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-emerald-500/90 text-white font-medium shadow-sm backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Live
            </span>
          )}
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(project);
              }}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-black border border-black/10 shadow-sm transition-all flex items-center gap-1.5 text-xs font-medium backdrop-blur-md hover:scale-105"
              title="Quick Preview"
            >
              <Eye size={13} />
              <span className="hidden md:inline text-[11px]">Quick View</span>
            </button>
          )}

          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-black border border-black/10 shadow-sm transition-all backdrop-blur-md hover:scale-105"
              title="Launch Live Website"
            >
              <ExternalLink size={13} />
            </a>
          )}

          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-black border border-black/10 shadow-sm transition-all backdrop-blur-md hover:scale-105"
              title="View Repository"
            >
              <GithubIcon size={13} />
            </a>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 p-6 sm:p-7">
        <p className="text-white/70 text-[10px] tracking-widest uppercase font-mono mb-1.5">
          {project.client_name ? `Client · ${project.client_name}` : 'Engineered Platform'}
        </p>

        <Link to={`/projects/${project.slug}`}>
          <h3 className="font-instrument italic text-2xl sm:text-3xl text-white group-hover:text-blue-100 transition-colors leading-snug mb-2 drop-shadow-sm flex items-center gap-2">
            <span>{project.name}</span>
          </h3>
        </Link>

        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed mb-4 max-w-xl">
          {project.short_description || project.description}
        </p>

        {/* Technology Pills Directly on Card */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {project.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech.id || tech.name}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white/90 border border-white/10 backdrop-blur-md"
              >
                {tech.name}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="text-[10px] font-mono text-white/50">+{project.technologies.length - 3}</span>
            )}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <Link
            to={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-blue-200 transition-colors group/cta"
          >
            <span>Explore details</span>
            <ArrowRight size={13} className="group-hover/cta:translate-x-1 transition-transform" />
          </Link>

          {leadUser && (
            <Link
              to={`/developers/${leadUser.username}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 hover:bg-white border border-black/10 shadow-sm transition-all hover:scale-105"
            >
              {leadUser.avatar_url ? (
                <img src={leadUser.avatar_url} alt={leadUser.full_name} className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[9px] flex items-center justify-center font-instrument italic">
                  {leadUser.full_name.charAt(0)}
                </div>
              )}
              <span className="text-[11px] text-slate-700 font-medium">
                By <span className="text-slate-900 font-semibold">{leadUser.full_name.split(' ')[0]}</span>
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Spec Strip */}
      <div className="relative z-10 px-6 py-3 grid grid-cols-3 gap-2 bg-white/95 backdrop-blur-md border-t border-black/[0.08] text-[10px] text-slate-600 font-mono">
        <div className="flex items-center gap-1.5 truncate">
          <Layers size={11} className="text-slate-500 shrink-0" />
          <span className="truncate">{project.category || 'Web Application'}</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 border-x border-black/[0.08]">
          <Users size={11} className="text-slate-500 shrink-0" />
          <span>{contributorCount} {contributorCount === 1 ? 'Developer' : 'Squad'}</span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <ShieldCheck size={11} className="text-slate-700 shrink-0" />
          <span className="text-slate-900 font-semibold">Verified</span>
        </div>
      </div>
    </div>
  );
};
