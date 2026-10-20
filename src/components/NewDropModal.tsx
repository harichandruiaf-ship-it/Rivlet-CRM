'use client';

import React, { useState } from 'react';
import { useDrops } from './DropContext';
import { X, Layers, Sparkles } from 'lucide-react';

export default function NewDropModal() {
  const { isNewDropModalOpen, setIsNewDropModalOpen, createDrop } = useDrops();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewDropModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const success = await createDrop(name, description, targetDate || undefined);
    setIsSubmitting(false);

    if (success) {
      setName('');
      setDescription('');
      setTargetDate('');
      setIsNewDropModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Create New Collection Drop</h2>
              <p className="text-[11px] text-zinc-500">Add a drop to organize athlete seeding & wholesale</p>
            </div>
          </div>
          <button
            onClick={() => setIsNewDropModalOpen(false)}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">Drop Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Drop 2 — Seamless Studio or Drop 3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-50/70 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">Collection Theme / Notes</label>
            <input
              type="text"
              placeholder="e.g. 78/22 Nylon compression, high-waisted reformer rib knit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-50/70 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">Target Launch / Dispatch Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-zinc-50/70 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsNewDropModalOpen(false)}
              className="px-4 py-2 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Drop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
