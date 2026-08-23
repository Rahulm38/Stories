import assert from 'node:assert/strict';
import test from 'node:test';
import {
  activeWikilinkAtCursor,
  appendRecallReflection,
  createMemoryVault,
  deferRecall,
  draftForMissingLink,
  dueRecalls,
  gradeRecall,
  insertWikilink,
  normalizeRecallTimestamp,
  parseNoteFile,
  scheduleFirstRecall,
  serializeNote,
  type MemoryNote,
  type VaultFile,
  type VaultFileStore,
} from './index.ts';

class MemoryFileStore implements VaultFileStore {
  files = new Map<string, string>();
  operations: string[] = [];

  async list(): Promise<VaultFile[]> {
    return Array.from(this.files, ([path, markdown]) => ({ path, markdown }));
  }

  async replace(previousPath: string | undefined, nextPath: string, markdown: string): Promise<void> {
    this.operations.push(`replace:${previousPath || '-'}->${nextPath}`);
    const nextFiles = new Map(this.files);
    if (previousPath && previousPath !== nextPath) nextFiles.delete(previousPath);
    nextFiles.set(nextPath, markdown);
    this.files = nextFiles;
  }
}

class FailingMemoryFileStore extends MemoryFileStore {
  failOnCall?: number;
  callCount = 0;

  override async replace(previousPath: string | undefined, nextPath: string, markdown: string): Promise<void> {
    this.callCount += 1;
    if (this.callCount === this.failOnCall) throw new Error('simulated second-write failure');
    await super.replace(previousPath, nextPath, markdown);
  }
}

class PausedFirstWriteStore extends MemoryFileStore {
  readonly firstWriteStarted: Promise<void>;
  private releaseFirstWriteGate!: () => void;
  private resolveFirstWriteStarted!: () => void;
  private replaceCount = 0;

  constructor() {
    super();
    this.firstWriteStarted = new Promise<void>((resolve) => {
      this.resolveFirstWriteStarted = resolve;
    });
  }

  releaseFirstWrite() {
    this.releaseFirstWriteGate();
  }

  override async replace(previousPath: string | undefined, nextPath: string, markdown: string): Promise<void> {
    this.replaceCount += 1;
    if (this.replaceCount === 1) {
      this.resolveFirstWriteStarted();
      await new Promise<void>((resolve) => {
        this.releaseFirstWriteGate = resolve;
      });
    }
    await super.replace(previousPath, nextPath, markdown);
  }
}

test('editing through MemoryVault preserves recall metadata', async () => {
  const store = new MemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();
  const scheduled = await vault.save({
    body: 'Keep this idea',
    source: 'Indistractable by Nir Eyal',
    nextRecallAt: '2026-08-09T10:00:00.000Z',
    recallStatus: 'partial',
    lastRecalledAt: '2026-08-08T10:00:00.000Z',
  });

  const edited = await vault.save({ id: scheduled.id, title: 'A clearer title', body: 'Edited idea' });

  assert.equal(edited.nextRecallAt, '2026-08-09T10:00:00.000Z');
  assert.equal(edited.source, 'Indistractable by Nir Eyal');
  assert.equal(edited.recallStatus, 'partial');
  assert.equal(edited.lastRecalledAt, '2026-08-08T10:00:00.000Z');
});

test('opening duplicate explicit IDs retains every note with unique runtime IDs', async () => {
  const store = new MemoryFileStore();
  store.files.set('Books/one.md', '---\nid: "shared-id"\ntitle: "One"\nfolder: "Books"\n---\nFirst');
  store.files.set('Books/two.md', '---\nid: "shared-id"\ntitle: "Two"\nfolder: "Books"\n---\nSecond');
  const vault = createMemoryVault(store);

  await vault.open();

  const notes = vault.list().sort((a, b) => a.path.localeCompare(b.path));
  assert.equal(notes.length, 2);
  assert.equal(new Set(notes.map((note) => note.id)).size, 2);
  assert.deepEqual(notes.map((note) => [note.path, note.body]), [
    ['Books/one.md', 'First'],
    ['Books/two.md', 'Second'],
  ]);
});

test('opening colliding legacy fallback IDs retains every note', async () => {
  const store = new MemoryFileStore();
  store.files.set('Inbox/a+b.md', 'First legacy note');
  store.files.set('Inbox/a b.md', 'Second legacy note');
  const vault = createMemoryVault(store);

  await vault.open();

  const notes = vault.list().sort((a, b) => a.path.localeCompare(b.path));
  assert.equal(notes.length, 2);
  assert.equal(new Set(notes.map((note) => note.id)).size, 2);
  assert.deepEqual(notes.map((note) => [note.path, note.body]), [
    ['Inbox/a b.md', 'Second legacy note'],
    ['Inbox/a+b.md', 'First legacy note'],
  ]);
});

