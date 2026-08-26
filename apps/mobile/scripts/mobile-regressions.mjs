import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { deferRecall, gradeRecall, MAX_SESSION_MEMORIES, scheduleFirstRecall, stopResurfacing } from '../../../packages/core/src/recall.ts';
import { plainMemoryText, storyCue } from '../../../packages/core/src/story-cue.ts';
import { librarySearchScore, matchesLibrarySearch } from '../src/navigation/library-search.ts';
import { dailyReviewComplete, incrementDailyReviewSession, remainingDailyReviewCapacity, sessionForDay } from '../src/recall/daily-session.ts';
import { selectPracticeMemory } from '../src/recall/practice.ts';
import { tabBarMetrics } from '../src/navigation/tab-bar.ts';
import { nextUpcomingRecallMessage, recallCompletionMessage, recallResultLabel, savedMemoryMessage } from '../src/recall/presentation.ts';
import { reminderNotificationMessage, reminderStatusCopy } from '../src/notifications/reminder-service.ts';
import { ensureVaultReady } from '../src/vault/save-gate.ts';

test('story cues use contextual handles without leaking a short-memory answer', () => {
  const story = 'At Bangalore airport, a security guard recognized my book and we talked about his daughter reading more.';
  const cue = storyCue(story);
  assert.notEqual(cue.toLowerCase(), story.toLowerCase());
  assert.ok(cue.length < story.length);
  assert.match(cue, /Bangalore|airport|security/i);

  const factual = storyCue('The capital of France is Paris.');
  assert.doesNotMatch(factual, /Paris/i);
});

test('legacy formatting becomes readable plain text without losing useful URLs', () => {
  assert.equal(
    plainMemoryText('## Lesson\n\n- **Talk to users** before building.\n\n[Reference](https://example.com).'),
    'Lesson\n\nTalk to users before building.\n\nReference — https://example.com.',
  );
});

test('first return is three days and successful returns progressively spread out', () => {
  const createdAt = new Date('2026-08-01T10:00:00.000Z');
  assert.equal(scheduleFirstRecall(createdAt, 3), '2026-08-04T10:00:00.000Z');

  const first = {
    id: 'm1', title: 'Memory', body: 'A story', kind: 'note', folder: 'Inbox', path: 'Inbox/memory.md',
    createdAt: createdAt.toISOString(), updatedAt: createdAt.toISOString(), nextRecallAt: '2026-08-04T10:00:00.000Z',
  };
  const afterFirst = gradeRecall(first, 'remembered', new Date('2026-08-04T10:00:00.000Z'));
  assert.equal(afterFirst.nextRecallAt, '2026-08-18T10:00:00.000Z');
  assert.equal(afterFirst.reviewStrengthDays, 14);
  const afterSecond = gradeRecall({ ...first, ...afterFirst, path: first.path, createdAt: first.createdAt, updatedAt: first.updatedAt }, 'remembered', new Date('2026-08-18T10:00:00.000Z'));
  assert.equal(afterSecond.nextRecallAt, '2026-09-17T10:00:00.000Z');
  assert.equal(afterSecond.reviewStrengthDays, 30);
});

test('Tomorrow moves only the due date and freezes legacy strength before moving it', () => {
  const memory = {
    id: 'm1', title: 'Memory', body: 'A story', kind: 'note', folder: 'Inbox', path: 'Inbox/memory.md',
    createdAt: '2026-08-01T10:00:00.000Z', updatedAt: '2026-08-01T10:00:00.000Z',
    lastRecalledAt: '2026-08-10T10:00:00.000Z', nextRecallAt: '2026-08-24T10:00:00.000Z', reviewStrengthDays: 14,
  };
  const deferred = deferRecall(memory, new Date('2026-08-24T10:00:00.000Z'));
  assert.equal(deferred.nextRecallAt, '2026-08-25T10:00:00.000Z');
  assert.equal(deferred.reviewStrengthDays, 14);

  const legacy = { ...memory, reviewStrengthDays: undefined };
  const legacyDeferred = deferRecall(legacy, new Date('2026-08-24T10:00:00.000Z'));
  assert.equal(legacyDeferred.reviewStrengthDays, 14);

  const remembered = gradeRecall({ ...memory, ...deferred }, 'remembered', new Date('2026-08-25T10:00:00.000Z'));
  assert.equal(remembered.reviewStrengthDays, 30);
  assert.equal(stopResurfacing(memory).nextRecallAt, undefined);
});

