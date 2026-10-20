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
  Activity,
  CheckCircle2,
  ChevronDown,
  Command,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [activeDrop, setActiveDrop] = useState('Drop 1 — Aero Seeding');
  const [isDropMenuOpen, setIsDropMenuOpen] = useState(false);

  const drops = ['Drop 1 — Aero Seeding', 'Drop 2 — Seamless Studio (Q1)'];

  const navItems = [
    {
      label: 'Athletes & Creators',
      href: '/',
      icon: Sparkles,
      count: '6 Active',
      shortcut: '⌘1',
    },
    {
      label: 'Wholesale & Studios',
      href: '/wholesale',
      icon: Building2,
      count: '4 Accounts',
      shortcut: '⌘2',
    },
    {
      label: 'VIP Waitlist & Press',
      href: '/contacts',
      icon: Users,
      count: '4 VIPs',
      shortcut: '⌘3',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#e4e4e7] h-screen flex flex-col justify-between shrink-0 select-none">
      {/* Brand & Workspace Header */}
      <div>
        <div className="h-14 px-4 border-b border-[#f4f4f5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#18181b] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-subtle">
              R
            </div>
            <div>
              <div className="font-semibold text-xs tracking-wider uppercase text-[#09090b]">Rivlet</div>
              <div className="text-[10px] text-[#71717a] font-medium leading-none">Activewear CRM</div>
            </div>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Live
          </span>
        </div>

        {/* Workspace Drop Selector */}
        <div className="px-3 pt-3 pb-2 relative">
          <button
            onClick={() => setIsDropMenuOpen(!isDropMenuOpen)}
            className="w-full bg-[#fbfbfb] hover:bg-[#f4f4f5] border border-[#e4e4e7] rounded-md px-3 py-2 flex items-center justify-between transition-colors text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-3.5 h-3.5 text-[#71717a] shrink-0" />
              <span className="text-xs font-semibold text-[#18181b] truncate">{activeDrop}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          </button>

          {isDropMenuOpen && (
            <div className="absolute left-3 right-3 top-12 bg-white rounded-lg shadow-xl border border-zinc-200 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
              {drops.map((drop) => (
                <button
                  key={drop}
                  onClick={() => {
                    setActiveDrop(drop);
                    setIsDropMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-50 ${
                    activeDrop === drop ? 'font-semibold text-zinc-900 bg-zinc-50' : 'text-zinc-600'
                  }`}
                >
                  <span className="truncate">{drop}</span>
                  {activeDrop === drop && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <div className="px-2 pt-2">
          <div className="px-2 pb-1.5 flex items-center justify-between text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
            <span>Pipelines</span>
            <span>Count</span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#18181b] text-white font-semibold shadow-subtle'
                      : 'text-[#52525b] hover:bg-[#f4f4f5] hover:text-[#09090b]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#71717a]'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-zinc-800 text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {item.count}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer & Ecosystem Bridge */}
      <div className="p-3 border-t border-[#f4f4f5] space-y-2.5">
        {/* Link to Admin Console */}
        <a
          href="https://rivlet-admin-console.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-[#52525b] hover:bg-[#fafafa] hover:text-[#09090b] border border-[#f4f4f5] transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-900" />
            <span className="text-[11px] font-medium">Rivlet Admin Console</span>
          </div>
          <ExternalLink className="w-3 h-3 text-[#a1a1aa] group-hover:text-zinc-900" />
        </a>

        {/* User & DB Status */}
        <div className="px-1 flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
              H
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#18181b] leading-tight">Harichandru</div>
              <div className="text-[9px] text-[#71717a] flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 inline" /> Supabase Pooler
              </div>
            </div>
          </div>
          <span className="text-[9px] text-zinc-400 font-mono bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
            v1.2
          </span>
        </div>
      </div>
    </aside>
  );
}
