'use client';

import React, { useState } from 'react';
import { AthleteCreator, AthleteNiche, FollowerTier, SeedingStage, Platform } from '@/lib/types';
import { X, Sparkles } from 'lucide-react';
import { useDrops } from './DropContext';
import PlatformIcon from './PlatformIcon';

interface NewAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (athlete: AthleteCreator) => void;
}

export default function NewAthleteModal({ isOpen, onClose, onCreated }: NewAthleteModalProps) {
  const { drops, selectedDrop } = useDrops();
  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [handle, setHandle] = useState('');
  const [fullName, setFullName] = useState('');
  const [niche, setNiche] = useState<AthleteNiche>('Pilates');
  const [followerTier, setFollowerTier] = useState<FollowerTier>('Micro (10k-50k)');
  const [topSize, setTopSize] = useState('S');
  const [sportsBraSize, setSportsBraSize] = useState('34B');
  const [bottomSize, setBottomSize] = useState('S');
  const [inseamLength, setInseamLength] = useState('25"');
  const [stage, setStage] = useState<SeedingStage>('scouted');
  const [targetDrop, setTargetDrop] = useState(selectedDrop === 'all' ? 'Drop 1' : selectedDrop);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle || !fullName) {
      setError('Please provide username/handle and full name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formattedHandle = handle.startsWith('@') ? handle : `@${handle}`;
      const res = await fetch('/api/athletes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          handle: formattedHandle,
          full_name: fullName,
          niche,
          follower_tier: followerTier,
          top_size: topSize,
          sports_bra_size: sportsBraSize,
          bottom_size: bottomSize,
          inseam_length: inseamLength,
          stage,
          target_drop: targetDrop,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create athlete.');
      }

      onCreated(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md bg-white rounded-xl shadow-2xl border border-[#e4e4e7] overflow-hidden animate-slide-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="h-12 px-4 sm:px-5 border-b border-[#e4e4e7] flex items-center justify-between bg-[#fafafa] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-600" />
            <span className="font-semibold text-xs text-[#09090b]">Add Athlete to Seeding Hub</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Platform & Username / Handle Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Social Media Platform
              </label>
              <div className="relative">
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                  className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Facebook">Facebook</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Username / Handle *
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="@username"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Creator Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Aanya Sharma"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Fitness Niche</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value as AthleteNiche)}
                className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-2.5 py-1.5"
              >
                {['Pilates', 'Yoga', 'Hyrox & Strength', 'Marathon & Running', 'CrossFit & Functional', 'Mobility & Physio'].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Follower Tier</label>
              <select
                value={followerTier}
                onChange={(e) => setFollowerTier(e.target.value as FollowerTier)}
                className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-2.5 py-1.5"
              >
                {['Nano (<10k)', 'Micro (10k-50k)', 'Mid (50k-250k)', 'Macro (250k+)'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sizing Matrix Row */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
            <span className="block text-[10px] font-bold text-zinc-500 uppercase">Initial Sizing Matrix</span>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] text-zinc-500 block">Top</span>
                <select
                  value={topSize}
                  onChange={(e) => setTopSize(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded p-1 text-xs font-mono font-bold"
                >
                  {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Bra</span>
                <input
                  type="text"
                  value={sportsBraSize}
                  onChange={(e) => setSportsBraSize(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded p-1 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Bottom</span>
                <select
                  value={bottomSize}
                  onChange={(e) => setBottomSize(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded p-1 text-xs font-mono font-bold"
                >
                  {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Inseam</span>
                <input
                  type="text"
                  value={inseamLength}
                  onChange={(e) => setInseamLength(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded p-1 text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Collection Drop</label>
              <select
                value={targetDrop}
                onChange={(e) => setTargetDrop(e.target.value)}
                className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-2.5 py-1.5 font-medium"
              >
                {drops.length > 0 ? (
                  drops.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Drop 1">Drop 1</option>
                    <option value="Drop 2">Drop 2</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Initial Pipeline Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as SeedingStage)}
                className="w-full bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-2.5 py-1.5"
              >
                <option value="scouted">Scouted</option>
                <option value="contacted">Pitch Sent</option>
                <option value="sizing_confirmed">Sizing Confirmed</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-[#e4e4e7] rounded-md text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-white font-semibold rounded-md shadow-subtle disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add to Pipeline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
