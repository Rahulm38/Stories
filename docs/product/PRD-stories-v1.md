# Stories v1 — Product Requirements

> The detailed, living PRD is the tracked Obsidian vault at
> [`product-vault/00 Product Home.md`](../../product-vault/00%20Product%20Home.md).
> This document is retained as the concise original product brief.

## Product promise

Stories helps people turn book learnings and lived experiences into memories they can retrieve and reuse. It is a local-first recall companion, not a general notes, tasks, or reminders app.

The core loop is:

**Capture → Cue → Recall → Connect**

## Target user and job

The first user regularly thinks: “I know I read or experienced something relevant, but I cannot retrieve it when it matters.”

- When an idea or experience feels worth keeping, help me record it before the moment passes.
- When I am beginning to forget it, bring it back in a small, useful dose.
- Ask me to recall before showing the source note.
- Let recall produce a reflection or connection, rather than passive rereading.
- Keep everything as ordinary, local Markdown that remains useful without Stories.

## Product principles

1. **Memory before notes.** The daily surface is for capture and recall; files remain the durable library beneath it.
2. **Text before chrome.** One dominant action per screen, quiet controls, no hover-dependent behavior or decorative motion.
3. **Structure after capture.** A user can save plain text immediately. Folder, source, cue, and links are optional.
4. **Prompts with purpose.** Capture prompts ask whether something was worth keeping. Recall notifications point to a specific memory.
5. **Local and portable.** Markdown is the source of truth; indexes and schedules can be rebuilt from it.

## Content model

The initial memory types are:

- **Book learning:** the idea in the user's words, optional book/author/page, and an optional recall cue.
- **Experience:** what happened, what changed, optional context, and an optional recall cue.
- **Inbox item:** frictionless text captured without classification and organized later if useful.

Folders begin with `Inbox/`, `Books/`, and `Experiences/`. Notes support Markdown, bullets, and `[[wikilinks]]`.

## Core flows

### Capture

1. Today asks: “What is worth keeping?”
2. The user writes one sentence or a longer Markdown note.
3. The user may choose Book learning or Experience and may set “Bring this back.”
4. Saving is immediate and returns to Today.

### Recall

1. A due cue appears in Today or through an optional local notification.
2. The user sees the cue before the note body.
3. The user attempts recall, then reveals the note.
4. The user marks `Remembered`, `Partial`, or `Forgot`; Stories chooses the next interval.
5. The user may add one reflection or `[[connection]]` without leaving the flow.

### Library

1. The user browses a simple folder tree or searches all Markdown files.
2. Tapping a file opens a compact reading/editing view.
3. `[[links]]` open directly; an unresolved link can create a new note.
4. Nearest connections may be shown inline. A global graph is deferred.

## First-release acceptance criteria

### Capture

- A memory can be saved with body text alone.
- App-open to saved note takes under 20 seconds in median usability testing.
- Type selection and recall scheduling add no more than two taps each.
- Notes survive relaunch and airplane-mode use.
- At least 8 of 10 test users can capture a book learning without instruction.

### Recall

- A notification opens the relevant recall cue in one transition.
- The original note remains hidden until the user chooses Reveal.
- A recall can be completed in under 30 seconds.
- Recall status and next due date persist locally.
- Permission denial leaves a complete in-app Today queue.
- Reminder reconciliation never creates duplicate notifications.

### Links and files

- `[[` searches local titles and inserts a valid link.
- Tapping a link opens the target; unresolved links offer note creation.
- Renaming or moving a note does not silently break connections.
- Search and link lookup remain responsive with 5,000 notes on the reference device.
- The local index can be deleted and rebuilt from Markdown without data loss.

## Success measure

The primary metric is **weekly remembered-and-reused memories per active user**: recalls marked Remembered or Partial that receive a reflection or connection within seven days.

Guardrails:

- Fewer than two unwanted notifications per user per month.
- Less than 10% of captures abandoned because organization or scheduling feels burdensome.
- Local backup and restore recover at least 99% of test notes and their stable identifiers.

## Non-goals

- AI summaries, chat, automatic organization, or generated insights.
- Generic tasks, calendars, habit tracking, or streak-led gamification.
- Cloud accounts, collaboration, publishing, or cross-device sync.
- Rich-text editing, web clipping, attachments, or plugin compatibility.
- A global graph until real link usage proves it is useful.
- A dedicated export screen. Portability comes from the Markdown storage contract and later Files access/backup.

## Device-storage plan

The native app stores Markdown files in app-private device storage. Each file carries a stable ID and minimal frontmatter for type and recall state; its body remains plain Markdown. A small SQLite index supports search, links, and due queues and is always rebuildable.

The current web prototype should use the same repository interface with browser-local storage. A later native adapter can use app-private files on iOS and Android. User-selected Files-folder access and backup come after local reliability; optional encrypted sync comes only after identity, recovery, encryption, and conflict behavior are explicitly designed.
