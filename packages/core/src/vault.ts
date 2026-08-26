import { createNote, fileNameForNote, normalizeFolder, parseNoteFile, pathForNote, SCHEMA_VERSION, serializeNote } from './legacy-memory-format.ts';
import type { MemoryNote, MemoryVault, NoteDraft, VaultChange, VaultFileStore, VaultSnapshot } from './model.ts';

function sortNotes(notes: MemoryNote[]): MemoryNote[] {
  return [...notes].sort((a, b) => {
    const aTime = new Date(a.updatedAt).getTime();
    const bTime = new Date(b.updatedAt).getTime();
    const aValid = Number.isFinite(aTime);
    const bValid = Number.isFinite(bTime);
    const stableOrder = a.path.localeCompare(b.path) || a.id.localeCompare(b.id);
    if (!aValid && !bValid) return stableOrder;
    if (!aValid) return 1;
    if (!bValid) return -1;
    return bTime - aTime || stableOrder;
  });
}

function uniquePath(note: MemoryNote, notes: MemoryNote[]): string {
  const desired = pathForNote(note);
  if (!notes.some((item) => item.id !== note.id && item.path.toLowerCase() === desired.toLowerCase())) return desired;
  const extension = fileNameForNote(note).replace(/\.md$/i, '');
  const folder = normalizeFolder(note.folder);
  const suffix = note.id.slice(-6);
  let candidate = `${folder}/${extension}-${suffix}.md`;
  let attempt = 2;
  while (notes.some((item) => item.id !== note.id && item.path.toLowerCase() === candidate.toLowerCase())) {
    candidate = `${folder}/${extension}-${suffix}-${attempt}.md`;
    attempt += 1;
  }
  return candidate;
}

function uniqueRuntimeIds(notes: MemoryNote[]): MemoryNote[] {
  const usedIds = new Set<string>();
  return notes.map((note) => {
    if (!usedIds.has(note.id)) {
      usedIds.add(note.id);
      return note;
    }
    const pathSuffix = encodeURIComponent(note.path);
    let id = `${note.id}~${pathSuffix}`;
    let attempt = 2;
    while (usedIds.has(id)) {
      id = `${note.id}~${pathSuffix}~${attempt}`;
      attempt += 1;
    }
    usedIds.add(id);
    return { ...note, id };
  });
}

export function createMemoryVault(fileStore: VaultFileStore): MemoryVault {
  let notes: MemoryNote[] = [];
  let fileContents = new Map<string, string>();
  const listeners = new Set<(change: VaultChange) => void>();
  let saveQueue: Promise<void> = Promise.resolve();
  const notify = (change: VaultChange) => listeners.forEach((listener) => listener(change));
  const snapshot = (): VaultSnapshot => ({ notes: sortNotes(notes), readIssues: fileStore.getReadIssues?.() ?? [] });

  const saveDraft = async (draft: NoteDraft): Promise<MemoryNote> => {
    const previous = draft.id ? notes.find((note) => note.id === draft.id) : undefined;
    if (previous?.parseStatus === 'quarantine') throw new Error('This memory is quarantined and cannot be rewritten automatically');
    if (previous?.schemaVersion !== undefined && previous.schemaVersion > SCHEMA_VERSION) {
      throw new Error('This memory uses a newer schema version and cannot be modified by this app');
    }

    const hasDraftField = (field: keyof NoteDraft) => Object.prototype.hasOwnProperty.call(draft, field);
    const folder = normalizeFolder(draft.folder || previous?.folder);
    const candidate = createNote({
      ...draft,
      id: previous?.id ?? draft.id,
      kind: draft.kind ?? previous?.kind ?? 'note',
      folder,
      title: draft.title ?? previous?.title,
      source: hasDraftField('source') ? draft.source : previous?.source,
      nextRecallAt: hasDraftField('nextRecallAt') ? draft.nextRecallAt : previous?.nextRecallAt,
      recallPrompt: hasDraftField('recallPrompt') ? draft.recallPrompt : previous?.recallPrompt,
      recallStatus: hasDraftField('recallStatus') ? draft.recallStatus : previous?.recallStatus,
      lastRecalledAt: hasDraftField('lastRecalledAt') ? draft.lastRecalledAt : previous?.lastRecalledAt,
      reviewStrengthDays: hasDraftField('reviewStrengthDays') ? draft.reviewStrengthDays : previous?.reviewStrengthDays,
      toldCount: hasDraftField('toldCount') ? draft.toldCount : previous?.toldCount,
      lastToldAt: hasDraftField('lastToldAt') ? draft.lastToldAt : previous?.lastToldAt,
      frontmatter: hasDraftField('frontmatter') ? draft.frontmatter : previous?.frontmatter,
    }, previous?.path || '');

    candidate.createdAt = previous?.createdAt || candidate.createdAt;
    candidate.path = uniquePath({ ...candidate, path: previous?.path || candidate.path }, notes);
    candidate.updatedAt = new Date().toISOString();

    const serialized = serializeNote(candidate);
    await fileStore.replace(previous?.path, candidate.path, serialized);

    if (previous?.path && previous.path !== candidate.path) fileContents.delete(previous.path);
    fileContents.set(candidate.path, serialized);
    notes = [candidate, ...notes.filter((note) => note.id !== candidate.id)];
    notify({ type: 'saved', note: candidate });
    return candidate;
  };

  const removeNote = async (id: string): Promise<void> => {
    const previous = notes.find((note) => note.id === id);
    if (!previous) throw new Error('This memory could not be found');
    if (previous.schemaVersion !== undefined && previous.schemaVersion > SCHEMA_VERSION) {
      throw new Error('This memory uses a newer schema version and cannot be modified by this app');
    }
    if (!fileStore.delete) throw new Error('This vault does not support deletion');

    const currentFile = (await fileStore.list()).find((file) => file.path === previous.path);
    const expectedContent = fileContents.get(previous.path);
    if (!currentFile) throw new Error('This memory could not be found');
    if (expectedContent !== undefined && currentFile.markdown !== expectedContent) {
      throw new Error('This memory changed outside Stories and was not deleted');
    }

    await fileStore.delete(previous.path);
    notes = notes.filter((note) => note.id !== id);
    fileContents.delete(previous.path);
    notify({ type: 'removed', note: previous });
  };

  return {
    async open() {
      const files = await fileStore.list();
      fileContents = new Map(files.map((file) => [file.path, file.markdown]));
      const parsed = sortNotes(files.filter((file) => file.path.toLowerCase().endsWith('.md')).map(parseNoteFile));
      notes = uniqueRuntimeIds(parsed);
      notify({ type: 'opened' });
      return snapshot();
    },
    list(query) {
      const normalized = query?.search?.trim().toLowerCase();
      return sortNotes(notes).filter((note) => {
        if (query?.folder && note.folder !== query.folder) return false;
        if (!normalized) return true;
        return [note.title, note.body].some((value) => value.toLowerCase().includes(normalized));
      });
    },
    read(id) {
      return notes.find((note) => note.id === id);
    },
    async save(draft) {
      const operation = saveQueue.then(() => saveDraft(draft));
      saveQueue = operation.then(() => undefined, () => undefined);
      return operation;
    },
    async remove(id) {
      const operation = saveQueue.then(() => removeNote(id));
      saveQueue = operation.then(() => undefined, () => undefined);
      return operation;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
