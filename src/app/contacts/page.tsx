'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TopBar from '@/components/TopBar';
import CommandPalette from '@/components/CommandPalette';
import EditContactModal from '@/components/EditContactModal';
import { CRMContact, ContactCategory, VIPLevel, TierColor } from '@/lib/types';
import {
  Users,
  Trash2,
  Pencil,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  MapPin,
  Compass,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const CATEGORIES = [
  'All',
  'VIP Waitlist',
  'Press/Media',
  'Fitness Coach',
  'Community Leader',
];

const LEVEL_ORDER: VIPLevel[] = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];

type SortField =
  | 'full_name'
  | 'vip_level'
  | 'category'
  | 'source'
  | 'city'
  | 'full_address'
  | 'email'
  | 'phone'
  | 'status';

export default function ContactsPage() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('vip_level');
  const [sortAsc, setSortAsc] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      if (data.success) {
        setContacts(data.data);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredAndSortedContacts = useMemo(() => {
    const list = contacts.filter((c) => {
      const matchesSearch =
        !searchTerm ||
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.source && c.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.full_address && c.full_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.vip_level && c.vip_level.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || c.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    return [...list].sort((a, b) => {
      if (sortField === 'vip_level') {
        const rank: Record<string, number> = {
          'Level 1': 1,
          'Level 2': 2,
          'Level 3': 3,
          'Level 4': 4,
        };
        const rankA = rank[a.vip_level || 'Level 2'] || 99;
        const rankB = rank[b.vip_level || 'Level 2'] || 99;
        return sortAsc ? rankA - rankB : rankB - rankA;
      }

      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [contacts, searchTerm, selectedCategory, sortField, sortAsc]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete ${name}?`)) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      await fetch(`/api/contacts?id=${id}`, { method: 'DELETE' });
      showToast(`Deleted ${name}`, 'info');
    }
  };

  const handleSaveContact = (updated: CRMContact) => {
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Direct Level Change handler via dropdown
  const handleLevelChange = async (contactId: string, nextLevel: VIPLevel) => {
    const target = contacts.find((c) => c.id === contactId);
    if (!target || target.vip_level === nextLevel) return;

    // Optimistic UI update
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, vip_level: nextLevel } : c))
    );

    try {
      const res = await fetch('/api/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contactId, vip_level: nextLevel }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${target.full_name} updated to ${nextLevel}`, 'success');
      } else {
        fetchContacts();
        showToast('Failed to update level', 'error');
      }
    } catch {
      fetchContacts();
      showToast('Network error while updating level', 'error');
    }
  };

  // Helper for Health / Connection Color
  const getTierColorStyle = (color?: TierColor | string | null) => {
    switch (color) {
      case 'Green':
        return {
          dot: 'bg-emerald-500 ring-2 ring-emerald-200',
          label: 'Green (Hot)',
        };
      case 'Yellow':
        return {
          dot: 'bg-amber-400 ring-2 ring-amber-200',
          label: 'Yellow (Warm)',
        };
      case 'Damper':
        return {
          dot: 'bg-orange-500 ring-2 ring-orange-200',
          label: 'Damper (Follow-up)',
        };
      case 'Red':
        return {
          dot: 'bg-rose-500 ring-2 ring-rose-200',
          label: 'Red (Cold)',
        };
      default:
        return {
          dot: 'bg-emerald-500 ring-2 ring-emerald-200',
          label: 'Green',
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fbfbfb]">
      <TopBar
        title="VIP & Press Directory"
        subtitle="Pre-launch waitlist, VIP tiers, and press directory"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewClick={() => setIsNewModalOpen(true)}
        newButtonLabel="+ Add Contact"
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-xs text-zinc-400 gap-2">
          <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <span>Loading directory...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-white p-3 sm:p-5 md:p-6 pb-20 md:pb-6">
          <div className="w-full space-y-3">
            {/* Category Filter Pills Bar */}
            <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-100">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3 text-zinc-400" />
                  <span>Category:</span>
                </span>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const count =
                    cat === 'All'
                      ? contacts.length
                      : contacts.filter((c) => c.category === cat).length;

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-zinc-900 text-white shadow-xs'
                          : 'bg-zinc-100/70 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
                      }`}
                    >
                      <span>{cat}</span>
                      <span
                        className={`text-[10px] font-mono ${
                          isSelected ? 'text-zinc-300' : 'text-zinc-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-zinc-400 font-mono hidden sm:block shrink-0">
                Click column headers to sort • Dropdown to change level
              </div>
            </div>

            {/* Minimal, Full-Width Table */}
            <div className="w-full overflow-x-auto border border-zinc-200/70 rounded-xl">
              <table className="w-full text-left border-collapse text-xs min-w-[760px] sm:min-w-full">
                <thead>
                  <tr className="bg-[#fafafa] border-b border-zinc-200/80 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider select-none">
                    {/* Contact Name */}
                    <th
                      className="py-2.5 px-3 cursor-pointer hover:text-zinc-900 transition-colors group"
                      onClick={() => handleSort('full_name')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={sortField === 'full_name' ? 'text-zinc-900 font-bold' : ''}>
                          Contact
                        </span>
                        {sortField === 'full_name' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>

                    {/* VIP Level */}
                    <th
                      className="py-2.5 px-3 cursor-pointer hover:text-zinc-900 transition-colors group"
                      onClick={() => handleSort('vip_level')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={sortField === 'vip_level' ? 'text-zinc-900 font-bold' : ''}>
                          Level
                        </span>
                        {sortField === 'vip_level' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>

                    {/* Category */}
                    <th
                      className="py-2.5 px-3 cursor-pointer hover:text-zinc-900 transition-colors group"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={sortField === 'category' ? 'text-zinc-900 font-bold' : ''}>
                          Category
                        </span>
                        {sortField === 'category' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>

                    {/* Source */}
                    <th
                      className="py-2.5 px-3 cursor-pointer hover:text-zinc-900 transition-colors group"
                      onClick={() => handleSort('source')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={sortField === 'source' ? 'text-zinc-900 font-bold' : ''}>
                          Source
                        </span>
                        {sortField === 'source' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>

                    {/* Complete Address */}
                    <th className="py-2.5 px-3 max-w-[200px]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        <span>Address</span>
                      </div>
                    </th>

                    {/* City */}
                    <th
                      className="py-2.5 px-3 cursor-pointer hover:text-zinc-900 transition-colors group"
                      onClick={() => handleSort('city')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={sortField === 'city' ? 'text-zinc-900 font-bold' : ''}>
                          City
                        </span>
                        {sortField === 'city' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>

                    {/* Email */}
                    <th
                      className="py-2.5 px-3 cursor-pointer hover:text-zinc-900 transition-colors group"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={sortField === 'email' ? 'text-zinc-900 font-bold' : ''}>
                          Email
                        </span>
                        {sortField === 'email' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>

                    {/* Phone */}
                    <th
                      className="py-2.5 px-3 cursor-pointer hover:text-zinc-900 transition-colors group"
                      onClick={() => handleSort('phone')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={sortField === 'phone' ? 'text-zinc-900 font-bold' : ''}>
                          Phone
                        </span>
                        {sortField === 'phone' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>

                    {/* Status */}
                    <th
                      className="py-2.5 px-3 cursor-pointer hover:text-zinc-900 transition-colors group"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={sortField === 'status' ? 'text-zinc-900 font-bold' : ''}>
                          Status
                        </span>
                        {sortField === 'status' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>

                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {filteredAndSortedContacts.map((c) => {
                    const colorStyle = getTierColorStyle(c.tier_color);
                    const currentLevel = (c.vip_level as VIPLevel) || 'Level 2';

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedContact(c)}
                        className="hover:bg-zinc-50/70 transition-colors cursor-pointer group"
                      >
                        {/* Contact Name with Health Dot */}
                        <td className="py-2.5 px-3 font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${colorStyle.dot}`}
                              title={`Relationship Health: ${colorStyle.label}`}
                            />
                            <span className="truncate max-w-[150px]">{c.full_name}</span>
                          </div>
                        </td>

                        {/* Level Dropdown (Clean, minimalist, no clutter or extra text) */}
                        <td
                          className="py-2.5 px-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={currentLevel}
                            onChange={(e) =>
                              handleLevelChange(c.id, e.target.value as VIPLevel)
                            }
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                              currentLevel === 'Level 1'
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : currentLevel === 'Level 2'
                                ? 'bg-zinc-100 text-zinc-800 border-zinc-200 hover:border-zinc-300'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                            }`}
                            title="Change VIP Level"
                          >
                            <option value="Level 1">Level 1</option>
                            <option value="Level 2">Level 2</option>
                            <option value="Level 3">Level 3</option>
                            <option value="Level 4">Level 4</option>
                          </select>
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-3 text-zinc-600">
                          <span className="px-2 py-0.5 rounded-full bg-zinc-100/90 border border-zinc-200/80 text-[11px] font-medium text-zinc-700 whitespace-nowrap">
                            {c.category}
                          </span>
                        </td>

                        {/* Acquisition Source */}
                        <td className="py-2.5 px-3 text-zinc-600">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Compass className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="font-medium truncate max-w-[130px]" title={c.source || 'Direct'}>
                              {c.source || 'Website Waitlist'}
                            </span>
                          </div>
                        </td>

                        {/* Delivery Address (Clamped to 2 lines, no layout breakage) */}
                        <td className="py-2.5 px-3 max-w-[180px] lg:max-w-[220px]">
                          {c.full_address ? (
                            <p
                              className="line-clamp-2 text-[11px] text-zinc-500 font-normal leading-tight group-hover:text-zinc-700 transition-colors"
                              title={c.full_address}
                            >
                              {c.full_address}
                            </p>
                          ) : (
                            <span className="text-[11px] text-zinc-300 italic">—</span>
                          )}
                        </td>

                        {/* City */}
                        <td className="py-2.5 px-3 text-zinc-600 font-medium">
                          {c.city || '—'}
                        </td>

                        {/* Email */}
                        <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px]">
                          <span className="truncate max-w-[150px] inline-block" title={c.email || ''}>
                            {c.email || '—'}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px] whitespace-nowrap">
                          {c.phone || '—'}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-zinc-700 font-medium text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{c.status}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td
                          className="py-2.5 px-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedContact(c)}
                              className="text-zinc-400 hover:text-zinc-900 p-1 rounded-md hover:bg-zinc-100 transition-colors"
                              title="Edit Contact"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id, c.full_name)}
                              className="text-zinc-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                              title="Delete Contact"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredAndSortedContacts.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-12 text-center text-zinc-400 text-xs"
                      >
                        No contacts found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      <EditContactModal
        contact={selectedContact}
        isOpen={Boolean(selectedContact)}
        onClose={() => setSelectedContact(null)}
        onSave={handleSaveContact}
        onDelete={(id) => {
          if (selectedContact) handleDelete(id, selectedContact.full_name);
        }}
      />

      {/* New Contact Modal */}
      {isNewModalOpen && (
        <NewContactModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onCreated={(newC) => {
            setContacts((prev) => [newC, ...prev]);
            showToast(`Added ${newC.full_name} to VIP directory`);
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

function NewContactModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (c: CRMContact) => void;
}) {
  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState<ContactCategory>('VIP Waitlist');
  const [vipLevel, setVipLevel] = useState<VIPLevel>('Level 2');
  const [tierColor, setTierColor] = useState<TierColor>('Green');
  const [source, setSource] = useState('Website Waitlist');
  const [fullAddress, setFullAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          category,
          vip_level: vipLevel,
          tier_color: tierColor,
          source,
          full_address: fullAddress,
          email,
          phone,
          city,
          status: 'Active',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="h-14 px-4 sm:px-6 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-[#fafafa]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Add VIP / Media Contact</h2>
              <p className="text-[11px] text-zinc-500">Waitlist members, buyers, and activewear press</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 p-1">
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rhea Chakraborty"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          {/* Tier & Health Color */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">VIP Level</label>
              <select
                value={vipLevel}
                onChange={(e) => setVipLevel(e.target.value as VIPLevel)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-2 font-medium"
              >
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
                <option value="Level 3">Level 3</option>
                <option value="Level 4">Level 4</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Connection Health</label>
              <select
                value={tierColor}
                onChange={(e) => setTierColor(e.target.value as TierColor)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-2 font-medium"
              >
                <option value="Green">🟢 Green (Hot)</option>
                <option value="Yellow">🟡 Yellow (Warm)</option>
                <option value="Damper">🟠 Damper (Follow-up)</option>
                <option value="Red">🔴 Red (Cold)</option>
              </select>
            </div>
          </div>

          {/* Category & Source */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ContactCategory)}
                className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-2.5 py-2"
              >
                {['VIP Waitlist', 'Press/Media', 'Fitness Coach', 'Community Leader'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Acquisition Source</label>
              <input
                type="text"
                placeholder="e.g. Instagram Inbound"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Complete Address */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
              Complete Delivery Address
            </label>
            <textarea
              rows={2}
              placeholder="Flat/Building, Street, Area, Landmark, City, State, PIN..."
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-3 py-2 text-xs"
            />
          </div>

          {/* Email, Phone, City */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">City</label>
              <input
                type="text"
                placeholder="Mumbai..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-2.5 py-2"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="name@..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-2.5 py-2"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+91..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#fbfbfb] border border-zinc-200 rounded-lg px-2.5 py-2 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
