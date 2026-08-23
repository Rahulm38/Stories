# Stories mobile architecture

## Decision

Use Expo SDK 57 with React Native and Expo Router for the Android-first app. The same TypeScript screens, navigation model, Markdown format, and vault contract run on iOS later; platform-specific behavior sits behind adapters.

This is deliberately not a wrapper around the Next.js UI. The web prototype remains a reference client for product behavior. The native app uses system text input, safe areas, native tabs, keyboard avoidance, and platform navigation.

## Deep seam

`packages/core` owns the small, framework-free `MemoryVault` interface:

- Markdown frontmatter parsing and serialization
- stable note IDs and collision-safe paths
- folder grouping
- `[[wikilink]]` suggestions and resolution
- save/read/list behavior

`apps/mobile/src/vault` supplies the adapter. Android and iOS use app-private Markdown files through Expo FileSystem. The browser preview uses a localStorage adapter only for visual validation.

Screens never manipulate paths or storage directly. They call `useVault`, which exposes notes, save, suggestion, and resolution behavior. This keeps Android and iOS changes local to the adapter or native shell.

## Storage plan

The first slice writes one UTF-8 Markdown file per note under the app's document directory:

```text
stories-vault/
  Inbox/
  Books/
  Experiences/
```

Frontmatter stores only stable ID, title, kind, folder, dates, and optional recall state. The body stays ordinary Markdown. A rebuildable SQLite index is a later hardening slice; it is not the source of truth.

## Native navigation

The first native shell has three tabs: Today, Library, and Settings. Library is the user-facing view of the Markdown vault, organized around book learnings, experiences, and Inbox items. A note is pushed on a native stack. The note header's Library action is explicit and deterministic; it never depends on browser history. Android hardware Back and the iOS back gesture remain platform-owned.

## Product boundaries

Keep out of this slice: AI, chat, export screens, backlinks, global graph, cloud sync, rich text, tasks, and decorative motion. The product differentiator is cue-first recall of book learnings and experiences, not a general notes surface.

## Verification boundary

The project is managed Expo rather than a hand-maintained Android directory. That keeps iOS available without a second UI implementation. The current environment has Node and Expo dependencies but no Android SDK/emulator, so lint, TypeScript, Expo web export, and config validation are automated here; Android device/emulator verification is the next hardware step.
