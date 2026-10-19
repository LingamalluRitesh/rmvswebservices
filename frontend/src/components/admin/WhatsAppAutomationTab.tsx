import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Send, CheckCircle2, AlertTriangle, RefreshCw,
  Clock, Shield, Eye, Settings, FileText, Smartphone, Copy, Check, Search
} from 'lucide-react';
import api from '../../api/client';

export interface WhatsAppStats {
  total_messages: number;
  total_sent: number;
  total_delivered: number;
  total_read: number;
  total_failed: number;
  total_pending: number;
  total_simulated: number;
  delivery_rate_percent: number;
  is_enabled: boolean;
  test_mode: boolean;
  configured_phone_id?: string;
  business_phone?: string;
  active_templates_count: number;
  recent_messages_24h: number;
}

export interface WhatsAppConfig {
  id: number;
  is_enabled: boolean;
  test_mode: boolean;
  phone_number_id?: string;
  waba_id?: string;
  access_token_masked?: string;
  has_access_token: boolean;
  webhook_verify_token: string;
  has_app_secret: boolean;
  business_phone_number?: string;
  business_name: string;
  default_language: string;
  max_retries: number;
  retry_delay_seconds: number;
  delivery_eta_threshold_minutes: number;
  updated_at?: string;
}

export interface WhatsAppTemplate {
  id: number;
  template_name: string;
  display_name: string;
  category: string;
  language: string;
  event_trigger: string;
  header_text?: string;
  body_text: string;
  footer_text?: string;
  variables: string[];
  approval_status: string;
  is_active: boolean;
}

export interface WhatsAppMessageItem {
  id: number;
  direction: string;
  recipient_phone: string;
  recipient_phone_masked: string;
  recipient_name?: string;
  user_id?: number;
  order_id?: number;
  invoice_id?: number;
  delivery_id?: number;
  event_type: string;
  template_name?: string;
  rendered_body?: string;
  provider_message_id?: string;
  status: string;
  error_code?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  created_at?: string;
  updated_at?: string;
}

interface Props {
  showNotification: (msg: string, isError?: boolean) => void;
}

