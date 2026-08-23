export function isExternalMarkdownLink(value: string): boolean {
  return /^(?:https?:|mailto:)/i.test(value.trim());
}

export async function openMarkdownLink(
  target: string,
  openExternal: (target: string) => Promise<void>,
  openLocal: (target: string) => void,
): Promise<void> {
  const trimmed = target.trim();
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
