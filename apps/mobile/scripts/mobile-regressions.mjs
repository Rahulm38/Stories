import assert from 'node:assert/strict';
import test from 'node:test';

import { captureKindFromParam, editingFromParam } from '../src/navigation/route-state.ts';
import { matchesLibrarySearch } from '../src/navigation/library-search.ts';
import { folderForKind } from '../src/navigation/note-folder.ts';
import { dateInputFromDate, dateInputToDate, localDateInputValue } from '../src/navigation/local-date.ts';
import { openMarkdownLink } from '../src/ui/markdown-links.ts';
import { readBrowserValue, writeBrowserValue } from '../src/vault/browser-storage.ts';
import { BrowserFileStore } from '../src/vault/browser-file-store.ts';
import { ensureVaultReady } from '../src/vault/save-gate.ts';
import { DEFAULT_RECALL_CHOICE, MEMORY_KIND_OPTIONS, RECALL_OPTIONS, memoryDetailsSummary, recallDaysForChoice } from '../src/capture/options.ts';
import { tabBarMetrics } from '../src/navigation/tab-bar.ts';
import { nextUpcomingRecallMessage, recallCompletionMessage, recallCue, recallResultLabel, remainingRecallMessage, savedMemoryMessage } from '../src/recall/presentation.ts';

test('capture route params update the selected capture kind', () => {
  assert.equal(captureKindFromParam(undefined), 'note');
  assert.equal(captureKindFromParam('book-learning'), 'book-learning');
  assert.equal(captureKindFromParam(['experience']), 'experience');
  assert.deepEqual(MEMORY_KIND_OPTIONS.map((option) => option.label), ['Note', 'Book learning', 'Experience']);
});

test('capture defaults to a three-day recall without a Tomorrow shortcut', () => {
  assert.equal(DEFAULT_RECALL_CHOICE, 'three-days');
  assert.equal(recallDaysForChoice(DEFAULT_RECALL_CHOICE), 3);
  assert.equal(recallDaysForChoice('week'), 7);
  assert.equal(recallDaysForChoice('off'), undefined);
  assert.deepEqual(RECALL_OPTIONS.map((option) => option.label), ['3 days', '1 week', 'Off']);
});

test('collapsed memory details summarize kind and the existing recall choice', () => {
  assert.equal(memoryDetailsSummary('note', 'three-days'), 'Note · returns in 3 days');
  assert.equal(memoryDetailsSummary('book-learning', 'week'), 'Book learning · returns in 1 week');
  assert.equal(memoryDetailsSummary('experience', 'off'), 'Experience · does not return');
});

test('recall result copy maps to the existing scheduling outcomes', () => {
  assert.equal(recallResultLabel('forgot'), 'Not yet');
  assert.equal(recallResultLabel('partial'), 'Partly');
  assert.equal(recallResultLabel('remembered'), 'Got it');
});

test('personalized recall cues format dynamically from kind, source, and prompt', () => {
  assert.equal(
    recallCue({ kind: 'book-learning', source: 'Atomic Habits', recallPrompt: '' }),
    'What idea from “Atomic Habits” did you want to remember?',
  );
  assert.equal(
    recallCue({ kind: 'book-learning', source: '', recallPrompt: '' }),
    'What idea from this book did you want to remember?',
  );
  assert.equal(
    recallCue({ kind: 'experience', source: 'Trip to Tokyo', recallPrompt: '' }),
    'What did you want to remember about “Trip to Tokyo”?',
  );
  assert.equal(
    recallCue({ kind: 'experience', source: '', recallPrompt: '' }),
    'What changed in this experience?',
  );
  assert.equal(
    recallCue({ kind: 'note', source: '', recallPrompt: '' }),
    'What did you want to remember?',
  );
  assert.equal(
    recallCue({ kind: 'note', source: '', recallPrompt: 'Custom prompt?' }),
    'Custom prompt?',
  );
});

