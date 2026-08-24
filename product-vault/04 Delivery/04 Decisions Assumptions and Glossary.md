---
title: Decisions Assumptions and Glossary
document_type: reference
status: active
last_reviewed: 2026-08-24
---

# Decisions, assumptions, and glossary

## Accepted decisions

| ID | Decision | Rationale | Revisit trigger |
| --- | --- | --- | --- |
| D-001 | Stories is a recall companion, not a general notes app. | Focus differentiation and reduce surface area. | Core loop fails despite strong execution. |
| D-002 | Android is the first device-validation and delivery priority. | Concrete shipping focus. | Distribution/business need changes. |
| D-003 | Shared Expo/React Native architecture preserves iOS. | One product implementation with platform adapters. | A platform requirement cannot be met responsibly. |
| D-004 | App-private Markdown is authoritative. | Local ownership, durability, readable format. | Evidence shows required behavior cannot be reliable/performant. |
| D-005 | SQLite, when added, is rebuildable derived data. | Avoid database lock-in/data-loss dependency. | None without a new architecture decision. |
| D-006 | Today, Library, Settings are the primary destinations. | Calm hierarchy around core loop. | Repeated research finds a missing top-level job. |
| D-007 | Note, Book learning, Experience are initial kinds. | Support low-friction plus two wedge cases. | Users cannot map real captures to them. |
| D-008 | New memories default to recall in three days; options include one week/off. | Make recall visible without configuration. | Research shows surprise/annoyance. |
| D-009 | Recall outcomes schedule 1/4/14 days. | Simple deterministic behavior. | Longitudinal evidence supports change. |
| D-010 | Graph, AI, sync, collaboration, attachments, tasks, rich text are not core v1. | Protect trust and core-loop learning. | Scope-change test is satisfied. |
| D-011 | No decorative phone shell or web wrapper counts as native. | Native interaction behavior is a requirement. | None. |
| D-012 | Product PRD vault is tracked in Git but outside runtime app directories/imports. | Preserve product history without shipping documentation. | Build inspection finds bundling or repo structure changes. |
| D-013 | v1 delete is explicit confirmation plus permanent removal; trash/restore waits for a tested retention lifecycle. | OI-005 gates trash on tests and restore-same-ID design; with no backup yet, an honest permanent-delete confirmation is safer than an untested soft-delete that could resurrect or strand files. | Backup/restore ships, or usability evidence shows destructive anxiety blocking deletion. |

## Working assumptions needing validation

- Users accept app-private storage if backup is clear and reliable.
- A cue can be useful without requiring a typed attempt.
- A simple fixed interval is sufficient for v1 learning.
- Three memory kinds are understandable without onboarding.
- Search across body/source/path is sufficient before tags.
- 5,000 notes is a reasonable v1 performance ceiling.
- Generic notifications are useful despite hiding the cue on lock screen.
- Reflection/connection is a meaningful proxy for reuse.

Assumptions are not facts. Link research evidence here when available.

## Glossary

| Term | Definition |
| --- | --- |
| Memory | A user-saved unit represented by one Markdown file. |
| Note | The unclassified memory kind; also used technically for a `MemoryNote`. |
| Book learning | A memory whose optional source is a book/author and whose body captures an idea in the user’s words. |
| Experience | A memory about something lived, observed, or learned through context. |
| Vault | The app-private root containing Markdown memories and scoped recovery artifacts. |
| Library | The user-facing folder/search view of the vault. |
| Cue | A prompt shown before the stored body to trigger retrieval. |
| Attempt | The recall stage where the user thinks/speaks before Reveal; not necessarily stored. |
| Recall outcome | Not yet (`forgot`), Partly (`partial`), or Got it (`remembered`). |
| Reflection | Optional Markdown appended after a recall outcome. |
| Due | A valid `nextRecallAt` at or before the current time under the approved time policy. |
| Defer/Tomorrow | Move a due recall to the next approved local-day time without grading. |
| Wikilink | Plain Markdown-like `[[target]]` or `[[target|label]]` linking local memories. |
| Stable ID | Opaque identity retained across title/path changes and backup/restore. |
| Derived index | Disposable local data built from Markdown to accelerate search/links/queue. |
| Verified write | A write whose staged content was read back successfully before success is reported. |
| Portability | User-operable, tested backup/export and restore—not merely a readable internal format. |
| Implemented | Present in code, distinct from device-verified or shipped. |

## Decision-record template

When adding a decision, record:

- Date and owner
- Context/problem
- Chosen option
- Alternatives rejected
- Product/data/privacy/accessibility consequences
- Migration or rollout impact
- Evidence and revisit trigger

Material changes must update the affected requirement IDs, traceability, and open-issues register in the same change.
