'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, House, Settings } from 'lucide-react';

const navItems = [
  { label: 'Today', href: '/today', icon: House },
  { label: 'Library', href: '/memories', icon: BookOpen },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="bottom-nav-wrap">
      <nav className="bottom-nav" aria-label="Primary navigation">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href
            || (href === '/today' && pathname === '/')
            || (href === '/memories' && pathname.startsWith('/memories/'));

          return (
            <Link
              key={href}
              href={href}
              className={`bottom-nav-item ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
