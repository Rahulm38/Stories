import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { MAX_SESSION_MEMORIES, gradeRecall, scheduleFirstRecall, stopResurfacing } from '../../../packages/core/src/recall.ts';
import { plainMemoryText, storyCue } from '../../../packages/core/src/story-cue.ts';
import { editingFromParam } from '../src/navigation/route-state.ts';
import { matchesLibrarySearch } from '../src/navigation/library-search.ts';
import { dateInputFromDate, dateInputToDate, localDateInputValue } from '../src/navigation/local-date.ts';
import { tabBarMetrics } from '../src/navigation/tab-bar.ts';
import { nextUpcomingRecallMessage, recallCompletionMessage, recallResultLabel, savedMemoryMessage } from '../src/recall/presentation.ts';
import { reminderNotificationMessage, reminderStatusCopy } from '../src/notifications/reminder-service.ts';
import { readBrowserValue, writeBrowserValue } from '../src/vault/browser-storage.ts';
import { BrowserFileStore } from '../src/vault/browser-file-store.ts';
import { ensureVaultReady } from '../src/vault/save-gate.ts';

test('story cues expose handles without repeating the full memory', () => {
  const body = 'At Bangalore airport, a security guard recognized my book and we talked about his daughter reading more.';
  const cue = storyCue(body);
  assert.notEqual(cue.toLowerCase(), body.toLowerCase());
  assert.ok(cue.length < body.length);
  assert.match(cue, /Bangalore|airport|security|daughter/i);
});

test('legacy formatting is converted to ordinary readable text', () => {
  assert.equal(
    plainMemoryText('## Lesson\n\n- **Talk to users** before building.\n\nSee [[people.md|people]].'),
    'Lesson\n\nTalk to users before building.\n\nSee people.',
  );
});

test('first return is three days and successful returns progressively spread out', () => {
  const createdAt = new Date('2026-08-01T10:00:00.000Z');
  assert.equal(scheduleFirstRecall(createdAt, 3), '2026-08-04T10:00:00.000Z');

  const first = {
    id: 'm1', title: 'Memory', body: 'A story', kind: 'note', folder: 'Inbox', path: 'Inbox/memory.md',
    createdAt: createdAt.toISOString(), updatedAt: createdAt.toISOString(), nextRecallAt: '2026-08-04T10:00:00.000Z',
  };
  const afterFirst = gradeRecall(first, 'remembered', new Date('2026-08-04T10:00:00.000Z'));
  assert.equal(afterFirst.nextRecallAt, '2026-08-18T10:00:00.000Z');
  const afterSecond = gradeRecall({ ...first, ...afterFirst, path: first.path, createdAt: first.createdAt, updatedAt: first.updatedAt }, 'remembered', new Date('2026-08-18T10:00:00.000Z'));
  assert.equal(afterSecond.nextRecallAt, '2026-09-17T10:00:00.000Z');
});

test('not yet returns soon, stopping keeps the memory but clears its return', () => {
  const memory = {
    id: 'm1', title: 'Memory', body: 'A story', kind: 'note', folder: 'Inbox', path: 'Inbox/memory.md',
    createdAt: '2026-08-01T10:00:00.000Z', updatedAt: '2026-08-01T10:00:00.000Z',
    lastRecalledAt: '2026-08-01T10:00:00.000Z', nextRecallAt: '2026-08-15T10:00:00.000Z',
  };
  const missed = gradeRecall(memory, 'forgot', new Date('2026-08-15T10:00:00.000Z'));
  assert.equal(missed.nextRecallAt, '2026-08-16T10:00:00.000Z');
  assert.equal(stopResurfacing(memory).nextRecallAt, undefined);
  assert.equal(MAX_SESSION_MEMORIES, 5);
});

