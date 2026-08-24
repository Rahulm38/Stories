---
title: Build Status and Traceability
document_type: delivery_status
status: current_snapshot
snapshot_date: 2026-08-24
---

# Build status and traceability

## Important

This is a code-informed snapshot, not a release declaration. “Implemented” means the behavior is present in the inspected code. “Verified” must name evidence. Native device claims remain separate from web/type/build checks.

## Current architecture

| Area | Current state | Evidence |
| --- | --- | --- |
| Native client | Implemented in code | `apps/mobile`: Expo SDK 57, React Native, Expo Router. |
| Primary navigation | Implemented in code | Today, Library, Settings tabs; note/capture/privacy stack routes. |
| Storage source of truth | Implemented in code | App-private `stories-vault`, one Markdown file per memory. |
| Shared core | Implemented in code | `packages/core`: model, Markdown, vault, links, recall. |
| Browser preview adapter | Implemented in code | Browser/local storage adapter for preview only. |
| SQLite index | Not built | Current list/search operate from in-memory parsed notes. |
| Native notifications | Not built | Settings explicitly says device reminders are unavailable. |
| Backup/restore | Not built | No vault API or Settings flow. |

## Requirement traceability

| Requirement group | Status | Current evidence / limits |
| --- | --- | --- |
| APP-001–003 | Implemented | Three tabs, Today default, hydration state/save gate. |
| APP-004–005 | Implemented in code | Vault-open errors and native stack/back behavior exist; device verification required. |
| APP-006–007 | Partial | Native unsaved-change guard and single-flight saves exist; web dirty guard is intentionally absent and all navigation/device races are not verified. |
| APP-008–012 | Partial/not built | Internal note routing exists. Notification deep links, stale-deep-link reconciliation, and broad lifecycle tests are missing. |
| CAP-001–021 | Mostly implemented | Body-only capture, kinds, defaults, source, cue, details, verified save adapter, collision paths. Practical size limits/device keyboard remain unverified. |
| CAP-022 | Partial | In-process state exists; rotation/device interruption not verified. |
| CAP-023 | Not built | No recoverable process-death draft autosave. |
| CAP-024 | Partial | Architecture is offline; physical airplane-mode test outstanding. |
| REC-001–018 | Implemented in code | Due ordering, cue/attempt/reveal, 1/4/14-day outcomes, Tomorrow, reflection, errors and single-flight. |
| REC-019–023 | Partial | Active ID/version guards and focus refresh exist; time-zone/DST/process lifecycle matrix incomplete. |
| REC-024–034 | Partial | In-app queue works without reminder code; disable via date clear exists in edit. Idempotency/versioned scheduling policy and large-body tests incomplete. |
| REC-N01–N10 | Not built | No notification adapter, permission flow, scheduling, reconciliation, or deep link. |
| LIB-001–020 | Mostly implemented | Empty/nonempty Library, nested folders, literal search fields, duplicate-title path, no-results. Index/performance/Unicode device scale not proven. |
| LIB-021–030 | Mostly implemented | Suggestions, aliases, ambiguity, missing-note draft, move rewrite/rollback, OS handoff for http(s)/mailto/tel/sms. Unsupported-scheme rejection needs explicit handling. |
| LIB-031 | Implemented in code | Link targets classify as local wikilinks, allowed external schemes (http, https, mailto, tel, sms), or rejected unsafe schemes; classification is shared with the core. Device handler matrix unverified. |
| LIB-032 | Implemented as scope | No graph primary surface. |
| EDT-001–017 | Mostly implemented | Read/edit modes, Markdown subset, metadata, date validation, clear fields, suggestions, move rollback. Markdown rendering is intentionally partial. |
| EDT-018–019 | Partial | No external-concurrent-edit conflict UI. Delete exists as explicit confirmation plus permanent removal; local trash/restore remains unbuilt pending the tested retention policy. |
| EDT-020 | Partial | React text rendering avoids raw HTML execution; explicit hostile Markdown security suite is missing. |
| EDT-021–028 | Mostly implemented | Stable ID, runtime duplicate-ID handling, normalization, timestamp sorting, unknown/multiline frontmatter preservation, BOM/CRLF parsing. |
| EDT-029 | Partial | Malformed frontmatter is classified and quarantined in memory with raw bytes preserved and excluded from automatic rewrites and link targeting; a dedicated on-device diagnostic/recovery surface is still missing. |
| EDT-030 | Implemented in device adapter | Temp, backup, read-back, move, rollback, startup artifact recovery, and file deletion; device fault injection still required. |
| EDT-031 | Not built | No SQLite index exists to rebuild. |
| EDT-032 | Partial | `schemaVersion` frontmatter is written and parsed with a migration seam (`SCHEMA_VERSION`, `migrateParsedNote`); interrupted-upgrade and multi-version migration tests remain. |
| SET-001–002, SET-005, SET-008, SET-010 | Implemented informationally | Settings describes recall default, reminder unavailability, local location, privacy. |
| SET-003–004, SET-006–007, SET-009 | Not built/partial | No preferences, reminder controls, backup/restore, diagnostics, or destructive controls. |
| PRI-001–010 | Partial | Local/no-account design, in-app privacy page, Android backup disabled. Runtime network/dependency audit and full disclosure/device lifecycle review outstanding. |
| PRI-011–014 | Policy only | No telemetry/sync exists; release processes not automated. |
| POR-001–020 | Not built | Product currently has file-format portability, not user-operable portability. |
| NFR-001–008 | Partial | Core/adapters include meaningful reliability tests; device fault/upgrade/scale evidence missing. |
| NFR-009–020 | Not verified | No named reference hardware or formal performance/limit results. |
| NFR-021–024 | Partial | Device path traversal rejection and safe React text exist; import security and explicit scheme rejection incomplete. |
| NFR-025–036 | Partial | Low dependency footprint and deep core seam exist; audits, schema versioning, platform matrix, bundle inspection must be release tasks. |
| A11Y-001–022 | Partial | Many roles, labels, states, safe areas, native controls exist. TalkBack/VoiceOver, 200% font, focus, contrast, and notification checks are not complete. |
| L10N-001–014 | Partial | Locale display and Unicode-aware core exist; string centralization, plural framework, RTL/pseudo-localization, DST matrix not complete. |

