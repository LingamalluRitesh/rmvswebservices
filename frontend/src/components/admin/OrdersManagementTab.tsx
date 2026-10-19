import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Send, ExternalLink, RefreshCw, ChevronRight
} from 'lucide-react';
import api from '../../api/client';

export interface OrderItem {
  id: number;
  order_number: string;
  client_id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  total_amount: number;
  currency: string;
  status: string;
  delivery_eta?: string;
  cancellation_reason?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface Props {
  showNotification: (msg: string, isError?: boolean) => void;
  onViewWhatsAppLogs: () => void;
}

export const OrdersManagementTab: React.FC<Props> = ({ showNotification, onViewWhatsAppLogs }) => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // New Order Modal State
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '+919876543210',
    service_type: 'Full-Stack Web Application',
    total_amount: 85000,
    currency: 'INR',
    delivery_eta_days: 7,
    notes: 'Enterprise platform with React, FastAPI and automated WhatsApp alerts.'
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eta = new Date();
      eta.setDate(eta.getDate() + (Number(newOrderForm.delivery_eta_days) || 5));

      const payload = {
        customer_name: newOrderForm.customer_name,
        customer_email: newOrderForm.customer_email,
        customer_phone: newOrderForm.customer_phone,
        service_type: newOrderForm.service_type,
        total_amount: Number(newOrderForm.total_amount),
        currency: newOrderForm.currency,
        delivery_eta: eta.toISOString(),
        notes: newOrderForm.notes
      };

