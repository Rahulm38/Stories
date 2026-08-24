---
title: Release Plan and Acceptance
status: active
last_reviewed: 2026-08-24
---

# Release Plan and Acceptance

## Delivery Principle

Ship vertical, device-tested product slices. A slice is complete only when the user journey can be executed seamlessly and failure/relaunch scenarios are verified.

---

## Release Milestones & Gates

### M0: Core Foundations & Privacy Invariants
- [x] Functional domain core (`@core`) with 0 external runtime dependencies.
- [x] Atomic Markdown filesystem persistence with `.tmp`/`.bak` crash recovery.
- [x] Zero-network guarantee with Android cloud backup disabled.

### M1: Onboarding & First-Session Loop (P0)
- [x] **First-Session Aha Experience**: Instant practice recall option on Day 1 (and upon deleting all memories).
- [x] **Warm Empty State**: Clear value proposition explaining the capture-and-recall companion.
- [x] **Capture Flow**: One-field fast capture, auto-focus, clean "Memory details" disclosure.

### M2: Active Recall & Calm Habit (P0)
- [x] In-app 3-stage loop: Contextual Cue $\rightarrow$ Hidden Attempt $\rightarrow$ Reveal & Rate.
- [x] **Personalized Cues**: Dynamic questions using book source or experience context.
- [x] **Anticipation Cue**: Today shows *"Next memory returns on [Date]"* when queue is clear.
- [x] **On-Demand Practice**: Practice recall anytime directly from the Memory Reader.

### M3: Device Reminders & Portability (P0)
- [x] **Native Local Reminders**: Privacy-safe notifications with contextual Android 13+ permissions and deep link recovery.
- [x] **1-Click Vault Export**: Export timestamped Markdown backup archive via browser download on web and document storage on native.
- [x] **Library View Toggle**: Segmented toggle between *By folder* tree and flat *All memories* list with clean snippet previews.
- [x] **Factual Memory Statistics**: Calm 3-stat overview (Saved, Practiced, Due today) in Settings.

### M4: Polish & Store Hardening (P1)
- [x] **Vocabulary Audit**: Standardized 100% adherence to "memory", "Library", and non-guilt copy.
- [x] **Automated Monorepo Suite**: 79/79 passing unit, mobile regression, and web regression tests with 0 lint errors.
- [ ] **Physical Android Testing**: Physical device TalkBack screen-reader walkthrough and 200% font scaling tests.
- [ ] **Play Store Listing**: Approved assets, privacy policy URL, and Data Safety declaration.

---

## Launch-Blocking Gates

| Gate | Pass Condition | Status |
|---|---|---|
| **Data Safety** | Zero silent loss across save, rename, edit, backgrounding, or process kill | Verified (79/79 tests passing) |
| **First-Session Value** | User completes a capture and experiences recall within Session 1 | Verified (Day 1 practice flow) |
| **Portability** | User can export their full vault with 1 tap | Verified (1-click export) |
| **Notifications** | Local alarms schedule accurately without leaking note text on lock screen | Verified (reminder service & permissions) |
| **Accessibility** | 48dp touch targets, TalkBack semantics, and 200% font scaling | Automated pass; physical audit pending |
