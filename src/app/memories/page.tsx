'use client';

import React, { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Folder, FolderPlus, PenLine, Search } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { FileRow } from '@/components/shared/file-row';
import { DEFAULT_FOLDERS, memoryKindLabel, useMemoryStore } from '@/components/shared/memory-store';

export default function MemoriesPage() {
  const { memories, folders, hydrated, addFolder } = useMemoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ Inbox: true });
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolder, setNewFolder] = useState('');

  const query = searchQuery.trim().toLowerCase();
  const isEmpty = memories.length === 0;
  const availableFolders = useMemo(
    () => {
      const noteFolders = memories.map((memory) => memory.folderPath || 'Inbox');
      const userFolders = folders.filter((folder) => !DEFAULT_FOLDERS.includes(folder));
      return Array.from(new Set(['Inbox', ...userFolders, ...noteFolders]));
    },
    [folders, memories],
  );
  const matchingMemories = useMemo(
    () => memories.filter((memory) => {
      if (!query) return true;
      return [memory.title, memory.summary, memory.originalCapture, memory.folderPath || '', memoryKindLabel(memory.kind)]
        .some((value) => value.toLowerCase().includes(query));
    }),
    [memories, query],
  );

  const folderGroups = useMemo(
    () => availableFolders.map((folder) => ({
      folder,
      memories: matchingMemories.filter((memory) => (memory.folderPath || 'Inbox') === folder),
    })),
    [availableFolders, matchingMemories],
  );

  const submitFolder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newFolder.trim()) return;
    const added = addFolder(newFolder);
    if (added) setOpenFolders((current) => ({ ...current, [newFolder.trim()]: true }));
    setNewFolder('');
    setShowNewFolder(false);
  };

  return (
    <AppShell>
      <div className="page-stack">
        <header className="page-header">
          <div>
            <p className="eyebrow">Your memories</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-foreground">Library</h1>
          </div>
          {!isEmpty && <span className="count-label">{memories.length} {memories.length === 1 ? 'memory' : 'memories'}</span>}
        </header>

        {!hydrated ? (
          <div className="note-loading" role="status">Opening Library…</div>
        ) : isEmpty ? (
          <section className="library-empty" aria-labelledby="library-empty-title">
            <span className="native-leading-icon"><PenLine aria-hidden="true" /></span>
            <div>
              <h2 id="library-empty-title">Your saved memories will appear here.</h2>
              <p>Capture one thought now. Stories will bring it back when it is time to remember.</p>
            </div>
            <Link href="/memories/new" className="native-primary-button">New memory</Link>
          </section>
        ) : (
          <>
            <div className="search-field">
          <Search className="h-[18px] w-[18px] text-text-dim" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search memories"
            aria-label="Search memories"
          />
            </div>

            <section className="folder-tree" aria-labelledby="folders-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your structure</p>
              <h2 id="folders-heading" className="mt-1 text-xl font-semibold text-foreground">Folders</h2>
            </div>
            <button
              type="button"
              className="text-link inline-flex items-center gap-1.5"
              onClick={() => setShowNewFolder((open) => !open)}
              aria-expanded={showNewFolder}
            >
              <FolderPlus className="h-4 w-4" aria-hidden="true" />
              New folder
            </button>
          </div>

          {showNewFolder && (
            <form className="new-folder-form" onSubmit={submitFolder}>
              <label className="sr-only" htmlFor="new-folder">Folder name</label>
              <input
                id="new-folder"
                value={newFolder}
                onChange={(event) => setNewFolder(event.target.value)}
                placeholder="e.g. Ideas"
                className="text-input"
                autoFocus
              />
              <button type="submit" className="button-primary">Add</button>
            </form>
          )}

          <div className="folder-list">
            {folderGroups.map(({ folder, memories: folderMemories }) => {
              const isOpen = openFolders[folder] ?? false;
              return (
                <div className="folder-group" key={folder}>
                  <button
                    type="button"
                    className={`folder-row ${isOpen ? 'is-open' : ''}`}
                    onClick={() => setOpenFolders((current) => ({ ...current, [folder]: !isOpen }))}
                    aria-expanded={isOpen}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      )}
                      <Folder className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
                      <span className="truncate font-semibold">{folder}</span>
                    </span>
                    <span className="folder-count">{folderMemories.length}</span>
                  </button>
                  {isOpen && (
                    <div className="folder-file-list">
                      {folderMemories.length > 0 ? (
                        folderMemories.map((memory) => <FileRow key={memory.id} memory={memory} />)
                      ) : (
                        <p className="folder-empty">No memories here yet.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
            </section>

            {matchingMemories.length === 0 && (
              <div className="empty-state">
                <p className="text-base font-semibold text-foreground">No memories found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try another word.</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
