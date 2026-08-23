'use client';

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
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

type RecallStage = 'ready' | 'thinking' | 'revealed';

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
  const [recallCompleteMessage, setRecallCompleteMessage] = useState('');
  const [nowTime, setNowTime] = useState(() => Date.now());
  const { memories, hydrated, addMemory, updateMemory } = useMemoryStore();

  useEffect(() => {
    const refreshTime = () => setNowTime(Date.now());
    const timer = window.setInterval(refreshTime, 60_000);
    window.addEventListener('focus', refreshTime);
    document.addEventListener('visibilitychange', refreshTime);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshTime);
      document.removeEventListener('visibilitychange', refreshTime);
    };
  }, []);

  const recentMemories = useMemo(
    () => [...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [memories],
  );
  const dueMemory = useMemo(() => {
    return selectDueMemory(recentMemories, nowTime);
  }, [nowTime, recentMemories]);
  const recentMemory = recentMemories.find((memory) => memory.id !== dueMemory?.id);

  const todayDate = useMemo(
    () => new Date(nowTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    [nowTime],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

    const folderPath = kind === 'book-learning' ? 'Books' : kind === 'experience' ? 'Experiences' : 'Inbox';
    const memory = addMemory({ body, folderPath, kind });
    const returnsAt = new Date();
    returnsAt.setDate(returnsAt.getDate() + 3);
    updateMemory(memory.id, { nextRecallAt: returnsAt.toISOString() });
    setDraft('');
    setKind('note');
    setCaptureOpen(false);
    const returnDate = returnsAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    setSavedMessage(`Saved privately. It returns on ${returnDate}.`);
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
    const returnDate = next.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    setRecallCompleteMessage(`Practiced. Back on ${returnDate}.`);
    setRecallStage('ready');
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

        {!captureOpen && recallCompleteMessage && (
          <section className="native-section" aria-labelledby="recall-complete-title">
            <p className="native-section-label" id="recall-complete-title">Due recall</p>
            <div className="recall-surface">
              <div className="recall-complete" role="status">
                <span className="native-leading-icon"><Check aria-hidden="true" /></span>
                <div><strong>Memory practiced</strong><p>{recallCompleteMessage}</p></div>
              </div>
            </div>
          </section>
        )}

        {!captureOpen && dueMemory && (
          <section className="native-section" aria-labelledby="recall-title">
            <p className="native-section-label" id="recall-title">Due recall</p>
            <div className="recall-surface">
              <div className="recall-question-row">
                <span className="native-leading-icon"><BookOpen aria-hidden="true" /></span>
                <div>
                  <h2>{recallQuestion(dueMemory.title, dueMemory.recallPrompt)}</h2>
                  <p>{dueMemory.source || dueMemory.title}</p>
                </div>
              </div>

              {recallStage === 'ready' && (
                <div className="recall-actions">
                  <button type="button" className="native-primary-button native-primary-wide" onClick={() => { setRecallCompleteMessage(''); setRecallStage('thinking'); }}>
                    Try to recall
                  </button>
                  <button type="button" className="native-text-button" onClick={deferRecall}><Clock3 aria-hidden="true" /> Tomorrow</button>
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
                    <button type="button" onClick={() => finishRecall('forgot')}>Not yet</button>
                    <button type="button" onClick={() => finishRecall('partial')}>Partly</button>
                    <button type="button" onClick={() => finishRecall('remembered')}>Got it</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="native-section capture-section" aria-labelledby="capture-title">
          {!captureOpen && <p className="native-section-label" id="capture-title">Capture</p>}
          {!captureOpen ? (
            <>
              {hydrated && memories.length === 0 && (
                <p className="empty-capture-promise">Save something worth remembering. Stories will bring it back later.</p>
              )}
              <button type="button" className="quick-capture-row" onClick={() => setCaptureOpen(true)}>
                <span className="native-leading-icon"><PenLine aria-hidden="true" /></span>
                <span>What is worth remembering?</span>
                <ChevronRight aria-hidden="true" />
              </button>
            </>
          ) : (
            <form id="today-capture-form" className="inline-capture focused-capture" onSubmit={handleSubmit}>
              <label htmlFor="today-capture">What is worth remembering?</label>
              <p className="capture-supporting-copy">One sentence is enough.</p>
              <textarea
                id="today-capture"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write in Markdown…"
                autoFocus
              />
              <details className="capture-details">
                <summary>
                  <span>Memory details</span>
                  <small>{memoryKindLabel(kind)} · returns in 3 days</small>
                  <ChevronRight className="capture-details-chevron" aria-hidden="true" />
                </summary>
                <div className="capture-kind-row" role="group" aria-label="Memory type">
                  <button type="button" aria-pressed={kind === 'note'} className={kind === 'note' ? 'is-selected' : ''} onClick={() => setKind('note')}>
                    Note
                  </button>
                  <button type="button" aria-pressed={kind === 'book-learning'} className={kind === 'book-learning' ? 'is-selected' : ''} onClick={() => setKind('book-learning')}>
                    <BookOpen aria-hidden="true" /> Book learning
                  </button>
                  <button type="button" aria-pressed={kind === 'experience'} className={kind === 'experience' ? 'is-selected' : ''} onClick={() => setKind('experience')}>
                    Experience
                  </button>
                </div>
              </details>
              <p className="focused-capture-hint">Saved locally as Markdown. Add <code>[[links]]</code> whenever useful.</p>
            </form>
          )}
          {savedMessage && <p className="native-status" role="status"><Check aria-hidden="true" /> {savedMessage}</p>}
        </section>

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
