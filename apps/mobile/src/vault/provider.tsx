import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createMemoryVault } from '@core/index';
import type { MemoryNote, MemoryVault, NoteDraft, VaultReadIssue } from '@core/index';
import { DeviceFileStore } from './device-file-store';
import { ensureVaultReady } from './save-gate';
import { reconcileRecallReminder } from '@/src/notifications/reminder-scheduler';

type VaultContextValue = {
  notes: MemoryNote[];
  readIssues: VaultReadIssue[];
  hydrated: boolean;
  openError: string | null;
  saveNote: (draft: NoteDraft) => Promise<MemoryNote>;
  deleteNote: (id: string) => Promise<void>;
};

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const vaultRef = useRef<MemoryVault | null>(null);
  const [notes, setNotes] = useState<MemoryNote[]>([]);
  const [readIssues, setReadIssues] = useState<VaultReadIssue[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const vault = createMemoryVault(new DeviceFileStore());
    vaultRef.current = vault;
    const unsubscribe = vault.subscribe(() => {
      if (mountedRef.current) setNotes(vault.list());
    });

    vault.open()
      .then((snapshot) => {
        if (mountedRef.current) {
          setNotes(snapshot.notes);
          setReadIssues(snapshot.readIssues);
        }
      })
      .catch((error: unknown) => {
        if (mountedRef.current) setOpenError(error instanceof Error ? error.message : 'The local vault could not be opened');
      })
      .finally(() => {
        if (mountedRef.current) setHydrated(true);
      });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hydrated || openError) return;
    void reconcileRecallReminder(notes).catch(() => {
      // Reminder reconciliation must never block access to local memories.
    });
  }, [hydrated, notes, openError]);

  const saveNote = useCallback(async (draft: NoteDraft) => {
    const vault = vaultRef.current;
    ensureVaultReady(hydrated, Boolean(vault), openError);
    return vault!.save(draft);
  }, [hydrated, openError]);

  const deleteNote = useCallback(async (id: string) => {
    const vault = vaultRef.current;
    ensureVaultReady(hydrated, Boolean(vault), openError);
    return vault!.remove(id);
  }, [hydrated, openError]);

  const value = useMemo(
    () => ({ notes, readIssues, hydrated, openError, saveNote, deleteNote }),
    [deleteNote, hydrated, notes, readIssues, openError, saveNote],
  );
  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const value = useContext(VaultContext);
  if (!value) throw new Error('useVault must be used inside VaultProvider');
  return value;
}
