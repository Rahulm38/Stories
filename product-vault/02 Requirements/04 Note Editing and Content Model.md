---
title: Memory Reading, Editing, and Content Model
status: active
last_reviewed: 2026-08-24
---

# Memory Reading, Editing, and Content Model

## Overview & UI Hierarchy

When opening a memory, the interface prioritizes **reading and reflection** before exposing technical metadata.

```
┌────────────────────────────────────────┐
│  ← Memory                          ✏️   │
│                                        │
│  Small systems make consistent         │  ← Prominent Title
│  reflection easier                     │
│                                        │
│  📚 Book learning · 📅 Returns 27 Aug  │  ← Kind & Recall metadata badge
│  [ Practice now ]                      │  ← Actionable recall shortcut
│                                        │
│  ────────────────────────────────────  │
│                                        │
│  The full Markdown content appears     │  ← Comfortable reading typography
│  here with clean line spacing and      │
│  clickable [[wikilinks]].              │
│                                        │
│  ────────────────────────────────────  │
│  📄 Books/small-systems.md             │  ← De-emphasized footer metadata
└────────────────────────────────────────┘
```

---

## Reading & Editing Modes

| Surface | Purpose & Design Standards |
|---|---|
| **Reader View** | Focuses on title, formatted Markdown body, and recall status. File path is relegated to footer metadata. Includes a `Practice now` button to trigger immediate recall. |
| **Editor View** | Unlocks full Markdown editing with the lightweight mobile toolbar (Heading, Bold, Italic, Quote, Lists, Checklist, Code, Link, Indent). |
| **Editing Safeguards** | Canceling an edit with unsaved modifications triggers the native *"Keep editing"* / *"Discard changes"* sheet. |
| **Deletion Policy** | Explicit confirmation dialog naming the memory and warning that the Markdown file will be removed permanently. |

---

## Canonical Markdown Schema

Every memory is an independent, human-readable UTF-8 `.md` file with a standardized YAML frontmatter block:

```markdown
---
schemaVersion: "1"
id: "mem_9f8a3b1c"
title: "Small systems make consistent reflection easier"
kind: "book-learning"
folder: "Books"
date: "2026-08-24T10:00:00.000Z"
updatedAt: "2026-08-24T10:00:00.000Z"
source: "Atomic Habits by James Clear"
nextRecallAt: "2026-08-27T10:00:00.000Z"
recallPrompt: "What system helps consistent reflection?"
recallStatus: "partial"
lastRecalledAt: "2026-08-24T10:00:00.000Z"
---
Small systems make consistent reflection easier.

When you lower the friction to capture and review thoughts, habits compound effortlessly over time.
```

---

## Core Content Invariants

1. **Markdown is Authoritative**: The filesystem is the single source of truth. SQLite or in-memory queues are derived and fully rebuildable.
2. **Stable Opaque IDs**: The `id` remains fixed across title changes, folder moves, and backup imports.
3. **Atomic Writes**: Writes stage into a temporary file, verify content, and execute atomic replacement to prevent data corruption.
4. **Frontmatter Quarantine**: If an external editor corrupts frontmatter syntax, the raw file is quarantined in-memory rather than destructively overwritten.
