import React, { useState } from 'react';
import { Play, Check, Copy, Terminal, Sparkles, RefreshCw } from 'lucide-react';

interface CodeSnippet {
  id: string;
  tabLabel: string;
  language: string;
  fileName: string;
  code: string;
  runtimeOutput: string;
  benchmark: string;
}

const SNIPPETS: CodeSnippet[] = [
  {
    id: 'web',
    tabLabel: 'React & TS',
    language: 'typescript',
    fileName: 'EnterprisePortal.tsx',
    code: `// RMVS Enterprise Web Core (React 18 + Vite)
import { useSquad, CloudEngine } from '@rmvs/core';

export const Portal = () => {
  const { squad, deployments } = useSquad();
  return (
    <GlassEngine edgeLatency="12ms" verified={true}>
      <SquadGrid engineers={squad.verified} />
      <ActiveProduction telemetry={deployments} />
    </GlassEngine>
  );
};`,
    runtimeOutput: `[BUILD] Transformed 2385 modules in 1.1s
[PROD] Deployed to Global CDN Edge (v2.4.0)
[STATUS] 99.98% Uptime SLA · Zero Latency Stutter`,
    benchmark: '12ms Edge Latency',
  },
  {
    id: 'api',
    tabLabel: 'FastAPI Microservice',
    language: 'python',
    fileName: 'orchestrator.py',
    code: `# RMVS High-Throughput Microservice (Python 3.12)
from fastapi import APIRouter, Depends
from app.core.database import AsyncSession, get_db

@router.post("/api/v1/cluster/deploy")
async def deploy_workload(spec: WorkloadSpec, db: AsyncSession = Depends(get_db)):
    cluster = await CloudEngine.scale(spec.nodes, db)
    return {"status": "ONLINE", "pool": "Neon PostgreSQL", "tps": 45000}`,
    runtimeOutput: `INFO: Uvicorn running on https://rmvs-backend.onrender.com
DATABASE: Connected to Neon PostgreSQL Cloud (Pool: 20/20)
METRICS: 45,000 req/sec · 0 unhandled exceptions`,
    benchmark: '45k Requests/Sec',
  },
  {
    id: 'mobile',
    tabLabel: 'Flutter Cross-Platform',
    language: 'dart',
    fileName: 'sync_engine.dart',
    code: `// RMVS Offline-First Mobile Synchronization (Dart 3)
class DeviceSyncService extends StateNotifier<SyncState> {
  Future<void> autoSyncDeviceState(DevicePayload payload) async {
    final response = await _client.streamBiDirectional(payload);
    state = SyncState.synced(latency: response.latency);
  }
}`,
    runtimeOutput: `[FLUTTER] Native compilation for iOS & Android
[STATE] Auto-synced across mobile, tablet, and web
[CACHE] 0ms Stale-While-Revalidate verified`,
    benchmark: 'Native 120 FPS',
  },
  {
    id: 'ai',
    tabLabel: 'AI & Automations',
    language: 'python',
    fileName: 'neural_agent.py',
    code: `# RMVS Autonomous Business Engine
from app.services.whatsapp import WhatsAppAutomationService

async def handle_customer_lifecycle(event: LifecycleEvent):
    response = await ai_engine.evaluate(event.context)
    await whatsapp.dispatch_verified_update(response.template)
    return {"dispatched": True, "delivery_rate": "99.4%"}`,
    runtimeOutput: `[AI] Evaluated neural intent in 28ms
[MESSAGING] Meta Cloud API WhatsApp webhook verified
[AUDIT] Complete creator attribution logged`,
    benchmark: '28ms AI Inference',
  },
];

interface InteractiveCodeStudioProps {
  onPlayShowcase?: () => void;
}

