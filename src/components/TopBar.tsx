'use client';

import React from 'react';
import { Search, Plus, LayoutGrid, Table, Filter } from 'lucide-react';

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
}: TopBarProps) {
  return (
    <header className="h-14 px-6 bg-white border-b border-[#e4e4e7] flex items-center justify-between shrink-0">
      {/* Title & View Switcher */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-semibold text-[#09090b] tracking-tight">{title}</h1>
          {subtitle && <p className="text-[11px] text-[#71717a]">{subtitle}</p>}
        </div>

        {onViewModeChange && (
          <div className="flex items-center bg-[#f4f4f5] p-0.5 rounded-md border border-[#e4e4e7] ml-2">
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#09090b] shadow-subtle'
                  : 'text-[#71717a] hover:text-[#09090b]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded ${
                viewMode === 'table'
                  ? 'bg-white text-[#09090b] shadow-subtle'
                  : 'text-[#71717a] hover:text-[#09090b]'
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
        {/* Search Input */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search handle, name... (⌘K)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#fbfbfb] border border-[#e4e4e7] rounded-md text-[#09090b] placeholder-[#a1a1aa] focus:outline-none focus:ring-1 focus:ring-[#18181b] focus:border-[#18181b] transition-all"
          />
        </div>

        {/* Niche Filter Dropdown */}
        {onFilterNicheChange && (
          <div className="relative">
            <select
              value={filterNiche || 'All Niches'}
              onChange={(e) => onFilterNicheChange(e.target.value)}
              className="text-xs bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-2.5 py-1.5 text-[#52525b] focus:outline-none focus:ring-1 focus:ring-[#18181b] cursor-pointer"
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
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-medium rounded-md shadow-subtle transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{newButtonLabel}</span>
        </button>
      </div>
    </header>
  );
}
