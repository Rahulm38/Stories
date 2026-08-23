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
  storyDraft?: StoryDraft;
}

export interface StoryDraft {
  shortVersion: string;
  longVersion: string;
  bizarreMoment?: string;
  localInteraction?: string;
  lesson?: string;
  vividDetail?: string;
}

export interface BookIdea {
  id: string;
  sourceTitle: string;
  author: string;
  quote?: string;
  meaning: string;
  whyItMatters: string;
  useItWhen: string;
  connectedMemoryIds?: string[];
  recallCardIds?: string[];
  practiceStrength?: number;
  coverColor?: string;
}

export interface RecallCard {
  id: string;
  question: string;
  answer: string;
  sourceMemoryId?: string;
  sourceTitle: string;
  type: MemoryType;
  lastPracticed?: string;
  strength?: number;
}

export interface InboxItem {
  id: string;
  memoryId: string;
  memoryTitle: string;
  type: 'confirm-type' | 'follow-up' | 'split' | 'approve-recall' | 'add-context' | 'confirm-connection' | 'story-detail';
  prompt: string;
  chips?: string[];
  createdAt: string;
}

export interface AskAnswer {
  directAnswer: string;
  supportingMemories: Memory[];
  uncertainty?: string;
  suggestedAction?: string;
  sources: { title: string; id: string }[];
}

export interface NavigationItem {
  label: string;
  href: string;
  icon: string; // lucide icon name
  isCenter?: boolean;
}

export interface ImplementationIntention {
  id: string;
  text: string;
  triggerTime?: string;
  triggerContext?: string;
  sourceMemoryId?: string;
  completed: boolean;
  createdAt: string;
}
