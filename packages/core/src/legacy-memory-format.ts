import type { MemoryKind, MemoryNote, NoteDraft, ParseStatus, VaultFile } from './model.ts';
import { normalizeRecallTimestamp } from './recall.ts';

/**
 * Compatibility codec for memories written by earlier beta builds.
 *
 * The current product treats memory content as plain text. This module exists only
 * so existing app-private files can be read and rewritten safely without exposing
 * legacy formatting concepts to the UI or new product architecture.
 */
const FRONTMATTER_START = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const FRONTMATTER_PREFIX = /^\uFEFF?---(?:\r?\n|$)/;
const KNOWN_FRONTMATTER_FIELDS = new Set([
  'schemaVersion', 'id', 'title', 'kind', 'folder', 'date', 'updatedAt', 'source',
  'nextRecallAt', 'recallPrompt', 'recallStatus', 'lastRecalledAt', 'reviewStrengthDays',
]);

// reviewStrengthDays is additive metadata, not a structural migration. Staying on
// schema v1 keeps memories writable by current builds and readable by earlier beta
// builds if a tester temporarily rolls back the APK.
export const SCHEMA_VERSION = 1;

function hasMalformedFrontmatterStructure(content: string): boolean {
  const seenKeys = new Set<string>();
  let inMultilineValue = false;

  for (const line of content.split('\n')) {
    if (/^\s/.test(line)) {
      if (!inMultilineValue) return true;
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = line.indexOf(':');
    if (separator === -1) return true;

    const key = line.slice(0, separator).trim();
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(key)) return true;
    if (seenKeys.has(key)) return true;
    seenKeys.add(key);

    const value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && !value.endsWith('"')) || (value.startsWith("'") && !value.endsWith("'"))) return true;
    inMultilineValue = /:\s*(?:[|>]\s*[-+]?\s*)?$/.test(line);
  }

  return false;
}

export function classifyNoteFile(file: VaultFile): ParseStatus {
  const match = file.markdown.match(FRONTMATTER_START);
  if (!match) return FRONTMATTER_PREFIX.test(file.markdown) ? 'quarantine' : 'legacy';
  if (hasMalformedFrontmatterStructure(match[1])) return 'quarantine';

  const hasIdentity = match[1].split('\n').some((line) => {
    if (/^\s/.test(line)) return false;
    const separator = line.indexOf(':');
    if (separator === -1) return false;
    if (line.slice(0, separator).trim() !== 'id') return false;
    const rawValue = line.slice(separator + 1).trim();
    if (/^(?:null|~)$/i.test(rawValue)) return false;
    const value = parseValue(rawValue).replace(/^(['"])([\s\S]*)\1$/, '$2').trim();
    return value.length > 0;
  });
  return hasIdentity ? 'healthy' : 'quarantine';
}

export function migrateParsedNote(note: MemoryNote): MemoryNote {
  const now = new Date().toISOString();
  return {
    ...note,
    kind: note.kind === 'experience' || note.kind === 'book-learning' ? note.kind : 'note',
    folder: normalizeFolder(note.folder),
    title: note.title || titleFromBody(note.body),
    createdAt: note.createdAt || now,
    updatedAt: note.updatedAt || note.createdAt || now,
  };
}

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

  return (firstLine || 'Untitled memory').slice(0, 84);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 58) || 'untitled-memory';
}

export function fileNameForNote(note: Pick<MemoryNote, 'title' | 'path'>): string {
  const existingName = note.path.split('/').pop();
  if (existingName?.toLowerCase().endsWith('.md')) return existingName;
  return `${slugify(note.title)}.md`;
}

export function pathForNote(note: Pick<MemoryNote, 'folder' | 'title' | 'path'>): string {
  return `${normalizeFolder(note.folder)}/${fileNameForNote(note)}`;
}

function metadataValue(value: string): string {
  return JSON.stringify(value);
}

export function serializeNote(note: MemoryNote): string {
  const metadata = [
    `schemaVersion: ${SCHEMA_VERSION}`,
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
    ...(Number.isInteger(note.reviewStrengthDays) && (note.reviewStrengthDays || 0) > 0
      ? [`reviewStrengthDays: ${note.reviewStrengthDays}`]
      : []),
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
  const kind: MemoryKind = fields.kind === 'experience' || fields.kind === 'book-learning' ? fields.kind : 'note';
  const schemaVersionValue = Number(fields.schemaVersion);
  const reviewStrengthValue = Number(fields.reviewStrengthDays);
  const parseStatus = classifyNoteFile(file);

  return migrateParsedNote({
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
    reviewStrengthDays: Number.isInteger(reviewStrengthValue) && reviewStrengthValue > 0 ? reviewStrengthValue : undefined,
    frontmatter: extraFrontmatter.length ? extraFrontmatter : undefined,
    schemaVersion: Number.isFinite(schemaVersionValue) && fields.schemaVersion !== undefined ? schemaVersionValue : undefined,
    parseStatus,
    ...(parseStatus === 'quarantine' ? { rawContent: file.markdown } : {}),
  });
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
    reviewStrengthDays: draft.reviewStrengthDays,
    frontmatter: draft.frontmatter,
  };
}
