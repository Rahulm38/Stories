'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MoreHorizontal, Link2 } from 'lucide-react';
import { Memory } from '@/types';
import { TypeChip } from './type-chip';

interface MemoryCardProps {
  memory: Memory;
  index?: number;
  compact?: boolean;
  showMenu?: boolean;
}

export function MemoryCard({ memory, index = 0, compact = false, showMenu = true }: MemoryCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: 'easeOut' }}
    >
      <Link href={`/memories/${memory.id}`}>
        <div className="bg-surface-1 rounded-2xl p-4 border border-white/[0.04] card-hover cursor-pointer group">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-amber transition-colors">
                {memory.title}
              </h3>

              {/* Summary */}
              {!compact && (
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                  {memory.summary}
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-2 mt-2.5">
                <TypeChip type={memory.type} />
                <span className="text-[10px] text-text-dim">{memory.timeAgo}</span>
                {memory.connectedMemoryIds && memory.connectedMemoryIds.length > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-amber/70">
                    <Link2 className="w-3 h-3" />
                    {memory.connectedMemoryIds.length}
                  </span>
                )}
                {memory.practiceStrength !== undefined && memory.practiceStrength > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-1 rounded-full bg-surface-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-mint/60 transition-all duration-500"
                        style={{ width: `${memory.practiceStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Three-dot menu */}
            {showMenu && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 rounded-lg hover:bg-surface-3 transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="w-4 h-4 text-text-dim" />
              </button>
            )}
          </div>

          {/* Dropdown menu */}
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-4 mt-1 bg-surface-2 rounded-xl border border-white/[0.06] shadow-xl py-1 z-50"
              onClick={(e) => e.preventDefault()}
            >
              {['Edit', 'Add connection', 'Add recall card', 'Pin', 'Archive', 'Delete'].map((action) => (
                <button
                  key={action}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-surface-3 transition-colors ${
                    action === 'Delete' ? 'text-coral' : 'text-foreground'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {action}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
