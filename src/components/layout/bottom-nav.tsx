'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sun, Layers, Plus, BookOpen, Search } from 'lucide-react';

interface BottomNavProps {
  onCapturePress: () => void;
}

const navIcons: Record<string, React.ElementType> = {
  sun: Sun,
  layers: Layers,
  plus: Plus,
  'book-open': BookOpen,
  search: Search,
};

const navItems = [
  { label: 'Today', href: '/today', icon: 'sun' },
  { label: 'Memories', href: '/memories', icon: 'layers' },
  { label: 'Capture', href: '#capture', icon: 'plus', isCenter: true },
  { label: 'Library', href: '/library', icon: 'book-open' },
  { label: 'Ask', href: '/ask', icon: 'search' },
];

export function BottomNav({ onCapturePress }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="absolute bottom-0 left-0 right-0 glass-surface border-t border-white/[0.06]">
      <nav className="flex items-center justify-around px-4 pb-7 pt-2">
        {navItems.map((item) => {
          const Icon = navIcons[item.icon];
          const isActive = pathname === item.href || (item.href === '/today' && pathname === '/');

          if (item.isCenter) {
            return (
              <button
                key={item.label}
                onClick={onCapturePress}
                className="relative -mt-6"
                aria-label="Capture memory"
              >
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  className="w-14 h-14 rounded-full bg-amber flex items-center justify-center animate-pulse-glow"
                >
                  <Plus className="w-7 h-7 text-background" strokeWidth={2.5} />
                </motion.div>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-1 min-w-[56px]"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-1.5 rounded-xl transition-colors duration-200 ${
                  isActive ? 'bg-surface-3' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? 'text-amber' : 'text-text-dim'
                  }`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
              </motion.div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-foreground' : 'text-text-dim'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