test('editing through MemoryVault can explicitly clear optional metadata', async () => {
  const store = new MemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();
  const scheduled = await vault.save({
    body: 'Keep this idea',
    source: 'Indistractable by Nir Eyal',
    nextRecallAt: '2026-08-09T10:00:00.000Z',
    recallPrompt: 'What will I change?',
    recallStatus: 'partial',
    lastRecalledAt: '2026-08-08T10:00:00.000Z',
  });

  const edited = await vault.save({
    id: scheduled.id,
    body: 'Edited idea',
    source: undefined,
    nextRecallAt: undefined,
    recallPrompt: undefined,
    recallStatus: undefined,
    lastRecalledAt: undefined,
  });

  assert.equal(edited.source, undefined);
  assert.equal(edited.nextRecallAt, undefined);
  assert.equal(edited.recallPrompt, undefined);
  assert.equal(edited.recallStatus, undefined);
  assert.equal(edited.lastRecalledAt, undefined);

  const reopened = createMemoryVault(store);
  await reopened.open();
  const persisted = reopened.read(edited.id);
  assert.ok(persisted);
  assert.equal(persisted.source, undefined);
  assert.equal(persisted.nextRecallAt, undefined);
  assert.equal(persisted.recallPrompt, undefined);
  assert.equal(persisted.recallStatus, undefined);
  assert.equal(persisted.lastRecalledAt, undefined);
});

test('saving a new note honors its identity and preserves kind on edit', async () => {
  const store = new MemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();

  const created = await vault.save({
    id: 'book-learning-1',
    title: 'Learning',
    body: 'A useful idea',
    kind: 'book-learning',
  });
  const edited = await vault.save({ id: created.id, body: 'An edited idea' });

  assert.equal(created.id, 'book-learning-1');
  assert.equal(edited.id, 'book-learning-1');
  assert.equal(edited.kind, 'book-learning');
});

test('saving duplicate titles never reuses a collision fallback path', async () => {
  const store = new MemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();

  const first = await vault.save({ id: 'note-aaaaaa', title: 'Same', body: 'First', folder: 'Books' });
  const second = await vault.save({ id: 'note-bbbbbb', title: 'Same', body: 'Second', folder: 'Books' });
  const third = await vault.save({ id: 'other-bbbbbb', title: 'Same', body: 'Third', folder: 'Books' });

  assert.equal(new Set([first.path, second.path, third.path]).size, 3);
  assert.equal(store.files.size, 3);
  assert.equal(vault.read(second.id)?.body, 'Second');
  assert.equal(vault.read(third.id)?.body, 'Third');
});

test('concurrent saves serialize before choosing paths and updating the snapshot', async () => {
  const store = new PausedFirstWriteStore();
  const vault = createMemoryVault(store);
  await vault.open();

  const firstSave = vault.save({ id: 'concurrent-one', title: 'Same title', body: 'First' });
  await store.firstWriteStarted;
  const secondSave = vault.save({ id: 'concurrent-two', title: 'Same title', body: 'Second' });
  store.releaseFirstWrite();
  const [first, second] = await Promise.all([firstSave, secondSave]);

  assert.notEqual(first.path, second.path);
  assert.equal(store.files.size, 2);
  assert.deepEqual(new Set(vault.list().map((note) => note.id)), new Set(['concurrent-one', 'concurrent-two']));
});

test('saving a note preserves intentional Markdown body whitespace', async () => {
  const store = new MemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();
  const body = '\n  Keep this indentation.  \n\n';

  const saved = await vault.save({ title: 'Whitespace', body });

  assert.equal(vault.read(saved.id)?.body, body);
  assert.equal(parseNoteFile({ path: saved.path, markdown: store.files.get(saved.path)! }).body, body);
});

test('moving a note replaces safely and rewrites qualified backlinks', async () => {
  const store = new MemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();
  const target = await vault.save({ title: 'Alpha', body: 'Target', folder: 'Books' });
  const source = await vault.save({ title: 'Source', body: 'See [[Books/alpha.md|the idea]]', folder: 'Inbox' });
  store.operations = [];

  const moved = await vault.save({ id: target.id, title: target.title, body: target.body, folder: 'Experiences' });

  assert.equal(moved.path, 'Experiences/alpha.md');
  assert.deepEqual(store.operations, [
    'replace:Books/alpha.md->Experiences/alpha.md',
    'replace:Inbox/source.md->Inbox/source.md',
  ]);
  assert.equal(vault.read(source.id)?.body, 'See [[Experiences/alpha.md|the idea]]');
  assert.equal(store.files.has('Books/alpha.md'), false);
});

