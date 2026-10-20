'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TopBar from '@/components/TopBar';
import CommandPalette from '@/components/CommandPalette';
import { CRMContact, ContactCategory } from '@/lib/types';
import { Users, Trash2, X, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ContactsPage() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  return (
    <div className="flex flex-col h-full bg-[#fbfbfb]">
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
        <div className="flex-1 flex flex-col items-center justify-center text-xs text-[#71717a] gap-2">
          <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <span>Loading directory...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-white select-none">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-[#fafafa] border-b border-[#e4e4e7] z-10 text-[11px] font-bold text-[#71717a] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">City</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">Phone</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f4f5]">
              {filteredContacts.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-[#09090b]">{c.full_name}</td>
                  <td className="py-3.5 px-6">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-[#52525b] font-medium">{c.city || '—'}</td>
                  <td className="py-3.5 px-6 text-[#52525b] font-mono text-[11px]">{c.email || '—'}</td>
                  <td className="py-3.5 px-6 text-[#52525b] font-mono text-[11px]">{c.phone || '—'}</td>
                  <td className="py-3.5 px-6">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleDelete(c.id, c.full_name)}
                      className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                      title="Delete contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#e4e4e7] overflow-hidden animate-slide-in">
        <div className="h-12 px-5 border-b border-[#e4e4e7] flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-900" />
            <span className="font-bold text-xs text-[#09090b]">Add VIP / Media Contact</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-zinc-600 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rhea Chakraborty"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-3 py-1.5 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ContactCategory)}
                className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-2.5 py-1.5"
              >
                {['VIP Waitlist', 'Press/Media', 'Fitness Coach', 'Community Leader'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">City</label>
              <input
                type="text"
                placeholder="Mumbai, Bengaluru..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-3 py-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">Email</label>
              <input
                type="email"
                placeholder="rhea@..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+91..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-3 py-1.5 font-mono"
              />
            </div>
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
              {isSubmitting ? 'Adding...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
