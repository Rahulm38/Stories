'use client';

import React, { useState } from 'react';
import { ArrowLeft, Edit3, FileText, Trash2, Brain } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { MarkdownContent } from '@/components/shared/markdown-content';
import { MarkdownEditor, MarkdownEditorValue } from '@/components/shared/markdown-editor';
import { memoryFilePath, memoryKindLabel, useMemoryStore } from '@/components/shared/memory-store';

export default function MemoryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { memories, folders, hydrated, updateMemory, deleteMemory } = useMemoryStore();
  const memory = memories.find((item) => item.id === params.id);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [practiceStep, setPracticeStep] = useState<0 | 1 | 2>(0);
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
            <div className="flex gap-2">
              <button type="button" className="icon-button" onClick={() => setIsEditing(true)} aria-label="Edit memory">
                <Edit3 className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
              <button type="button" className="icon-button text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => setShowDeleteConfirm(true)} aria-label="Delete memory">
                <Trash2 className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            </div>
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

            {practiceStep === 0 ? (
              <article className="detail-copy" aria-label="Note content">
                <MarkdownContent content={memory.originalCapture} memories={memories} folderPath={memory.folderPath || 'Inbox'} />
              </article>
            ) : (
              <div className="mt-8 p-6 border rounded-xl bg-card/50 text-center flex flex-col items-center">
                <Brain className="h-8 w-8 text-action mb-4" />
                <h3 className="text-xl font-semibold mb-2">Practice Recall</h3>
                <p className="text-muted-foreground mb-8">Try to remember the key points of this note without looking.</p>
                
                {practiceStep === 1 && (
                  <button className="button-primary w-full max-w-xs" onClick={() => setPracticeStep(2)}>
                    Reveal Note
                  </button>
                )}
                
                {practiceStep === 2 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-sm">
                    <p className="mb-4 font-medium text-foreground">How well did you remember?</p>
                    <div className="grid grid-cols-3 gap-3">
                      <button className="button-secondary text-red-600 dark:text-red-400" onClick={() => { updateMemory(memory.id, { recallStatus: 'forgot' }); setPracticeStep(0); setSavedMessage('Practice recorded: Forgot'); }}>Forgot</button>
                      <button className="button-secondary text-yellow-600 dark:text-yellow-400" onClick={() => { updateMemory(memory.id, { recallStatus: 'partial' }); setPracticeStep(0); setSavedMessage('Practice recorded: Partial'); }}>Partial</button>
                      <button className="button-secondary text-green-600 dark:text-green-400" onClick={() => { updateMemory(memory.id, { recallStatus: 'remembered' }); setPracticeStep(0); setSavedMessage('Practice recorded: Remembered'); }}>Got it</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {practiceStep === 0 && !isEditing && (
              <button className="button-secondary w-full mt-12 flex items-center justify-center gap-2" onClick={() => setPracticeStep(1)}>
                <Brain className="h-4 w-4" />
                Practice now
              </button>
            )}
          </>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border rounded-xl p-6 max-w-sm w-full shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Delete note?</h3>
              <p className="text-muted-foreground text-sm mb-6">This cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button className="button-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                <button className="button-primary bg-red-500 hover:bg-red-600 text-white" onClick={() => {
                  deleteMemory(memory.id);
                  router.push('/memories');
                }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {savedMessage && <p className="status-note" role="status">{savedMessage}</p>}
      </div>
    </AppShell>
  );
}
