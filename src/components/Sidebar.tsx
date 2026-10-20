'use client';

import React, { useState, useEffect } from 'react';
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
  X,
  Menu,
} from 'lucide-react';
import { useDrops } from './DropContext';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropMenuOpen, setIsDropMenuOpen] = useState(false);
  const {
    drops,
    selectedDrop,
    setSelectedDrop,
    setIsNewDropModalOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useDrops();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropMenuOpen(false);
  }, [pathname, setIsMobileMenuOpen]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

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
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP & LAPTOP DOCKED SIDEBAR (md:flex)             */}
      {/* ======================================================== */}
      <aside
        className={`bg-white border-r border-zinc-200/80 h-screen hidden md:flex flex-col justify-between shrink-0 select-none transition-all duration-200 ease-in-out ${
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
                <Layers className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <div className="px-2 py-2">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Workspaces
              </div>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

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

      {/* ======================================================== */}
      {/* 2. MOBILE OFF-CANVAS SLIDE-OVER DRAWER (md:hidden)       */}
      {/* ======================================================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-150">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Surface */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slide-in">
            <div>
              {/* Header with combined logo and close button */}
              <div className="h-16 px-4 border-b border-zinc-100 flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <img
                    src="/brand/rivlet-logo-combined.png"
                    alt="Rivlet Activewear"
                    className="h-6 w-auto object-contain"
                  />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Drop Selector */}
              <div className="p-4 border-b border-zinc-100">
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Collection Release
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedDrop}
                    onChange={(e) => setSelectedDrop(e.target.value)}
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-900 focus:outline-none"
                  >
                    <option value="all">All Drops</option>
                    {drops.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsNewDropModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                    title="Create New Drop"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-3 space-y-1">
                <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Workspaces
                </div>
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition-all ${
                        isActive
                          ? 'bg-zinc-900 text-white font-semibold'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isActive ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {item.count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-zinc-100 space-y-3">
              <a
                href="https://rivlet-admin-console.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-600 hover:bg-zinc-50 border border-zinc-200 transition-colors"
              >
                <span className="text-[11px] font-medium">Rivlet Admin Console</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </a>

              <div className="flex items-center gap-2 pt-1">
                <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                  R
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-zinc-900">Rivlet HQ</div>
                  <div className="text-[9px] text-zinc-400 font-mono">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 inline mr-1" />
                    Supabase Connected
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MOBILE BOTTOM TAB NAVIGATION (md:hidden)              */}
      {/* ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 px-3 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
                isActive ? 'text-zinc-900 font-semibold' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`} />
              <span className="text-[10px] tracking-tight">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}

        {/* Drop Quick Button */}
        <button
          onClick={() => setIsNewDropModalOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 text-zinc-400 hover:text-zinc-900 transition-colors"
          title="Create or View Drops"
        >
          <Layers className="w-4 h-4 text-zinc-500" />
          <span className="text-[10px] tracking-tight font-medium">Drops</span>
        </button>

        {/* More Menu Drawer Trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 text-zinc-400 hover:text-zinc-900 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-4 h-4 text-zinc-600" />
          <span className="text-[10px] tracking-tight font-medium">Menu</span>
        </button>
      </nav>
    </>
  );
}
