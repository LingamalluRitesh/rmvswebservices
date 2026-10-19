import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const WhatsAppFloatingButton: React.FC = () => {
  const { settings } = useSettings();
  const [showTooltip, setShowTooltip] = useState(false);

  const phone = settings?.whatsapp || '+919400900000';
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const companyName = settings?.company_name || 'RMVS Web Services';

  const defaultMessage = encodeURIComponent(
    `Hello ${companyName}, I am visiting rmvswebservices.onrender.com and would like to consult on software development & engineering services.`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip Pill */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl liquid-glass border border-black/10 bg-white shadow-lg text-slate-800 text-xs font-medium animate-in fade-in slide-in-from-right-2">
          <span>Need help? Chat with {companyName}</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-black ml-1"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        className="w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all group"
        aria-label={`Chat with ${companyName} on WhatsApp`}
      >
        <MessageSquare size={22} className="group-hover:rotate-6 transition-transform" />
      </a>
    </div>
  );
};