test('daily review limit persists conceptually for the whole local day and resets tomorrow', () => {
  const morning = new Date(2026, 7, 26, 9, 0);
  let session = sessionForDay(undefined, morning);
  for (let i = 0; i < MAX_SESSION_MEMORIES; i += 1) session = incrementDailyReviewSession(session, morning);
  assert.equal(remainingDailyReviewCapacity(session, morning), 0);
  assert.equal(dailyReviewComplete(session, morning), true);
  assert.equal(sessionForDay(session, new Date(2026, 7, 27, 0, 1)).handled, 0);
});

test('voluntary practice prioritizes useful stories and rotates without changing recall state', () => {
  const base = { title: 'Story', body: 'A story', kind: 'note', folder: 'Inbox', parseStatus: 'healthy' };
  const notes = [
    { ...base, id: 'recent', path: 'Inbox/recent.md', createdAt: '2026-08-01T10:00:00.000Z', updatedAt: '2026-08-01T10:00:00.000Z', lastRecalledAt: '2026-08-25T10:00:00.000Z' },
    { ...base, id: 'unseen-new', path: 'Inbox/new.md', createdAt: '2026-08-20T10:00:00.000Z', updatedAt: '2026-08-20T10:00:00.000Z' },
    { ...base, id: 'unseen-old', path: 'Inbox/old.md', createdAt: '2026-08-10T10:00:00.000Z', updatedAt: '2026-08-10T10:00:00.000Z' },
  ];
  assert.equal(selectPracticeMemory(notes, 0)?.id, 'unseen-old');
  assert.equal(selectPracticeMemory(notes, 1)?.id, 'unseen-new');
  assert.equal(selectPracticeMemory(notes, 2)?.id, 'recent');
  assert.equal(selectPracticeMemory(notes, 3)?.id, 'unseen-old');
});

test('Library search combines fragments, ranks exact matches, and tolerates small typos', () => {
  const memory = {
    title: 'Airport moment', body: 'In Bangalore, Ravi told me a funny story about a taxi driver.',
    folder: 'Inbox', path: 'Inbox/airport.md', kind: 'note', source: '',
  };
  assert.equal(matchesLibrarySearch(memory, 'Bangalore Ravi'), true);
  assert.equal(matchesLibrarySearch(memory, 'Bangalor taxi'), true);
  assert.equal(matchesLibrarySearch(memory, 'airport taxi'), true);
  assert.equal(matchesLibrarySearch(memory, 'book learning'), false);
  assert.ok(librarySearchScore(memory, 'Bangalore taxi') < librarySearchScore(memory, 'Bangalor taxi'));
});

