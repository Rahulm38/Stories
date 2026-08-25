'use client';

import React, { FormEvent, useMemo, useRef, useState } from 'react';
import { Heading, Bold, Italic, Quote, List, CheckSquare, Code, Link as LinkIcon } from 'lucide-react';
import { Memory, MemoryKind } from '@/types';
import { DEFAULT_FOLDERS, memoryFilePath, memoryKindHint, NOTE_KINDS } from './memory-store';
import { activeWikilinkAtCursor, insertWikilink, wikilinkSuggestions } from '@/lib/memory-links';

export interface MarkdownEditorValue {
  title: string;
  body: string;
  folderPath: string;
  kind: MemoryKind;
}

interface MarkdownEditorProps {
  initialTitle: string;
  initialBody: string;
  initialFolder: string;
  initialKind: MemoryKind;
  folders: string[];
  memories: Memory[];
  currentMemoryId?: string;
  submitLabel?: string;
  onSave: (value: MarkdownEditorValue) => void;
  onCancel?: () => void;
}

export function MarkdownEditor({
  initialTitle,
  initialBody,
  initialFolder,
  initialKind,
  folders,
  memories,
  currentMemoryId,
  submitLabel = 'Save file',
  onSave,
  onCancel,
}: MarkdownEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [folderPath, setFolderPath] = useState(initialFolder || 'Inbox');
  const [kind, setKind] = useState<MemoryKind>(initialKind || 'note');
  const [cursorPosition, setCursorPosition] = useState(initialBody.length);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const allFolders = Array.from(new Set([...DEFAULT_FOLDERS, ...folders, folderPath]));
  const activeWikilink = useMemo(() => activeWikilinkAtCursor(body, cursorPosition), [body, cursorPosition]);
  const suggestions = useMemo(
    () => activeWikilink ? wikilinkSuggestions(activeWikilink.query, memories, currentMemoryId) : [],
    [activeWikilink, currentMemoryId, memories],
  );
  const hasTitle = Boolean(title.trim());
  const hasBody = Boolean(body.trim());
  const canSubmit = hasTitle && hasBody;
  const validationMessage = !hasTitle && !hasBody
    ? 'Add a title and some text before saving.'
    : !hasTitle
      ? 'Add a title before saving.'
      : !hasBody
        ? 'Write something before saving.'
        : '';

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSave({
      title: title.trim(),
      body: body.trim(),
      folderPath,
      kind,
    });
  };

  const updateCursor = () => setCursorPosition(bodyRef.current?.selectionStart ?? body.length);

  const chooseSuggestion = (memory: Memory) => {
    if (!activeWikilink) return;
    const next = insertWikilink(body, activeWikilink, memory, memories);
    setBody(next.value);
    setCursorPosition(next.cursor);
    window.requestAnimationFrame(() => {
      bodyRef.current?.focus();
      bodyRef.current?.setSelectionRange(next.cursor, next.cursor);
    });
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = body.substring(start, end);
    const newText = body.substring(0, start) + prefix + selectedText + suffix + body.substring(end);
    setBody(newText);
    const newCursor = start + prefix.length + selectedText.length;
    setCursorPosition(newCursor);
    window.requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newCursor, newCursor);
    });
  };

  return (
    <form className="markdown-editor" onSubmit={submit}>
      <div className="markdown-editor-toolbar">
        <span className="markdown-editor-label">Markdown file</span>
        <div className="markdown-editor-selects">
          <label className="sr-only" htmlFor="editor-kind">Memory kind</label>
          <select id="editor-kind" value={kind} onChange={(event) => setKind(event.target.value as MemoryKind)} className="editor-select">
            {NOTE_KINDS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <label className="sr-only" htmlFor="editor-folder">Folder</label>
          <select id="editor-folder" value={folderPath} onChange={(event) => setFolderPath(event.target.value)} className="editor-select">
            {allFolders.map((folder) => <option key={folder} value={folder}>{folder}</option>)}
          </select>
        </div>
      </div>

      <label className="sr-only" htmlFor="editor-title">File title</label>
      <input
        id="editor-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="markdown-editor-title"
        placeholder="Untitled note"
        autoFocus={!currentMemoryId}
      />
      <div className="flex flex-wrap gap-1 mb-2 px-1">
        <button type="button" className="p-1.5 text-muted-foreground hover:bg-muted rounded" onClick={() => insertFormatting('## ', '')} aria-label="Heading"><Heading className="h-4 w-4" /></button>
        <button type="button" className="p-1.5 text-muted-foreground hover:bg-muted rounded" onClick={() => insertFormatting('**', '**')} aria-label="Bold"><Bold className="h-4 w-4" /></button>
        <button type="button" className="p-1.5 text-muted-foreground hover:bg-muted rounded" onClick={() => insertFormatting('*', '*')} aria-label="Italic"><Italic className="h-4 w-4" /></button>
        <button type="button" className="p-1.5 text-muted-foreground hover:bg-muted rounded" onClick={() => insertFormatting('> ', '')} aria-label="Quote"><Quote className="h-4 w-4" /></button>
        <button type="button" className="p-1.5 text-muted-foreground hover:bg-muted rounded" onClick={() => insertFormatting('- ', '')} aria-label="Bullet List"><List className="h-4 w-4" /></button>
        <button type="button" className="p-1.5 text-muted-foreground hover:bg-muted rounded" onClick={() => insertFormatting('- [ ] ', '')} aria-label="Checklist"><CheckSquare className="h-4 w-4" /></button>
        <button type="button" className="p-1.5 text-muted-foreground hover:bg-muted rounded" onClick={() => insertFormatting('`', '`')} aria-label="Code"><Code className="h-4 w-4" /></button>
        <button type="button" className="p-1.5 text-muted-foreground hover:bg-muted rounded" onClick={() => insertFormatting('[[', ']]')} aria-label="Wikilink"><LinkIcon className="h-4 w-4" /></button>
      </div>
      <label className="sr-only" htmlFor="editor-body">Markdown body</label>
      <textarea
        id="editor-body"
        ref={bodyRef}
        value={body}
        onChange={(event) => {
          const nextBody = event.currentTarget.value;
          setBody(nextBody);
          setCursorPosition(event.currentTarget.selectionStart);
          window.requestAnimationFrame(() => {
            setCursorPosition(bodyRef.current?.selectionStart ?? nextBody.length);
          });
        }}
        onClick={updateCursor}
        onKeyUp={updateCursor}
        className="markdown-editor-body"
        placeholder="Write in Markdown…"
      />
      {activeWikilink && (
        <div className="wikilink-suggestions" role="listbox" aria-label="Link note">
          <div className="wikilink-suggestions-heading">
            <span>Link a note</span>
            <small>{suggestions.length ? `${suggestions.length} shown` : 'No matching notes'}</small>
          </div>
          {suggestions.map((memory) => (
            <button
              type="button"
              role="option"
              aria-selected="false"
              key={memory.id}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => chooseSuggestion(memory)}
            >
              <span>{memory.title}</span>
              <small>{memoryFilePath(memory)}</small>
            </button>
          ))}
        </div>
      )}
      <p id="editor-hint" className="markdown-editor-hint" aria-live="polite">
        {validationMessage && <span className="markdown-editor-validation">{validationMessage} </span>}
        Link files with <code>[[filename.md]]</code>. {memoryKindHint(kind)}
      </p>
      <div className="markdown-editor-actions">
        {onCancel && <button type="button" className="button-secondary" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="button-primary" disabled={!canSubmit} aria-describedby="editor-hint">{submitLabel}</button>
      </div>
    </form>
  );
}
