import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../../components/common/Icons';
import { useSettings } from '../../context/SettingsContext';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();
  const companyName = settings?.company_name || 'RMVS Web Services';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <img
            src={settings?.logo_url || '/logo.png'}
            alt={companyName}
            className="h-8 w-auto object-contain"
          />
          <p className="text-blue-600 text-xs tracking-widest uppercase font-mono font-semibold">
            About {companyName}
          </p>
        </div>
        <h1 className="font-instrument italic text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] text-slate-900 mb-6 max-w-3xl">
          A technology company <em className="text-blue-600">powered by</em> verified builders.
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
          {companyName} was founded to eliminate the broken dynamics of traditional outsourcing and anonymous
          freelancing. We engineer real-world digital projects where every software solution is crafted to
          production perfection and publicly attributed to its creators.
        </p>
      </div>

      {/* Leadership & Organizational Structure */}
      <div className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-200">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-blue-600 text-xs tracking-widest uppercase font-mono font-semibold">Executive Leadership</p>
            <h2 className="font-instrument italic text-3xl text-slate-900 mt-1">Platform Governance</h2>
          </div>
          <Link
            to="/team"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
          >
            <span>View Engineering Team</span> <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* CEO Card */}
          <div className="rounded-3xl p-8 flex flex-col justify-between border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.05)] hover:border-blue-400 bg-white transition-all lag-free">
            <div>
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center font-instrument italic text-blue-600 text-2xl shrink-0 shadow-2xs">
                  R
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-instrument italic text-slate-900 text-2xl">Ritesh Lingamallu</h3>
                    <CheckCircle2 size={16} className="text-blue-600" />
                  </div>
                  <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase font-mono">Chief Executive Officer</p>
                  <p className="text-slate-500 text-xs mt-0.5 font-mono">Super Admin · Lead Systems Architect</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Super Admin and Lead Systems Engineer. Ritesh directs company roadmap,
                distributed backend systems, AI workflows, and platform standards. Oversees project verification,
                developer vetting, and production system delivery across enterprise accounts.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {['Python', 'FastAPI', 'React', 'TypeScript', 'System Design', 'AI/ML', 'PostgreSQL'].map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full text-xs text-slate-700 border border-slate-200 bg-slate-50 font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
              <Link to="/developers/riteshlingamallu8" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors group">
                Full Details <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <div className="flex gap-2">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"><GithubIcon size={14} /></a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"><LinkedinIcon size={14} /></a>
              </div>
            </div>
          </div>

          {/* Company Structure Pillar Card */}
          <div className="rounded-3xl p-8 border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.05)] bg-white space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-instrument italic text-2xl text-slate-900">Company Hierarchy</h3>
                <p className="text-blue-600 text-xs font-mono font-semibold">Streamlined Operational Structure</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              We operate under a transparent, high-accountability organizational model designed to ensure zero
              bureaucracy and direct technical execution:
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">CEO &amp; Platform Architecture</h4>
                  <p className="text-slate-500 text-xs mt-0.5">Single source of technical governance, administration, and team management.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">Core Verified Developers</h4>
                  <p className="text-slate-500 text-xs mt-0.5">Dedicated engineering specialists handling frontend, backend, and full-stack execution.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">Projects &amp; Client Engagements</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Direct project delivery with explicit creator attribution and client transparency.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/team"
                className="w-full py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Users size={14} /> Meet Our Developers
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-200">
        <p className="text-blue-600 text-xs tracking-widest uppercase font-mono mb-10 font-semibold">Core Values</p>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              initial: '✓',
              title: 'Verified Developer Integrity',
              desc: 'Every developer undergoes manual vetting by leadership. No ghost accounts, bot profiles, or unverified claims.',
            },
            {
              initial: '★',
              title: 'Permanent Creator Attribution',
              desc: 'Every project lists the actual developers who built it, their exact contributions, and verified source links.',
            },
            {
              initial: '⚡',
              title: 'Production Engineering Only',
              desc: 'We do not build toy prototypes. Every solution follows enterprise-grade deployment standards and strict security.',
            },
          ].map((val) => (
            <div key={val.title} className="rounded-2xl p-6 border border-slate-200/90 bg-white shadow-sm">
              <span className="text-2xl text-blue-600 mb-4 block font-instrument">{val.initial}</span>
              <h3 className="font-instrument italic text-xl text-slate-900 mb-2">{val.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
