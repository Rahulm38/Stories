---
title: Open Issues and Not in Build
document_type: gap_register
status: active
last_reviewed: 2026-08-24
---

# Open issues and PRD items not in the build

## How to read

This register lists behavior required or explicitly discussed in the PRD that is absent, partial, unverified, or undecided in the current build. It is not a promise that all deferred items should be built now.

Priority:

- **P0 before trusted release:** data safety, path/security, privacy disclosure.
- **P1 before v1 launch:** core-loop completeness and device quality.
- **P2 after product evidence:** useful but not launch-critical unless research changes priority.
- **Deferred:** intentionally outside v1.

## P0 — trust and data safety gaps

| Issue | PRD refs | Current gap | Required resolution |
| --- | --- | --- | --- |
| OI-001 Schema version/migration | EDT-032, NFR-031 | `schemaVersion` frontmatter is written and parsed with an idempotent migration seam; interrupted-upgrade and future-version migration tests are still missing. | Define v1 schema fully, add backed-up idempotent migration and interrupted-upgrade tests. |
| OI-002 User backup/restore | POR-001–020, SET-006 | No export, backup, restore, merge, or pre-restore safety flow. | Design archive/manifest/checksum/conflicts; implement and fault-test before portability claim. |
| OI-003 Malformed file quarantine | EDT-029 | Malformed frontmatter is detected and quarantined in memory: raw content preserved, no automatic rewrite, excluded from link targets and recall. No visible on-device diagnostic/recovery surface yet. | Provide a recovery state users can see and act on; keep blocking automatic destructive rewrite. |
| OI-004 Concurrent edit conflict | EDT-018 | In-memory save can last-write-win against an external/file-level change. | Compare version/hash and offer explicit resolution. |
| OI-005 Delete/trash recovery | EDT-019 | Delete ships as explicit confirmation plus permanent removal with honest copy; local trash, restore, and Empty Trash remain unbuilt pending the tested retention policy (D-013). | Implement local trash/restore/permanent-delete lifecycle only after tests; restore must reuse the stable ID. |
| OI-006 Restore/import security | NFR-022, POR-006 | No restore code or hostile archive validation. | Treat as blocker for backup/restore release. |
| OI-007 Practical data limits | NFR-018 | No documented limits or oversized-note behavior. | Benchmark, define non-silent limits and recovery/export behavior. |
| OI-008 Uninstall/data-loss disclosure | PRI-010 | Privacy text mentions uninstall, but Settings does not prominently connect lack of backup to irrecoverability. | Add honest lifecycle/backup warning and usability-check it. |

## P1 — core v1 gaps

| Issue | PRD refs | Current gap | Required resolution |
| --- | --- | --- | --- |
| OI-009 Android device verification | Release gates | Current environment/history does not establish physical/emulator pass. | Run full matrix: keyboard, Back, force-stop, storage, safe areas, TalkBack, font scale, offline. |
| OI-010 iOS preservation check | NFR-029 | Shared code exists; simulator/device compile and behavior not established. | Compile/launch and smoke platform seams before architecture claim ages. |
| OI-011 Draft recovery after process death | CAP-023 | Dirty draft is memory-only. | Decide autosave; implement local recovery/discard and privacy lifecycle. |
| OI-012 Native reminders | REC-N01–N10 | Explicitly not available. | Add contextual permission, privacy-safe scheduling, deep links, reconciliation, diagnostics. |
| OI-013 Notification deep links | APP-008, REC-N05 | No notification adapter/deep-link destination. | Cold/warm/terminated tests after hydration. |
| OI-014 SQLite/rebuildable index | EDT-031 | In-memory scan only. | Implement only if 5,000-note performance proves need; source remains Markdown. |
| OI-015 Scale/performance evidence | NFR-009–020 | No reference device or measured p95. | Generate 5,000-note/50,000-link fixture and profile. |
| OI-017 Date/time semantics | REC-022–023, L10N-004 | ISO timestamps and local date edit exist; full DST/travel/clock policy is not approved/tested. | Specify instant vs local-day behavior and test zones/boundaries. |
| OI-018 Recall outcome idempotency | REC-031 | UI is single-flight, but no durable operation ID/history prevents duplicate application across interruption/retry. | Decide whether storage transaction plus version is sufficient or add attempt identity. |
| OI-019 Active recall lifecycle | REC-019–020, 029 | In-process ID/version checks exist; process death, Back/reflection and app-switcher privacy are incomplete. | Define and test resume/leave/privacy behavior. |
| OI-020 Accessibility validation | A11Y-001–022 | Semantic work exists but no complete TalkBack/200% matrix. | Audit and block launch on P0/P1. |
| OI-021 Localization/RTL | L10N-001–014 | English strings inline; no pseudo-localization/RTL framework. | At minimum centralize strings and validate globally safe data/path behavior. |
| OI-022 Runtime privacy/network audit | PRI-001–014 | Local design and policy exist; runtime/dependency proof not recorded. | Inspect release build traffic, logs, permissions, SDKs, Data safety. |
| OI-023 Corrupt partial-vault visibility | NFR-007 | Device scanner skips an unreadable file silently. | Keep healthy vault usable but surface a redacted diagnostic/recovery count. |
| OI-024 Settings controls | SET-003–007 | Settings is mostly informational. | Add default recall preference, reminder settings, backup/restore, diagnostics as corresponding features ship. |
| OI-025 Folder-kind move semantics | EDT-013 | Changing kind currently moves to managed root; custom-folder confirmation/preservation needs product test. | Implement explicit rule/UI. |
| OI-026 Full Markdown fallback tests | EDT-002–003 | Renderer supports a subset; unsupported syntax behavior is not systematically tested. | Golden fixtures ensure readable/preserved fallback and no execution. |

