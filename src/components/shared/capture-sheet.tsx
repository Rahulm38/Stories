'use client';

import React, { useCallback, useState } from 'react';
import { Check, X } from 'lucide-react';
import { DEFAULT_FOLDERS, memoryFilePath, NOTE_KINDS, useMemoryStore } from './memory-store';

interface CaptureSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrompt?: string;
}

export function CaptureSheet({ open, onOpenChange, initialPrompt }: CaptureSheetProps) {
  const [text, setText] = useState('');
  const [folderPath, setFolderPath] = useState('Inbox');
  const [kind, setKind] = useState<'note' | 'experience' | 'book-learning'>('note');
  const [saved, setSaved] = useState(false);
  const [savedPath, setSavedPath] = useState('');
  const charLimit = 300;
  const { addMemory, folders } = useMemoryStore();

  const close = useCallback(() => {
    setText('');
    setFolderPath('Inbox');
    setKind('note');
    setSaved(false);
    setSavedPath('');
    onOpenChange(false);
  }, [onOpenChange]);
  const save = useCallback(() => {
    if (!text.trim()) return;
    const memory = addMemory({ body: text, folderPath, kind });
    setSavedPath(memoryFilePath(memory));
    setSaved(true);
  }, [addMemory, folderPath, kind, text]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="presentation">
      <button
        type="button"
        className="sheet-backdrop absolute inset-0"
        onClick={close}
        aria-label="Close note capture"
      />
      <section
        className="sheet-panel relative w-full max-w-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="capture-title"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">New note</p>
            <h2 id="capture-title" className="mt-1 text-xl font-semibold text-foreground">
              Write in Markdown.
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="icon-button"
            aria-label="Close note capture"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {saved ? (
          <div className="mt-8 rounded-2xl border border-mint/30 bg-mint/10 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint/20 text-mint">
                <Check className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-foreground">Saved as Markdown</p>
                <p className="mt-0.5 break-all text-sm text-muted-foreground">{savedPath}</p>
              </div>
            </div>
            <button type="button" onClick={close} className="button-primary mt-5 w-full">
              Done
            </button>
          </div>
        ) : (
          <>
            <textarea
              value={text}
              maxLength={charLimit}
              onChange={(event) => setText(event.target.value)}
              placeholder={initialPrompt || 'One thought is enough.'}
              className="text-capture mt-6 min-h-36"
              autoFocus
            />
            <label className="folder-picker mt-3" htmlFor="capture-folder">
              <span>Folder</span>
              <select
                id="capture-folder"
                value={folderPath}
                onChange={(event) => setFolderPath(event.target.value)}
                className="folder-select"
              >
                {Array.from(new Set([...DEFAULT_FOLDERS, ...folders])).map((folder) => (
                  <option key={folder} value={folder}>{folder}</option>
                ))}
              </select>
            </label>
            <label className="folder-picker mt-3" htmlFor="capture-kind">
              <span>Remember as</span>
              <select id="capture-kind" value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} className="folder-select">
                {NOTE_KINDS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-xs text-text-dim">
                {text.length}/{charLimit}
              </span>
              <button type="button" onClick={save} disabled={!text.trim()} className="button-primary">
                Save note
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
