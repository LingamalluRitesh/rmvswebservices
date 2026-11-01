import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, ExternalLink, ShieldCheck, Layers, Users, 
  ArrowRight, CheckCircle2, Globe, Sparkles 
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

  const leadAssoc = project.developer_associations?.find((d) => d.is_lead) || project.developer_associations?.[0];
  const leadDev = leadAssoc?.developer;
  const leadUser = leadDev?.user;
  const fallbackUrl = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80';
  const displayImage = project.image_url && !project.image_url.includes('1drv.ms') ? project.image_url : fallbackUrl;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#060b19]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        className="relative w-full max-w-3xl bg-[#091126] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-blue-500/30 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-blue-950/80 hover:bg-blue-900 text-cyan-300 flex items-center justify-center transition-transform hover:scale-105 border border-blue-500/30 shadow-md cursor-pointer"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {/* Media Banner */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-900">
          <img
            src={displayImage}
            alt={project.name}
            className="w-full h-full object-cover brightness-[0.75]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#091126] via-[#091126]/40 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-5 left-5 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-[#070e22]/90 text-cyan-300 font-semibold backdrop-blur-md shadow-sm border border-blue-500/30">
              {project.category || 'Web Application'}
            </span>
            {project.demo_url && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider bg-emerald-500/90 text-white font-medium backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live Production
              </span>
            )}
          </div>

          <div className="absolute bottom-5 left-5 right-5 text-white">
            <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-1">
              {project.client_name ? `Client · ${project.client_name}` : 'RMVS Engineered Platform'}
            </p>
            <h2 className="font-instrument italic text-3xl sm:text-4xl text-white drop-shadow-sm">
              {project.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Description */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-2">Project Overview</h4>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {project.description || project.short_description || 'High-performance digital engineering solution developed with enterprise architecture standards.'}
            </p>
          </div>

          {/* Technical Specs & Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-blue-500/15">
            {/* Lead Architect */}
            {leadUser && (
              <div className="p-4 rounded-2xl bg-[#070e22] border border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {leadUser.avatar_url ? (
                    <img src={leadUser.avatar_url} alt={leadUser.full_name} className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/30" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blue-950 text-cyan-300 flex items-center justify-center font-instrument italic text-lg">
                      {leadUser.full_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white">{leadUser.full_name}</span>
                      {leadUser.is_verified && <CheckCircle2 size={13} className="text-cyan-400" />}
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 uppercase">{leadAssoc?.role_in_project || 'Lead Developer'}</p>
                  </div>
                </div>
                <Link
                  to={`/developers/${leadUser.username}`}
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-cyan-300 hover:text-white bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 transition-colors"
                >
                  Profile
                </Link>
              </div>
            )}

            {/* Architecture Guarantees */}
            <div className="p-4 rounded-2xl bg-[#070e22] border border-blue-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-cyan-400" /> Attribution</span>
                <span className="font-semibold text-white font-mono">100% Verified</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5"><Layers size={14} className="text-cyan-400" /> Tier</span>
                <span className="font-semibold text-white font-mono">Production Grade</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5"><Users size={14} className="text-cyan-400" /> Squad</span>
                <span className="font-semibold text-white font-mono">{project.developer_associations?.length || 1} Engineer(s)</span>
              </div>
            </div>
          </div>

          {/* Technology Badges */}
          {project.technologies && project.technologies.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-2">Technologies & Architecture</h4>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((t) => (
                  <span
                    key={t.id || t.name}
                    className="px-3 py-1 rounded-full text-xs font-mono bg-blue-950/60 text-cyan-300 border border-blue-500/25"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-6 bg-[#060b19] border-t border-blue-500/20 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={`/projects/${project.slug}`}
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-cyan-300 hover:text-white border border-blue-500/30 bg-[#0a1228] hover:bg-blue-900/30 transition-colors flex items-center gap-1.5"
          >
            <span>View Complete Specifications</span>
            <ArrowRight size={13} />
          </Link>

          <div className="flex items-center gap-2">
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-[#0a1228] hover:bg-blue-900/30 text-cyan-300 hover:text-white border border-blue-500/30 transition-colors shadow-sm"
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
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 group cursor-pointer"
              >
                <Globe size={14} />
                <span>Launch Live Application</span>
                <ExternalLink size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            ) : (
              <Link
                to="/contact"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2"
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
