# Stories v1 — Horizontal Execution Slices

Each slice must leave a complete, usable path. The schema and interfaces are owned centrally; agents work in separate file areas and integrate only through those contracts.

## Slice 1 — Capture a memory

**Outcome:** Save a Book learning, Experience, or unclassified Inbox item as local Markdown from Today.

**Includes:** inline text capture, optional kind, default folders, restart-safe persistence, compact library access.

**Acceptance criteria:** body-only save works; median capture is under 20 seconds; data survives relaunch and offline use; the file is valid UTF-8 Markdown.

**Excludes:** reminders, recall scoring, graph, sync, AI, rich text.

## Slice 2 — Bring it back

**Outcome:** A saved memory can return as a focused recall cue.

**Includes:** optional recall date, Today due queue, cue-first reveal flow, Remembered/Partial/Forgot outcome, deterministic next interval.

**Acceptance criteria:** due items work offline; recall completes in under 30 seconds; next due state survives relaunch; no source body appears before Reveal.

**Excludes:** native notification permission and OS scheduling.

## Slice 3 — Local notifications

**Outcome:** Optional device prompts lead directly to capture or a specific recall.

**Includes:** separate capture-prompt and recall-cue settings, permission states, scheduling adapter, deep links, duplicate reconciliation.

**Acceptance criteria:** notification opens the correct state in one transition; denial never blocks in-app recall; rescheduling produces no duplicate requests; lock-screen previews are privacy-safe by default.

**Excludes:** calendar/task behavior, push servers, engagement campaigns.

## Slice 4 — Connect memories

**Outcome:** A recall or note can link to another local memory without leaving the writing flow.

**Includes:** `[[` suggestions, resolved and unresolved links, stable IDs, rename/move safety, compact nearest-connections view.

**Acceptance criteria:** lookup responds within 200 ms at 5,000 notes; taps open the destination; unresolved links create a titled draft; the index rebuilds from files.

**Excludes:** global graph, backlink analytics, Obsidian plugins.

## Slice 5 — Native hardening

**Outcome:** The core loop is reliable on iOS and Android.

**Includes:** app-private Markdown storage, SQLite index, notification testing on physical devices, deep-link verification, backup/restore and web-vault migration.

**Acceptance criteria:** offline writes survive forced relaunch; scheduled cues reconcile after restart and upgrade; migration preserves stable IDs and links; backup/restore recovers at least 99% of test notes.

**Excludes:** accounts and sync.

## Parallel work lanes

- **Data lane:** Markdown schema, repository, serializer, search/link index, migrations.
- **Time lane:** due-queue rules, reminder abstraction, native scheduling, permission states.
- **Experience lane:** Today capture, recall, library, note editor, connection flow.
- **Quality lane:** offline, relaunch, rename-link, notification, backup, and migration scenarios.

Only one slice is integrated at a time. Within the active slice, lanes can proceed in parallel after the interface contract and acceptance criteria are frozen.

## Build order

The prototype should answer the riskiest product question first: **does cue-first recall feel meaningfully better than saving and rereading a note?** Build Slice 1 and the in-app portion of Slice 2 before native reminders, graph exploration, or sync.
