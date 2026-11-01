import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ExternalLink, Search, AlertCircle, MessageSquare, Check
} from 'lucide-react';
import api from '../../api/client';
import { useSettings } from '../../context/SettingsContext';

interface Milestone {
  title: string;
  key: string;
  completed: boolean;
}

interface TrackingData {
  order_number: string;
  tracking_number: string;
  customer_name: string;
  service_type: string;
  status: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  delivery_agent_name?: string;
  delivery_agent_phone?: string;
  destination_address?: string;
  is_delivered: boolean;
  milestones: Milestone[];
}

export const OrderTrackingPage: React.FC = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const { settings } = useSettings();
  const [query, setQuery] = useState(trackingNumber || '');
  const [data, setData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const businessPhone = settings?.whatsapp || '+919400900000';
  const cleanPhone = businessPhone.replace(/[^\d]/g, '');

  useEffect(() => {
    if (trackingNumber) {
      fetchTracking(trackingNumber);
    }
  }, [trackingNumber]);

  const fetchTracking = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/orders/track/${encodeURIComponent(id.trim())}`);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Order or tracking reference not found. Please verify your reference number.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchTracking(query.trim());
    }
  };

  const waLink = `https://wa.me/${cleanPhone}?text=Hello%20RMVS%20WebServices,%20I%20am%20inquiring%20about%20my%20order%20${data?.order_number || query}`;

  return (
    <div className="min-h-screen bg-[#060b19] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Hero Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <img src={settings?.logo_url || '/logo.png'} alt="RMVS Logo" className="h-8 w-auto object-contain" />
          <span className="text-cyan-400 text-xs font-mono uppercase tracking-widest">RMVS Logistics &amp; Delivery Suite</span>
        </div>
        <h1 className="font-sans font-extrabold text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] text-white mb-4">
          Live Order &amp; <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">Delivery Tracking</span>
        </h1>
        <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
          Monitor your project deliverables, active milestone progressions, and delivery logistics in real-time.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-8 flex items-center gap-2 max-w-xl">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl border border-blue-500/30 bg-[#070e22] shadow-sm">
            <Search size={16} className="text-cyan-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Tracking (RMVS-TRK-*) or Order (RMVS-ORD-*) ID"
              className="w-full text-sm bg-transparent text-white placeholder-slate-500 focus:outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all shadow-sm disabled:opacity-50 shrink-0"
          >
            {isLoading ? 'Locating...' : 'Track'}
          </button>
        </form>
      </div>

      {/* Main Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Top Order Overview Card */}
            <div className="rounded-3xl p-6 sm:p-8 border border-blue-500/25 bg-[#0a1228]/85 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-500/15 pb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl font-bold text-white">{data.order_number}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase border ${
                      data.is_delivered
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                        : 'bg-blue-950/60 text-cyan-300 border-blue-500/40'
                    }`}>
                      {data.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 font-mono">
                    Tracking Identifier: <strong className="text-cyan-300">{data.tracking_number}</strong>
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-cyan-400 text-[10px] uppercase font-mono tracking-wider">Estimated Arrival</p>
                  <p className="font-mono text-sm font-semibold text-white mt-0.5">
                    {data.estimated_delivery
                      ? new Date(data.estimated_delivery).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Pending Dispatch Confirmation'}
                  </p>
                </div>
              </div>

              {/* Progress Bar / Milestones */}
              <div className="space-y-4">
                <p className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">Delivery Milestones</p>
                <div className="relative">
                  {/* Connecting Line */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-blue-500/20 -z-0 hidden md:block" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                    {data.milestones.map((m, idx) => (
                      <div key={m.key} className="flex flex-col md:items-center text-left md:text-center relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold mb-2 transition-all ${
                          m.completed
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_10px_#38bdf8]'
                            : 'bg-[#070e22] border-2 border-blue-500/30 text-slate-500'
                        }`}>
                          {m.completed ? <Check size={12} /> : idx + 1}
                        </div>
                        <span className={`text-xs font-medium ${m.completed ? 'text-white font-semibold' : 'text-slate-500'}`}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delivery Details Grid */}
              <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-blue-500/15 text-xs">
                <div className="p-4 rounded-2xl bg-[#070e22] border border-blue-500/20">
                  <p className="text-cyan-400 text-[10px] uppercase font-mono">Service Project</p>
                  <p className="font-semibold text-white mt-1">{data.service_type}</p>
                  <p className="text-slate-400 mt-0.5">Recipient: {data.customer_name}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#070e22] border border-blue-500/20">
                  <p className="text-cyan-400 text-[10px] uppercase font-mono">Assigned Logistics Specialist</p>
                  <p className="font-semibold text-white mt-1">{data.delivery_agent_name || 'RMVS Lead Engineer'}</p>
                  <p className="text-slate-400 font-mono mt-0.5">{data.delivery_agent_phone || '+91 9400900000'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#070e22] border border-blue-500/20">
                  <p className="text-cyan-400 text-[10px] uppercase font-mono">Delivery Destination</p>
                  <p className="font-semibold text-white mt-1 line-clamp-2">
                    {data.destination_address || 'Designated Corporate Headquarters / Cloud Infrastructure'}
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Contact Card */}
            <div className="rounded-3xl p-6 border border-emerald-500/30 bg-[#071d18]/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-lg text-white">Have questions about your delivery?</h4>
                  <p className="text-slate-300 text-xs mt-0.5">
                    Connect directly with the RMVS WebServices executive team on WhatsApp.
                  </p>
                </div>
              </div>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-md flex items-center gap-1.5 shrink-0"
              >
                <span>Chat on WhatsApp</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
