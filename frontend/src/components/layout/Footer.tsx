import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  const companyName = settings?.company_name || 'RMVS Web Services';
  const logoUrl = settings?.logo_url || '/logo.png';

  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-24 py-16 px-4 sm:px-6 text-slate-600">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <a href="https://rmvswebservices.onrender.com/" className="inline-block group mb-1">
              <img
                src={logoUrl}
                alt={companyName}
                className="h-10 sm:h-11 w-auto max-w-[210px] object-contain transition-transform group-hover:scale-[1.02]"
              />
            </a>
            <div className="text-[11px] text-slate-500">
              <span>Developer: </span>
              <a
                href="https://rmvswebservices.onrender.com/developers/riteshlingamallu8"
                className="font-medium text-blue-600 hover:text-blue-700 underline transition-colors"
              >
                Ritesh Lingamallu
              </a>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              {settings?.description || 'Verified software engineering and enterprise digital delivery platform.'}
            </p>
            {settings?.address && (
              <p className="text-slate-500 text-[11px] flex items-center gap-1.5">
                <MapPin size={12} className="shrink-0 text-blue-600" />
                <span>{settings.address}</span>
              </p>
            )}
            {settings?.email && (
              <p className="text-slate-500 text-[11px] flex items-center gap-1.5">
                <Mail size={12} className="shrink-0 text-blue-600" />
                <a href={`mailto:${settings.email}`} className="hover:text-blue-700 transition-colors">{settings.email}</a>
              </p>
            )}
          </div>

          {/* Platform Columns */}
          <div>
            <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-4 font-mono">Platform</p>
            <ul className="space-y-2.5">
              {[
                { label: 'Featured Projects', to: '/projects' },
                { label: 'Verified Developers', to: '/developers' },
                { label: 'Engineering Team', to: '/team' },
                { label: 'Developer Community', to: '/community' },
                { label: 'Services & Solutions', to: '/services' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-slate-600 hover:text-blue-600 transition-colors text-xs font-medium">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Offerings */}
          <div>
            <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-4 font-mono">Core Solutions</p>
            <ul className="space-y-2.5">
              {[
                { label: 'Websites & Web Apps', to: '/services' },
                { label: 'Mobile Applications', to: '/services' },
                { label: 'Enterprise Software', to: '/services' },
                { label: 'Digital & AI Solutions', to: '/services' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-slate-600 hover:text-blue-600 transition-colors text-xs font-medium">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Access */}
          <div>
            <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-4 font-mono">Company &amp; Access</p>
            <ul className="space-y-2.5">
              {[
                { label: 'About Leadership', to: '/about' },
                { label: 'Engineering Team', to: '/team' },
                { label: 'Direct Consultation', to: '/contact' },
                { label: 'Developer & Client Login', to: '/login' },
                { label: 'Register New Account', to: '/register' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-slate-600 hover:text-blue-600 transition-colors text-xs font-medium">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors group font-semibold"
              >
                Join Platform <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="text-center sm:text-left space-y-1">
            <p>
              © {year}{' '}
              <a
                href="https://rmvswebservices.onrender.com/"
                className="font-semibold text-slate-800 hover:text-blue-600 transition-colors"
              >
                RMVS WebServices
              </a>
              . All rights reserved.
            </p>
            <p className="text-[11px] text-slate-400">
              Verified Software Platform • Enterprise Solutions
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end text-center sm:text-right space-y-1">
            <div>
              <a
                href="https://rmvswebservices.onrender.com/"
                className="font-bold text-slate-900 hover:text-blue-600 text-sm tracking-tight transition-colors inline-block"
              >
                RMVS WebServices
              </a>
            </div>
            <div className="text-xs text-slate-500">
              <span>Developer Name: </span>
              <a
                href="https://rmvswebservices.onrender.com/developers/riteshlingamallu8"
                className="font-semibold text-blue-600 hover:text-blue-700 underline transition-colors"
              >
                Ritesh Lingamallu
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
