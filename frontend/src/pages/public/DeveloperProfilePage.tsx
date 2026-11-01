import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2, MapPin, Briefcase, Globe,
  MessageSquare, ArrowLeft,
  Code, Eye, Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { DeveloperProfile, Project } from '../../types';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ContactDeveloperModal } from '../../components/inquiries/ContactDeveloperModal';
import { GithubIcon, LinkedinIcon } from '../../components/common/Icons';

export const DeveloperProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [developer, setDeveloper] = useState<DeveloperProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    if (username) {
      loadProfile(username);
    }
  }, [username]);

  useEffect(() => {
    if (searchParams.get('contact') === 'true') {
      setContactModalOpen(true);
    }
  }, [searchParams]);

  const loadProfile = async (u: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/developers/${u}`);
      setDeveloper(res.data.profile);
      setProjects(res.data.projects);
    } catch (e: any) {
      console.error('Error loading developer', e);
      setError('Developer not found or profile is private.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!developer) return;

    try {
      const res = await api.post(`/conversations/start/${developer.user.id}`);
      navigate(`/messages?conversationId=${res.data.id}`);
    } catch (e) {
      console.error('Error starting conversation', e);
    }
  };

  /* Loading skeleton */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060b19] text-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-[#0a1228]/80 rounded-3xl h-72 animate-pulse mb-8 border border-blue-500/20" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#0a1228]/80 rounded-2xl h-56 animate-pulse border border-blue-500/20" />
            <div className="lg:col-span-2 bg-[#0a1228]/80 rounded-2xl h-56 animate-pulse border border-blue-500/20" />
          </div>
        </div>
      </div>
    );
  }

  /* Error state */
  if (error || !developer) {
    return (
      <div className="min-h-screen bg-[#060b19] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-blue-950/80 border border-blue-500/30 flex items-center justify-center mx-auto mb-5 text-cyan-400 text-2xl font-bold shadow-lg">
            !
          </div>
          <h2 className="font-sans font-bold text-2xl text-white mb-2">
            Developer Profile Unavailable
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            {error || 'Could not find this developer.'}
          </p>
          <Link
            to="/developers"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>Back to Developers</span>
          </Link>
        </div>
      </div>
    );
  }

  const user = developer.user;

  return (
    <div className="min-h-screen bg-[#060b19] text-slate-100 selection:bg-blue-600 selection:text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <Link
            to="/developers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Developer Directory</span>
          </Link>
        </motion.div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl p-8 mb-8 overflow-hidden relative border border-blue-500/25 shadow-2xl bg-[#0a1228]/85"
        >
          {/* Subtle ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">

            {/* Avatar + Name block */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-2 ring-blue-500/40 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 border border-blue-500/30 flex items-center justify-center text-white text-3xl font-extrabold shadow-sm">
                    {user.full_name.charAt(0)}
                  </div>
                )}
                {user.is_verified && (
                  <div
                    className="absolute -bottom-1 -right-1 bg-[#060b19] rounded-full p-1 shadow-md border border-blue-500/40"
                    title="Verified Developer"
                  >
                    <CheckCircle2 size={20} className="text-cyan-400" />
                  </div>
                )}
              </div>

              {/* Name / title / meta */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-white">
                    {user.full_name}
                  </h1>
                  {user.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-cyan-300 border border-blue-500/40 bg-blue-950/80">
                      <CheckCircle2 size={11} className="text-cyan-400" />
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-xs text-cyan-400/80 font-mono tracking-widest uppercase mb-2">
                  @{user.username}
                </p>

                <p className="text-base font-medium text-slate-300 mb-3">
                  {developer.title || 'Senior Software Engineer'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  {developer.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={13} className="text-cyan-400" />
                      <span>{developer.location}</span>
                    </div>
                  )}
                  {developer.years_experience > 0 && (
                    <div className="flex items-center gap-1">
                      <Briefcase size={13} className="text-cyan-400" />
                      <span>{developer.years_experience} Years Experience</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Eye size={13} className="text-cyan-400" />
                    <span>{developer.views_count} Profile Views</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setContactModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full px-6 py-2.5 font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all shadow-sm"
              >
                <Send size={14} />
                <span>Contact Developer</span>
              </button>

              {currentUser && currentUser.id !== user.id && (
                <button
                  onClick={handleStartChat}
                  className="bg-[#070e22] text-slate-200 hover:text-white rounded-full px-5 py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#0e1938] border border-blue-500/30 transition-colors shadow-sm"
                >
                  <MessageSquare size={14} />
                  <span>Message</span>
                </button>
              )}
            </div>
          </div>

          {/* Divider row: availability + social links */}
          <div className="mt-8 pt-6 border-t border-blue-500/15 flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Availability */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 uppercase font-mono tracking-widest text-[11px]">Status</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-cyan-300 font-medium border border-blue-500/30 bg-blue-950/60 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {developer.availability}
              </span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2">
              {developer.github_url && (
                <a
                  href={developer.github_url}
                  target="_blank"
                  rel="noreferrer"
                  title="GitHub Profile"
                  className="rounded-full p-2.5 text-slate-300 hover:text-white hover:border-cyan-400 bg-[#070e22] border border-blue-500/30 transition-colors flex items-center gap-1.5 px-3 shadow-sm"
                >
                  <GithubIcon size={15} />
                  <span>GitHub</span>
                </a>
              )}
              {developer.linkedin_url && (
                <a
                  href={developer.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn Profile"
                  className="rounded-full p-2.5 text-slate-300 hover:text-white hover:border-cyan-400 bg-[#070e22] border border-blue-500/30 transition-colors flex items-center gap-1.5 px-3 shadow-sm"
                >
                  <LinkedinIcon size={15} />
                  <span>LinkedIn</span>
                </a>
              )}
              {developer.portfolio_url && (
                <a
                  href={developer.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  title="Personal Website"
                  className="rounded-full p-2.5 text-slate-300 hover:text-white hover:border-cyan-400 bg-[#070e22] border border-blue-500/30 transition-colors flex items-center gap-1.5 px-3 shadow-sm"
                >
                  <Globe size={15} />
                  <span>Website / Work Details</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column: About + Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="space-y-6"
          >
            {/* About card */}
            <div className="rounded-2xl p-6 border border-blue-500/25 shadow-xl bg-[#0a1228]/85">
              <h3 className="font-sans font-bold text-xl text-white mb-3">
                About {user.full_name}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {developer.bio || developer.short_bio || 'No biography provided.'}
              </p>
            </div>

            {/* Skills card */}
            <div className="rounded-2xl p-6 border border-blue-500/25 shadow-xl bg-[#0a1228]/85">
              <h3 className="font-sans font-bold text-xl text-white mb-4">
                Core Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {developer.skills && developer.skills.length > 0 ? (
                  developer.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="text-xs text-cyan-300 rounded-full px-3 py-1 border border-blue-500/25 bg-[#070e22] font-mono"
                    >
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-xs">No skills listed yet.</span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right column: Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Section header */}
            <div className="flex items-center gap-3">
              <h2 className="font-sans font-bold text-2xl text-white">
                Associated Projects
              </h2>
              <span className="text-xs text-cyan-300 rounded-full px-2.5 py-0.5 border border-blue-500/30 bg-blue-950/80 font-mono">
                {projects.length}
              </span>
            </div>
            <p className="text-slate-400 text-xs tracking-wide -mt-4">
              Software personally designed, engineered, and delivered by {user.full_name}.
            </p>

            {projects.length === 0 ? (
              <div className="rounded-2xl p-12 text-center border border-blue-500/25 shadow-xl bg-[#0a1228]/85">
                <Code size={36} className="mx-auto text-cyan-400 mb-3" />
                <p className="text-sm font-semibold text-white">
                  No public projects published yet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  New projects created by this developer will appear here with verified attribution.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {projects.map((proj) => (
                  <ProjectCard key={proj.id} project={proj} />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Contact Modal */}
        {contactModalOpen && (
          <ContactDeveloperModal
            developer={developer}
            isOpen={contactModalOpen}
            onClose={() => setContactModalOpen(false)}
          />
        )}

      </div>
    </div>
  );
};
