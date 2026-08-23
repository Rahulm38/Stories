# Android-first vertical slices

These are tracer-bullet slices. Each one should be demoable on Android and type-check on iOS before the next slice starts.

## 01 — Capture to a local file

**Blocked by:** none

**What it delivers:** Today opens a focused native composer, saves a Note, Book learning, or Experience as Markdown in app-private storage, and shows a saved state.

- [x] one dominant capture action
- [x] no modal editor or hover-only interaction
- [x] keyboard-safe writing space
- [x] body-only save works
- [x] kind selects folder (`Inbox`, `Books`, `Experiences`)
- [x] app restart reads the Markdown files back

## 02 — Library to note

**Blocked by:** 01 — Capture to a local file

**What it delivers:** Library shows book learnings, experiences, and Inbox notes from the local Markdown vault; tapping a memory opens a compact reading screen and returns through an explicit Library action.

- [x] folder-first list
- [x] search by title, body, folder, and kind
- [x] no empty default-folder wall
- [x] basic headings, bullets, tasks, and paragraphs render in reading mode
- [x] edit stays on the note screen

## 03 — Link another file

**Blocked by:** 02 — Library to note

**What it delivers:** Typing `[[` in the editor suggests existing local files; selecting one inserts a canonical path and tapping it opens the intended note.

- [x] suggestions exclude the current note
- [x] duplicate filenames use a folder-qualified path
- [x] resolved links use native stack navigation
- [x] unresolved links create a draft in the target folder
- [x] rename/move preserves all path-qualified links

## 04 — Recall that earns its place

**Blocked by:** 01 — Capture to a local file

**What it delivers:** A book learning or experience due for recall appears on Today, asks for an attempt before reveal, and persists the next due date.

- [x] due queue checks `nextRecallAt`
- [x] Later moves the cue without losing it
- [x] Remembered / Partly / Forgot choose deterministic intervals
- [x] relaunch preserves recall state

## 05 — Android hardening, then iOS parity

**Blocked by:** 01, 02, 03, and 04

**What it delivers:** The same app code passes forced-relaunch, keyboard, deep-link, backup, and migration checks on Android and launches on iOS without a feature rewrite.

- [ ] Android device/emulator test
- [ ] iOS simulator compile/test
- [ ] rebuildable SQLite index
- [ ] backup/restore of Markdown and stable IDs
- [ ] local notification adapter
