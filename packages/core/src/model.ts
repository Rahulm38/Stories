export type MemoryKind = 'note' | 'experience' | 'book-learning';

export type RecallStatus = 'remembered' | 'partial' | 'forgot';

export type MemoryNote = {
  id: string;
  title: string;
  body: string;
  kind: MemoryKind;
  folder: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  source?: string;
  nextRecallAt?: string;
  recallPrompt?: string;
  recallStatus?: RecallStatus;
  lastRecalledAt?: string;
  frontmatter?: string[];
};

export type NoteDraft = {
  id?: string;
  title?: string;
  body: string;
  kind?: MemoryKind;
  folder?: string;
  source?: string;
  nextRecallAt?: string;
  recallPrompt?: string;
  recallStatus?: RecallStatus;
  lastRecalledAt?: string;
  frontmatter?: string[];
};

export type VaultFile = {
  path: string;
  markdown: string;
};

export type VaultQuery = {
  search?: string;
  folder?: string;
};

export type LinkCandidate = MemoryNote;

export type LinkResolution = {
  target: string;
  note?: MemoryNote;
  status: 'resolved' | 'missing' | 'ambiguous';
};

export type VaultSnapshot = {
  notes: MemoryNote[];
};

export type VaultChange = {
  type: 'saved' | 'removed' | 'opened';
  note?: MemoryNote;
};

export interface VaultFileStore {
  list(): Promise<VaultFile[]>;
  replace(previousPath: string | undefined, nextPath: string, markdown: string): Promise<void>;
}

export interface MemoryVault {
  open(): Promise<VaultSnapshot>;
  list(query?: VaultQuery): MemoryNote[];
  read(id: string): MemoryNote | undefined;
  save(draft: NoteDraft): Promise<MemoryNote>;
  suggestLinks(query: string, fromId?: string): LinkCandidate[];
  resolveLink(target: string, fromId?: string): LinkResolution;
  subscribe(listener: (change: VaultChange) => void): () => void;
}
