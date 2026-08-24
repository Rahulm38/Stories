import { Platform } from 'react-native';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createMemoryVault } from '@core/index';
import type { LinkResolution, MemoryNote, MemoryVault, NoteDraft } from '@core/index';
import { BrowserFileStore } from './browser-file-store';
import { DeviceFileStore, deviceVaultLocation } from './device-file-store';
import { ensureVaultReady } from './save-gate';

type VaultContextValue = {
  notes: MemoryNote[];
  hydrated: boolean;
  openError: string | null;
  storageLocation: string;
  saveNote: (draft: NoteDraft) => Promise<MemoryNote>;
  deleteNote: (id: string) => Promise<void>;
  suggestLinks: (query: string, fromId?: string) => MemoryNote[];
  resolveLink: (target: string, fromId?: string) => LinkResolution;
};

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const vaultRef = useRef<MemoryVault | null>(null);
  const [notes, setNotes] = useState<MemoryNote[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const storageLocation = useMemo(
    () => (Platform.OS === 'web' ? 'This browser · stories-vault' : deviceVaultLocation()),
    [],
  );

  useEffect(() => {
    mountedRef.current = true;
    const vault = createMemoryVault(Platform.OS === 'web' ? new BrowserFileStore() : new DeviceFileStore());
    vaultRef.current = vault;
    const unsubscribe = vault.subscribe(() => {
      if (mountedRef.current) setNotes(vault.list());
    });

    vault.open()
      .then((snapshot) => {
        if (mountedRef.current) setNotes(snapshot.notes);
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

  const suggestLinks = useCallback((query: string, fromId?: string) => {
    return vaultRef.current?.suggestLinks(query, fromId) || [];
  }, []);

  const resolveLink = useCallback((target: string, fromId?: string) => {
    return vaultRef.current?.resolveLink(target, fromId) || { target, status: 'missing' as const };
  }, []);

  const value = useMemo(() => ({ notes, hydrated, openError, storageLocation, saveNote, deleteNote, suggestLinks, resolveLink }), [deleteNote, hydrated, notes, openError, resolveLink, saveNote, storageLocation, suggestLinks]);
  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const value = useContext(VaultContext);
  if (!value) throw new Error('useVault must be used inside VaultProvider');
  return value;
}
