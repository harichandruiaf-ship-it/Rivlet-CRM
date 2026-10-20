'use client';

import React from 'react';
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
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Athletes & Creators',
      href: '/',
      icon: Sparkles,
      badge: 'Drop 1',
    },
    {
      label: 'Wholesale & Studios',
      href: '/wholesale',
      icon: Building2,
      badge: 'B2B',
    },
    {
      label: 'VIP Waitlist & Press',
      href: '/contacts',
      icon: Users,
      badge: 'Launch',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#e4e4e7] h-screen flex flex-col justify-between shrink-0 select-none">
      {/* Brand & Workspace Header */}
      <div>
        <div className="h-14 px-4 border-b border-[#f4f4f5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#18181b] text-white flex items-center justify-center font-bold text-xs tracking-wider">
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
        <div className="px-3 pt-3 pb-2">
          <div className="bg-[#fbfbfb] border border-[#e4e4e7] rounded-md px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#71717a]" />
              <span className="text-xs font-medium text-[#18181b]">Drop 1 Seeding</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-2 pt-2">
          <div className="px-2 pb-1.5 text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
            Pipelines & Directory
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#f4f4f5] text-[#09090b] font-semibold'
                      : 'text-[#52525b] hover:bg-[#fafafa] hover:text-[#09090b]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#18181b]' : 'text-[#71717a]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {item.badge}
                    </span>
                  )}
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
          className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-[#52525b] hover:bg-[#fafafa] hover:text-[#09090b] border border-[#f4f4f5] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[11px] font-medium">Rivlet Admin Console</span>
          </div>
          <ExternalLink className="w-3 h-3 text-[#a1a1aa]" />
        </a>

        {/* User & DB Status */}
        <div className="px-1 flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center text-[10px] font-bold">
              H
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#18181b] leading-tight">Harichandru</div>
              <div className="text-[9px] text-[#71717a] flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 inline" /> Supabase Pooler
              </div>
            </div>
          </div>
          <span className="text-[9px] text-[#a1a1aa] font-mono">v1.0</span>
        </div>
      </div>
    </aside>
  );
}
