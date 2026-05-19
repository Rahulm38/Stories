'use client';

import React from 'react';
import { MemoryType } from '@/types';

const typeConfig: Record<MemoryType, { label: string; color: string; bg: string }> = {
  life: { label: 'Life', color: 'text-terracotta', bg: 'bg-terracotta/15' },
  work: { label: 'Work', color: 'text-soft-blue', bg: 'bg-soft-blue/15' },
  trip: { label: 'Trip', color: 'text-amber', bg: 'bg-amber/15' },
  person: { label: 'Person', color: 'text-lavender', bg: 'bg-lavender/15' },
  place: { label: 'Place', color: 'text-mint', bg: 'bg-mint/15' },
  decision: { label: 'Decision', color: 'text-coral', bg: 'bg-coral/15' },
  process: { label: 'Process', color: 'text-slate-muted', bg: 'bg-slate-muted/15' },
  book: { label: 'Book', color: 'text-sage', bg: 'bg-sage/15' },
  quote: { label: 'Quote', color: 'text-sage', bg: 'bg-sage/15' },
  task: { label: 'Task', color: 'text-soft-blue', bg: 'bg-soft-blue/15' },
};

interface TypeChipProps {
  type: MemoryType;
  size?: 'sm' | 'md';
}

export function TypeChip({ type, size = 'sm' }: TypeChipProps) {
  const config = typeConfig[type] || typeConfig.life;

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium ${config.bg} ${config.color} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {config.label}
    </span>
  );
}