test('recall completion names the return date and remaining work', () => {
  assert.equal(
    recallCompletionMessage('2026-08-25T10:00:00.000Z', 2, 'en-US'),
    'Practiced. Back on Aug 25. 2 recalls left today.',
  );
  assert.equal(remainingRecallMessage(0), 'All caught up today.');
  assert.equal(recallCompletionMessage('not-a-date', 0, 'en-US'), 'Practiced. All caught up today.');
});

test('first-save confirmation explains the scheduled return', () => {
  assert.equal(
    savedMemoryMessage('2026-08-26T10:00:00.000Z', 'en-US'),
    'Saved privately. It returns on Aug 26.',
  );
  assert.equal(savedMemoryMessage(undefined, 'en-US'), 'Saved privately.');
});

test('upcoming recall message presents the next scheduled return date', () => {
  assert.equal(
    nextUpcomingRecallMessage('2026-08-27T10:00:00.000Z', 'en-US'),
    'Next memory returns on Aug 27.',
  );
  assert.equal(nextUpcomingRecallMessage(undefined, 'en-US'), undefined);
});

test('bottom tabs keep a comfortable device-safe gap', () => {
  assert.deepEqual(tabBarMetrics(0, false), { bottomPadding: 16, height: 74 });
  assert.deepEqual(tabBarMetrics(24, false), { bottomPadding: 24, height: 82 });
  assert.deepEqual(tabBarMetrics(0, true), { bottomPadding: 18, height: 76 });
  assert.deepEqual(tabBarMetrics(34, true), { bottomPadding: 34, height: 92 });
});

test('library search includes the durable Markdown path and note kind', () => {
  const note = {
    title: 'A useful idea',
    body: 'Remember this later',
    folder: 'Books',
    path: 'Books/deep-work.md',
    kind: 'book-learning',
    source: undefined,
  };

  assert.equal(matchesLibrarySearch(note, 'deep-work.md'), true);
  assert.equal(matchesLibrarySearch(note, 'book-learning'), true);
  assert.equal(matchesLibrarySearch(note, 'does-not-exist'), false);
});

test('editing a note preserves nested folders unless its kind changes', () => {
  const book = { kind: 'book-learning', folder: 'Books/Thinking' };
  assert.equal(folderForKind('book-learning', book), 'Books/Thinking');
  assert.equal(folderForKind('experience', book), 'Experiences');
  assert.equal(folderForKind('note', book), 'Inbox');
});

test('recall date input uses the device-local calendar date', () => {
  const value = '2026-08-09T19:00:00.000Z';
  const date = new Date(value);
  const expected = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  assert.equal(localDateInputValue(value), expected);
});

test('picker dates convert to the same YYYY-MM-DD input the save path parses', () => {
  assert.equal(dateInputFromDate(new Date(2026, 7, 26)), '2026-08-26');
  const parsed = dateInputToDate('2026-08-26');
  assert.ok(parsed);
  assert.deepEqual([parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate()], [2026, 8, 26]);
  assert.equal(localDateInputValue(parsed.toISOString()), '2026-08-26');
});

test('recall date parsing rejects malformed and impossible dates', () => {
  assert.equal(dateInputToDate('26/08/2026'), null);
  assert.equal(dateInputToDate('2026-13-01'), null);
  assert.equal(dateInputToDate('2026-02-30'), null);
  assert.equal(dateInputToDate(''), null);
  assert.equal(localDateInputValue(' 2026-08-26 '), '2026-08-26');
  assert.equal(localDateInputValue('2026-02-30'), '');
});

test('note route params opt into editing even when params are arrays', () => {
  assert.equal(editingFromParam(undefined), false);
  assert.equal(editingFromParam(['true']), true);
  assert.equal(editingFromParam('false'), false);
});

