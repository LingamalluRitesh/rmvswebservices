import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, MapPin, ArrowRight, MessageSquare } from 'lucide-react';
import type { DeveloperProfile } from '../../types';

interface DeveloperCardProps {
  developer: DeveloperProfile;
  onContactClick?: (dev: DeveloperProfile) => void;
}

export const DeveloperCard: React.FC<DeveloperCardProps> = ({ developer, onContactClick }) => {
  const user = developer.user;

  return (
    <div className="rounded-3xl p-6 flex flex-col justify-between group bg-[#0a1228]/85 hover:bg-[#0e1938] border border-blue-500/20 hover:border-cyan-400/40 shadow-lg hover:shadow-[0_10px_30px_rgba(37,99,235,0.25)] transition-all duration-300 h-full">
      <div>
        {/* Avatar + availability */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="relative">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/30 shadow-sm" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center font-instrument italic text-cyan-300 text-2xl shadow-inner">
                {user.full_name.charAt(0)}
              </div>
            )}
            {user.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-[#060b19] rounded-full p-0.5 shadow-sm border border-blue-500/30">
                <CheckCircle2 size={16} className="text-cyan-400" />
              </div>
            )}
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-blue-950/60 text-cyan-300 border border-blue-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {developer.availability?.split(' ')[0] || 'Available'}
            </span>
            {developer.years_experience > 0 && (
              <p className="text-[10px] font-mono text-slate-400 mt-1.5">{developer.years_experience}+ yrs</p>
            )}
          </div>
        </div>

        {/* Name & title */}
        <Link to={`/developers/${user.username}`}>
          <h3 className="font-instrument italic text-white text-xl group-hover:text-cyan-300 transition-colors leading-snug">
            {user.full_name}
          </h3>
        </Link>
        <p className="text-slate-400 text-xs mt-0.5 mb-2 font-mono">@{user.username}</p>
        <p className="text-cyan-400 text-sm font-medium mb-3">{developer.title || 'Senior Software Engineer'}</p>

        {developer.short_bio && (
          <p className="text-slate-300 text-xs line-clamp-2 mb-4 leading-relaxed">{developer.short_bio}</p>
        )}

        {developer.location && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-4">
            <MapPin size={11} className="text-cyan-400" />
            {developer.location}
          </div>
        )}

        {/* Skills */}
        {developer.skills && developer.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {developer.skills.slice(0, 4).map((skill) => (
              <span key={skill.id} className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#070e22] text-cyan-300 border border-blue-500/20">
                {skill.name}
              </span>
            ))}
            {developer.skills.length > 4 && (
              <span className="px-2 py-0.5 text-[10px] font-mono text-slate-400">+{developer.skills.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-blue-500/15 flex items-center gap-2">
        <Link
          to={`/developers/${user.username}`}
          className="flex-1 py-2 px-3 rounded-full bg-[#070e22] text-xs font-semibold text-cyan-300 hover:text-white hover:bg-blue-600/20 border border-blue-500/25 flex items-center justify-center gap-1.5 transition-colors"
        >
          Full Details <ArrowRight size={12} />
        </Link>
        {onContactClick ? (
          <button
            onClick={() => onContactClick(developer)}
            className="py-2 px-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-medium hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <MessageSquare size={12} /> Inquire
          </button>
        ) : (
          <Link
            to={`/developers/${user.username}?contact=true`}
            className="py-2 px-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-medium hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <MessageSquare size={12} /> Inquire
          </Link>
        )}
      </div>
    </div>
  );
};
