export type MarkdownSelection = {
  start: number;
  end: number;
};

export type MarkdownAction =
  | 'heading'
  | 'bold'
  | 'italic'
  | 'quote'
  | 'bullet-list'
  | 'numbered-list'
  | 'checklist'
  | 'inline-code'
  | 'link'
  | 'indent'
  | 'outdent';

export type MarkdownEdit = {
  value: string;
  selection: MarkdownSelection;
};

function normalizedSelection(value: string, selection: MarkdownSelection): MarkdownSelection {
  const first = Math.max(0, Math.min(value.length, selection.start));
  const second = Math.max(0, Math.min(value.length, selection.end));
  return { start: Math.min(first, second), end: Math.max(first, second) };
}

function wrapSelection(value: string, selection: MarkdownSelection, before: string, after = before): MarkdownEdit {
  const selected = value.slice(selection.start, selection.end);
  const nextValue = `${value.slice(0, selection.start)}${before}${selected}${after}${value.slice(selection.end)}`;
  const start = selection.start + before.length;
  const end = start + selected.length;
  return {
    value: nextValue,
    selection: selected ? { start, end } : { start, end: start },
  };
}

function selectedLineStarts(value: string, selection: MarkdownSelection): number[] {
  const blockStart = value.lastIndexOf('\n', Math.max(0, selection.start - 1)) + 1;
  const finalSelectedCharacter = selection.end > selection.start && value[selection.end - 1] === '\n'
    ? selection.end - 1
    : selection.end;
  const nextBreak = value.indexOf('\n', finalSelectedCharacter);
  const blockEnd = nextBreak === -1 ? value.length : nextBreak;
  const starts = [blockStart];

  let breakAt = value.indexOf('\n', blockStart);
  while (breakAt !== -1 && breakAt < blockEnd) {
    starts.push(breakAt + 1);
    breakAt = value.indexOf('\n', breakAt + 1);
  }
  return starts;
}

function prefixSelectedLines(
  value: string,
  selection: MarkdownSelection,
  prefixForLine: (index: number) => string,
): MarkdownEdit {
  const insertions = selectedLineStarts(value, selection).map((start, index) => ({
    start,
    text: prefixForLine(index),
  }));
  let nextValue = value;
  for (const insertion of [...insertions].reverse()) {
    nextValue = `${nextValue.slice(0, insertion.start)}${insertion.text}${nextValue.slice(insertion.start)}`;
  }

  const mapPosition = (position: number) => position + insertions.reduce(
    (offset, insertion) => offset + (insertion.start <= position ? insertion.text.length : 0),
    0,
  );
  return {
    value: nextValue,
    selection: { start: mapPosition(selection.start), end: mapPosition(selection.end) },
  };
}

function outdentSelectedLines(value: string, selection: MarkdownSelection): MarkdownEdit {
  const removals = selectedLineStarts(value, selection).flatMap((start) => {
    if (value[start] === '\t') return [{ start, length: 1 }];
    const spaces = value.slice(start).match(/^ {1,2}/)?.[0].length ?? 0;
    return spaces ? [{ start, length: spaces }] : [];
  });
  let nextValue = value;
  for (const removal of [...removals].reverse()) {
    nextValue = `${nextValue.slice(0, removal.start)}${nextValue.slice(removal.start + removal.length)}`;
  }

  const mapPosition = (position: number) => {
    let offset = 0;
    for (const removal of removals) {
      if (position < removal.start) break;
      if (position <= removal.start + removal.length) return removal.start + offset;
      offset -= removal.length;
    }
    return position + offset;
  };
  return {
    value: nextValue,
    selection: { start: mapPosition(selection.start), end: mapPosition(selection.end) },
  };
}

export function applyMarkdownAction(value: string, rawSelection: MarkdownSelection, action: MarkdownAction): MarkdownEdit {
  const selection = normalizedSelection(value, rawSelection);

  if (action === 'bold') return wrapSelection(value, selection, '**');
  if (action === 'italic') return wrapSelection(value, selection, '*');
  if (action === 'inline-code') return wrapSelection(value, selection, '`');
  if (action === 'link') {
    if (selection.start === selection.end) return wrapSelection(value, selection, '[', ']()');
    const edit = wrapSelection(value, selection, '[', ']()');
    const caret = edit.selection.end + 2;
    return { value: edit.value, selection: { start: caret, end: caret } };
  }
  if (action === 'heading') return prefixSelectedLines(value, selection, () => '## ');
  if (action === 'quote') return prefixSelectedLines(value, selection, () => '> ');
  if (action === 'bullet-list') return prefixSelectedLines(value, selection, () => '- ');
  if (action === 'numbered-list') return prefixSelectedLines(value, selection, (index) => `${index + 1}. `);
  if (action === 'checklist') return prefixSelectedLines(value, selection, () => '- [ ] ');
  if (action === 'indent') return prefixSelectedLines(value, selection, () => '  ');
  if (action === 'outdent') return outdentSelectedLines(value, selection);

  return { value, selection };
}