test('mobile flow contains the hardened Android storytelling contracts', async () => {
  const [capture, today, library, note, practice, provider, appJsonText, mobilePackageText, easText, draftStore, reminderPrefs] = await Promise.all([
    readFile(new URL('../app/capture.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/(tabs)/index.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/(tabs)/files.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/note/[id].tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/practice/[id].tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/vault/provider.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app.json', import.meta.url), 'utf8'),
    readFile(new URL('../package.json', import.meta.url), 'utf8'),
    readFile(new URL('../eas.json', import.meta.url), 'utf8'),
    readFile(new URL('../src/capture/draft-store.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/notifications/reminder-preferences.ts', import.meta.url), 'utf8'),
  ]);

  for (const source of [capture, today, library, note, practice]) {
    assert.doesNotMatch(source, /Book learning|Experience|Recall cue|Memory details|Formatting toolbar/);
  }

  assert.match(capture, /Try telling it now/);
  assert.match(capture, /scheduleFirstRecall\(new Date\(\), 3\)/);
  assert.match(capture, /clearCaptureDraft/);

  assert.match(today, /Try one now/);
  assert.match(today, /selectPracticeMemory/);
  assert.match(today, /practiceOffset/);
  assert.match(today, /setPracticeOffset/);
  assert.match(today, /Done for today/);
  assert.match(today, /readDailyReviewSession/);
  assert.doesNotMatch(today, /<SectionHeader>Recent<\/SectionHeader>|ListRow|record_voice_over/);

  assert.match(practice, /See original/);
  assert.match(practice, /Just practice/);
  assert.doesNotMatch(practice, /gradeRecall|practiceRecall|saveNote|recordDailyReviewHandled/);

  assert.match(note, /Try telling/);
  assert.match(note, /\/practice\/\[id\]/);
  assert.match(note, /ActionSheet/);
  assert.match(note, /beforeRemove/);
  assert.match(note, /runSaveLoop/);
  assert.doesNotMatch(note, /Edit memory/);

  assert.match(library, /Small typos are okay/);
  assert.doesNotMatch(provider, /BrowserFileStore|storageLocation|suggestLinks|resolveLink/);
  assert.doesNotMatch(draftStore, /Platform|localStorage/);
  assert.doesNotMatch(reminderPrefs, /Platform|localStorage/);

  const appJson = JSON.parse(appJsonText);
  assert.deepEqual(appJson.expo.platforms, ['android']);
  assert.equal(appJson.expo.ios, undefined);
  const buildProperties = appJson.expo.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === 'expo-build-properties');
  assert.ok(buildProperties);
  assert.equal(buildProperties[1].android.enableMinifyInReleaseBuilds, true);
  assert.equal(buildProperties[1].android.enableShrinkResourcesInReleaseBuilds, true);

  const mobilePackage = JSON.parse(mobilePackageText);
  assert.equal(mobilePackage.dependencies['expo-build-properties'], '~57.0.13');
  assert.equal(mobilePackage.dependencies['expo-font'], '~57.0.1');
  for (const removed of ['expo-dev-client', 'react-native-reanimated', 'react-native-worklets', 'react-native-web', 'react-dom']) {
    assert.equal(mobilePackage.dependencies[removed], undefined);
  }

  const eas = JSON.parse(easText);
  assert.equal(eas.build.development, undefined);
  assert.equal(eas.build.preview.android.buildType, 'apk');
  assert.equal(eas.build.production.android.buildType, 'app-bundle');
});

test('result copy stays storytelling-oriented and calm', () => {
  assert.equal(recallResultLabel('forgot'), 'Forgot');
  assert.equal(recallResultLabel('partial'), 'Close');
  assert.equal(recallResultLabel('remembered'), 'Got it');
  assert.equal(savedMemoryMessage('2026-08-29T10:00:00.000Z', 'en-US'), 'Saved. Comes back on Aug 29.');
  assert.equal(recallCompletionMessage('2026-09-09T10:00:00.000Z', 0, 'en-US'), 'Back on Sep 9. Done for now.');
  assert.equal(nextUpcomingRecallMessage('2026-08-29T10:00:00.000Z', 'en-US'), 'Your next story comes back on Aug 29.');
});

test('bottom tabs keep comfortable Android device-safe spacing', () => {
  assert.deepEqual(tabBarMetrics(0, false), { bottomPadding: 16, height: 74 });
  assert.deepEqual(tabBarMetrics(24, false), { bottomPadding: 24, height: 82 });
});

test('reminder copy is generic and content-private', () => {
  assert.equal(reminderNotificationMessage(1), 'A memory is ready to come back.');
  assert.equal(reminderNotificationMessage(8), 'A few memories are ready to come back.');
  assert.equal(reminderStatusCopy({ enabled: false, reminderHour: 9, reminderMinute: 0 }), 'Get a quiet alert when something is ready to come back.');
});

test('cold-start saves stay blocked until local memories have opened', () => {
  assert.throws(() => ensureVaultReady(false, true), /local vault is still opening/);
  assert.throws(() => ensureVaultReady(true, false), /local vault is still opening/);
  assert.doesNotThrow(() => ensureVaultReady(true, true));
});
