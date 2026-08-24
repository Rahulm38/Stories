---
title: Library, Search, and Links
status: active
last_reviewed: 2026-08-24
---

# Library, Search, and Links

## Overview & Outcome

Users can effortlessly find, browse, and connect their durable memories without the cognitive overhead of maintaining a complex knowledge base. The Library reflects the underlying Markdown vault while maintaining a clean, human-centered UI.

---

## Screen Structure & Layout

```
┌────────────────────────────────────────┐
│  Library                       + New   │
│  12 memories                           │
│                                        │
│  🔍 Search memories…                   │  ← Real-time local search
│                                        │
│  [All memories]  [By folder]           │  ← Clean view toggle
│                                        │
│  ▾ 📚 Books                        (5) │
│    • Atomic Habits                     │  ← Memory row with 1-line preview
│      Small systems make consistent…    │
│    • Thinking, Fast and Slow           │
│                                        │
│  ▸ 👤 Experiences                  (4) │
│  ▸ 📝 Notes                        (3) │
└────────────────────────────────────────┘
```

---

## Library & Folder Capabilities

| Area | User-Facing Behavior |
|---|---|
| **Empty State** | When 0 memories exist, hides search and empty folder chrome. Displays: *"Your saved memories will appear here"* with a `+ New memory` button. |
| **Clean Categorization** | Groups memories by kind: `Books/`, `Experiences/`, and `Notes/` (renamed from technical "Inbox"). |
| **Folder Visibility** | Empty root folders are hidden by default to keep the screen uncluttered. The first non-empty folder is expanded on open. |
| **Memory Rows** | Displays title, kind icon, date, and a subtle 1-line content snippet. |
| **Sorting** | Newest-updated memories appear first by default. |

---

## Real-Time Search

- **Scope**: Instant, case-insensitive match across title, body Markdown, folder, memory kind, and source/author.
- **Speed**: Results update in <200ms at 5,000 notes on device.
- **Privacy**: 100% on-device string matching; zero network telemetry.
- **Empty Query Result**: Clearly states *"No memories match '[query]'"* with a `Clear search` affordance.

---

## Wikilinks & Internal Connections

- **Autocompletion**: Typing `[[` inside any memory editor suggests up to 6 matching local memories.
- **Disambiguation**: If two memories share a title, the link automatically includes the folder prefix (e.g. `[[Books/Atomic Habits.md]]`).
- **Aliases**: Supports standard alias syntax `[[Target Note|Custom Label]]`.
- **Rename Safety**: Renaming or moving a memory safely rewrites all inbound `[[wikilinks]]` across the vault in a single atomic transaction.
- **External Links**: Standard `https://`, `mailto:`, `tel:`, and `sms:` links trigger safe OS handoff. Dangerous schemes (`javascript:`, `data:`) are strictly blocked.