test('moving into a filename collision rewrites basename-only backlinks', async () => {
  const store = new MemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();
  const target = await vault.save({ title: 'Alpha', body: 'Target', folder: 'Books' });
  await vault.save({ title: 'Alpha', body: 'Existing destination', folder: 'Experiences' });
  const source = await vault.save({ title: 'Source', body: 'See [[alpha.md]]', folder: 'Books' });
  const unrelated = await vault.save({ title: 'Other source', body: 'See [[alpha.md]]', folder: 'Experiences' });

  const moved = await vault.save({ id: target.id, title: target.title, body: target.body, folder: 'Experiences' });

  assert.match(moved.path, /^Experiences\/alpha-.+\.md$/);
  assert.equal(vault.read(source.id)?.body, `See [[${moved.path}]]`);
  assert.equal(vault.read(unrelated.id)?.body, 'See [[alpha.md]]');
});

test('moving a note rolls back the target when backlink rewriting fails', async () => {
  const store = new FailingMemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();
  const target = await vault.save({ title: 'Alpha', body: 'Target', folder: 'Books' });
  const source = await vault.save({ title: 'Source', body: 'See [[Books/alpha.md|the idea]]', folder: 'Inbox' });
  const originalTarget = store.files.get('Books/alpha.md');
  const originalSource = store.files.get('Inbox/source.md');
  store.failOnCall = store.callCount + 2;

  await assert.rejects(
    vault.save({ id: target.id, title: target.title, body: target.body, folder: 'Experiences' }),
    /simulated second-write failure/,
  );

  assert.equal(store.files.has('Books/alpha.md'), true);
  assert.equal(store.files.has('Experiences/alpha.md'), false);
  assert.equal(store.files.get('Books/alpha.md'), originalTarget);
  assert.equal(store.files.get('Inbox/source.md'), originalSource);
  assert.equal(vault.read(target.id)?.path, 'Books/alpha.md');
  assert.equal(vault.read(source.id)?.body, 'See [[Books/alpha.md|the idea]]');
});

test('link resolution prefers the source folder and rejects fuzzy punctuation collisions', async () => {
  const store = new MemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();
  const elsewhere = await vault.save({ title: 'Same', body: 'Elsewhere', folder: 'Other' });
  const nearby = await vault.save({ title: 'Same', body: 'Nearby', folder: 'Here' });
  const source = await vault.save({ title: 'Source', body: '[[Same]]', folder: 'Here' });
  await vault.save({ title: 'C', body: 'Not C plus plus', folder: 'Here' });

  assert.equal(vault.resolveLink('Same', source.id).note?.id, nearby.id);
  assert.equal(vault.resolveLink('Same').note, undefined);
  assert.equal(vault.resolveLink('Same').status, 'ambiguous');
  assert.equal(vault.resolveLink('C++', source.id).note, undefined);
  assert.equal(vault.resolveLink('C++', source.id).status, 'missing');
  assert.notEqual(elsewhere.id, nearby.id);
});

test('link resolution accepts a wikilink alias in the target', async () => {
  const store = new MemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();
  const target = await vault.save({ title: 'Alpha', body: 'Target', folder: 'Books' });

  assert.equal(vault.resolveLink('[[Books/alpha.md|the idea]]').note?.id, target.id);
});

test('wikilink insertion qualifies only duplicate filenames', async () => {
  const notes = [
    note('one', 'Alpha', 'Books/alpha.md', 'Books'),
    note('two', 'Beta', 'Books/beta.md', 'Books'),
    note('three', 'Alpha copy', 'Other/alpha.md', 'Other'),
  ];
  const active = activeWikilinkAtCursor('See [[be', 8);
  assert.ok(active);
  assert.equal(insertWikilink('See [[be', active, notes[1], notes).value, 'See [[beta.md]]');
  assert.equal(insertWikilink('See [[be', active, notes[0], notes).value, 'See [[Books/alpha.md]]');
});

test('missing links seed a local draft without losing Unicode folders', () => {
  assert.deepEqual(draftForMissingLink('研究/书籍.md', 'Inbox'), {
    title: '书籍',
    body: '',
    folder: '研究',
    kind: 'note',
  });
});

test('Markdown frontmatter accepts CRLF and Unicode paths', () => {
  const parsed = parseNoteFile({
    path: '研究/书籍.md',
    markdown: '---\r\nid: "unicode-1"\r\ntitle: "研究笔记"\r\nfolder: "研究"\r\nkind: "note"\r\ndate: "2026-08-08T00:00:00.000Z"\r\n---\r\n内容',
  });
  assert.equal(parsed.id, 'unicode-1');
  assert.equal(parsed.title, '研究笔记');
  assert.equal(parsed.folder, '研究');
  assert.equal(parsed.body, '内容');
});

