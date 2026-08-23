'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { mockMemories } from '@/data/memories-mock';
import { Memory, MemoryKind } from '@/types';
import { memoryFilePath } from '@/lib/memory-paths';
import { mergeHydratedMemories, parseStorageRecord, StorageReadResult } from '@/lib/memory-store-logic';
import { replaceRenamedWikilinks } from '@/lib/memory-links';

export { memoryFileName, memoryFilePath } from '@/lib/memory-paths';

export const DEFAULT_FOLDERS = ['Inbox', 'Books', 'Experiences', 'Life', 'Work', 'Travel', 'People', 'Decisions'];
export const NOTE_KINDS: Array<{ value: MemoryKind; label: string }> = [
  { value: 'note', label: 'Note' },
  { value: 'experience', label: 'Experience' },
  { value: 'book-learning', label: 'Book learning' },
];
const MEMORY_STORAGE_KEY = 'stories:markdown-vault:v3';
const LEGACY_MEMORY_STORAGE_KEY = 'stories:markdown-files:v2';
const FOLDER_STORAGE_KEY = 'stories:folders:v3';
const LEGACY_FOLDER_STORAGE_KEY = 'stories:folders:v2';
const CORRUPT_MEMORY_BACKUP_PREFIX = 'stories:corrupt-vault:';

type NewMemoryInput = {
  title?: string;
  body: string;
  folderPath?: string;
  kind?: MemoryKind;
};

type MemoryStoreValue = {
  memories: Memory[];
  folders: string[];
  hydrated: boolean;
  addMemory: (input: NewMemoryInput) => Memory;
  updateMemory: (id: string, patch: Partial<Memory>) => void;
  addFolder: (name: string) => string | null;
};

const MemoryStoreContext = createContext<MemoryStoreValue | null>(null);

function normalizeMemory(memory: Memory): Memory {
  return {
    ...memory,
    kind: memory.kind || kindForMemoryType(memory.type),
    folderPath: memory.folderPath || folderForMemoryType(memory.type),
  };
}

function kindForMemoryType(type: Memory['type']): MemoryKind {
  if (type === 'book') return 'book-learning';
  if (['life', 'trip', 'person', 'place'].includes(type)) return 'experience';
  return 'note';
}

export function memoryKindLabel(kind: MemoryKind | undefined): string {
  return NOTE_KINDS.find((item) => item.value === kind)?.label || 'Note';
}

export function memoryKindHint(kind: MemoryKind | undefined): string {
  if (kind === 'book-learning') return 'Capture the source, idea, and how you will use it.';
  if (kind === 'experience') return 'Capture what happened, the context, and what to remember.';
  return 'Capture the thought in your own Markdown.';
}

function folderForMemoryType(type: Memory['type']): string {
  switch (type) {
    case 'trip':
      return 'Travel';
    case 'person':
      return 'People';
    case 'book':
      return 'Books';
    case 'work':
      return 'Work';
    case 'decision':
      return 'Decisions';
    case 'life':
      return 'Life';
    default:
      return 'Inbox';
  }
}

type VaultFile = {
  id: string;
  path: string;
  markdown: string;
};

function metadataValue(value: unknown): string {
  return JSON.stringify(value);
}

export function memoryToMarkdown(memory: Memory): string {
  const frontmatter = [
    `id: ${metadataValue(memory.id)}`,
    `title: ${metadataValue(memory.title)}`,
    `kind: ${metadataValue(memory.kind || kindForMemoryType(memory.type))}`,
    `type: ${metadataValue(memory.type)}`,
    `folder: ${metadataValue(folderForMemory(memory))}`,
    `date: ${metadataValue(memory.date)}`,
    `timeAgo: ${metadataValue(memory.timeAgo)}`,
    ...(memory.source ? [`source: ${metadataValue(memory.source)}`] : []),
    ...(memory.people?.length ? [`people: ${metadataValue(memory.people)}`] : []),
    ...(memory.place ? [`place: ${metadataValue(memory.place)}`] : []),
    ...(memory.rememberWhen ? [`rememberWhen: ${metadataValue(memory.rememberWhen)}`] : []),
    ...(memory.recallPrompt ? [`recallPrompt: ${metadataValue(memory.recallPrompt)}`] : []),
    ...(memory.recallStatus ? [`recallStatus: ${metadataValue(memory.recallStatus)}`] : []),
    ...(memory.lastRecalledAt ? [`lastRecalledAt: ${metadataValue(memory.lastRecalledAt)}`] : []),
    ...(memory.nextRecallAt ? [`nextRecallAt: ${metadataValue(memory.nextRecallAt)}`] : []),
  ];

  return `---\n${frontmatter.join('\n')}\n---\n${memory.originalCapture}`;
}

