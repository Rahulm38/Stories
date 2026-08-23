import assert from 'node:assert/strict';
import test from 'node:test';

import { captureKindFromParam, editingFromParam } from '../src/navigation/route-state.ts';
import { matchesLibrarySearch } from '../src/navigation/library-search.ts';
import { folderForKind } from '../src/navigation/note-folder.ts';
import { localDateInputValue } from '../src/navigation/local-date.ts';
import { openMarkdownLink } from '../src/ui/markdown-links.ts';
import { readBrowserValue, writeBrowserValue } from '../src/vault/browser-storage.ts';
import { ensureVaultReady } from '../src/vault/save-gate.ts';

test('capture route params update the selected capture kind', () => {
  assert.equal(captureKindFromParam(undefined), 'note');
  assert.equal(captureKindFromParam('book-learning'), 'book-learning');
  assert.equal(captureKindFromParam(['experience']), 'experience');
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

test('failed external links do not create local notes', async () => {
  const localTargets = [];
  await openMarkdownLink(' https://example.invalid/note ', async () => {
    throw new Error('handoff failed');
  }, (target) => localTargets.push(target));
  assert.deepEqual(localTargets, []);

  await openMarkdownLink(' [[local-note.md]] ', async () => {}, (target) => localTargets.push(target));
  assert.deepEqual(localTargets, ['[[local-note.md]]']);
});

test('cold-start saves stay blocked until the vault has hydrated', () => {
assert.throws(() => ensureVaultReady(false, true), /local vault is still opening/);
assert.throws(() => ensureVaultReady(true, false), /local vault is still opening/);
assert.throws(() => ensureVaultReady(true, true, 'The local vault contains invalid files'), /invalid files/);
assert.doesNotThrow(() => ensureVaultReady(true, true));
});
