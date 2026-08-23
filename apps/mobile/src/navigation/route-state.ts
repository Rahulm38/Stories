export type CaptureRouteKind = 'note' | 'book-learning' | 'experience';

export function captureKindFromParam(value: string | string[] | undefined): CaptureRouteKind {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === 'book-learning' || candidate === 'experience' ? candidate : 'note';
}

export function editingFromParam(value: string | string[] | undefined): boolean {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === 'true';
}