test('Markdown frontmatter round-trips a note source', () => {
  const original = {
    ...note('source-1', 'Distraction', 'Books/distraction.md', 'Books'),
    source: 'Indistractable by Nir Eyal',
  };

  const parsed = parseNoteFile({ path: original.path, markdown: serializeNote(original) });

  assert.equal(parsed.source, 'Indistractable by Nir Eyal');
});

test('editing a note preserves unknown and multiline frontmatter', async () => {
  const store = new MemoryFileStore();
  store.files.set('Books/metadata.md', '---\nid: "metadata-1"\ntitle: "Metadata"\nfolder: "Books"\ntags:\n  - focus\n  - recall\naliases: ["Remember this"]\n---\nBody');
  const vault = createMemoryVault(store);
  await vault.open();

  const note = vault.list()[0];
  assert.ok(note);
  await vault.save({ id: note.id, body: 'Edited body' });

  const markdown = store.files.get('Books/metadata.md');
  assert.ok(markdown);
  assert.match(markdown, /tags:\n  - focus\n  - recall/);
  assert.match(markdown, /aliases: \["Remember this"\]/);
});

test('recall scheduling is deterministic and cue order is earliest first', () => {
  const now = new Date('2026-08-08T10:00:00.000Z');
  const later = note('later', 'Later', 'Books/later.md', 'Books', '2026-08-08T09:00:00.000Z');
  const earlier = note('earlier', 'Earlier', 'Books/earlier.md', 'Books', '2026-08-08T08:00:00.000Z');
  assert.deepEqual(dueRecalls([later, earlier], now).map((item) => item.id), ['earlier', 'later']);
  assert.equal(scheduleFirstRecall(now), '2026-08-09T10:00:00.000Z');
  const sourced = { ...earlier, source: 'Deep Work by Cal Newport' };
  const graded = gradeRecall(sourced, 'remembered', now);
  const deferred = deferRecall(sourced, now);
  assert.equal(graded.nextRecallAt, '2026-08-22T10:00:00.000Z');
  assert.equal(graded.source, 'Deep Work by Cal Newport');
  assert.equal(deferred.nextRecallAt, '2026-08-09T10:00:00.000Z');
  assert.equal(deferred.source, 'Deep Work by Cal Newport');
});

test('recall timestamps reject impossible calendar dates and tie-break equal due times', () => {
  assert.equal(normalizeRecallTimestamp('2026-02-31T09:00:00.000Z'), undefined);

  const due = '2026-08-08T08:00:00.000Z';
  const alpha = note('alpha', 'Alpha', 'Books/alpha.md', 'Books', due);
  const beta = note('beta', 'Beta', 'Books/beta.md', 'Books', due);
  assert.deepEqual(dueRecalls([beta, alpha], new Date('2026-08-08T10:00:00.000Z')).map((item) => item.id), ['alpha', 'beta']);
});

test('vault ordering puts notes with invalid update dates after dated notes', async () => {
  const store = new MemoryFileStore();
  store.files.set('Inbox/invalid.md', '---\nid: "invalid"\ntitle: "Invalid"\nkind: "note"\nfolder: "Inbox"\ndate: "2026-08-01T00:00:00.000Z"\nupdatedAt: "not-a-date"\n---\nInvalid');
  store.files.set('Inbox/dated.md', '---\nid: "dated"\ntitle: "Dated"\nkind: "note"\nfolder: "Inbox"\ndate: "2026-08-01T00:00:00.000Z"\nupdatedAt: "2026-08-08T00:00:00.000Z"\n---\nDated');
  const vault = createMemoryVault(store);

  await vault.open();

  assert.deepEqual(vault.list().map((note) => note.id), ['dated', 'invalid']);
});

test('recall reflections append a dated Markdown section only when nonblank', () => {
  const now = new Date('2026-08-08T10:00:00.000Z');
  const body = 'An existing note.';

  assert.equal(appendRecallReflection(body, '   \n', now), body);
  assert.equal(
    appendRecallReflection(body, '  I can apply this to [[Work/focus.md]].  ', now),
    'An existing note.\n\n## Recall reflection\n\n2026-08-08\n\nI can apply this to [[Work/focus.md]].',
  );
});

function note(id: string, title: string, path: string, folder: string, nextRecallAt?: string): MemoryNote {
  return {
    id,
    title,
    body: title,
    kind: 'note',
    folder,
    path,
    createdAt: '2026-08-08T00:00:00.000Z',
    updatedAt: '2026-08-08T00:00:00.000Z',
    nextRecallAt,
  };
}
