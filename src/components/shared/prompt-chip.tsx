'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PromptChipProps {
  label: string;
  onClick?: () => void;
  index?: number;
}

export function PromptChip({ label, onClick, index = 0 }: PromptChipProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex-shrink-0 px-3.5 py-2 rounded-xl bg-surface-1 text-xs text-muted-foreground border border-white/[0.04] hover:border-amber/15 hover:text-foreground hover:bg-surface-2 transition-all duration-200 whitespace-nowrap"
    >
      {label}
    </motion.button>
  );
}
