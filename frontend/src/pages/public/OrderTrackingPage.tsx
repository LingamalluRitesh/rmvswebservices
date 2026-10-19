import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ExternalLink, Search, AlertCircle, MessageSquare
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
    <div className="min-h-screen bg-white text-slate-900 selection:bg-black/10">
      {/* Hero Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <img src={settings?.logo_url || '/logo.png'} alt="RMVS Logo" className="h-8 w-auto object-contain" />
          <span className="text-slate-400 text-xs font-mono uppercase tracking-widest">RMVS Logistics &amp; Delivery Suite</span>
        </div>
        <h1 className="font-instrument italic text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] text-slate-950 mb-4">
          Live Order &amp; <em>Delivery Tracking</em>
        </h1>
        <p className="text-slate-600 text-sm max-w-xl leading-relaxed">
          Monitor your project deliverables, active milestone progressions, and delivery logistics in real-time.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-8 flex items-center gap-2 max-w-xl">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl liquid-glass border border-black/10 bg-white/80 shadow-xs">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Tracking (RMVS-TRK-*) or Order (RMVS-ORD-*) ID"
              className="w-full text-sm bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 rounded-2xl bg-black text-white text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 shrink-0"
          >
            {isLoading ? 'Locating...' : 'Track'}
          </button>
        </form>
      </div>

      {/* Main Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Top Order Overview Card */}
            <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-black/[0.08] bg-white/70 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl font-bold text-slate-950">{data.order_number}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase border ${
                      data.is_delivered
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {data.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1 font-mono">
                    Tracking Identifier: <strong className="text-slate-800">{data.tracking_number}</strong>
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Estimated Arrival</p>
                  <p className="font-mono text-sm font-semibold text-slate-900 mt-0.5">
                    {data.estimated_delivery
                      ? new Date(data.estimated_delivery).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Pending Dispatch Confirmation'}
                  </p>
                </div>
              </div>

              {/* Progress Bar / Milestones */}
              <div className="space-y-4">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Delivery Milestones</p>
                <div className="relative">
                  {/* Connecting Line */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0 hidden md:block" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                    {data.milestones.map((m, idx) => (
                      <div key={m.key} className="flex flex-col md:items-center text-left md:text-center relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold mb-2 transition-all ${
                          m.completed
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}>
                          {m.completed ? '✓' : idx + 1}
                        </div>
                        <span className={`text-xs font-medium ${m.completed ? 'text-slate-950 font-semibold' : 'text-slate-400'}`}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delivery Details Details Grid */}
              <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-black/[0.06] text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-black/[0.06]">
                  <p className="text-slate-400 text-[10px] uppercase font-mono">Service Project</p>
                  <p className="font-semibold text-slate-900 mt-1">{data.service_type}</p>
                  <p className="text-slate-500 mt-0.5">Recipient: {data.customer_name}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-black/[0.06]">
                  <p className="text-slate-400 text-[10px] uppercase font-mono">Assigned Logistics Specialist</p>
                  <p className="font-semibold text-slate-900 mt-1">{data.delivery_agent_name || 'RMVS Lead Engineer'}</p>
                  <p className="text-slate-500 font-mono mt-0.5">{data.delivery_agent_phone || '+91 9400900000'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-black/[0.06]">
                  <p className="text-slate-400 text-[10px] uppercase font-mono">Delivery Destination</p>
                  <p className="font-semibold text-slate-900 mt-1 line-clamp-2">
                    {data.destination_address || 'Designated Corporate Headquarters / Cloud Infrastructure'}
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Contact Card */}
            <div className="liquid-glass rounded-3xl p-6 border border-emerald-500/20 bg-emerald-50/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h4 className="font-instrument italic text-lg text-slate-950">Have questions about your delivery?</h4>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Connect directly with the RMVS WebServices executive team on WhatsApp.
                  </p>
                </div>
              </div>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
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
