import type { MemoryKind, MemoryNote, NoteDraft, VaultFile } from './model.ts';
import { normalizeRecallTimestamp } from './recall.ts';

const FRONTMATTER_START = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const KNOWN_FRONTMATTER_FIELDS = new Set(['id', 'title', 'kind', 'folder', 'date', 'updatedAt', 'source', 'nextRecallAt', 'recallPrompt', 'recallStatus', 'lastRecalledAt']);

export function normalizeFolder(value: string | undefined): string {
  return (value || 'Inbox')
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .map((part) => part.trim().normalize('NFC').replace(/[^\p{L}\p{N} _-]/gu, ''))
    .filter(Boolean)
    .join('/') || 'Inbox';
}

export function titleFromBody(body: string): string {
  const firstLine = body
    .split('\n')
    .find((line) => line.trim())
    ?.replace(/^\s*(?:[-*+] |#{1,6}\s*|\d+[.)]\s*)/, '')
    .trim();

  return (firstLine || 'Untitled note').slice(0, 84);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 58) || 'untitled-note';
}

export function fileNameForNote(note: Pick<MemoryNote, 'title' | 'path'>): string {
  const existingName = note.path.split('/').pop();
  if (existingName?.toLowerCase().endsWith('.md')) return existingName;
  return `${slugify(note.title)}.md`;
}

export function pathForNote(note: Pick<MemoryNote, 'folder' | 'title' | 'path'>): string {
  const fileName = fileNameForNote(note);
  return `${normalizeFolder(note.folder)}/${fileName}`;
}

function metadataValue(value: string): string {
  return JSON.stringify(value);
}

export function serializeNote(note: MemoryNote): string {
  const metadata = [
    `id: ${metadataValue(note.id)}`,
    `title: ${metadataValue(note.title)}`,
    `kind: ${metadataValue(note.kind)}`,
    `folder: ${metadataValue(note.folder)}`,
    `date: ${metadataValue(note.createdAt)}`,
    `updatedAt: ${metadataValue(note.updatedAt)}`,
    ...(note.source ? [`source: ${metadataValue(note.source)}`] : []),
    ...(note.nextRecallAt ? [`nextRecallAt: ${metadataValue(note.nextRecallAt)}`] : []),
    ...(note.recallPrompt ? [`recallPrompt: ${metadataValue(note.recallPrompt)}`] : []),
    ...(note.recallStatus ? [`recallStatus: ${metadataValue(note.recallStatus)}`] : []),
    ...(note.lastRecalledAt ? [`lastRecalledAt: ${metadataValue(note.lastRecalledAt)}`] : []),
    ...(note.frontmatter || []),
  ];

  return `---\n${metadata.join('\n')}\n---\n${note.body}`;
}

function parseValue(value: string): string {
  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === 'string' ? parsed : value;
  } catch {
    return value;
  }
}

export function parseNoteFile(file: VaultFile): MemoryNote {
  const match = file.markdown.match(FRONTMATTER_START);
  const fields: Record<string, string> = {};
  const extraFrontmatter: string[] = [];
  let collectingExtra = false;

  match?.[1].split('\n').forEach((line) => {
    if (/^\s/.test(line)) {
      collectingExtra = true;
      extraFrontmatter.push(line);
      return;
    }
    const separator = line.indexOf(':');
    if (separator === -1) {
      if (collectingExtra) extraFrontmatter.push(line);
      return;
    }
    const key = line.slice(0, separator).trim();
    if (!KNOWN_FRONTMATTER_FIELDS.has(key)) {
      collectingExtra = true;
      extraFrontmatter.push(line);
      return;
    }
    collectingExtra = false;
    fields[key] = parseValue(line.slice(separator + 1).trim());
  });

  const body = match?.[2] ?? file.markdown;
  const folder = normalizeFolder(fields.folder || file.path.split('/').slice(0, -1).join('/') || 'Inbox');
  const title = fields.title || titleFromBody(body);
  const createdAt = fields.date || new Date().toISOString();
  const updatedAt = fields.updatedAt || createdAt;
  const kind: MemoryKind = fields.kind === 'experience' || fields.kind === 'book-learning'
    ? fields.kind
    : 'note';

  return {
    id: fields.id || `legacy-${slugify(file.path)}`,
    title,
    body,
    kind,
    folder,
    path: file.path,
    createdAt,
    updatedAt,
    source: fields.source,
    nextRecallAt: normalizeRecallTimestamp(fields.nextRecallAt),
    recallPrompt: fields.recallPrompt,
    recallStatus: fields.recallStatus === 'remembered' || fields.recallStatus === 'partial' || fields.recallStatus === 'forgot'
      ? fields.recallStatus
      : undefined,
    lastRecalledAt: fields.lastRecalledAt,
    frontmatter: extraFrontmatter.length ? extraFrontmatter : undefined,
  };
}

export function createNote(draft: NoteDraft, path: string): MemoryNote {
  const now = new Date().toISOString();
  const body = draft.body;
  const title = (draft.title?.trim() || titleFromBody(body)).slice(0, 84);

  return {
    id: draft.id || `memory-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title,
    body,
    kind: draft.kind || 'note',
    folder: normalizeFolder(draft.folder),
    path,
    createdAt: now,
    updatedAt: now,
    source: draft.source,
    nextRecallAt: draft.nextRecallAt,
    recallPrompt: draft.recallPrompt,
    recallStatus: draft.recallStatus,
    lastRecalledAt: draft.lastRecalledAt,
    frontmatter: draft.frontmatter,
  };
}
