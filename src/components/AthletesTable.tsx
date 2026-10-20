'use client';

import React from 'react';
import { AthleteCreator, SeedingStage } from '@/lib/types';
import { Instagram, Package, ExternalLink } from 'lucide-react';

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
  return (
    <div className="flex-1 overflow-auto bg-white">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header */}
        <thead className="sticky top-0 bg-[#fafafa] border-b border-[#e4e4e7] z-10 text-[11px] font-semibold text-[#71717a] uppercase tracking-wider">
          <tr>
            <th className="py-2.5 px-4">Athlete / Creator</th>
            <th className="py-2.5 px-4">Niche</th>
            <th className="py-2.5 px-4">Tier</th>
            <th className="py-2.5 px-4 font-mono">Sizing (Top / Bra / Bottom / Inseam)</th>
            <th className="py-2.5 px-4">Pipeline Stage</th>
            <th className="py-2.5 px-4">Drop</th>
            <th className="py-2.5 px-4">Fulfillment / Post</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#f4f4f5]">
          {athletes.map((athlete) => {
            const stageConfig = STAGE_LABELS[athlete.stage] || STAGE_LABELS.scouted;

            return (
              <tr
                key={athlete.id}
                onClick={() => onSelectAthlete(athlete)}
                className="hover:bg-[#fbfbfb] cursor-pointer transition-colors group"
              >
                {/* Creator info */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-[#09090b] group-hover:text-blue-600 transition-colors">
                        {athlete.handle}
                      </div>
                      <div className="text-[11px] text-[#71717a]">{athlete.full_name}</div>
                    </div>
                  </div>
                </td>

                {/* Niche */}
                <td className="py-3 px-4 text-[#52525b] font-medium">
                  {athlete.niche}
                </td>

                {/* Tier */}
                <td className="py-3 px-4">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {athlete.follower_tier}
                  </span>
                </td>

                {/* Sizing Matrix */}
                <td className="py-3 px-4 font-mono text-[11px]">
                  <span className="text-zinc-900 font-semibold">{athlete.top_size}</span>
                  <span className="text-zinc-400"> / </span>
                  <span className="text-amber-800">{athlete.sports_bra_size}</span>
                  <span className="text-zinc-400"> / </span>
                  <span className="text-zinc-900 font-semibold">{athlete.bottom_size}</span>
                  <span className="text-zinc-400"> ({athlete.inseam_length})</span>
                </td>

                {/* Stage selector */}
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={athlete.stage}
                    onChange={(e) => onUpdateStage(athlete.id, e.target.value as SeedingStage)}
                    className={`text-[11px] font-medium px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${stageConfig.badge}`}
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
                <td className="py-3 px-4">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {athlete.target_drop}
                  </span>
                </td>

                {/* Fulfillment / Post Link */}
                <td className="py-3 px-4">
                  {athlete.post_url ? (
                    <a
                      href={athlete.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 text-[11px]"
                    >
                      <span>Live Post</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : athlete.tracking_number ? (
                    <span className="text-indigo-700 flex items-center gap-1 text-[11px] font-mono">
                      <Package className="w-3 h-3" />
                      {athlete.tracking_number}
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
