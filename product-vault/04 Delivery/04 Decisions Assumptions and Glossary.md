---
title: Decisions, Assumptions, and Glossary
status: active
last_reviewed: 2026-08-26
---

# Decisions, Assumptions, and Glossary

## Key product decisions

| ID | Decision | Why |
|---|---|---|
| D-001 | Stories helps keep personal moments and ideas available for real conversation. | The desired outcome happens outside the app when a relevant memory naturally comes to mind. |
| D-002 | Capture is one plain-text field. | Categories, folders, titles and formatting create friction without improving the core job. |
| D-003 | Review stays **Cue -> attempt to tell -> Reveal -> Rate**. | Retrieval before rereading is the behavior Stories is trying to strengthen. |
| D-004 | The original saved memory is always source of truth. | Stories must never silently rewrite or embellish what the user remembers. |
| D-005 | New memories first return after three local calendar days. | Enough distance to make retrieval meaningful without feeling forgotten. |
| D-006 | A local calendar day contains at most five handled memories. | Resurfacing should stay calm and must not become review debt. |
| D-007 | Return strength is persisted separately from due date. | Deferring a memory changes timing, not how well it was remembered. |
| D-008 | Cues are deterministic, local and conservative. | No AI dependency and no answer leakage before Reveal. |
| D-009 | Library organization is implicit; recovery happens through search. | Users should remember people/places/fragments, not file locations. |
| D-010 | Memory editing is direct autosave. | A separate Edit/Save mode adds unnecessary friction; serialized writes and navigation flushing protect durability. |
| D-011 | Reminders are generic, local and optional. | Helpful without exposing memory content or creating notification pressure. |
| D-012 | No AI, account, sync, streaks, analytics SDK, folders/tags or custom scheduling controls in v1. | Keep the product focused and private. |
| D-013 | Existing beta storage format is compatibility code only. | Preserve tester data safely without carrying old file/Markdown concepts into product UX. |

## Working assumptions

1. The most valuable memories are not necessarily facts; they are moments, observations, ideas and experiences that become useful when a conversation creates the opportunity.
2. A small clue should be enough to start retrieval but should not contain the punchline.
3. Speaking or mentally telling a memory is a better target than verbatim recall.
4. Search must tolerate imperfect recollection; exact filenames or titles are not a valid dependency.
5. Five useful returns are better than a large overdue queue.
6. Privacy and offline behavior are part of the product value, not secondary implementation details.

## Product glossary

| Term | Definition |
|---|---|
| **Memory** | One user-saved moment, idea, observation, experience or detail. |
| **Cue** | A short, deterministic retrieval handle shown before the original memory. |
| **Attempt** | The moment where the user tries to tell/recall the memory before Reveal. |
| **Reveal** | Shows the original saved memory. |
| **Not yet / Mostly / Yes** | User's lightweight rating of whether they could tell the memory. |
| **Review strength** | Internal interval state representing the last durable resurfacing strength; separate from due date. |
| **Today** | The calm resurfacing surface, limited to five handled memories per local day. |
| **Library** | Searchable collection of saved memories. |
| **Stop resurfacing** | Removes a memory from future Today returns without deleting it. |
| **Bring back** | Starts a stopped memory on a fresh resurfacing cycle. |
| **Compatibility codec** | Internal-only reader/writer for memories created by older beta builds. Not part of the user mental model. |
