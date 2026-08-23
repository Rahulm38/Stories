# MemoryOS Android-first mobile map

## Destination

Ship a light Android-first native MemoryOS client whose local Markdown vault, folders, links, cue-first recall, and note behavior compile unchanged on iOS later.

## Notes

Use the Matt Pocock specification, deep-module, tracer-bullet, and diagnosis disciplines. Keep the product focused on remembering book learnings and lived experiences. No AI, export screen, global graph, backlinks, cloud sync, or rich text in this map.

## Decisions so far

- Expo/React Native + Expo Router — one TypeScript screen and behavior path for Android and iOS.
- `packages/core` owns `MemoryVault` — storage, Markdown, and link complexity stays behind one deep seam.
- App-private Markdown is the source of truth — SQLite is a rebuildable later index.
- Today / Files / Settings are the only primary destinations — capture and notes are pushed native screens.

## Frontier

- [01 — Capture to a local Markdown file](issues/01-capture-local-markdown.md)
- [02 — Files to note](issues/02-files-to-note.md)
- [03 — Link another file](issues/03-link-another-file.md)
- [04 — Cue-first recall](issues/04-cue-first-recall.md)
- [05 — Native hardening and iOS parity](issues/05-native-hardening.md)

## Not yet specified

- How a user-selected external folder should be granted and reconciled on Android and iOS.
- Whether recall notifications should use a single daily digest or individual cues.
- What backup/restore UX should look like without turning into an export product.

## Out of scope

AI/chat, generated summaries, a global Obsidian-like graph, backlinks dashboards, collaboration, accounts, sync, attachments, tasks, and rich-text formatting.
