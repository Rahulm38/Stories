---
title: Release Plan and Acceptance
status: active
last_reviewed: 2026-08-26
---

# Release Plan and Acceptance

## Delivery principle

Ship one calm Android product loop, not a collection of note-taking features. A release is ready when a tester can save a real memory, later retrieve it from a clue, tell it, reveal the original, rate availability, find it again in Library, edit it safely, and relaunch without losing data.

## Current v1 scope

### Capture
- [x] One-field plain-text capture.
- [x] No categories, folders, title requirement, formatting toolbar, cue field or schedule configuration.
- [x] New memories first return after three local calendar days.
- [x] Interrupted drafts recover locally.
- [x] Explicit discard/empty composer clears draft recovery state.

### Today
- [x] Cue -> attempt to tell -> Reveal -> `Not yet` / `Mostly` / `Yes`.
- [x] Cue generation is deterministic, local and intentionally conservative.
- [x] Maximum five handled memories per local calendar day, persisted across tab changes and relaunches.
- [x] `Tomorrow` and `Stop resurfacing` count as handled for that day's calm session.
- [x] Progressive return intervals use durable review strength rather than mutable due date.
- [x] No streaks, backlog pressure or overdue debt UI.

### Library & memory
- [x] Flat Library ordered by relevance during search and recency otherwise.
- [x] Search supports combinations of remembered fragments and small typos.
- [x] Memory body is directly editable with debounced serialized autosave.
- [x] Android Back flushes the latest non-empty edit before leaving.
- [x] Share / stop-or-restart resurfacing / delete live in an Android-safe action sheet.
- [x] Restarting a stopped memory begins a fresh resurfacing cycle.

### Privacy & reminders
- [x] App-private local storage; no account.
- [x] Android cloud backup disabled.
- [x] No ads, analytics SDK or AI dependency.
- [x] Generic local reminder notifications only.
- [x] After a user engages with Today's session, reminders do not immediately re-nag for remaining backlog.
- [x] In-app and hosted privacy policy aligned.

## Launch-blocking gates

| Gate | Pass condition | Current status |
|---|---|---|
| Data durability | Save/edit/back/relaunch do not silently lose newer text | Automated coverage added; physical Android QA required |
| Existing beta data | Older memories open without destructive migration | Compatibility codec retained; device QA required |
| Core loop | Capture -> later cue -> tell -> reveal -> rate works end to end | Implemented; device QA required |
| Daily calm limit | Five handled items remains five after tab changes/relaunch; resets next day | Implemented with persisted local-day state |
| Search recovery | Real fragments and small typos find relevant memories | Implemented locally |
| Notifications | Generic, local, no immediate post-session nag loop | Implemented; device timing QA required |
| Accessibility | 48dp controls, responsive review actions, TalkBack semantics | Automated design checks + physical TalkBack/font QA required |
| Play compliance | Current privacy URL/listing/Data Safety match shipping behavior | Privacy updated; Play Console check still required |

## What is deliberately not in v1

AI, sync, accounts, folders/tags, custom scheduling controls, streaks, statistics dashboards, custom voice recording, rich-text/Markdown authoring, graph links and vault-export UI are outside the current Android product.

## Tester build acceptance

Before asking closed-test users to focus on feedback, perform one physical-device pass:

1. fresh install / update from prior beta;
2. save several real memories;
3. force-stop and reopen;
4. exercise capture discard and draft recovery;
5. make memories due and complete five;
6. leave/reopen Today and confirm the cap remains;
7. type/edit quickly, press Back during autosave, reopen and verify newest text;
8. search with two fragments and a deliberate one-character typo;
9. exercise Share, Stop/Bring back and Delete;
10. enable notifications and confirm quiet generic behavior.
