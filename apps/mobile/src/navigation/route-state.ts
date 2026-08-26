export function editingFromParam(value: string | string[] | undefined): boolean {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === 'true';
}
