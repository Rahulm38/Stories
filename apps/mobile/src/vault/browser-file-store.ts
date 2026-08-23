import type { VaultFile, VaultFileStore } from '@core/model';
import { readBrowserValue, writeBrowserValue } from './browser-storage.ts';

const STORAGE_KEY = 'stories:native-prototype:v1';
const DEMO_MODE = process.env.EXPO_PUBLIC_STORIES_DEMO_MODE === 'true';

const PREVIEW_FILES: Record<string, string> = {
  'Books/indistractable-internal-triggers.md': `---
id: "preview-book-indistractable"
title: "Distraction starts inside"
kind: "book-learning"
folder: "Books"
date: "2026-08-03T09:00:00.000Z"
updatedAt: "2026-08-08T08:00:00.000Z"
source: "Indistractable · Nir Eyal"
recallPrompt: "What was the idea you wanted to remember from Indistractable?"
nextRecallAt: "2026-08-08T08:00:00.000Z"
---
Distraction often begins with internal discomfort. Notice the feeling before changing the environment.`,
  'Experiences/wedding-anniversary-lesson.md': `---
id: "preview-experience-anniversary"
title: "Ravi's wedding anniversary"
kind: "experience"
folder: "Experiences"
date: "2026-08-08T10:00:00.000Z"
updatedAt: "2026-08-08T10:00:00.000Z"
source: "Dinner with friends"
---
Being fully present mattered more than documenting the evening. It connects to [[indistractable-internal-triggers.md]].`,
};

export class BrowserFileStore implements VaultFileStore {
  private read(): Record<string, string> {
    const raw = readBrowserValue(STORAGE_KEY);
    if (!raw) return DEMO_MODE ? { ...PREVIEW_FILES } : {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error('The local vault could not be read safely');
    if (!Object.values(parsed).every((value) => typeof value === 'string')) throw new Error('The local vault contains invalid files');
    return parsed as Record<string, string>;
  }

  private writeAll(files: Record<string, string>) {
    writeBrowserValue(STORAGE_KEY, JSON.stringify(files));
  }

  async list(): Promise<VaultFile[]> {
    return Object.entries(this.read()).map(([path, markdown]) => ({ path, markdown }));
  }

  async replace(previousPath: string | undefined, path: string, markdown: string): Promise<void> {
    const files = this.read();
    if (previousPath && previousPath !== path) delete files[previousPath];
    files[path] = markdown;
    this.writeAll(files);
  }
}
