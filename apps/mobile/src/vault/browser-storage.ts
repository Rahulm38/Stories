export type BrowserStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

function storageUnavailable(): Error {
  return new Error('Browser storage is unavailable');
}

export function browserStorage(): BrowserStorage {
  try {
    const storage = globalThis.localStorage as BrowserStorage | undefined;
    if (!storage) throw storageUnavailable();
    return storage;
  } catch {
    throw storageUnavailable();
  }
}

export function readBrowserValue(key: string): string | null {
  try {
    return browserStorage().getItem(key);
  } catch {
    throw storageUnavailable();
  }
}

export function writeBrowserValue(key: string, value: string): void {
  try {
    browserStorage().setItem(key, value);
  } catch {
    throw storageUnavailable();
  }
}
