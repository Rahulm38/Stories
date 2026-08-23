import { Directory, File, Paths } from 'expo-file-system';
import type { VaultFile, VaultFileStore } from '@core/model';

const VAULT_FOLDER = 'stories-vault';
const RECOVERY_ARTIFACT = /^\.(.+)\.(\d+)\.(bak|tmp)$/;

type RecoveryArtifact = {
  kind: 'backup' | 'temporary';
  targetName: string;
};

export function deviceVaultLocation(): string {
  return new Directory(Paths.document, VAULT_FOLDER).uri;
}

function segments(path: string): string[] | undefined {
  const result: string[] = [];
  for (const rawPart of path.split('/')) {
    const part = rawPart.trim();
    if (!part || part === '.') continue;
    if (part === '..') return undefined;
    result.push(part);
  }
  return result;
}

function recoveryArtifact(name: string): RecoveryArtifact | undefined {
  const match = name.match(RECOVERY_ARTIFACT);
  if (!match) return undefined;
  return { kind: match[3] === 'bak' ? 'backup' : 'temporary', targetName: match[1] };
}

function isCompleteMarkdown(markdown: string): boolean {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  return lines[0]?.replace(/^\uFEFF/, '') === '---' && lines.slice(1).some((line) => line === '---');
}

export class DeviceFileStore implements VaultFileStore {
  private readonly root = new Directory(Paths.document, VAULT_FOLDER);

  private ensureRoot() {
    this.root.create({ intermediates: true, idempotent: true });
  }

  private async readDirectory(directory: Directory, prefix: string): Promise<VaultFile[]> {
    await this.recoverArtifacts(directory);
    const files: VaultFile[] = [];
    for (const entry of directory.list()) {
      if (entry instanceof Directory) {
        files.push(...await this.readDirectory(entry, prefix ? `${prefix}/${entry.name}` : entry.name));
      } else if (entry instanceof File && entry.name.toLowerCase().endsWith('.md')) {
        try {
          files.push({
            path: prefix ? `${prefix}/${entry.name}` : entry.name,
            markdown: await entry.text(),
          });
        } catch {
          // Keep one unreadable file from making the rest of the local vault unavailable.
        }
      }
    }
    return files;
  }

  private async recoverArtifacts(directory: Directory): Promise<void> {
    for (const entry of directory.list()) {
      if (!(entry instanceof File)) continue;
      const artifact = recoveryArtifact(entry.name);
      if (!artifact) continue;

      const destination = new File(directory, artifact.targetName);
      try {
        if (artifact.kind === 'temporary') {
          if (!destination.exists) {
            const markdown = await entry.text();
            if (isCompleteMarkdown(markdown)) await entry.move(destination, { overwrite: false });
            else entry.delete();
          } else {
            entry.delete();
          }
          continue;
        }

        const destinationHealthy = destination.exists && isCompleteMarkdown(await destination.text());
        if (!destinationHealthy) {
          const markdown = await entry.text();
          if (isCompleteMarkdown(markdown)) await entry.move(destination, { overwrite: true });
          else continue;
        }
        if (entry.exists) entry.delete();
      } catch {
        // Leave an unrecoverable artifact for a later startup rather than deleting data.
      }
    }
  }

  async list(): Promise<VaultFile[]> {
    this.ensureRoot();
    return this.readDirectory(this.root, '');
  }

  private fileAt(path: string, createDirectories: boolean): File | undefined {
    this.ensureRoot();
    const parts = segments(path);
    if (!parts) return undefined;
    const name = parts.pop();
    if (!name) return undefined;

    let directory = this.root;
    for (const folder of parts) {
      const next = new Directory(directory, folder);
      if (createDirectories) next.create({ intermediates: true, idempotent: true });
      directory = next;
    }
    return new File(directory, name);
  }

  async replace(previousPath: string | undefined, path: string, markdown: string): Promise<void> {
    const destination = this.fileAt(path, true);
    if (!destination) throw new Error('A Markdown file needs a name');

    const temporary = new File(destination.parentDirectory, `.${destination.name}.${Date.now()}.tmp`);
    const backup = destination.exists
      ? new File(destination.parentDirectory, `.${destination.name}.${Date.now()}.bak`)
      : undefined;
    let backupCreated = false;
    let committed = false;
    try {
      if (backup) {
        const original = await destination.text();
        await destination.copy(backup, { overwrite: true });
        if (await backup.text() !== original) throw new Error('The Markdown backup could not be verified');
        backupCreated = true;
      }

      temporary.create({ overwrite: true });
      temporary.write(markdown);
      if (await temporary.text() !== markdown) throw new Error('The Markdown file could not be verified');
      await temporary.move(destination, { overwrite: true });
      committed = true;

      if (previousPath && previousPath !== path) {
        const previous = this.fileAt(previousPath, false);
        if (previous?.exists) previous.delete();
      }
    } catch (error) {
      if (!committed && backupCreated && backup?.exists) {
        let destinationHealthy = false;
        try {
          destinationHealthy = destination.exists && isCompleteMarkdown(await destination.text());
        } catch {
          destinationHealthy = false;
        }

        if (!destinationHealthy) {
          try {
            await backup.move(destination, { overwrite: true });
          } catch (restoreError) {
            throw new Error('The Markdown file could not be restored after a failed replacement', { cause: restoreError });
          }
        }
      }
      if (!committed && temporary.exists) temporary.delete();
      if (backup?.exists) backup.delete();
      throw error;
    }

    if (backup?.exists) backup.delete();
  }
}
