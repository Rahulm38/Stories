'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface AskBarProps {
  placeholder?: string;
}

const rotatingExamples = [
  'What did I work on this week?',
  'What happened in Goa?',
  'What did Indistractable teach me?',
  'Who did I meet recently?',
];

export function AskBar({ placeholder = 'Ask your memory...' }: AskBarProps) {
  const [exampleIndex, setExampleIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setExampleIndex((i) => (i + 1) % rotatingExamples.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="/ask">
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 bg-surface-1 rounded-2xl px-4 py-3.5 border border-white/[0.04] cursor-pointer hover:border-amber/10 transition-all duration-300 group"
      >
        <Search className="w-4 h-4 text-text-dim group-hover:text-amber/60 transition-colors flex-shrink-0" />
        <div className="flex-1 min-w-0 overflow-hidden">
          <motion.p
            key={exampleIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-text-dim truncate"
          >
            {rotatingExamples[exampleIndex]}
          </motion.p>
        </div>
      </motion.div>
    </Link>
  );
}
