import React, { useEffect, useState, useRef } from 'react';
import {
  Hash, Send, Lock, MessageSquare,
  CheckCircle2
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useWebSocket } from '../../context/WebSocketContext';
import type { CommunityChannel, CommunityMessage } from '../../types';

export const CommunityChatPage: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { isConnected, subscribe, unsubscribe, sendChannelMessage, addListener } = useWebSocket();

  const companyName = settings?.company_name || 'RMVS Web Services';
  const logoUrl = settings?.logo_url || '/logo.png';

  const [channels, setChannels] = useState<CommunityChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<CommunityChannel | null>(null);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await api.get('/community/channels');
      setChannels(res.data);
      if (res.data.length > 0 && !activeChannel) {
        setActiveChannel(res.data[0]);
      }
    } catch (e) {
      console.error('Error fetching channels', e);
    }
  };

  // Switch channel & listen to WebSocket topic
  useEffect(() => {
    if (!activeChannel) return;

    fetchMessages(activeChannel.id);
    const topic = `channel:${activeChannel.id}`;
    subscribe(topic);

    const removeListener = addListener('new_channel_message', (payload: any) => {
      if (payload.topic === topic && payload.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.message.id)) return prev;
          return [...prev, payload.message];
        });
      }
    });

    return () => {
      unsubscribe(topic);
      removeListener();
    };
  }, [activeChannel, isConnected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (channelId: number) => {
    setIsLoadingMessages(true);
    try {
      const res = await api.get(`/community/channels/${channelId}/messages`);
      setMessages(res.data);
    } catch (e) {
      console.error('Error loading channel messages', e);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChannel) return;

    const content = messageInput.trim();
    setMessageInput('');

    // If WebSocket is connected, send through WS
    if (isConnected) {
      sendChannelMessage(activeChannel.id, content);
    } else {
      // Fallback to HTTP POST
      try {
        const res = await api.post(`/community/channels/${activeChannel.id}/messages`, {
          content,
        });
        setMessages((prev) => [...prev, res.data]);
      } catch (e) {
        console.error('Failed to post message', e);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#060b19] text-slate-100 flex items-center justify-center px-4">
        <div className="liquid-glass rounded-2xl p-10 text-center max-w-sm w-full border border-blue-500/25 shadow-sm bg-[#0a1228]/85 text-white">
          <div className="w-14 h-14 rounded-2xl bg-[#070e22] text-slate-300 flex items-center justify-center mx-auto mb-5 border border-blue-500/25 shadow-2xs">
            <Lock size={24} className="text-slate-600" />
          </div>
          <h2 className="font-instrument italic text-2xl text-white mb-2">Authenticated Community</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Access to our developer channels is reserved for registered developers and technical staff.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b19] text-slate-100 py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="mb-5 flex items-center gap-3">
          <img src={logoUrl} alt={companyName} className="h-8 w-auto object-contain" />
          <div>
            <h1 className="font-instrument italic text-2xl text-white leading-none">{companyName} Community</h1>
            <p className="text-xs text-slate-400 tracking-widest uppercase font-mono mt-0.5">Engineering &amp; Developer Channels</p>
          </div>
        </div>

        {/* Main layout */}
        <div className="liquid-glass rounded-2xl border border-blue-500/25 shadow-sm bg-[#0a1228]/85 text-white overflow-hidden flex flex-col md:flex-row h-[80vh]">

          {/* ── Sidebar ── */}
          <div className="w-full md:w-64 bg-[#070e22] text-slate-300 border-b md:border-b-0 md:border-r border-blue-500/15 flex flex-col p-4 gap-4">

            {/* Connection badge */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs tracking-wider uppercase font-mono"># Channels</span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}
                />
                {isConnected ? 'Live' : 'Connecting'}
              </span>
            </div>

            {/* Channel list */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {channels.map((ch) => {
                const isActive = activeChannel?.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch)}
                    className={`w-full text-left px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                      isActive
                        ? 'bg-black text-white shadow-xs'
                        : 'text-slate-600 hover:text-black hover:bg-[#0e1938]/50'
                    }`}
                  >
                    <Hash size={13} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span className="truncate">{ch.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Signed-in footer */}
            <div className="pt-3 border-t border-blue-500/15">
              <p className="text-[11px] text-slate-500 font-mono">
                Signed in as{' '}
                <strong className="text-slate-100 font-semibold">@{user.username}</strong>
              </p>
            </div>
          </div>

          {/* ── Main Chat Area ── */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#060b19]">

            {/* Channel header */}
            <div className="px-5 py-3.5 border-b border-blue-500/15 flex items-center justify-between shrink-0 bg-[#070e22] text-slate-300/50">
              <div className="flex items-center gap-2.5">
                <Hash size={18} className="text-slate-400" />
                <div>
                  <h3 className="font-instrument italic text-base text-white leading-none">
                    {activeChannel?.name || 'Select Channel'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {activeChannel?.description || 'Developer Community Discussion'}
                  </p>
                </div>
              </div>
              <MessageSquare size={16} className="text-slate-300" />
            </div>

            {/* Messages stream */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {isLoadingMessages ? (
                <div className="text-center py-16 text-xs text-slate-400 font-mono">Loading messages…</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#070e22] text-slate-300 border border-blue-500/15 flex items-center justify-center">
                    <MessageSquare size={22} className="text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-600">No messages in #{activeChannel?.name} yet.</p>
                  <p className="text-[11px] text-slate-400">Be the first developer to start the discussion!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.user.username === user.username;
                  return (
                    <div key={msg.id} className="flex items-start gap-3 group">
                      {/* Avatar */}
                      {msg.user.avatar_url ? (
                        <img
                          src={msg.user.avatar_url}
                          alt={msg.user.full_name}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-black/[0.08] shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-slate-200 border border-blue-500/25 flex items-center justify-center text-xs font-bold text-slate-800 shrink-0 shadow-2xs">
                          {msg.user.full_name.charAt(0)}
                        </div>
                      )}

                      {/* Bubble */}
                      <div className="flex-1 min-w-0">
                        {/* Name row */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-100">{msg.user.full_name}</span>
                          {msg.user.is_verified && (
                            <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                          )}
                          {msg.user.role === 'super_admin' && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono border border-blue-500/25 text-slate-700 bg-[#070e22] text-slate-300">
                              CEO
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Message content */}
                        <div
                          className={`inline-block max-w-full px-4 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap ${
                            isOwn
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'bg-[#070e22] text-slate-300 text-slate-100 border border-black/[0.04]'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer input bar */}
            <div className="p-4 border-t border-blue-500/15 bg-[#070e22] text-slate-300/50 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message #${activeChannel?.name || 'channel'}…`}
                  className="flex-1 bg-[#070e22] border border-blue-500/30 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none px-4 py-3 text-xs sm:text-sm shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center shrink-0 disabled:opacity-30 hover:shadow-[0_0_12px_rgba(37,99,235,0.6)] transition-all shadow-sm"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
