'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DropItem } from '@/lib/types';
import { useToast } from './ui/Toast';

interface DropContextType {
  drops: DropItem[];
  selectedDrop: string; // 'Drop 1', 'Drop 2', or 'all'
  setSelectedDrop: (dropName: string) => void;
  createDrop: (name: string, description?: string, targetDate?: string) => Promise<boolean>;
  refreshDrops: () => Promise<void>;
  isNewDropModalOpen: boolean;
  setIsNewDropModalOpen: (open: boolean) => void;
}

const DropContext = createContext<DropContextType | undefined>(undefined);

export function DropProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [drops, setDrops] = useState<DropItem[]>([]);
  const [selectedDrop, setSelectedDrop] = useState<string>('all');
  const [isNewDropModalOpen, setIsNewDropModalOpen] = useState(false);

  const refreshDrops = useCallback(async () => {
    try {
      const res = await fetch('/api/drops');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setDrops(data.data);
      }
    } catch (err) {
      console.error('Failed to load drops:', err);
    }
  }, []);

  useEffect(() => {
    refreshDrops();
  }, [refreshDrops]);

  const createDrop = async (name: string, description?: string, targetDate?: string) => {
    try {
      const res = await fetch('/api/drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, target_date: targetDate, status: 'planning' }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshDrops();
        setSelectedDrop(data.data.name);
        showToast(`Created ${data.data.name} successfully!`);
        return true;
      } else {
        showToast(data.error || 'Failed to create drop', 'error');
        return false;
      }
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
      return false;
    }
  };

  return (
    <DropContext.Provider
      value={{
        drops,
        selectedDrop,
        setSelectedDrop,
        createDrop,
        refreshDrops,
        isNewDropModalOpen,
        setIsNewDropModalOpen,
      }}
    >
      {children}
    </DropContext.Provider>
  );
}

export function useDrops() {
  const context = useContext(DropContext);
  if (!context) {
    throw new Error('useDrops must be used within a DropProvider');
  }
  return context;
}
