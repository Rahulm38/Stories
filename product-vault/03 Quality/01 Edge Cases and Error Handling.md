---
title: Edge Cases and Error Handling
status: active
last_reviewed: 2026-08-26
---

# Edge Cases and Error Handling

## Data-safety rule

**Never silently lose, corrupt, or replace a user's newer memory text with older state.**

When an operation fails:
1. keep current user input visible/editable;
2. preserve the last durable memory;
3. show a short actionable error;
4. do not navigate away until a requested save is durable or the user explicitly discards/restores.

## Capture

- Empty/whitespace body: Save disabled; no memory created.
- Interrupted draft: recover local draft on next capture open.
- Explicit discard: remove recovered draft before leaving.
- User types text, autosave draft fires, then erases everything: persisted capture draft must also be cleared.
- Rapid Save taps: single-flight guard prevents duplicates.
- Save failure: keep composer content; show error; do not clear draft.

## Direct memory editing

- Debounce normal input but serialize writes.
- If text B is typed while text A is saving, B must be saved after A; A must never become the final durable state.
- Android Back while dirty/in-flight: prevent removal, flush newest non-empty text, then continue navigation.
- Empty body on Back: offer Keep writing or Restore saved version.
- Save failure during Back: stay on the memory and surface the error.
- Delete while local unsaved text exists is an explicit destructive choice and may discard that local edit only after confirmation.

## Today / scheduling

- Time zone/DST: due eligibility uses local calendar day.
- Five handled items: persisted by local date; tab changes/relaunch must not reset it.
- Crossing into a new local day resets the handled count.
- `Tomorrow`: due date changes; `reviewStrengthDays` does not.
- Stop resurfacing: clears due date only; memory remains searchable.
- Bring back: schedules three days ahead and clears old rating/last-return/strength so the new cycle starts cleanly.
- Unsafe/empty cue candidate: use generic `A memory worth bringing back` rather than reveal an answer.

## Reminders

- Permission denied: core loop continues normally.
- Permission blocked: Settings offers device-settings route.
- Reminder time has already passed while Stories is open: do not schedule a one-minute-later notification; roll to the next calm reminder window.
- After user engages with Today: remaining overdue memories must not generate immediate repeated reminders.
- Notification body remains generic and never contains memory text.

## Search

- Empty query returns normal Library order.
- Punctuation/diacritics normalize safely.
- Small typo on meaningful token can match; very short tokens remain strict.
- Multi-word search requires a plausible match for each token to control noise.
- If no result, user can clear or shorten query; never force folder/path knowledge.

## Legacy compatibility

- Plain older files remain readable.
- Malformed structured metadata is quarantined; raw content is preserved rather than automatically rewritten.
- Existing beta filenames/folders may remain internally but are not shown to users.
- Editing legacy formatted text converts it to readable plain text and preserves useful external URLs.

## Delete / external change

- Delete requires confirmation.
- Before delete, if the app-private file no longer matches the content Stories opened, refuse deletion rather than silently deleting unexpected content.

## Error-copy guideline

Prefer:
- `This memory could not be saved.`
- `Your memory is still here. Try again.`

Avoid implementation jargon such as vault path, frontmatter, Markdown, parser or file name in normal user-facing errors.
