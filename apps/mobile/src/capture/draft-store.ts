import { File, Paths } from 'expo-file-system';

export type CaptureDraft = {
  body: string;
  savedAt: string;
};

function draftFile(): File {
  return new File(Paths.document, 'stories-capture-draft.json');
}

export async function readCaptureDraft(): Promise<CaptureDraft | undefined> {
  try {
    const file = draftFile();
    if (!file.exists) return undefined;
    const raw = await file.text();
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Partial<CaptureDraft>;
    return parsed && typeof parsed.body === 'string'
      ? { body: parsed.body, savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : new Date().toISOString() }
      : undefined;
  } catch {
    return undefined;
  }
}

export async function writeCaptureDraft(draft: CaptureDraft): Promise<void> {
  const file = draftFile();
  file.create({ overwrite: true });
  file.write(JSON.stringify(draft));
}

export async function clearCaptureDraft(): Promise<void> {
  try {
    const file = draftFile();
    if (file.exists) file.delete();
  } catch {
    // A stale draft is safer than losing the user's saved memory.
  }
}
