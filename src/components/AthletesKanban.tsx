'use client';

import React, { useState } from 'react';
import { AthleteCreator, SeedingStage } from '@/lib/types';
import {
  Instagram,
  Package,
  Award,
  ChevronRight,
  ExternalLink,
  Copy,
  GripVertical,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface AthletesKanbanProps {
  athletes: AthleteCreator[];
  onSelectAthlete: (athlete: AthleteCreator) => void;
  onUpdateStage: (id: string, newStage: SeedingStage) => Promise<void>;
}

const STAGES: { key: SeedingStage; label: string; dotColor: string }[] = [
  { key: 'scouted', label: 'Scouted', dotColor: 'bg-zinc-400' },
  { key: 'contacted', label: 'Pitch Sent', dotColor: 'bg-blue-500' },
  { key: 'sizing_confirmed', label: 'Sizing Confirmed', dotColor: 'bg-amber-500' },
  { key: 'kit_shipped', label: 'Kit Shipped', dotColor: 'bg-indigo-500' },
  { key: 'post_live', label: 'Post Live 🚀', dotColor: 'bg-emerald-500' },
  { key: 'ambassador', label: 'Ambassador', dotColor: 'bg-purple-500' },
];

const STAGE_ORDER: SeedingStage[] = [
  'scouted',
  'contacted',
  'sizing_confirmed',
  'kit_shipped',
  'post_live',
  'ambassador',
];

export default function AthletesKanban({ athletes, onSelectAthlete, onUpdateStage }: AthletesKanbanProps) {
  const { showToast } = useToast();
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
    showToast(`Moved ${athlete.handle} to ${targetStage.replace('_', ' ')}`);
    setDraggedId(null);
  };

  const handleAdvanceStage = async (e: React.MouseEvent, athlete: AthleteCreator) => {
    e.stopPropagation();
    const currentIndex = STAGE_ORDER.indexOf(athlete.stage);
    if (currentIndex < STAGE_ORDER.length - 1) {
      const nextStage = STAGE_ORDER[currentIndex + 1];
      await onUpdateStage(athlete.id, nextStage);
      showToast(`Advanced ${athlete.handle} to ${nextStage.replace('_', ' ')}`);
    }
  };

  const handleCopyTracking = (e: React.MouseEvent, tracking: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tracking);
    showToast(`Copied tracking ${tracking} to clipboard`);
  };

  return (
    <div className="flex-1 overflow-x-auto p-6 bg-[#fbfbfb]">
      <div className="flex gap-4 min-w-[1340px] h-full items-start">
        {STAGES.map((col) => {
          const colAthletes = athletes.filter((a) => a.stage === col.key);
          const isOver = dragOverStage === col.key;
          const percentage = athletes.length > 0 ? Math.round((colAthletes.length / athletes.length) * 100) : 0;

          return (
            <div
              key={col.key}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`w-72 shrink-0 flex flex-col rounded-xl bg-[#f4f4f5]/70 border transition-all duration-150 ${
                isOver ? 'border-[#18181b] bg-zinc-200/60 ring-2 ring-zinc-300' : 'border-[#e4e4e7]'
              }`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-[#e4e4e7] flex items-center justify-between bg-white/50 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <span className="text-xs font-bold text-[#09090b] tracking-tight">{col.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white text-zinc-700 border border-zinc-200 shadow-subtle">
                    {colAthletes.length}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {percentage}%
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-2 space-y-2.5 min-h-[500px] max-h-[calc(100vh-175px)] overflow-y-auto">
                {colAthletes.map((athlete) => (
                  <div
                    key={athlete.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, athlete.id)}
                    onClick={() => onSelectAthlete(athlete)}
                    className="p-3.5 rounded-lg bg-white border border-[#e4e4e7] shadow-card hover:border-zinc-400 hover:shadow-md cursor-grab active:cursor-grabbing transition-all group relative select-none"
                  >
                    {/* Top Row: Handle & Follower Tier */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Instagram className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                        <span className="text-xs font-bold text-[#09090b] group-hover:text-blue-600 transition-colors truncate">
                          {athlete.handle}
                        </span>
                        <a
                          href={`https://instagram.com/${athlete.handle.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-700 transition-opacity"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 shrink-0">
                        {athlete.follower_tier.split(' ')[0]}
                      </span>
                    </div>

                    {/* Full Name & Niche Pill */}
                    <div className="text-[11px] text-[#52525b] mb-2.5 flex items-center justify-between">
                      <span className="font-medium text-zinc-700 truncate">{athlete.full_name}</span>
                      <span className="text-[10px] font-medium text-zinc-600 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded">
                        {athlete.niche}
                      </span>
                    </div>

                    {/* Sizing Matrix Strip */}
                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-[#f4f4f5]">
                      <div className="bg-[#fafafa] border border-zinc-200/80 rounded px-1.5 py-1 text-center">
                        <span className="text-[9px] text-zinc-400 block uppercase font-mono">Top</span>
                        <span className="text-[11px] font-mono font-bold text-zinc-800">{athlete.top_size}</span>
                      </div>
                      <div className="bg-amber-50/60 border border-amber-200/70 rounded px-1.5 py-1 text-center">
                        <span className="text-[9px] text-amber-600 block uppercase font-mono">Bra</span>
                        <span className="text-[11px] font-mono font-bold text-amber-800">{athlete.sports_bra_size}</span>
                      </div>
                      <div className="bg-[#fafafa] border border-zinc-200/80 rounded px-1.5 py-1 text-center">
                        <span className="text-[9px] text-zinc-400 block uppercase font-mono">Inseam</span>
                        <span className="text-[11px] font-mono font-bold text-zinc-800">{athlete.inseam_length}</span>
                      </div>
                    </div>

                    {/* Fulfillment Tracking Pill */}
                    {athlete.tracking_number && (
                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-indigo-700 bg-indigo-50/70 border border-indigo-200/60 px-2 py-1 rounded">
                        <div className="flex items-center gap-1.5 truncate">
                          <Package className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span className="font-mono truncate">{athlete.courier_partner}: {athlete.tracking_number}</span>
                        </div>
                        <button
                          onClick={(e) => handleCopyTracking(e, athlete.tracking_number!)}
                          className="hover:text-indigo-950 p-0.5"
                          title="Copy Tracking Number"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Live Content / Post Link */}
                    {athlete.post_url && (
                      <div className="mt-2 text-[10px] text-emerald-800 flex items-center justify-between bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                        <span className="font-semibold flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-600" /> Content Live
                        </span>
                        <a
                          href={athlete.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-0.5 font-semibold underline hover:text-emerald-950"
                        >
                          View Reel <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}

                    {/* Advance Stage Micro-Action on Hover */}
                    {col.key !== 'ambassador' && (
                      <button
                        onClick={(e) => handleAdvanceStage(e, athlete)}
                        className="opacity-0 group-hover:opacity-100 absolute -bottom-2 -right-2 bg-zinc-900 text-white rounded-full p-1 shadow-md hover:bg-zinc-800 transition-all text-[9px] flex items-center gap-0.5 px-2"
                        title="Advance to next pipeline stage"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                {colAthletes.length === 0 && (
                  <div className="h-32 border border-dashed border-[#e4e4e7] rounded-lg flex flex-col items-center justify-center text-[11px] text-[#a1a1aa] gap-1">
                    <span>No creators in stage</span>
                    <span className="text-[10px] text-zinc-400">Drag cards here</span>
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
