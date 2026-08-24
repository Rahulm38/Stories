import { classifyLinkTarget } from '../../../../packages/core/src/links.ts';

export async function openMarkdownLink(
  target: string,
  openExternal: (target: string) => Promise<void>,
  openLocal: (target: string) => void,
  onError?: (target: string) => void,
): Promise<void> {
  const rawTarget = target.trim();
  const trimmed = rawTarget.startsWith('<') && rawTarget.endsWith('>')
    ? rawTarget.slice(1, -1).trim()
    : rawTarget;
  const classified = classifyLinkTarget(trimmed);
  if (classified.kind === 'blocked') {
    onError?.(trimmed);
    return;
  }
  if (classified.kind !== 'external') {
    openLocal(trimmed);
    return;
  }

  if (!classified.allowed) {
    onError?.(trimmed);
    return;
  }

  try {
    await openExternal(trimmed);
  } catch {
    onError?.(trimmed);
  }
}