function parseMetadata(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function memoryFromVaultFile(file: VaultFile): Memory {
  const match = file.markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const fields: Record<string, unknown> = {};
  const body = match?.[2] ?? file.markdown;

  match?.[1].split('\n').forEach((line) => {
    const separator = line.indexOf(':');
    if (separator === -1) return;
    fields[line.slice(0, separator).trim()] = parseMetadata(line.slice(separator + 1).trim());
  });

  const rawType = typeof fields.type === 'string' ? fields.type : 'life';
  const rawKind = fields.kind === 'note' || fields.kind === 'experience' || fields.kind === 'book-learning'
    ? fields.kind
    : undefined;

  return normalizeMemory({
    id: typeof fields.id === 'string' ? fields.id : file.id,
    title: typeof fields.title === 'string' ? fields.title : 'Untitled note',
    summary: body.slice(0, 180),
    originalCapture: body,
    type: rawType as Memory['type'],
    kind: rawKind,
    folderPath: typeof fields.folder === 'string' ? fields.folder : file.path.split('/')[0],
    date: typeof fields.date === 'string' ? fields.date : new Date().toISOString(),
    timeAgo: typeof fields.timeAgo === 'string' ? fields.timeAgo : 'Saved locally',
    source: typeof fields.source === 'string' ? fields.source : undefined,
    people: Array.isArray(fields.people) ? fields.people.filter((item): item is string => typeof item === 'string') : undefined,
    place: typeof fields.place === 'string' ? fields.place : undefined,
    rememberWhen: typeof fields.rememberWhen === 'string' ? fields.rememberWhen : undefined,
    recallPrompt: typeof fields.recallPrompt === 'string' ? fields.recallPrompt : undefined,
    recallStatus: fields.recallStatus === 'remembered' || fields.recallStatus === 'partial' || fields.recallStatus === 'forgot'
      ? fields.recallStatus
      : undefined,
    lastRecalledAt: typeof fields.lastRecalledAt === 'string' ? fields.lastRecalledAt : undefined,
    nextRecallAt: typeof fields.nextRecallAt === 'string' ? fields.nextRecallAt : undefined,
  });
}

function dedupeMemories(memories: Memory[]): Memory[] {
  return Array.from(new Map(memories.map((memory) => [memory.id, normalizeMemory(memory)])).values());
}

type StoredVault = { files: VaultFile[] };

function isStoredVault(value: unknown): value is StoredVault {
  if (!value || typeof value !== 'object' || !Array.isArray((value as StoredVault).files)) return false;
  return (value as StoredVault).files.every((file) => (
    file && typeof file.id === 'string' && typeof file.path === 'string' && typeof file.markdown === 'string'
  ));
}

function readStoredMemories(): StorageReadResult<Memory[]> {
  if (typeof window === 'undefined') return { status: 'missing' };

  const stored = parseStorageRecord(window.localStorage.getItem(MEMORY_STORAGE_KEY), isStoredVault);
  if (stored.status === 'valid') return { status: 'valid', value: dedupeMemories(stored.value.files.map(memoryFromVaultFile)) };
  if (stored.status === 'corrupt') return stored;

  const legacy = parseStorageRecord(window.localStorage.getItem(LEGACY_MEMORY_STORAGE_KEY), (value): value is Memory[] => (
    Array.isArray(value)
  ));
  if (legacy.status === 'valid') return { status: 'valid', value: dedupeMemories(legacy.value) };
  return legacy;
}

function readStoredFolders(): string[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(FOLDER_STORAGE_KEY) || window.localStorage.getItem(LEGACY_FOLDER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((folder) => typeof folder === 'string') ? parsed : null;
  } catch {
    return null;
  }
}

function persistMemories(memories: Memory[]) {
  if (typeof window === 'undefined') return;
  const files: VaultFile[] = memories.map((memory) => ({
    id: memory.id,
    path: memoryFilePath(memory),
    markdown: memoryToMarkdown(memory),
  }));
  window.localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify({ version: 3, files }));
}

