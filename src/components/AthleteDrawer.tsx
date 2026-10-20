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
  Copy,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useDrops } from '@/components/DropContext';

interface AthleteDrawerProps {
  athlete: AthleteCreator | null;
  onClose: () => void;
  onSave: (updated: Partial<AthleteCreator>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const COLORWAYS = [
  { name: 'Midnight Black', hex: '#18181b' },
  { name: 'Sage Green', hex: '#84a98c' },
  { name: 'Espresso', hex: '#4a3b32' },
  { name: 'Cardamom', hex: '#a3b18a' },
  { name: 'Terracotta', hex: '#bc6c25' },
  { name: 'Buttercream', hex: '#fefae0' },
];

export default function AthleteDrawer({ athlete, onClose, onSave, onDelete }: AthleteDrawerProps) {
  const { showToast } = useToast();
  const { drops } = useDrops();
  const [activeTab, setActiveTab] = useState<'sizing' | 'shipping' | 'roi'>('sizing');
  const [formData, setFormData] = useState<Partial<AthleteCreator>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (athlete) {
      setFormData(athlete);
    }
  }, [athlete]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && athlete) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [athlete, onClose]);

  if (!athlete) return null;

  const handleChange = (field: keyof AthleteCreator, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      showToast(`Saved ${formData.handle}'s profile`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${athlete.handle}?`)) {
      setIsDeleting(true);
      try {
        await onDelete(athlete.id);
        showToast(`Deleted ${athlete.handle}`, 'info');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard`);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm transition-opacity">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Surface */}
      <div className="w-[560px] bg-white h-full shadow-drawer border-l border-[#e4e4e7] flex flex-col animate-slide-in">
        {/* Drawer Header */}
        <div className="h-16 px-6 border-b border-[#e4e4e7] flex items-center justify-between shrink-0 bg-[#fafafa]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 p-0.5">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-xs text-zinc-900">
                <Instagram className="w-4 h-4 text-pink-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#09090b]">{formData.handle}</span>
                <a
                  href={`https://instagram.com/${(formData.handle || '').replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-zinc-700"
                  title="Open Instagram Profile"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {formData.follower_tier}
                </span>
              </div>
              <div className="text-[11px] text-[#71717a]">{formData.full_name} • {formData.niche}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Delete Athlete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 border-b border-[#e4e4e7] flex items-center gap-6 bg-white text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('sizing')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'sizing'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Sizing & Fit Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'shipping'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Fulfillment & Dispatch</span>
          </button>
          <button
            onClick={() => setActiveTab('roi')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'roi'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Content & ROI</span>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Target Drop Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider">
                Assigned Collection / Drop
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">Pipeline Scope</span>
            </div>
            <select
              value={formData.target_drop || 'Drop 1'}
              onChange={(e) => handleChange('target_drop', e.target.value)}
              className="w-full bg-[#fbfbfb] hover:bg-white border border-[#e4e4e7] rounded-lg px-3 py-2 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
            >
              {drops.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} {d.status === 'active' ? '• Active Live' : `• ${d.status}`}
                </option>
              ))}
            </select>
          </div>

          {/* Pipeline Stage Quick Bar */}
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
                      className={`py-1.5 px-2 text-[11px] font-semibold rounded-md transition-all ${
                        isSelected
                          ? 'bg-white text-[#09090b] shadow-subtle'
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

          {/* TAB 1: SIZING & FIT PROFILE */}
          {activeTab === 'sizing' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs">
                    <Ruler className="w-4 h-4 text-amber-600" />
                    <span>Activewear Garment Sizing</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Rivlet {formData.target_drop || 'Drop 1'} Spec</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Top / Tank Size</label>
                    <select
                      value={formData.top_size || 'S'}
                      onChange={(e) => handleChange('top_size', e.target.value)}
                      className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs font-mono font-bold"
                    >
                      {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Sports Bra Size</label>
                    <input
                      type="text"
                      placeholder="e.g. 34B, 32C, N/A"
                      value={formData.sports_bra_size || ''}
                      onChange={(e) => handleChange('sports_bra_size', e.target.value)}
                      className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs font-mono font-bold text-amber-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Legging / Bottom Size</label>
                    <select
                      value={formData.bottom_size || 'S'}
                      onChange={(e) => handleChange('bottom_size', e.target.value)}
                      className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs font-mono font-bold"
                    >
                      {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Inseam Cut / Length</label>
                    <input
                      type="text"
                      placeholder='e.g. 25" 7/8th, 28" Full, 5" Short'
                      value={formData.inseam_length || ''}
                      onChange={(e) => handleChange('inseam_length', e.target.value)}
                      className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Colorway Swatches */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase">
                  Preferred Colorways & Fabric Tones
                </span>
                <div className="flex flex-wrap gap-2">
                  {COLORWAYS.map((c) => {
                    const isSelected = (formData.preferred_colors || '').includes(c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          const current = formData.preferred_colors || '';
                          const next = isSelected
                            ? current.replace(c.name, '').replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '')
                            : current ? `${current}, ${c.name}` : c.name;
                          handleChange('preferred_colors', next);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                          isSelected
                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-subtle'
                            : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  placeholder="Custom notes on colorways..."
                  value={formData.preferred_colors || ''}
                  onChange={(e) => handleChange('preferred_colors', e.target.value)}
                  className="mt-2 w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 2: FULFILLMENT & SHIPPING */}
          {activeTab === 'shipping' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    <span>Courier Tracking & Logistics</span>
                  </div>
                  <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                    Drop 1 Gifting Kit
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Courier Partner</label>
                    <select
                      value={formData.courier_partner || 'Blue Dart'}
                      onChange={(e) => handleChange('courier_partner', e.target.value)}
                      className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs font-medium"
                    >
                      {['Blue Dart', 'Delhivery', 'DHL Express', 'DTDC'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">AWB Tracking #</label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        placeholder="BD-78921039"
                        value={formData.tracking_number || ''}
                        onChange={(e) => handleChange('tracking_number', e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded-md pl-3 pr-8 py-1.5 text-xs font-mono font-bold"
                      />
                      {formData.tracking_number && (
                        <button
                          onClick={() => copyToClipboard(formData.tracking_number!, 'Tracking Number')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                          title="Copy AWB"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Shipping Address</label>
                  <textarea
                    rows={2}
                    placeholder="Full residential / studio address..."
                    value={formData.shipping_address || ''}
                    onChange={(e) => handleChange('shipping_address', e.target.value)}
                    className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Phone (for Delivery OTP)</label>
                    <input
                      type="text"
                      placeholder="+91..."
                      value={formData.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Email Address</label>
                    <input
                      type="email"
                      placeholder="creator@..."
                      value={formData.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTENT & ROI */}
          {activeTab === 'roi' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Social Media Deliverables & Conversion</span>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    ROI Tracking
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Affiliate Discount Code</label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        placeholder="e.g. AANYA15"
                        value={formData.discount_code || ''}
                        onChange={(e) => handleChange('discount_code', e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded-md pl-3 pr-8 py-1.5 text-xs font-mono font-bold text-emerald-800"
                      />
                      {formData.discount_code && (
                        <button
                          onClick={() => copyToClipboard(formData.discount_code!, 'Discount Code')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Follower Audience Tier</label>
                    <select
                      value={formData.follower_tier || 'Micro (10k-50k)'}
                      onChange={(e) => handleChange('follower_tier', e.target.value)}
                      className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs font-medium"
                    >
                      {['Nano (<10k)', 'Micro (10k-50k)', 'Mid (50k-250k)', 'Macro (250k+)'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Live Reel / Post URL</label>
                  <div className="mt-1 relative">
                    <input
                      type="url"
                      placeholder="https://instagram.com/reel/..."
                      value={formData.post_url || ''}
                      onChange={(e) => handleChange('post_url', e.target.value)}
                      className="w-full bg-white border border-zinc-300 rounded-md pl-3 pr-8 py-1.5 text-xs text-blue-600 underline font-medium"
                    />
                    {formData.post_url && (
                      <a
                        href={formData.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Feedback on Fit, Fabric & Squat-Proof Test</label>
                  <textarea
                    rows={3}
                    placeholder="Athlete's verbatim feedback on 4-way stretch, breathability during workout..."
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Sticky Footer */}
        <div className="h-16 px-6 border-t border-[#e4e4e7] flex items-center justify-between shrink-0 bg-white">
          <div className="text-[11px] text-zinc-400 font-mono">
            ESC to close • ⌘S to save
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md border border-[#e4e4e7] text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-semibold rounded-md shadow-subtle transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
