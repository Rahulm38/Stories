---
title: Settings Privacy and Portability Requirements
document_type: feature_prd
status: active
last_reviewed: 2026-08-24
---

# Settings, privacy, notifications, and portability

## Settings requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| SET-001 | Settings uses grouped native rows and plain language. | Implementation details appear only when they help recovery/diagnosis. |
| SET-002 | Remembering shows the default return interval and whether device reminders are available/enabled. | Values match actual behavior, not roadmap intent. |
| SET-003 | Users can change the default new-memory return without altering existing notes. | Confirmation explains prospective effect. |
| SET-004 | Capture prompts and recall reminders are independently controlled. | Each setting reflects OS permission and app preference. |
| SET-005 | Storage shows local status, approximate note count/size, and understandable vault location. | Copy warns that app-private may be erased on uninstall/clear-data. |
| SET-006 | Backup and Restore are first-class storage actions before portability is claimed. | Both pass fixtures in POR requirements. |
| SET-007 | Diagnostics can report last successful vault open, index state, pending reminder count, and last backup without exposing note content. | User can copy a redacted report. |
| SET-008 | Privacy policy is available offline in app and matches store disclosure. | Version/date is shown. |
| SET-009 | Destructive actions use explicit confirmation and never share one tap target with routine settings. | Clear data/empty trash cannot be triggered accidentally. |
| SET-010 | Unsupported/not-yet-built controls are labeled honestly or omitted. | No tappable dead rows. |

## Privacy requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| PRI-001 | Core use requires no account and no network. | Capture, recall, search, edit, backup-to-local destination work offline. |
| PRI-002 | Notes, cues, sources, reflections, search queries, and link graph remain on-device by default. | Network audit confirms zero transmission. |
| PRI-003 | No advertising, cross-app tracking, or third-party content analytics SDK ships in v1. | Dependency and runtime network review passes. |
| PRI-004 | Notification previews are generic by default. | Lock screen does not reveal body/source/cue unless user opts in. |
| PRI-005 | OS backup behavior is documented accurately per platform. | App copy, config, privacy policy, and store Data safety agree. |
| PRI-006 | Android cloud backup defaults to disabled until encrypted backup behavior is decided. | Manifest/config validation confirms. |
| PRI-007 | App-private files are protected by OS sandbox but not described as end-to-end encrypted. | Privacy copy states device/security dependency. |
| PRI-008 | Logs and diagnostics exclude note content, source, cue, search query, and full paths by default. | Error fixtures produce redacted logs. |
| PRI-009 | Clipboard/share actions are explicit user actions. | Nothing copies or exports automatically. |
| PRI-010 | Uninstall/clear-data consequences are disclosed before users rely on the vault. | Settings and first backup prompt explain irrecoverability. |
| PRI-011 | Any future telemetry is opt-in or separately justified, minimized, documented, and revocable. | Data inventory and retention exist before code. |
| PRI-012 | Any future sync requires threat model, encryption/recovery design, conflicts, deletion, and policy update. | Sync cannot be enabled by a hidden remote flag. |
| PRI-013 | External links reveal only their target to the chosen handler. | The app does not append note identifiers or analytics parameters. |
| PRI-014 | Privacy policy changes precede the build that changes data practice. | Release checklist blocks mismatch. |

## Portability and recovery requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| POR-001 | Backup exports a complete point-in-time vault to a user-chosen destination. | Manifest, Markdown, schema version, and checksums are included. |
| POR-002 | Backup never modifies source files. | Byte/hash comparison before and after. |
| POR-003 | Backup is created through OS document APIs and works offline. | Android device and iOS smoke tests pass. |
| POR-004 | Backup success is shown only after destination write/read-back verification. | Interrupted/cancelled export is not reported as complete. |
| POR-005 | Backup filename is unique and locale-safe. | Multiple same-day backups do not overwrite silently. |
| POR-006 | Restore validates archive format, traversal, size, checksums, and schema before mutation. | Malicious/corrupt fixtures cannot escape sandbox or partially import. |
| POR-007 | Restore begins with an automatic pre-restore backup. | Failure can return to exact prior vault. |
| POR-008 | Restore offers Replace and Merge only when both semantics are fully defined. | Default recommendation is explicit; no ambiguous “Import.” |
| POR-009 | Replace is transactional. | Either the restored vault becomes active or the original remains active. |
| POR-010 | Merge deduplicates by stable ID, detects path/ID/content conflicts, and never silently overwrites. | Conflict summary and deterministic resolution are available. |
| POR-011 | Restored links and IDs remain stable. | Cross-note link fixture resolves identically. |
| POR-012 | Restore rebuilds derived index and notification schedule. | Stale pre-restore requests are removed. |
| POR-013 | Unsupported newer schema is rejected read-only with guidance. | No downgrade write occurs. |
| POR-014 | Older supported schema migrates via an idempotent, backed-up process. | Interrupted migration resumes safely. |
| POR-015 | Plain loose Markdown import has separate rules from full backup restore. | Unknown metadata and filename collisions are reported, not hidden. |
| POR-016 | Users can share/export one note without exporting the entire vault. | Explicit action exports Markdown; privacy warning appears when appropriate. |
| POR-017 | Backup/restore handles Unicode, CRLF, nested folders, duplicate titles, duplicate IDs, large files, and unknown frontmatter. | Fixture suite covers each. |
| POR-018 | Storage-full during backup/restore keeps original data intact. | Cleanup offers only scoped temporary artifacts. |
| POR-019 | App update migration never depends on network. | Airplane-mode upgrade test passes. |
| POR-020 | “Portable” marketing is gated on a shipped and tested export/restore path. | Store copy review verifies. |

## Platform data lifecycle

- App uninstall or OS clear-data can erase the app-private vault; users must be told.
- Android auto-backup is currently disabled; do not imply automatic recovery.
- Device transfer/restore behavior varies by OS and must be tested, not assumed.
- Browser preview storage is non-production and must not be presented as equivalent durability.
- A user-selected shared Files folder is a future storage mode, not a silent migration target.

Related: [[03 Quality/02 Non-Functional Requirements]], [[04 Delivery/03 Open Issues and Not in Build]].
