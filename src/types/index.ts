// ============================================
// Stories — Core Type Definitions
// ============================================
// Edit this file to change the shape of data objects.

export type MemoryType =
  | 'life'
  | 'work'
  | 'trip'
  | 'person'
  | 'place'
  | 'decision'
  | 'process'
  | 'book'
  | 'quote'
  | 'task';

export type MemoryKind = 'note' | 'experience' | 'book-learning';
export type RecallStatus = 'remembered' | 'partial' | 'forgot';

export interface Memory {
  id: string;
  title: string;
  summary: string;
  originalCapture: string;
  type: MemoryType;
  kind?: MemoryKind;
  folderPath?: string;
  date: string;            // ISO date string
  timeAgo: string;         // e.g. "2 hours ago"
  people?: string[];
  place?: string;
  source?: string;
  rememberWhen?: string;
  recallPrompt?: string;
  recallStatus?: RecallStatus;
  lastRecalledAt?: string;
  nextRecallAt?: string;
  project?: string;
  whyItMatters?: string;
  useItWhen?: string;
  tags?: string[];
  connectedMemoryIds?: string[];
  recallCardIds?: string[];
  practiceStrength?: number; // 0-100
  isTrip?: boolean;
  tripName?: string;
  photos?: string[];
}


