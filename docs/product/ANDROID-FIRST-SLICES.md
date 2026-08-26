# Android-first slices

## Slice 1 — capture

Fresh launch → `Save your first memory` → plain text → Save → Today confirmation.

Acceptance:
- no category or organisation choices;
- no formatting controls;
- no cue authoring;
- no scheduling setup;
- unfinished text recovers safely;
- first return is scheduled automatically.

## Slice 2 — real resurfacing

After time has passed: short clue → try telling → Reveal → Not yet / Mostly / Yes.

Acceptance:
- hidden state cannot expose the full title/body;
- clue is deterministic and made only from original content;
- `Tomorrow` works;
- return intervals spread out after successful recalls;
- at five completed memories the session ends calmly.

## Slice 3 — Library

Library → search → memory → edit/share/stop/delete.

Acceptance:
- search supports combinations of people, places, topics, and body words;
- search ignores punctuation/case/diacritics;
- editing is ordinary text;
- stop resurfacing preserves the memory in Library;
- no category/folder/storage-path concepts appear.

## Slice 4 — reminders and privacy

After the first real resurfacing, offer one contextual reminder prompt.

Acceptance:
- permission is not requested on first launch;
- reminders are quiet and local;
- Settings clearly says memory content stays on device;
- blocked notification permission links to device settings;
- declining does not interrupt the core loop.

## Device QA

Test on physical Android for keyboard resize, Back behaviour, safe areas, edge-to-edge, large font, TalkBack, 48dp touch targets, notification channel behaviour, force-stop persistence, offline use, rotation policy, and slow-storage/error states.
