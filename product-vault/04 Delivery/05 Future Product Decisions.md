---
title: Future Product Decisions
status: hypotheses
last_reviewed: 2026-08-26
---

# Future Product Decisions

These are **not committed roadmap**. The current product already implements Discover → Remember → Tell with story prompts, readiness, subtle coaching and `I told this`. Do not add more mechanics until that loop has been tested by real users.

## Recommended order after outcome-loop validation

| Priority | Candidate | Recommendation |
|---|---|---|
| 1 | Android Share-to-Stories | Strong next feature if cross-app capture friction is observed |
| 2 | Better deterministic trigger quality | Tune only if real tester stories expose weak or meaningless triggers |
| 3 | Better local search ranking/highlighting | Improve only if users still fail to recover stories |
| 4 | Launcher capture shortcut | Small Android convenience after higher-signal capture evidence |
| 5 | Dark mode | Polish when there is repeated demand |
| 6 | Local-only content-free diagnostics | Only if beta decisions cannot be made from qualitative feedback |
| 7 | Device migration / export | Revisit when portability becomes a repeated pain |
| 8 | Sync | Defer until multi-device demand is proven |
| 9 | AI | Defer; only revisit for a narrow, user-controlled job |

## FPD-001 — Android Share-to-Stories

**Hypothesis:** useful story material often originates in Chrome, reader apps, messages or another app, and switching apps creates capture friction.

**Recommended first version:** Android Share sheet -> Stories capture screen with shared text shown as context -> user writes what is actually worth telling -> Save.

Do not blindly save copied content as the story. User intent stays required.

## FPD-002 — Trigger quality

The current Story Trigger is deterministic, local, structured and protects later endings. Revisit only if real captured stories frequently produce anchors that do not help retrieval.

Possible next steps without AI:
- improve adjacent proper-noun/place phrase detection;
- maintain a larger stop/outcome-word set from tester examples;
- improve mixed-language token handling;
- add more deterministic fixtures from real anonymised examples.

Do not add a mandatory manual cue field as a workaround.

## FPD-003 — Search quality

Current Library search is local, ranks exact matches ahead of fragment matches and tolerates small typos. Revisit only if users still say, “I know I saved this but can’t find it.”

Possible next steps without AI:
- highlight matching terms;
- rank recent + exact person/place matches more strongly;
- tolerate transpositions and phonetic spelling selectively;
- maintain a small local index if library scale requires it.

Avoid folders/tags as a workaround for weak retrieval.

## FPD-004 — Launcher shortcut

A launcher shortcut directly to `New story` is low complexity and aligned with intentional fast capture. Build only after the current two capture paths are validated.

## FPD-005 — Dark mode

Follow system appearance by default when implemented. Preserve the same semantic color roles and calm hierarchy; do not create a separate visual language.

## FPD-006 — Local-only diagnostics

If beta feedback becomes hard to interpret, content-free counters may be stored locally, such as captures saved, scheduled returns completed, `Find a story` used, `I told this` used and search result opened.

Rules:
- no story text;
- no trigger text;
- no search query text;
- no remote analytics SDK by default.

## FPD-007 — Portability

Do not expose the current internal compatibility file representation as a user-facing “vault” feature. If portability becomes important, design a stable neutral export format and a tested import path independent of the legacy beta codec.

## FPD-008 — Sync

Only consider sync after repeated demand for migration or multi-device use. If built, local data should remain usable offline and conflict handling must preserve the user's original story text.

## FPD-009 — AI

Do not add generic chat, rewriting, story generation or silent trigger generation. Revisit only if there is a narrow job that users repeatedly ask for and where output is clearly separated from the original story.

Examples that might eventually be worth research:
- user-requested alternative retrieval triggers;
- optional search expansion when local deterministic search fails.

Any future AI must be opt-in, transparent about data handling, and must never silently alter the source story.

## Explicitly avoid

- streaks, XP, badges, points, leaderboards or review debt;
- story-readiness scores or arbitrary progress percentages;
- study-grade algorithm controls;
- folders/tags/categories as required capture decisions;
- public social feed;
- graph visualization;
- custom voice recorder before there is a proven need;
- storytelling lessons/tutorials, hook/punchline fields or graded coaching in the core loop.