      const res = await api.post('/orders', payload);
      showNotification(`Order ${res.data.order_number} created! WhatsApp notification dispatched.`);
      setIsNewOrderOpen(false);
      setNewOrderForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '+919876543210',
        service_type: 'Full-Stack Web Application',
        total_amount: 85000,
        currency: 'INR',
        delivery_eta_days: 7,
        notes: ''
      });
      loadOrders();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Failed to create order', true);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
        cancellation_reason: newStatus === 'cancelled' ? 'Client requested cancellation or scope revision.' : undefined
      });
      showNotification(`Order status updated to '${newStatus.toUpperCase()}'! WhatsApp notification dispatched to customer.`);
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        loadOrderDetails(orderId);
      }
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Failed to update order status', true);
    }
  };

  const loadOrderDetails = async (orderId: number) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setSelectedOrder(res.data);
    } catch (err) {
      console.error('Failed to load order details', err);
    }
  };

  const handleSendPaymentReminder = async (invoiceId: number) => {
    try {
      await api.post(`/invoices/${invoiceId}/remind`);
      showNotification('Payment reminder WhatsApp message dispatched to customer!');
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Failed to send reminder', true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-5">
        <div>
          <h3 className="font-instrument italic text-2xl text-slate-950">Orders, Invoicing & Delivery Milestones</h3>
          <p className="text-slate-500 text-xs mt-1">
            Updating an order or delivery automatically sends the corresponding approved WhatsApp notification to the customer.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewOrderOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus size={13} />
            <span>Create Order</span>
          </button>
          <button
            onClick={loadOrders}
            className="p-2 rounded-full liquid-glass border border-black/10 text-slate-700 hover:text-black"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Grid of Orders */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 space-y-4">
          {orders.length === 0 ? (
            <div className="liquid-glass rounded-3xl p-12 text-center border border-black/[0.08] bg-white/70">
              <Package size={32} className="mx-auto text-slate-400 mb-3" />
              <p className="text-slate-950 font-instrument italic text-xl">No Orders Yet</p>
              <p className="text-slate-500 text-xs mt-1">Create an order to initiate the automated WhatsApp lifecycle.</p>
            </div>
          ) : (
            orders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => loadOrderDetails(ord.id)}
                  className={`liquid-glass rounded-3xl p-6 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-black ring-1 ring-black bg-white shadow-md'
                      : 'border-black/[0.08] bg-white/70 hover:border-black/20 hover:bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.06] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-950">{ord.order_number}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-slate-100 text-slate-700">
                        {ord.status}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-900">
                      ₹{ord.total_amount?.toLocaleString()} {ord.currency}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 text-xs mb-4">
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-mono">Client</p>
                      <p className="font-medium text-slate-900 mt-0.5">{ord.customer_name}</p>
                      <p className="font-mono text-slate-500 text-[11px]">{ord.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-mono">Service Deliverable</p>
                      <p className="text-slate-800 line-clamp-1 mt-0.5">{ord.service_type}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-mono">ETA</p>
                      <p className="font-mono text-slate-800 mt-0.5">
                        {ord.delivery_eta ? new Date(ord.delivery_eta).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                  </div>

                  {/* Quick WhatsApp Action Triggers */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-black/[0.06]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">Trigger WhatsApp Event:</span>
                    {ord.status === 'created' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(ord.id, 'confirmed'); }}
                        className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold hover:bg-emerald-100 transition-colors"
                      >
                        ✓ Confirm Order
                      </button>
                    )}
                    {['created', 'confirmed'].includes(ord.status) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(ord.id, 'processing'); }}
                        className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-semibold hover:bg-blue-100 transition-colors"
                      >
                        ⚙ Start Processing
                      </button>
                    )}
                    {['confirmed', 'processing'].includes(ord.status) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(ord.id, 'packed'); }}
                        className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-semibold hover:bg-purple-100 transition-colors"
                      >
                        📦 Pack Order
                      </button>
                    )}
                    {['packed', 'processing'].includes(ord.status) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(ord.id, 'dispatched'); }}
                        className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold hover:bg-amber-100 transition-colors"
                      >
                        🚚 Dispatch Order
                      </button>
                    )}
                    {['dispatched', 'out_for_delivery'].includes(ord.status) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(ord.id, 'delivered'); }}
                        className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        ★ Mark Delivered
                      </button>
                    )}
                    {ord.status !== 'cancelled' && ord.status !== 'delivered' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(ord.id, 'cancelled'); }}
                        className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-semibold hover:bg-rose-100 transition-colors ml-auto"
                      >
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Order Detail Sidebar */}
        <div className="space-y-4">
          {selectedOrder ? (
            <div className="liquid-glass rounded-3xl p-6 border border-black/[0.08] bg-white shadow-sm space-y-5 sticky top-24">
              <div className="border-b border-black/10 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-instrument italic text-xl text-slate-950">{selectedOrder.order_number}</h4>
                  <p className="text-slate-400 font-mono text-[10px]">Lifecycle Management</p>
                </div>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold uppercase">
                  {selectedOrder.status}
                </span>
              </div>

              {/* Invoicing Section */}
              <div className="space-y-2">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Associated Invoices</p>
                {selectedOrder.invoices && selectedOrder.invoices.length > 0 ? (
                  selectedOrder.invoices.map((inv: any) => (
                    <div key={inv.id} className="p-3 rounded-2xl bg-slate-50 border border-black/[0.06] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900 font-mono">{inv.invoice_number}</p>
                        <p className="text-slate-500 font-mono text-[11px]">₹{inv.amount?.toLocaleString()} • {inv.status}</p>
                      </div>
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => handleSendPaymentReminder(inv.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black text-white text-[10px] font-medium hover:bg-slate-800"
                          title="Sends automated WhatsApp payment reminder"
                        >
                          <Send size={10} />
                          <span>Remind</span>
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No invoices generated.</p>
                )}
              </div>

              {/* Delivery Tracking Section */}
              {selectedOrder.delivery && (
                <div className="space-y-2 pt-2 border-t border-black/[0.06]">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Live Delivery Tracking</p>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-black/[0.06] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-900 font-semibold">{selectedOrder.delivery.tracking_number}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white border border-black/10">
                        {selectedOrder.delivery.status}
                      </span>
                    </div>
                    <a
                      href={selectedOrder.delivery.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-blue-600 hover:underline font-mono text-[11px]"
                    >
                      <span>Open Customer Live Tracking Page</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              )}

              {/* Audit Shortcut */}
              <div className="pt-2 border-t border-black/10">
                <button
                  onClick={onViewWhatsAppLogs}
                  className="w-full py-2.5 rounded-full liquid-glass border border-black/10 text-slate-800 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View WhatsApp Audit Trail</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="liquid-glass rounded-3xl p-8 border border-black/[0.08] bg-white/70 text-center text-slate-400 text-xs font-mono">
              Select an order from the list to view billing, tracking, and customer contact actions.
            </div>
          )}
        </div>
      </div>

      {/* CREATE ORDER MODAL */}
      {isNewOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="liquid-glass rounded-3xl p-6 border border-black/15 bg-white shadow-2xl max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h4 className="font-instrument italic text-xl text-slate-950">Create New Project Order</h4>
              <button
                onClick={() => setIsNewOrderOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-xs font-mono uppercase mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newOrderForm.customer_name}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, customer_name: e.target.value })}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-black/10 text-slate-900 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-xs font-mono uppercase mb-1">WhatsApp Phone (E.164) *</label>
                  <input
                    type="text"
                    required
                    value={newOrderForm.customer_phone}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, customer_phone: e.target.value })}
                    placeholder="+919876543210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-black/10 text-slate-900 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-mono uppercase mb-1">Customer Email *</label>
                <input
                  type="email"
                  required
                  value={newOrderForm.customer_email}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customer_email: e.target.value })}
                  placeholder="vikram@enterprise.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-black/10 text-slate-900 text-xs focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-xs font-mono uppercase mb-1">Service Deliverable *</label>
                  <input
                    type="text"
                    required
                    value={newOrderForm.service_type}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, service_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-black/10 text-slate-900 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-xs font-mono uppercase mb-1">Amount (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newOrderForm.total_amount}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, total_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-black/10 text-slate-900 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-mono uppercase mb-1">Notes / Scope Summary</label>
                <textarea
                  rows={2}
                  value={newOrderForm.notes}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-black/10 text-slate-900 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderOpen(false)}
                  className="px-4 py-2 rounded-full liquid-glass border border-black/10 text-slate-700 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-black text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Create &amp; Dispatch Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
