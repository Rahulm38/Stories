import { fileNameForNote, normalizeFolder, pathForNote } from './legacy-memory-format.ts';
import type { LinkCandidate, LinkResolution, MemoryNote, NoteDraft } from './model.ts';

function normalizeTarget(value: string): string {
  const unwrapped = value.trim().replace(/^\[\[|\]\]$/g, '');
  return unwrapped.split('|', 1)[0].trim().replace(/\.md$/i, '').replace(/\\/g, '/').toLowerCase();
}

export type LinkTargetClassification =
  | { kind: 'wikilink-local' }
  | { kind: 'external'; scheme: string; allowed: boolean }
  | { kind: 'relative' }
  | { kind: 'blocked'; reason: 'control-character' };

const ALLOWED_EXTERNAL_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:', 'sms:']);
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/;

export function classifyLinkTarget(target: string): LinkTargetClassification {
  const value = target.trim();
  if (CONTROL_CHARACTER_PATTERN.test(value)) return { kind: 'blocked', reason: 'control-character' };
  if (/^\[\[[\s\S]*\]\]$/.test(value)) return { kind: 'wikilink-local' };

  const schemeMatch = value.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (!schemeMatch) return { kind: 'relative' };

  const scheme = `${schemeMatch[1].toLowerCase()}:`;
  if (!ALLOWED_EXTERNAL_SCHEMES.has(scheme)) return { kind: 'external', scheme, allowed: false };

  const payload = value.slice(scheme.length);
  const hasWhitespace = /\s/.test(payload);
  const validHttpUrl = (scheme === 'http:' || scheme === 'https:')
    && !hasWhitespace
    && new RegExp(`^${scheme.slice(0, -1)}://[^/\\s]+(?:[/?#].*)?$`, 'i').test(value);
  const validNonHttpUrl = (scheme === 'mailto:' || scheme === 'tel:' || scheme === 'sms:')
    && payload.length > 0
    && !hasWhitespace;

  return { kind: 'external', scheme, allowed: validHttpUrl || validNonHttpUrl };
}

function candidatesFor(note: MemoryNote): string[] {
  return [note.path, fileNameForNote(note), note.title].map(normalizeTarget);
}

export type ActiveWikilink = {
  start: number;
  end: number;
  query: string;
};

export function activeWikilinkAtCursor(value: string, cursor: number): ActiveWikilink | null {
  const beforeCursor = value.slice(0, cursor);
  const start = beforeCursor.lastIndexOf('[[');
  if (start === -1) return null;

  const query = beforeCursor.slice(start + 2);
  if (query.includes(']]') || query.includes('\n') || query.includes('[') || query.includes(']')) return null;
  const afterCursor = value.slice(cursor);
  const closingOffset = afterCursor.indexOf(']]');
  const newlineOffset = afterCursor.indexOf('\n');
  const end = closingOffset !== -1 && (newlineOffset === -1 || closingOffset < newlineOffset)
    ? cursor + closingOffset + 2
    : cursor;
  return { start, end, query };
}

export function resolveLink(target: string, notes: MemoryNote[], fromId?: string): LinkResolution {
  const normalized = normalizeTarget(target);
  if (!normalized) return { target, status: 'missing' };

  const from = notes.find((note) => note.id === fromId);
  const fromFolder = from?.folder.toLowerCase();
  const exactMatches = notes.filter((note) => candidatesFor(note).some((candidate) => (
    candidate === normalized || (!normalized.includes('/') && candidate.endsWith(`/${normalized}`))
  )));

  if (normalized.includes('/')) {
    if (exactMatches.length === 1) return { target, note: exactMatches[0], status: 'resolved' };
    return { target, status: exactMatches.length > 1 ? 'ambiguous' : 'missing' };
  }

  const sameFolderMatches = fromFolder
    ? exactMatches.filter((note) => note.folder.toLowerCase() === fromFolder)
    : [];
  if (sameFolderMatches.length === 1) return { target, note: sameFolderMatches[0], status: 'resolved' };
  if (sameFolderMatches.length > 1) return { target, status: 'ambiguous' };
  if (exactMatches.length === 1) return { target, note: exactMatches[0], status: 'resolved' };
  return { target, status: exactMatches.length > 1 ? 'ambiguous' : 'missing' };
}

export function resolveLinkTarget(target: string, notes: MemoryNote[], fromId?: string): MemoryNote | undefined {
  return resolveLink(target, notes, fromId).note;
}

export function suggestLinkTargets(query: string, notes: MemoryNote[], fromId?: string): LinkCandidate[] {
  const normalized = query.trim().toLowerCase();
  const score = (note: MemoryNote) => {
    if (!normalized) return 0;
    const values = [note.title, note.path, fileNameForNote(note)].map((value) => value.toLowerCase());
    if (values.some((value) => value.startsWith(normalized))) return 0;
    if (values.some((value) => value.split(/[^a-z0-9]+/).some((word) => word.startsWith(normalized)))) return 1;
    return 2;
  };

  return notes
    .filter((note) => note.id !== fromId)
    .filter((note) => !normalized || [note.title, note.path, fileNameForNote(note)].some((value) => value.toLowerCase().includes(normalized)))
    .sort((a, b) => score(a) - score(b) || a.title.localeCompare(b.title) || a.path.localeCompare(b.path))
    .slice(0, 6);
}

export function insertWikilink(value: string, active: ActiveWikilink, note: MemoryNote, notes: MemoryNote[]): { value: string; cursor: number } {
  const sameName = notes.filter((candidate) => fileNameForNote(candidate).toLowerCase() === fileNameForNote(note).toLowerCase());
  const target = sameName.length > 1 ? pathForNote(note) : fileNameForNote(note);
  const link = `[[${target}]]`;
  return {
    value: `${value.slice(0, active.start)}${link}${value.slice(active.end)}`,
    cursor: active.start + link.length,
  };
}

export function draftForMissingLink(target: string, fromFolder = 'Inbox'): NoteDraft {
  const normalized = target.trim().replace(/^\[\[|\]\]$/g, '').replace(/\\/g, '/');
  const targetWithoutAlias = normalized.split('|', 1)[0].trim();
  const parts = targetWithoutAlias.split('/').map((part) => part.trim()).filter(Boolean);
  const fileName = parts.pop()?.replace(/\.md$/i, '').trim() || 'Untitled memory';
  const folder = parts.length ? normalizeFolder(parts.join('/')) : normalizeFolder(fromFolder);
  return { title: fileName, body: '', folder, kind: 'note' };
}

export function rewriteMovedLink(content: string, previousPath: string, nextPath: string, rewriteBasename = true): string {
  const previous = normalizeTarget(previousPath);
  const previousFileName = normalizeTarget(previousPath.split('/').pop() || previousPath);
  const nextFileName = normalizeTarget(nextPath.split('/').pop() || nextPath);
  const filenameChanged = previousFileName !== nextFileName;
  if (!previous || previous === normalizeTarget(nextPath) || !content.includes('[[')) return content;

  return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (whole, target: string, alias?: string) => {
    const normalizedTarget = normalizeTarget(target);
    const isBasenameReference = !normalizedTarget.includes('/') && normalizedTarget === previousFileName;
    if (normalizedTarget !== previous && !(rewriteBasename && filenameChanged && isBasenameReference)) return whole;
    return `[[${nextPath}${alias ? `|${alias}` : ''}]]`;
  });
}
