import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight, Layers, Users, ShieldCheck, Eye, Activity, Calendar } from 'lucide-react';
import type { Project } from '../../types';
import { GithubIcon } from '../common/Icons';

interface ProjectCardProps {
  project: Project;
  onQuickView?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);

  // High-resolution real-life engineering fallback
  const fallbackUrl = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80';
  const [imgSrc, setImgSrc] = useState(() => {
    if (project.image_url && !project.image_url.includes('1drv.ms')) {
      return project.image_url;
    }
    return fallbackUrl;
  });

  const isOngoing =
    project.status?.toLowerCase() === 'ongoing' ||
    project.status?.toLowerCase() === 'in progress' ||
    project.status?.toLowerCase() === 'in development';

  const leadAssoc = project.developer_associations?.find((d) => d.is_lead) || project.developer_associations?.[0];
  const leadDev = leadAssoc?.developer;
  const leadUser = leadDev?.user;
  const contributorCount = project.developer_associations?.length || 1;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_35px_rgba(37,99,235,0.12)] hover:border-blue-400 transition-all duration-300 flex flex-col justify-between lag-free"
    >
      {/* Real-Life Imagery Showcase Container */}
      <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-slate-100">
        <img
          src={imgSrc}
          alt={`${project.name} - ${project.client_name || 'RMVS Project'}`}
          loading="lazy"
          decoding="async"
          onError={() => setImgSrc(fallbackUrl)}
          className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-mono bg-white/95 text-blue-700 font-bold border border-blue-200/80 shadow-xs backdrop-blur-md">
              {project.category || 'Platform'}
            </span>
            {isOngoing ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-amber-500 text-white font-semibold shadow-xs backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Ongoing Sprint
              </span>
            ) : project.demo_url ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-emerald-600 text-white font-medium shadow-xs backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live
              </span>
            ) : null}
          </div>

          {/* Action Pills */}
          <div className="flex items-center gap-1.5">
            {onQuickView && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView(project);
                }}
                className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/95 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 shadow-xs transition-all flex items-center gap-1.5 text-xs font-medium backdrop-blur-md hover:scale-105"
                title="Quick Preview"
              >
                <Eye size={13} />
                <span className="hidden md:inline text-[11px]">Preview</span>
              </button>
            )}

            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-white/95 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 shadow-xs transition-all backdrop-blur-md hover:scale-105"
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
                className="p-2 rounded-full bg-white/95 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 shadow-xs transition-all backdrop-blur-md hover:scale-105"
                title="View Repository"
              >
                <GithubIcon size={13} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-blue-600 text-[11px] tracking-widest uppercase font-mono font-semibold mb-1">
            {project.client_name ? `Client · ${project.client_name}` : 'Engineered Platform'}
          </p>

          <Link to={`/projects/${project.slug}`}>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-2 flex items-center gap-2">
              <span>{project.name}</span>
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {project.short_description || project.description}
          </p>

          {/* Ongoing Development Sprint Progress Telemetry */}
          {isOngoing && (
            <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                <span className="text-amber-900 font-semibold flex items-center gap-1.5 truncate">
                  <Activity size={12} className="text-amber-600 shrink-0" />
                  <span className="truncate">{project.current_stage || 'In Active Development'}</span>
                </span>
                <span className="text-amber-950 font-bold font-mono shrink-0 ml-2">
                  {project.progress_percentage ?? 60}%
                </span>
              </div>
              <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, project.progress_percentage ?? 60))}%` }}
                />
              </div>
              {project.completion_date && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-800 font-mono">
                  <Calendar size={11} className="text-amber-600 shrink-0" />
                  <span>Target Launch: <strong className="text-amber-950 font-semibold">{project.completion_date}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Technology Pills */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {project.technologies.slice(0, 3).map((tech) => (
                <span
                  key={tech.id || tech.name}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {tech.name}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="text-[10px] font-mono text-slate-400">+{project.technologies.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
          <Link
            to={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors group/cta"
          >
            <span>{isOngoing ? 'Track progress & specs' : 'Explore details'}</span>
            <ArrowRight size={13} className="group-hover/cta:translate-x-1 transition-transform" />
          </Link>

          {leadUser && (
            <Link
              to={`/developers/${leadUser.username}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-xs transition-all hover:scale-105"
            >
              {leadUser.avatar_url ? (
                <img src={leadUser.avatar_url} alt={leadUser.full_name} className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[9px] flex items-center justify-center font-instrument italic">
                  {leadUser.full_name.charAt(0)}
                </div>
              )}
              <span className="text-[11px] text-slate-600 font-medium">
                By <span className="text-slate-900 font-semibold">{leadUser.full_name.split(' ')[0]}</span>
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Spec Strip */}
      <div className="px-6 py-3 grid grid-cols-3 gap-2 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-600 font-mono">
        <div className="flex items-center gap-1.5 truncate">
          <Layers size={11} className="text-blue-600 shrink-0" />
          <span className="truncate">{project.category || 'Web Application'}</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 border-x border-slate-200">
          <Users size={11} className="text-blue-600 shrink-0" />
          <span>{contributorCount} {contributorCount === 1 ? 'Developer' : 'Squad'}</span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <ShieldCheck size={11} className="text-blue-600 shrink-0" />
          <span className="text-slate-900 font-semibold">{isOngoing ? 'Active Sprint' : 'Verified'}</span>
        </div>
      </div>
    </div>
  );
};
