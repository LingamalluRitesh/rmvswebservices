import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const ServicesPage: React.FC = () => {
  const { settings } = useSettings();
  const companyName = settings?.company_name || 'RMVS Web Services';
  const logoUrl = settings?.logo_url || '/logo.png';
  const services = [
    {
      num: '01',
      title: 'AI & Machine Learning Solutions',
      tagline: 'Autonomous reasoning, predictive models, and agent workflows',
      deliverables: [
        'Fine-tuned LLMs & Private Enterprise Agent Frameworks',
        'Retrieval-Augmented Generation (RAG) over internal databases',
        'Real-time Computer Vision & Edge Video Analytics',
        'Predictive Maintenance & Degradation Modeling',
      ],
    },
    {
      num: '02',
      title: 'Full-Stack Web Projects',
      tagline: 'Lightning-fast, highly concurrent web systems',
      deliverables: [
        'FastAPI & Python high-throughput microservices',
        'Modern React & TypeScript responsive single-page applications',
        'Real-time WebSocket streaming applications',
        'PostgreSQL schema optimization & asynchronous ORM layers',
      ],
    },
    {
      num: '03',
      title: 'Mobile App Engineering',
      tagline: 'Native performance on iOS & Android platforms',
      deliverables: [
        'Cross-platform Flutter & React Native applications',
        'Offline-first synchronization with SQLite and local caching',
        'Biometric authentication & secure cryptographic key stores',
        'Push notifications & background telemetry sync',
      ],
    },
    {
      num: '04',
      title: 'Cloud Infrastructure & DevOps',
      tagline: 'Resilient multi-region cloud deployments',
      deliverables: [
        'Docker containerization and Kubernetes cluster management',
        'Automated GitHub Actions CI/CD pipelines',
        'Infrastructure-as-Code (Terraform / CloudFormation)',
        'Prometheus & Grafana centralized observability',
      ],
    },
    {
      num: '05',
      title: 'Enterprise SaaS Platforms',
      tagline: 'Scalable multi-tenant products built for enterprise scale',
      deliverables: [
        'Multi-tenant database isolation & tenant routing',
        'Role-Based Access Control (RBAC) & granular permissions',
        'Automated subscription lifecycle & audit logging',
        'Customer self-service admin portals',
      ],
    },
    {
      num: '06',
      title: 'CRM & Workflow Automation',
      tagline: 'Connecting distributed business pipelines',
      deliverables: [
        'End-to-end client inquiry & sales pipeline systems',
        'Automated email, SMS, and WhatsApp notification dispatch',
        'Third-party ERP and payment gateway integrations',
        'Comprehensive audit trails & compliance monitoring',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#060b19] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <img src={logoUrl} alt={companyName} className="h-8 w-auto object-contain" />
          <p className="text-cyan-400 text-xs tracking-widest uppercase font-mono">{companyName} Digital Solutions</p>
        </div>
        <h1 className="font-sans font-extrabold text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] text-white mb-6 max-w-3xl">
          Services engineered <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">for scale.</span>
        </h1>
        <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
          From early-stage MVPs to complex distributed enterprise platforms, {companyName} verified developer network
          delivers clean, maintainable software with production-grade engineering excellence.
        </p>
      </div>

      {/* Service grid */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((svc) => (
            <div
              key={svc.num}
              className="rounded-3xl p-8 flex flex-col justify-between group bg-[#0a1228]/85 border border-blue-500/25 hover:border-cyan-400/40 shadow-xl hover:shadow-[0_10px_30px_rgba(37,99,235,0.25)] transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-6">
                  <span className="font-mono text-cyan-400/60 text-2xl font-bold tracking-wider">{svc.num}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-blue-950/80 border border-blue-500/30 text-cyan-300">
                    Production Tier
                  </span>
                </div>
                <h2 className="font-sans font-bold text-white text-2xl mb-2">{svc.title}</h2>
                <p className="text-slate-400 text-sm mb-6">{svc.tagline}</p>
                <ul className="space-y-2.5">
                  {svc.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-blue-950/80 border border-blue-500/40 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400 shadow-sm">
                        <Check size={10} />
                      </span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-6 border-t border-blue-500/15 flex items-center justify-between mt-6">
                <Link
                  to="/developers"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-white transition-colors"
                >
                  Find engineers <ArrowRight size={11} />
                </Link>
                <Link
                  to="/contact"
                  className="px-4 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600 text-xs text-cyan-300 hover:text-white border border-blue-500/30 transition-all shadow-sm"
                >
                  Inquire now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-3xl p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-blue-500/30 shadow-2xl bg-[#0a1228]/90">
          <div>
            <h2 className="font-sans font-bold text-white text-3xl mb-2">
              Ready to build <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">your project?</span>
            </h2>
            <p className="text-slate-300 text-sm">Talk to our technical leadership directly.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              to="/contact"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all shadow-sm"
            >
              Contact us
            </Link>
            <Link
              to="/projects"
              className="px-6 py-3 rounded-full bg-[#070e22] text-slate-200 hover:text-white border border-blue-500/30 hover:border-cyan-400/50 text-sm transition-colors shadow-sm"
            >
              See projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
