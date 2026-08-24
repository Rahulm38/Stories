---
title: Scope and Principles
document_type: strategy
status: approved
last_reviewed: 2026-08-24
---

# Scope and principles

## Product principles

1. **Memory before notes.** Today serves capture and recall. Library is durable infrastructure, not the product’s center of gravity.
2. **Text before chrome.** Use native, low-chrome, full-screen surfaces. One primary action per state.
3. **Structure after capture.** Body text is sufficient. Type, source, cue, folder, and timing are optional or defaulted.
4. **Attempt before answer.** A due memory never exposes its stored body until the user explicitly reveals it.
5. **Calm over compulsion.** No streaks, overdue guilt, scores, confetti, or red backlog badges.
6. **Local truth.** Markdown files are authoritative. Indexes, queues, and notification requests are derived and rebuildable.
7. **Failure must be visible.** Never clear a draft, navigate away, or confirm success before a verified durable write.
8. **Portable format, honest portability.** Do not call data “portable” until users can actually back it up and restore it.
9. **Native behavior is part of quality.** Keyboard, safe areas, back gestures, lifecycle, font scaling, and assistive technology are requirements.
10. **Evidence before breadth.** Graphs, AI, sync, and advanced organization wait until the core loop earns them.

## In scope for the complete v1 PRD

- Android-first native client with iOS-compatible shared architecture.
- Today, Library, and Settings navigation.
- Note, Book learning, and Experience capture.
- App-private Markdown vault with stable metadata.
- Read/edit, Markdown basics, nested folders, search, and wikilinks.
- In-app cue-first recall with deterministic intervals and reflection.
- Optional local notifications with privacy-safe previews and deep links.
- Backup, restore, migration, and index rebuild.
- Accessibility, localization-safe date/time handling, and offline reliability.
- Privacy disclosure and device-data lifecycle handling.

## Minimum lovable release boundary

Release only when capture, in-app recall, editing, and relaunch persistence have passed physical Android device tests; blocking data-loss cases have recovery behavior; the user can make a backup; and notification denial leaves a fully useful product.

## Deferred until evidence

- Global graph and backlink dashboard.
- AI summarization, chat, embeddings, automatic tagging, or generated cues.
- Cloud accounts and cross-device sync.
- Collaboration, comments, publishing, or shared vaults.
- Tasks, calendar integration, habits, goals, streaks, or gamification.
- Attachments, camera, audio, scanning, PDF annotation, and web clipping.
- Rich text/WYSIWYG, themes marketplace, plugins, or Obsidian compatibility claims.
- Advanced spaced-repetition algorithms or deck management.
- Desktop-first app.

## Scope-change test

A proposed feature enters the core release only if it:

1. materially improves Capture → Recall → Reuse;
2. cannot be achieved with the existing text-first flow;
3. does not compromise offline/private behavior;
4. has a measurable acceptance criterion;
5. has explicit error, migration, and accessibility handling;
6. displaces something of lower value rather than silently expanding scope.

## Platform order

1. Validate Android on a physical device or emulator.
2. Fix platform-level reliability and accessibility failures.
3. Compile and smoke-test the shared app on iOS.
4. Add only minimal platform adapters where native behavior differs.

“Android-first” is a validation order, not permission to hard-code Android assumptions into shared data or screen contracts.
