'use client';
import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import { Memory } from '@/types';
import { memoryFileName, memoryFilePath, memoryKindLabel } from './memory-store';

interface MemoryCardProps {
  memory: Memory;
  index?: number;
  compact?: boolean;
}

export function MemoryCard({ memory, compact = false }: MemoryCardProps) {
  return (
    <div className="relative">
      <Link href={`/memories/${memory.id}`} className="memory-row">
        <div className="flex items-center gap-3">
          <span className="file-row-icon" aria-hidden="true">
            <FileText className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[15px] font-semibold text-foreground">
                {memoryFileName(memory)}
              </h3>
              <span className="flex-shrink-0 text-xs text-text-dim">{memory.timeAgo}</span>
            </div>
            <p className="file-row-path truncate">{memoryFilePath(memory)}</p>
            <p className="file-row-kind truncate">{memoryKindLabel(memory.kind)}</p>
            {!compact && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{memory.summary}</p>}
          </div>
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-text-dim" aria-hidden="true" />
        </div>
      </Link>

    </div>
  );
}
