---
title: Non-Functional Requirements
document_type: quality_spec
status: active
last_reviewed: 2026-08-24
---

# Non-functional requirements

## Reliability and durability

| ID | Requirement / target |
| --- | --- |
| NFR-001 | Zero known silent-loss or wrong-note overwrite defects at release. |
| NFR-002 | Every file mutation has a verified, recoverable transaction path and injected-failure tests. |
| NFR-003 | Cold start, force-stop, OS kill, low-storage, and upgrade tests preserve the last successful write. |
| NFR-004 | App remains fully usable offline for capture, Library, recall, edit, and local backup/restore. |
| NFR-005 | Derived indexes and notification schedules rebuild from Markdown without changing source files. |
| NFR-006 | Save, grade, defer, move, restore, and migration operations are idempotent or detect duplicates. |
| NFR-007 | Read failure of one file does not make every healthy file unavailable; incomplete state is disclosed. |
| NFR-008 | Crash-free session target is ≥99.8% after enough release volume to measure, without collecting note content. |

## Performance budgets

Reference hardware must be named before formal sign-off; use a mid-range supported Android device, not a flagship only.

| ID | Target |
| --- | --- |
| NFR-009 | Warm Today interactive ≤1.0 s p95; cold Today with 5,000 notes ≤2.5 s p95. |
| NFR-010 | Save feedback begins within 100 ms; verified save completes ≤500 ms p95 for a 10 KB note under normal storage. |
| NFR-011 | Library first usable rows ≤1.5 s p95 at 5,000 notes. |
| NFR-012 | Search keystroke-to-results ≤200 ms p95 at 5,000 notes. |
| NFR-013 | Wikilink suggestions ≤100 ms p95 at 5,000 notes. |
| NFR-014 | Due queue calculation ≤100 ms p95 at 5,000 notes. |
| NFR-015 | Scrolling sustains platform-appropriate smoothness with no multi-frame stalls from parsing/indexing. |
| NFR-016 | Index rebuild is cancelable/resumable or runs incrementally with honest progress; source remains usable. |

## Scale and limits

| ID | Requirement |
| --- | --- |
| NFR-017 | Support at least 5,000 Markdown notes and 50,000 wikilinks within stated budgets. |
| NFR-018 | Define and test per-note, per-segment, total-vault, and backup size limits; never truncate silently. |
| NFR-019 | Folder traversal and parsing use bounded recursion/iteration to resist pathological input. |
| NFR-020 | Large files degrade gracefully and remain exportable even if rich rendering is simplified. |

## Security

| ID | Requirement |
| --- | --- |
| NFR-021 | All constructed paths remain within the vault root after canonicalization. |
| NFR-022 | Restore and import reject traversal, absolute paths, symlink escape, archive bombs, and invalid checksums before commit. |
| NFR-023 | Markdown is treated as data; raw HTML/script is not executed. |
| NFR-024 | External link allowlist is explicit; unsupported schemes are blocked. |
| NFR-025 | No secret, note content, cue, reflection, search term, or unredacted path appears in logs/crash reports. |
| NFR-026 | Dependencies and store permissions are minimized and reviewed before release. |
| NFR-027 | Device sandbox is the baseline protection; product copy does not imply stronger encryption than implemented. |

## Compatibility and maintainability

| ID | Requirement |
| --- | --- |
| NFR-028 | Android minimum/target OS policy and supported iOS versions are documented per release. |
| NFR-029 | Same Markdown schema and core behavior run on Android and iOS; platform adapters own filesystem, notifications, and deep links. |
| NFR-030 | Web prototype is not used as evidence of native device quality. |
| NFR-031 | Schema changes have version, migration, rollback, fixtures, and release-note impact. |
| NFR-032 | Core parser/vault/recall/link logic remains framework-free and unit-testable. |
| NFR-033 | Date/time tests use injected clocks and explicit zones. |
| NFR-034 | Every requirement promoted to release scope maps to code/tests in traceability. |
| NFR-035 | Obsidian product vault remains outside runtime imports and generated app assets. |
| NFR-036 | Build output inspection finds no product-vault content or `.obsidian` state in web/native bundles. |

## Observability without surveillance

- User-facing diagnostics should expose system state without note content.
- Internal errors use stable codes and redacted context (operation, adapter, platform, schema version).
- If crash reporting is later added, obtain product/privacy approval, document processor/retention, filter content, and provide consent/opt-out as required.
- Local debug logs must be bounded and clearable.