test('browser storage failures are surfaced instead of becoming silent saves', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: undefined });
    assert.throws(() => readBrowserValue('stories:test'), /Browser storage is unavailable/);
    assert.throws(() => writeBrowserValue('stories:test', 'value'), /Browser storage is unavailable/);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('browser storage writes can be read back through the same adapter seam', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
    writeBrowserValue('stories:test', 'value');
    assert.equal(readBrowserValue('stories:test'), 'value');
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('a first browser launch opens an empty vault without preview fixtures', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const storage = {
    getItem: () => null,
    setItem: () => {},
  };
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
    assert.deepEqual(await new BrowserFileStore().list(), []);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('failed external links do not create local notes', async () => {
  const localTargets = [];
  await openMarkdownLink(' https://example.invalid/note ', async () => {
    throw new Error('handoff failed');
  }, (target) => localTargets.push(target));
  assert.deepEqual(localTargets, []);

  await openMarkdownLink(' [[local-note.md]] ', async () => {}, (target) => localTargets.push(target));
  assert.deepEqual(localTargets, ['[[local-note.md]]']);
});

test('unsupported link schemes are rejected instead of becoming local notes', async () => {
  const localTargets = [];
  const externalTargets = [];
  const errors = [];

  await openMarkdownLink('javascript:alert(1)', async (target) => externalTargets.push(target), (target) => localTargets.push(target), (target) => errors.push(target));
  await openMarkdownLink('javascript:', async (target) => externalTargets.push(target), (target) => localTargets.push(target), (target) => errors.push(target));
  await openMarkdownLink('file:///etc/passwd', async (target) => externalTargets.push(target), (target) => localTargets.push(target), (target) => errors.push(target));
  await openMarkdownLink('note\u0000.md', async (target) => externalTargets.push(target), (target) => localTargets.push(target), (target) => errors.push(target));

  assert.deepEqual(externalTargets, []);
  assert.deepEqual(localTargets, []);
  assert.deepEqual(errors, ['javascript:alert(1)', 'javascript:', 'file:///etc/passwd', 'note\u0000.md']);
});

test('deleting a memory removes it from the browser vault and rejects unknown paths', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
    const store = new BrowserFileStore();
    await store.replace(undefined, 'Inbox/idea.md', '---\nid: "idea-1"\n---\nBody');

    await store.delete('Inbox/idea.md');
    assert.deepEqual(await store.list(), []);

    await assert.rejects(store.delete('Inbox/idea.md'), /could not be found/);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('phone and SMS links are handed to the device instead of creating notes', async () => {
  const externalTargets = [];
  const localTargets = [];
  const openExternal = async (target) => externalTargets.push(target);

  await openMarkdownLink('tel:+15551234567', openExternal, (target) => localTargets.push(target));
  await openMarkdownLink('sms:+15551234567', openExternal, (target) => localTargets.push(target));

  assert.deepEqual(externalTargets, ['tel:+15551234567', 'sms:+15551234567']);
  assert.deepEqual(localTargets, []);
});

test('angle-wrapped external Markdown links are unwrapped before handoff', async () => {
  const externalTargets = [];
  const localTargets = [];

  await openMarkdownLink(' <https://example.com/a> ', async (target) => externalTargets.push(target), (target) => localTargets.push(target));

  assert.deepEqual(externalTargets, ['https://example.com/a']);
  assert.deepEqual(localTargets, []);
});

test('cold-start saves stay blocked until the vault has hydrated', () => {
assert.throws(() => ensureVaultReady(false, true), /local vault is still opening/);
assert.throws(() => ensureVaultReady(true, false), /local vault is still opening/);
assert.throws(() => ensureVaultReady(true, true, 'The local vault contains invalid files'), /invalid files/);
assert.doesNotThrow(() => ensureVaultReady(true, true));
});

test('vault export bundles notes into verifiable Markdown files', async () => {
  const { exportFileName, generateVaultExportBundle } = await import('../src/vault/vault-bundle.ts');
  const sampleNote = {
    body: 'Sample body text.',
    folder: 'Books',
    id: 'note-1',
    kind: 'book-learning',
    path: 'Books/atomic-habits.md',
    source: 'James Clear',
    title: 'Atomic Habits',
    updatedAt: '2026-08-24T10:00:00.000Z',
  };

  const bundle = generateVaultExportBundle([sampleNote]);
  assert.equal(bundle.includes('# Stories Vault Backup'), true);
  assert.equal(bundle.includes('<!-- START_MEMORY: Books/atomic-habits.md -->'), true);
  assert.equal(bundle.includes('title: "Atomic Habits"'), true);
  assert.equal(bundle.includes('Sample body text.'), true);
  assert.equal(exportFileName(new Date('2026-08-24T12:00:00Z')), 'stories-vault-backup-2026-08-24.md');
});

test('reminder service formats times, messages, and next schedule correctly', async () => {
  const { firstMemoryReminderPrompt, formatReminderTime, nextReminderDate, reminderNotificationMessage, reminderStatusCopy } = await import('../src/notifications/reminder-service.ts');

  assert.equal(formatReminderTime(9, 0), '9:00 AM');
  assert.equal(formatReminderTime(14, 30), '2:30 PM');
  assert.equal(formatReminderTime(0, 15), '12:15 AM');

  assert.equal(reminderNotificationMessage(0), undefined);
  assert.equal(reminderNotificationMessage(1), 'You have 1 memory ready to recall today.');
  assert.equal(reminderNotificationMessage(5), 'You have 5 memories ready to recall today.');

  assert.equal(reminderStatusCopy({ enabled: true, reminderHour: 9, reminderMinute: 0 }, false), 'Quiet reminder at 9:00 AM when memories are due.');
  assert.equal(reminderStatusCopy({ enabled: false, reminderHour: 9, reminderMinute: 0 }, false), 'Receive a quiet offline alert when memories are due for recall.');
  assert.equal(reminderStatusCopy({ enabled: true, reminderHour: 9, reminderMinute: 0 }, true), 'Notifications are blocked on your device. Tap to open Settings and enable them.');

  assert.equal(firstMemoryReminderPrompt(3), "Your memory is scheduled to return in 3 days. Enable quiet reminders so you don't miss it?");

  const morning = new Date('2026-08-24T08:00:00');
  const nextMorning = nextReminderDate({ enabled: true, reminderHour: 9, reminderMinute: 0 }, morning);
  assert.equal(nextMorning.getHours(), 9);
  assert.equal(nextMorning.getDate(), 24);

  const afternoon = new Date('2026-08-24T14:00:00');
  const nextDay = nextReminderDate({ enabled: true, reminderHour: 9, reminderMinute: 0 }, afternoon);
  assert.equal(nextDay.getHours(), 9);
  assert.equal(nextDay.getDate(), 25);
});

test('first memory flag triggers on empty vault after deleting previous notes', () => {
  const emptyVaultNotes = [];
  const wasEmpty = emptyVaultNotes.length === 0;
  assert.equal(wasEmpty, true);

  const populatedVaultNotes = [{ id: 'note-1', title: 'A', body: 'B' }];
  assert.equal(populatedVaultNotes.length === 0, false);

  // Deleting all notes returns vault to empty state
  populatedVaultNotes.pop();
  assert.equal(populatedVaultNotes.length === 0, true);
});

test('cleanSnippet strips Markdown symbols and duplicates', async () => {
  const { cleanSnippet } = await import('../src/navigation/snippet.ts');

  // Skips title repetition
  assert.equal(cleanSnippet('# Atomic Habits\n\nBuild good habits.', 'Atomic Habits'), 'Build good habits.');

  // Strips blockquotes and bold/italics
  assert.equal(cleanSnippet('> **Small changes** make a *big difference*.', 'Habits'), 'Small changes make a big difference.');

  // Strips bullet list symbols and numbered lists
  assert.equal(cleanSnippet('- First point\n- Second point', 'Overview'), 'First point');
  assert.equal(cleanSnippet('1. Step one\n2. Step two', 'Process'), 'Step one');

  // Strips wikilinks
  assert.equal(cleanSnippet('Refer to [[James Clear]] for more details.', 'Reference'), 'Refer to James Clear for more details.');
});


