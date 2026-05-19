// ============================================
// Memory OS — Sample Book Ideas (Mock Data)
// ============================================
// 📝 EDIT THIS FILE to add or change sample book ideas.

import { BookIdea } from '@/types';

export const mockBookIdeas: BookIdea[] = [
  {
    id: 'book-1',
    sourceTitle: 'Indistractable',
    author: 'Nir Eyal',
    quote: 'Distraction starts from internal discomfort.',
    meaning: 'I open apps when avoiding hard or unclear work. The trigger is inside me, not the notification.',
    whyItMatters: 'Understanding this changes how I respond to the urge to scroll. I can pause and ask: what am I avoiding?',
    useItWhen: 'When I reach for Instagram, YouTube, or random browsing during work.',
    connectedMemoryIds: ['mem-6', 'mem-7'],
    recallCardIds: ['rc-2'],
    practiceStrength: 80,
    coverColor: '#7C9A92',
  },
  {
    id: 'book-2',
    sourceTitle: 'Deep Work',
    author: 'Cal Newport',
    quote: 'Schedule every minute of your day — not for control, but for intention.',
    meaning: 'Without a plan, my day drifts. Scheduling isn\'t about rigidity, it\'s about choosing where my attention goes.',
    whyItMatters: 'I waste 1-2 hours daily on context switching. A simple time-block plan could fix this.',
    useItWhen: 'When starting a workday without a plan. Or when I feel scattered.',
    connectedMemoryIds: ['mem-10'],
    recallCardIds: ['rc-3'],
    practiceStrength: 50,
    coverColor: '#7BA6D4',
  },
  {
    id: 'book-3',
    sourceTitle: 'Atomic Habits',
    author: 'James Clear',
    quote: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    meaning: 'Goals feel motivating but don\'t create change. The daily system — the habit loop — is what actually works.',
    whyItMatters: 'I keep setting goals and failing. I need to design the system: cue, routine, reward.',
    useItWhen: 'When setting a new goal. Ask: what\'s the system? Not just the outcome.',
    connectedMemoryIds: [],
    recallCardIds: ['rc-6'],
    practiceStrength: 65,
    coverColor: '#E8A946',
  },
  {
    id: 'book-4',
    sourceTitle: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    quote: 'Nothing in life is as important as you think it is, while you are thinking about it.',
    meaning: 'The focusing illusion — whatever I\'m fixated on feels way bigger than it is. Step back.',
    whyItMatters: 'Helps when I\'m spiraling about a problem. Perspective is everything.',
    useItWhen: 'When a problem feels enormous. Zoom out.',
    connectedMemoryIds: [],
    recallCardIds: ['rc-7'],
    practiceStrength: 35,
    coverColor: '#B88FCF',
  },
];
