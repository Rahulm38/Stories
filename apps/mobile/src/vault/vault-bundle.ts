import { serializeNote } from '../../../../packages/core/src/markdown.ts';
import type { MemoryNote } from '../../../../packages/core/src/model.ts';

export function generateVaultExportBundle(notes: MemoryNote[]): string {
  const timestamp = new Date().toISOString();
  const header = [
    '# Stories Vault Backup',
    `Exported: ${timestamp}`,
    `Total memories: ${notes.length}`,
    '----------------------------------------',
    '',
  ].join('\n');

  const sections = notes.map((note) => {
    const serialized = serializeNote(note);
    return [
      `<!-- START_MEMORY: ${note.path} -->`,
      serialized,
      `<!-- END_MEMORY: ${note.path} -->`,
      '',
    ].join('\n');
  });

  return [header, ...sections].join('\n');
}

export function exportFileName(now = new Date()): string {
  const dateStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  return `stories-vault-backup-${dateStr}.md`;
}
