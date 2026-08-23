'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import { Memory } from '@/types';
import { memoryFileName, memoryFilePath, memoryKindLabel } from './memory-store';

interface FileRowProps {
  memory: Memory;
}

export function FileRow({ memory }: FileRowProps) {
  return (
    <Link href={`/memories/${memory.id}`} className="file-row">
      <span className="file-row-icon" aria-hidden="true">
        <FileText className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="file-row-name block truncate text-[15px] font-semibold text-foreground">
          {memoryFileName(memory)}
        </span>
        <span className="file-row-path block truncate">{memoryFilePath(memory)}</span>
        <span className="file-row-kind block truncate">{memoryKindLabel(memory.kind)}</span>
      </span>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-text-dim" aria-hidden="true" />
    </Link>
  );
}
