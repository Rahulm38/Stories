---
title: Users and Jobs
document_type: strategy
status: proposed
last_reviewed: 2026-08-24
---

# Users and jobs

## Primary user

The initial user is a reflective adult who reads, works, travels, learns through relationships, or makes decisions from experience. They already capture some notes, highlights, or journal entries, but often think: “I know I learned something relevant; I just cannot retrieve it now.” They value privacy and low maintenance more than collaboration or elaborate organization.

This is a behavior-based segment, not an occupation or demographic.

## Secondary users

- A reader who wants to remember a small number of actionable ideas without creating flashcards.
- A professional who wants lessons from projects, conversations, or mistakes to resurface.
- A journaler who wants selected experiences to become reusable learning rather than an archive.

## Explicit non-targets for v1

- Teams that need shared spaces, permissions, comments, or publishing.
- Students who need high-volume exam scheduling, decks, cloze deletion, or subject analytics.
- Users whose primary need is task execution, calendar planning, or habit streaks.
- Users who require cross-device real-time sync on day one.
- Users who need media-heavy research, PDF annotation, web clipping, or attachments.

## Jobs to be done

### Capture job

When an idea or experience feels worth keeping, help me preserve it before the moment passes, without forcing me to design a filing system.

Success signals:

- I can save body text alone.
- Optional classification and recall settings are understandable but out of the way.
- I know the save reached durable local storage.

### Retrieval job

When I know I captured something, help me find it through natural words, source, folder, or a link.

Success signals:

- Search behavior is predictable.
- Duplicate titles are disambiguated.
- Opening, editing, renaming, or moving a note does not silently break connections.

### Recall job

When a memory is beginning to fade, cue me to retrieve it before showing the answer, then close the loop in under 30 seconds.

Success signals:

- The cue gives enough context without leaking the answer.
- I can postpone without losing the item.
- Rating produces an understandable next return.
- A denied notification permission never removes in-app recall.

### Reuse job

When an old memory becomes relevant, help me add what changed or connect it to another memory without turning the moment into knowledge-management work.

Success signals:

- Reflection is optional and appended without destroying the original body.
- `[[wikilinks]]` remain ordinary Markdown.
- The app does not force a graph or backlink dashboard.

### Trust job

When I put personal writing into Stories, help me understand where it is, what can be lost, and how I can recover it.

Success signals:

- No account or network is needed for the core loop.
- Failures are explicit; the UI never claims a save that did not persist.
- Backup and restore preserve stable IDs, paths, metadata, Unicode, and links.

## User anxieties to design for

- “Will I lose this if I close the app now?”
- “Why is this returning, and can I turn it off?”
- “Did I just create a duplicate?”
- “Where are the actual files?”
- “Will uninstalling erase everything?”
- “Is the app reading or uploading my private notes?”
- “Am I falling behind if I ignore recalls?”

Stories must answer these through behavior and plain language, not onboarding slides.

## Critical research questions

1. Do users attempt recall before Reveal when no text-entry step is required?
2. Does “Not yet / Partly / Got it” feel nonjudgmental and map to perceived memory strength?
3. Is a default three-day return helpful or surprising?
4. Do users understand that app-private Markdown is local but not yet conveniently portable?
5. What minimum backup flow is required before users entrust emotionally important experiences?
6. Does app language remain useful for people who do not think in “notes,” “files,” or “spaced repetition” terms?
