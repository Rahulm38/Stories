'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit3, Plus, Link2, Search, Trash2, MapPin, Users, Calendar, BookOpen, Briefcase, Sparkles, ChevronRight, Globe } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { TypeChip } from '@/components/shared/type-chip';
import { ConnectionCard } from '@/components/shared/connection-card';
import { Button } from '@/components/ui/button';
import { appCopy } from '@/data/copy';
import { mockMemories } from '@/data/memories-mock';
import { mockRecallCards } from '@/data/recall-mock';

export default function MemoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showTripStory, setShowTripStory] = useState(false);

  const memory = mockMemories.find((m) => m.id === params.id);

  if (!memory) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Memory not found.</p>
        </div>
      </AppShell>
    );
  }

  const connectedMemories = mockMemories.filter(
    (m) => memory.connectedMemoryIds?.includes(m.id)
  );
  const recallCards = mockRecallCards.filter(
    (rc) => memory.recallCardIds?.includes(rc.id)
  );

  const formattedDate = new Date(memory.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = new Date(memory.date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <AppShell>
      <div className="px-5 pt-2 pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-5"
        >
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl hover:bg-surface-1 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditSheet(true)}
              className="p-2 rounded-xl hover:bg-surface-1 transition-colors"
            >
              <Edit3 className="w-4 h-4 text-text-dim" />
            </button>
          </div>
        </motion.div>

        {/* Title & Type */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <TypeChip type={memory.type} size="md" />
            {memory.isTrip && memory.tripName && (
              <span className="text-xs text-amber/70 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {memory.tripName}
              </span>
            )}
          </div>
          <h1 className="text-xl font-semibold text-foreground leading-tight">{memory.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-xs text-text-dim">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate} · {formattedTime}</span>
          </div>
        </motion.div>

        {/* Original Capture */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-1 rounded-2xl p-4 border border-white/[0.04] mb-4"
        >
          <h3 className="text-[10px] uppercase tracking-wider text-text-dim font-medium mb-2">
            {appCopy.memoryDetail.originalCapture}
          </h3>
          <p className="text-sm text-foreground leading-relaxed italic">
            &ldquo;{memory.originalCapture}&rdquo;
          </p>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-surface-1 rounded-2xl p-4 border border-white/[0.04] mb-4"
        >
          <h3 className="text-[10px] uppercase tracking-wider text-text-dim font-medium mb-2">
            {appCopy.memoryDetail.summary}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{memory.summary}</p>
        </motion.div>

        {/* Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 mb-5"
        >
          {memory.people && memory.people.length > 0 && (
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-lavender flex-shrink-0" />
              <div>
                <span className="text-[10px] text-text-dim block">{appCopy.memoryDetail.people}</span>
                <span className="text-sm text-foreground">{memory.people.join(', ')}</span>
              </div>
            </div>
          )}
          {memory.place && (
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-mint flex-shrink-0" />
              <div>
                <span className="text-[10px] text-text-dim block">{appCopy.memoryDetail.place}</span>
                <span className="text-sm text-foreground">{memory.place}</span>
              </div>
            </div>
          )}
          {memory.source && (
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-sage flex-shrink-0" />
              <div>
                <span className="text-[10px] text-text-dim block">{appCopy.memoryDetail.source}</span>
                <span className="text-sm text-foreground">{memory.source}</span>
              </div>
            </div>
          )}
          {memory.project && (
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-soft-blue flex-shrink-0" />
              <div>
                <span className="text-[10px] text-text-dim block">{appCopy.memoryDetail.project}</span>
                <span className="text-sm text-foreground">{memory.project}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Why it Matters */}
        {memory.whyItMatters && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-amber/5 rounded-2xl p-4 border border-amber/10 mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber" />
              <h3 className="text-[10px] uppercase tracking-wider text-amber font-medium">
                {appCopy.memoryDetail.whyItMatters}
              </h3>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{memory.whyItMatters}</p>
          </motion.div>
        )}

        {/* Use it When */}
        {memory.useItWhen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="bg-sage/5 rounded-2xl p-4 border border-sage/10 mb-4"
          >
            <h3 className="text-[10px] uppercase tracking-wider text-sage font-medium mb-2">
              Use it when
            </h3>
            <p className="text-sm text-foreground leading-relaxed">{memory.useItWhen}</p>
          </motion.div>
        )}

        {/* Trip Story Button */}
        {memory.isTrip && memory.storyDraft && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <button
              onClick={() => setShowTripStory(!showTripStory)}
              className="w-full bg-surface-1 rounded-2xl p-4 border border-amber/10 flex items-center justify-between hover:bg-surface-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber" />
                <span className="text-sm font-medium text-foreground">View trip story</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-text-dim transition-transform ${showTripStory ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
              {showTripStory && memory.storyDraft && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-surface-1 rounded-2xl p-4 mt-3 border border-white/[0.04] space-y-4">
                    {/* Short Version */}
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider text-amber font-medium mb-2">
                        Tell it in 30 seconds
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {memory.storyDraft.shortVersion}
                      </p>
                    </div>

                    {/* Bizarre Moment */}
                    {memory.storyDraft.bizarreMoment && (
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-terracotta font-medium mb-2">
                          The bizarre moment
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {memory.storyDraft.bizarreMoment}
                        </p>
                      </div>
                    )}

                    {/* Lesson */}
                    {memory.storyDraft.lesson && (
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-sage font-medium mb-2">
                          What this trip taught me
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {memory.storyDraft.lesson}
                        </p>
                      </div>
                    )}

                    {/* Vivid Detail */}
                    {memory.storyDraft.vividDetail && (
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-lavender font-medium mb-2">
                          Vivid detail
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">
                          &ldquo;{memory.storyDraft.vividDetail}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Long Story */}
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider text-amber font-medium mb-2">
                        The longer story
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {memory.storyDraft.longVersion}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Recall Cards */}
        {recallCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="mb-4"
          >
            <h3 className="text-[10px] uppercase tracking-wider text-text-dim font-medium mb-3">
              {appCopy.memoryDetail.recallCards}
            </h3>
            <div className="space-y-2">
              {recallCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-surface-1 rounded-xl p-3 border border-white/[0.04]"
                >
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
          >
            <h3 className="text-[10px] uppercase tracking-wider text-text-dim font-medium mb-3">
              {appCopy.memoryDetail.connectedMemories}
            </h3>
            <div className="space-y-3">
              {connectedMemories.map((cm) => (
                <ConnectionCard key={cm.id} memory={cm} reason="Related memory" />
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-2 mt-6"
        >
          <Button
            variant="outline"
            className="flex-1 border-white/[0.08] text-foreground hover:bg-surface-2 rounded-xl text-xs h-9"
            onClick={() => setShowEditSheet(true)}
          >
            <Edit3 className="w-3 h-3 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-white/[0.08] text-foreground hover:bg-surface-2 rounded-xl text-xs h-9"
          >
            <Plus className="w-3 h-3 mr-1.5" />
            Recall card
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-white/[0.08] text-foreground hover:bg-surface-2 rounded-xl text-xs h-9"
          >
            <Link2 className="w-3 h-3 mr-1.5" />
            Connect
          </Button>
        </motion.div>

        {/* Edit Memory Sheet */}
        <AnimatePresence>
          {showEditSheet && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50"
                onClick={() => setShowEditSheet(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-surface-2 rounded-t-3xl border-t border-white/[0.06] max-h-[85vh] overflow-y-auto"
              >
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>
                <div className="px-5 pb-8">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold">{appCopy.editMemory.title}</h2>
                    <button onClick={() => setShowEditSheet(false)} className="text-xs text-text-dim">
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Title', value: memory.title },
                      { label: 'Memory text', value: memory.originalCapture },
                      { label: 'Why it matters', value: memory.whyItMatters || '' },
                      { label: 'People', value: memory.people?.join(', ') || '' },
                      { label: 'Place', value: memory.place || '' },
                      { label: 'Tags', value: memory.tags?.join(', ') || '' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <label className="text-[10px] uppercase tracking-wider text-text-dim font-medium block mb-1.5">
                          {label}
                          {['Why it matters', 'Tags'].includes(label) && (
                            <span className="ml-1.5 text-[9px] text-amber/50 normal-case tracking-normal">AI suggested</span>
                          )}
                        </label>
                        <input
                          defaultValue={value}
                          className="w-full bg-surface-1 rounded-xl px-3 py-2.5 text-sm text-foreground border border-white/[0.06] focus:outline-none focus:ring-1 focus:ring-amber/30"
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full mt-6 bg-amber text-background hover:bg-amber/90 rounded-xl h-10"
                    onClick={() => setShowEditSheet(false)}
                  >
                    {appCopy.editMemory.save}
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="h-4" />
      </div>
    </AppShell>
  );
}
