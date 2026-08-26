---
title: Future Product Decisions
status: hypotheses
last_reviewed: 2026-08-26
---

# Future Product Decisions

These are **not committed roadmap**. Do not build them until the hardened Android capture -> return -> tell -> reveal -> search loop has been tested by real users.

## Recommended order after core stability

| Priority | Candidate | Recommendation |
|---|---|---|
| 1 | Android Share-to-Stories | Strong next feature after stability |
| 2 | Better local search ranking/highlighting | Improve only if users still fail to recover memories |
| 3 | Launcher capture shortcut | Small Android convenience after Share-to-Stories |
| 4 | Dark mode | Polish when there is repeated demand |
| 5 | Local-only content-free diagnostics | Only if beta decisions cannot be made from qualitative feedback |
| 6 | Device migration / export | Revisit when portability becomes a repeated pain |
| 7 | Sync | Defer until multi-device demand is proven |
| 8 | AI | Defer; only revisit for a narrow, user-controlled job |

## FPD-001 — Android Share-to-Stories

**Hypothesis:** useful ideas often originate in Chrome, Kindle/reader apps, messages or another app, and switching apps creates capture friction.

**Recommended first version:** Android Share sheet -> Stories capture screen with shared text shown as context -> user writes what is actually worth remembering -> Save.

Do not blindly save copied content as the memory. User intent stays required.

## FPD-002 — Search quality

Current Library search is local, ranks exact matches ahead of fragment matches and tolerates small typos. Revisit only if users still say, “I know I saved this but can’t find it.”

Possible next steps without AI:
- highlight matching terms;
- rank recent + exact person/place matches more strongly;
- tolerate transpositions and phonetic spelling selectively;
- maintain a small local index if library scale requires it.

Avoid folders/tags as a workaround for weak retrieval.

## FPD-003 — Launcher shortcut

A launcher shortcut directly to `New memory` is low complexity and aligned with intentional fast capture. Build after Share-to-Stories because Share solves a stronger cross-app capture job.

## FPD-004 — Dark mode

Follow system appearance by default when implemented. Preserve the same semantic color roles and calm hierarchy; do not create a separate visual language.

## FPD-005 — Local-only diagnostics

If beta feedback becomes hard to interpret, content-free counters may be stored locally, such as captures saved, reviews completed, Tomorrow used and search result opened.

Rules:
- no memory text;
- no cue text;
- no search query text;
- no remote analytics SDK by default.

## FPD-006 — Portability

Do not expose the current internal compatibility file representation as a user-facing “vault” feature. If portability becomes important, design a stable neutral export format and a tested import path independent of the legacy beta codec.

## FPD-007 — Sync

Only consider sync after repeated demand for migration or multi-device use. If built, local data should remain usable offline and conflict handling must preserve the user's original memory text.

## FPD-008 — AI

Do not add generic chat, rewriting, story generation or silent cue generation. Revisit only if there is a narrow job that users repeatedly ask for and where output is clearly separated from the original memory.

Examples that might eventually be worth research:
- user-requested alternative retrieval cues;
- optional search expansion when local deterministic search fails.

Any future AI must be opt-in, transparent about data handling, and must never silently alter the source memory.

## Explicitly avoid

- streaks, XP, badges or review debt;
- study-grade algorithm controls;
- folders/tags/categories as required capture decisions;
- public social feed;
- graph visualization;
- custom voice recorder before there is a proven need;
- storytelling lessons/tutorials in the core loop.
