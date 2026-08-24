---
title: Edge Cases and Error Handling
status: active
last_reviewed: 2026-08-24
---

# Edge Cases and Error Handling

## Data Safety Policy

The core rule of Stories is: **Never silently lose, corrupt, or overwrite a user's memory.**

When an operation fails:
1. **Preserve User Input**: Keep drafts editable and intact on screen.
2. **Preserve Prior Files**: Never overwrite an existing file unless the new write has been verified.
3. **Actionable Feedback**: Explain clearly what happened and how to recover.

---

## Critical Edge Cases by Category

### 1. Capture & Draft Safety
- **Empty / Whitespace Body**: Save button remains disabled; no file is created.
- **Accidental Navigation with Unsaved Draft**: Hardware Back, swipe gestures, or tab switches show a native confirmation: *"Keep editing"* or *"Discard draft"*.
- **Rapid Multi-Taps on Save**: Single-flight mutation locks the button (`Saving…`) to prevent duplicate notes.
- **Low Device Storage on Save**: If the filesystem write fails, the draft is preserved on screen with an error: *"Storage full. Free up space and try again."*

### 2. Recall & Time Handling
- **Time Zone or DST Shifts**: Recalls are evaluated based on local calendar dates; crossing midnight or changing time zones immediately recalculates the due queue.
- **No Due Memories**: Today displays the warm capture canvas and anticipation text for the next scheduled recall.
- **Multiple Memories Due**: Sorts earliest due first. No red numbers or panic triggers—all items wait calmly.
- **Blank Recall Cue**: Automatically falls back to kind-specific prompts ("What idea from this book stayed with you?").

### 3. File Identity & Integrity
- **Duplicate Titles**: Stored in collision-safe unique filenames (e.g. `atomic-habits-1.md`). The internal `id` remains distinct.
- **Malformed Frontmatter (External Edits)**: If frontmatter is corrupted outside Stories, the file is quarantined in-memory with raw text preserved rather than being overwritten.
- **File Deletion**: Requires an explicit confirmation dialog naming the memory. Inbound `[[wikilinks]]` remain visible in other notes as unlinked references.

### 4. Backup & Export
- **Interrupted Vault Export**: The existing vault remains untouched; partial archive files are safely cleaned up.
- **Corrupted Backup Import**: The archive is verified before modifying the filesystem. An automatic pre-restore backup ensures immediate rollback if an error occurs.

---

## Error Copy Guidelines

Every error message must answer three simple questions:
1. **What happened?** (*"This memory could not be saved."*)
2. **Is my previous work safe?** (*"Your existing files are untouched."*)
3. **What should I do next?** (*"Check storage space and tap Save again."*)
