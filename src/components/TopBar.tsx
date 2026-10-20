'use client';

import React from 'react';
import { Search, Plus, LayoutGrid, Table, X, Layers, Menu } from 'lucide-react';
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
  const { selectedDrop, setIsNewDropModalOpen, setIsMobileMenuOpen } = useDrops();
  const dropLabel = selectedDrop === 'all' ? 'All Drops' : selectedDrop;

  return (
    <header className="min-h-16 px-3 sm:px-6 md:px-8 bg-white border-b border-zinc-200/80 flex flex-wrap items-center justify-between gap-2.5 py-2.5 sm:py-0 shrink-0">
      {/* Left: Mobile Menu Trigger + Title & Drop + View Mode */}
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 -ml-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg md:hidden transition-colors"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Title & Drop Pill */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-semibold text-zinc-900 tracking-tight">{title}</h1>
            <button
              onClick={() => setIsNewDropModalOpen(true)}
              className="text-[10px] sm:text-[11px] font-medium text-zinc-500 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-900 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1"
              title="Click to create or manage drops"
            >
              <Layers className="w-3 h-3 text-zinc-400" />
              <span className="truncate max-w-[90px] sm:max-w-none">{dropLabel}</span>
            </button>
          </div>
          {subtitle && (
            <p className="hidden sm:block text-[11px] text-zinc-400 font-medium">{subtitle}</p>
          )}
        </div>

        {/* View Switcher (Kanban / Table) */}
        {onViewModeChange && (
          <div className="flex items-center bg-zinc-100/80 p-0.5 rounded-lg border border-zinc-200/60 ml-1 sm:ml-2">
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Board</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Table</span>
            </button>
          </div>
        )}
      </div>

      {/* Right: Search, Filter, and Action Button */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-initial justify-end">
        {/* Search Input */}
        <div className="relative flex-1 sm:flex-initial sm:w-48 md:w-56 lg:w-72">
          <Search className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search... (⌘K)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-12 sm:pr-14 py-1.5 text-xs bg-[#fbfbfb] border border-[#e4e4e7] rounded-md text-[#09090b] placeholder-[#a1a1aa] focus:outline-none focus:ring-1 focus:ring-[#18181b] focus:border-[#18181b] transition-all"
          />
          {searchTerm ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-7 sm:right-8 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:block absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 bg-zinc-200/80 px-1.5 py-0.5 rounded border border-zinc-300 hover:bg-zinc-300 transition-colors"
            title="Open Command Palette (⌘K)"
          >
            ⌘K
          </button>
        </div>

        {/* Niche Filter Dropdown (Tablets / Laptops / Desktops) */}
        {onFilterNicheChange && (
          <div className="relative hidden md:block">
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
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-semibold rounded-md shadow-subtle transition-all active:scale-[0.98] shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">{newButtonLabel}</span>
        </button>
      </div>
    </header>
  );
}
