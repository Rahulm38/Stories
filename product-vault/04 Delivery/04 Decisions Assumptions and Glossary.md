---
title: Decisions, Assumptions, and Glossary
status: active
last_reviewed: 2026-08-26
---

# Decisions, Assumptions, and Glossary

## Key product decisions

| ID | Decision | Why |
|---|---|---|
| D-001 | Stories helps people **discover, remember and tell** personal stories for real conversation. | The desired outcome happens outside the app when the user has something worth saying and can retrieve it naturally. |
| D-002 | Capture is one plain-text field with two entry paths: `Something happened` or `Find a story`. | Free capture stays instant; optional prompts help users notice story-worthy material without adding fields. |
| D-003 | Scheduled return stays **Story trigger -> attempt to tell -> Show story -> Not yet / Mostly / Yes**. | Retrieval before rereading strengthens availability without turning Stories into a quiz. |
| D-004 | The original saved story is always source of truth. | Stories must never silently rewrite or embellish what the user remembers. |
| D-005 | New stories first return after three local calendar days. | Enough distance to make retrieval meaningful without feeling forgotten. |
| D-006 | A local calendar day contains at most five handled scheduled stories. | Resurfacing should stay calm and must not become review debt. |
| D-007 | Return strength is persisted separately from due date. | Deferring changes timing, not how available the story is. |
| D-008 | Story triggers are deterministic, local and conservative. | No AI dependency and no ending leakage before reveal. |
| D-009 | Library organisation is implicit; recovery happens through search. | Users should remember people/places/fragments, not file locations. |
| D-010 | Story editing is direct autosave. | A separate Edit/Save mode adds friction; serialized writes and navigation flushing protect durability. |
| D-011 | Reminders are generic, local and optional. | Helpful without exposing story content or creating notification pressure. |
| D-012 | No AI, account, sync, streaks, points, leaderboards, required folders/tags or custom scheduling controls in v1. | Keep the product focused, private and non-gamified. |
| D-013 | Existing beta storage format is compatibility code only. | Preserve tester data safely without carrying old file/Markdown concepts into product UX. |
| D-014 | Story readiness is derived as `New -> Getting ready -> Ready`; it is not a score. | Users need to feel their repertoire growing, but app activity should not masquerade as progress. |
| D-015 | A story is Ready after a confirmed real-world telling or durable successful recall strength of at least 30 days. | Readiness should reflect practical tellability rather than raw review count. |
| D-016 | `I told this` records `toldCount` and `lastToldAt` without changing recall schedule. | Real-world telling is the closest v1 signal to the product goal and must stay independent of the training mechanic. |
| D-017 | Tiny coaching prompts appear during telling attempts; no lessons or grades. | Rehearsal can improve fluency subtly without turning Stories into a course. |

## Working assumptions

1. The most valuable stories are not necessarily dramatic events; ordinary moments, observations, opinions, mistakes and experiences can become useful when conversation creates the opportunity.
2. People often need help **noticing** story-worthy moments, not merely remembering things already captured.
3. A small contextual trigger should be enough to start retrieval but should not contain the punchline.
4. Speaking or mentally telling a story is a better target than verbatim recall.
5. A growing repertoire of Ready stories can motivate users more honestly than streaks, XP or review totals.
6. A user-confirmed real-world telling is more meaningful than an in-app completion event.
7. Search must tolerate imperfect recollection; exact filenames or titles are not a valid dependency.
8. Five useful returns are better than a large overdue queue.
9. Privacy and offline behavior are part of the product value, not secondary implementation details.

## Product glossary

| Term | Definition |
|---|---|
| **Story** | One user-saved moment, idea, observation, opinion, experience or detail they may want to tell later. |
| **Find a story** | Optional prompt-led capture path that helps the user notice a story already present in their life. Prompts create no metadata. |
| **Story trigger** | A short deterministic contextual handle shown before the original story. |
| **Hint** | Optional second trigger anchor revealed only when the first is insufficient. |
| **Attempt** | The moment where the user tries to tell the story before seeing the original. |
| **Coaching cue** | One short non-judgmental telling prompt such as `Start with where you were.` It never changes stored content or scoring. |
| **Show story** | Reveals the exact original saved story. |
| **Not yet / Mostly / Yes** | Lightweight rating of whether the user could tell a scheduled story. |
| **Review strength** | Internal interval state representing durable retrieval strength; separate from due date. |
| **New** | Story with no meaningful retrieval history yet. |
| **Getting ready** | Story that has begun strengthening but has not reached Ready. |
| **Ready** | Story with a confirmed real-world telling or at least 30 days of durable remembered strength. |
| **I told this** | User-confirmed real-world telling event. Increments local toldCount and lastToldAt without changing recall scheduling. |
| **Today** | Calm Discover/Remember/Tell surface, limited to five handled scheduled stories per local day. |
| **Library** | Searchable story bank; may show Ready status subtly. |
| **Try a story** | Voluntary trigger -> tell -> reveal rehearsal that does not alter recall scheduling. |
| **Stop resurfacing** | Removes a story from future Today returns without deleting it. |
| **Bring back** | Starts a stopped story on a fresh resurfacing cycle while preserving real-world telling history. |
| **Compatibility codec** | Internal-only reader/writer for stories created by older beta builds. Not part of the user mental model. |
