const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function dateInputFromDate(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function localDateInputValue(value: string | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  const dateOnly = dateInputToDate(trimmed);
  if (dateOnly) return dateInputFromDate(dateOnly);
  if (DATE_INPUT_PATTERN.test(trimmed)) return '';
  const date = new Date(trimmed);
  if (!Number.isFinite(date.getTime())) return '';
  return dateInputFromDate(date);
}

export function dateInputToDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!DATE_INPUT_PATTERN.test(trimmed)) return null;
  const [year, month, day] = trimmed.split('-').map(Number);
  const date = new Date(`${trimmed}T09:00:00`);
  if (
    Number.isNaN(date.getTime())
    || date.getFullYear() !== year
    || date.getMonth() + 1 !== month
    || date.getDate() !== day
  ) {
    return null;
  }
  return date;
}
