import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu, Smartphone, Globe, Bot, ShieldCheck, Zap,
  Users, ArrowRight, CheckCircle2, Layers
} from 'lucide-react';

interface PlatformOption {
  id: string;
  label: string;
  icon: any;
  stack: string;
  defaultDays: number;
}

const PLATFORMS: PlatformOption[] = [
  { id: 'web', label: 'Web Platform', icon: Globe, stack: 'React · TypeScript · FastAPI', defaultDays: 14 },
  { id: 'mobile', label: 'Mobile App', icon: Smartphone, stack: 'Flutter · Dart · Firebase', defaultDays: 18 },
  { id: 'cloud', label: 'Enterprise Cloud', icon: Layers, stack: 'Microservices · Docker · PostgreSQL', defaultDays: 21 },
  { id: 'ai', label: 'AI & Automation', icon: Bot, stack: 'Autonomous Agents · WhatsApp Cloud API', defaultDays: 10 },
];

const TIERS = [
  { id: 'mvp', label: 'Rapid MVP', multiplier: 1, squadDesc: '1 Lead Architect + 1 Full-Stack Engineer' },
  { id: 'growth', label: 'Growth Scale', multiplier: 1.4, squadDesc: '1 Lead Architect + 2 Engineers + 1 QA' },
  { id: 'enterprise', label: 'Enterprise Core', multiplier: 2.0, squadDesc: 'Senior Squad (Lead + 3 Devs + DevOps)' },
];

const ADDONS = [
  { id: 'auth', label: 'Secure Auth & RBAC', days: 2 },
  { id: 'ws', label: 'Real-Time WebSockets', days: 3 },
  { id: 'whatsapp', label: 'WhatsApp Automation', days: 3 },
  { id: 'db', label: 'High-Throughput Neon DB Pool', days: 2 },
];

export const InteractiveProjectEstimator: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('web');
  const [selectedTier, setSelectedTier] = useState<string>('growth');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['auth', 'whatsapp']);

  const platform = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];
  const tier = TIERS.find((t) => t.id === selectedTier) || TIERS[1];

  const toggleAddon = (id: string) => {
    if (selectedAddons.includes(id)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== id));
    } else {
      setSelectedAddons([...selectedAddons, id]);
    }
  };

  const addonDays = selectedAddons.reduce((acc, curr) => {
    const item = ADDONS.find((a) => a.id === curr);
    return acc + (item?.days || 0);
  }, 0);

  const totalDays = Math.round((platform.defaultDays + addonDays) * tier.multiplier);
  const weeks = (totalDays / 7).toFixed(1);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.6)] p-6 sm:p-9 text-slate-100">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono uppercase tracking-widest mb-3">
          <Zap size={12} className="text-cyan-400" />
          <span>Interactive Architecture Calculator</span>
        </span>
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          Design Your Architecture & Engineering Scope
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm">
          Select your requirements below to instantly model recommended technologies, engineering timeline, and squad allocation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* Step 1: Platform */}
          <div>
            <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-2.5">
              1. Primary Platform
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {PLATFORMS.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPlatform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-white'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <Icon size={18} className={isSelected ? 'text-cyan-400' : 'text-slate-400'} />
                    <div>
                      <p className="text-xs font-semibold leading-none mb-1">{p.label}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">{p.stack}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Scale Tier */}
          <div>
            <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-2.5">
              2. Deployment Scale
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTier(t.id)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                    selectedTier === t.id
                      ? 'bg-emerald-500/15 border-emerald-400/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Add-on Capabilities */}
          <div>
            <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-2.5">
              3. Advanced Capabilities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ADDONS.map((addon) => {
                const checked = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`py-2 px-3 rounded-xl border text-[11px] font-mono flex items-center justify-between transition-all ${
                      checked
                        ? 'bg-purple-500/15 border-purple-400/60 text-purple-300'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    <span>{addon.label}</span>
                    {checked && <CheckCircle2 size={13} className="text-purple-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Estimate Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-800/90 to-slate-900/95 border border-white/15 rounded-3xl p-6 text-left space-y-5 shadow-2xl">
          
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Live Architecture Model
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          </div>

          {/* Delivery & Timeline */}
          <div>
            <p className="text-slate-400 text-xs font-mono uppercase">Estimated Delivery Timeline</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white tracking-tight">{totalDays}</span>
              <span className="text-slate-400 text-sm">Days (~{weeks} Weeks)</span>
            </div>
          </div>

          {/* Architecture Spec */}
          <div className="space-y-2 pt-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Cpu size={13} className="text-cyan-400" /> Core Tech
              </span>
              <span className="font-mono text-white font-semibold">{platform.stack}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Users size={13} className="text-emerald-400" /> Squad Scale
              </span>
              <span className="font-mono text-emerald-300 text-[11px] font-semibold truncate max-w-[170px]">
                {tier.squadDesc}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-purple-400" /> Attribution
              </span>
              <span className="font-mono text-white font-semibold">100% Direct & Transparent</span>
            </div>
          </div>

          {/* Proceed CTA */}
          <Link
            to={`/contact?platform=${selectedPlatform}&tier=${selectedTier}`}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(6,182,212,0.35)] active:scale-95"
          >
            <span>Lock In This Scope</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
