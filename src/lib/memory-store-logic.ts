export function mergeHydratedMemories<T extends { id: string }>(stored: T[], pending: T[]): T[] {
  const pendingIds = new Set(pending.map((memory) => memory.id));
  return [...pending, ...stored.filter((memory) => !pendingIds.has(memory.id))];
}

export type StorageReadResult<T> =
  | { status: 'missing' }
  | { status: 'valid'; value: T }
  | { status: 'corrupt'; raw: string };

export function parseStorageRecord<T>(raw: string | null, isValid: (value: unknown) => value is T): StorageReadResult<T> {
  if (raw === null) return { status: 'missing' };

  try {
    const value: unknown = JSON.parse(raw);
    return isValid(value) ? { status: 'valid', value } : { status: 'corrupt', raw };
  } catch {
    return { status: 'corrupt', raw };
  }
}
