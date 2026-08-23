'use client';

import React, { useState } from 'react';
import { ArrowLeft, Edit3, FileText } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { MarkdownContent } from '@/components/shared/markdown-content';
import { MarkdownEditor, MarkdownEditorValue } from '@/components/shared/markdown-editor';
import { memoryFilePath, memoryKindLabel, useMemoryStore } from '@/components/shared/memory-store';

export default function MemoryDetailPage() {
  const params = useParams<{ id: string }>();
  const { memories, folders, hydrated, updateMemory } = useMemoryStore();
  const memory = memories.find((item) => item.id === params.id);
  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  if (!hydrated) {
    return (
      <AppShell>
        <div className="note-loading" role="status">Opening note…</div>
      </AppShell>
    );
  }

  if (!memory) {
    return (
      <AppShell>
        <div className="empty-state">
          <p className="text-base font-semibold text-foreground">Memory not found</p>
          <Link className="button-secondary mt-4" href="/memories">
            Back to Library
          </Link>
        </div>
      </AppShell>
    );
  }

  const submitEdit = (value: MarkdownEditorValue) => {
    updateMemory(memory.id, {
      title: value.title,
      originalCapture: value.body,
      summary: value.body.slice(0, 180),
      folderPath: value.folderPath,
      kind: value.kind,
      type: value.kind === 'book-learning' ? 'book' : value.kind === 'experience' && memory.type === 'book' ? 'life' : memory.type,
    });
    setIsEditing(false);
    setSavedMessage('Saved to the Markdown vault.');
  };

  return (
    <AppShell hideNav={isEditing}>
      <div className="page-stack">
        <header className="page-header">
          <Link href="/memories" className="note-back-link" aria-label="Back to Library">
            <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />
            <span>Library</span>
          </Link>
          {!isEditing && (
            <button type="button" className="icon-button" onClick={() => setIsEditing(true)} aria-label="Edit memory">
              <Edit3 className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          )}
        </header>

        {isEditing ? (
          <MarkdownEditor
            key={`${memory.id}-${memory.title}`}
            initialTitle={memory.title}
            initialBody={memory.originalCapture}
            initialFolder={memory.folderPath || 'Inbox'}
            initialKind={memory.kind || 'note'}
            folders={folders}
            memories={memories}
            currentMemoryId={memory.id}
            onSave={submitEdit}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <section className="note-header">
              <div className="markdown-path">
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span>{memoryFilePath(memory)}</span>
              </div>
              <h1 className="note-title">{memory.title}</h1>
              <div className="note-meta">{memoryKindLabel(memory.kind)}</div>
            </section>

            <article className="detail-copy" aria-label="Note content">
              <MarkdownContent content={memory.originalCapture} memories={memories} folderPath={memory.folderPath || 'Inbox'} />
            </article>
          </>
        )}

        {savedMessage && <p className="status-note" role="status">{savedMessage}</p>}
      </div>
    </AppShell>
  );
}
