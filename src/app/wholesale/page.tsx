'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TopBar from '@/components/TopBar';
import CommandPalette from '@/components/CommandPalette';
import { WholesaleAccount, WholesaleStage, StudioAccountType } from '@/lib/types';
import {
  Building2,
  MapPin,
  Trash2,
  Save,
  X,
  TrendingUp,
  Package,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const STAGES: { key: WholesaleStage; label: string; dotColor: string }[] = [
  { key: 'lead_pitch', label: 'Lead / Pitch', dotColor: 'bg-zinc-400' },
  { key: 'lookbook_sent', label: 'Lookbook Sent', dotColor: 'bg-blue-500' },
  { key: 'sample_kit_sent', label: 'Fit Kit Sent', dotColor: 'bg-amber-500' },
  { key: 'po_received', label: 'PO Placed 📦', dotColor: 'bg-indigo-500' },
  { key: 'active_partner', label: 'Active Partner ✨', dotColor: 'bg-emerald-500' },
];

export default function WholesalePage() {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<WholesaleAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<WholesaleAccount | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/wholesale');
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      return (
        !searchTerm ||
        a.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [accounts, searchTerm]);

  const handleUpdateStage = async (id: string, newStage: WholesaleStage) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, stage: newStage } : a))
    );

    try {
      await fetch('/api/wholesale', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stage: newStage }),
      });
      showToast(`Updated studio pipeline stage`);
    } catch (err) {
      console.error('Failed to update stage:', err);
      fetchAccounts();
    }
  };

  const handleSaveAccount = async (updated: Partial<WholesaleAccount>) => {
    if (!updated.id) return;
    setAccounts((prev) =>
      prev.map((a) => (a.id === updated.id ? ({ ...a, ...updated } as WholesaleAccount) : a))
    );
    setSelectedAccount((prev) => (prev ? ({ ...prev, ...updated } as WholesaleAccount) : null));

    try {
      await fetch('/api/wholesale', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      showToast(`Saved ${updated.business_name}`);
    } catch (err) {
      console.error('Failed to save account:', err);
      fetchAccounts();
    }
  };

  const handleDeleteAccount = async (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setSelectedAccount(null);

    try {
      await fetch(`/api/wholesale?id=${id}`, { method: 'DELETE' });
      showToast(`Deleted wholesale account`, 'info');
    } catch (err) {
      console.error('Failed to delete account:', err);
      fetchAccounts();
    }
  };

  const totalPipelineValue = accounts.reduce((acc, a) => acc + Number(a.estimated_order_value || 0), 0);
  const totalActivePartners = accounts.filter((a) => a.stage === 'active_partner' || a.stage === 'po_received').length;

  return (
    <div className="flex flex-col h-full bg-[#fbfbfb]">
      <TopBar
        title="Wholesale Studios"
        subtitle="Studio accounts, stockists & bulk orders"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewClick={() => setIsNewModalOpen(true)}
        newButtonLabel="+ Add Studio"
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-xs text-[#71717a] gap-2">
          <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <span>Loading wholesale pipeline...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto p-3 sm:p-5 md:p-6 pb-24 md:pb-6 touch-pan-x">
          <div className="flex gap-4 min-w-[1100px] sm:min-w-[1240px] h-full items-start">
            {STAGES.map((col) => {
              const colAccounts = filteredAccounts.filter((a) => a.stage === col.key);
              const colValue = colAccounts.reduce((acc, a) => acc + Number(a.estimated_order_value || 0), 0);

              return (
                <div
                  key={col.key}
                  className="w-72 shrink-0 flex flex-col rounded-2xl"
                >
                  {/* Minimal Column Header */}
                  <div className="pb-3 px-1 flex items-center justify-between border-b border-zinc-200/80 mb-3">
                    <span className="text-xs font-semibold text-zinc-900 tracking-tight">
                      {col.label}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-zinc-500">
                      ₹{colValue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-3 min-h-[480px] max-h-[calc(100vh-170px)] overflow-y-auto pr-1">
                    {colAccounts.map((account) => (
                      <div
                        key={account.id}
                        onClick={() => setSelectedAccount(account)}
                        className="p-4 rounded-xl bg-white border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-zinc-400/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] cursor-pointer transition-all select-none group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
                            {account.business_name}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {account.account_type.split(' ')[0]}
                          </span>
                        </div>

                        <div className="text-[11px] text-zinc-500 mb-3 truncate">
                          {account.location} • Buyer: {account.contact_name}
                        </div>

                        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-zinc-400">Target Value</span>
                          <span className="font-mono font-bold text-zinc-900">
                            ₹{Number(account.estimated_order_value).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}

                    {colAccounts.length === 0 && (
                      <div className="h-32 border border-dashed border-zinc-200/80 rounded-xl flex items-center justify-center text-[11px] text-zinc-400">
                        No studios in stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Ticker */}
      <div className="h-10 px-6 bg-white border-t border-[#e4e4e7] flex items-center justify-between text-xs text-[#71717a] shrink-0 select-none">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-zinc-600" />
            <span>
              Total Studios: <strong className="text-[#09090b] font-semibold">{accounts.length}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Total Pipeline Value:{' '}
              <strong className="text-emerald-900 font-semibold font-mono">
                ₹{totalPipelineValue.toLocaleString('en-IN')}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              Active Partners & POs:{' '}
              <strong className="text-indigo-900 font-semibold">{totalActivePartners}</strong>
            </span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-[#a1a1aa]">
          Press ⌘K for Command Bar
        </div>
      </div>

      {/* Slide-over Drawer for Wholesale Account */}
      {selectedAccount && (
        <WholesaleDrawer
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onSave={handleSaveAccount}
          onDelete={handleDeleteAccount}
        />
      )}

      {/* New Studio Modal */}
      {isNewModalOpen && (
        <NewWholesaleModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onCreated={(newAcc) => {
            setAccounts((prev) => [newAcc, ...prev]);
            setSelectedAccount(newAcc);
            showToast(`Added ${newAcc.business_name} to wholesale pipeline`);
          }}
        />
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}

function WholesaleDrawer({
  account,
  onClose,
  onSave,
  onDelete,
}: {
  account: WholesaleAccount;
  onClose: () => void;
  onSave: (updated: Partial<WholesaleAccount>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [formData, setFormData] = useState<Partial<WholesaleAccount>>(account);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(account);
  }, [account]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleChange = (field: keyof WholesaleAccount, value: any) => {
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
      <div className="flex-1" onClick={onClose} />
      <div className="w-full sm:w-[480px] md:w-[520px] max-w-full bg-white h-full shadow-drawer border-l border-[#e4e4e7] flex flex-col animate-slide-in">
        <div className="h-16 px-4 sm:px-6 border-b border-[#e4e4e7] flex items-center justify-between shrink-0 bg-[#fafafa]">
          <div>
            <div className="font-bold text-sm text-[#09090b]">{formData.business_name}</div>
            <div className="text-[11px] text-[#71717a] font-medium">
              {formData.account_type} • {formData.location}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => confirm(`Delete ${account.business_name}?`) && onDelete(account.id)}
              className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-2">
              Pipeline Stage
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#f4f4f5] p-1.5 rounded-lg border border-[#e4e4e7]">
              {(['lead_pitch', 'lookbook_sent', 'sample_kit_sent', 'po_received', 'active_partner'] as WholesaleStage[]).map(
                (st) => {
                  const isSelected = formData.stage === st;
                  const labels: Record<WholesaleStage, string> = {
                    lead_pitch: 'Lead / Pitch',
                    lookbook_sent: 'Lookbook Sent',
                    sample_kit_sent: 'Fit Kit Dispatched',
                    po_received: 'PO Placed 📦',
                    active_partner: 'Active Stockist ✨',
                  };
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleChange('stage', st)}
                      className={`py-1.5 px-2 text-[11px] font-semibold rounded-md transition-all ${
                        isSelected ? 'bg-white text-zinc-900 shadow-subtle' : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      {labels[st]}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
            <span className="block font-bold text-xs text-zinc-900">Commercial Deal Economics</span>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Estimated Order Value (₹)</label>
              <input
                type="number"
                value={formData.estimated_order_value || 0}
                onChange={(e) => handleChange('estimated_order_value', Number(e.target.value))}
                className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 font-mono font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Target Delivery Date</label>
              <input
                type="date"
                value={formData.target_delivery_date ? formData.target_delivery_date.slice(0, 10) : ''}
                onChange={(e) => handleChange('target_delivery_date', e.target.value)}
                className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-xs font-medium"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
            <span className="block font-bold text-xs text-zinc-900">Buyer Contact & Location</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Buyer Name</label>
                <input
                  type="text"
                  value={formData.contact_name || ''}
                  onChange={(e) => handleChange('contact_name', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-2.5 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Location / City</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-2.5 py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Contact Email</label>
                <input
                  type="email"
                  value={formData.contact_email || ''}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-2.5 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Contact Phone</label>
                <input
                  type="text"
                  value={formData.contact_phone || ''}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-2.5 py-1.5 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Notes & Assortment Preferences</label>
              <textarea
                rows={3}
                placeholder="Requested colorways, size curves (30% S, 40% M, 30% L), pro-shop display setup..."
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="mt-1 w-full bg-white border border-zinc-300 rounded-md px-2.5 py-1.5 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="h-16 px-4 sm:px-6 border-t border-[#e4e4e7] flex items-center justify-between shrink-0 bg-white">
          <div className="text-[11px] text-zinc-400 font-mono">ESC to close</div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 border border-[#e4e4e7] rounded-md text-xs font-medium text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-semibold rounded-md shadow-subtle disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Account'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewWholesaleModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (acc: WholesaleAccount) => void;
}) {
  const [businessName, setBusinessName] = useState('');
  const [accountType, setAccountType] = useState<StudioAccountType>('Pilates Studio');
  const [location, setLocation] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [estimatedOrderValue, setEstimatedOrderValue] = useState(150000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/wholesale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: businessName,
          account_type: accountType,
          location,
          contact_name: contactName,
          contact_email: contactEmail,
          estimated_order_value: estimatedOrderValue,
          stage: 'lead_pitch',
        }),
      });

      const data = await res.json();
      if (data.success) {
        onCreated(data.data);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md bg-white rounded-xl shadow-2xl border border-[#e4e4e7] overflow-hidden animate-slide-in max-h-[90vh] flex flex-col">
        <div className="h-12 px-4 sm:px-5 border-b border-[#e4e4e7] flex items-center justify-between bg-[#fafafa] shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-zinc-900" />
            <span className="font-bold text-xs text-[#09090b]">Add Wholesale Studio Account</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
          <div>
            <label className="block text-[11px] font-bold text-zinc-600 mb-1">Studio / Gym Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Reformer Club Mumbai"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-3 py-1.5 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">Account Type</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as StudioAccountType)}
                className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-2.5 py-1.5"
              >
                {['Pilates Studio', 'Yoga Studio', 'Boutique Gym', 'Multi-Brand Retailer'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">City / Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bandra, Mumbai"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-3 py-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">Buyer Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Maya Roy"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">Estimated Order (₹)</label>
              <input
                type="number"
                value={estimatedOrderValue}
                onChange={(e) => setEstimatedOrderValue(Number(e.target.value))}
                className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-3 py-1.5 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-600 mb-1">Buyer Email *</label>
            <input
              type="email"
              required
              placeholder="buyer@studiomumbai.in"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-3 py-1.5"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3.5 py-1.5 border border-[#e4e4e7] rounded-md text-zinc-600">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-white font-semibold rounded-md shadow-subtle disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Studio Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
