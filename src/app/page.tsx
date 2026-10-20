'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TopBar from '@/components/TopBar';
import AthletesKanban from '@/components/AthletesKanban';
import AthletesTable from '@/components/AthletesTable';
import AthleteDrawer from '@/components/AthleteDrawer';
import NewAthleteModal from '@/components/NewAthleteModal';
import CommandPalette from '@/components/CommandPalette';
import { AthleteCreator, SeedingStage } from '@/lib/types';
import { Sparkles, Package, Award, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AthletesPage() {
  const { showToast } = useToast();
  const [athletes, setAthletes] = useState<AthleteCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNiche, setFilterNiche] = useState('All Niches');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteCreator | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const fetchAthletes = async () => {
    try {
      const res = await fetch('/api/athletes');
      const data = await res.json();
      if (data.success) {
        setAthletes(data.data);
      }
    } catch (err) {
      console.error('Failed to load athletes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  // Filter athletes by search & niche
  const filteredAthletes = useMemo(() => {
    return athletes.filter((a) => {
      const matchesSearch =
        !searchTerm ||
        a.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.top_size.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.bottom_size.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesNiche =
        filterNiche === 'All Niches' || a.niche === filterNiche;

      return matchesSearch && matchesNiche;
    });
  }, [athletes, searchTerm, filterNiche]);

  // Stage update handler (Optimistic UI update)
  const handleUpdateStage = async (id: string, newStage: SeedingStage) => {
    setAthletes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, stage: newStage } : a))
    );

    try {
      await fetch('/api/athletes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stage: newStage }),
      });
    } catch (err) {
      console.error('Failed to update stage:', err);
      fetchAthletes();
    }
  };

  // Full profile save handler from Drawer
  const handleSaveAthlete = async (updated: Partial<AthleteCreator>) => {
    if (!updated.id) return;

    setAthletes((prev) =>
      prev.map((a) => (a.id === updated.id ? ({ ...a, ...updated } as AthleteCreator) : a))
    );
    setSelectedAthlete((prev) => (prev ? ({ ...prev, ...updated } as AthleteCreator) : null));

    try {
      await fetch('/api/athletes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to save athlete:', err);
      fetchAthletes();
    }
  };

  // Delete athlete handler
  const handleDeleteAthlete = async (id: string) => {
    setAthletes((prev) => prev.filter((a) => a.id !== id));
    setSelectedAthlete(null);

    try {
      await fetch(`/api/athletes?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete athlete:', err);
      fetchAthletes();
    }
  };

  // Metric summaries
  const totalShipped = athletes.filter(
    (a) => a.stage === 'kit_shipped' || a.stage === 'post_live' || a.stage === 'ambassador'
  ).length;
  const totalPostsLive = athletes.filter(
    (a) => a.stage === 'post_live' || a.stage === 'ambassador'
  ).length;
  const totalAmbassadors = athletes.filter((a) => a.stage === 'ambassador').length;

  return (
    <div className="flex flex-col h-full bg-[#fbfbfb]">
      {/* Top Header Bar */}
      <TopBar
        title="Athletes & Seeding"
        subtitle="Creator gifting pipeline and fit profiles"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterNiche={filterNiche}
        onFilterNicheChange={setFilterNiche}
        onNewClick={() => setIsNewModalOpen(true)}
        newButtonLabel="+ Add Athlete"
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main View Area */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-xs text-[#71717a] gap-2">
          <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <span>Loading activewear creators...</span>
        </div>
      ) : viewMode === 'kanban' ? (
        <AthletesKanban
          athletes={filteredAthletes}
          onSelectAthlete={setSelectedAthlete}
          onUpdateStage={handleUpdateStage}
        />
      ) : (
        <AthletesTable
          athletes={filteredAthletes}
          onSelectAthlete={setSelectedAthlete}
          onUpdateStage={handleUpdateStage}
        />
      )}

      {/* Bottom KPI Metrics Ticker (Desktop / Laptops / Tablets) */}
      <div className="h-10 px-4 sm:px-6 bg-white border-t border-[#e4e4e7] hidden md:flex items-center justify-between text-xs text-[#71717a] shrink-0 select-none">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
            <span>
              Creators:{' '}
              <strong className="text-[#09090b] font-semibold">{athletes.length}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              Kits Dispatched:{' '}
              <strong className="text-indigo-900 font-semibold">{totalShipped}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Content Live:{' '}
              <strong className="text-emerald-900 font-semibold">{totalPostsLive}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-purple-600" />
            <span>
              Ambassadors:{' '}
              <strong className="text-purple-900 font-semibold">{totalAmbassadors}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-[#a1a1aa]">
          <span>Press ⌘K for Command Bar</span>
          <span>•</span>
          <span>Supabase Singapore (aws-0)</span>
        </div>
      </div>

      {/* Slide-Over Detail Drawer */}
      <AthleteDrawer
        athlete={selectedAthlete}
        onClose={() => setSelectedAthlete(null)}
        onSave={handleSaveAthlete}
        onDelete={handleDeleteAthlete}
      />

      {/* New Athlete Modal */}
      <NewAthleteModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={(newAthlete) => {
          setAthletes((prev) => [newAthlete, ...prev]);
          setSelectedAthlete(newAthlete);
          showToast(`Added ${newAthlete.handle} to Drop 1 pipeline`);
        }}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenNewAthlete={() => setIsNewModalOpen(true)}
        onSelectAthlete={(athlete) => setSelectedAthlete(athlete)}
      />
    </div>
  );
}
