import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import api from '../../api/client';

export const CustomerWhatsAppPreferenceCard: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [transactional, setTransactional] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [language, setLanguage] = useState('en_US');
  const [consentDate, setConsentDate] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const res = await api.get('/customer/preferences');
      setPhone(res.data.whatsapp_phone || '');
      setTransactional(res.data.transactional_enabled);
      setMarketing(res.data.marketing_enabled);
      setLanguage(res.data.preferred_language || 'en_US');
      setConsentDate(res.data.consent_timestamp);
    } catch (err) {
      console.warn('Could not load preferences', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotice(null);
    try {
      const res = await api.put('/customer/preferences', {
        whatsapp_phone: phone,
        transactional_enabled: transactional,
        marketing_enabled: marketing,
        preferred_language: language
      });
      setPhone(res.data.whatsapp_phone);
      setConsentDate(res.data.consent_timestamp);
      setNotice({ text: 'WhatsApp preferences updated successfully!' });
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setNotice({ text: err.response?.data?.detail || 'Failed to update preferences.', isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-sm bg-white/70 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <Smartphone size={20} />
          </div>
          <div>
            <h2 className="font-instrument italic text-2xl text-slate-950">WhatsApp Messaging Preferences</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control automated WhatsApp messages for order progress, invoices, and delivery ETA updates.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono">
          <Shield size={12} className="text-emerald-600" />
          <span>Meta Verified Opt-in</span>
        </div>
      </div>

      {notice && (
        <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 border ${
          notice.isError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {notice.isError ? <AlertCircle size={14} className="shrink-0" /> : <CheckCircle2 size={14} className="shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 text-xs font-mono uppercase mb-2">
              WhatsApp Phone Number (with Country Code) *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 text-slate-900 text-sm font-mono placeholder-slate-400 focus:border-black/30 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">E.164 standard format required (e.g. +919876543210).</p>
          </div>

          <div>
            <label className="block text-slate-700 text-xs font-mono uppercase mb-2">Preferred Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 text-slate-900 text-sm focus:border-black/30 focus:outline-none"
            >
              <option value="en_US">English (US)</option>
              <option value="en_GB">English (UK)</option>
              <option value="hi_IN">Hindi (India)</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-slate-50 border border-black/[0.06] flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 text-xs">Transactional Notifications</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Order confirmations, invoices, receipts, and delivery ETAs.</p>
            </div>
            <input
              type="checkbox"
              checked={transactional}
              onChange={(e) => setTransactional(e.target.checked)}
              className="w-5 h-5 accent-black cursor-pointer rounded"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-black/[0.06] flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 text-xs">Marketing &amp; Updates</p>
              <p className="text-[11px] text-slate-500 mt-0.5">New features, announcements, and engineering releases.</p>
            </div>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="w-5 h-5 accent-black cursor-pointer rounded"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[11px] text-slate-400">
          <p>
            {consentDate
              ? `Consent recorded on: ${new Date(consentDate).toLocaleDateString()}`
              : 'You can opt-out at any time by replying STOP to any automated message.'}
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-full bg-black text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 shrink-0"
          >
            {isSaving ? 'Updating...' : 'Save WhatsApp Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};
