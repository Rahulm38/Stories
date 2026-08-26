---
title: Stories Master PRD
status: active
last_reviewed: 2026-08-26
---

# Stories — Master PRD

## Product statement

**Stories helps people keep moments, ideas and experiences available in memory so they are there when a conversation creates the opportunity to tell them.**

The product is not a generic notes app, flashcard system, storytelling course or memoir archive. The success moment happens outside Stories: something in conversation triggers a saved memory naturally and the user can tell it.

## Core loop

1. **Save:** user writes one moment, idea, observation or detail naturally.
2. **Rest:** a new memory first returns after three local calendar days.
3. **Cue:** Today shows a short deterministic handle without showing the original memory.
4. **Tell:** user tries to recall/tell it before looking.
5. **Reveal:** Stories shows the exact original saved memory.
6. **Rate:** `Not yet`, `Mostly`, or `Yes` adjusts future return strength.
7. **Find anytime:** Library search can recover the original from fragments, people, places and small typos.

## Experience principles

- Capture must be easier than organizing.
- Original memory is source of truth.
- Never silently embellish or rewrite user memory.
- Organization is the system's job.
- A clue should trigger, not answer.
- Natural telling matters more than verbatim recall.
- Five handled returns per day is enough.
- No backlog guilt, streak pressure or study-app mechanics.
- Privacy/offline behavior is part of product value.
- Every field and control must justify its friction.

## V1 functional requirements

### Capture
- one multiline plain-text field;
- no title/category/folder/source/cue/date/formatting decisions;
- local draft recovery;
- explicit discard removes recovered draft;
- first return automatically scheduled three local calendar days later.

### Today
- only healthy memories with due local calendar date are eligible;
- hidden state shows conservative deterministic cue + instruction to try telling;
- Reveal shows exact source memory;
- rating options: Not yet / Mostly / Yes;
- Tomorrow defers only the due date, not strength;
- Stop resurfacing keeps memory in Library;
- max five handled memories per local day, persisted across navigation/relaunch;
- after daily engagement, reminders must not immediately re-nag about remaining backlog.

### Library
- flat searchable list;
- no user-visible path/folder/type dependency;
- exact phrase/fragments rank ahead of fuzzy matches;
- minor spelling errors should still recover plausible memories;
- opening result goes directly to the original memory.

### Memory
- body directly editable;
- debounced serialized autosave;
- latest text must win if typing overlaps a previous save;
- Android Back flushes latest non-empty text before leaving;
- More sheet: Share, Stop/Bring back, Delete;
- Bring back starts a fresh resurfacing cycle;
- Delete is confirmed and permanent.

### Reminders & privacy
- reminders off by default;
- contextual permission request only after the user has experienced return value;
- generic local notification text only;
- app-private storage, no account, no ads/analytics SDK, Android backup disabled;
- no AI required for core behavior.

## Internal compatibility

Existing beta memories may use an older serialized file representation. `legacy-memory-format.ts` is an isolated compatibility codec so upgrades preserve those memories. It is not part of current UX or the user mental model. Do not expose filenames, folders, Markdown, wikilinks or storage paths in the Android product.

## Non-goals for v1

AI features, sync/accounts, folders/tags, rich text/Markdown authoring, custom schedules, streaks, statistics dashboards, custom voice recording, knowledge graphs, public sharing feeds and export/import UI.

## Launch measurement

Early beta should prioritize qualitative evidence:
- users can explain why they save something;
- due clues help them retrieve without revealing the story;
- five returns feels manageable;
- search recovers forgotten saved memories;
- users report actually telling/reusing memories outside the app.

Do not add remote analytics solely to measure these until there is a demonstrated need.
