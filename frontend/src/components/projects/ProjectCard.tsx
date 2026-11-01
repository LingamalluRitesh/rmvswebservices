import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight, Layers, Users, ShieldCheck } from 'lucide-react';
import type { Project } from '../../types';
import { GithubIcon } from '../common/Icons';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group rounded-3xl overflow-hidden liquid-glass border border-black/[0.08] shadow-md hover:shadow-xl transition-all duration-500 flex flex-col justify-end h-[400px] sm:h-[440px]"
    >
      {/* Background image with cinematic overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={imgSrc}
          alt={project.name}
          loading="lazy"
          decoding="async"
          onError={() => {
            setImgSrc(fallbackUrl);
          }}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isHovered ? 'scale-105 brightness-[0.7]' : 'scale-100 brightness-[0.85]'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      {/* Top badges */}
      <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between">
        <span className="px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-mono liquid-glass text-slate-800 bg-white/90 border border-black/10 shadow-sm">
          {project.category || 'Project'}
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {project.demo_url && (
            <a href={project.demo_url} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/90 text-slate-800 hover:text-black border border-black/10 shadow-sm transition-colors" onClick={(e) => e.stopPropagation()}>
              <ExternalLink size={13} />
            </a>
          )}
          {project.repo_url && (
            <a href={project.repo_url} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/90 text-slate-800 hover:text-black border border-black/10 shadow-sm transition-colors" onClick={(e) => e.stopPropagation()}>
              <GithubIcon size={13} />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8">
        <p className="text-white/70 text-[10px] tracking-widest uppercase font-mono mb-2">
          {project.client_name ? `Client · ${project.client_name}` : 'Featured Project'}
        </p>
        <Link to={`/projects/${project.slug}`}>
          <h3 className="font-instrument italic text-2xl sm:text-3xl text-white group-hover:text-white/90 transition-colors leading-tight mb-2 drop-shadow-sm">
            {project.name}
          </h3>
        </Link>
        <p className="text-sm text-white/80 line-clamp-2 leading-relaxed mb-4 max-w-xl">
          {project.short_description || project.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <Link to={`/projects/${project.slug}`} className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-white/80 transition-colors group/cta">
            Explore project <ArrowRight size={13} className="group-hover/cta:translate-x-0.5 transition-transform" />
          </Link>
          {leadUser && (
            <Link to={`/developers/${leadUser.username}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-black/10 shadow-sm hover:bg-white transition-colors">
              {leadUser.avatar_url ? (
                <img src={leadUser.avatar_url} alt={leadUser.full_name} className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[9px] flex items-center justify-center font-instrument italic">
                  {leadUser.full_name.charAt(0)}
                </div>
              )}
              <span className="text-[11px] text-slate-600 font-medium">By <span className="text-slate-900 font-semibold">{leadUser.full_name.split(' ')[0]}</span></span>
            </Link>
          )}
        </div>
      </div>

      {/* Spec bar (White glass) */}
      <div className="relative z-10 px-6 py-3.5 grid grid-cols-3 gap-2 bg-white/90 backdrop-blur-md border-t border-black/[0.08] text-[10px] text-slate-600 font-mono">
        <div className="flex items-center gap-1.5 truncate">
          <Layers size={11} className="text-slate-400 shrink-0" />
          <span className="truncate">{project.technologies?.[0]?.name ? `${project.technologies[0].name}+` : 'Full Stack'}</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 border-x border-black/[0.08]">
          <Users size={11} className="text-slate-400 shrink-0" />
          <span>{contributorCount} {contributorCount === 1 ? 'Developer' : 'Team'}</span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <ShieldCheck size={11} className="text-slate-400 shrink-0" />
          <span className="text-slate-900 font-semibold">Tier 1</span>
        </div>
      </div>
    </div>
  );
};
