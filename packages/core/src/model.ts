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
  /**
   * Last durable recall interval. Stored separately from nextRecallAt so deferring
   * a due memory cannot accidentally make the scheduling algorithm think the
   * memory became stronger.
   */
  reviewStrengthDays?: number;
  frontmatter?: string[];
  schemaVersion?: number;
  parseStatus?: ParseStatus;
  rawContent?: string;
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
  reviewStrengthDays?: number;
  frontmatter?: string[];
};

export type VaultFile = {
  path: string;
  /** Legacy on-device serialized representation. Kept only for safe beta-data compatibility. */
  markdown: string;
};

export type VaultReadIssue = {
  path: string;
  message: string;
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
  readIssues: VaultReadIssue[];
};

export type VaultChange = {
  type: 'saved' | 'removed' | 'opened';
  note?: MemoryNote;
};

export type ParseStatus = 'healthy' | 'legacy' | 'quarantine';

export interface VaultFileStore {
  list(): Promise<VaultFile[]>;
  replace(previousPath: string | undefined, nextPath: string, markdown: string): Promise<void>;
  delete?(path: string): Promise<void>;
  getReadIssues?(): VaultReadIssue[];
}

export interface MemoryVault {
  open(): Promise<VaultSnapshot>;
  list(query?: VaultQuery): MemoryNote[];
  read(id: string): MemoryNote | undefined;
  save(draft: NoteDraft): Promise<MemoryNote>;
  remove(id: string): Promise<void>;
  subscribe(listener: (change: VaultChange) => void): () => void;
}
