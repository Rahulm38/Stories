'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { MemoryCard } from '@/components/shared/memory-card';
import { appCopy } from '@/data/copy';
import { mockMemories } from '@/data/memories-mock';
import { MemoryType } from '@/types';

const filterMap: Record<string, MemoryType | 'all'> = {
  All: 'all',
  Life: 'life',
  Work: 'work',
  Trips: 'trip',
  People: 'person',
  Places: 'place',
  Decisions: 'decision',
  Books: 'book',
};

export default function MemoriesPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMemories = mockMemories.filter((m) => {
    const matchesFilter = activeFilter === 'All' || m.type === filterMap[activeFilter];
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AppShell>
      <div className="px-5 pt-2 pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-4"
        >
          <h1 className="text-xl font-semibold text-foreground">{appCopy.memories.title}</h1>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative mb-4"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={appCopy.memories.searchPlaceholder}
            className="w-full bg-surface-1 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-text-dim border border-white/[0.04] focus:outline-none focus:ring-1 focus:ring-amber/30 focus:border-amber/30 transition-all"
          />
        </motion.div>

        {/* Filter Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 mb-5"
        >
          {appCopy.memories.filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-amber text-background'
                  : 'bg-surface-1 text-muted-foreground border border-white/[0.04] hover:bg-surface-2'
              }`}
            >
              {filter}
            </button>
          ))}
        </motion.div>

        {/* Memory Count */}
        <p className="text-xs text-text-dim mb-3">
          {filteredMemories.length} {filteredMemories.length === 1 ? 'memory' : 'memories'}
        </p>

        {/* Memory Cards */}
        <div className="space-y-3">
          {filteredMemories.map((memory, i) => (
            <MemoryCard key={memory.id} memory={memory} index={i} />
          ))}
        </div>

        {filteredMemories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <p className="text-sm text-muted-foreground">No memories match this filter.</p>
            <button
              onClick={() => { setActiveFilter('All'); setSearchQuery(''); }}
              className="text-xs text-amber mt-2 hover:underline"
            >
              Clear filters
            </button>
          </motion.div>
        )}

        <div className="h-4" />
      </div>
    </AppShell>
  );
}
