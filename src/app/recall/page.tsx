'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Brain, CheckCircle, X, HelpCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TypeChip } from '@/components/shared/type-chip';
import { appCopy } from '@/data/copy';
import { mockRecallCards } from '@/data/recall-mock';
import Link from 'next/link';

type RecallPhase = 'start' | 'session' | 'summary';
type Response = 'remembered' | 'close' | 'forgot';

interface SessionResult {
  cardId: string;
  response: Response;
}

export default function RecallPage() {
  const [phase, setPhase] = useState<RecallPhase>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<SessionResult[]>([]);

  const cards = mockRecallCards.slice(0, 5);
  const currentCard = cards[currentIndex];

  const handleStart = useCallback(() => {
    setPhase('session');
    setCurrentIndex(0);
    setFlipped(false);
    setResults([]);
  }, []);

  const handleResponse = useCallback(
    (response: Response) => {
      setResults((prev) => [...prev, { cardId: currentCard.id, response }]);

      if (currentIndex < cards.length - 1) {
        setFlipped(false);
        setTimeout(() => {
          setCurrentIndex((i) => i + 1);
        }, 200);
      } else {
        setTimeout(() => {
          setPhase('summary');
        }, 300);
      }
    },
    [currentCard, currentIndex, cards.length]
  );

  const remembered = results.filter((r) => r.response === 'remembered').length;
  const close = results.filter((r) => r.response === 'close').length;
  const forgot = results.filter((r) => r.response === 'forgot').length;

  const encouragement = appCopy.recall.summaryEncouragement[
    Math.floor(Math.random() * appCopy.recall.summaryEncouragement.length)
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#07060a] p-4">
      <div className="relative w-full max-w-[430px] h-[932px] bg-background rounded-[40px] overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/50">
        {/* Status bar */}
        <div className="flex items-center justify-between px-8 pt-4 pb-1">
          <span className="text-xs text-text-dim font-medium">9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-2.5 rounded-sm border border-text-dim/50 flex items-center justify-end p-px">
              <div className="w-2.5 h-1.5 rounded-[1px] bg-mint" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[126px] h-[34px] bg-black rounded-b-[20px]" />

        <div className="h-[calc(100%-50px)] overflow-y-auto no-scrollbar flex flex-col">
          <AnimatePresence mode="wait">
            {/* ======== START SCREEN ======== */}
            {phase === 'start' && (
              <motion.div
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-[calc(932px-84px)] flex flex-col items-center justify-center px-8"
              >
                {/* Back button */}
                <Link href="/today" className="absolute top-14 left-6">
                  <button className="p-2 rounded-xl hover:bg-surface-1 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-foreground" />
                  </button>
                </Link>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', damping: 20 }}
                  className="w-24 h-24 rounded-full bg-amber/10 flex items-center justify-center mb-8 animate-subtle-float"
                >
                  <Brain className="w-12 h-12 text-amber" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-semibold text-foreground text-center mb-2"
                >
                  {appCopy.recall.startTitle}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-text-dim mb-10"
                >
                  {appCopy.recall.startDuration}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={handleStart}
                    className="px-12 py-6 rounded-2xl bg-amber text-background text-base font-semibold hover:bg-amber/90 animate-pulse-glow"
                  >
                    {appCopy.recall.startButton}
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* ======== SESSION SCREEN ======== */}
            {phase === 'session' && currentCard && (
              <motion.div
                key={`card-${currentIndex}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="min-h-[calc(932px-84px)] flex flex-col px-5 pt-4"
              >
                {/* Progress */}
                <div className="flex items-center justify-between mb-6">
                  <Link href="/today">
                    <button className="p-2 -ml-2 rounded-xl hover:bg-surface-1 transition-colors">
                      <X className="w-5 h-5 text-text-dim" />
                    </button>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-dim">{currentIndex + 1}/{cards.length}</span>
                    <div className="flex gap-1">
                      {cards.map((_, i) => (
                        <div
                          key={i}
                          className={`w-8 h-1 rounded-full transition-all duration-300 ${
                            i < currentIndex ? 'bg-amber' :
                            i === currentIndex ? 'bg-amber/50' :
                            'bg-surface-3'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Flashcard */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="flip-card w-full max-w-[360px]" style={{ minHeight: '340px' }}>
                    <div className={`flip-card-inner relative w-full ${flipped ? 'flipped' : ''}`} style={{ minHeight: '340px' }}>
                      {/* Front */}
                      <div className="flip-card-front absolute inset-0 bg-surface-1 rounded-3xl p-6 border border-white/[0.06] flex flex-col items-center justify-center">
                        <TypeChip type={currentCard.type} size="md" />
                        <p className="text-lg font-medium text-foreground text-center mt-6 leading-relaxed">
                          {currentCard.question}
                        </p>
                        <p className="text-xs text-text-dim mt-3">{currentCard.sourceTitle}</p>

                        <Button
                          onClick={() => setFlipped(true)}
                          className="mt-8 px-8 py-5 rounded-xl bg-surface-2 hover:bg-surface-3 text-foreground border border-white/[0.06] text-sm"
                        >
                          {appCopy.recall.showAnswer}
                        </Button>
                      </div>

                      {/* Back */}
                      <div className="flip-card-back absolute inset-0 bg-surface-1 rounded-3xl p-6 border border-white/[0.06] flex flex-col items-center justify-center">
                        <p className="text-lg font-medium text-foreground text-center leading-relaxed">
                          {currentCard.answer}
                        </p>
                        <p className="text-xs text-text-dim mt-3">
                          From: {currentCard.sourceTitle}
                        </p>

                        {/* Response buttons */}
                        <div className="flex gap-3 mt-8 w-full">
                          <Button
                            onClick={() => handleResponse('remembered')}
                            className="flex-1 py-5 rounded-xl bg-mint/15 hover:bg-mint/25 text-mint text-sm font-medium border-0"
                          >
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            {appCopy.recall.responses.remembered}
                          </Button>
                          <Button
                            onClick={() => handleResponse('close')}
                            className="flex-1 py-5 rounded-xl bg-amber/15 hover:bg-amber/25 text-amber text-sm font-medium border-0"
                          >
                            <HelpCircle className="w-4 h-4 mr-1.5" />
                            {appCopy.recall.responses.close}
                          </Button>
                          <Button
                            onClick={() => handleResponse('forgot')}
                            className="flex-1 py-5 rounded-xl bg-coral/15 hover:bg-coral/25 text-coral text-sm font-medium border-0"
                          >
                            <X className="w-4 h-4 mr-1.5" />
                            {appCopy.recall.responses.forgot}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ======== SUMMARY SCREEN ======== */}
            {phase === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-[calc(932px-84px)] flex flex-col items-center justify-center px-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-mint/15 flex items-center justify-center mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-mint" />
                </motion.div>

                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {appCopy.recall.summaryTitle}
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-8">
                  {encouragement}
                </p>

                {/* Results */}
                <div className="flex gap-4 mb-8">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-mint">{remembered}</span>
                    <span className="text-[10px] text-text-dim mt-1">Remembered</span>
                  </div>
                  <div className="w-px bg-white/[0.06]" />
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-amber">{close}</span>
                    <span className="text-[10px] text-text-dim mt-1">Close</span>
                  </div>
                  <div className="w-px bg-white/[0.06]" />
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-coral">{forgot}</span>
                    <span className="text-[10px] text-text-dim mt-1">Forgot</span>
                  </div>
                </div>

                <Link href="/today">
                  <Button className="px-8 py-5 rounded-xl bg-amber text-background text-sm font-semibold hover:bg-amber/90">
                    Back to Today
                  </Button>
                </Link>

                <button
                  onClick={handleStart}
                  className="text-xs text-text-dim mt-4 hover:text-foreground transition-colors"
                >
                  Practice again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-white/20 rounded-full" />
      </div>
    </div>
  );
}
