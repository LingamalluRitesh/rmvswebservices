import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import api from '../../api/client';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: 'AI & Machine Learning Solutions',
    message: '',
  });

  const companyName = settings?.company_name || 'RMVS Web Services';
  const logoUrl = settings?.logo_url || '/logo.png';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/inquiries', {
        project_name: `${formData.service} - ${formData.company || formData.name}`,
        project_type: formData.service,
        description: `Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company}\n\n${formData.message}`,
        client_name: formData.name,
        client_email: formData.email,
        timeline: 'Flexible',
        budget_range: 'Standard',
      });
    } catch (err) {
      console.warn('Inquiry submission notice:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-[#070e22] border border-blue-500/30 text-white text-sm placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors shadow-sm";

  return (
    <div className="min-h-screen bg-[#060b19] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <img src={logoUrl} alt={companyName} className="h-8 w-auto object-contain" />
          <p className="text-cyan-400 text-xs tracking-widest uppercase font-mono">Get in touch with {companyName}</p>
        </div>
        <h1 className="font-sans font-extrabold text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] text-white mb-6 max-w-2xl">
          Start a <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">conversation.</span>
        </h1>
        <p className="text-slate-300 text-base leading-relaxed max-w-xl">
          Have an enterprise requirement, technical consultation need, or question about our engineering squads?
          We are here to help.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="rounded-3xl p-8 flex flex-col justify-between gap-8 border border-blue-500/25 shadow-xl bg-[#0a1228]/85">
            <div className="space-y-6">
              <h3 className="font-sans font-bold text-white text-2xl mb-2">{companyName} Headquarters</h3>
              {[
                { Icon: MapPin, label: 'Location', value: settings?.address || 'Hyderabad & Bengaluru, India' },
                { Icon: Mail, label: 'Direct Contact', value: settings?.email || 'contact@company.com' },
                { Icon: Phone, label: 'Executive Office', value: settings?.phone || '+91 98765 43210' },
                { Icon: Clock, label: 'Business Hours', value: settings?.business_hours || 'Monday – Friday, 9:00 AM – 6:00 PM' },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-950/80 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400 shadow-sm">
                    <Icon size={14} />
                  </div>
                  <div>
                    <p className="text-cyan-400/80 text-xs font-mono uppercase tracking-wider">{label}</p>
                    <p className="text-slate-200 text-sm font-medium mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-4 border border-blue-500/20 bg-[#070e22]/90">
              <p className="text-white text-sm font-semibold mb-1">Looking for a specific developer?</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Contact developers directly from their profiles or via the Verified Developer Directory.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 rounded-3xl p-8 border border-blue-500/25 shadow-xl bg-[#0a1228]/85">
            {submitted ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-md">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="font-sans font-bold text-2xl text-white">Inquiry Received</h3>
                <p className="text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. Our engineering leadership will review your requirements and respond within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-full bg-[#070e22] border border-blue-500/30 text-cyan-300 text-sm hover:text-white transition-colors mt-2 shadow-sm"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-2">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Elena Rostova"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-2">Work Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="elena@company.com"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-2">Company / Organization</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Apex Dynamics Ltd"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-2">Service of Interest</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className={inputCls}
                    >
                      <option value="AI & Machine Learning Solutions" className="bg-[#070e22]">AI &amp; Machine Learning Solutions</option>
                      <option value="Full-Stack Web Projects" className="bg-[#070e22]">Full-Stack Web Projects</option>
                      <option value="Mobile App Engineering" className="bg-[#070e22]">Mobile App Engineering</option>
                      <option value="Cloud Systems & DevOps" className="bg-[#070e22]">Cloud Systems &amp; DevOps</option>
                      <option value="Enterprise SaaS Platforms" className="bg-[#070e22]">Enterprise SaaS Platforms</option>
                      <option value="General Partnership" className="bg-[#070e22]">General Partnership</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-2">Project Scope or Inquiry *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your project goals, timeline, and requirements..."
                    className={`${inputCls} resize-none`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all shadow-md disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'Sending...' : 'Submit inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
