import assert from 'node:assert/strict';
import test from 'node:test';
import type { MemoryNote } from './model.ts';
import { parseNoteFile, serializeNote } from './legacy-memory-format.ts';
import { markStoryTold, readyStoryCount, storyReadiness } from './story-state.ts';

function story(overrides: Partial<MemoryNote> = {}): MemoryNote {
  return {
    id: 'story-1',
    title: 'Bangalore airport',
    body: 'At Bangalore airport a security guard recognised the book I was carrying.',
    kind: 'note',
    folder: 'Inbox',
    path: 'Inbox/bangalore-airport.md',
    createdAt: '2026-08-20T08:00:00.000Z',
    updatedAt: '2026-08-20T08:00:00.000Z',
    ...overrides,
  };
}

test('readiness reflects actual tellability rather than app activity', () => {
  assert.equal(storyReadiness(story()), 'new');
  assert.equal(storyReadiness(story({ recallStatus: 'remembered', lastRecalledAt: '2026-08-23T08:00:00.000Z', reviewStrengthDays: 14 })), 'coming-back');
  assert.equal(storyReadiness(story({ recallStatus: 'remembered', lastRecalledAt: '2026-08-23T08:00:00.000Z', reviewStrengthDays: 30 })), 'ready');
  assert.equal(storyReadiness(story({ toldCount: 1, lastToldAt: '2026-08-24T08:00:00.000Z' })), 'ready');
});

test('ready count ignores stories that are merely new or still strengthening', () => {
  const stories = [
    story({ id: 'new' }),
    story({ id: 'building', recallStatus: 'remembered', reviewStrengthDays: 14, lastRecalledAt: '2026-08-23T08:00:00.000Z' }),
    story({ id: 'ready', recallStatus: 'remembered', reviewStrengthDays: 30, lastRecalledAt: '2026-08-23T08:00:00.000Z' }),
    story({ id: 'told', toldCount: 1, lastToldAt: '2026-08-24T08:00:00.000Z' }),
  ];
  assert.equal(readyStoryCount(stories), 2);
});

test('marking a story told records the real-world outcome without rescheduling it', () => {
  const note = story({ nextRecallAt: '2026-09-01T08:00:00.000Z', toldCount: 2 });
  const draft = markStoryTold(note, new Date('2026-08-26T10:00:00.000Z'));
  assert.equal(draft.toldCount, 3);
  assert.equal(draft.lastToldAt, '2026-08-26T10:00:00.000Z');
  assert.equal(Object.prototype.hasOwnProperty.call(draft, 'nextRecallAt'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(draft, 'reviewStrengthDays'), false);
});

test('story outcome metadata survives the legacy-compatible file codec', () => {
  const original = story({
    toldCount: 3,
    lastToldAt: '2026-08-26T10:00:00.000Z',
    recallStatus: 'remembered',
    reviewStrengthDays: 30,
    nextRecallAt: '2026-09-25T10:00:00.000Z',
  });
  const parsed = parseNoteFile({ path: original.path, markdown: serializeNote(original) });
  assert.equal(parsed.toldCount, 3);
  assert.equal(parsed.lastToldAt, '2026-08-26T10:00:00.000Z');
  assert.equal(parsed.reviewStrengthDays, 30);
  assert.equal(parsed.nextRecallAt, '2026-09-25T10:00:00.000Z');
});
