'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUp, Clock, Sparkles, ExternalLink, ChevronRight, Lightbulb } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { TypeChip } from '@/components/shared/type-chip';
import { appCopy } from '@/data/copy';
import { mockMemories } from '@/data/memories-mock';
import Link from 'next/link';

// Simple inline markdown: **bold** → <strong>
function renderSimpleMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber font-semibold">$1</strong>')
    .replace(/\n/g, '<br/>');
}

interface AskResult {
  query: string;
  answer: string;
  sources: { title: string; id: string; type: string }[];
  suggestedAction?: string;
}

const mockAnswers: Record<string, AskResult> = {
  'What did I work on this week?': {
    query: 'What did I work on this week?',
    answer: 'This week you worked on two main things:\n\n1. **Fixed the auth issue** — the root cause was stale session state after token refresh. The old token was being cached in the middleware.\n\n2. **Paused the MoEngage migration** — the team decided in standup to ship the auth refactor first before starting MoEngage work.\n\nYou also dealt with a staging issue where the rate limiter wasn\'t handling mobile client retry loops.',
    sources: [
      { title: 'Fixed auth issue — stale session state', id: 'mem-5', type: 'work' },
      { title: 'Standup decision — paused MoEngage migration', id: 'mem-12', type: 'work' },
      { title: 'API rate limiting broke staging', id: 'mem-8', type: 'work' },
    ],
    suggestedAction: 'Add a recall card for the middleware caching pattern',
  },
  'What happened in Goa?': {
    query: 'What happened in Goa?',
    answer: 'Your Goa trip in April 2026 had some memorable moments:\n\n**The best part** was following a tip from Francis, a cafe owner in Anjuna, who told you to skip the tourist sunset point and take the old chapel road instead. You found an old Portuguese chapel with peeling blue paint, and someone rang its bell right as the sun touched the water.\n\n**The bizarre moment** — a stray dog followed you from the village to the sunset cliff and sat with you like it was a daily ritual.\n\n**The lesson**: Ask locals. The best experiences aren\'t on the map.',
    sources: [
      { title: 'Goa cafe owner — old chapel road tip', id: 'mem-1', type: 'trip' },
      { title: 'Goa — stray dog at sunset cliff', id: 'mem-2', type: 'trip' },
      { title: 'Goa — Portuguese chapel detail', id: 'mem-3', type: 'trip' },
    ],
    suggestedAction: 'Want to see the full trip story?',
  },
  'default': {
    query: '',
    answer: 'I found a few memories that might help. Let me summarize what I know...\n\nBased on your saved memories, here\'s what I found. You can tap on the sources below to see the full memories.',
    sources: [
      { title: 'Related memory found', id: 'mem-1', type: 'life' },
    ],
  },
};

export default function AskPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AskResult | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [recentQueries] = useState(['What did I work on this week?', 'What happened in Goa?']);
  const inputRef = useRef<HTMLInputElement>(null);

  // Typing effect
  useEffect(() => {
    if (!result || !isTyping) return;

    let i = 0;
    const text = result.answer;
    const speed = 15; // ms per character

    const interval = setInterval(() => {
      setDisplayedAnswer(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [result, isTyping]);

  const handleAsk = (q: string) => {
    const queryText = q || query;
    if (!queryText.trim()) return;

    setQuery(queryText);
    setIsTyping(true);
    setDisplayedAnswer('');

    const matchedAnswer = mockAnswers[queryText] || {
      ...mockAnswers['default'],
      query: queryText,
    };

    setResult(matchedAnswer);
  };

  const handleClear = () => {
    setResult(null);
    setDisplayedAnswer('');
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <AppShell>
      <div className="px-5 pt-2 pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-5"
        >
          <h1 className="text-xl font-semibold text-foreground">{appCopy.ask.title}</h1>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative mb-5"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk('')}
            placeholder={appCopy.ask.placeholder}
            className="w-full bg-surface-1 rounded-xl pl-10 pr-12 py-3.5 text-sm text-foreground placeholder:text-text-dim border border-white/[0.04] focus:outline-none focus:ring-1 focus:ring-amber/30 focus:border-amber/30 transition-all"
          />
          {query && (
            <button
              onClick={() => handleAsk('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-amber flex items-center justify-center hover:bg-amber/90 transition-colors"
            >
              <ArrowUp className="w-4 h-4 text-background" />
            </button>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* No result — show examples and recent */}
          {!result && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Example Queries */}
              <div className="mb-6">
                <h3 className="text-xs text-text-dim font-medium mb-3">Try asking</h3>
                <div className="space-y-2">
                  {appCopy.ask.exampleQueries.map((example) => (
                    <button
                      key={example}
                      onClick={() => handleAsk(example)}
                      className="w-full text-left bg-surface-1 rounded-xl px-4 py-3 border border-white/[0.04] text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-all group flex items-center justify-between"
                    >
                      <span className="truncate">{example}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-text-dim opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Questions */}
              {recentQueries.length > 0 && (
                <div>
                  <h3 className="text-xs text-text-dim font-medium mb-3 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {appCopy.ask.recentQuestions}
                  </h3>
                  <div className="space-y-2">
                    {recentQueries.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleAsk(q)}
                        className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-text-dim hover:text-foreground hover:bg-surface-1 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Result */}
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Answer */}
              <div className="bg-surface-1 rounded-2xl p-4 border border-white/[0.04]">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber" />
                  <span className="text-[10px] uppercase tracking-wider text-amber font-medium">
                    {appCopy.ask.answerLabels.directAnswer}
                  </span>
                </div>

                <div className="text-sm text-foreground leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(displayedAnswer) }} />
                  {isTyping && (
                    <span className="inline-block w-0.5 h-4 bg-amber ml-0.5 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Sources */}
              {!isTyping && result.sources.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-[10px] uppercase tracking-wider text-text-dim font-medium mb-2 flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3" />
                    {appCopy.ask.answerLabels.sources}
                  </h3>
                  <div className="space-y-2">
                    {result.sources.map((source) => (
                      <Link key={source.id} href={`/memories/${source.id}`}>
                        <div className="bg-surface-1 rounded-xl px-3.5 py-2.5 border border-white/[0.04] flex items-center justify-between hover:bg-surface-2 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-2 min-w-0">
                            <TypeChip type={source.type as any} />
                            <span className="text-xs text-foreground truncate group-hover:text-amber transition-colors">
                              {source.title}
                            </span>
                          </div>
                          <ChevronRight className="w-3 h-3 text-text-dim flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Suggested Action */}
              {!isTyping && result.suggestedAction && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-amber/5 rounded-2xl p-4 border border-amber/10"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber flex-shrink-0" />
                    <span className="text-xs text-amber font-medium">
                      {appCopy.ask.answerLabels.suggestedAction}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-1.5">{result.suggestedAction}</p>
                </motion.div>
              )}

              {/* Ask another */}
              {!isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-center pt-2"
                >
                  <button
                    onClick={handleClear}
                    className="text-xs text-text-dim hover:text-foreground transition-colors"
                  >
                    Ask another question
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-4" />
      </div>
    </AppShell>
  );
}
