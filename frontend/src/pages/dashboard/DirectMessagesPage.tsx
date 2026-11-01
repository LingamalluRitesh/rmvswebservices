import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import type { Conversation, Message } from '../../types';

export const DirectMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetConvId = searchParams.get('conversationId');
  const { isConnected, sendDirectMessage, addListener } = useWebSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const res = await api.get('/conversations');
      setConversations(res.data);

      if (targetConvId) {
        const found = res.data.find((c: Conversation) => c.id === Number(targetConvId));
        if (found) {
          setActiveConv(found);
        } else if (res.data.length > 0) {
          setActiveConv(res.data[0]);
        }
      } else if (res.data.length > 0 && !activeConv) {
        setActiveConv(res.data[0]);
      }
    } catch (e) {
      console.error('Error fetching conversations', e);
    }
  };

  useEffect(() => {
    if (!activeConv) return;
    fetchMessages(activeConv.id);

    const removeListener = addListener('new_dm_message', (payload: any) => {
      if (payload.conversation_id === activeConv.id && payload.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.message.id)) return prev;
          return [...prev, payload.message];
        });
      }
    });

    return () => {
      removeListener();
    };
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (convId: number) => {
    try {
      const res = await api.get(`/conversations/${convId}/messages`);
      setMessages(res.data);
    } catch (e) {
      console.error('Error fetching messages', e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConv) return;

    const content = messageInput.trim();
    setMessageInput('');

    if (isConnected) {
      sendDirectMessage(activeConv.id, content);
    } else {
      try {
        const res = await api.post(`/conversations/${activeConv.id}/messages`, { content });
        setMessages((prev) => [...prev, res.data]);
      } catch (e) {
        console.error('Failed to send direct message', e);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#060b19] text-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <p className="text-slate-400 text-xs tracking-wider uppercase mb-1 font-mono">Inbox</p>
          <h1 className="font-instrument italic text-4xl text-white">Direct Messages</h1>
        </div>

        {/* Two-panel layout */}
        <div className="flex gap-4 h-[78vh]">

          {/* ── Sidebar ── */}
          <div className="w-80 liquid-glass rounded-2xl p-4 flex flex-col border border-blue-500/25 shadow-sm bg-[#0a1228]/85 text-white shrink-0">
            {/* Sidebar header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-500/15">
              <div className="flex items-center gap-2">
                <MessageSquare size={15} className="text-slate-400" />
                <span className="text-slate-100 text-sm font-semibold">Conversations</span>
              </div>
              <span className="text-slate-400 text-xs tracking-wider uppercase font-mono">
                {conversations.length} active
              </span>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <MessageSquare size={32} className="text-slate-300 mb-3" />
                  <p className="text-slate-500 text-xs leading-relaxed">
                    No conversations yet. Start one from a developer profile or inquiry.
                  </p>
                </div>
              ) : (
                conversations.map((c) => {
                  const partner = c.other_members[0];
                  const isSelected = activeConv?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveConv(c)}
                      className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all border ${
                        isSelected
                          ? 'bg-[#070e22] text-slate-300/90 border-blue-500/30 shadow-2xs'
                          : 'hover:bg-[#070e22] text-slate-300 border-transparent'
                      }`}
                    >
                      {partner?.avatar_url ? (
                        <img
                          src={partner.avatar_url}
                          alt={partner.full_name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-black/[0.08] shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-200 border border-blue-500/25 flex items-center justify-center text-xs font-bold text-slate-800 shrink-0 shadow-2xs">
                          {partner?.full_name?.charAt(0) || 'U'}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-slate-100 text-xs font-semibold truncate">
                            {partner?.full_name || 'Member'}
                          </span>
                          {partner?.is_verified && (
                            <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-slate-500 text-[11px] truncate">
                          {c.last_message ? c.last_message.content : 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Chat Panel ── */}
          <div className="flex-1 liquid-glass rounded-2xl flex flex-col border border-blue-500/25 shadow-sm bg-[#0a1228]/85 text-white overflow-hidden">
            {activeConv ? (
              <>
                {/* Chat header */}
                <div className="px-5 py-4 border-b border-blue-500/15 flex items-center gap-3 shrink-0 bg-[#070e22] text-slate-300/50">
                  {activeConv.other_members[0]?.avatar_url ? (
                    <img
                      src={activeConv.other_members[0].avatar_url}
                      alt={activeConv.other_members[0].full_name}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-black/[0.08]"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-slate-200 border border-blue-500/25 flex items-center justify-center text-xs font-bold text-slate-800 shadow-2xs">
                      {activeConv.other_members[0]?.full_name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-white text-sm font-semibold flex items-center gap-1.5">
                      <span>{activeConv.other_members[0]?.full_name || 'Direct Chat'}</span>
                      {activeConv.other_members[0]?.is_verified && (
                        <CheckCircle2 size={12} className="text-emerald-600" />
                      )}
                    </h3>
                    <p className="text-slate-400 font-mono text-[11px]">
                      @{activeConv.other_members[0]?.username}
                    </p>
                  </div>

                  {/* WebSocket status indicator */}
                  <div className="ml-auto flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isConnected ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <span className="text-slate-400 text-[10px] tracking-wider uppercase font-mono">
                      {isConnected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Messages list */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#060b19]">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare size={36} className="text-slate-200 mb-3" />
                      <p className="text-slate-400 text-xs">
                        No messages yet. Say hello!
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.sender_id === user.id;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[70%] ${
                              isMe
                                ? 'bg-slate-900 text-white shadow-2xs ml-auto'
                                : 'bg-[#070e22] text-slate-300 text-slate-100 mr-auto border border-black/[0.04]'
                            }`}
                          >
                            {m.content}
                          </div>
                          <span className="text-slate-400 font-mono text-[10px] mt-1 px-1">
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message composer */}
                <div className="p-4 border-t border-blue-500/15 bg-[#070e22] text-slate-300/50 shrink-0">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-[#070e22] border border-blue-500/30 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none px-4 py-3 text-sm shadow-sm"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="bg-black text-white rounded-full p-3 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare size={44} className="text-slate-200 mb-4" />
                <h2 className="font-instrument italic text-xl text-slate-400 mb-1">No conversation selected</h2>
                <p className="text-slate-400 text-xs">
                  Pick a conversation from the sidebar to start chatting.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
