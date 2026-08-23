import assert from 'node:assert/strict';
import test from 'node:test';

import { captureKindFromParam, editingFromParam } from '../src/navigation/route-state.ts';
import { matchesLibrarySearch } from '../src/navigation/library-search.ts';
import { folderForKind } from '../src/navigation/note-folder.ts';
import { localDateInputValue } from '../src/navigation/local-date.ts';
import { openMarkdownLink } from '../src/ui/markdown-links.ts';
import { readBrowserValue, writeBrowserValue } from '../src/vault/browser-storage.ts';
import { BrowserFileStore } from '../src/vault/browser-file-store.ts';
import { ensureVaultReady } from '../src/vault/save-gate.ts';
import { DEFAULT_RECALL_CHOICE, MEMORY_KIND_OPTIONS, RECALL_OPTIONS, memoryDetailsSummary, recallDaysForChoice } from '../src/capture/options.ts';
import { tabBarMetrics } from '../src/navigation/tab-bar.ts';
import { recallCompletionMessage, recallResultLabel, remainingRecallMessage, savedMemoryMessage } from '../src/recall/presentation.ts';

test('capture route params update the selected capture kind', () => {
  assert.equal(captureKindFromParam(undefined), 'note');
  assert.equal(captureKindFromParam('book-learning'), 'book-learning');
  assert.equal(captureKindFromParam(['experience']), 'experience');
  assert.deepEqual(MEMORY_KIND_OPTIONS.map((option) => option.label), ['Note', 'Book learning', 'Experience']);
});

test('capture defaults to a three-day recall without a Tomorrow shortcut', () => {
  assert.equal(DEFAULT_RECALL_CHOICE, 'three-days');
  assert.equal(recallDaysForChoice(DEFAULT_RECALL_CHOICE), 3);
  assert.equal(recallDaysForChoice('week'), 7);
  assert.equal(recallDaysForChoice('off'), undefined);
  assert.deepEqual(RECALL_OPTIONS.map((option) => option.label), ['3 days', '1 week', 'Off']);
});

test('collapsed memory details summarize kind and the existing recall choice', () => {
  assert.equal(memoryDetailsSummary('note', 'three-days'), 'Note · returns in 3 days');
  assert.equal(memoryDetailsSummary('book-learning', 'week'), 'Book learning · returns in 1 week');
  assert.equal(memoryDetailsSummary('experience', 'off'), 'Experience · does not return');
});

test('recall result copy maps to the existing scheduling outcomes', () => {
  assert.equal(recallResultLabel('forgot'), 'Not yet');
  assert.equal(recallResultLabel('partial'), 'Partly');
  assert.equal(recallResultLabel('remembered'), 'Got it');
});

test('recall completion names the return date and remaining work', () => {
  assert.equal(
    recallCompletionMessage('2026-08-25T10:00:00.000Z', 2, 'en-US'),
    'Practiced. Back on Aug 25. 2 recalls left today.',
  );
  assert.equal(remainingRecallMessage(0), 'All caught up today.');
  assert.equal(recallCompletionMessage('not-a-date', 0, 'en-US'), 'Practiced. All caught up today.');
});

test('first-save confirmation explains the scheduled return', () => {
  assert.equal(
    savedMemoryMessage('2026-08-26T10:00:00.000Z', 'en-US'),
    'Saved privately. It returns on Aug 26.',
  );
  assert.equal(savedMemoryMessage(undefined, 'en-US'), 'Saved privately.');
});

test('bottom tabs keep a comfortable device-safe gap', () => {
  assert.deepEqual(tabBarMetrics(0, false), { bottomPadding: 16, height: 74 });
  assert.deepEqual(tabBarMetrics(24, false), { bottomPadding: 24, height: 82 });
  assert.deepEqual(tabBarMetrics(0, true), { bottomPadding: 18, height: 76 });
  assert.deepEqual(tabBarMetrics(34, true), { bottomPadding: 34, height: 92 });
});

test('library search includes the durable Markdown path and note kind', () => {
  const note = {
    title: 'A useful idea',
    body: 'Remember this later',
    folder: 'Books',
    path: 'Books/deep-work.md',
    kind: 'book-learning',
    source: undefined,
  };

  assert.equal(matchesLibrarySearch(note, 'deep-work.md'), true);
  assert.equal(matchesLibrarySearch(note, 'book-learning'), true);
  assert.equal(matchesLibrarySearch(note, 'does-not-exist'), false);
});

test('editing a note preserves nested folders unless its kind changes', () => {
  const book = { kind: 'book-learning', folder: 'Books/Thinking' };
  assert.equal(folderForKind('book-learning', book), 'Books/Thinking');
  assert.equal(folderForKind('experience', book), 'Experiences');
  assert.equal(folderForKind('note', book), 'Inbox');
});

test('recall date input uses the device-local calendar date', () => {
  const value = '2026-08-09T19:00:00.000Z';
  const date = new Date(value);
  const expected = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  assert.equal(localDateInputValue(value), expected);
});

test('note route params opt into editing even when params are arrays', () => {
  assert.equal(editingFromParam(undefined), false);
  assert.equal(editingFromParam(['true']), true);
  assert.equal(editingFromParam('false'), false);
});

test('browser storage failures are surfaced instead of becoming silent saves', () => {
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

test('browser storage writes can be read back through the same adapter seam', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
    writeBrowserValue('stories:test', 'value');
    assert.equal(readBrowserValue('stories:test'), 'value');
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('a first browser launch opens an empty vault without preview fixtures', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const storage = {
    getItem: () => null,
    setItem: () => {},
  };
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
    assert.deepEqual(await new BrowserFileStore().list(), []);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('failed external links do not create local notes', async () => {
  const localTargets = [];
  await openMarkdownLink(' https://example.invalid/note ', async () => {
    throw new Error('handoff failed');
  }, (target) => localTargets.push(target));
  assert.deepEqual(localTargets, []);

  await openMarkdownLink(' [[local-note.md]] ', async () => {}, (target) => localTargets.push(target));
  assert.deepEqual(localTargets, ['[[local-note.md]]']);
});

test('phone and SMS links are handed to the device instead of creating notes', async () => {
  const externalTargets = [];
  const localTargets = [];
  const openExternal = async (target) => externalTargets.push(target);

  await openMarkdownLink('tel:+15551234567', openExternal, (target) => localTargets.push(target));
  await openMarkdownLink('sms:+15551234567', openExternal, (target) => localTargets.push(target));

  assert.deepEqual(externalTargets, ['tel:+15551234567', 'sms:+15551234567']);
  assert.deepEqual(localTargets, []);
});

test('angle-wrapped external Markdown links are unwrapped before handoff', async () => {
  const externalTargets = [];
  const localTargets = [];

  await openMarkdownLink(' <https://example.com/a> ', async (target) => externalTargets.push(target), (target) => localTargets.push(target));

  assert.deepEqual(externalTargets, ['https://example.com/a']);
  assert.deepEqual(localTargets, []);
});

test('cold-start saves stay blocked until the vault has hydrated', () => {
assert.throws(() => ensureVaultReady(false, true), /local vault is still opening/);
assert.throws(() => ensureVaultReady(true, false), /local vault is still opening/);
assert.throws(() => ensureVaultReady(true, true, 'The local vault contains invalid files'), /invalid files/);
assert.doesNotThrow(() => ensureVaultReady(true, true));
});
