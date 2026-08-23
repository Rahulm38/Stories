'use client';

import React, { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Lightbulb,
  PenLine,
  Settings,
  UserRound,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { memoryKindLabel, useMemoryStore } from '@/components/shared/memory-store';
import { selectDueMemory } from '@/lib/recall-scheduling';
import { MemoryKind, RecallStatus } from '@/types';

type RecallStage = 'ready' | 'thinking' | 'revealed' | 'complete';

const RECALL_INTERVAL_DAYS: Record<RecallStatus, number> = {
  remembered: 14,
  partial: 4,
  forgot: 1,
};

function recallQuestion(title: string, prompt?: string) {
  if (prompt) return prompt;
  const compactTitle = title.replace(/\s*[—:-].*$/, '').trim();
  return `What was the idea you wanted to remember from ${compactTitle}?`;
}

export default function TodayPage() {
  const [captureOpen, setCaptureOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [kind, setKind] = useState<MemoryKind>('note');
  const [savedMessage, setSavedMessage] = useState('');
  const [recallStage, setRecallStage] = useState<RecallStage>('ready');
  const [openedAt] = useState(() => Date.now());
  const { memories, addMemory, updateMemory } = useMemoryStore();

  const recentMemories = useMemo(
    () => [...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [memories],
  );
  const dueMemory = useMemo(() => {
    return selectDueMemory(recentMemories, openedAt);
  }, [openedAt, recentMemories]);
  const recentMemory = recentMemories.find((memory) => memory.id !== dueMemory?.id);

  const todayDate = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    [],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

    const folderPath = kind === 'book-learning' ? 'Books' : kind === 'experience' ? 'Experiences' : 'Inbox';
    addMemory({ body, folderPath, kind });
    setDraft('');
    setKind('note');
    setCaptureOpen(false);
    setSavedMessage('Saved on this device');
  };

  const finishRecall = (status: RecallStatus) => {
    if (!dueMemory) return;
    const now = new Date();
    const next = new Date(now);
    next.setDate(next.getDate() + RECALL_INTERVAL_DAYS[status]);
    updateMemory(dueMemory.id, {
      recallStatus: status,
      lastRecalledAt: now.toISOString(),
      nextRecallAt: next.toISOString(),
    });
    setRecallStage('complete');
  };

  const deferRecall = () => {
    if (!dueMemory) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    updateMemory(dueMemory.id, { nextRecallAt: tomorrow.toISOString() });
    setRecallStage('ready');
  };

  return (
    <AppShell hideNav={captureOpen}>
      <div className={`native-today ${captureOpen ? 'is-composing' : ''}`}>
        {captureOpen ? (
          <header className="capture-composer-bar">
            <button type="button" onClick={() => { setCaptureOpen(false); setDraft(''); }}>Cancel</button>
            <strong>New memory</strong>
            <button type="submit" form="today-capture-form" disabled={!draft.trim()}>Save</button>
          </header>
        ) : (
          <header className="native-app-bar">
            <div>
              <h1>Today</h1>
              <p>{todayDate}</p>
            </div>
            <Link href="/settings" className="native-icon-button" aria-label="Open settings">
              <Settings aria-hidden="true" />
            </Link>
          </header>
        )}

        <section className="native-section capture-section" aria-labelledby="capture-title">
          {!captureOpen && <p className="native-section-label" id="capture-title">Capture</p>}
          {!captureOpen ? (
            <button type="button" className="quick-capture-row" onClick={() => setCaptureOpen(true)}>
              <span className="native-leading-icon"><PenLine aria-hidden="true" /></span>
              <span>What is worth keeping?</span>
              <ChevronRight aria-hidden="true" />
            </button>
          ) : (
            <form id="today-capture-form" className="inline-capture focused-capture" onSubmit={handleSubmit}>
              <label htmlFor="today-capture">What is worth remembering?</label>
              <textarea
                id="today-capture"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write in Markdown…"
                autoFocus
              />
              <div className="capture-kind-row" role="group" aria-label="Memory type">
                <button type="button" aria-pressed={kind === 'book-learning'} className={kind === 'book-learning' ? 'is-selected' : ''} onClick={() => setKind(kind === 'book-learning' ? 'note' : 'book-learning')}>
                  <BookOpen aria-hidden="true" /> Book learning
                </button>
                <button type="button" aria-pressed={kind === 'experience'} className={kind === 'experience' ? 'is-selected' : ''} onClick={() => setKind(kind === 'experience' ? 'note' : 'experience')}>
                  Experience
                </button>
              </div>
              <p className="focused-capture-hint">Saved locally as Markdown. Add <code>[[links]]</code> whenever useful.</p>
            </form>
          )}
          {savedMessage && <p className="native-status" role="status"><Check aria-hidden="true" /> {savedMessage}</p>}
        </section>

        {!captureOpen && dueMemory && (
          <section className="native-section" aria-labelledby="recall-title">
            <p className="native-section-label" id="recall-title">Due recall</p>
            <div className="recall-surface">
              {recallStage === 'complete' ? (
                <div className="recall-complete" role="status">
                  <span className="native-leading-icon"><Check aria-hidden="true" /></span>
                  <div><strong>Memory practiced</strong><p>It will return when it is useful to try again.</p></div>
                </div>
              ) : (
                <>
                  <div className="recall-question-row">
                    <span className="native-leading-icon"><BookOpen aria-hidden="true" /></span>
                    <div>
                      <h2>{recallQuestion(dueMemory.title, dueMemory.recallPrompt)}</h2>
                      <p>{dueMemory.source || dueMemory.title}</p>
                    </div>
                  </div>

                  {recallStage === 'ready' && (
                    <div className="recall-actions">
                      <button type="button" className="native-primary-button native-primary-wide" onClick={() => setRecallStage('thinking')}>
                        Try to recall
                      </button>
                      <button type="button" className="native-text-button" onClick={deferRecall}><Clock3 aria-hidden="true" /> Later</button>
                    </div>
                  )}

                  {recallStage === 'thinking' && (
                    <div className="recall-thinking">
                      <Lightbulb aria-hidden="true" />
                      <p>Say the idea in your own words before revealing it.</p>
                      <button type="button" className="native-primary-button native-primary-wide" onClick={() => setRecallStage('revealed')}>
                        Reveal memory
                      </button>
                    </div>
                  )}

                  {recallStage === 'revealed' && (
                    <div className="recall-reveal">
                      <p>{dueMemory.originalCapture}</p>
                      <div className="recall-rating" aria-label="How well did you remember?">
                        <button type="button" onClick={() => finishRecall('forgot')}>Forgot</button>
                        <button type="button" onClick={() => finishRecall('partial')}>Partly</button>
                        <button type="button" onClick={() => finishRecall('remembered')}>Remembered</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {!captureOpen && recentMemory && (
          <section className="native-section recent-section" aria-labelledby="recent-title">
            <p className="native-section-label" id="recent-title">Recent</p>
            <Link href={`/memories/${recentMemory.id}`} className="native-memory-row">
              <span className="native-leading-icon"><UserRound aria-hidden="true" /></span>
              <span className="native-memory-copy">
                <strong>{recentMemory.title}</strong>
                <small>{memoryKindLabel(recentMemory.kind)} · {recentMemory.timeAgo}</small>
              </span>
              <ChevronRight aria-hidden="true" />
            </Link>
          </section>
        )}
      </div>
    </AppShell>
  );
}
