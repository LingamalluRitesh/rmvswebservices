import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { ClientInquiry } from '../../types';

export const InquiriesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<ClientInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<ClientInquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const statuses = ['New', 'Contacted', 'In Discussion', 'Proposal', 'In Progress', 'Completed', 'Closed'];

  useEffect(() => {
    fetchInquiries();
  }, [user]);

  const fetchInquiries = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const endpoint = user.role === 'developer' ? '/inquiries/developer' : '/inquiries/client';
      const res = await api.get(endpoint);
      setInquiries(res.data);
      if (res.data.length > 0 && !selectedInquiry) {
        setSelectedInquiry(res.data[0]);
      }
    } catch (e) {
      console.error('Error fetching inquiries', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (inqId: number, newStatus: string) => {
    try {
      const res = await api.put(`/inquiries/${inqId}/status`, { status: newStatus });
      setInquiries(inquiries.map((i) => (i.id === inqId ? res.data : i)));
      if (selectedInquiry?.id === inqId) {
        setSelectedInquiry(res.data);
      }
    } catch (e) {
      console.error('Error updating status', e);
    }
  };

  const handleStartChatWithPartner = async (partnerUserId: number) => {
    try {
      const res = await api.post(`/conversations/start/${partnerUserId}`);
      navigate(`/messages?conversationId=${res.data.id}`);
    } catch (e) {
      console.error('Error starting chat', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b19] text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div>
          <p className="text-slate-400 text-xs tracking-widest uppercase mb-2 font-mono">CRM Pipeline</p>
          <h1 className="font-instrument italic text-4xl text-white">Client Inquiries &amp; CRM</h1>
          <p className="text-slate-600 text-sm mt-2">
            Track project requests, negotiate deliverables, and communicate with partners.
          </p>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="bg-[#070e22] text-slate-300/70 rounded-3xl h-96 animate-pulse border border-black/[0.05]" />
        ) : inquiries.length === 0 ? (
          <div className="liquid-glass rounded-3xl text-center py-24 flex flex-col items-center gap-4 border border-blue-500/25 shadow-sm bg-[#0a1228]/85 text-white">
            <MessageSquare size={44} className="text-slate-300" />
            <div>
              <h3 className="font-instrument italic text-2xl text-white mb-1">No Inquiries Found</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                When clients submit project requirements, they will appear here in your CRM pipeline.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Inquiry List Sidebar */}
            <div className="liquid-glass rounded-3xl p-4 space-y-2 max-h-[75vh] overflow-y-auto border border-blue-500/25 shadow-sm bg-[#0a1228]/85 text-white">
              {inquiries.map((inq) => {
                const partner = user?.role === 'developer' ? inq.client : inq.developer?.user;
                const partnerName = partner?.full_name || inq.client_name || 'Client';
                const isSelected = selectedInquiry?.id === inq.id;
                return (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiry(inq)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-blue-950/60 border-cyan-400/50 shadow-md ring-1 ring-cyan-400/20'
                        : 'bg-[#070e22] text-slate-300 border-blue-500/15 hover:bg-[#070e22] text-slate-300/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h4 className="text-sm font-semibold text-slate-100 truncate">{inq.project_name}</h4>
                      <span className="liquid-glass px-2 py-0.5 rounded-full text-[10px] text-slate-700 border border-blue-500/25 bg-[#070e22] text-slate-300 font-mono">
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-2">{inq.description}</p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">{partnerName}</span>
                      <span className="text-slate-500 font-mono">{inq.budget_range || 'Flexible'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inquiry Detail View */}
            <div className="lg:col-span-2 liquid-glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-blue-500/25 shadow-sm bg-[#0a1228]/85 text-white">
              {selectedInquiry ? (
                <div className="space-y-6">

                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-blue-500/25">
                    <div>
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h2 className="font-instrument italic text-3xl text-white">
                          {selectedInquiry.project_name}
                        </h2>
                        <span className="liquid-glass px-3 py-1 rounded-full text-xs text-slate-700 border border-blue-500/25 bg-[#070e22] text-slate-300 font-mono">
                          {selectedInquiry.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        Submitted on {new Date(selectedInquiry.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Direct Chat Action */}
                    <button
                      onClick={() => {
                        const partnerId =
                          user?.role === 'developer'
                            ? selectedInquiry.client?.id
                            : selectedInquiry.developer?.user?.id;
                        if (partnerId) {
                          handleStartChatWithPartner(partnerId);
                        }
                      }}
                      className="bg-black text-white rounded-full px-5 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all hover:bg-slate-800 self-start sm:self-auto shadow-sm"
                    >
                      <MessageSquare size={14} />
                      <span>Open Direct Chat</span>
                    </button>
                  </div>

                  {/* Status Pipeline Selector */}
                  <div>
                    <label className="block text-slate-500 text-xs tracking-wider uppercase mb-3 font-mono">
                      Pipeline Progression
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {statuses.map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(selectedInquiry.id, st)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            selectedInquiry.status === st
                              ? 'bg-black text-white font-semibold shadow-xs'
                              : 'liquid-glass text-slate-600 hover:text-black hover:bg-[#070e22] text-slate-300 border border-blue-500/25'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scope & Details */}
                  <div className="liquid-glass rounded-2xl p-5 space-y-4 border border-blue-500/15 bg-[#070e22] text-slate-300">
                    <div>
                      <h4 className="text-slate-500 text-xs tracking-wider uppercase mb-2 font-mono">
                        Project Description &amp; Requirements
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {selectedInquiry.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-blue-500/25 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-1">Project Type</span>
                        <span className="font-semibold text-slate-100">{selectedInquiry.project_type || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Budget Range</span>
                        <span className="font-semibold text-slate-100 font-mono">{selectedInquiry.budget_range || 'Flexible'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Expected Timeline</span>
                        <span className="font-semibold text-slate-100">{selectedInquiry.timeline || 'Flexible'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Card */}
                  <div className="liquid-glass rounded-2xl p-4 flex items-center justify-between text-xs border border-blue-500/15 bg-[#070e22] text-slate-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 border border-blue-500/25 flex items-center justify-center text-slate-100 font-bold text-sm shadow-2xs">
                        {(user?.role === 'developer'
                          ? selectedInquiry.client?.full_name || selectedInquiry.client_name || 'C'
                          : selectedInquiry.developer?.user?.full_name || 'D'
                        ).charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100">
                          {user?.role === 'developer'
                            ? selectedInquiry.client?.full_name || selectedInquiry.client_name || 'Client'
                            : selectedInquiry.developer?.user?.full_name || 'Developer'}
                        </p>
                        <p className="text-slate-400 font-mono">
                          {user?.role === 'developer'
                            ? (selectedInquiry.client?.username ? `@${selectedInquiry.client.username}` : selectedInquiry.client_email || '')
                            : `@${selectedInquiry.developer?.user?.username || 'developer'}`}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const partnerId =
                          user?.role === 'developer'
                            ? selectedInquiry.client?.id
                            : selectedInquiry.developer?.user?.id;
                        if (partnerId) {
                          handleStartChatWithPartner(partnerId);
                        }
                      }}
                      className="text-slate-700 hover:text-black font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Send Message</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                </div>
              ) : (
                <div className="text-center py-20 text-slate-400 text-sm">
                  Select an inquiry from the sidebar to view full details.
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
