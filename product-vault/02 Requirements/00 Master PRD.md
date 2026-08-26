---
title: Stories Master PRD
status: active
last_reviewed: 2026-08-26
---

# Stories — Master PRD

## Product statement

**Stories helps people build a repertoire of moments, ideas and experiences they can naturally remember and tell when conversation creates the opportunity.**

The product is not a generic notes app, flashcard system, storytelling course or memoir archive. The success moment happens outside Stories: something in conversation triggers a saved memory naturally and the user can tell it.

## Core loop

1. **Save:** user writes one moment, idea, observation or detail naturally.
2. **Try immediately:** after saving, the user may run clue → tell → reveal once to understand the Stories loop. This does not change scheduling or recall strength.
3. **Rest:** a new memory first returns after three local calendar days.
4. **Cue:** Today shows a short deterministic handle without showing the original memory.
5. **Tell:** user tries to recall/tell it in their own words before looking.
6. **Reveal:** Stories shows the exact original saved memory.
7. **Rate scheduled returns:** `Not yet`, `Mostly`, or `Yes` adjusts future return strength.
8. **Practice anytime:** when nothing is due, `Try one now` runs cue → tell → reveal without changing the saved schedule or recall state.
9. **Find anytime:** Library search recovers the original from fragments, people, places and small typos.

## Experience principles

- Capture must be easier than organising.
- Original memory is source of truth.
- Never silently embellish or rewrite user memory.
- Organisation is the system's job.
- A clue should trigger, not answer.
- Natural telling matters more than verbatim recall.
- Today is a telling/remembering surface, not a recent-notes feed.
- Library owns browsing, finding and editing.
- Voluntary practice never counts as a scheduled review and never changes recall strength or due date.
- Five handled scheduled returns per day is enough.
- No backlog guilt, streak pressure or study-app mechanics.
- Privacy/offline behavior is part of product value.
- Every field and control must justify its friction.

## V1 functional requirements

### Capture
- one multiline plain-text field;
- no title/category/folder/source/cue/date/formatting decisions;
- local draft recovery;
- explicit discard removes recovered draft;
- first return automatically scheduled three local calendar days later;
- successful save offers `Try telling it now` before the user leaves the save flow;
- immediate practice must not mutate scheduling metadata.

### Today
- due healthy memories use clue → tell → reveal → rating;
- cue generation is deterministic, local and intentionally conservative;
- rating options: Not yet / Mostly / Yes;
- Tomorrow defers only the due date while preserving durable/inferred strength;
- Stop resurfacing keeps memory in Library;
- maximum five handled scheduled memories per local day, persisted across navigation/relaunch;
- when nothing is due, `Try one now` selects an existing healthy memory for read-only voluntary practice;
- Today must not display a Recent/browse feed; Library owns that job;
- after daily engagement, reminders must not immediately re-nag about remaining backlog.

### Library
- flat searchable list;
- no user-visible path/folder/type dependency;
- exact phrase/fragments rank ahead of fuzzy matches;
- minor spelling errors should still recover plausible memories;
- opening a result goes directly to the original memory.

### Memory
- body directly editable;
- debounced serialized autosave;
- latest text must win if typing overlaps a previous save;
- Android Back flushes latest non-empty text before leaving;
- action sheet starts with `Try telling`, followed by Share, Stop/Bring back and Delete;
- practice flushes the latest edit before opening and never alters recall state;
- Bring back starts a fresh resurfacing cycle;
- Delete is confirmed and permanent.

### Android delivery
- shipping platform is Android;
- preview builds are APKs for direct testing;
- production builds are AABs for Play distribution;
- release code minification and Android resource shrinking are enabled;
- unused development-client/font/animation native dependencies are not shipped;
- generated `android/` source remains ephemeral; do not hand-maintain stale generated Gradle files.

### Reminders & privacy
- reminders off by default;
- contextual permission request only after the user has experienced return value;
- generic local notification text only;
- app-private storage, no account, no ads/analytics SDK, Android backup disabled;
- no AI required for core behavior.

## Internal compatibility

Existing beta memories may use an older serialized file representation. `legacy-memory-format.ts` is an isolated compatibility codec so upgrades preserve those memories. Additive recall-strength metadata stays on storage schema v1 to preserve tester rollback compatibility. The codec is not part of current UX or the user mental model. Do not expose filenames, folders, Markdown, wikilinks or storage paths in the Android product.

## Non-goals for v1

AI features, sync/accounts, folders/tags, rich text/Markdown authoring, custom schedules, streaks, statistics dashboards, custom voice recording, knowledge graphs, public sharing feeds and export/import UI.

## Launch measurement

Early beta should prioritize qualitative evidence:
- users immediately understand why Stories is different from Notes after the first save;
- clues help users retrieve without revealing the story;
- voluntary practice feels useful without becoming homework;
- five scheduled returns feels manageable;
- search recovers forgotten saved memories;
- users report actually telling/reusing memories outside the app.

Do not add remote analytics solely to measure these until there is a demonstrated need.
