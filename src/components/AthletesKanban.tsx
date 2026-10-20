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
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useDrops } from './DropContext';

interface AthletesKanbanProps {
  athletes: AthleteCreator[];
  onSelectAthlete: (athlete: AthleteCreator) => void;
  onUpdateStage: (id: string, newStage: SeedingStage) => Promise<void>;
}

const STAGES: { key: SeedingStage; label: string }[] = [
  { key: 'scouted', label: 'Scouted' },
  { key: 'contacted', label: 'Pitch Sent' },
  { key: 'sizing_confirmed', label: 'Sizing Confirmed' },
  { key: 'kit_shipped', label: 'Kit Shipped' },
  { key: 'post_live', label: 'Post Live' },
  { key: 'ambassador', label: 'Ambassador' },
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
  const { selectedDrop } = useDrops();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<SeedingStage | null>(null);

  // Filter by drop if specific drop selected
  const displayAthletes = selectedDrop === 'all'
    ? athletes
    : athletes.filter((a) => (a.target_drop || '').toLowerCase() === selectedDrop.toLowerCase());

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
    showToast(`Copied tracking ${tracking}`);
  };

  return (
    <div className="flex-1 overflow-x-auto p-3 sm:p-5 md:p-8 pb-24 md:pb-8 bg-[#fafafa] touch-pan-x">
      <div className="flex gap-4 sm:gap-6 min-w-[1100px] sm:min-w-[1280px] h-full items-start">
        {STAGES.map((col) => {
          const colAthletes = displayAthletes.filter((a) => a.stage === col.key);
          const isOver = dragOverStage === col.key;

          return (
            <div
              key={col.key}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`w-72 shrink-0 flex flex-col transition-all duration-150 rounded-2xl ${
                isOver ? 'bg-zinc-100/90 ring-1 ring-zinc-300' : ''
              }`}
            >
              {/* Minimal Column Header */}
              <div className="pb-3 px-1 flex items-center justify-between border-b border-zinc-200/80 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-900 tracking-tight">
                    {col.label}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {colAthletes.length}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 min-h-[480px] max-h-[calc(100vh-170px)] overflow-y-auto pr-1">
                {colAthletes.map((athlete) => (
                  <div
                    key={athlete.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, athlete.id)}
                    onClick={() => onSelectAthlete(athlete)}
                    className="p-4 rounded-xl bg-white border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-zinc-400/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] cursor-grab active:cursor-grabbing transition-all group relative select-none"
                  >
                    {/* Header: Handle & External Link */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-xs text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
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
                      <span className="text-[11px] text-zinc-400">
                        {athlete.niche}
                      </span>
                    </div>

                    {/* Creator Full Name */}
                    <div className="text-[11px] text-zinc-500 mb-3 truncate">
                      {athlete.full_name}
                    </div>

                    {/* Minimalist Sizing Row (No chunky boxes, pure typography) */}
                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-600">
                      <span>Top {athlete.top_size}</span>
                      <span className="text-zinc-300">·</span>
                      <span>{athlete.sports_bra_size !== 'N/A' ? athlete.sports_bra_size : 'Bra —'}</span>
                      <span className="text-zinc-300">·</span>
                      <span>{athlete.inseam_length}</span>
                    </div>

                    {/* Minimal Dispatch / Post Indicator */}
                    {athlete.tracking_number && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-50 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                        <span className="truncate">{athlete.courier_partner}: {athlete.tracking_number}</span>
                        <button
                          onClick={(e) => handleCopyTracking(e, athlete.tracking_number!)}
                          className="text-zinc-400 hover:text-zinc-700 p-0.5"
                          title="Copy AWB"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {athlete.post_url && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-50 flex items-center justify-between text-[11px] text-emerald-700 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Reel Published</span>
                        </span>
                        <a
                          href={athlete.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-zinc-400 hover:text-zinc-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Minimal Hover Next Step Action */}
                    {col.key !== 'ambassador' && (
                      <button
                        onClick={(e) => handleAdvanceStage(e, athlete)}
                        className="opacity-0 group-hover:opacity-100 absolute bottom-3 right-3 bg-zinc-900 text-white rounded-md p-1 shadow hover:bg-zinc-800 transition-all text-[10px] flex items-center gap-0.5 px-2 font-medium"
                        title="Move to next stage"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                {colAthletes.length === 0 && (
                  <div className="h-32 border border-dashed border-zinc-200/80 rounded-xl flex items-center justify-center text-[11px] text-zinc-400">
                    No creators in this stage
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
