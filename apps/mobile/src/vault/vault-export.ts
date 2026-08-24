import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import type { MemoryNote } from '@core/model';
import { exportFileName, generateVaultExportBundle } from './vault-bundle';

export { exportFileName, generateVaultExportBundle } from './vault-bundle';

export async function exportVault(notes: MemoryNote[]): Promise<{ filename: string; path?: string }> {
  const bundle = generateVaultExportBundle(notes);
  const filename = exportFileName();

  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      const blob = new Blob([bundle], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    return { filename };
  }

  const exportFile = new File(Paths.document, filename);
  exportFile.create({ overwrite: true });
  exportFile.write(bundle);
  return { filename, path: exportFile.uri };
}