export const WhatsAppAutomationTab: React.FC<Props> = ({ showNotification }) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'config' | 'templates' | 'history'>('overview');
  const [stats, setStats] = useState<WhatsAppStats | null>(null);
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessageItem[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');

  // Config Form State
  const [configForm, setConfigForm] = useState<{
    is_enabled: boolean;
    test_mode: boolean;
    phone_number_id: string;
    waba_id: string;
    access_token: string;
    webhook_verify_token: string;
    app_secret: string;
    business_phone_number: string;
    default_language: string;
    delivery_eta_threshold_minutes: number;
    max_retries: number;
  }>({
    is_enabled: true,
    test_mode: true,
    phone_number_id: '',
    waba_id: '',
    access_token: '',
    webhook_verify_token: 'rmvs_whatsapp_verify_token_2026',
    app_secret: '',
    business_phone_number: '+919400900000',
    default_language: 'en_US',
    delivery_eta_threshold_minutes: 30,
    max_retries: 3
  });

  // Test Message Sender State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('+919876543210');
  const [testTemplate, setTestTemplate] = useState('order_confirmed');
  const [testMessageType, setTestMessageType] = useState<'template' | 'text'>('template');
  const [testCustomText, setTestCustomText] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // Log Payload Modal
  const [viewLog, setViewLog] = useState<WhatsAppMessageItem | null>(null);
  const [copiedVerifyToken, setCopiedVerifyToken] = useState(false);

  useEffect(() => {
    loadAllWhatsApp();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'history') {
      loadMessages();
    }
  }, [activeSubTab, currentPage, statusFilter, eventFilter]);

  const loadAllWhatsApp = async () => {
    setIsLoading(true);
    try {
      const [statsRes, configRes, tmplRes] = await Promise.all([
        api.get('/whatsapp/stats'),
        api.get('/whatsapp/config'),
        api.get('/whatsapp/templates')
      ]);
      setStats(statsRes.data);
      setConfig(configRes.data);
      setTemplates(tmplRes.data);

      setConfigForm({
        is_enabled: configRes.data.is_enabled,
        test_mode: configRes.data.test_mode,
        phone_number_id: configRes.data.phone_number_id || '',
        waba_id: configRes.data.waba_id || '',
        access_token: '',
        webhook_verify_token: configRes.data.webhook_verify_token || 'rmvs_whatsapp_verify_token_2026',
        app_secret: '',
        business_phone_number: configRes.data.business_phone_number || '',
        default_language: configRes.data.default_language || 'en_US',
        delivery_eta_threshold_minutes: configRes.data.delivery_eta_threshold_minutes || 30,
        max_retries: configRes.data.max_retries || 3
      });
    } catch (err) {
      console.error('Failed to load WhatsApp data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const params: any = { page: currentPage, limit: 15 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusFilter) params.status = statusFilter;
      if (eventFilter) params.event = eventFilter;

      const res = await api.get('/whatsapp/messages', { params });
      setMessages(res.data.items || []);
      setTotalMessages(res.data.total || 0);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load message history', err);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        is_enabled: configForm.is_enabled,
        test_mode: configForm.test_mode,
        phone_number_id: configForm.phone_number_id,
        waba_id: configForm.waba_id,
        webhook_verify_token: configForm.webhook_verify_token,
        business_phone_number: configForm.business_phone_number,
        default_language: configForm.default_language,
        delivery_eta_threshold_minutes: Number(configForm.delivery_eta_threshold_minutes),
        max_retries: Number(configForm.max_retries)
      };
      if (configForm.access_token.trim()) {
        payload.access_token = configForm.access_token.trim();
      }
      if (configForm.app_secret.trim()) {
        payload.app_secret = configForm.app_secret.trim();
      }

      const res = await api.put('/whatsapp/config', payload);
      setConfig(res.data);
      showNotification('WhatsApp Business configuration updated successfully!');
      loadAllWhatsApp();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Failed to save WhatsApp configuration', true);
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await api.post('/whatsapp/test-message', {
        to_phone: testPhone,
        message_type: testMessageType,
        template_name: testTemplate,
        custom_text: testMessageType === 'text' ? testCustomText : undefined
      });
      setTestResult(res.data);
      showNotification(`Test message dispatched (${res.data.simulated ? 'Test Simulation' : 'Live WhatsApp'})!`);
      loadAllWhatsApp();
      if (activeSubTab === 'history') loadMessages();
    } catch (err: any) {
      setTestResult({
        success: false,
        error_message: err.response?.data?.detail || 'Test send request failed.'
      });
      showNotification(err.response?.data?.detail || 'Test send failed', true);
    } finally {
      setTestSending(false);
    }
  };

  const handleRetryMessage = async (logId: number) => {
    try {
      await api.post(`/whatsapp/messages/${logId}/retry`);
      showNotification('Message retry triggered successfully!');
      loadMessages();
      loadAllWhatsApp();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Retry failed', true);
    }
  };

  const handleCopyVerifyToken = () => {
    if (config?.webhook_verify_token) {
      navigator.clipboard.writeText(config.webhook_verify_token);
      setCopiedVerifyToken(true);
      setTimeout(() => setCopiedVerifyToken(false), 2000);
      showNotification('Webhook verification token copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-instrument italic text-2xl text-slate-950">WhatsApp Business Automation</h3>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Official Meta Cloud API (v21.0) • Order updates, billing alerts, delivery tracking, and contact leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTestModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Send size={13} />
            <span>Send Test WhatsApp</span>
          </button>
          <button
            onClick={loadAllWhatsApp}
            className="p-2 rounded-full liquid-glass border border-black/10 text-slate-700 hover:text-black hover:bg-slate-50 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 liquid-glass rounded-2xl border border-black/10 bg-slate-50/60 max-w-fit">
        {[
          { id: 'overview', label: 'Dashboard & Metrics', icon: MessageSquare },
          { id: 'config', label: 'Meta API Credentials', icon: Settings },
          { id: 'templates', label: `Approved Templates (${templates.length})`, icon: FileText },
          { id: 'history', label: `Message Audit Log (${totalMessages})`, icon: Clock },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSubTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeSubTab === id
                ? 'bg-black text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-black hover:bg-black/[0.04]'
            }`}
          >
            <Icon size={13} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* 1. OVERVIEW & METRICS */}
      {/* ============================================================== */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Integration Status Banner */}
          <div className="liquid-glass rounded-3xl p-6 border border-black/[0.08] bg-white/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                config?.is_enabled
                  ? (config?.test_mode ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600')
                  : 'bg-rose-50 border-rose-200 text-rose-600'
              }`}>
                <Smartphone size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-instrument italic text-xl text-slate-950">
                    {config?.is_enabled
                      ? (config?.test_mode ? 'Test Simulation Mode (Active)' : 'Meta Cloud API Live (Connected)')
                      : 'Automation Disabled'}
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                    config?.is_enabled
                      ? (config?.test_mode ? 'bg-amber-100/70 border-amber-300 text-amber-800' : 'bg-emerald-100/70 border-emerald-300 text-emerald-800')
                      : 'bg-rose-100/70 border-rose-300 text-rose-800'
                  }`}>
                    {config?.is_enabled ? (config?.test_mode ? 'Simulated' : 'Production') : 'Paused'}
                  </span>
                </div>
                <p className="text-slate-600 text-xs mt-1 max-w-xl leading-relaxed">
                  {config?.test_mode
                    ? 'Safe test simulation is ON. Automation events trigger mock deliveries with full payload recording without incurring Meta API costs or failing on unverified numbers.'
                    : 'Production Meta Cloud API mode is ACTIVE. Messages are transmitted to WhatsApp recipients via Graph API v21.0.'}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 mt-3">
                  <span>Phone ID: <strong className="text-slate-800">{config?.phone_number_id || 'Not configured'}</strong></span>
                  <span>•</span>
                  <span>Business Number: <strong className="text-slate-800">{config?.business_phone_number || 'Not configured'}</strong></span>
                  <span>•</span>
                  <span>WABA ID: <strong className="text-slate-800">{config?.waba_id || 'Not configured'}</strong></span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('config')}
              className="px-5 py-2.5 rounded-full liquid-glass border border-black/10 text-slate-800 text-xs font-medium hover:bg-slate-50 transition-colors shrink-0"
            >
              Configure Credentials &rarr;
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Dispatched', val: stats?.total_messages ?? 0, icon: MessageSquare, color: 'text-slate-900' },
              { label: 'Delivered', val: stats?.total_delivered ?? 0, icon: CheckCircle2, color: 'text-emerald-600' },
              { label: 'Read by Customer', val: stats?.total_read ?? 0, icon: Eye, color: 'text-blue-600' },
              { label: 'Test Simulated', val: stats?.total_simulated ?? 0, icon: Smartphone, color: 'text-amber-600' },
              { label: 'Failed', val: stats?.total_failed ?? 0, icon: AlertTriangle, color: 'text-rose-600' },
              { label: 'Delivery Rate', val: `${stats?.delivery_rate_percent ?? 100}%`, icon: Shield, color: 'text-slate-900' },
            ].map(({ label, val, icon: Icon, color }) => (
              <div key={label} className="liquid-glass rounded-2xl p-4 border border-black/[0.08] bg-white/70 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider">{label}</span>
                  <Icon size={14} className={color} />
                </div>
                <div className={`font-instrument italic text-3xl font-semibold ${color}`}>{val}</div>
              </div>
            ))}
          </div>

          {/* Integration Architecture Overview */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="liquid-glass rounded-3xl p-6 border border-black/[0.08] bg-white/70 shadow-sm space-y-4">
              <h4 className="font-instrument italic text-xl text-slate-950">Webhook Endpoint Details</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Configure your Meta Developer App to route incoming status updates and replies to this secure webhook:
              </p>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-black/[0.06]">
                  <p className="text-slate-400 text-[10px] uppercase">Callback URL</p>
                  <p className="text-slate-900 font-semibold break-all mt-0.5">https://rmvs-backend.onrender.com/api/v1/webhooks/whatsapp</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-black/[0.06] flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase">Verify Token</p>
                    <p className="text-slate-900 font-semibold mt-0.5">{config?.webhook_verify_token}</p>
                  </div>
                  <button
                    onClick={handleCopyVerifyToken}
                    className="p-1.5 rounded-lg liquid-glass border border-black/10 text-slate-700 hover:text-black"
                    title="Copy Verify Token"
                  >
                    {copiedVerifyToken ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 liquid-glass rounded-3xl p-6 border border-black/[0.08] bg-white/70 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-instrument italic text-xl text-slate-950">Active Automation Triggers</h4>
                <button onClick={() => setActiveSubTab('templates')} className="text-xs text-slate-600 hover:text-black font-mono">
                  View All Templates &rarr;
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                {[
                  { title: 'Order Lifecycle', events: ['Order Created', 'Confirmed', 'Processing', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'] },
                  { title: 'Billing & Invoicing', events: ['Invoice Generated', 'Invoice Updated', 'Payment Pending Reminder', 'Payment Received Receipt', 'Payment Failed'] },
                  { title: 'Fulfillment & Logistics', events: ['Delivery Agent Assigned', 'Out for Delivery Alert', 'ETA Changed (>= 30 min)', 'Delivery Exception Alert'] },
                  { title: 'Website Contact Leads', events: ['New Client Inquiry Lead Alert to CEO / Executive WhatsApp'] }
                ].map(({ title, events }) => (
                  <div key={title} className="p-3.5 rounded-2xl bg-slate-50/70 border border-black/[0.06] space-y-1.5">
                    <p className="font-semibold text-slate-900 font-mono text-[11px] uppercase tracking-wider">{title}</p>
                    <ul className="text-slate-600 space-y-1">
                      {events.map((ev) => (
                        <li key={ev} className="flex items-center gap-1.5 text-[11px]">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CONFIGURATION & CREDENTIALS */}
      {/* ============================================================== */}
      {activeSubTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="liquid-glass rounded-3xl p-8 border border-black/[0.08] bg-white/70 shadow-sm space-y-6 max-w-4xl">
          <div>
            <h4 className="font-instrument italic text-2xl text-slate-950">Meta Cloud API Credentials & Settings</h4>
            <p className="text-slate-500 text-xs mt-1">
              Configure credentials from your Meta Business Manager and Meta Developer Console.
              Tokens are encrypted at rest and never echoed in client responses.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-2">
            {/* Toggles */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-black/[0.06] flex items-center justify-between">
              <div>
                <p className="text-slate-900 text-sm font-semibold">Enable Automation</p>
                <p className="text-slate-500 text-xs">Allow automatic WhatsApp message transmission</p>
              </div>
              <input
                type="checkbox"
                checked={configForm.is_enabled}
                onChange={(e) => setConfigForm({ ...configForm, is_enabled: e.target.checked })}
                className="w-5 h-5 accent-black cursor-pointer rounded"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-black/[0.06] flex items-center justify-between">
              <div>
                <p className="text-slate-900 text-sm font-semibold">Test Mode (Simulation)</p>
                <p className="text-slate-500 text-xs">Logs mock delivery without Meta API charges</p>
              </div>
              <input
                type="checkbox"
                checked={configForm.test_mode}
                onChange={(e) => setConfigForm({ ...configForm, test_mode: e.target.checked })}
                className="w-5 h-5 accent-black cursor-pointer rounded"
              />
            </div>

            {/* Meta IDs */}
            <div>
              <label className="block text-slate-700 text-xs font-mono uppercase mb-2">WhatsApp Phone Number ID *</label>
              <input
                type="text"
                value={configForm.phone_number_id}
                onChange={(e) => setConfigForm({ ...configForm, phone_number_id: e.target.value })}
                placeholder="e.g. 105938472910482"
                className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-slate-900 text-sm placeholder-slate-400 focus:border-black/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-mono uppercase mb-2">WhatsApp Business Account (WABA) ID</label>
              <input
                type="text"
                value={configForm.waba_id}
                onChange={(e) => setConfigForm({ ...configForm, waba_id: e.target.value })}
                placeholder="e.g. 948372619401823"
                className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-slate-900 text-sm placeholder-slate-400 focus:border-black/30 focus:outline-none"
              />
            </div>

            {/* Access Token */}
            <div className="sm:col-span-2">
              <label className="block text-slate-700 text-xs font-mono uppercase mb-2">
                System User Permanent Access Token {config?.has_access_token && <span className="text-emerald-600 font-semibold">(Configured: {config.access_token_masked})</span>}
              </label>
              <input
                type="password"
                value={configForm.access_token}
                onChange={(e) => setConfigForm({ ...configForm, access_token: e.target.value })}
                placeholder={config?.has_access_token ? "Leave blank to preserve existing token, or paste new token..." : "EAAG... Permanent System User Token"}
                className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-slate-900 text-sm placeholder-slate-400 focus:border-black/30 focus:outline-none"
              />
            </div>

            {/* Webhook Verification & App Secret */}
            <div>
              <label className="block text-slate-700 text-xs font-mono uppercase mb-2">Webhook Verify Token</label>
              <input
                type="text"
                value={configForm.webhook_verify_token}
                onChange={(e) => setConfigForm({ ...configForm, webhook_verify_token: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-slate-900 text-sm font-mono focus:border-black/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-mono uppercase mb-2">
                Meta App Secret {config?.has_app_secret && <span className="text-emerald-600 font-semibold">(Configured)</span>}
              </label>
              <input
                type="password"
                value={configForm.app_secret}
                onChange={(e) => setConfigForm({ ...configForm, app_secret: e.target.value })}
                placeholder="For X-Hub-Signature-256 HMAC verification..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-slate-900 text-sm placeholder-slate-400 focus:border-black/30 focus:outline-none"
              />
            </div>

            {/* Business Notification Phone */}
            <div>
              <label className="block text-slate-700 text-xs font-mono uppercase mb-2">Business Notification Phone (E.164)</label>
              <input
                type="text"
                value={configForm.business_phone_number}
                onChange={(e) => setConfigForm({ ...configForm, business_phone_number: e.target.value })}
                placeholder="+919400900000"
                className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-slate-900 text-sm focus:border-black/30 focus:outline-none"
              />
            </div>

            {/* Delivery ETA Change Threshold */}
            <div>
              <label className="block text-slate-700 text-xs font-mono uppercase mb-2">ETA Change Notification Threshold (Minutes)</label>
              <input
                type="number"
                min="5"
                max="1440"
                value={configForm.delivery_eta_threshold_minutes}
                onChange={(e) => setConfigForm({ ...configForm, delivery_eta_threshold_minutes: parseInt(e.target.value) || 30 })}
                className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-slate-900 text-sm focus:border-black/30 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-black/10 flex justify-end">
            <button
              type="submit"
              className="px-7 py-3 rounded-full bg-black text-white text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
            >
              Save WhatsApp Configuration
            </button>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* 3. APPROVED TEMPLATES CATALOG */}
      {/* ============================================================== */}
      {activeSubTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-instrument italic text-2xl text-slate-950">Meta Approved Message Templates</h4>
              <p className="text-slate-500 text-xs">Pre-approved enterprise message templates mapped to business events.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {templates.map((t) => (
              <div key={t.id} className="liquid-glass rounded-2xl p-5 border border-black/[0.08] bg-white/70 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-950 text-sm">{t.display_name}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t.approval_status}
                      </span>
                    </div>
                    <p className="text-slate-400 font-mono text-[11px] mt-0.5">Trigger: {t.event_trigger}</p>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-black/5">
                    {t.category} • {t.language}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/80 border border-black/[0.06] text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed">
                  {t.body_text}
                </div>

                {t.variables && t.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {t.variables.map((v) => (
                      <span key={v} className="px-2 py-0.5 rounded-md bg-white border border-black/10 text-[10px] font-mono text-slate-600">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MESSAGE AUDIT HISTORY */}
      {/* ============================================================== */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="liquid-glass rounded-2xl p-4 border border-black/[0.08] bg-white/70 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[220px]">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') loadMessages(); }}
                placeholder="Search by masked phone, name, or event..."
                className="w-full text-xs bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 rounded-xl liquid-glass border border-black/10 text-xs text-slate-800 bg-white focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="delivered">Delivered</option>
                <option value="read">Read</option>
                <option value="sent">Sent</option>
                <option value="simulated_sent">Simulated</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={eventFilter}
                onChange={(e) => { setEventFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 rounded-xl liquid-glass border border-black/10 text-xs text-slate-800 bg-white focus:outline-none"
              >
                <option value="">All Events</option>
                <option value="order_created">Order Created</option>
                <option value="order_confirmed">Order Confirmed</option>
                <option value="order_dispatched">Order Dispatched</option>
                <option value="order_delivered">Order Delivered</option>
                <option value="invoice_generated">Invoice Generated</option>
                <option value="payment_reminder">Payment Reminder</option>
                <option value="payment_received">Payment Received</option>
                <option value="contact_inquiry">Contact Lead</option>
              </select>
              <button
                onClick={loadMessages}
                className="px-4 py-1.5 rounded-xl bg-black text-white text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="liquid-glass rounded-3xl border border-black/[0.08] bg-white/70 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/10 bg-slate-50/50 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Event Trigger</th>
                    <th className="py-3 px-4">Template</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {messages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                        No WhatsApp message logs matching the current criteria.
                      </td>
                    </tr>
                  ) : (
                    messages.map((m) => {
                      const isSim = m.status === 'simulated_sent';
                      const isDelivered = m.status === 'delivered' || m.status === 'read';
                      const isFailed = m.status === 'failed';

                      return (
                        <tr key={m.id} className="hover:bg-black/[0.02] transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                            {m.created_at ? new Date(m.created_at).toLocaleString() : '—'}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-900">{m.recipient_name || 'Customer'}</p>
                            <p className="font-mono text-slate-400 text-[11px]">{m.recipient_phone_masked}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                              {m.event_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {m.template_name || 'custom_text'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
                              isDelivered
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isSim
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : isFailed
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-sky-50 text-sky-700 border-sky-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isDelivered ? 'bg-emerald-500' : isSim ? 'bg-amber-500' : isFailed ? 'bg-rose-500' : 'bg-sky-500'
                              }`} />
                              <span>{m.status.toUpperCase()}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => setViewLog(m)}
                              className="px-2.5 py-1 rounded-lg liquid-glass border border-black/10 text-slate-700 hover:text-black text-[11px]"
                            >
                              Inspect
                            </button>
                            {isFailed && (
                              <button
                                onClick={() => handleRetryMessage(m.id)}
                                className="px-2.5 py-1 rounded-lg bg-black text-white text-[11px] hover:bg-slate-800"
                              >
                                Retry
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-black/10 text-xs">
                <p className="text-slate-500 font-mono">Page {currentPage} of {totalPages} ({totalMessages} records)</p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-lg liquid-glass border border-black/10 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 rounded-lg liquid-glass border border-black/10 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TEST MESSAGE SENDER MODAL */}
      {/* ============================================================== */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="liquid-glass rounded-3xl p-6 border border-black/15 bg-white shadow-2xl max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <Send size={16} className="text-slate-800" />
                <h4 className="font-instrument italic text-xl text-slate-950">WhatsApp Integration Test Console</h4>
              </div>
              <button
                onClick={() => setTestModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-black hover:bg-black/5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendTestMessage} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-mono uppercase mb-1.5">Recipient Phone Number (with Country Code) *</label>
                <input
                  type="text"
                  required
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-black/10 text-slate-900 text-sm focus:border-black/30 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTestMessageType('template')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    testMessageType === 'template'
                      ? 'bg-black text-white border-black font-semibold'
                      : 'liquid-glass text-slate-600 border-black/10 hover:bg-slate-50'
                  }`}
                >
                  Approved Template
                </button>
                <button
                  type="button"
                  onClick={() => setTestMessageType('text')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    testMessageType === 'text'
                      ? 'bg-black text-white border-black font-semibold'
                      : 'liquid-glass text-slate-600 border-black/10 hover:bg-slate-50'
                  }`}
                >
                  Direct Session Text
                </button>
              </div>

              {testMessageType === 'template' ? (
                <div>
                  <label className="block text-slate-700 text-xs font-mono uppercase mb-1.5">Select Approved Template</label>
                  <select
                    value={testTemplate}
                    onChange={(e) => setTestTemplate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-black/10 text-slate-900 text-xs focus:border-black/30 focus:outline-none"
                  >
                    {templates.map((t) => (
                      <option key={t.template_name} value={t.template_name}>
                        {t.display_name} ({t.template_name})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-700 text-xs font-mono uppercase mb-1.5">Message Body Text</label>
                  <textarea
                    rows={3}
                    required
                    value={testCustomText}
                    onChange={(e) => setTestCustomText(e.target.value)}
                    placeholder="Hello from RMVS WebServices WhatsApp Automation test console!"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-black/10 text-slate-900 text-xs focus:border-black/30 focus:outline-none resize-none"
                  />
                </div>
              )}

              {testResult && (
                <div className={`p-3.5 rounded-xl text-xs font-mono border ${
                  testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <p className="font-semibold">{testResult.success ? '✓ Transmission Successful' : '✗ Transmission Failed'}</p>
                  {testResult.simulated && <p className="text-[11px] text-emerald-700 mt-1">Delivered via Test Engine Simulation.</p>}
                  {testResult.provider_message_id && <p className="text-[10px] opacity-75 mt-0.5">ID: {testResult.provider_message_id}</p>}
                  {testResult.error_message && <p className="text-[11px] text-rose-700 mt-1">{testResult.error_message}</p>}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2 rounded-full liquid-glass border border-black/10 text-slate-700 text-xs"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={testSending}
                  className="px-6 py-2 rounded-full bg-black text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {testSending ? 'Sending...' : 'Dispatch Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MESSAGE INSPECTOR MODAL */}
      {/* ============================================================== */}
      {viewLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="liquid-glass rounded-3xl p-6 border border-black/15 bg-white shadow-2xl max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h4 className="font-instrument italic text-xl text-slate-950">WhatsApp Transmission Details</h4>
              <button
                onClick={() => setViewLog(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-black hover:bg-black/5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-400 block">Recipient</span>
                  <span className="font-semibold text-slate-800">{viewLog.recipient_name || 'Customer'}</span>
                  <span className="text-slate-500 block">{viewLog.recipient_phone_masked}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-400 block">Status</span>
                  <span className="font-semibold text-slate-800 uppercase">{viewLog.status}</span>
                  <span className="text-slate-500 block">Retries: {viewLog.retry_count} / {viewLog.max_retries}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase block mb-1">Rendered Message Body</span>
                <div className="p-3 rounded-xl bg-slate-50 border border-black/[0.06] text-slate-800 whitespace-pre-line leading-relaxed">
                  {viewLog.rendered_body || '—'}
                </div>
              </div>

              {viewLog.error_message && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="font-semibold block">Error [{viewLog.error_code}]:</span>
                  <span>{viewLog.error_message}</span>
                </div>
              )}

              {viewLog.provider_message_id && (
                <p className="text-[10px] text-slate-400">Meta WAMID: {viewLog.provider_message_id}</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewLog(null)}
                className="px-5 py-2 rounded-full bg-black text-white text-xs font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
