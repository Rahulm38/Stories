import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import type { MemoryKind } from '@core/model';
import type { RecallChoice } from './options';

export type CaptureDraft = {
  body: string;
  source: string;
  recallPrompt: string;
  kind: MemoryKind;
  recallChoice: RecallChoice;
  savedAt: string;
};

const key = 'stories:capture-draft';
const file = new File(Paths.document, 'stories-capture-draft.json');

export async function readCaptureDraft(): Promise<CaptureDraft | undefined> {
  try {
    const raw = Platform.OS === 'web' ? globalThis.localStorage?.getItem(key) : (file.exists ? await file.text() : null);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as CaptureDraft;
    return parsed && typeof parsed.body === 'string' ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export async function writeCaptureDraft(draft: CaptureDraft): Promise<void> {
  const raw = JSON.stringify(draft);
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, raw);
    return;
  }
  file.create({ overwrite: true });
  file.write(raw);
}

export async function clearCaptureDraft(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(key);
      return;
    }
    if (file.exists) file.delete();
  } catch {
    // A stale draft is safer than losing the user's saved memory.
  }
}
