import assert from 'node:assert/strict';
import test from 'node:test';

import {
  classifyNoteFile,
  createMemoryVault,
  deferRecall,
  dueRecalls,
  gradeRecall,
  parseNoteFile,
  plainMemoryText,
  scheduleFirstRecall,
  SCHEMA_VERSION,
  serializeNote,
  stopResurfacing,
  storyCue,
  type MemoryNote,
  type VaultFile,
  type VaultFileStore,
} from './index.ts';

class MemoryFileStore implements VaultFileStore {
  files = new Map<string, string>();

  async list(): Promise<VaultFile[]> {
    return Array.from(this.files, ([path, markdown]) => ({ path, markdown }));
  }

  async replace(previousPath: string | undefined, nextPath: string, markdown: string): Promise<void> {
    if (previousPath && previousPath !== nextPath) this.files.delete(previousPath);
    this.files.set(nextPath, markdown);
  }

  async delete(path: string): Promise<void> {
    if (!this.files.has(path)) throw new Error('This memory could not be found');
    this.files.delete(path);
  }
}

function memory(overrides: Partial<MemoryNote> = {}): MemoryNote {
  return {
    id: 'memory-1',
    title: 'Airport moment',
    body: 'At Bangalore airport I met Ravi and heard a story worth keeping.',
    kind: 'note',
    folder: 'Inbox',
    path: 'Inbox/airport-moment.md',
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
    ...overrides,
  };
}

test('legacy compatibility codec stays schema-v1 and round-trips additive scheduling metadata', () => {
  assert.equal(SCHEMA_VERSION, 1);
  const original = memory({
    nextRecallAt: '2026-08-18T10:00:00.000Z',
    recallStatus: 'remembered',
    lastRecalledAt: '2026-08-04T10:00:00.000Z',
    reviewStrengthDays: 14,
  });
  const serialized = serializeNote(original);
  assert.match(serialized, /^---\nschemaVersion: 1\n/);
  const parsed = parseNoteFile({ path: original.path, markdown: serialized });
  assert.equal(parsed.id, original.id);
  assert.equal(parsed.body, original.body);
  assert.equal(parsed.nextRecallAt, original.nextRecallAt);
  assert.equal(parsed.reviewStrengthDays, 14);
  assert.equal(parsed.parseStatus, 'healthy');
});

test('older plain memory files remain readable while malformed metadata is quarantined', () => {
  const legacy = parseNoteFile({ path: 'Inbox/old-memory.md', markdown: 'An older memory still matters.' });
  assert.equal(legacy.body, 'An older memory still matters.');
  assert.equal(legacy.parseStatus, 'legacy');

  const malformed = { path: 'Inbox/broken.md', markdown: '---\nid: "broken\n---\nBody' };
  assert.equal(classifyNoteFile(malformed), 'quarantine');
  assert.equal(parseNoteFile(malformed).parseStatus, 'quarantine');
});

test('vault saves, reopens and explicitly clears optional metadata', async () => {
  const store = new MemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();

  const saved = await vault.save({
    body: 'Keep this useful moment',
    source: 'A conversation',
    nextRecallAt: '2026-08-29T10:00:00.000Z',
    recallStatus: 'partial',
    lastRecalledAt: '2026-08-25T10:00:00.000Z',
    reviewStrengthDays: 4,
  });
  const edited = await vault.save({
    id: saved.id,
    body: 'Keep this edited moment',
    source: undefined,
    nextRecallAt: undefined,
    recallStatus: undefined,
    lastRecalledAt: undefined,
    reviewStrengthDays: undefined,
  });

  assert.equal(edited.source, undefined);
  assert.equal(edited.nextRecallAt, undefined);
  assert.equal(edited.reviewStrengthDays, undefined);

  const reopened = createMemoryVault(store);
  await reopened.open();
  const persisted = reopened.read(saved.id);
  assert.ok(persisted);
  assert.equal(persisted.body, 'Keep this edited moment');
  assert.equal(persisted.nextRecallAt, undefined);
  assert.equal(persisted.reviewStrengthDays, undefined);
});

