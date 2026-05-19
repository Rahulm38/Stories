'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Sparkles, Target, Link2, FlipHorizontal, Brain } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { ConnectionCard } from '@/components/shared/connection-card';
import { Button } from '@/components/ui/button';
import { appCopy } from '@/data/copy';
import { mockBookIdeas } from '@/data/books-mock';
import { mockMemories } from '@/data/memories-mock';
import { mockRecallCards } from '@/data/recall-mock';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();

  const book = mockBookIdeas.find((b) => b.id === params.id);

  if (!book) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Book not found.</p>
        </div>
      </AppShell>
    );
  }

  const connectedMemories = mockMemories.filter(
    (m) => book.connectedMemoryIds?.includes(m.id)
  );
  const recallCards = mockRecallCards.filter(
    (rc) => book.recallCardIds?.includes(rc.id)
  );

  return (
    <AppShell>
      <div className="px-5 pt-2 pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center mb-5"
        >
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl hover:bg-surface-1 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        </motion.div>

        {/* Book Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-16 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${book.coverColor}20` }}
            >
              <BookOpen className="w-6 h-6" style={{ color: book.coverColor }} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{book.sourceTitle}</h1>
              <p className="text-sm text-text-dim">{book.author}</p>
            </div>
          </div>

          {/* Practice Strength */}
          {book.practiceStrength !== undefined && (
            <div className="flex items-center gap-3 mt-3">
              <Brain className="w-3.5 h-3.5 text-mint" />
              <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-mint transition-all duration-700"
                  style={{ width: `${book.practiceStrength}%` }}
                />
              </div>
              <span className="text-xs text-text-dim">{book.practiceStrength}% recalled</span>
            </div>
          )}
        </motion.div>

        {/* Quote */}
        {book.quote && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-1 rounded-2xl p-4 border border-white/[0.04] mb-4"
          >
            <h3 className="text-[10px] uppercase tracking-wider text-text-dim font-medium mb-2">
              {appCopy.bookDetail.bestQuotes}
            </h3>
            <p className="text-sm text-foreground leading-relaxed italic">
              &ldquo;{book.quote}&rdquo;
            </p>
          </motion.div>
        )}

        {/* Your Meaning */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-surface-1 rounded-2xl p-4 border border-white/[0.04] mb-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber" />
            <h3 className="text-[10px] uppercase tracking-wider text-amber font-medium">
              {appCopy.bookDetail.yourMeaning}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{book.meaning}</p>
        </motion.div>

        {/* Why it Matters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-amber/5 rounded-2xl p-4 border border-amber/10 mb-4"
        >
          <h3 className="text-[10px] uppercase tracking-wider text-amber font-medium mb-2">
            Why it matters
          </h3>
          <p className="text-sm text-foreground leading-relaxed">{book.whyItMatters}</p>
        </motion.div>

        {/* Use it When */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-sage/5 rounded-2xl p-4 border border-sage/10 mb-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-3.5 h-3.5 text-sage" />
            <h3 className="text-[10px] uppercase tracking-wider text-sage font-medium">
              Use it when
            </h3>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{book.useItWhen}</p>
        </motion.div>

        {/* Recall Cards */}
        {recallCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <FlipHorizontal className="w-3.5 h-3.5 text-soft-blue" />
              <h3 className="text-[10px] uppercase tracking-wider text-text-dim font-medium">
                {appCopy.bookDetail.recallCards}
              </h3>
            </div>
            <div className="space-y-2">
              {recallCards.map((card) => (
                <div key={card.id} className="bg-surface-1 rounded-xl p-3 border border-white/[0.04]">
                  <p className="text-xs text-foreground font-medium">Q: {card.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">A: {card.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Connected Memories */}
        {connectedMemories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-4"
          >
            <h3 className="text-[10px] uppercase tracking-wider text-text-dim font-medium mb-3">
              {appCopy.bookDetail.connectedMemories}
            </h3>
            <div className="space-y-3">
              {connectedMemories.map((cm) => (
                <ConnectionCard key={cm.id} memory={cm} reason={`Connected to ${book.sourceTitle}`} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Apply Today Button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button className="w-full bg-surface-1 hover:bg-surface-2 text-foreground border border-amber/10 rounded-xl h-11">
            <Sparkles className="w-4 h-4 text-amber mr-2" />
            {appCopy.bookDetail.applyToday}
          </Button>
        </motion.div>

        <div className="h-4" />
      </div>
    </AppShell>
  );
}
