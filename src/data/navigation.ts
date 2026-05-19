// ============================================
// Memory OS — Navigation Configuration
// ============================================
// 📝 EDIT THIS FILE to change navigation labels or add tabs.

import { NavigationItem } from '@/types';

export const navigationItems: NavigationItem[] = [
  { label: 'Today', href: '/today', icon: 'sun' },
  { label: 'Memories', href: '/memories', icon: 'layers' },
  { label: 'Capture', href: '#capture', icon: 'plus', isCenter: true },
  { label: 'Library', href: '/library', icon: 'book-open' },
  { label: 'Ask', href: '/ask', icon: 'search' },
];
