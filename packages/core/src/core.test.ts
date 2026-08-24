import assert from 'node:assert/strict';
import test from 'node:test';
import {
  activeWikilinkAtCursor,
  appendRecallReflection,
  classifyLinkTarget,
  classifyNoteFile,
  createMemoryVault,
  deferRecall,
  draftForMissingLink,
  dueRecalls,
  gradeRecall,
  insertWikilink,
  migrateParsedNote,
  normalizeRecallTimestamp,
  parseNoteFile,
  scheduleFirstRecall,
  SCHEMA_VERSION,
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

test('moving a note rewrites qualified links in its own body', async () => {
  const store = new MemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();
  const target = await vault.save({ title: 'Alpha', body: 'See [[Books/alpha.md]]', folder: 'Books' });

  const moved = await vault.save({ id: target.id, body: target.body, folder: 'Experiences' });

  assert.equal(moved.path, 'Experiences/alpha.md');
  assert.equal(moved.body, 'See [[Experiences/alpha.md]]');
  assert.match(store.files.get(moved.path) || '', /See \[\[Experiences\/alpha\.md\]\]/);
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

test('wikilink insertion replaces a completed link when the cursor is inside it', () => {
  const notes = [
    note('one', 'Alpha', 'Books/alpha.md', 'Books'),
    note('two', 'Beta', 'Books/beta.md', 'Books'),
  ];
  const value = 'See [[beta.md]] later';
  const active = activeWikilinkAtCursor(value, 'See [[be'.length);
  assert.ok(active);

  assert.equal(insertWikilink(value, active, notes[0], notes).value, 'See [[alpha.md]] later');
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

test('serialized notes lead with the current schema version and parse it back', () => {
  const markdown = serializeNote(note('versioned-1', 'Versioned', 'Inbox/versioned.md', 'Inbox'));

  assert.match(markdown, /^---\nschemaVersion: 1\nid: /);

  const parsed = parseNoteFile({ path: 'Inbox/versioned.md', markdown });
  assert.equal(parsed.schemaVersion, SCHEMA_VERSION);
  assert.equal(parsed.parseStatus, 'healthy');
});

test('legacy files without frontmatter stay editable and migrate idempotently', () => {
  const file = { path: 'Inbox/legacy.md', markdown: 'An old plain note' };

  assert.equal(classifyNoteFile(file), 'legacy');

  const first = migrateParsedNote(parseNoteFile(file));
  const second = migrateParsedNote(first);

  assert.equal(first.parseStatus, 'legacy');
  assert.equal(first.schemaVersion, undefined);
  assert.deepEqual(second, first);
});

test('frontmatter written by a future schema version still parses without crashing', () => {
  const parsed = parseNoteFile({
    path: 'Inbox/future.md',
    markdown: '---\nschemaVersion: 99\nid: "future-1"\ntitle: "Future"\nfolder: "Inbox"\n---\nBody',
  });

  assert.equal(parsed.id, 'future-1');
  assert.equal(parsed.schemaVersion, 99);
  assert.equal(parsed.parseStatus, 'healthy');
});

test('future-schema notes remain read-only instead of being downgraded on save or delete', async () => {
  const markdown = '---\nschemaVersion: 99\nid: "future-1"\ntitle: "Future"\nfolder: "Inbox"\n---\nBody';
  const store = new MemoryFileStore();
  store.files.set('Inbox/future.md', markdown);
  const vault = createMemoryVault(store);
  await vault.open();
  const future = vault.list()[0];
  assert.ok(future);

  await assert.rejects(vault.save({ id: future.id, body: 'Changed' }), /newer schema version/);
  await assert.rejects(vault.remove(future.id), /newer schema version/);
  assert.equal(store.files.get('Inbox/future.md'), markdown);
});

test('malformed frontmatter is quarantined with raw content preserved', async () => {
  const markdown = '---\ntitle: "No identity"\nfolder: "Books"\ncustom: |\n  nested: true\n---\nBody text';
  const file = { path: 'Books/broken.md', markdown };

  assert.equal(classifyNoteFile(file), 'quarantine');
  assert.equal(classifyNoteFile({ path: 'Books/empty.md', markdown: '---\nid: ""\ntitle: "Empty"\n---\nBody' }), 'quarantine');

  const store = new MemoryFileStore();
  store.files.set('Books/broken.md', markdown);
  const vault = createMemoryVault(store);
  await vault.open();

  const quarantined = vault.list().find((item) => item.path === 'Books/broken.md');
  assert.ok(quarantined);
  assert.equal(quarantined.parseStatus, 'quarantine');
  assert.equal(quarantined.rawContent, markdown);
  assert.ok(vault.read(quarantined.id));

  await assert.rejects(vault.save({ id: quarantined.id, body: 'Do not replace the raw file' }), /quarantined/);
  assert.equal(store.files.get('Books/broken.md'), markdown);

  assert.equal(vault.resolveLink('broken').note, undefined);

  const target = await vault.save({ title: 'Alpha', body: 'Target', folder: 'Books' });
  const moved = await vault.save({ id: target.id, title: target.title, body: target.body, folder: 'Experiences' });

  assert.equal(store.files.get('Books/broken.md'), markdown);
  assert.match(moved.path, /^Experiences\/alpha\.md$/);
});

test('unterminated frontmatter is quarantined instead of treated as a legacy note', () => {
  const markdown = '---\nid: "unfinished-1"\ntitle: "Unfinished"\nBody that never closes';
  const parsed = parseNoteFile({ path: 'Inbox/unfinished.md', markdown });

  assert.equal(parsed.parseStatus, 'quarantine');
  assert.equal(parsed.rawContent, markdown);
});

test('quarantined notes are excluded from the core due queue', () => {
  const healthy = { ...note('healthy-due', 'Healthy', 'Inbox/healthy.md', 'Inbox', '2026-08-01T00:00:00.000Z') };
  const quarantined = { ...note('quarantined-due', 'Quarantined', 'Inbox/broken.md', 'Inbox', '2026-08-01T00:00:00.000Z'), parseStatus: 'quarantine' as const };

  assert.deepEqual(dueRecalls([healthy, quarantined], new Date('2026-08-02T00:00:00.000Z')).map((item) => item.id), ['healthy-due']);
});

test('vault removal deletes the file, updates memory, and notifies subscribers', async () => {
  class DeletableMemoryFileStore extends MemoryFileStore {
    deletedPaths: string[] = [];

    async delete(path: string): Promise<void> {
      this.deletedPaths.push(path);
      const nextFiles = new Map(this.files);
      nextFiles.delete(path);
      this.files = nextFiles;
    }
  }

  const store = new DeletableMemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();
  const kept = await vault.save({ title: 'Kept', body: 'Kept body' });
  const removed = await vault.save({ title: 'Removed', body: 'Removed body' });

  const changes: unknown[] = [];
  const unsubscribe = vault.subscribe((change) => changes.push(change));

  await vault.remove(removed.id);
  unsubscribe();

  assert.deepEqual(store.deletedPaths, [removed.path]);
  assert.equal(store.files.has(removed.path), false);
  assert.equal(vault.read(removed.id), undefined);
  assert.ok(vault.read(kept.id));
  assert.deepEqual(changes, [{ type: 'removed', note: removed }]);

  await assert.rejects(vault.remove(removed.id), /could not be found/);
});

test('vault removal rejects cleanly when the store cannot delete files', async () => {
  const store = new MemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();
  const saved = await vault.save({ title: 'Stuck', body: 'Body' });

  await assert.rejects(vault.remove(saved.id), /does not support deletion/);
  assert.equal(store.files.has(saved.path), true);
  assert.ok(vault.read(saved.id));
});

test('vault removal refuses to delete a file changed outside the open vault', async () => {
  class DeletableMemoryFileStore extends MemoryFileStore {
    async delete(path: string): Promise<void> {
      this.files.delete(path);
    }
  }

  const store = new DeletableMemoryFileStore();
  const vault = createMemoryVault(store);
  await vault.open();
  const saved = await vault.save({ title: 'Changed elsewhere', body: 'Original' });
  store.files.set(saved.path, `${store.files.get(saved.path)}\nExternal edit`);

  await assert.rejects(vault.remove(saved.id), /changed outside Stories/);
  assert.ok(store.files.has(saved.path));
  assert.ok(vault.read(saved.id));
});

test('removal serializes behind an in-flight save', async () => {
  class DeletablePausedStore extends PausedFirstWriteStore {
    deletedPaths: string[] = [];

    async delete(path: string): Promise<void> {
      this.deletedPaths.push(path);
      this.files.delete(path);
    }
  }

  const store = new DeletablePausedStore();
  store.files.set('Inbox/existing.md', '---\nid: "existing-one"\ntitle: "Existing"\nfolder: "Inbox"\n---\nExisting');
  const vault = createMemoryVault(store);
  await vault.open();

  const inFlightSave = vault.save({ id: 'in-flight-one', title: 'In flight', body: 'In flight' });
  await store.firstWriteStarted;
  const removal = vault.remove('existing-one').then(() => 'removed');
  store.releaseFirstWrite();
  const [saved, outcome] = await Promise.all([inFlightSave, removal]);

  assert.equal(outcome, 'removed');
  assert.ok(vault.read(saved.id));
  assert.equal(vault.read('existing-one'), undefined);
  assert.deepEqual(store.deletedPaths, ['Inbox/existing.md']);
});

test('link targets are classified as local wikilinks, allowed or unsafe external URLs, or relative paths', () => {
  assert.deepEqual(classifyLinkTarget('[[Books/alpha.md|alias]]'), { kind: 'wikilink-local' });
  assert.deepEqual(classifyLinkTarget('[[' + 'Note' + ']]'), { kind: 'wikilink-local' });

  for (const allowed of ['https://example.com/a?b=1', 'HTTP://EXAMPLE.COM', 'mailto:user@example.com', 'tel:+15550100', 'sms:+15550100']) {
    const classified = classifyLinkTarget(`  ${allowed}  `);
    assert.equal(classified.kind, 'external');
    assert.equal(classified.allowed, true, allowed);
  }

  for (const unsafe of ['javascript:alert(1)', 'javascript:', 'FILE:///etc/passwd', 'custom-app://open', 'data:text/html,hi']) {
    const classified = classifyLinkTarget(unsafe);
    assert.equal(classified.kind, 'external');
    if (classified.kind === 'external') {
      assert.equal(classified.allowed, false, unsafe);
      assert.match(classified.scheme, /^[a-z][a-z0-9+.-]*:/);
    }
  }

  assert.deepEqual(classifyLinkTarget('Books/alpha.md'), { kind: 'relative' });
  assert.deepEqual(classifyLinkTarget('   '), { kind: 'relative' });
  assert.deepEqual(classifyLinkTarget(''), { kind: 'relative' });
  assert.deepEqual(classifyLinkTarget('https:'), { kind: 'external', scheme: 'https:', allowed: false });
  assert.deepEqual(classifyLinkTarget('note\u0000.md'), { kind: 'blocked', reason: 'control-character' });
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

test('indented keys in multiline frontmatter cannot override note metadata', () => {
  const parsed = parseNoteFile({
    path: 'Books/metadata.md',
    markdown: '---\nid: "metadata-1"\ntitle: "Metadata"\nfolder: "Books"\ncustom: |\n  id: "not-note-metadata"\n  title: "Also not note metadata"\n---\nBody',
  });

  assert.equal(parsed.id, 'metadata-1');
  assert.equal(parsed.title, 'Metadata');
  assert.deepEqual(parsed.frontmatter, [
    'custom: |',
    '  id: "not-note-metadata"',
    '  title: "Also not note metadata"',
  ]);
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

test('recall outcomes preserve the existing one, four, and fourteen day schedule', () => {
  const now = new Date('2026-08-23T10:00:00.000Z');
  const memory = note('memory', 'A useful idea', 'Inbox/a-useful-idea.md', 'Inbox');

  const outcomes = [
    ['forgot', '2026-08-24T10:00:00.000Z'],
    ['partial', '2026-08-27T10:00:00.000Z'],
    ['remembered', '2026-09-06T10:00:00.000Z'],
  ] as const;

  for (const [status, nextRecallAt] of outcomes) {
    const graded = gradeRecall(memory, status, now);
    assert.equal(graded.recallStatus, status);
    assert.equal(graded.lastRecalledAt, '2026-08-23T10:00:00.000Z');
    assert.equal(graded.nextRecallAt, nextRecallAt);
  }
});

test('recall timestamps reject impossible calendar dates and tie-break equal due times', () => {
  assert.equal(normalizeRecallTimestamp('2026-02-31T09:00:00.000Z'), undefined);
  assert.equal(normalizeRecallTimestamp('2026-2-31'), undefined);
  assert.equal(normalizeRecallTimestamp('02/31/2026'), undefined);

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

test('vault ordering is deterministic when update dates tie or are invalid', async () => {
  const first = new MemoryFileStore();
  const second = new MemoryFileStore();
  const files = [
    ['Inbox/beta.md', '---\nid: "beta"\ntitle: "Beta"\nupdatedAt: "not-a-date"\n---\nBeta'],
    ['Inbox/alpha.md', '---\nid: "alpha"\ntitle: "Alpha"\nupdatedAt: "not-a-date"\n---\nAlpha'],
  ] as const;
  for (const [path, markdown] of files) first.files.set(path, markdown);
  for (const [path, markdown] of [...files].reverse()) second.files.set(path, markdown);

  const firstVault = createMemoryVault(first);
  const secondVault = createMemoryVault(second);
  await Promise.all([firstVault.open(), secondVault.open()]);

  assert.deepEqual(firstVault.list().map((item) => item.path), ['Inbox/alpha.md', 'Inbox/beta.md']);
  assert.deepEqual(secondVault.list().map((item) => item.path), ['Inbox/alpha.md', 'Inbox/beta.md']);
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
