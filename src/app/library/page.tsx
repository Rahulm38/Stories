'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Sparkles, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { TypeChip } from '@/components/shared/type-chip';
import { appCopy } from '@/data/copy';
import { mockBookIdeas } from '@/data/books-mock';
import Link from 'next/link';

export default function LibraryPage() {
  return (
    <AppShell>
      <div className="px-5 pt-2 pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-5"
        >
          <h1 className="text-xl font-semibold text-foreground">{appCopy.library.title}</h1>
          <p className="text-xs text-text-dim mt-1">{appCopy.library.subtitle}</p>
        </motion.div>

        {/* Capture Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-surface-1 rounded-2xl p-4 border border-white/[0.04] mb-5"
        >
          <p className="text-sm text-muted-foreground mb-3">{appCopy.library.capturePrompt}</p>
          <div className="flex gap-2">
            {Object.entries(appCopy.library.actions).map(([key, label]) => (
              <button
                key={key}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-surface-2 text-xs font-medium text-muted-foreground hover:bg-surface-3 hover:text-foreground transition-all duration-200 border border-white/[0.04]"
              >
                {key === 'captureIdea' && <Sparkles className="w-3 h-3" />}
                {key === 'addQuote' && <Plus className="w-3 h-3" />}
                {key === 'scanPage' && <BookOpen className="w-3 h-3" />}
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Book Ideas */}
        <div className="space-y-3">
          {mockBookIdeas.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
            >
              <Link href={`/library/${book.id}`}>
                <div className="bg-surface-1 rounded-2xl p-4 border border-white/[0.04] card-hover cursor-pointer group">
                  {/* Book cover accent */}
                  <div className="flex gap-3">
                    <div
                      className="w-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: book.coverColor || '#E8A946' }}
                    />
                    <div className="flex-1 min-w-0">
                      {/* Source */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-text-dim font-medium">{book.author}</span>
                        <TypeChip type="book" />
                      </div>

                      <h3 className="text-sm font-semibold text-foreground group-hover:text-amber transition-colors">
                        {book.sourceTitle}
                      </h3>

                      {/* Quote */}
                      {book.quote && (
                        <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-2">
                          &ldquo;{book.quote}&rdquo;
                        </p>
                      )}

                      {/* One-liner meaning */}
                      <p className="text-xs text-foreground/80 mt-2 line-clamp-1">
                        {book.meaning}
                      </p>

                      {/* Use it when */}
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <span className="text-[10px] text-sage font-medium">Use it when:</span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {book.useItWhen}
                        </span>
                      </div>

                      {/* Practice */}
                      {book.practiceStrength !== undefined && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-16 h-1 rounded-full bg-surface-3 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-mint/60 transition-all duration-500"
                              style={{ width: `${book.practiceStrength}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-text-dim">{book.practiceStrength}%</span>
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-text-dim mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="h-4" />
      </div>
    </AppShell>
  );
}
