import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import type { DeveloperProfile } from '../../types';

interface ContactDeveloperModalProps {
  developer: DeveloperProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const ContactDeveloperModal: React.FC<ContactDeveloperModalProps> = ({
  developer,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const companyName = settings?.company_name || 'RMVS Web Services';

  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('Web Application');
  const [description, setDescription] = useState('');
  const [timeline, setTimeline] = useState('1-2 Months');
  const [budgetRange, setBudgetRange] = useState('MVP / Proof of Concept');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.post('/inquiries', {
        developer_id: developer.id,
        project_name: projectName,
        project_type: projectType,
        description,
        timeline,
        budget_range: budgetRange,
        client_name: user?.full_name || 'Direct Client',
        client_email: user?.email || 'inquiries@rmvs.in',
      });

      setSuccessMessage(
        `Inquiry submitted directly to ${developer.user.full_name} and ${companyName} technical leadership. We will respond promptly.`
      );
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to submit developer inquiry', err);
      setErrorMessage(
        err.response?.data?.detail || 'Failed to submit inquiry. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-[#070e22] border border-blue-500/30 text-white text-sm placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors shadow-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-blue-500/30 p-6 sm:p-8 shadow-2xl bg-[#0a1228] text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-[#070e22] border border-blue-500/25 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3.5 mb-2.5">
            {developer.user.avatar_url ? (
              <img
                src={developer.user.avatar_url}
                alt={developer.user.full_name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/40 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-500/30 flex items-center justify-center font-sans font-bold text-cyan-400 text-xl shadow-xs">
                {developer.user.full_name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="font-sans font-bold text-2xl text-white">Inquire with {developer.user.full_name}</h2>
              <p className="text-xs text-cyan-300 font-medium">{developer.title || 'Verified Developer'}</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Submit your requirements for {companyName} review. Requests are dispatched directly to {developer.user.full_name} and our technical delivery team.
          </p>
        </div>

        {successMessage ? (
          <div className="p-8 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 text-center flex flex-col items-center gap-3 shadow-md">
            <CheckCircle2 size={36} className="text-emerald-400" />
            <p className="text-sm text-emerald-200 font-medium leading-relaxed">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-xs mb-1.5 font-medium">Project Name or Target Objective *</label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. NextGen Telemetry Dashboard"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 text-xs mb-1.5 font-medium">Project Type</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className={inputCls}
                >
                  <option value="Web Application" className="bg-[#070e22]">Web Application</option>
                  <option value="Mobile App" className="bg-[#070e22]">Mobile App</option>
                  <option value="AI / ML System" className="bg-[#070e22]">AI / ML System</option>
                  <option value="SaaS Platform" className="bg-[#070e22]">SaaS Platform</option>
                  <option value="Cloud / DevOps" className="bg-[#070e22]">Cloud / DevOps</option>
                  <option value="Custom Software" className="bg-[#070e22]">Custom Software</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1.5 font-medium">Project Scope</label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className={inputCls}
                >
                  <option value="MVP / Proof of Concept" className="bg-[#070e22]">MVP / Proof of Concept</option>
                  <option value="Production Build" className="bg-[#070e22]">Production Build</option>
                  <option value="Enterprise Solution" className="bg-[#070e22]">Enterprise Solution</option>
                  <option value="Multi-Platform Ecosystem" className="bg-[#070e22]">Multi-Platform Ecosystem</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs mb-1.5 font-medium">Estimated Timeline</label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className={inputCls}
              >
                <option value="< 1 Month" className="bg-[#070e22]">&lt; 1 Month</option>
                <option value="1-2 Months" className="bg-[#070e22]">1-2 Months</option>
                <option value="3-6 Months" className="bg-[#070e22]">3-6 Months</option>
                <option value="6+ Months" className="bg-[#070e22]">6+ Months</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 text-xs mb-1.5 font-medium">Project Details &amp; Objectives *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your goals, tech expectations, and scope..."
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-blue-500/15">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-[#070e22] text-xs font-medium text-slate-300 hover:text-white border border-blue-500/30 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold hover:shadow-[0_0_15px_rgba(37,99,235,0.6)] disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm"
              >
                <Send size={13} />
                <span>{isSubmitting ? 'Sending Request...' : 'Send Inquiry'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
