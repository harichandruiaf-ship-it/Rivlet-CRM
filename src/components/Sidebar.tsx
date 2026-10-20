'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Building2,
  Users,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { useDrops } from './DropContext';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropMenuOpen, setIsDropMenuOpen] = useState(false);
  const { drops, selectedDrop, setSelectedDrop, setIsNewDropModalOpen } = useDrops();

  const navItems = [
    {
      label: 'Athletes & Seeding',
      href: '/',
      icon: Sparkles,
      count: '6',
    },
    {
      label: 'Wholesale Studios',
      href: '/wholesale',
      icon: Building2,
      count: '4',
    },
    {
      label: 'VIP & Press List',
      href: '/contacts',
      icon: Users,
      count: '4',
    },
  ];

  const currentDropDisplay = selectedDrop === 'all' ? 'All Drops' : selectedDrop;

  return (
    <aside
      className={`bg-white border-r border-zinc-200/80 h-screen flex flex-col justify-between shrink-0 select-none transition-all duration-200 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Header & Brand Asset */}
      <div>
        <div className="h-16 px-4 border-b border-zinc-100 flex items-center justify-between">
          {isCollapsed ? (
            /* Collapsed: Show only Wave Logo Mark */
            <div className="w-full flex items-center justify-center">
              <Link href="/" title="Rivlet Activewear">
                <img
                  src="/brand/rivlet-logo-mark.png"
                  alt="Rivlet Logo"
                  className="h-6 w-auto object-contain hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>
          ) : (
            /* Expanded: Show Combined Logo & Wordmark */
            <div className="flex items-center justify-between w-full">
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/brand/rivlet-logo-combined.png"
                  alt="Rivlet Activewear"
                  className="h-6 w-auto object-contain hover:opacity-90 transition-opacity"
                />
              </Link>
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md hover:bg-zinc-50 transition-colors"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Drop Selector (Expanded Mode) */}
        {!isCollapsed && (
          <div className="px-3 pt-3 pb-2 relative">
            <button
              onClick={() => setIsDropMenuOpen(!isDropMenuOpen)}
              className="w-full bg-zinc-50/80 hover:bg-zinc-100/70 border border-zinc-200/70 rounded-lg px-3 py-2 flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Layers className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="text-xs font-semibold text-zinc-900 truncate">
                  {currentDropDisplay}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </button>

            {isDropMenuOpen && (
              <div className="absolute left-3 right-3 top-12 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setSelectedDrop('all');
                    setIsDropMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-50 ${
                    selectedDrop === 'all' ? 'font-semibold text-zinc-900 bg-zinc-50' : 'text-zinc-600'
                  }`}
                >
                  <span>All Drops</span>
                  {selectedDrop === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>}
                </button>

                {drops.map((drop) => (
                  <button
                    key={drop.id}
                    onClick={() => {
                      setSelectedDrop(drop.name);
                      setIsDropMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-50 ${
                      selectedDrop === drop.name ? 'font-semibold text-zinc-900 bg-zinc-50' : 'text-zinc-600'
                    }`}
                  >
                    <span className="truncate">{drop.name}</span>
                    {selectedDrop === drop.name && <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>}
                  </button>
                ))}

                <div className="pt-1 mt-1 border-t border-zinc-100">
                  <button
                    onClick={() => {
                      setIsDropMenuOpen(false);
                      setIsNewDropModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50/50 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Drop</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Collapsed Drop Indicator */}
        {isCollapsed && (
          <div className="p-2 flex justify-center">
            <button
              onClick={() => setIsNewDropModalOpen(true)}
              className="w-9 h-9 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 transition-colors"
              title="Create New Drop"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Section */}
        <div className={`pt-2 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {!isCollapsed && (
            <div className="px-2 pb-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Workspaces
            </div>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center rounded-lg transition-all ${
                    isCollapsed
                      ? 'justify-center w-10 h-10 mx-auto'
                      : 'justify-between px-3 py-2 text-xs font-medium'
                  } ${
                    isActive
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-zinc-800 text-zinc-300' : 'text-zinc-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Expansion Toggle & Eco Link */}
      <div className={`p-3 border-t border-zinc-100 ${isCollapsed ? 'space-y-3' : 'space-y-2.5'}`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <a
              href="https://rivlet-admin-console.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"
              title="Open Admin Console"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-9 h-9 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 transition-colors"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <a
              href="https://rivlet-admin-console.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 border border-zinc-200/60 transition-colors"
            >
              <span className="text-[11px] font-medium">Rivlet Admin Console</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>

            <div className="px-1 flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                  R
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-zinc-900 leading-tight">Rivlet HQ</div>
                  <div className="text-[9px] text-zinc-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 inline" /> Supabase
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