## Current code-to-feature map

- Today/recall: `apps/mobile/app/(tabs)/index.tsx`, `packages/core/src/recall.ts`
- Capture: `apps/mobile/app/capture.tsx`, `apps/mobile/src/capture/options.ts`
- Library/search: `apps/mobile/app/(tabs)/files.tsx`, `apps/mobile/src/navigation/library-search.ts`
- Read/edit/links: `apps/mobile/app/note/[id].tsx`, `apps/mobile/src/ui/MarkdownBody.tsx`, `packages/core/src/links.ts`
- Recall date entry: `apps/mobile/src/ui/RecallDatePicker.tsx`, `apps/mobile/src/navigation/local-date.ts`
- Delete flow: `apps/mobile/app/note/[id].tsx` (confirm + permanent delete), `packages/core/src/vault.ts` (`remove`), store `delete` in both adapters
- Vault/schema/quarantine: `packages/core/src/model.ts`, `packages/core/src/markdown.ts`, `packages/core/src/vault.ts`
- Device persistence: `apps/mobile/src/vault/device-file-store.ts`, `apps/mobile/src/vault/provider.tsx`
- Settings/privacy: `apps/mobile/app/(tabs)/settings.tsx`, `apps/mobile/app/privacy.tsx`
- Automated checks: `packages/core/src/core.test.ts`, `apps/mobile/scripts/mobile-regressions.mjs`, `src/lib/web-regressions.test.ts`

## Verification ledger

Update this table only with commands/results from the current checkout.

| Date | Evidence | Result | Scope limit |
| --- | --- | --- | --- |
| 2026-08-24 | Repository/code inspection | Complete | Does not prove runtime/device behavior. |
| 2026-08-24 | `npm run test:core` | Pass: 35/35 | Adds schema version round-trip, quarantine classification/exclusion, removal serialization, link-target classification. Framework-free core only. |
| 2026-08-24 | `npm --prefix apps/mobile run test:regressions` | Pass: 22/22 | Adds date-picker/local-date round-trip, browser-store delete, unsupported-scheme rejection. Node reported a nonblocking module-type warning. |
| 2026-08-24 | `npm run lint` | Pass | Static lint, not runtime behavior. |
| 2026-08-24 | Mobile TypeScript `--noEmit` | Pass | Type safety, not device behavior. |
| 2026-08-24 | Recall date picker code review | Native dialog (Android) / inline calendar (iOS), clear affordance, semantic tokens, accessibility props present. | No on-device keyboard/TalkBack/font-scale run in this environment. |
| 2026-08-24 | Delete flow code review | Confirmation names the memory and states permanence; double-tap guarded; Library/Today update via subscription; hardware Back lands in Library via deterministic navigation. | Physical Android verification still required before any release claim. |
| 2026-08-24 | `npx next build --webpack` | Pass: 12 routes | Web reference client only. Default Turbopack was sandbox-blocked while binding a process port. |
| 2026-08-24 | `npx expo export --platform web --clear` | Pass: 11 static routes | Metro/web export, not Android/iOS device behavior. |
| 2026-08-24 | Generated-artifact content scan | Pass | No product-vault markers found in Expo export or Next build output. |
| 2026-08-24 | Android/iOS tool availability | Blocked | No `adb`/emulator command and no `xcrun simctl`; device verification not performed. |

Historical checks belong in repository docs; they are not automatically current after new changes.
