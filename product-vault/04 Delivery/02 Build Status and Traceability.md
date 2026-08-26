---
title: Build Status and Traceability
status: current_snapshot
snapshot_date: 2026-08-26
---

# Build Status and Traceability

## Shipping architecture

| Subsystem | Location | Current role |
|---|---|---|
| Android/iOS client | `apps/mobile` | Expo / React Native / Expo Router native client |
| Domain model & scheduling | `packages/core/src/model.ts`, `recall.ts` | Framework-independent memory and resurfacing rules |
| Compatibility storage codec | `packages/core/src/legacy-memory-format.ts` | Reads/writes files created by existing beta builds; not a user-facing product model |
| Device storage | `apps/mobile/src/vault/device-file-store.ts` | App-private durable local files with recovery behavior |
| Vault orchestration | `packages/core/src/vault.ts` | Serialized saves, list/read/delete, compatibility boundary |
| Daily review state | `apps/mobile/src/recall/daily-session*.ts` | Persists five-item local-day limit across navigation/relaunch |
| Search | `apps/mobile/src/navigation/library-search.ts` | Local relevance + fragment + typo-tolerant matching |
| Reminders | `apps/mobile/src/notifications/*` | Generic local notifications and Android channel/permission behavior |
| Web prototype | `src/` | Non-shipping historical/reference surface; not the Android product contract |

## Current mobile flow map

- **Today:** `apps/mobile/app/(tabs)/index.tsx`
- **Capture:** `apps/mobile/app/capture.tsx`
- **Library:** `apps/mobile/app/(tabs)/files.tsx`
- **Memory editor:** `apps/mobile/app/note/[id].tsx`
- **Settings/privacy:** `apps/mobile/app/(tabs)/settings.tsx`, `app/privacy.tsx`
- **Android action sheet:** `apps/mobile/src/ui/components/ActionSheet.tsx`
- **Deterministic cue:** `packages/core/src/story-cue.ts`
- **Progressive scheduling:** `packages/core/src/recall.ts`
- **Daily cap:** `apps/mobile/src/recall/daily-session.ts`, `daily-session-store.ts`

## Hardening changes in the current candidate

- Daily five-memory limit is persistent instead of screen-local.
- Reminder reconciliation respects a user's Today engagement instead of scheduling a second nudge a minute later.
- Recall strength is persisted separately from `nextRecallAt`, so `Tomorrow` cannot inflate later intervals.
- Restarting resurfacing resets recall status/strength.
- Capture discard/erase removes stale recovered drafts.
- Story clues avoid the ending of short memories and no longer use a recording-like icon.
- Library search ranks exact matches first and tolerates small spelling mistakes.
- Memory body uses serialized autosave; Android Back flushes the newest text.
- Share/resurface/delete actions use a bottom action sheet instead of an Android Alert with too many buttons.
- Hosted privacy policy matches current behavior.
- Mobile web/date-picker plumbing and obsolete wikilink/Markdown product code were removed from the shipping architecture.

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

Do not treat this document as evidence that a command passed. The GitHub Actions result for the exact commit is authoritative for repository-level checks. Physical Android behavior still requires device testing for keyboard resize, predictive Back, notification delivery, TalkBack, display/font scaling and update compatibility.

## Storage note

Older beta memories retain their existing app-private serialized representation so updates do not destroy user data. New UI and product behavior do not expose folders, file paths, Markdown authoring or wikilinks. A future storage migration should be explicit, reversible/tested against beta data, and independent of product UX.
