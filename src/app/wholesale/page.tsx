'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TopBar from '@/components/TopBar';
import { WholesaleAccount, WholesaleStage, StudioAccountType } from '@/lib/types';
import {
  Building2,
  Store,
  DollarSign,
  Calendar,
  X,
  Plus,
  Save,
  Trash2,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Package,
} from 'lucide-react';

const STAGES: { key: WholesaleStage; label: string; dotColor: string }[] = [
  { key: 'lead_pitch', label: 'Lead / Pitch', dotColor: 'bg-zinc-400' },
  { key: 'lookbook_sent', label: 'Lookbook Sent', dotColor: 'bg-blue-500' },
  { key: 'sample_kit_sent', label: 'Fit Kit Sent', dotColor: 'bg-amber-500' },
  { key: 'po_received', label: 'PO Placed 📦', dotColor: 'bg-indigo-500' },
  { key: 'active_partner', label: 'Active Partner ✨', dotColor: 'bg-emerald-500' },
];

export default function WholesalePage() {
  const [accounts, setAccounts] = useState<WholesaleAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<WholesaleAccount | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

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
        title="B2B Wholesale & Studio Pipeline"
        subtitle="Pilates, Yoga studios, and Gym pro-shop accounts"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewClick={() => setIsNewModalOpen(true)}
        newButtonLabel="+ Add Studio"
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-xs text-[#71717a]">
          Loading wholesale pipeline...
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 min-w-[1200px] h-full items-start">
            {STAGES.map((col) => {
              const colAccounts = filteredAccounts.filter((a) => a.stage === col.key);
              const colValue = colAccounts.reduce((acc, a) => acc + Number(a.estimated_order_value || 0), 0);

              return (
                <div
                  key={col.key}
                  className="w-72 shrink-0 flex flex-col rounded-lg bg-[#f4f4f5]/60 border border-[#e4e4e7]"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-[#e4e4e7] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                      <span className="text-xs font-semibold text-[#09090b]">{col.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono font-bold text-zinc-800">
                        ₹{colValue.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[9px] text-zinc-500">{colAccounts.length} accounts</div>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="p-2 space-y-2.5 min-h-[480px] max-h-[calc(100vh-170px)] overflow-y-auto">
                    {colAccounts.map((account) => (
                      <div
                        key={account.id}
                        onClick={() => setSelectedAccount(account)}
                        className="p-3.5 rounded-md bg-white border border-[#e4e4e7] shadow-card hover:border-[#a1a1aa] hover:shadow-md cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#09090b] group-hover:text-blue-600 transition-colors">
                            {account.business_name}
                          </span>
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                            {account.account_type.split(' ')[0]}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#71717a] flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          <span>{account.location}</span>
                        </div>

                        <div className="pt-2 border-t border-[#f4f4f5] flex items-center justify-between">
                          <div className="text-[11px] text-zinc-600">
                            Buyer: <strong className="font-medium text-zinc-900">{account.contact_name}</strong>
                          </div>
                          <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ₹{Number(account.estimated_order_value).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))}

                    {colAccounts.length === 0 && (
                      <div className="h-28 border border-dashed border-[#e4e4e7] rounded flex items-center justify-center text-[11px] text-[#a1a1aa]">
                        No studio deals
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
      <div className="h-10 px-6 bg-white border-t border-[#e4e4e7] flex items-center justify-between text-xs text-[#71717a] shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-zinc-600" />
            <span>Total Studios: <strong className="text-[#09090b] font-semibold">{accounts.length}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Total Pipeline Value: <strong className="text-emerald-900 font-semibold font-mono">₹{totalPipelineValue.toLocaleString('en-IN')}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-indigo-600" />
            <span>Active Partners & POs: <strong className="text-indigo-900 font-semibold">{totalActivePartners}</strong></span>
          </div>
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
          }}
        />
      )}
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm">
      <div className="flex-1" onClick={onClose} />
      <div className="w-[500px] bg-white h-full shadow-drawer border-l border-[#e4e4e7] flex flex-col animate-slide-in">
        <div className="h-14 px-6 border-b border-[#e4e4e7] flex items-center justify-between shrink-0 bg-[#fafafa]">
          <div>
            <div className="font-semibold text-sm text-[#09090b]">{formData.business_name}</div>
            <div className="text-[11px] text-[#71717a]">{formData.account_type} • {formData.location}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => confirm(`Delete ${account.business_name}?`) && onDelete(account.id)}
              className="p-1.5 text-zinc-400 hover:text-rose-600 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 uppercase mb-1.5">Pipeline Stage</label>
            <select
              value={formData.stage || 'lead_pitch'}
              onChange={(e) => handleChange('stage', e.target.value)}
              className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-3 py-2 text-xs font-semibold"
            >
              <option value="lead_pitch">Lead / Pitch</option>
              <option value="lookbook_sent">Lookbook Sent</option>
              <option value="sample_kit_sent">Fit Kit Dispatched</option>
              <option value="po_received">Purchase Order Placed 📦</option>
              <option value="active_partner">Active Wholesale Stockist ✨</option>
            </select>
          </div>

          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
            <span className="block font-semibold text-xs text-zinc-900">Commercial Deal Economics</span>
            <div>
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Estimated Order Value (₹)</label>
              <input
                type="number"
                value={formData.estimated_order_value || 0}
                onChange={(e) => handleChange('estimated_order_value', Number(e.target.value))}
                className="mt-1 w-full bg-white border border-zinc-300 rounded px-3 py-1.5 font-mono font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Target Delivery Date</label>
              <input
                type="date"
                value={formData.target_delivery_date ? formData.target_delivery_date.slice(0, 10) : ''}
                onChange={(e) => handleChange('target_delivery_date', e.target.value)}
                className="mt-1 w-full bg-white border border-zinc-300 rounded px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
            <span className="block font-semibold text-xs text-zinc-900">Buyer Contact & Location</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Buyer Name</label>
                <input
                  type="text"
                  value={formData.contact_name || ''}
                  onChange={(e) => handleChange('contact_name', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Location / City</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Contact Email</label>
                <input
                  type="email"
                  value={formData.contact_email || ''}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Contact Phone</label>
                <input
                  type="text"
                  value={formData.contact_phone || ''}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Notes & Assortment Preferences</label>
              <textarea
                rows={3}
                placeholder="Requested colorways, size curves (30% S, 40% M, 30% L), pro-shop display setup..."
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="mt-1 w-full bg-white border border-zinc-300 rounded px-2.5 py-1.5 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="h-14 px-6 border-t border-[#e4e4e7] flex items-center justify-end gap-3 shrink-0 bg-white">
          <button onClick={onClose} className="px-3.5 py-1.5 border border-[#e4e4e7] rounded-md text-xs font-medium text-zinc-600">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#e4e4e7] overflow-hidden animate-slide-in">
        <div className="h-12 px-5 border-b border-[#e4e4e7] flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-zinc-900" />
            <span className="font-semibold text-xs text-[#09090b]">Add Wholesale Studio Account</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Studio / Gym Name *</label>
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
              <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Account Type</label>
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
              <label className="block text-[11px] font-semibold text-zinc-600 mb-1">City / Location *</label>
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
              <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Buyer Name *</label>
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
              <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Estimated Order (₹)</label>
              <input
                type="number"
                value={estimatedOrderValue}
                onChange={(e) => setEstimatedOrderValue(Number(e.target.value))}
                className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-3 py-1.5 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Buyer Email *</label>
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
