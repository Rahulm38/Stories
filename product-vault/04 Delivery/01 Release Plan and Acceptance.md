---
title: Release Plan and Acceptance
document_type: delivery
status: active
last_reviewed: 2026-08-24
---

# Release plan and acceptance

## Delivery principle

Ship horizontal, device-testable slices. A slice is done only when the user can complete its outcome and failure/relaunch behavior is verified. Web export or TypeScript success is useful evidence but not native readiness.

## Milestones

### M0 — Specification and risk closure

- Approve product boundary, data-loss severity policy, date semantics, deletion policy, and v1 backup format.
- Name reference Android hardware and supported OS range.
- Convert P0/P1 items from [[03 Quality/01 Edge Cases and Error Handling]] into executable tests or explicit release blockers.

Exit: no unresolved decision can change the storage schema or core recall loop unnoticed.

### M1 — Trustworthy local memory

- Capture/edit/read Library on physical Android.
- Verified atomic writes, artifact recovery, duplicate identity/path handling, dirty guards.
- Search and links work at 5,000-note fixture.
- Schema version and migration harness exist.

Exit: force-stop and injected-failure matrix has zero silent loss; performance budgets pass.

### M2 — Recall that earns its place

- Complete cue → attempt → reveal → rate → reflection in app.
- Validate interval/date/time-zone semantics.
- Conduct at least 10 representative usability sessions.

Exit: ≥8/10 can complete capture and recall without instruction; qualitative evidence indicates value beyond rereading.

### M3 — Reminders without dependency

- Contextual permission flow, generic previews, deep links, bounded scheduling, reconciliation.
- Denied permission path remains fully usable.

Exit: device test matrix has no duplicate/stale reminder and cold-start deep links open correct cue.

### M4 — Recovery and portability

- User-visible backup, verified archive, restore/merge policy, pre-restore backup, migration/index/notification rebuild.
- Uninstall/clear-data limitation disclosed.

Exit: valid fixture recovery is 100%; corrupt/malicious fixtures never alter active vault.

### M5 — Store-ready hardening

- Android accessibility and compatibility matrix.
- Privacy policy/Data safety/permissions/store copy aligned.
- Release build, upgrade, backup/restore, and crash-free smoke.
- iOS compile/smoke to preserve architecture, without claiming iOS release readiness.

Exit: every launch-blocking gate below passes.

## Launch-blocking gates

| Gate | Pass condition |
| --- | --- |
| Product | Core loop usability evidence exists; no deferred feature is required to explain value. |
| Data safety | No open P0; no P1 involving loss, corruption, wrong-note write, unsafe path, or restore. |
| Capture | Body-only, all kinds/timings, failures, rapid taps, dirty navigation, low storage pass on device. |
| Recall | Cue secrecy, ordering, grading, deferral, errors, time zones/DST, relaunch pass. |
| Library/editor | Search/link/move/parse fixtures and 5,000-note performance pass. |
| Notifications | If shipped: denial, privacy, duplicates, edit/delete/grade, reboot/update, cold start pass. If not shipped: UI/store copy clearly says unavailable. |
| Recovery | User can create and restore a verified backup before the product claims portability or is entrusted with irreplaceable content. |
| Accessibility | No open P0/P1; TalkBack and 200% font device matrix pass. |
| Privacy | Runtime network/dependency audit, offline policy, privacy policy, and store disclosure agree. |
| Distribution | Signed release build installs/upgrades; app ID/version/backup configuration validated. |

## Test suites

### Automated

- Framework-free core unit tests for parser, serializer, identity, paths, moves/rollback, links, recall.
- Mobile regression tests for route parameters, copy/date presentation, adapter failures, hydration gate, external links.
- Web behavior regressions where the reference client shares logic.
- Static typecheck, lint, production web build, Expo export/config validation.
- Generated fixtures for 0/1/5,000 notes, Unicode, duplicates, corruption, and large content.

### Physical Android

- Fresh install, upgrade, force-stop/relaunch, app switch, reboot.
- Gesture/three-button navigation; small/large screen; keyboard and selection.
- TalkBack, 200% font, reduced motion/high contrast where supported.
- Offline, low storage, document picker, backup/restore.
- Notification permission and scheduling lifecycle if included.
- External link handler success/failure.

### iOS preservation check

- Compile and launch shared Expo app.
- Safe areas, back gesture, keyboard, VoiceOver/Dynamic Type smoke.
- Files/document picker and notification adapter compile behavior.

This is not iOS release sign-off.

## Rollout

1. Internal test track with synthetic/non-sensitive notes.
2. Closed test with explicit backup warning and structured interviews.
3. Staged production only after crash/data-loss review and store compliance.
4. Halt/rollback criteria: any silent-loss, wrong-note mutation, restore corruption, private notification leak, or unsafe path defect.

## Definition of done for any requirement

- Acceptance criterion is executable or manually scripted.
- Happy, empty, loading, error, retry, offline, interruption, and accessibility states are covered where applicable.
- Product copy and privacy implications are reviewed.
- Migration/backward-compatibility impact is addressed.
- [[04 Delivery/02 Build Status and Traceability]] is updated with evidence.
- Any remaining gap appears in [[04 Delivery/03 Open Issues and Not in Build]].
