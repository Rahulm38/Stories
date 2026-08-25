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

function draftFile(): File {
  return new File(Paths.document, 'stories-capture-draft.json');
}

export async function readCaptureDraft(): Promise<CaptureDraft | undefined> {
  try {
    let raw: string | null | undefined;
    if (Platform.OS === 'web') {
      raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
    } else {
      const file = draftFile();
      raw = file.exists ? await file.text() : null;
    }
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
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, raw);
    return;
  }
  const file = draftFile();
  file.create({ overwrite: true });
  file.write(raw);
}

export async function clearCaptureDraft(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return;
    }
    const file = draftFile();
    if (file.exists) file.delete();
  } catch {
    // A stale draft is safer than losing the user's saved memory.
  }
}
