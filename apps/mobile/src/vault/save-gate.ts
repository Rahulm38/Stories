export const VAULT_OPENING_ERROR = 'The local vault is still opening';
export const VAULT_OPEN_ERROR = 'The local vault could not be opened';

export function ensureVaultReady(hydrated: boolean, vaultAvailable: boolean, openError?: string | null): void {
  if (openError) throw new Error(openError || VAULT_OPEN_ERROR);
  if (!hydrated || !vaultAvailable) throw new Error(VAULT_OPENING_ERROR);
}
