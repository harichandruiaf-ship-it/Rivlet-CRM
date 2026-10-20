'use client';

import React, { useState } from 'react';
import { AthleteCreator, SeedingStage } from '@/lib/types';
import { Instagram, Package, ExternalLink, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface AthletesTableProps {
  athletes: AthleteCreator[];
  onSelectAthlete: (athlete: AthleteCreator) => void;
  onUpdateStage: (id: string, newStage: SeedingStage) => Promise<void>;
}

const STAGE_LABELS: Record<SeedingStage, { label: string; badge: string }> = {
  scouted: { label: 'Scouted', badge: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
  contacted: { label: 'Pitch Sent', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  sizing_confirmed: { label: 'Sizing Confirmed', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  kit_shipped: { label: 'Kit Shipped', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  post_live: { label: 'Post Live 🚀', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ambassador: { label: 'Ambassador', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export default function AthletesTable({ athletes, onSelectAthlete, onUpdateStage }: AthletesTableProps) {
  const { showToast } = useToast();
  const [sortField, setSortField] = useState<'handle' | 'full_name' | 'niche' | 'stage'>('handle');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: 'handle' | 'full_name' | 'niche' | 'stage') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedAthletes = [...athletes].sort((a, b) => {
    const valA = (a[sortField] || '').toLowerCase();
    const valB = (b[sortField] || '').toLowerCase();
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const handleStageChange = async (id: string, handle: string, newStage: SeedingStage) => {
    await onUpdateStage(id, newStage);
    showToast(`Updated ${handle} to ${newStage.replace('_', ' ')}`);
  };

  return (
    <div className="flex-1 overflow-auto bg-white select-none">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header with Sort */}
        <thead className="sticky top-0 bg-[#fafafa] border-b border-[#e4e4e7] z-10 text-[11px] font-bold text-[#71717a] uppercase tracking-wider">
          <tr>
            <th className="py-3 px-6 cursor-pointer hover:text-zinc-900" onClick={() => handleSort('handle')}>
              <div className="flex items-center gap-1.5">
                <span>Athlete / Creator</span>
                <ArrowUpDown className="w-3 h-3 text-zinc-400" />
              </div>
            </th>
            <th className="py-3 px-4 cursor-pointer hover:text-zinc-900" onClick={() => handleSort('niche')}>
              <div className="flex items-center gap-1.5">
                <span>Niche</span>
                <ArrowUpDown className="w-3 h-3 text-zinc-400" />
              </div>
            </th>
            <th className="py-3 px-4">Tier</th>
            <th className="py-3 px-4 font-mono">Sizing Matrix (Top / Bra / Bottom / Inseam)</th>
            <th className="py-3 px-4 cursor-pointer hover:text-zinc-900" onClick={() => handleSort('stage')}>
              <div className="flex items-center gap-1.5">
                <span>Pipeline Stage</span>
                <ArrowUpDown className="w-3 h-3 text-zinc-400" />
              </div>
            </th>
            <th className="py-3 px-4">Target Drop</th>
            <th className="py-3 px-6">Dispatch / Social Live</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#f4f4f5]">
          {sortedAthletes.map((athlete) => {
            const stageConfig = STAGE_LABELS[athlete.stage] || STAGE_LABELS.scouted;

            return (
              <tr
                key={athlete.id}
                onClick={() => onSelectAthlete(athlete)}
                className="hover:bg-zinc-50/80 cursor-pointer transition-colors group"
              >
                {/* Creator Column */}
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-700 shrink-0">
                      {athlete.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#09090b] group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                        <span>{athlete.handle}</span>
                      </div>
                      <div className="text-[11px] text-[#71717a] font-medium">{athlete.full_name}</div>
                    </div>
                  </div>
                </td>

                {/* Niche */}
                <td className="py-3.5 px-4">
                  <span className="text-[11px] font-semibold text-zinc-700 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
                    {athlete.niche}
                  </span>
                </td>

                {/* Tier */}
                <td className="py-3.5 px-4">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {athlete.follower_tier}
                  </span>
                </td>

                {/* Sizing Matrix */}
                <td className="py-3.5 px-4 font-mono text-[11px]">
                  <span className="font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                    {athlete.top_size}
                  </span>
                  <span className="text-zinc-400"> / </span>
                  <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    {athlete.sports_bra_size}
                  </span>
                  <span className="text-zinc-400"> / </span>
                  <span className="font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                    {athlete.bottom_size}
                  </span>
                  <span className="text-zinc-400"> ({athlete.inseam_length})</span>
                </td>

                {/* Editable Stage Dropdown */}
                <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={athlete.stage}
                    onChange={(e) => handleStageChange(athlete.id, athlete.handle, e.target.value as SeedingStage)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md border cursor-pointer focus:outline-none shadow-subtle ${stageConfig.badge}`}
                  >
                    <option value="scouted">Scouted</option>
                    <option value="contacted">Pitch Sent</option>
                    <option value="sizing_confirmed">Sizing Confirmed</option>
                    <option value="kit_shipped">Kit Shipped</option>
                    <option value="post_live">Post Live 🚀</option>
                    <option value="ambassador">Ambassador</option>
                  </select>
                </td>

                {/* Target Drop */}
                <td className="py-3.5 px-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {athlete.target_drop}
                  </span>
                </td>

                {/* Dispatch / Social Live */}
                <td className="py-3.5 px-6">
                  {athlete.post_url ? (
                    <a
                      href={athlete.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 text-[11px] bg-emerald-50/70 border border-emerald-200/80 px-2.5 py-1 rounded-md w-fit"
                    >
                      <span>Live Post</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : athlete.tracking_number ? (
                    <span className="text-indigo-700 flex items-center gap-1.5 text-[11px] font-mono bg-indigo-50/60 border border-indigo-200/60 px-2 py-0.5 rounded w-fit">
                      <Package className="w-3 h-3" />
                      {athlete.courier_partner}: {athlete.tracking_number}
                    </span>
                  ) : (
                    <span className="text-zinc-400 text-[11px] italic">Pending dispatch</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
