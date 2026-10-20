'use client';

import React, { useState } from 'react';
import { AthleteCreator, SeedingStage } from '@/lib/types';
import { Instagram, Package, CheckCircle2, Sparkles, Send, Ruler, Award } from 'lucide-react';

interface AthletesKanbanProps {
  athletes: AthleteCreator[];
  onSelectAthlete: (athlete: AthleteCreator) => void;
  onUpdateStage: (id: string, newStage: SeedingStage) => Promise<void>;
}

const STAGES: { key: SeedingStage; label: string; color: string; dotColor: string }[] = [
  { key: 'scouted', label: 'Scouted', color: 'border-zinc-200 text-zinc-700 bg-zinc-50', dotColor: 'bg-zinc-400' },
  { key: 'contacted', label: 'Pitch Sent', color: 'border-blue-200 text-blue-700 bg-blue-50', dotColor: 'bg-blue-500' },
  { key: 'sizing_confirmed', label: 'Sizing Confirmed', color: 'border-amber-200 text-amber-700 bg-amber-50', dotColor: 'bg-amber-500' },
  { key: 'kit_shipped', label: 'Kit Shipped', color: 'border-indigo-200 text-indigo-700 bg-indigo-50', dotColor: 'bg-indigo-500' },
  { key: 'post_live', label: 'Post Live 🚀', color: 'border-emerald-200 text-emerald-700 bg-emerald-50', dotColor: 'bg-emerald-500' },
  { key: 'ambassador', label: 'Ambassador', color: 'border-purple-200 text-purple-700 bg-purple-50', dotColor: 'bg-purple-500' },
];

export default function AthletesKanban({ athletes, onSelectAthlete, onUpdateStage }: AthletesKanbanProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<SeedingStage | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, stage: SeedingStage) => {
    e.preventDefault();
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: SeedingStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (!id) return;
    const athlete = athletes.find((a) => a.id === id);
    if (!athlete || athlete.stage === targetStage) return;

    await onUpdateStage(id, targetStage);
    setDraggedId(null);
  };

  return (
    <div className="flex-1 overflow-x-auto p-6 bg-[#fbfbfb]">
      <div className="flex gap-4 min-w-[1300px] h-full items-start">
        {STAGES.map((col) => {
          const colAthletes = athletes.filter((a) => a.stage === col.key);
          const isOver = dragOverStage === col.key;

          return (
            <div
              key={col.key}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`w-72 shrink-0 flex flex-col rounded-lg bg-[#f4f4f5]/60 border transition-all ${
                isOver ? 'border-[#18181b] bg-zinc-100 ring-2 ring-zinc-300' : 'border-[#e4e4e7]'
              }`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-[#e4e4e7] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className="text-xs font-semibold text-[#09090b]">{col.label}</span>
                </div>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-white text-zinc-600 border border-zinc-200 shadow-subtle">
                  {colAthletes.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="p-2 space-y-2.5 min-h-[480px] max-h-[calc(100vh-170px)] overflow-y-auto">
                {colAthletes.map((athlete) => (
                  <div
                    key={athlete.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, athlete.id)}
                    onClick={() => onSelectAthlete(athlete)}
                    className="p-3 rounded-md bg-white border border-[#e4e4e7] shadow-card hover:border-[#a1a1aa] hover:shadow-md cursor-grab active:cursor-grabbing transition-all group"
                  >
                    {/* Top Row: Handle & Tier */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5 text-pink-600" />
                        <span className="text-xs font-semibold text-[#09090b] group-hover:text-blue-600 transition-colors">
                          {athlete.handle}
                        </span>
                      </div>
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {athlete.follower_tier.split(' ')[0]}
                      </span>
                    </div>

                    {/* Name & Niche */}
                    <div className="text-[11px] text-[#52525b] mb-2">
                      <span>{athlete.full_name}</span> • <span className="font-medium text-[#18181b]">{athlete.niche}</span>
                    </div>

                    {/* Sizing Matrix Badge Row */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#f4f4f5]">
                      <span className="text-[10px] bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-700 font-mono">
                        Top: {athlete.top_size}
                      </span>
                      {athlete.sports_bra_size !== 'N/A' && (
                        <span className="text-[10px] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-amber-800 font-mono">
                          Bra: {athlete.sports_bra_size}
                        </span>
                      )}
                      <span className="text-[10px] bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-700 font-mono">
                        {athlete.bottom_size} ({athlete.inseam_length})
                      </span>
                    </div>

                    {/* Shipping or Post indicator */}
                    {athlete.tracking_number && (
                      <div className="mt-2 text-[10px] text-indigo-600 flex items-center gap-1 bg-indigo-50/70 border border-indigo-200/60 px-2 py-0.5 rounded">
                        <Package className="w-3 h-3" />
                        <span className="truncate">{athlete.courier_partner}: {athlete.tracking_number}</span>
                      </div>
                    )}

                    {athlete.discount_code && (
                      <div className="mt-1 text-[10px] text-emerald-700 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        <Award className="w-3 h-3" />
                        <span>Code: {athlete.discount_code}</span>
                      </div>
                    )}
                  </div>
                ))}

                {colAthletes.length === 0 && (
                  <div className="h-28 border border-dashed border-[#e4e4e7] rounded flex items-center justify-center text-[11px] text-[#a1a1aa]">
                    Drag athlete here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
