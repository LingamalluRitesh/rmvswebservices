import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import api from '../../api/client';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'Full-Stack Web Projects',
    message: '',
  });

  const companyName = settings?.company_name || 'RMVS Web Services';
  const logoUrl = settings?.logo_url || '/logo.png';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Submit to Backend CRM
      await api.post('/inquiries', {
        project_name: `${formData.service} - ${formData.company || formData.name}`,
        project_type: formData.service,
        phone: formData.phone,
        description: `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nCompany: ${formData.company}\n\n${formData.message}`,
        client_name: formData.name,
        client_email: formData.email,
        timeline: 'Flexible',
        budget_range: 'Standard',
      });

      // 2. Instant Automatic Phone Notification to CEO
      await api.post('/notifications/phone-alert', {
        event_type: 'website_inquiry',
        title: `New Inquiry: ${formData.service}`,
        details: `Client: ${formData.name}\nPhone: ${formData.phone || 'N/A'}\nEmail: ${formData.email}\nCompany: ${formData.company || 'N/A'}\nMessage: ${formData.message}`,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email,
        action_url: 'https://rmvswebservices.onrender.com/ceo'
      });
    } catch (err) {
      console.warn('Inquiry notice:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors shadow-2xs";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <img src={logoUrl} alt={companyName} className="h-8 w-auto object-contain" />
          <p className="text-blue-600 text-xs tracking-widest uppercase font-mono font-bold">Get in touch with {companyName}</p>
        </div>
        <h1 className="font-sans font-extrabold text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] text-slate-900 mb-6 max-w-2xl">
          Start a <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">conversation.</span>
        </h1>
        <p className="text-slate-600 text-base leading-relaxed max-w-xl">
          Have an enterprise requirement, technical consultation need, or question about our engineering squads?
          We are here to help.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="rounded-3xl p-8 flex flex-col justify-between gap-8 border border-slate-200 bg-white shadow-xl">
            <div className="space-y-6">
              <h3 className="font-sans font-bold text-slate-900 text-2xl mb-2">{companyName} Headquarters</h3>
              {[
                { Icon: MapPin, label: 'Location', value: settings?.address || 'Hyderabad & Bengaluru, India' },
                { Icon: Mail, label: 'Direct Contact', value: settings?.email || 'contact@rmvswebservices.com' },
                { Icon: Phone, label: 'Executive Phone', value: settings?.phone || '+91 94009 00000' },
                { Icon: Clock, label: 'Business Hours', value: settings?.business_hours || 'Monday – Friday, 9:00 AM – 6:00 PM' },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5 text-blue-600 shadow-2xs">
                    <Icon size={14} />
                  </div>
                  <div>
                    <p className="text-blue-600 text-xs font-mono uppercase tracking-wider font-semibold">{label}</p>
                    <p className="text-slate-800 text-sm font-medium mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="rounded-2xl p-5 border border-blue-100 bg-blue-50/60">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-1.5">
                <ShieldCheck size={16} />
                <span>Instant CEO Notification</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Every inquiry submitted directly triggers an automated notification to CEO Ritesh Lingamallu's phone for guaranteed rapid response.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 rounded-3xl p-8 border border-slate-200 bg-white shadow-xl">
            {submitted ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-xs">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-sans font-bold text-2xl text-slate-900">Inquiry &amp; Alert Dispatched</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out, <strong>{formData.name}</strong>. An automated message has been sent directly to the executive desk. Our engineering team will review your specifications and contact you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-semibold text-xs hover:bg-blue-100 transition-colors mt-2 shadow-2xs"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-2">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Vikram Sharma"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-2">Work Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="vikram@enterprise.com"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-2">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-2">Company / Organization</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Solaria Tech"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-2">Service of Interest</label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Websites & Web Portals">Websites &amp; Web Portals (React + TypeScript)</option>
                    <option value="Mobile App Engineering">Mobile App Engineering (Flutter + iOS + Android)</option>
                    <option value="Enterprise Software & Microservices">Enterprise Software (Python FastAPI + PostgreSQL)</option>
                    <option value="Digital Solutions & AI Automation">Digital Solutions &amp; AI Automation (WhatsApp Cloud API)</option>
                    <option value="General Enterprise Consultation">General Enterprise Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-2">Project Scope or Inquiry *</label>
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
                  className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  <Send size={15} />
                  <span>{isSubmitting ? 'Sending...' : 'Submit Inquiry & Alert CEO'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
