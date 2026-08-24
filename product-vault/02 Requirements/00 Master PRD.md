---
title: Master PRD
document_type: prd
status: active
version: 1.0-detailed
last_reviewed: 2026-08-24
---

# Stories v1 master PRD

## Executive summary

Stories is an Android-first, local-first recall companion for book learnings and lived experiences. It stores ordinary Markdown, makes capture fast, and brings selected memories back through a cue-first practice flow. The product succeeds when people remember and reuse what mattered—not when they accumulate more notes.

## Objective

Prove that a lightweight Capture → Cue → Attempt → Reveal → Rate → Reuse loop produces meaningful remembered-and-reused moments while maintaining user trust in local data.

## Goals

- G1: Save a worthwhile thought in a median of under 20 seconds.
- G2: Complete one due recall in a median of under 30 seconds.
- G3: Keep the core loop fully functional offline and without an account.
- G4: Prevent silent data loss across save, edit, move, relaunch, upgrade, backup, and restore.
- G5: Make every stored memory recoverable as understandable Markdown.
- G6: Reach WCAG 2.2 AA-equivalent behavior for native mobile interactions and support 200% font scaling without loss of functionality.

## Non-goals

See [[01 Strategy/03 Scope and Principles#Deferred until evidence]]. In particular, v1 is not an AI assistant, task manager, social product, Obsidian clone, or cross-device sync service.

## Core surfaces

| Surface | Primary user intent | Dominant action |
| --- | --- | --- |
| Today | Capture or complete the next due recall | Write / Try to recall |
| Capture | Preserve one memory | Save memory |
| Recall | Retrieve before rereading | Reveal, then rate |
| Library | Find and reopen durable memories | Search / Open |
| Note | Read or change one memory | Edit / Save |
| Settings | Understand recall, storage, privacy, and recovery | Change one setting or start backup |

## Functional requirement index

| Area | Requirement IDs | Detailed specification |
| --- | --- | --- |
| App lifecycle and navigation | APP-001–APP-012 | This document |
| Capture | CAP-001–CAP-024 | [[02 Requirements/01 Capture]] |
| Recall | REC-001–REC-034 | [[02 Requirements/02 Recall]] |
| Library, search, folders, links | LIB-001–LIB-032 | [[02 Requirements/03 Library Search and Links]] |
| Reading, editing, Markdown, schema | EDT-001–EDT-032 | [[02 Requirements/04 Note Editing and Content Model]] |
| Settings, privacy, notifications, portability | SET-001–SET-010, PRI-001–PRI-014, POR-001–POR-020 | [[02 Requirements/05 Settings Privacy and Portability]] |
| Reliability, performance, security | NFR-001–NFR-036 | [[03 Quality/02 Non-Functional Requirements]] |
| Accessibility, localization, copy | A11Y-001–A11Y-022, L10N-001–L10N-014 | [[03 Quality/03 Accessibility Localization and Content]] |

## App lifecycle and navigation requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| APP-001 | The production mobile app has Today, Library, and Settings as the only primary destinations. | All three are reachable in one tap; no deferred surface appears as a primary tab. |
| APP-002 | Today opens by default on normal launch. | Fresh, warm, and post-upgrade launches resolve to Today unless a valid deep link says otherwise. |
| APP-003 | Opening the vault blocks write actions until hydration completes. | A cold-start tap cannot overwrite existing files with an empty snapshot. |
| APP-004 | Hydration failure shows an actionable read-only error and does not replace files. | UI identifies that the vault did not open and offers retry/relaunch guidance; no save is enabled. |
| APP-005 | Native Back and iOS back gesture preserve platform expectations. | Back exits the current stack level; it never depends on browser history. |
| APP-006 | Dirty capture/edit screens guard all destructive navigation paths. | Back gesture, hardware Back, Cancel, tab switch, and deep-link replacement either retain the draft or ask to discard. |
| APP-007 | Navigation is locked or safely queued during a durable write. | Repeated Back/Save/tap cannot create conflicting writes or a false success state. |
| APP-008 | Valid note deep links open the intended note or recall cue after hydration. | Warm and cold starts produce one destination without flashing/replacing unrelated content. |
| APP-009 | Invalid, stale, or deleted-note deep links end at a recoverable “not found” state. | User can return to Today or Library; no empty note is silently created. |
| APP-010 | App background/foreground transitions refresh time-sensitive due state. | Crossing midnight or a due timestamp while backgrounded updates Today within one second of resume. |
| APP-011 | Orientation follows the declared product policy per device class. | Phone behavior matches configuration; tablet layouts remain usable without clipped controls. |
| APP-012 | Every fatal state preserves a route back to a safe surface unless the vault cannot be opened. | Automated navigation tests cover missing notes, invalid parameters, save errors, and deep links. |

## End-to-end happy path

1. A first-time user sees a short promise and “What is worth remembering?”
2. They enter one sentence, optionally choose type/source/cue/return timing, and save.
3. Stories verifies the Markdown write, returns to Today, and names the next return date if scheduled.
4. At or after the due time, Today places the cue before Capture.
5. The user chooses Try to recall; the original remains hidden.
6. The user reveals, rates Not yet/Partly/Got it, and optionally adds a reflection.
7. Stories writes recall metadata and the reflection atomically, confirms the next date, and advances to the next due item.
8. The user can find the memory in Library, edit it, follow links, make a backup, and restore it without losing identity.

## Success metrics

### North-star outcome

**Weekly remembered-and-reused memories per active user (WRRM):** distinct memories rated Partly or Got it that receive a nonblank recall reflection or a newly created connection within seven calendar days.

This metric is a product definition. It must not justify uploading note content. Until privacy-preserving measurement is designed, calculate it only in opt-in research or from local aggregates explicitly shared by participants.

### Activation

- First memory saved within the first session.
- First memory scheduled for recall.
- First cue-first recall completed within 14 days.

### Quality guardrails

- Zero known silent-loss defects.
- ≥99% note/ID/link recovery in destructive backup/restore test fixtures; target 100% for valid files.
- <10% capture abandonment attributable to organization or scheduling friction in usability testing.
- Fewer than two user-reported unwanted notifications per participant per month.
- ≥8 of 10 representative users complete Book learning capture without instruction.
- Search result interaction begins within 200 ms at 5,000 notes on the reference Android device.

## Measurement plan

No content analytics, third-party tracking, advertising SDK, or cloud event pipeline is allowed by default. Use:

- moderated usability sessions;
- opt-in diary studies;
- local, inspectable counters if later approved;
- release crash/diagnostic collection only after a separate privacy decision;
- qualitative review of whether recalled memories affected a decision, behavior, or conversation.

Any telemetry proposal must define data fields, retention, consent, deletion, offline behavior, and privacy-policy changes before implementation.

## Dependencies

- Expo/React Native platform support and filesystem APIs.
- Android notification scheduling and deep-link adapters for notification scope.
- A rebuildable local search/index implementation for scale targets.
- User-visible backup destination integration before portability claims.
- Physical Android device access and an iOS simulator/device for release validation.

## Release gates

The release gate is defined in [[04 Delivery/01 Release Plan and Acceptance]]. Current implementation claims are listed only in [[04 Delivery/02 Build Status and Traceability]]. Known gaps and undecided behavior are in [[04 Delivery/03 Open Issues and Not in Build]].
