---
title: Note Editing and Content Model Requirements
document_type: feature_prd
status: active
last_reviewed: 2026-08-24
---

# Note editing and content model

## Reading requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| EDT-001 | Reading mode prioritizes title and body, with kind/folder/source/recall as supporting metadata. | Storage path is selectable but visually secondary. |
| EDT-002 | Supported Markdown renders headings, paragraphs, line breaks, emphasis, strong text, inline code, quotes, ordered/unordered lists, checklists, Markdown links, and wikilinks. | Golden fixtures cover nesting and inline combinations. |
| EDT-003 | Unsupported Markdown remains readable as text and is never deleted by viewing. | Fenced code, tables, images, HTML, footnotes, and malformed syntax have fallback tests. |
| EDT-004 | External links are clearly links and use safe OS handoff. | Failure is visible; no local note is created. |
| EDT-005 | Long notes scroll smoothly and keep title/actions reachable through normal navigation. | Reference-device tests cover 100 KB and agreed upper-bound fixtures. |

## Editing requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| EDT-006 | Edit begins from reading mode and loads title, body, kind, source, cue, and due date. | Unknown frontmatter and unchanged metadata remain intact. |
| EDT-007 | Dirty-state detection covers every editable field. | Changing only source, kind, cue, date, title, or whitespace triggers the guard. |
| EDT-008 | Cancel/back with changes asks Keep editing or Discard. | Hardware Back and iOS gesture behave consistently. |
| EDT-009 | Save is single-flight and verified before leaving edit mode. | Repeated taps do not duplicate moves/reflections. |
| EDT-010 | Save failure retains all fields and editing state. | Retry remains available and no success copy is shown. |
| EDT-011 | Blank title falls back to a title derived from body rather than creating an empty header. | Empty title + empty body policy is explicit; existing note is never silently erased. |
| EDT-012 | Emptying the body of an existing note requires an explicit product policy. | Recommended: allow if title remains, but never treat it as deletion. |
| EDT-013 | Kind changes preserve a custom folder unless the user confirms moving to a default root. | No unexpected loss of nested organization. |
| EDT-014 | Recall date editing accepts a localized date picker or strict `YYYY-MM-DD` fallback. | Impossible dates remain on screen with a validation error. |
| EDT-015 | Clearing optional source/cue/date explicitly removes the corresponding metadata. | Serializer does not resurrect prior values. |
| EDT-016 | `[[` suggestions stay anchored to the active link and restore caret after insertion. | Native/web keyboard tests cover selection, IME, paste, and completed links. |
| EDT-017 | Rename/move and backlink rewrites are one recoverable transaction. | Failure restores original and all rewritten files. |
| EDT-018 | Concurrent edits have an explicit conflict policy. | At minimum, detect changed `updatedAt`/file content and do not silently last-write-win. |
| EDT-019 | Delete has a recoverable confirmation flow before it ships. | Move to local trash; undo/restore is possible; links become visibly unresolved. |
| EDT-020 | The app never interprets Markdown body as executable HTML or script. | Security fixtures cannot execute code. |

## Canonical Markdown schema

Markdown files are the source of truth. The body remains ordinary Markdown after one YAML-like frontmatter block.

```markdown
---
schemaVersion: "1"
id: "memory-stable-id"
title: "A useful idea"
kind: "book-learning"
folder: "Books"
date: "2026-08-24T10:00:00.000Z"
updatedAt: "2026-08-24T10:00:00.000Z"
source: "Optional source"
nextRecallAt: "2026-08-27T10:00:00.000Z"
recallPrompt: "Optional cue"
recallStatus: "partial"
lastRecalledAt: "2026-08-24T10:00:00.000Z"
---
The user-authored body.
```

`schemaVersion` is a normative requirement even if absent in the current build; it is needed before incompatible migrations.

## Content-model requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| EDT-021 | `id` is stable, unique, opaque, and independent of title/path. | Move/rename and restore preserve it. |
| EDT-022 | Duplicate or missing IDs never cause a file to disappear from runtime. | Assign unique runtime identity; repair only through a safe migration with backup. |
| EDT-023 | `kind` is one of note, book-learning, experience; unknown values degrade to note without deleting raw metadata. | Round-trip preserves unknown field for future recovery. |
| EDT-024 | Folder/path normalization cannot escape vault root. | Traversal and absolute path tests pass. |
| EDT-025 | Created and updated timestamps use ISO 8601; local display uses locale/time zone. | Invalid values sort after valid values deterministically. |
| EDT-026 | Recall status is only remembered, partial, or forgot. | Unknown value is ignored/preserved safely, not executed or coerced. |
| EDT-027 | Unknown top-level and multiline frontmatter round-trips byte-safely where practical. | Editing known fields does not drop custom metadata. |
| EDT-028 | The parser accepts UTF-8 BOM and CRLF and normalizes output according to a documented policy. | Fixtures reopen correctly. |
| EDT-029 | A malformed frontmatter block never causes the underlying file to be overwritten automatically. | File is surfaced as recoverable/unparsed with diagnostic copy. |
| EDT-030 | Every write uses temporary file, read-back verification, atomic replace where available, and recoverable backup. | Injected failures at each step preserve at least one complete version. |
| EDT-031 | SQLite/search indexes are disposable derived data. | Deleting index and reopening reconstructs identical note identities and due queue. |
| EDT-032 | Schema migrations are versioned, idempotent, resumable, and preceded by backup. | Interrupted migration restarts without duplicate/lost notes. |

## Deletion policy (required before implementation)

Delete is absent today. When added:

1. Confirm with title and consequence.
2. Move the Markdown file to an app-private trash folder; do not immediately erase.
3. Retain at least 30 days or until explicit Empty Trash.
4. Cancel pending recall notifications and remove from derived indexes.
5. Leave inbound links unresolved; do not delete other users’ text.
6. Restore returns the same ID/path when available or prompts on collision.
7. Permanent deletion is explicit, scoped, and unavailable during backup/migration.
