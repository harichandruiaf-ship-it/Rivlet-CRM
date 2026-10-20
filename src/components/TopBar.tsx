'use client';

import React from 'react';
import { Search, Plus, LayoutGrid, Table, Command, X, Filter, Layers } from 'lucide-react';
import { useDrops } from './DropContext';

interface TopBarProps {
  title: string;
  subtitle?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode?: 'kanban' | 'table';
  onViewModeChange?: (mode: 'kanban' | 'table') => void;
  filterNiche?: string;
  onFilterNicheChange?: (niche: string) => void;
  onNewClick: () => void;
  newButtonLabel?: string;
  onOpenCommandPalette?: () => void;
}

const NICHES = [
  'All Niches',
  'Pilates',
  'Yoga',
  'Hyrox & Strength',
  'Marathon & Running',
  'CrossFit & Functional',
  'Mobility & Physio',
];

export default function TopBar({
  title,
  subtitle,
  searchTerm,
  onSearchChange,
  viewMode = 'kanban',
  onViewModeChange,
  filterNiche,
  onFilterNicheChange,
  onNewClick,
  newButtonLabel = '+ New Record',
  onOpenCommandPalette,
}: TopBarProps) {
  const { selectedDrop, setIsNewDropModalOpen } = useDrops();
  const dropLabel = selectedDrop === 'all' ? 'All Drops' : selectedDrop;

  return (
    <header className="h-16 px-8 bg-white border-b border-zinc-200/80 flex items-center justify-between shrink-0">
      {/* Title & Drop & View Switcher */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-zinc-900 tracking-tight">{title}</h1>
            <button
              onClick={() => setIsNewDropModalOpen(true)}
              className="text-[11px] font-medium text-zinc-500 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-900 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1"
              title="Click to create a new drop"
            >
              <Layers className="w-3 h-3 text-zinc-400" />
              <span>{dropLabel}</span>
            </button>
          </div>
          {subtitle && <p className="text-[11px] text-zinc-400 font-medium">{subtitle}</p>}
        </div>

        {onViewModeChange && (
          <div className="flex items-center bg-zinc-100/80 p-0.5 rounded-lg border border-zinc-200/60 ml-2">
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        )}
      </div>

      {/* Search, Filter, and Action */}
      <div className="flex items-center gap-3">
        {/* Command Palette Trigger & Search Input */}
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search handle, sizing, name... (⌘K)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-14 py-1.5 text-xs bg-[#fbfbfb] border border-[#e4e4e7] rounded-md text-[#09090b] placeholder-[#a1a1aa] focus:outline-none focus:ring-1 focus:ring-[#18181b] focus:border-[#18181b] transition-all"
          />
          {searchTerm ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
          <button
            onClick={onOpenCommandPalette}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 bg-zinc-200/80 px-1.5 py-0.5 rounded border border-zinc-300 hover:bg-zinc-300 transition-colors"
            title="Open Command Palette (⌘K)"
          >
            ⌘K
          </button>
        </div>

        {/* Niche Filter Dropdown */}
        {onFilterNicheChange && (
          <div className="relative">
            <select
              value={filterNiche || 'All Niches'}
              onChange={(e) => onFilterNicheChange(e.target.value)}
              className="text-xs bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-2.5 py-1.5 text-[#52525b] font-medium focus:outline-none focus:ring-1 focus:ring-[#18181b] cursor-pointer"
            >
              {NICHES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          onClick={onNewClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-semibold rounded-md shadow-subtle transition-all active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{newButtonLabel}</span>
        </button>
      </div>
    </header>
  );
}
