'use client';

import React, { useState, useEffect } from 'react';
import { CRMContact, ContactCategory, VIPLevel, TierColor } from '@/lib/types';
import { X, Save, Trash2, Users, ShieldCheck } from 'lucide-react';
import { useToast } from './ui/Toast';

interface EditContactModalProps {
  contact: CRMContact | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: CRMContact) => void;
  onDelete?: (id: string) => void;
}

export default function EditContactModal({
  contact,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EditContactModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<Partial<CRMContact>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    }
  }, [contact]);

  if (!isOpen || !contact) return null;

  const handleChange = (field: keyof CRMContact, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Strip metadata, created_at, updated_at to ensure clean DB query
      const { id, created_at, updated_at, ...cleanUpdates } = formData;

      const res = await fetch('/api/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contact.id, ...cleanUpdates }),
      });
      const data = await res.json();
      if (data.success) {
        onSave(data.data);
        showToast(`Updated ${data.data.full_name}`);
        onClose();
      } else {
        showToast(data.error || 'Failed to update contact', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="h-14 px-4 sm:px-6 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-[#fafafa]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Edit VIP / Press Contact</h2>
              <p className="text-[11px] text-zinc-500">{contact.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete ${contact.full_name}?`)) {
                    onDelete(contact.id);
                    onClose();
                  }
                }}
                className="text-zinc-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                title="Delete Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.full_name || ''}
              onChange={(e) => handleChange('full_name', e.target.value)}
              className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium"
            />
          </div>

          {/* Classification & Level Matrix */}
          <div className="p-3.5 rounded-xl bg-zinc-50/80 border border-zinc-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
                <span>Purchase Power & Tier Classification</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Upgrade / Downgrade</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* VIP Level */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">Purchase Power Tier</label>
                <select
                  value={formData.vip_level || 'Level 2'}
                  onChange={(e) => handleChange('vip_level', e.target.value as VIPLevel)}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-sm"
                >
                  <option value="Level 1">Level 1 (Highest Purchase Power / VIP)</option>
                  <option value="Level 2">Level 2 (High Purchase / Repeat Buyer)</option>
                  <option value="Level 3">Level 3 (Mid Purchase / Engaged Waitlist)</option>
                  <option value="Level 4">Level 4 (Standard / Scouted)</option>
                </select>
              </div>

              {/* Health / Connection Color */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">Relationship Health / Color</label>
                <select
                  value={formData.tier_color || 'Green'}
                  onChange={(e) => handleChange('tier_color', e.target.value as TierColor)}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-sm"
                >
                  <option value="Green">🟢 Green (Hot / Strong Connection)</option>
                  <option value="Yellow">🟡 Yellow (Warm / High Potential)</option>
                  <option value="Damper">🟠 Damper (Amber / Needs Follow-up)</option>
                  <option value="Red">🔴 Red (Cold / Inactive)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category, Status, Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">Category</label>
              <select
                value={formData.category || 'VIP Waitlist'}
                onChange={(e) => handleChange('category', e.target.value as ContactCategory)}
                className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {['VIP Waitlist', 'Early Access', 'Press/Media', 'Fitness Coach', 'Community Leader'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">Status</label>
              <select
                value={formData.status || 'Active'}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {['Active', 'VIP Invited', 'Waitlist Confirmed', 'Press Kit Sent'].map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">Acquisition Source</label>
              <input
                type="text"
                placeholder="e.g. Instagram Inbound"
                value={formData.source || ''}
                onChange={(e) => handleChange('source', e.target.value)}
                className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>

          {/* Contact Details: Email, Phone, City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+91..."
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">City / Location</label>
              <input
                type="text"
                placeholder="Mumbai, Bengaluru..."
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>

          {/* Full Complete Delivery Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-zinc-700">Complete Delivery / Residential Address</label>
              <span className="text-[10px] text-zinc-400 font-mono">Dispatches & Gifting</span>
            </div>
            <textarea
              rows={2}
              placeholder="Flat/Building, Street Name, Landmark, City, State, PIN code..."
              value={formData.full_address || ''}
              onChange={(e) => handleChange('full_address', e.target.value)}
              className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-700 mb-1">Notes & Pre-Order Preferences</label>
            <textarea
              rows={2}
              placeholder="Activewear preferences, sizing hints, connection notes..."
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
