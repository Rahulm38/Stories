export function mergeHydratedMemories<T extends { id: string }>(stored: T[], pending: T[]): T[] {
  const pendingIds = new Set(pending.map((memory) => memory.id));
  return [...pending, ...stored.filter((memory) => !pendingIds.has(memory.id))];
}

export function makeRuntimeIdsUnique<T extends { id: string }>(entries: Array<{ item: T; stableKey: string }>): T[] {
  const usedIds = new Set<string>();

  return entries.map(({ item, stableKey }) => {
    if (!usedIds.has(item.id)) {
      usedIds.add(item.id);
      return item;
    }

    const suffix = encodeURIComponent(stableKey);
    let id = `${item.id}~${suffix}`;
    let attempt = 2;
    while (usedIds.has(id)) {
      id = `${item.id}~${suffix}~${attempt}`;
      attempt += 1;
    }

    usedIds.add(id);
    return { ...item, id };
  });
}

export function patchPendingItems<T extends { id: string }>(items: T[], id: string, patch: Partial<T>): T[] {
  return items.map((item) => item.id === id ? { ...item, ...patch } : item);
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
