// ============================================
// Memory OS — Sample Recall Cards (Mock Data)
// ============================================
// 📝 EDIT THIS FILE to add or change practice cards.

import { RecallCard } from '@/types';

export const mockRecallCards: RecallCard[] = [
  {
    id: 'rc-1',
    question: 'What did the cafe owner in Goa tell you about sunsets?',
    answer: 'Francis said to skip the tourist point and take the old chapel road — that\'s where locals go.',
    sourceMemoryId: 'mem-1',
    sourceTitle: 'Goa cafe owner — old chapel road tip',
    type: 'trip',
    strength: 72,
  },
  {
    id: 'rc-2',
    question: 'What did Indistractable say distraction starts from?',
    answer: 'Internal discomfort. Not external triggers.',
    sourceMemoryId: 'mem-6',
    sourceTitle: 'Indistractable — distraction starts from discomfort',
    type: 'book',
    strength: 80,
  },
  {
    id: 'rc-3',
    question: 'What is Cal Newport\'s advice about scheduling your day?',
    answer: 'Schedule every minute — not for control, but for intention about where your attention goes.',
    sourceMemoryId: 'mem-10',
    sourceTitle: 'Deep Work — schedule every minute',
    type: 'book',
    strength: 50,
  },
  {
    id: 'rc-4',
    question: 'What was the root cause of the auth issue?',
    answer: 'Stale session state after token refresh. The old token was being cached in the middleware.',
    sourceMemoryId: 'mem-5',
    sourceTitle: 'Fixed auth issue — stale session state',
    type: 'work',
    strength: 55,
  },
  {
    id: 'rc-5',
    question: 'Why did staging break with the rate limiter?',
    answer: 'The rate limiter wasn\'t accounting for retry loops from the mobile client.',
    sourceMemoryId: 'mem-8',
    sourceTitle: 'API rate limiting broke staging',
    type: 'work',
    strength: 40,
  },
  {
    id: 'rc-6',
    question: 'What does Atomic Habits say about goals vs systems?',
    answer: 'You don\'t rise to the level of your goals. You fall to the level of your systems.',
    sourceMemoryId: 'mem-10',
    sourceTitle: 'Atomic Habits — systems over goals',
    type: 'book',
    strength: 65,
  },
  {
    id: 'rc-7',
    question: 'What is the "focusing illusion" from Kahneman?',
    answer: 'Nothing in life is as important as you think it is, while you are thinking about it.',
    sourceMemoryId: 'mem-10',
    sourceTitle: 'Thinking, Fast and Slow',
    type: 'book',
    strength: 35,
  },
];
