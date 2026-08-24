---
title: Build Status and Traceability
status: current_snapshot
snapshot_date: 2026-08-24
---

# Build Status and Traceability

## Architecture Snapshot

| Subsystem | Tech Stack / Location | Current Implementation Status |
|---|---|---|
| **Mobile App Client** | `apps/mobile` (Expo SDK 57, React Native, Expo Router) | Complete UI foundation (Today, Capture, Library, Reader, Settings) |
| **Domain Logic Core** | `packages/core` (Framework-agnostic TypeScript) | Model, Markdown parser/serializer, Link resolution, Spaced recall engine |
| **Device Storage** | `apps/mobile/src/vault/device-file-store.ts` | App-private Markdown vault, atomic writes, `.tmp`/`.bak` crash recovery |
| **Web Reference** | `src/` (Next.js 16 App Router) | Reference prototype with browser localStorage adapter |
| **Native Reminders** | `apps/mobile/src/notifications/reminder-service.ts` | Local device reminder scheduling service & settings toggle |
| **1-Click Vault Export** | `apps/mobile/src/vault/vault-bundle.ts` & `vault-export.ts` | Plain Markdown vault backup export for web & mobile |

---

## Current Verification Checklist

- [x] **Monorepo Tests**: 79/79 passing (`npm run test`)
  - **Core Domain Tests**: 39/39 passing (`npm run test:core`)
    - Frontmatter schema versioning & migration
    - Frontmatter quarantine on malformed external edits
    - Atomic rename & backlink rewriting
    - Recall interval calculations (1d / 4d / 14d) & tie-breakers
  - **Mobile Regression Tests**: 28/28 passing (`npm --prefix apps/mobile run test:regressions`)
    - Route state parsing for capture and note views
    - Personalized recall cues based on memory kind, source, and custom prompt
    - Next upcoming recall anticipation message calculation
    - Date picker & localized calendar date formatting
    - Safe link scheme handling & external browser launch
    - Cold-start vault hydration safety
    - Vault backup bundling and filename formatting
    - Device reminder time formatting and daily schedule math
    - Empty vault state reset after deleting all previous notes
    - Clean Markdown snippet stripping for library previews
  - **Web Regression Tests**: 12/12 passing (`npm run test:web`)
- [x] **Static Typecheck & Lint**: Zero TypeScript or ESLint errors (`npm run lint`)
- [x] **Web Bundle Scan**: Verified no product-vault docs or `.obsidian` files in production exports

---

## Code-to-Feature Map

- **Today Screen & Day 1 Onboarding**: `apps/mobile/app/(tabs)/index.tsx` & `packages/core/src/recall.ts`
- **Fast Capture Composer**: `apps/mobile/app/capture.tsx` & `apps/mobile/src/capture/options.ts`
- **Library (By Folder vs All Memories View)**: `apps/mobile/app/(tabs)/files.tsx` & `apps/mobile/src/navigation/snippet.ts`
- **Memory Reader & Practice Recall**: `apps/mobile/app/note/[id].tsx` & `apps/mobile/src/ui/MarkdownEditor.tsx`
- **Vault Export & Backup**: `apps/mobile/src/vault/vault-bundle.ts` & `apps/mobile/src/vault/vault-export.ts`
- **Device Reminders & Permissions**: `apps/mobile/src/notifications/reminder-service.ts` & `device-permissions.ts`
- **Settings & Memory Stats**: `apps/mobile/app/(tabs)/settings.tsx` & `apps/mobile/app/privacy.tsx`

