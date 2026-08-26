# Mobile Architecture

## Product boundary

The native app is the product. It exposes a small personal-memory model:

- capture ordinary text;
- keep an immutable semantic relationship to the user's original memory;
- generate a deterministic, non-revealing story cue from that text;
- schedule when the memory returns;
- collect a simple tellability outcome;
- search memories locally;
- edit, share, stop resurfacing, or delete.

No category, folder, formatting-language, link-graph, or storage-format concept belongs in the mobile interface.

## Local-first boundary

Memory content stays in app-private device storage. The storage adapter is intentionally below the product model so UI code works with `MemoryNote` rather than paths or file syntax.

Older installs may contain data written by previous builds. The core keeps a compatibility reader/writer so those memories remain available. Compatibility is an implementation concern and must not leak into new capture, Library, editing, review, Settings, onboarding, or store copy.

## Core responsibilities

`packages/core` owns:

- memory model and compatibility parsing;
- local vault semantics and safe writes;
- deterministic story cue generation;
- due-memory ordering;
- progressive return scheduling;
- stop-resurfacing behaviour.

## Mobile responsibilities

`apps/mobile` owns:

- Today and the tell-before-reveal session;
- one-step capture and draft recovery;
- Library search;
- plain memory reading/editing;
- notification permission and local reminders;
- native visual system, accessibility and navigation.

## Invariants

- Never reveal the full auto-title or original body before `Reveal`.
- Never invent content for a story cue.
- Never delete a memory when the user only stops resurfacing.
- Never show more than five due memories in a single session.
- Never require an account or network for the core loop.
- Never expose legacy storage concepts to new users.
