---
title: Recall Requirements
document_type: feature_prd
status: active
last_reviewed: 2026-08-24
---

# Recall

## Outcome

A selected memory returns in a small, nonjudgmental session that prompts retrieval before rereading and then records a deterministic next return.

## Recall state machine

`due → cue → attempt → revealed → saving outcome → completed`

Alternate transitions:

- `cue → deferred to tomorrow`
- `saving outcome → error → revealed`
- `due but invalid/missing note → reconcile/remove derived schedule, preserve source file`

The stored body must not appear in accessibility labels, previews, or visual content before Reveal.

## Requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| REC-001 | Today derives due items from valid `nextRecallAt` values at or before now. | Queue refreshes on focus, resume, minute boundary, and date/time change. |
| REC-002 | Due items sort by earliest due timestamp, then deterministic path and ID tie-breakers. | Order remains stable across relaunch. |
| REC-003 | The next due recall appears before Capture; remaining items wait in the queue. | Today stays single-focus and shows an accurate due count. |
| REC-004 | Cue text uses the custom cue when present, otherwise a type-specific fallback. | Blank or whitespace cues never show an empty card. |
| REC-005 | Cue metadata may show source and kind but must not reveal the answer. | Privacy/content review covers visual and screen-reader output. |
| REC-006 | “Try to recall” enters an attempt state with the source body hidden. | No original body is mounted in an accessible hidden subtree. |
| REC-007 | Attempt is lightweight and does not require typed input. | User can think/speak, then choose Reveal. |
| REC-008 | Reveal is explicit. | No timer, scroll, notification action, or accidental rerender reveals automatically. |
| REC-009 | Revealed state shows the original body faithfully enough to evaluate recall. | At minimum Markdown text is readable; links do not hijack rating. |
| REC-010 | Ratings are Not yet, Partly, and Got it. | They map to `forgot`, `partial`, and `remembered`. |
| REC-011 | v1 next intervals are 1, 4, and 14 days respectively. | Unit tests use a fixed clock and local calendar boundary cases. |
| REC-012 | Outcome save writes status, last-recalled timestamp, and next timestamp together. | No observable state has only a subset applied. |
| REC-013 | An optional reflection is appended only when nonblank. | It appears under a dated `## Recall reflection` section and original body is preserved. |
| REC-014 | Completing a recall confirms the next return and remaining due count. | Copy uses a concrete date/interval and correct singular/plural. |
| REC-015 | After completion, the next due item becomes active without surfacing a score or streak. | Empty queue returns Today to Capture-first state. |
| REC-016 | “Tomorrow” defers from the current local time/date by one day. | It neither grades nor removes the memory. |
| REC-017 | Defer is single-flight and persists before the UI advances. | Rapid taps cannot drop or duplicate the item. |
| REC-018 | Save/defer failure keeps the current stage, body, and reflection. | Error is announced and retry is possible. |
| REC-019 | App backgrounding during attempt/reveal preserves a coherent stage for the active note while the process lives. | Resume never shows another note’s body under the old cue. |
| REC-020 | If the active note changes externally, the recall session resets safely. | Version/ID mismatch returns to cue; no outcome is applied to stale content. |
| REC-021 | Invalid timestamps are ignored, never normalized into a surprising due date. | Impossible dates, partial dates, locale strings, NaN, and overflow have tests. |
| REC-022 | Date-only legacy values have a defined local-time interpretation and migration. | Same file does not become due on different days merely because of UTC conversion. |
| REC-023 | Manual clock/time-zone changes trigger reconciliation. | No duplicate grade; due order and human copy update. |
| REC-024 | Recall works without notification permission and without network. | Complete offline device test passes. |
| REC-025 | A note can have recall disabled by clearing the due date. | It disappears from queue and pending notification is cancelled. |
| REC-026 | Editing a due date to today/past updates Today promptly. | Queue reflects the saved value without relaunch. |
| REC-027 | A note deleted or made unreadable during a queued notification does not crash. | Deep link lands on a safe unavailable state and stale request is reconciled. |
| REC-028 | The queue has no punitive “overdue” escalation. | Old items retain chronological priority but no red/guilt treatment. |
| REC-029 | Back during attempt/reveal has an explicit policy. | Default: confirm leaving if reflection is nonblank; otherwise leave without altering due state. |
| REC-030 | Extremely large note bodies do not block cue display or rating. | Reveal may virtualize/scroll; actions remain reachable. |
| REC-031 | Recall outcome is idempotent per user action. | Retried UI/navigation cannot apply two intervals or append duplicate reflection. |
| REC-032 | A completed rating remains auditable in Markdown metadata. | Reopening the file shows last status, last date, and next date. |
| REC-033 | No outcome quality ranking is shown. | “Not yet” is treated as scheduling input, not failure. |
| REC-034 | Future scheduling evolution requires a migration/version rule. | Changing intervals does not retroactively alter already stored due dates without consent. |

## Local notification requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| REC-N01 | Capture prompts and recall cues are independently configurable. | One can be off while the other remains on. |
| REC-N02 | Permission is requested only after contextual user intent. | First launch does not display an OS prompt. |
| REC-N03 | Denied, blocked, provisional, and granted states have distinct guidance. | In-app recall remains complete in every state. |
| REC-N04 | Lock-screen copy is privacy-safe by default. | Default preview does not include note body/source/private cue. |
| REC-N05 | Tapping a recall notification opens its cue in one transition after hydration. | Cold/warm/terminated tests pass. |
| REC-N06 | Notification reconciliation is deterministic. | At most one pending request exists per note/version/purpose. |
| REC-N07 | Editing, grading, deferring, disabling, restoring, or deleting a note updates pending requests. | No stale alert fires for old time/content. |
| REC-N08 | Reboot, app update, time-zone change, and permission change reconcile schedules. | Automated adapter tests plus Android device tests pass. |
| REC-N09 | OS scheduling limits are respected. | Queue schedules an explicit bounded horizon and backfills on app resume. |
| REC-N10 | Notification failures are nonfatal and visible in Settings diagnostics. | Markdown/queue state remains correct. |

## Open product questions

- Should users be able to type an attempted answer, and if so is it stored?
- Is three days the right default for all kinds?
- Should “Tomorrow” mean next local day at a preferred time or exactly 24 hours?
- What daily notification cap prevents annoyance without hiding due memories?
- Should a completed reflection be one section per attempt or appended under a single section?

These remain tracked in [[04 Delivery/03 Open Issues and Not in Build]].
