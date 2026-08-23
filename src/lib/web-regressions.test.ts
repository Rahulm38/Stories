import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node's strip-types runner needs the explicit extension.
import { findLinkedMemory, replaceRenamedWikilinks } from './memory-link-logic.ts';
// @ts-expect-error Node's strip-types runner needs the explicit extension.
import { mergeHydratedMemories, parseStorageRecord } from './memory-store-logic.ts';
// @ts-expect-error Node's strip-types runner needs the explicit extension.
import { selectDueMemory } from './recall-scheduling.ts';

const memory = (id: string, title: string, date: string, nextRecallAt?: string, folderPath = 'Inbox') => ({
  id,
  title,
  date,
  nextRecallAt,
  folderPath,
});

test('hydration keeps a note captured before stored data is applied', () => {
  const stored = [memory('stored', 'Stored note', '2026-08-20T00:00:00.000Z')];
  const pending = [memory('pending', 'Captured note', '2026-08-23T00:00:00.000Z')];
  assert.deepEqual(mergeHydratedMemories(stored, pending).map((item) => item.id), ['pending', 'stored']);
});

test('storage parsing distinguishes first launch from corrupt data', () => {
  const isRecord = (value: unknown): value is { files: [] } => (
    Boolean(value) && typeof value === 'object' && Array.isArray((value as { files?: unknown }).files)
  );
  assert.equal(parseStorageRecord(null, isRecord).status, 'missing');
  assert.equal(parseStorageRecord('{broken', isRecord).status, 'corrupt');
  assert.equal(parseStorageRecord('{"files":[]}', isRecord).status, 'valid');
});

test('Today selects the earliest due recall instead of the newest note', () => {
  const now = Date.parse('2026-08-23T12:00:00.000Z');
  const newerButLaterDue = memory('newer', 'Newer note', '2026-08-22T00:00:00.000Z', '2026-08-23T11:00:00.000Z');
  const olderButEarlierDue = memory('older', 'Older note', '2026-08-21T00:00:00.000Z', '2026-08-23T09:00:00.000Z');
  assert.equal(selectDueMemory([newerButLaterDue, olderButEarlierDue], now)?.id, 'older');
});

test('wikilinks prefer an exact title over punctuation-colliding fuzzy matches', () => {
  const plainC = memory('plain-c', 'C', '2026-08-20T00:00:00.000Z');
  const cpp = memory('cpp', 'C++', '2026-08-20T00:00:00.000Z');
  assert.equal(findLinkedMemory('C++', [plainC, cpp])?.id, 'cpp');
});

test('wikilinks stay unresolved when duplicate paths are ambiguous', () => {
  const first = memory('first', 'Same title', '2026-08-20T00:00:00.000Z');
  const second = memory('second', 'Same title', '2026-08-21T00:00:00.000Z');
  assert.equal(findLinkedMemory('same-title.md', [first, second]), undefined);
});

test('renaming preserves folder qualification in existing wikilinks', () => {
  const previous = memory('book', 'Old title', '2026-08-20T00:00:00.000Z', undefined, 'Books');
  const next = memory('book', 'New title', '2026-08-20T00:00:00.000Z', undefined, 'Books');
  assert.equal(replaceRenamedWikilinks('See [[Books/old-title.md]].', previous, next), 'See [[Books/new-title.md]].');
});

test('renaming does not retarget an ambiguous duplicate wikilink', () => {
  const previous = memory('first', 'Same title', '2026-08-20T00:00:00.000Z');
  const duplicate = memory('second', 'Same title', '2026-08-21T00:00:00.000Z');
  const next = memory('first', 'New title', '2026-08-20T00:00:00.000Z');
  assert.equal(
    replaceRenamedWikilinks('See [[same-title.md]].', previous, next, [previous, duplicate]),
    'See [[same-title.md]].',
  );
});
