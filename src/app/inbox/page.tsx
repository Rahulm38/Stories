'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, MessageCircle, GitBranch, FlipHorizontal, Link2, BookOpen, PenLine, SkipForward, XCircle } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { TypeChip } from '@/components/shared/type-chip';
import { Button } from '@/components/ui/button';
import { appCopy } from '@/data/copy';
import { mockInboxItems } from '@/data/inbox-mock';
import { mockMemories } from '@/data/memories-mock';
import Link from 'next/link';

const typeIcons: Record<string, React.ElementType> = {
  'follow-up': MessageCircle,
  'add-context': PenLine,
  'confirm-connection': Link2,
  'approve-recall': FlipHorizontal,
  'story-detail': BookOpen,
  'confirm-type': CheckCircle,
  'split': GitBranch,
};

export default function InboxPage() {
  const [items, setItems] = useState(mockInboxItems);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const handleAction = (id: string) => {
    setDismissed((prev) => [...prev, id]);
  };

  const visibleItems = items.filter((item) => !dismissed.includes(item.id));

  return (
    <AppShell>
      <div className="px-5 pt-2 pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 mb-1"
        >
          <Link href="/today">
            <button className="p-2 -ml-2 rounded-xl hover:bg-surface-1 transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{appCopy.inbox.title}</h1>
            <p className="text-xs text-text-dim">{appCopy.inbox.subtitle}</p>
          </div>
        </motion.div>

        {/* Items */}
        <div className="space-y-3 mt-5">
          <AnimatePresence>
            {visibleItems.map((item, i) => {
              const Icon = typeIcons[item.type] || MessageCircle;
              const memory = mockMemories.find((m) => m.id === item.memoryId);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, height: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                  className="bg-surface-1 rounded-2xl p-4 border border-white/[0.04]"
                >
                  {/* Memory title */}
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-3.5 h-3.5 text-lavender flex-shrink-0" />
                    <span className="text-xs text-lavender font-medium">{item.memoryTitle}</span>
                    {memory && <TypeChip type={memory.type} />}
                  </div>

                  {/* Prompt */}
                  <p className="text-sm text-foreground leading-relaxed mb-3">
                    {item.prompt}
                  </p>

                  {/* Chips */}
                  {item.chips && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.chips.map((chip) => (
                        <span
                          key={chip}
                          className="px-2 py-0.5 rounded-md bg-surface-3 text-[10px] text-muted-foreground"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAction(item.id)}
                      className="flex-1 bg-amber text-background hover:bg-amber/90 rounded-xl text-xs h-8"
                    >
                      {appCopy.inbox.actions.answer}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAction(item.id)}
                      className="flex-1 border-white/[0.08] text-muted-foreground hover:bg-surface-3 rounded-xl text-xs h-8"
                    >
                      {appCopy.inbox.actions.skip}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAction(item.id)}
                      className="border-white/[0.08] text-text-dim hover:bg-surface-3 rounded-xl text-xs h-8 px-3"
                    >
                      <XCircle className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty state */}
          {visibleItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="w-14 h-14 rounded-full bg-mint/15 flex items-center justify-center mb-4">
                <CheckCircle className="w-7 h-7 text-mint" />
              </div>
              <p className="text-sm font-medium text-foreground">{appCopy.inbox.emptyMessage.split('!')[0]}!</p>
              <p className="text-xs text-text-dim mt-1">{appCopy.inbox.emptyMessage.split('!')[1]}</p>
            </motion.div>
          )}
        </div>

        <div className="h-4" />
      </div>
    </AppShell>
  );
}
