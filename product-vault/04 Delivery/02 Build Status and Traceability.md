---
title: Build Status and Traceability
status: current_snapshot
snapshot_date: 2026-08-26
---

# Build Status and Traceability

## Shipping architecture

| Subsystem | Location | Current role |
|---|---|---|
| Android client | `apps/mobile` | Expo / React Native / Expo Router Android client |
| Domain model & scheduling | `packages/core/src/model.ts`, `recall.ts` | Framework-independent memory and resurfacing rules |
| Compatibility storage codec | `packages/core/src/legacy-memory-format.ts` | Schema-v1 beta compatibility; not a user-facing product model |
| Device storage | `apps/mobile/src/vault/device-file-store.ts` | App-private durable local files with recovery behavior |
| Vault orchestration | `packages/core/src/vault.ts` | Serialized saves, list/read/delete, compatibility boundary |
| Daily scheduled-review state | `apps/mobile/src/recall/daily-session*.ts` | Persists five-item local-day limit across navigation/relaunch |
| Voluntary practice selection | `apps/mobile/src/recall/practice.ts` | Picks a useful existing story without mutating recall state |
| Search | `apps/mobile/src/navigation/library-search.ts` | Local relevance + fragment + typo-tolerant matching |
| Reminders | `apps/mobile/src/notifications/*` | Android generic local notifications and permission/channel behavior |
| Web prototype | `src/` | Non-shipping historical/reference surface; not the Android product contract |

## Current mobile flow map

- **Today / scheduled recall / Try one now:** `apps/mobile/app/(tabs)/index.tsx`
- **Capture + first-save Try telling:** `apps/mobile/app/capture.tsx`
- **Read-only voluntary practice:** `apps/mobile/app/practice/[id].tsx`
- **Library:** `apps/mobile/app/(tabs)/files.tsx`
- **Memory editor + Try telling:** `apps/mobile/app/note/[id].tsx`
- **Settings/privacy:** `apps/mobile/app/(tabs)/settings.tsx`, `app/privacy.tsx`
- **Android action sheet:** `apps/mobile/src/ui/components/ActionSheet.tsx`
- **Deterministic cue:** `packages/core/src/story-cue.ts`
- **Progressive scheduling:** `packages/core/src/recall.ts`

## Current candidate changes

### Product identity
- First save demonstrates clue → tell → reveal immediately through `Try telling it now` while preserving the real +3-day return.
- Today no longer duplicates Library with a Recent feed.
- Nothing-due Today offers `Try one now` so the core product remains useful between scheduled returns.
- Saved memories expose `Try telling` in the action sheet.
- Voluntary practice never calls save/rating/session APIs and therefore cannot alter recall status, strength, due date or the five-item scheduled cap.

### Reliability / compatibility
- Daily five-memory scheduled limit remains persistent instead of screen-local.
- Reminder reconciliation respects a user's Today engagement instead of scheduling an immediate second nag.
- Recall strength is persisted separately from `nextRecallAt`.
- `Tomorrow` and `Stop resurfacing` freeze inferred strength for older memories before changing the due date.
- Compatibility writes remain schema v1 because `reviewStrengthDays` is additive; this preserves beta rollback compatibility.
- Capture discard/erase removes stale recovered drafts.
- Memory body uses serialized autosave; Android Back flushes newest text.

### Android-only cleanup and size controls
- App config targets Android only.
- Release builds enable R8/code minification and Android resource shrinking through `expo-build-properties`.
- Preview stays APK; production stays AAB.
- Removed unused `expo-dev-client`, `react-native-reanimated` and `react-native-worklets` dependencies.
- `expo-font` remains because `expo-symbols` declares it as a required peer; Expo Doctor protects this dependency.
- Removed obsolete `Chip` component and web/iOS runtime branches from shipping persistence, notification, editor, tab and navigation paths.
- Generated `apps/mobile/android` remains ignored; cloud/prebuild generation is authoritative rather than stale committed native files.

## Automated verification entry points

```bash
npm ci
npm --prefix apps/mobile install
npm test
npm run lint
npm run build
npm --prefix apps/mobile exec tsc -- --noEmit
cd apps/mobile && npx expo-doctor
```

`.github/workflows/quality.yml` runs these checks for `main` and pull requests to `main`.

## Evidence status

This document describes intended/current code, not proof that a command passed. The GitHub Actions result for the exact candidate commit is authoritative for repository-level checks. Physical Android testing is still required for install/update behavior, keyboard resize, predictive Back, notification delivery, TalkBack, display/font scaling and actual packaged size.

## Size measurement note

A universal internal-test APK can be much larger than the install delivered by Google Play from the production AAB. Compare like-for-like artifacts and use Play's generated APK/install-size reporting or APK Analyzer before claiming a size reduction.
