import React from 'react';
import { BottomNav } from './bottom-nav';

interface AppShellProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export function AppShell({ children, hideNav = false }: AppShellProps) {
  return (
    <div className="app-shell">
      <main className="app-content">{children}</main>

      {!hideNav && <BottomNav />}
    </div>
  );
}
