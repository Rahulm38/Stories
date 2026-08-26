---
title: Memory Editing and Content Model
status: active
last_reviewed: 2026-08-26
---

# Memory Editing and Content Model

## User-facing model

A memory is the text the user chose to keep. The original text is the source of truth.

The Android UI does not ask users to manage:
- title;
- category/kind;
- folder/path;
- source field;
- recall cue;
- schedule date;
- formatting syntax.

Those older fields may exist internally on beta memories only for compatibility.

## Direct editing

Opening a memory places the body in a plain multiline editor immediately. There is no separate `Edit` mode or Save button.

Autosave requirements:
- debounce normal typing;
- serialize overlapping writes;
- if the user types new text while an earlier write is in flight, the newest text must be saved next;
- surface a quiet `Saving…` / `Saved` state;
- surface errors visibly and keep the unsaved text in the editor;
- never save an empty memory over a previously valid memory.

## Android Back

If current text differs from the last durable text or a write is in flight:
1. prevent navigation;
2. flush the newest non-empty text;
3. verify no newer text appeared during the write and flush again if required;
4. only then dispatch the pending navigation action.

If the body is empty, offer `Keep writing` or `Restore saved version` rather than destroying the previous memory.

## Memory actions

Use a bottom action sheet so Android is not constrained by Alert button count.

- **Share** — system share sheet with current plain text.
- **Stop resurfacing** — clears future due date but keeps the memory.
- **Bring back in 3 days** — starts a fresh resurfacing cycle by clearing old rating/last-return/strength state.
- **Delete memory** — destructive confirmation; permanently removes local memory.

## Legacy content conversion

When an older memory contains formatting syntax, editing converts it to ordinary readable text. Conversion must preserve meaningful content. In particular, a legacy external link such as `[Reference](https://example.com)` should become readable text that retains the URL rather than silently losing it.

## Internal compatibility

The existing beta storage representation is isolated in `packages/core/src/legacy-memory-format.ts`. Do not introduce new UI or product logic that depends on its filename extension, frontmatter, folder or formatting syntax. Any future migration away from it must have explicit rollback/compatibility tests before deleting reader support.
