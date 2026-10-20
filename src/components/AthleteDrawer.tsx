'use client';

import React, { useState, useEffect } from 'react';
import { AthleteCreator, SeedingStage } from '@/lib/types';
import {
  X,
  Instagram,
  Package,
  Ruler,
  Truck,
  Award,
  Trash2,
  Save,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

interface AthleteDrawerProps {
  athlete: AthleteCreator | null;
  onClose: () => void;
  onSave: (updated: Partial<AthleteCreator>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function AthleteDrawer({ athlete, onClose, onSave, onDelete }: AthleteDrawerProps) {
  const [formData, setFormData] = useState<Partial<AthleteCreator>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (athlete) {
      setFormData(athlete);
    }
  }, [athlete]);

  if (!athlete) return null;

  const handleChange = (field: keyof AthleteCreator, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${athlete.handle}?`)) {
      setIsDeleting(true);
      try {
        await onDelete(athlete.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Surface */}
      <div className="w-[520px] bg-white h-full shadow-drawer border-l border-[#e4e4e7] flex flex-col animate-slide-in">
        {/* Drawer Header */}
        <div className="h-14 px-6 border-b border-[#e4e4e7] flex items-center justify-between shrink-0 bg-[#fafafa]">
          <div className="flex items-center gap-2.5">
            <Instagram className="w-5 h-5 text-pink-600" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#09090b]">{formData.handle}</span>
                <a
                  href={`https://instagram.com/${(formData.handle || '').replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-zinc-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="text-[11px] text-[#71717a]">{formData.full_name}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              title="Delete Athlete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Pipeline Stage Quick Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-[#71717a] uppercase tracking-wider mb-2">
              Seeding Pipeline Stage
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-[#f4f4f5] p-1 rounded-lg border border-[#e4e4e7]">
              {(['scouted', 'contacted', 'sizing_confirmed', 'kit_shipped', 'post_live', 'ambassador'] as SeedingStage[]).map(
                (st) => {
                  const isSelected = formData.stage === st;
                  const labels: Record<SeedingStage, string> = {
                    scouted: 'Scouted',
                    contacted: 'Pitch Sent',
                    sizing_confirmed: 'Sizing OK',
                    kit_shipped: 'Shipped',
                    post_live: 'Post Live 🚀',
                    ambassador: 'Ambassador',
                  };
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleChange('stage', st)}
                      className={`py-1.5 px-2 text-[11px] font-medium rounded transition-all ${
                        isSelected
                          ? 'bg-white text-[#09090b] shadow-subtle font-semibold'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      {labels[st]}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Sizing Matrix Card */}
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
            <div className="flex items-center gap-2 text-zinc-900 font-semibold text-xs">
              <Ruler className="w-4 h-4 text-amber-600" />
              <span>Activewear Sizing Matrix</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Top / Tee Size</label>
                <select
                  value={formData.top_size || 'S'}
                  onChange={(e) => handleChange('top_size', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1 text-xs font-mono font-medium"
                >
                  {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Sports Bra Size</label>
                <input
                  type="text"
                  placeholder="e.g. 34B, 32C, N/A"
                  value={formData.sports_bra_size || ''}
                  onChange={(e) => handleChange('sports_bra_size', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1 text-xs font-mono font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Legging / Bottom Size</label>
                <select
                  value={formData.bottom_size || 'S'}
                  onChange={(e) => handleChange('bottom_size', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1 text-xs font-mono font-medium"
                >
                  {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Inseam / Cut</label>
                <input
                  type="text"
                  placeholder='e.g. 25" 7/8th, 28" Full, 5" Short'
                  value={formData.inseam_length || ''}
                  onChange={(e) => handleChange('inseam_length', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1 text-xs font-mono font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Colorway Preferences</label>
              <input
                type="text"
                placeholder="e.g. Midnight Black, Cardamom, Earth Tones"
                value={formData.preferred_colors || ''}
                onChange={(e) => handleChange('preferred_colors', e.target.value)}
                className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1 text-xs"
              />
            </div>
          </div>

          {/* Fulfillment & Shipping Card */}
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
            <div className="flex items-center gap-2 text-zinc-900 font-semibold text-xs">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span>Gifting Fulfillment & Courier</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Target Drop</label>
                <input
                  type="text"
                  value={formData.target_drop || 'Drop 1'}
                  onChange={(e) => handleChange('target_drop', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Courier Partner</label>
                <select
                  value={formData.courier_partner || 'Blue Dart'}
                  onChange={(e) => handleChange('courier_partner', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1 text-xs"
                >
                  {['Blue Dart', 'Delhivery', 'DHL Express', 'DTDC'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Tracking Number / AWB</label>
              <input
                type="text"
                placeholder="e.g. BD-78921039"
                value={formData.tracking_number || ''}
                onChange={(e) => handleChange('tracking_number', e.target.value)}
                className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Shipping Address</label>
              <textarea
                rows={2}
                placeholder="Full delivery address with pincode"
                value={formData.shipping_address || ''}
                onChange={(e) => handleChange('shipping_address', e.target.value)}
                className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1.5 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91..."
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Email Address</label>
                <input
                  type="email"
                  placeholder="creator@..."
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Social Content & Discount Code */}
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
            <div className="flex items-center gap-2 text-zinc-900 font-semibold text-xs">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Content & Conversion Tracking</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Discount Code</label>
                <input
                  type="text"
                  placeholder="e.g. AANYA15"
                  value={formData.discount_code || ''}
                  onChange={(e) => handleChange('discount_code', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Follower Tier</label>
                <select
                  value={formData.follower_tier || 'Micro (10k-50k)'}
                  onChange={(e) => handleChange('follower_tier', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1 text-xs"
                >
                  {['Nano (<10k)', 'Micro (10k-50k)', 'Mid (50k-250k)', 'Macro (250k+)'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Live Post / Reel URL</label>
              <input
                type="url"
                placeholder="https://instagram.com/reel/..."
                value={formData.post_url || ''}
                onChange={(e) => handleChange('post_url', e.target.value)}
                className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1 text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Internal Notes & Feedback</label>
              <textarea
                rows={2}
                placeholder="Fabric handfeel feedback, stretch comment, styling notes..."
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1.5 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="h-14 px-6 border-t border-[#e4e4e7] flex items-center justify-end gap-3 shrink-0 bg-white">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md border border-[#e4e4e7] text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-semibold rounded-md shadow-subtle transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
