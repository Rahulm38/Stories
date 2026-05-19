'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Link2 } from 'lucide-react';
import { Memory } from '@/types';
import { TypeChip } from './type-chip';
import Link from 'next/link';

interface ConnectionCardProps {
  memory: Memory;
  reason?: string;
}

export function ConnectionCard({ memory, reason = 'Similar memory' }: ConnectionCardProps) {
  return (
    <Link href={`/memories/${memory.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-surface-1 rounded-2xl p-4 border border-amber/10 animate-connection-glow cursor-pointer hover:bg-surface-2 transition-colors"
      >
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="w-3.5 h-3.5 text-amber" />
          <span className="text-[10px] text-amber font-medium">This connects to...</span>
        </div>

        <h4 className="text-sm font-medium text-foreground">{memory.title}</h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{memory.summary}</p>

        <div className="flex items-center gap-2 mt-2.5">
          <TypeChip type={memory.type} />
          <span className="text-[10px] text-text-dim">{reason}</span>
        </div>
      </motion.div>
    </Link>
  );
}
