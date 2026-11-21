import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, ExternalLink, ShieldCheck, Layers, Users, 
  ArrowRight, CheckCircle2, Globe, Sparkles, Activity, Calendar
} from 'lucide-react';
import type { Project } from '../../types';
import { GithubIcon } from '../common/Icons';

interface ProjectQuickViewModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectQuickViewModal: React.FC<ProjectQuickViewModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const isOngoing =
    project.status?.toLowerCase() === 'ongoing' ||
    project.status?.toLowerCase() === 'in progress' ||
    project.status?.toLowerCase() === 'in development';

  const leadAssoc = project.developer_associations?.find((d) => d.is_lead) || project.developer_associations?.[0];
  const leadDev = leadAssoc?.developer;
  const leadUser = leadDev?.user;
  const fallbackUrl = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80';
  const displayImage = project.image_url && !project.image_url.includes('1drv.ms') ? project.image_url : fallbackUrl;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto lag-free"
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-transform hover:scale-105 border border-slate-200 shadow-sm cursor-pointer"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {/* Media Banner */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-100">
          <img
            src={displayImage}
            alt={project.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-5 left-5 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-white/95 text-blue-700 font-bold backdrop-blur-md shadow-xs border border-blue-200">
              {project.category || 'Web Application'}
            </span>
            {isOngoing ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider bg-amber-500 text-white font-semibold backdrop-blur-md shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Active Engineering Sprint
              </span>
            ) : project.demo_url ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider bg-emerald-600 text-white font-medium backdrop-blur-md shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live Production
              </span>
            ) : null}
          </div>

          <div className="absolute bottom-5 left-5 right-5 text-white">
            <p className="text-cyan-300 text-xs font-mono uppercase tracking-widest mb-1 font-semibold">
              {project.client_name ? `Client · ${project.client_name}` : 'RMVS Engineered Platform'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">
              {project.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Ongoing Sprint Telemetry */}
          {isOngoing && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-900 font-bold flex items-center gap-1.5">
                  <Activity size={14} className="text-amber-600" />
                  Sprint Stage: {project.current_stage || 'In Active Development'}
                </span>
                <span className="text-amber-950 font-extrabold">{project.progress_percentage ?? 60}% Completed</span>
              </div>
              <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, project.progress_percentage ?? 60))}%` }}
                />
              </div>
              {project.completion_date && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-mono">
                  <Calendar size={12} className="text-amber-600" />
                  <span>Target Launch / Release Window: <strong className="text-amber-950 font-bold">{project.completion_date}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-blue-600 font-bold mb-2">Project Overview</h4>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {project.description || project.short_description || 'High-performance digital engineering solution developed with enterprise architecture standards.'}
            </p>
          </div>

          {/* Technical Specs & Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            {/* Lead Architect */}
            {leadUser && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {leadUser.avatar_url ? (
                    <img src={leadUser.avatar_url} alt={leadUser.full_name} className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/20" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-instrument italic text-lg">
                      {leadUser.full_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-900">{leadUser.full_name}</span>
                      {leadUser.is_verified && <CheckCircle2 size={13} className="text-blue-600" />}
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 uppercase">{leadAssoc?.role_in_project || 'Lead Developer'}</p>
                  </div>
                </div>
                <Link
                  to={`/developers/${leadUser.username}`}
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  Profile
                </Link>
              </div>
            )}

            {/* Architecture Guarantees */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-blue-600" /> Attribution</span>
                <span className="font-semibold text-slate-900 font-mono">100% Verified</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5"><Layers size={14} className="text-blue-600" /> Status</span>
                <span className="font-semibold text-slate-900 font-mono">{isOngoing ? 'Active Sprint' : 'Production Grade'}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5"><Users size={14} className="text-blue-600" /> Squad</span>
                <span className="font-semibold text-slate-900 font-mono">{project.developer_associations?.length || 1} Engineer(s)</span>
              </div>
            </div>
          </div>

          {/* Technology Badges */}
          {project.technologies && project.technologies.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-blue-600 font-bold mb-2">Technologies &amp; Architecture</h4>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((t) => (
                  <span
                    key={t.id || t.name}
                    className="px-3 py-1 rounded-full text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={`/projects/${project.slug}`}
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-700 hover:text-blue-600 border border-slate-300 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>{isOngoing ? 'Full Sprint Roadmap & Specs' : 'View Complete Specifications'}</span>
            <ArrowRight size={13} />
          </Link>

          <div className="flex items-center gap-2">
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors shadow-2xs"
                title="View Source Repository"
              >
                <GithubIcon size={15} />
              </a>
            )}
            {project.demo_url ? (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 group cursor-pointer"
              >
                <Globe size={14} />
                <span>Launch Live Website</span>
                <ExternalLink size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            ) : (
              <Link
                to="/contact"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2"
              >
                <Sparkles size={14} />
                <span>Inquire About Similar Build</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
