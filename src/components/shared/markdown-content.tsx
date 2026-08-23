'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Memory } from '@/types';
import { memoryFileName } from './memory-store';
import { findLinkedMemory } from '@/lib/memory-links';

interface MarkdownContentProps {
  content: string;
  memories: Memory[];
  folderPath?: string;
}

function renderInline(line: string, lineIndex: number, memories: Memory[], folderPath: string): ReactNode[] {
  const parts = line.split(/(\[\[[^\]]+\]\])/g);

  return parts.map((part, partIndex) => {
    const match = part.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/);
    if (!match) return <React.Fragment key={`${lineIndex}-${partIndex}`}>{part}</React.Fragment>;

    const target = match[1].trim();
    const linkedMemory = findLinkedMemory(target, memories);
    if (!linkedMemory) {
      const targetParts = target.split('/');
      const targetFileName = targetParts.pop()?.replace(/\.md$/i, '') || 'untitled-note';
      const targetFolder = targetParts.join('/') || folderPath;
      const createHref = `/memories/new?name=${encodeURIComponent(targetFileName)}&folder=${encodeURIComponent(targetFolder)}`;
      return (
        <Link
          key={`${lineIndex}-${partIndex}`}
          href={createHref}
          className="markdown-link is-unresolved"
          title={`Create ${targetFileName}.md`}
        >
          {match[2]?.trim() || target}
        </Link>
      );
    }
    const label = match[2]?.trim() || memoryFileName(linkedMemory);

    return (
      <Link
        key={`${lineIndex}-${partIndex}`}
        href={`/memories/${linkedMemory.id}`}
        className="markdown-link"
      >
        {label}
      </Link>
    );
  });
}

function renderLine(line: string, lineIndex: number, memories: Memory[], folderPath: string) {
  const heading = line.match(/^\s*(#{1,6})\s+(.+)$/);
  if (heading) {
    return <h2 className="markdown-heading">{renderInline(heading[2], lineIndex, memories, folderPath)}</h2>;
  }

  const task = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.+)$/);
  if (task) {
    const checked = task[1].toLowerCase() === 'x';
    return (
      <div className="markdown-list-item markdown-task">
        <span className="markdown-list-marker" aria-hidden="true">{checked ? '✓' : '□'}</span>
        <span className={checked ? 'markdown-task-done' : undefined}>{renderInline(task[2], lineIndex, memories, folderPath)}</span>
      </div>
    );
  }

  const bullet = line.match(/^\s*[-*+]\s+(.+)$/);
  if (bullet) {
    return (
      <div className="markdown-list-item">
        <span className="markdown-list-marker" aria-hidden="true">•</span>
        <span>{renderInline(bullet[1], lineIndex, memories, folderPath)}</span>
      </div>
    );
  }

  const ordered = line.match(/^\s*(\d+[.)])\s+(.+)$/);
  if (ordered) {
    return (
      <div className="markdown-list-item">
        <span className="markdown-list-marker markdown-ordered-marker" aria-hidden="true">{ordered[1]}</span>
        <span>{renderInline(ordered[2], lineIndex, memories, folderPath)}</span>
      </div>
    );
  }

  return renderInline(line, lineIndex, memories, folderPath);
}

export function MarkdownContent({ content, memories, folderPath = 'Inbox' }: MarkdownContentProps) {
  return (
    <div className="markdown-body">
      {content.split('\n').map((line, index) => (
        <div className="markdown-line" key={`line-${index}`}>
          {line ? renderLine(line, index, memories, folderPath) : <br />}
        </div>
      ))}
    </div>
  );
}
