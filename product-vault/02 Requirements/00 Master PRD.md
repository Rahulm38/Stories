---
title: Stories Master PRD
status: active
last_reviewed: 2026-08-26
---

# Stories — Master PRD

## Product statement

**Stories helps people notice, retain and rehearse moments they can naturally tell when conversation creates the opportunity.**

The product is not a generic notes app, flashcard system, storytelling course or memoir archive. The strongest success moment happens outside Stories: the user recognises an opening in real conversation, remembers a story and tells it naturally.

## Product model: Discover → Remember → Tell

### Discover
1. **Something happened:** capture a moment, idea, opinion or observation immediately.
2. **Find a story:** when the user has no obvious story in mind, choose a lightweight open-ended prompt that helps them notice material already in their life.
3. Capture remains one plain-text field. Prompts never become categories, metadata or homework.

### Remember
1. **Save:** one sentence is enough.
2. **Try immediately:** after saving, the user may run trigger → tell → reveal once to understand the loop. This does not change recall state.
3. **Rest:** a new story first returns after three local calendar days.
4. **Story trigger:** Today shows a short deterministic contextual handle without exposing the ending.
5. **Tell:** the user tries to tell it naturally before looking.
6. **Reveal:** Stories shows the exact original story.
7. **Rate scheduled returns:** `Not yet`, `Mostly`, or `Yes` adjusts future return strength.
8. **Practice anytime:** voluntary practice never mutates the saved schedule or recall strength.

### Tell
1. Each trigger includes one small, non-judgmental coaching nudge such as `Start with where you were` or `Tell it in under a minute`.
2. Story readiness is derived from real recall strength, never points or streaks.
3. A story becomes **Ready** after enough durable successful recall or when the user confirms they actually told it in real life.
4. `I told this` records the real-world outcome and does not change the recall schedule.
5. Today and Library can reflect the growing count of stories that are ready to tell, without turning it into a gamified score.

## Experience principles

- Capture must be easier than organising.
- Original story is source of truth.
- Never silently embellish or rewrite user content.
- Organisation is the system's job.
- A trigger should evoke, not answer.
- Natural telling matters more than verbatim recall.
- Help users notice stories, not just remember existing notes.
- Coach through tiny behavior prompts, not lessons, scores or templates.
- Today is a telling/remembering surface, not a recent-notes feed.
- Library owns browsing, finding and editing.
- Voluntary practice never counts as a scheduled review and never changes recall strength or due date.
- Five handled scheduled returns per day is enough.
- No backlog guilt, streak pressure or study-app mechanics.
- Readiness represents real tellability, not app activity.
- `I told this` is the closest v1 signal to the product's real-world goal.
- Privacy/offline behavior is part of product value.
- Every field and control must justify its friction.

## V1 functional requirements

### Capture / discover
- one multiline plain-text field;
- no title/category/folder/source/cue/date/formatting decisions;
- local draft recovery;
- explicit discard removes recovered draft;
- default free capture asks what the user would want to tell later;
- `Find a story` opens a rotating set of open-ended static prompts;
- prompted capture remains optional and writes ordinary story text only;
- first return automatically scheduled three local calendar days later;
- successful save offers `Try it now` before leaving the save flow;
- immediate practice must not mutate scheduling metadata.

### Today / remember
- due healthy stories use story trigger → tell → reveal → rating;
- trigger generation is deterministic, local and intentionally conservative;
- a progressive second hint may appear only on request;
- each telling attempt receives one lightweight coaching cue;
- rating options: Not yet / Mostly / Yes;
- Tomorrow defers only the due date while preserving durable/inferred strength;
- Stop resurfacing keeps the story in Library;
- maximum five handled scheduled stories per local day, persisted across navigation/relaunch;
- when nothing is due, `Try a story` selects an existing healthy story for read-only voluntary practice;
- when useful, Today reflects how many stories are Ready and offers `Find a story` as a discovery path;
- Today must not display a Recent/browse feed; Library owns that job;
- after daily engagement, reminders must not immediately re-nag about remaining backlog.

### Tell / outcome
- readiness states are derived: New → Getting ready → Ready;
- Ready means either a confirmed real-world telling or durable successful recall strength of at least 30 days;
- `I told this` is available after practice and from story actions;
- telling outcome stores `toldCount` and `lastToldAt` as additive local metadata;
- recording a tell must not change nextRecallAt, reviewStrengthDays or scheduled-review counts;
- feedback after recording a tell is brief and affirming, not celebratory gamification;
- no score, badge, streak, leaderboard or storytelling grade.

### Library
- flat searchable list;
- no user-visible path/folder/type dependency;
- exact phrase/fragments rank ahead of fuzzy matches;
- minor spelling errors should still recover plausible stories;
- opening a result goes directly to the original story;
- Ready may be shown as subtle metadata;
- Library header may show a small ready-to-tell repertoire count.

### Story
- body directly editable;
- debounced serialized autosave;
- latest text must win if typing overlaps a previous save;
- Android Back flushes latest non-empty text before leaving;
- action sheet starts with `Try telling` and `I told this`, followed by Share, Stop/Bring back and Delete;
- practice flushes the latest edit before opening and never alters recall state;
- Bring back starts a fresh resurfacing cycle without deleting real-world telling history;
- Delete is confirmed and permanent.

### Android delivery
- shipping platform is Android;
- preview builds are APKs for direct testing;
- production builds are AABs for Play distribution;
- release code minification and Android resource shrinking are enabled;
- unused development-client/animation/web native dependencies are not shipped;
- required Expo dependencies remain even when they are not directly imported by screens;
- generated `android/` source remains ephemeral; do not hand-maintain stale generated Gradle files.

### Reminders & privacy
- reminders off by default;
- contextual permission request only after the user has experienced return value;
- generic local notification text only;
- app-private storage, no account, no ads/analytics SDK, Android backup disabled;
- no AI required for core behavior.

## Internal compatibility

Existing beta stories may use an older serialized file representation. `legacy-memory-format.ts` is an isolated compatibility codec so upgrades preserve those stories. Additive recall-strength and telling-outcome metadata stays on storage schema v1 to preserve tester rollback compatibility. The codec is not part of current UX or the user mental model. Do not expose filenames, folders, Markdown, wikilinks or storage paths in the Android product.

## Non-goals for v1

AI features, sync/accounts, folders/tags, rich text/Markdown authoring, custom schedules, streaks, statistics dashboards, custom voice recording, knowledge graphs, public sharing feeds, story scoring, hook/punchline fields, storytelling lessons and export/import UI.

## Launch measurement

Early beta should prioritize qualitative evidence:
- users understand that Stories helps them have things to tell, not merely store notes;
- prompts help users discover stories they would otherwise overlook;
- triggers help users retrieve without revealing the story;
- micro-coaching makes retelling feel more natural without feeling like a course;
- the Ready repertoire feels motivating rather than gamified;
- users use `I told this` for genuine real-world telling events;
- voluntary practice feels useful without becoming homework;
- five scheduled returns feels manageable;
- search recovers forgotten saved stories;
- users report actually telling/reusing stories outside the app.

Do not add remote analytics solely to measure these until there is a demonstrated need.
