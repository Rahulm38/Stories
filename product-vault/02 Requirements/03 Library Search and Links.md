---
title: Library Search and Links Requirements
document_type: feature_prd
status: active
last_reviewed: 2026-08-24
---

# Library, search, folders, and links

## Outcome

Users can find and navigate their durable memories without managing a complex knowledge base. The Library reflects the Markdown vault; it does not become the product’s daily dashboard.

## Library requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| LIB-001 | Empty Library explains where saved memories will appear and offers New memory. | Search, counts, and empty folder chrome are hidden at zero notes. |
| LIB-002 | Nonempty Library shows total memory count, search, and a folder-first hierarchy. | Count matches visible readable Markdown notes, including nested folders. |
| LIB-003 | Root folders begin in order Books, Experiences, Inbox, followed by custom roots alphabetically. | Case variants of required roots are canonicalized in presentation. |
| LIB-004 | Empty required roots may be hidden by default; expanding an explicitly shown empty folder says it is empty. | No blank tap result. |
| LIB-005 | The first nonempty root expands by default; user toggles control other folders. | State does not unexpectedly collapse during same session. |
| LIB-006 | Nested folders display recursively with clear depth. | 1–10 depth fixtures remain navigable without overlapping text. |
| LIB-007 | Notes sort consistently, newest-updated first unless a later product decision changes it. | Invalid/equal dates have deterministic path/ID tie-breakers. |
| LIB-008 | Duplicate titles display a qualifying path. | Users can distinguish every result before opening. |
| LIB-009 | Tapping a note opens its stable identity, not a title query. | Rename/move while route exists still resolves to the same ID after save. |
| LIB-010 | Missing/unreadable notes produce a safe unavailable state. | Return to Library remains possible. |
| LIB-011 | Folder expansion and search remain usable with screen readers and large text. | Rows expose name, count, and expanded/collapsed state. |
| LIB-012 | Library works while the derived index is absent or rebuilding. | It may degrade to file scan with honest progress; it never shows an empty vault as success. |

## Search requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| LIB-013 | Search matches title, body, folder/path, kind, and source, case-insensitively. | Fixture coverage includes each field. |
| LIB-014 | Leading/trailing whitespace is ignored. | Whitespace-only query returns normal Library. |
| LIB-015 | Search is Unicode-aware and must not corrupt combining characters. | Tests cover NFC/NFD, non-Latin scripts, accents, and emoji. |
| LIB-016 | Results appear within 200 ms at 5,000 notes on the reference device. | Measured p95 from keystroke to updated list. |
| LIB-017 | While searching, only folders containing matches appear and stay expanded. | Folder controls are disabled/announced as such during active query. |
| LIB-018 | No-result state says nothing matches and offers Clear search. | Clearing restores prior folder browsing state where feasible. |
| LIB-019 | Search never sends query or note content off-device. | Network inspection shows no request. |
| LIB-020 | Search handles indexing corruption with rebuild/fallback. | No crash or permanent false-empty state. |

## Wikilink requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| LIB-021 | Typing `[[` near the caret suggests up to six local notes. | Current note is excluded; title/path/filename substring match works. |
| LIB-022 | Suggestions rank prefix matches before word-prefix, then substring, with deterministic ties. | Fixed-fixture results are stable. |
| LIB-023 | Inserting a unique filename uses `[[filename.md]]`; duplicate filenames use a folder-qualified path. | Inserted link resolves to the chosen note. |
| LIB-024 | Cursor-in-link replacement replaces the complete current link, not only text before the caret. | Completed and incomplete link tests pass. |
| LIB-025 | Link aliases `[[target|label]]` render the label and resolve the target. | Alias survives move rewrite. |
| LIB-026 | Resolution prefers an exact qualified path, then same-folder unique basename, then globally unique basename/title. | Ambiguous matches do not guess. |
| LIB-027 | Ambiguous links show an actionable message requesting folder qualification. | No note is opened or created. |
| LIB-028 | Missing local links create an empty draft only after an explicit tap/action. | Unicode folder/title is retained and target is sanitized inside the vault. |
| LIB-029 | Renaming/moving a note rewrites resolvable inbound qualified links and eligible unique basenames atomically. | Any rewrite failure rolls back the whole logical move. |
| LIB-030 | External Markdown links use OS handoff for supported schemes and never create local notes. | `https`, `http`, `mailto`, `tel`, and `sms` are tested, including angle wrapping. |
| LIB-031 | Unsafe or unsupported schemes do not execute. | `javascript`, `data`, `file`, malformed URI, and control-character fixtures are blocked with feedback. |
| LIB-032 | A global graph/backlink dashboard is deferred. | No primary navigation or release dependency is created for it. |

## Folder behavior

v1 reading supports nested folders from the underlying vault. UI creation/rename/move of arbitrary folders is not required unless approved. When a kind changes, its default root changes only when the note was in the previous kind’s managed/default location; a custom nested folder should not be discarded without confirmation.

Path rules:

- Normalize separators to `/`.
- Reject traversal (`..`), absolute paths, drive prefixes, NUL/control characters, and empty final names.
- Preserve Unicode in NFC form.
- Sanitize only characters unsafe for supported platforms; never collapse two notes into overwrite.
- Treat case-colliding paths as collisions on all platforms to keep cross-platform restore safe.
- Limit path/segment length with an explicit, tested rule and visible fallback.

## Not in current UI

Folder create/rename/delete, manual drag/reorder, backlinks list, graph, tags/facets, saved searches, and bulk operations are requirements only if later promoted through the scope-change test.