test('mobile flow uses tellable-memory language and no legacy authoring controls', async () => {
  const [capture, today, library, note] = await Promise.all([
    readFile(new URL('../app/capture.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/(tabs)/index.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/(tabs)/files.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/note/[id].tsx', import.meta.url), 'utf8'),
  ]);

  for (const source of [capture, today, library, note]) {
    assert.doesNotMatch(source, /Book learning|Experience|Recall cue|Memory details|Formatting toolbar/);
  }
  assert.match(capture, /What’s worth remembering\?/);
  assert.match(today, /Try telling it without looking/);
  assert.match(today, /Could you tell it\?/);
  assert.match(today, /MAX_SESSION_MEMORIES/);
  assert.match(note, /Stop resurfacing/);
  assert.doesNotMatch(note, /Memory title|Choose a date|ResurfaceDatePicker/);
  assert.match(library, /Search people, places, moments/);
});

test('result copy matches the storytelling outcome', () => {
  assert.equal(recallResultLabel('forgot'), 'Not yet');
  assert.equal(recallResultLabel('partial'), 'Mostly');
  assert.equal(recallResultLabel('remembered'), 'Yes');
  assert.equal(savedMemoryMessage('2026-08-29T10:00:00.000Z', 'en-US'), 'Saved. We’ll bring it back on Aug 29.');
  assert.equal(recallCompletionMessage('2026-09-09T10:00:00.000Z', 0, 'en-US'), 'Nice. Back on Sep 9. Done for now.');
  assert.equal(nextUpcomingRecallMessage('2026-08-29T10:00:00.000Z', 'en-US'), 'Next one comes back on Aug 29.');
});

test('library search finds combinations of people, places, and body words', () => {
  const memory = {
    title: 'Airport moment',
    body: 'In Tokyo, Ravi told me a funny story about a taxi driver.',
    folder: 'Inbox', path: 'Inbox/airport.md', kind: 'note', source: '',
  };
  assert.equal(matchesLibrarySearch(memory, 'Tokyo Ravi'), true);
  assert.equal(matchesLibrarySearch(memory, 'taxi story'), true);
  assert.equal(matchesLibrarySearch(memory, 'airport taxi'), true);
  assert.equal(matchesLibrarySearch(memory, 'book-learning'), false);
  assert.equal(matchesLibrarySearch(memory, 'airport.md'), false);
});

test('local calendar inputs round-trip safely', () => {
  assert.equal(dateInputFromDate(new Date(2026, 7, 26)), '2026-08-26');
  const parsed = dateInputToDate('2026-08-26');
  assert.ok(parsed);
  assert.equal(localDateInputValue(parsed.toISOString()), '2026-08-26');
  assert.equal(dateInputToDate('2026-02-30'), null);
});

test('note route params opt into editing even when params are arrays', () => {
  assert.equal(editingFromParam(undefined), false);
  assert.equal(editingFromParam(['true']), true);
  assert.equal(editingFromParam('false'), false);
});

test('bottom tabs keep comfortable device-safe spacing', () => {
  assert.deepEqual(tabBarMetrics(0, false), { bottomPadding: 16, height: 74 });
  assert.deepEqual(tabBarMetrics(24, false), { bottomPadding: 24, height: 82 });
  assert.deepEqual(tabBarMetrics(0, true), { bottomPadding: 18, height: 76 });
});

test('reminder copy stays quiet and outcome-oriented', () => {
  assert.equal(reminderNotificationMessage(1), 'A memory is ready to come back.');
  assert.equal(reminderNotificationMessage(8), 'A few memories are ready to come back.');
  assert.equal(reminderStatusCopy({ enabled: false, reminderHour: 9, reminderMinute: 0 }), 'Get a quiet alert when something is ready to come back.');
});

test('browser storage failures surface instead of becoming silent saves', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: undefined });
    assert.throws(() => readBrowserValue('stories:test'), /Browser storage is unavailable/);
    assert.throws(() => writeBrowserValue('stories:test', 'value'), /Browser storage is unavailable/);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('first browser launch opens an empty memory store', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const storage = { getItem: () => null, setItem: () => {} };
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
    assert.deepEqual(await new BrowserFileStore().list(), []);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('cold-start saves stay blocked until local memories have opened', () => {
  assert.throws(() => ensureVaultReady(false, true), /local vault is still opening/);
  assert.throws(() => ensureVaultReady(true, false), /local vault is still opening/);
  assert.doesNotThrow(() => ensureVaultReady(true, true));
});