export const InteractiveCodeStudio: React.FC<InteractiveCodeStudioProps> = ({ onPlayShowcase }) => {
  const [activeSnippetId, setActiveSnippetId] = useState<string>('web');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const activeSnippet = SNIPPETS.find((s) => s.id === activeSnippetId) || SNIPPETS[0];

  const handleRunCode = () => {
    setIsRunning(true);
    setShowTerminal(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 700);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/20 shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)] overflow-hidden text-left relative group">
      
      {/* Ambient Cybernetic Corner Accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Window Chrome */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-white/[0.08] flex items-center justify-between gap-3">
        {/* macOS Glass Dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-[0_0_6px_#f43f5e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-[0_0_6px_#f59e0b]" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_#10b981]" />
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
          {SNIPPETS.map((snippet) => (
            <button
              key={snippet.id}
              onClick={() => {
                setActiveSnippetId(snippet.id);
                setShowTerminal(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all shrink-0 ${
                activeSnippetId === snippet.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {snippet.tabLabel}
            </button>
          ))}
        </div>

        {/* Copy snippet button */}
        <button
          onClick={handleCopyCode}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Copy Code"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
        </button>
      </div>

      {/* File Name & Benchmark Header */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-white/[0.05] flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400 flex items-center gap-1.5">
          <span className="text-cyan-400">λ</span>
          <span>{activeSnippet.fileName}</span>
        </span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[10px]">
          {activeSnippet.benchmark}
        </span>
      </div>

      {/* Code Editor Body */}
      <div className="p-4 sm:p-5 font-mono text-[12px] sm:text-[13px] leading-relaxed text-slate-300 overflow-x-auto bg-slate-950/95 max-h-[260px] scrollbar-thin">
        <pre className="text-left font-mono">
          <code>
            {activeSnippet.code.split('\n').map((line, idx) => (
              <div key={idx} className="table-row">
                <span className="table-cell pr-3 text-slate-600 select-none text-[11px] text-right w-6">
                  {idx + 1}
                </span>
                <span className="table-cell">
                  {line.startsWith('//') || line.startsWith('#') ? (
                    <span className="text-slate-500 italic">{line}</span>
                  ) : line.includes('import') || line.includes('from') || line.includes('export') || line.includes('class') || line.includes('async') || line.includes('def') ? (
                    <span className="text-cyan-400">{line}</span>
                  ) : line.includes('return') || line.includes('const') || line.includes('final') ? (
                    <span className="text-purple-400">{line}</span>
                  ) : line.includes('"') || line.includes("'") ? (
                    <span className="text-emerald-300">{line}</span>
                  ) : (
                    <span>{line}</span>
                  )}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>

      {/* Interactive Runtime Terminal Console (collapsible or toggled by Run) */}
      {showTerminal && (
        <div className="border-t border-cyan-500/30 bg-slate-900/95 p-3.5 text-left font-mono text-[11px] text-emerald-400 space-y-1 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-slate-400 text-[10px] pb-1 border-b border-white/5 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Terminal size={12} />
              <span>Live Runtime Output</span>
            </span>
            <span className="text-emerald-400">Exit Code: 0 (OK)</span>
          </div>
          {isRunning ? (
            <div className="flex items-center gap-2 py-2 text-cyan-300">
              <RefreshCw size={12} className="animate-spin text-cyan-400" />
              <span>Compiling code and provisioning cluster...</span>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap leading-normal pt-1 text-emerald-300/90">
              {activeSnippet.runtimeOutput}
            </pre>
          )}
        </div>
      )}

      {/* Interactive Actions & Metrics Footer */}
      <div className="px-4 py-3 bg-slate-900/90 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        {/* Run Code Button */}
        <button
          type="button"
          onClick={handleRunCode}
          disabled={isRunning}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-95 disabled:opacity-50"
        >
          {isRunning ? (
            <RefreshCw size={13} className="animate-spin text-slate-950" />
          ) : (
            <Play size={13} className="fill-slate-950" />
          )}
          <span>{isRunning ? 'Compiling...' : 'Run Architecture'}</span>
        </button>

        {/* Play Showcase / Launch Preview */}
        {onPlayShowcase && (
          <button
            type="button"
            onClick={onPlayShowcase}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/15 transition-all shadow-sm active:scale-95"
          >
            <Sparkles size={13} className="text-cyan-400" />
            <span>Launch Live Preview</span>
          </button>
        )}
      </div>
    </div>
  );
};
