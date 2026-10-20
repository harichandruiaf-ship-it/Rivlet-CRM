'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TopBar from '@/components/TopBar';
import CommandPalette from '@/components/CommandPalette';
import EditContactModal from '@/components/EditContactModal';
import { CRMContact, ContactCategory } from '@/lib/types';
import { Users, Trash2, Pencil, Plus, Mail, Phone, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const CATEGORIES = [
  'All',
  'VIP Waitlist',
  'Press/Media',
  'Fitness Coach',
  'Community Leader',
];

export default function ContactsPage() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortField, setSortField] = useState<'full_name' | 'category' | 'city' | 'email' | 'phone' | 'status'>('full_name');
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

  const handleSort = (field: 'full_name' | 'category' | 'city' | 'email' | 'phone' | 'status') => {
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
        c.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || c.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    return [...list].sort((a, b) => {
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

  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      <TopBar
        title="VIP & Press Directory"
        subtitle="Pre-launch waitlist, press editors, and brand contacts"
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
        <div className="flex-1 overflow-auto bg-white p-3 sm:p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Category Filter Pills Bar */}
            <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-100">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3 text-zinc-400" />
                  <span>Filter:</span>
                </span>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const count = cat === 'All'
                    ? contacts.length
                    : contacts.filter((c) => c.category === cat).length;

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'bg-zinc-100/70 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-zinc-400 font-mono hidden sm:block shrink-0">
                Click column headers to sort
              </div>
            </div>

            {/* Data Table with Clickable Sort Headers */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider select-none">
                    {/* Contact Name Sort */}
                    <th
                      className="pb-3 px-4 cursor-pointer hover:text-zinc-900 transition-colors group"
                      onClick={() => handleSort('full_name')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={sortField === 'full_name' ? 'text-zinc-900 font-bold' : ''}>Contact</span>
                        {sortField === 'full_name' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>

                    {/* Category Sort */}
                    <th
                      className="pb-3 px-4 cursor-pointer hover:text-zinc-900 transition-colors group"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={sortField === 'category' ? 'text-zinc-900 font-bold' : ''}>Category</span>
                        {sortField === 'category' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>

                    {/* Location Sort */}
                    <th
                      className="pb-3 px-4 cursor-pointer hover:text-zinc-900 transition-colors group"
                      onClick={() => handleSort('city')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={sortField === 'city' ? 'text-zinc-900 font-bold' : ''}>Location</span>
                        {sortField === 'city' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>

                    {/* Email Sort */}
                    <th
                      className="pb-3 px-4 cursor-pointer hover:text-zinc-900 transition-colors group"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={sortField === 'email' ? 'text-zinc-900 font-bold' : ''}>Email</span>
                        {sortField === 'email' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>

                    {/* Phone Sort */}
                    <th
                      className="pb-3 px-4 cursor-pointer hover:text-zinc-900 transition-colors group"
                      onClick={() => handleSort('phone')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={sortField === 'phone' ? 'text-zinc-900 font-bold' : ''}>Phone</span>
                        {sortField === 'phone' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>

                    {/* Status Sort */}
                    <th
                      className="pb-3 px-4 cursor-pointer hover:text-zinc-900 transition-colors group"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={sortField === 'status' ? 'text-zinc-900 font-bold' : ''}>Status</span>
                        {sortField === 'status' ? (
                          sortAsc ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>

                    <th className="pb-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredAndSortedContacts.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedContact(c)}
                      className="hover:bg-zinc-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4 font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                        {c.full_name}
                      </td>
                      <td className="py-4 px-4 text-zinc-600">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-[11px] font-medium text-zinc-700">
                          {c.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-zinc-500 font-medium">{c.city || '—'}</td>
                      <td className="py-4 px-4 text-zinc-500 font-mono text-[11px]">{c.email || '—'}</td>
                      <td className="py-4 px-4 text-zinc-500 font-mono text-[11px]">{c.phone || '—'}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 text-zinc-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{c.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedContact(c)}
                            className="text-zinc-400 hover:text-zinc-800 p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                            title="Edit Contact"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.full_name)}
                            className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                            title="Delete Contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredAndSortedContacts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400 text-xs">
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
      <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="h-14 px-4 sm:px-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Add VIP / Media Contact</h2>
              <p className="text-[11px] text-zinc-500">Waitlist members and activewear press</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rhea Chakraborty"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-zinc-50/70 border border-zinc-200 rounded-lg px-3 py-2 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ContactCategory)}
                className="w-full bg-zinc-50/70 border border-zinc-200 rounded-lg px-2.5 py-2"
              >
                {['VIP Waitlist', 'Press/Media', 'Fitness Coach', 'Community Leader'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">City</label>
              <input
                type="text"
                placeholder="Mumbai, Bengaluru..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-zinc-50/70 border border-zinc-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="rhea@..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50/70 border border-zinc-200 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+91..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-50/70 border border-zinc-200 rounded-lg px-3 py-2 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-zinc-200 rounded-lg text-zinc-600">
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