## P2 — valuable after launch evidence

| Issue | PRD refs | Decision rule |
| --- | --- | --- |
| OI-027 Typed recall attempt | Recall open question | Add only if it increases genuine retrieval without adding study friction; define retention/privacy. |
| OI-028 Default interval preference | SET-003 | Build after research indicates three days is frequently wrong. |
| OI-029 Preferred reminder time/daily cap | Recall open questions | Requires notification user research and time-zone policy. |
| OI-030 One-note share/export | POR-016 | Add after complete-vault backup, with explicit privacy handoff. |
| OI-031 User-selected shared folder | Platform lifecycle | Add only after permissions, revocation, conflicts, and atomic-write behavior are designed. |
| OI-032 Folder management UI | LIB folder behavior | Promote only if observed users need more than type roots and imported nested folders. |
| OI-033 Local diagnostics UI | SET-007 | Implement alongside notifications/index/backup where it can report actionable state. |
| OI-034 Privacy-safe local aggregates | Master measurement | Add only with inspectability, consent decision, and zero content collection. |

## Deferred, intentionally not in build

| Issue | Why deferred |
| --- | --- |
| OI-D01 Global graph/backlink dashboard | Link usage has not proven it improves recall; risks knowledge-management bloat. |
| OI-D02 AI/chat/summaries/generated cues | Changes privacy, cost, trust, and product positioning before core recall is proven. |
| OI-D03 Cloud accounts/cross-device sync | Requires identity, encryption, recovery, conflicts, deletion, and policy design. |
| OI-D04 Collaboration/publishing | Outside private personal-memory wedge. |
| OI-D05 Tasks/calendar/habits/streaks | Conflicts with calm, non-compulsive product character. |
| OI-D06 Attachments/camera/audio/PDF/web clipper | Expands storage, backup, permissions, rendering, and privacy surface. |
| OI-D07 Rich text/themes/plugins | Markdown text-first loop comes first; no ecosystem compatibility claim. |
| OI-D08 Advanced SRS/decks/cloze | Stories is recall support, not an exam/deck manager. |

## Open product decisions

| Decision | Needed by | Recommendation |
| --- | --- | --- |
| Exact v1 backup format and Merge semantics | Before M4 design | Versioned archive with manifest/checksums; Replace first, add Merge only with conflict UI. |
| Draft autosave retention | Before M1 sign-off | Local encrypted-by-OS draft, one per composer, restore prompt, clear on save/discard. |
| Local-day vs elapsed-time recall | Before notification work | Treat user-selected dates as local calendar intent; store instant plus zone/semantic version if needed. |
| Delete retention | Before delete | App-private trash for 30 days, manual empty, restore same ID. |
| Minimum Android OS/reference device | Before performance/accessibility sign-off | Choose based on intended market and Expo support; include a mid-range low-memory device. |
| iOS release timing | After Android M5 | Preserve compile parity now; decide distribution only after Android evidence. |
| Telemetry | Before any SDK | Prefer no third-party analytics; use opt-in research/local aggregates. |

## Exit rule

An issue leaves this file only when its requirement is removed/deferred by an approved decision or its implementation and verification evidence are recorded in [[04 Delivery/02 Build Status and Traceability]].
