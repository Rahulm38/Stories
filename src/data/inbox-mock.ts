// ============================================
// Memory OS — Sample Inbox Items (Mock Data)
// ============================================
// 📝 EDIT THIS FILE to add or change inbox items.

import { InboxItem } from '@/types';

export const mockInboxItems: InboxItem[] = [
  {
    id: 'inbox-1',
    memoryId: 'mem-1',
    memoryTitle: 'Goa cafe memory',
    type: 'follow-up',
    prompt: 'What made this interaction with Francis memorable?',
    createdAt: '2026-05-12T10:00:00',
  },
  {
    id: 'inbox-2',
    memoryId: 'mem-4',
    memoryTitle: 'Mom\'s birthday dinner',
    type: 'add-context',
    prompt: 'What kind of photo frame was it? Where could you find one?',
    createdAt: '2026-05-12T09:00:00',
  },
  {
    id: 'inbox-3',
    memoryId: 'mem-7',
    memoryTitle: 'Instagram during proposal',
    type: 'confirm-connection',
    prompt: 'This seems connected to your Indistractable note. Confirm?',
    chips: ['Indistractable — distraction', 'Internal discomfort'],
    createdAt: '2026-05-12T08:30:00',
  },
  {
    id: 'inbox-4',
    memoryId: 'mem-12',
    memoryTitle: 'MoEngage migration paused',
    type: 'approve-recall',
    prompt: 'Create a recall card: "Why was MoEngage migration paused?"',
    createdAt: '2026-05-12T11:00:00',
  },
  {
    id: 'inbox-5',
    memoryId: 'mem-9',
    memoryTitle: 'Bus ride pain',
    type: 'story-detail',
    prompt: 'What detail would make you remember this pain next time?',
    createdAt: '2026-05-12T07:00:00',
  },
];
