---
title: Non-Functional Requirements
status: active
last_reviewed: 2026-08-26
---

# Non-Functional Requirements

## Reliability & durability

- **No silent data loss:** a memory save must either become durable or surface an error.
- **Serialized writes:** overlapping edits must never allow an older write to replace newer text.
- **Navigation safety:** Android Back must not leave a dirty memory until the latest non-empty text is durable.
- **Draft recovery:** unfinished capture text is recovered after interruption; an explicit discard or clearing the composer removes the persisted draft.
- **Compatibility:** memories created by earlier beta builds remain readable through an isolated legacy storage codec. Compatibility code is not exposed as a product concept.
- **Offline core loop:** capture, Today, Library search, editing, resurfacing and deletion work without network access.

## Android interaction requirements

- Interactive controls target at least **48dp**.
- Bottom navigation respects gesture/navigation-bar insets.
- Review controls must reflow on narrow screens and larger font scales rather than clipping labels.
- Destructive actions require confirmation.
- Multi-action menus use an Android-safe action sheet rather than relying on Alert button counts.
- Predictive/system Back behavior must preserve data.

## Performance targets

Reference target: a normal mid-range Android device.

| Interaction | Target |
|---|---:|
| Warm Today open | <= 1 s p95 |
| Cold local-vault open | <= 2.5 s p95 for normal personal libraries |
| Visible save-state feedback | <= 100 ms |
| Local Library query | <= 200 ms for 5,000 memories |
| Review rating / Tomorrow response | immediate UI feedback; durable write before completion |

Library search is local and deterministic. Exact matches rank ahead of fragment and typo-tolerant matches.

## Privacy & security invariants

- Memory content stays in app-private device storage.
- No account is required.
- No advertising or analytics SDK is included.
- Memory text, search terms and cue text must not be intentionally logged.
- Android cloud backup is disabled.
- Reminder notifications are local and generic; memory content is not placed on the lock screen.
- No AI or network service is required to generate cues, search results or resurfacing schedules.

## Release evidence

Automated checks are necessary but not sufficient. Before a Play production release, verify on physical Android hardware:

- keyboard resize and composer scrolling;
- Android Back / predictive Back;
- force-stop and relaunch persistence;
- notification permission, channel and reminder timing;
- TalkBack labels and reading order;
- large font / display scaling;
- delete, share and action-sheet behavior;
- existing beta-memory compatibility.
