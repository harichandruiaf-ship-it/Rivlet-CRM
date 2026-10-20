'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TopBar from '@/components/TopBar';
import CommandPalette from '@/components/CommandPalette';
import EditContactModal from '@/components/EditContactModal';
import { CRMContact, ContactCategory } from '@/lib/types';
import { Users, Trash2, Pencil, Plus, Mail, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ContactsPage() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
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

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      return (
        !searchTerm ||
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [contacts, searchTerm]);

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
        title="VIP Waitlist & Press Media Relations"
        subtitle="Exclusive pre-launch buyers, fitness press editors & community leaders"
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
        <div className="flex-1 overflow-auto bg-white p-8">
          <div className="max-w-6xl mx-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="pb-3 px-4">Contact</th>
                  <th className="pb-3 px-4">Category</th>
                  <th className="pb-3 px-4">Location</th>
                  <th className="pb-3 px-4">Email</th>
                  <th className="pb-3 px-4">Phone</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredContacts.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedContact(c)}
                    className="hover:bg-zinc-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                      {c.full_name}
                    </td>
                    <td className="py-4 px-4 text-zinc-600">
                      {c.category}
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
              </tbody>
            </table>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
        <div className="h-14 px-6 border-b border-zinc-100 flex items-center justify-between">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
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
