'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  Building2,
  Users,
  Plus,
  ArrowRight,
  ExternalLink,
  Layers,
  Ruler,
} from 'lucide-react';
import { AthleteCreator, WholesaleAccount } from '@/lib/types';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon: any;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewAthlete?: () => void;
  onSelectAthlete?: (athlete: AthleteCreator) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenNewAthlete,
  onSelectAthlete,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [athletes, setAthletes] = useState<AthleteCreator[]>([]);
  const [wholesale, setWholesale] = useState<WholesaleAccount[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      // Pre-fetch athletes and wholesale for instant search
      fetch('/api/athletes')
        .then((r) => r.json())
        .then((d) => d.success && setAthletes(d.data))
        .catch(() => {});

      fetch('/api/wholesale')
        .then((r) => r.json())
        .then((d) => d.success && setWholesale(d.data))
        .catch(() => {});
    }
  }, [isOpen]);

  // Global keydown handler for ⌘K or Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Command items
  const staticCommands: CommandItem[] = [
    {
      id: 'cmd-new-athlete',
      title: 'Add New Athlete / Creator',
      category: 'Actions',
      icon: Plus,
      action: () => {
        onClose();
        onOpenNewAthlete?.();
      },
    },
    {
      id: 'cmd-goto-athletes',
      title: 'Go to Athlete & Creator Hub',
      category: 'Navigation',
      icon: Sparkles,
      action: () => {
        onClose();
        router.push('/');
      },
    },
    {
      id: 'cmd-goto-wholesale',
      title: 'Go to B2B Wholesale & Studios',
      category: 'Navigation',
      icon: Building2,
      action: () => {
        onClose();
        router.push('/wholesale');
      },
    },
    {
      id: 'cmd-goto-contacts',
      title: 'Go to VIP Waitlist & Press',
      category: 'Navigation',
      icon: Users,
      action: () => {
        onClose();
        router.push('/contacts');
      },
    },
    {
      id: 'cmd-goto-admin',
      title: 'Open Rivlet Admin Console (Manufacturing & Costing)',
      category: 'External',
      icon: ExternalLink,
      action: () => {
        window.open('https://rivlet-admin-console.vercel.app/', '_blank');
        onClose();
      },
    },
  ];

  // Dynamic search items from athletes & wholesale
  const filteredAthletes: CommandItem[] = athletes
    .filter(
      (a) =>
        a.handle.toLowerCase().includes(query.toLowerCase()) ||
        a.full_name.toLowerCase().includes(query.toLowerCase()) ||
        a.niche.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 4)
    .map((a) => ({
      id: `athlete-${a.id}`,
      title: `${a.handle} — ${a.full_name} (${a.niche})`,
      subtitle: `Top: ${a.top_size} | Bra: ${a.sports_bra_size} | Inseam: ${a.inseam_length}`,
      category: 'Athletes & Creators',
      icon: Sparkles,
      action: () => {
        onClose();
        onSelectAthlete?.(a);
      },
    }));

  const filteredWholesale: CommandItem[] = wholesale
    .filter(
      (w) =>
        w.business_name.toLowerCase().includes(query.toLowerCase()) ||
        w.contact_name.toLowerCase().includes(query.toLowerCase()) ||
        w.location.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 3)
    .map((w) => ({
      id: `wholesale-${w.id}`,
      title: `${w.business_name} (${w.account_type})`,
      subtitle: `${w.location} • ₹${Number(w.estimated_order_value).toLocaleString('en-IN')}`,
      category: 'Studios & Accounts',
      icon: Building2,
      action: () => {
        onClose();
        router.push('/wholesale');
      },
    }));

  const filteredStatic = staticCommands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  const allItems: CommandItem[] = [...filteredAthletes, ...filteredWholesale, ...filteredStatic];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-24 bg-black/40 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-xl bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-zinc-200 px-4 py-3 flex items-center gap-3 bg-zinc-50/70">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search creators, studios, sizing..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none"
          />
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-600">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No matching commands or records found.
            </div>
          ) : (
            allItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                    isSelected ? 'bg-zinc-100 text-zinc-900 font-medium' : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-zinc-900' : 'text-zinc-400'}`} />
                    <div className="truncate">
                      <div className="truncate text-zinc-900 font-semibold">{item.title}</div>
                      {item.subtitle ? (
                        <div className="text-[11px] text-zinc-500 font-mono truncate">{item.subtitle}</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-50 border border-zinc-200">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="h-9 px-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-zinc-200 px-1 py-0.5 rounded text-[10px]">↑</kbd> <kbd className="font-mono bg-zinc-200 px-1 py-0.5 rounded text-[10px]">↓</kbd> to navigate</span>
            <span><kbd className="font-mono bg-zinc-200 px-1 py-0.5 rounded text-[10px]">↵</kbd> to select</span>
          </div>
          <div className="font-mono text-[10px] text-zinc-400">Rivlet Command Palette</div>
        </div>
      </div>
    </div>
  );
}
