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
    <div className="rounded-3xl p-6 flex flex-col justify-between group bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-blue-400 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.12)] transition-all duration-300 h-full lag-free">
      <div>
        {/* Avatar + availability */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="relative">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-sm" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center font-instrument italic text-blue-600 text-2xl shadow-2xs">
                {user.full_name.charAt(0)}
              </div>
            )}
            {user.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-blue-200">
                <CheckCircle2 size={16} className="text-blue-600" />
              </div>
            )}
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {developer.availability?.split(' ')[0] || 'Available'}
            </span>
            {developer.years_experience > 0 && (
              <p className="text-[10px] font-mono text-slate-500 mt-1.5">{developer.years_experience}+ yrs exp</p>
            )}
          </div>
        </div>

        {/* Name & title */}
        <Link to={`/developers/${user.username}`}>
          <h3 className="font-bold text-slate-900 text-xl group-hover:text-blue-600 transition-colors leading-snug">
            {user.full_name}
          </h3>
        </Link>
        <p className="text-slate-500 text-xs mt-0.5 mb-2 font-mono">@{user.username}</p>
        <p className="text-blue-600 text-sm font-semibold mb-3">{developer.title || 'Senior Software Engineer'}</p>

        {developer.short_bio && (
          <p className="text-slate-600 text-xs line-clamp-2 mb-4 leading-relaxed">{developer.short_bio}</p>
        )}

        {developer.location && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4">
            <MapPin size={11} className="text-blue-600" />
            {developer.location}
          </div>
        )}

        {/* Skills */}
        {developer.skills && developer.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {developer.skills.slice(0, 4).map((skill) => (
              <span key={skill.id} className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
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
      <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
        <Link
          to={`/developers/${user.username}`}
          className="flex-1 py-2 px-3 rounded-full bg-slate-50 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
        >
          Full Profile <ArrowRight size={12} />
        </Link>
        {onContactClick ? (
          <button
            onClick={() => onContactClick(developer)}
            className="py-2 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare size={12} /> Inquire
          </button>
        ) : (
          <Link
            to={`/developers/${user.username}?contact=true`}
            className="py-2 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-all flex items-center gap-1.5"
          >
            <MessageSquare size={12} /> Inquire
          </Link>
        )}
      </div>
    </div>
  );
};
