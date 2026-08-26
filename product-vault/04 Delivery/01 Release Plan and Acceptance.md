---
title: Release Plan and Acceptance
status: active
last_reviewed: 2026-08-26
---

# Release Plan and Acceptance

## Delivery principle

Ship one calm Android story-memory loop, not a collection of note-taking features. A release is ready when a tester can save a real memory, immediately understand the clue → tell → reveal mechanic, later retrieve it from a scheduled clue, rate availability, practice voluntarily without corrupting the schedule, find it again in Library, edit it safely, and relaunch without losing data.

## Current v1 scope

### Capture
- [x] One-field plain-text capture.
- [x] No categories, folders, title requirement, formatting toolbar, cue field or schedule configuration.
- [x] New memories first return after three local calendar days.
- [x] Successful save exposes `Try telling it now` before leaving the flow.
- [x] Immediate practice does not alter the real three-day return.
- [x] Interrupted drafts recover locally; discard/erase clears stale draft state.

### Today / practice
- [x] Scheduled loop: clue → attempt to tell → Reveal original → `Not yet` / `Mostly` / `Yes`.
- [x] Cue generation is deterministic, local and intentionally conservative.
- [x] Nothing-due state offers `Try one now` using an existing healthy memory.
- [x] Voluntary practice is read-only with respect to recall status, strength and due date.
- [x] Today has no Recent/browse feed; Library owns browsing.
- [x] Maximum five handled scheduled memories per local calendar day, persisted across tab changes and relaunches.
- [x] `Tomorrow` and `Stop resurfacing` count as handled for that day's scheduled session.
- [x] Progressive return intervals use durable review strength rather than mutable due date.
- [x] Legacy memories freeze inferred strength before Tomorrow/Stop changes the due date.
- [x] No streaks, backlog pressure or overdue debt UI.

### Library & memory
- [x] Flat Library ordered by relevance during search and recency otherwise.
- [x] Search supports combinations of remembered fragments and small typos.
- [x] Memory body is directly editable with debounced serialized autosave.
- [x] Android Back flushes the latest non-empty edit before leaving.
- [x] `Try telling` flushes the latest edit before opening voluntary practice.
- [x] Share / stop-or-restart resurfacing / delete live in an Android-safe action sheet.
- [x] Restarting a stopped memory begins a fresh resurfacing cycle.

### Android delivery
- [x] Shipping app configuration targets Android only.
- [x] Preview remains an internal APK; production remains an AAB.
- [x] Release minification and resource shrinking enabled.
- [x] Unused dev-client and reanimated/worklet dependencies removed.
- [x] Required `expo-font` peer retained for `expo-symbols`.
- [x] Native persistence/notification paths no longer carry web fallbacks.
- [x] Generated native Android folder remains uncommitted/ephemeral.

### Privacy & reminders
- [x] App-private local storage; no account.
- [x] Android cloud backup disabled.
- [x] No ads, analytics SDK or AI dependency.
- [x] Generic local reminder notifications only.
- [x] After a user engages with Today's scheduled session, reminders do not immediately re-nag for remaining backlog.
- [x] In-app and hosted privacy policy aligned.

## Launch-blocking gates

| Gate | Pass condition | Current status |
|---|---|---|
| First-value clarity | First save demonstrates why Stories is not Notes | Implemented; device UX check required |
| Data durability | Save/edit/back/relaunch do not silently lose newer text | Automated coverage; physical Android QA required |
| Existing beta data | Older memories open and rollback remains safe | Schema-v1 compatibility retained; device upgrade QA required |
| Scheduled core loop | Capture → rest → clue → tell → reveal → rate works end to end | Implemented; device QA required |
| Voluntary practice | Try-now paths never change scheduled return metadata | Read-only implementation + regression coverage |
| Daily calm limit | Five handled scheduled items remains five after tab changes/relaunch; resets next day | Persisted local-day state |
| Search recovery | Real fragments and small typos find relevant memories | Implemented locally |
| Notifications | Generic, local, no immediate post-session nag loop | Implemented; device timing QA required |
| Accessibility | 48dp controls, responsive review actions, TalkBack semantics | Automated design checks + physical TalkBack/font QA required |
| Android release | Release config minifies/shrinks and Expo configuration is valid | CI/Expo Doctor must pass exact candidate |
| Play compliance | Privacy URL/listing/Data Safety match shipping behavior | Play Console check still required |

## What is deliberately not in v1

AI, sync, accounts, folders/tags, custom scheduling controls, streaks, statistics dashboards, custom voice recording, rich-text/Markdown authoring, graph links and vault-export UI are outside the current Android product.

## Tester build acceptance

1. Fresh install and update from prior beta.
2. Save a real story; use `Try telling it now`; reveal; finish; confirm real return remains +3 days.
3. Force-stop and reopen; confirm data persists.
4. Exercise capture discard and draft recovery.
5. With nothing due, use `Try one now`; confirm practice does not alter due date/status/strength.
6. Make memories due and complete five; leave/reopen Today and confirm the cap remains.
7. Use Tomorrow on a current and older-beta memory; confirm later strength is not inflated.
8. Edit quickly, press Android Back during autosave, reopen and verify newest text.
9. From a saved memory, use `Try telling` after an edit and verify the newest text is practiced.
10. Search with two fragments and a deliberate one-character typo.
11. Exercise Share, Stop/Bring back and Delete.
12. Enable notifications and confirm quiet generic behavior.
13. Check large text, TalkBack, keyboard resize and predictive Back.
14. Compare preview APK / Play generated install size against the previous build; do not infer production install size from the universal preview APK alone.
