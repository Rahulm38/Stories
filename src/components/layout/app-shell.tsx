'use client';

import React, { useState } from 'react';
import { BottomNav } from './bottom-nav';
import { CaptureSheet } from '@/components/shared/capture-sheet';

interface AppShellProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export function AppShell({ children, hideNav = false }: AppShellProps) {
  const [captureOpen, setCaptureOpen] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#07060a] p-4">
      {/* Phone Frame */}
      <div className="relative w-full max-w-[430px] h-[932px] bg-background rounded-[40px] overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/50">
        {/* Status Bar Mockup */}
        <div className="flex items-center justify-between px-8 pt-4 pb-1">
          <span className="text-xs text-text-dim font-medium">9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-2.5 rounded-sm border border-text-dim/50 flex items-center justify-end p-px">
              <div className="w-2.5 h-1.5 rounded-[1px] bg-mint" />
            </div>
          </div>
        </div>

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[126px] h-[34px] bg-black rounded-b-[20px]" />

        {/* Content Area */}
        <div className="h-[calc(100%-120px)] overflow-y-auto no-scrollbar">
          {children}
        </div>

        {/* Bottom Navigation */}
        {!hideNav && (
          <BottomNav onCapturePress={() => setCaptureOpen(true)} />
        )}

        {/* Capture Sheet */}
        <CaptureSheet open={captureOpen} onOpenChange={setCaptureOpen} />

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-white/20 rounded-full" />
      </div>
    </div>
  );
}