test('duplicate explicit ids are preserved as separate runtime memories', async () => {
  const store = new MemoryFileStore();
  store.files.set('Inbox/one.md', '---\nid: "same"\ntitle: "One"\nfolder: "Inbox"\n---\nFirst');
  store.files.set('Inbox/two.md', '---\nid: "same"\ntitle: "Two"\nfolder: "Inbox"\n---\nSecond');
  const vault = createMemoryVault(store);
  await vault.open();
  const notes = vault.list();
  assert.equal(notes.length, 2);
  assert.equal(new Set(notes.map((note) => note.id)).size, 2);
});

test('delete refuses to remove a memory changed outside Stories', async () => {
  const store = new MemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();
  const saved = await vault.save({ body: 'Original memory' });
  store.files.set(saved.path, `${store.files.get(saved.path)}\nexternal change`);
  await assert.rejects(vault.remove(saved.id), /changed outside Stories/);
  assert.equal(store.files.has(saved.path), true);
});

test('due memories use local calendar day rather than exact capture time', () => {
  const now = new Date(2026, 7, 26, 8, 0, 0);
  const dueToday = memory({ id: 'today', path: 'Inbox/today.md', nextRecallAt: '2026-08-26T23:59:00.000Z' });
  const future = memory({ id: 'future', path: 'Inbox/future.md', nextRecallAt: '2026-08-27T00:01:00.000Z' });
  assert.deepEqual(dueRecalls([future, dueToday], now).map((note) => note.id), ['today']);
});

test('first return is three days and ratings start at one, four and fourteen days', () => {
  const now = new Date('2026-08-01T10:00:00.000Z');
  assert.equal(scheduleFirstRecall(now, 3), '2026-08-04T10:00:00.000Z');
  const base = memory({ nextRecallAt: '2026-08-04T10:00:00.000Z' });
  assert.equal(gradeRecall(base, 'forgot', new Date('2026-08-04T10:00:00.000Z')).reviewStrengthDays, 1);
  assert.equal(gradeRecall(base, 'partial', new Date('2026-08-04T10:00:00.000Z')).reviewStrengthDays, 4);
  assert.equal(gradeRecall(base, 'remembered', new Date('2026-08-04T10:00:00.000Z')).reviewStrengthDays, 14);
});

test('successful recall progressively expands from stored strength', () => {
  const first = memory({
    lastRecalledAt: '2026-08-04T10:00:00.000Z',
    nextRecallAt: '2026-08-18T10:00:00.000Z',
    reviewStrengthDays: 14,
  });
  const second = gradeRecall(first, 'remembered', new Date('2026-08-18T10:00:00.000Z'));
  assert.equal(second.reviewStrengthDays, 30);
  assert.equal(second.nextRecallAt, '2026-09-17T10:00:00.000Z');

  const third = gradeRecall({ ...first, ...second }, 'remembered', new Date('2026-09-17T10:00:00.000Z'));
  assert.equal(third.reviewStrengthDays, 90);
});

test('deferring changes only the due date and freezes inferred legacy strength', () => {
  const original = memory({
    nextRecallAt: '2026-08-26T10:00:00.000Z',
    lastRecalledAt: '2026-08-12T10:00:00.000Z',
    reviewStrengthDays: 14,
  });
  const deferred = deferRecall(original, new Date('2026-08-26T10:00:00.000Z'));
  assert.equal(deferred.nextRecallAt, '2026-08-27T10:00:00.000Z');
  assert.equal(deferred.reviewStrengthDays, 14);

  const legacy = memory({
    nextRecallAt: '2026-08-26T10:00:00.000Z',
    lastRecalledAt: '2026-08-12T10:00:00.000Z',
  });
  const legacyDeferred = deferRecall(legacy, new Date('2026-08-26T10:00:00.000Z'));
  assert.equal(legacyDeferred.reviewStrengthDays, 14);
  assert.equal(stopResurfacing(legacy).reviewStrengthDays, 14);
  assert.equal(stopResurfacing(original).nextRecallAt, undefined);
});

test('plain compatibility conversion preserves useful links and safe clues avoid endings', () => {
  assert.equal(plainMemoryText('[Article](https://example.com)'), 'Article — https://example.com');
  assert.doesNotMatch(storyCue('The capital of France is Paris.'), /Paris/i);
});