function persistFolders(folders: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(folders));
}

export function folderForMemory(memory: Memory): string {
  return memory.folderPath || folderForMemoryType(memory.type);
}

function createMemoryId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `local-${crypto.randomUUID()}`;
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function MemoryProvider({ children }: { children: React.ReactNode }) {
  const [memories, setMemories] = useState<Memory[]>(() => mockMemories.map(normalizeMemory));
  const [folders, setFolders] = useState<string[]>(DEFAULT_FOLDERS);
  const [hydrated, setHydrated] = useState(false);
  const pendingMemoriesRef = useRef<Memory[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedMemories = readStoredMemories();
      const storedFolders = readStoredFolders();

      const pendingMemories = pendingMemoriesRef.current;
      pendingMemoriesRef.current = [];

      if (storedMemories.status === 'valid') {
        setMemories(mergeHydratedMemories(storedMemories.value, pendingMemories));
      } else if (storedMemories.status === 'missing') {
        setMemories([...pendingMemories, ...mockMemories.map(normalizeMemory)]);
      } else {
        try {
          window.localStorage.setItem(`${CORRUPT_MEMORY_BACKUP_PREFIX}${Date.now()}`, storedMemories.raw);
        } catch {
          // Keep the app usable even when storage is read-only or full.
        }
        setMemories(pendingMemories);
      }

      if (storedFolders) {
        setFolders(Array.from(new Set([...DEFAULT_FOLDERS, ...storedFolders])));
      } else {
        persistFolders(DEFAULT_FOLDERS);
      }

      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) persistMemories(memories);
  }, [hydrated, memories]);

  useEffect(() => {
    if (hydrated) persistFolders(folders);
  }, [folders, hydrated]);

  useEffect(() => {
    const handleMemoryChange = () => {
      const nextMemories = readStoredMemories();
      if (nextMemories.status === 'valid') setMemories(nextMemories.value);
    };

    window.addEventListener('storage', handleMemoryChange);
    return () => {
      window.removeEventListener('storage', handleMemoryChange);
    };
  }, []);

  const addMemory = useCallback((input: NewMemoryInput) => {
    const body = input.body.trim();
    const firstLine = body.split('\n').find((line) => line.trim())?.replace(/^\s*[-*#]+\s*/, '').trim() || 'Untitled note';
    const title = (input.title?.trim() || firstLine).slice(0, 84);
    const now = new Date();
    const newMemory: Memory = normalizeMemory({
      id: createMemoryId(),
      title,
      summary: body.slice(0, 180),
      originalCapture: body,
      type: 'life',
      kind: input.kind || 'note',
      folderPath: input.folderPath || 'Inbox',
      date: now.toISOString(),
      timeAgo: 'Just now',
    });

    if (!hydrated) pendingMemoriesRef.current = [newMemory, ...pendingMemoriesRef.current];

    setMemories((current) => {
      return [newMemory, ...current];
    });

    return newMemory;
  }, [hydrated]);

  const updateMemory = useCallback((id: string, patch: Partial<Memory>) => {
    setMemories((current) => {
      const previous = current.find((memory) => memory.id === id);
      if (!previous) return current;
      const next = normalizeMemory({ ...previous, ...patch });

      return current.map((memory) => {
        const updatedBody = replaceRenamedWikilinks(memory.originalCapture, previous, next, current);
        const updated = memory.id === id ? next : memory;
        if (updatedBody === memory.originalCapture) return updated;
        return { ...updated, originalCapture: updatedBody, summary: updatedBody.slice(0, 180) };
      });
    });
  }, []);

  const addFolder = useCallback((name: string) => {
    const folder = name.trim().replace(/\s+/g, ' ');
    if (!folder) return null;

    setFolders((current) => {
      const existing = current.find((item) => item.toLowerCase() === folder.toLowerCase());
      if (existing) return current;
      return [...current, folder];
    });
    return folder;
  }, []);

  const value = useMemo(
    () => ({ memories, folders, hydrated, addMemory, updateMemory, addFolder }),
    [addFolder, addMemory, folders, hydrated, memories, updateMemory],
  );

  return <MemoryStoreContext.Provider value={value}>{children}</MemoryStoreContext.Provider>;
}

export function useMemoryStore() {
  const value = useContext(MemoryStoreContext);
  if (!value) throw new Error('useMemoryStore must be used inside MemoryProvider');
  return value;
}
