'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Type, Image, ChevronRight, Settings, Shield } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { AskBar } from '@/components/shared/ask-bar';
import { PromptChip } from '@/components/shared/prompt-chip';
import { MemoryCard } from '@/components/shared/memory-card';
import { ConnectionCard } from '@/components/shared/connection-card';
import { appCopy } from '@/data/copy';
import { adaptivePrompts } from '@/data/prompts';
import { mockMemories } from '@/data/memories-mock';
import { mockInboxItems } from '@/data/inbox-mock';
import Link from 'next/link';

export default function TodayPage() {
  const [captureOpen, setCaptureOpen] = useState(false);

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const recentMemories = mockMemories.slice(0, 3);
  const connectionMemory = mockMemories.find((m) => m.id === 'mem-6');

  return (
    <AppShell>
      <div className="px-5 pt-2 pb-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-lg font-semibold text-foreground">Today</h1>
            <p className="text-xs text-text-dim mt-0.5">{todayDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-mint/70">
              <Shield className="w-3 h-3" />
              Private
            </span>
            <Link href="/settings">
              <button className="p-2 rounded-xl hover:bg-surface-1 transition-colors">
                <Settings className="w-4 h-4 text-text-dim" />
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Ask Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <AskBar />
        </motion.div>

        {/* Primary Capture Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-surface-1 rounded-2xl p-5 border border-white/[0.04]"
        >
          <p className="text-base font-medium text-foreground leading-relaxed">
            {appCopy.today.primaryPrompt}
          </p>

          {/* Capture Controls */}
          <div className="flex items-center gap-3 mt-4">
            {[
              { icon: Mic, label: 'Voice', mode: 'voice' },
              { icon: Type, label: 'Text', mode: 'text' },
              { icon: Image, label: 'Photo', mode: 'photo' },
            ].map(({ icon: Icon, label }) => (
              <motion.button
                key={label}
                whileTap={{ scale: 0.92 }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-2 text-xs font-medium text-muted-foreground hover:bg-surface-3 hover:text-foreground transition-all duration-200 border border-white/[0.04]"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Adaptive Prompt Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5"
        >
          {adaptivePrompts.slice(0, 6).map((prompt, i) => (
            <PromptChip key={prompt.id} label={prompt.label} index={i} />
          ))}
        </motion.div>

        {/* Memory Practice Block */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Link href="/recall">
            <div className="bg-surface-1 rounded-2xl p-4 border border-white/[0.04] flex items-center justify-between group cursor-pointer hover:border-amber/10 transition-all">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {appCopy.today.practiceBlock.title}
                </h3>
                <p className="text-xs text-text-dim mt-0.5">
                  {appCopy.today.practiceBlock.duration}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                className="px-5 py-2 rounded-xl bg-amber text-background text-xs font-semibold hover:bg-amber/90 transition-colors"
              >
                {appCopy.today.practiceBlock.button}
              </motion.button>
            </div>
          </Link>
        </motion.div>

        {/* Inbox Block (conditional) */}
        {mockInboxItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Link href="/inbox">
              <div className="bg-surface-1 rounded-2xl p-4 border border-lavender/10 flex items-center justify-between group cursor-pointer hover:border-lavender/20 transition-all">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {appCopy.today.inboxBlock.title(mockInboxItems.length)}
                  </h3>
                  <p className="text-xs text-text-dim mt-0.5">Make them stronger</p>
                </div>
                <button className="px-5 py-2 rounded-xl bg-lavender/15 text-lavender text-xs font-medium hover:bg-lavender/25 transition-colors">
                  {appCopy.today.inboxBlock.button}
                </button>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Recent Memories */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">{appCopy.today.recentTitle}</h2>
            <Link href="/memories" className="flex items-center text-xs text-text-dim hover:text-amber transition-colors">
              See all <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentMemories.map((memory, i) => (
              <MemoryCard key={memory.id} memory={memory} index={i} compact showMenu={false} />
            ))}
          </div>
        </motion.div>

        {/* Connected Memory */}
        {connectionMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <ConnectionCard
              memory={connectionMemory}
              reason="Your Indistractable note matches today's Instagram moment"
            />
          </motion.div>
        )}

        {/* Spacer for bottom nav */}
        <div className="h-4" />
      </div>
    </AppShell>
  );
}
