export function isExternalMarkdownLink(value: string): boolean {
  return /^(?:https?:|mailto:|tel:|sms:)/i.test(value.trim());
}

export async function openMarkdownLink(
  target: string,
  openExternal: (target: string) => Promise<void>,
  openLocal: (target: string) => void,
): Promise<void> {
  const rawTarget = target.trim();
  const trimmed = rawTarget.startsWith('<') && rawTarget.endsWith('>')
    ? rawTarget.slice(1, -1).trim()
    : rawTarget;
  if (!isExternalMarkdownLink(trimmed)) {
    openLocal(trimmed);
    return;
  }

  try {
    await openExternal(trimmed);
  } catch {
    // An unavailable external URL must not be treated as a missing local note.
  }
}
