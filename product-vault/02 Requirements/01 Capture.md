---
title: Capture Requirements
document_type: feature_prd
status: active
last_reviewed: 2026-08-24
---

# Capture

## Outcome

A user can preserve one thought quickly and trust that it reached durable local storage. Classification and scheduling improve future value but never block saving.

## Entry points

- Today capture row.
- Library “New memory.”
- Future capture notification deep link.
- Future OS shortcut/share action only after explicitly scoped.

All entry points open the same canonical composer. An optional, validated route parameter may preselect a kind but may not prefill private content from an untrusted link.

## Requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| CAP-001 | The writing field is the first meaningful control and receives focus on phone entry. | Keyboard opens without covering the active text/caret. |
| CAP-002 | Non-whitespace body text is the only required input. | One sentence saves without expanding details. |
| CAP-003 | Whitespace-only input cannot be saved. | Save remains disabled and no file is created. |
| CAP-004 | Capture offers Note, Book learning, and Experience. | Selection is accessible as a single-choice group and survives rotation/re-render. |
| CAP-005 | Kind maps by default to `Inbox/`, `Books/`, or `Experiences/`. | Resulting Markdown path and frontmatter agree. |
| CAP-006 | Book learning and Experience accept an optional source/context string. | Empty or whitespace values serialize as absent, not empty metadata. |
| CAP-007 | New capture defaults to a return in three days. | Collapsed details states the default before save. |
| CAP-008 | Return choices for v1 are three days, one week, and Off. | Exactly one option is selected; choosing Off hides/clears the cue for the new draft. |
| CAP-009 | A scheduled memory accepts an optional recall cue. | Empty cue falls back to a type-specific cue during recall. |
| CAP-010 | Optional controls remain behind one “Memory details” disclosure. | Body and Save are usable without opening it. |
| CAP-011 | The disclosure summary reflects type and timing. | Every option combination has plain-language summary copy. |
| CAP-012 | Save is single-flight. | Rapid taps produce exactly one note and one navigation event. |
| CAP-013 | The app waits for vault hydration before enabling Save. | Cold-start input cannot replace or race existing vault state. |
| CAP-014 | Save completion means the final Markdown was written and verified. | Navigation/success occurs only after the storage promise resolves. |
| CAP-015 | A failed save keeps every draft field and displays an actionable inline error. | Retry does not create a duplicate when the first attempt failed before commit. |
| CAP-016 | Successful save returns to Today. | Today shows “Saved privately” and a localized concrete date when recall is scheduled. |
| CAP-017 | Cancel or system Back with a dirty draft asks Keep editing or Discard. | No field—including only-changed details—can be lost silently. |
| CAP-018 | Leaving while Save is active is blocked or safely completed. | UI explains that save is in progress; no duplicate route is pushed. |
| CAP-019 | The composer preserves intentional Markdown whitespace and line breaks. | Round-trip tests compare body bytes after newline normalization policy. |
| CAP-020 | Title is derived from the first meaningful body line when the user does not enter one. | Markdown syntax prefixes are removed; result is capped; empty fallback is “Untitled note.” |
| CAP-021 | Filename generation is Unicode-safe and collision-safe. | Same-title, punctuation-only, emoji-only, and Unicode titles never overwrite an existing file. |
| CAP-022 | Draft state survives non-destructive OS interruptions during the current process. | Permission dialogs, app switch, and rotation do not clear it. |
| CAP-023 | Process death recovery has an explicit product policy. | If draft autosave is implemented, it is local, labeled, recoverable, and removed after successful save/discard. |
| CAP-024 | Capture never requires network, account, notification permission, or index availability. | Airplane-mode device test passes with index unavailable/rebuilding. |

## Field behavior

| Field | Required | Limits and normalization | Error behavior |
| --- | --- | --- | --- |
| Body | Yes | UTF-8 text; preserve meaningful whitespace; practical UI limit must be defined from device testing, not silently truncated. | Disable Save when blank; if OS/storage rejects size, retain draft and state the failure. |
| Kind | Defaulted | Enum only; unknown route value becomes Note. | Do not crash or create arbitrary folder. |
| Source/context | No | Trim outer whitespace; preserve internal Unicode; no URL assumption. | Oversized value remains editable and receives a local validation message if a tested limit is imposed. |
| Return timing | Defaulted | Three days, one week, Off; calendar computation uses device-local semantics. | Invalid internal state falls back visibly to no schedule, never an impossible date. |
| Recall cue | No | Trim outer whitespace; store only when scheduled. | Turning recall Off must not leave an invisible scheduled cue. |

## State model

`opening vault → ready/clean → ready/dirty → saving → saved` with failure transitions from opening and saving.

- Opening: writing may be allowed only if the pending draft is isolated; Save remains disabled.
- Ready/clean: Cancel exits without confirmation.
- Ready/dirty: destructive navigation is guarded.
- Saving: inputs are immutable, action says “Saving…”, repeated actions are ignored.
- Save failed: return to dirty with all inputs and a retryable message.
- Saved: clear transient draft only after verified write and successful handoff to Today.

## Acceptance scenarios

1. First launch, empty vault, one-sentence Note, default return.
2. Book learning with Unicode body/source, one-week return, custom cue.
3. Experience with long multiline Markdown and recall Off.
4. Three rapid Save taps under slow storage.
5. Storage-full and permission/revocation failure.
6. Back gesture, Android hardware Back, tab navigation, app background, and process termination for a dirty draft.
7. Same first line saved repeatedly, including punctuation-only and emoji-only titles.
8. Save at 23:59 before DST/time-zone change; confirmation and due date remain coherent.

Related: [[03 Quality/01 Edge Cases and Error Handling]], [[02 Requirements/04 Note Editing and Content Model]].
