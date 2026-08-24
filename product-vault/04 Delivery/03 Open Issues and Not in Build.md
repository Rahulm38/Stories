---
title: Open Issues and Product Gaps
status: active
last_reviewed: 2026-08-24
---

# Open Issues and Product Gaps

This register tracks missing, partial, and planned capabilities across release milestones.

---

## 🔴 P0 — Trust, Data Safety, & Launch Blockers
 
| Area | Current Gap | Required Action | Status |
|---|---|---|---|
| **Physical Device Verification** | Automated tests pass (79/79), but physical Android verification is required. | Verify on physical device: TalkBack, 200% font scaling, keyboard interaction, safe areas. | Scheduled for M4 |
| **Play Store Listing Assets** | Store presence required for distribution. | Prepare store listing screenshots, icon assets, and Data Safety form. | Scheduled for M4 |

---

## 🟡 P1 — Implemented in v1 Foundation

| Area | Feature Delivered | File Location |
|---|---|---|
| **Onboarding Aha Moment** | 1-tap practice recall prompt on Day 1 (and on zero notes) eliminates the 3-day silent churn gap. | `apps/mobile/app/capture.tsx` & `(tabs)/index.tsx` |
| **Vault Backup & Export** | 1-click Markdown vault export with automatic web/native file creation. | `apps/mobile/src/vault/vault-bundle.ts` & `vault-export.ts` |
| **Native Device Reminders** | Offline local reminder service with Android 13+ permission handling and deep link recovery. | `apps/mobile/src/notifications/reminder-service.ts` & `device-permissions.ts` |
| **Personalized Recall Cues** | Dynamic questions formatted from book author/title or experience context. | `apps/mobile/src/recall/presentation.ts` |
| **On-Demand Practice** | 3-stage active recall practice accessible directly from any memory reader view. | `apps/mobile/app/note/[id].tsx` |
| **Library View Toggle** | Segmented view toggle between *By folder* tree and *All memories* list with clean snippets. | `apps/mobile/app/(tabs)/files.tsx` & `src/navigation/snippet.ts` |
| **Vocabulary & Privacy Audit** | Standardized copy to "memory", "Library", and "Stored privately on this device". | All screens & `settings.tsx` |

---

## 🟢 P2 — Post-Launch Opportunities

- **Related Memory Prompts**: Suggest connected insights after completing a recall reflection.
- **Progress Summary**: Factual "Your memories" overview (memories saved, practiced, next due).
- **Dark Mode**: System-aware theme toggle.
- **One-Note Share**: Export individual Markdown memories as plain text or `.md`.

---

## ⛔ Explicitly Deferred (Not in Scope)

- **AI Chat / Summarization**: Contradicts personal reflection wedge and increases privacy surface.
- **Cloud Sync & Social Accounts**: Introduces cloud security liabilities and network lock-in.
- **Tasks, Calendars, & Streaks**: Destroys calm, restorative product character.
- **Global Graph Visualizations**: High complexity with unproven recall value for v1.
