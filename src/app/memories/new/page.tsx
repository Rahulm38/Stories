'use client';

import React, { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { MarkdownEditor, MarkdownEditorValue } from '@/components/shared/markdown-editor';
import { useMemoryStore } from '@/components/shared/memory-store';

function NewMemoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addMemory, folders, memories } = useMemoryStore();
  const seedTitle = searchParams.get('name')?.trim() || 'Untitled note';
  const seedFolder = searchParams.get('folder')?.trim() || 'Inbox';

  const save = (value: MarkdownEditorValue) => {
    const memory = addMemory(value);
    router.replace(`/memories/${memory.id}`);
  };

  return (
    <AppShell hideNav>
      <div className="page-stack">
        <header className="page-header">
          <Link href="/memories" className="note-back-link" aria-label="Back to Library">
            <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />
            <span>Library</span>
          </Link>
        </header>
        <MarkdownEditor
          key={`${seedTitle}-${seedFolder}`}
          initialTitle={seedTitle}
          initialBody=""
          initialFolder={seedFolder}
          initialKind="note"
          folders={folders}
          memories={memories}
          submitLabel="Create memory"
          onSave={save}
          onCancel={() => router.push('/memories')}
        />
      </div>
    </AppShell>
  );
}

export default function NewMemoryPage() {
  return (
    <Suspense fallback={null}>
      <NewMemoryContent />
    </Suspense>
  );
}
