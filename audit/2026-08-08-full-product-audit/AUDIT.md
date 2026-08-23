# MemoryOS product, UX, architecture, and bug audit

Date: 2026-08-08

Scope: the Next.js reference client, the Expo SDK 57 Android-first app, and the shared `packages/core` vault. The native app was reviewed at a 390 x 844 Android-sized viewport and exercised through capture, save, files, note reading, editing, and missing-wikilink creation.

## Outcome

The native foundation is deliberately quiet and legible, with an Obsidian-like Markdown/link model and a Notion-like emphasis on readable content rather than chrome. The highest-risk local-data and recall defects found during the audit were fixed. The remaining blockers are device capabilities and release hardening, not an iOS rewrite.

## Flow review

1. **Today and capture entry — healthy.** One dominant action, plain explanation, native-size controls, and no competing dashboard widgets. Screenshot: [Expo Today](05-expo-today-mobile.png).
2. **Capture — healthy.** Body-first writing, explicit Note/Book learning/Experience choice, optional recall scheduling, honest local-storage copy, and visible save failures. Screenshot: [Expo capture](06-expo-capture-mobile.png).
3. **Files — healthy.** Searchable, virtualized, folder-grouped list; empty vault has one clear action; duplicate titles disclose their paths. Screenshot: [Expo Files](07-expo-files-mobile.png).
4. **Reading and linking — healthy.** A compact native reading screen keeps Markdown legible. `[[links]]` open resolved notes; missing links create a draft in the intended folder; ambiguous names ask for a qualified path instead of creating duplicates. Screenshot: [Expo note](08-expo-note-mobile.png).
5. **Recall — functionally healthy, device QA pending.** The answer stays hidden through cue and attempt, then Remembered/Partly/Forgot schedules a deterministic next interval. “Later” persists tomorrow rather than dismissing the item.
6. **Settings — honest but intentionally small.** It explains local storage and product boundaries. The web prototype no longer exposes a fake notification switch.

## Bugs fixed

- A native edit could erase `nextRecallAt` and other recall metadata.
- Moving a file could delete the source before the destination write succeeded.
- Qualified backlinks were left broken after a move.
- Duplicate bare wikilinks resolved by array order; punctuation such as `C++` could collide fuzzily.
- Missing links in the native reader did nothing.
- Capture and edit screens could imply success after a failed write.
- Corrupt browser storage was silently replaced with demo notes.
- The native recall screen revealed the answer before the user attempted recall.
- Recall due time could become stale and due items were not deterministically ordered.
- Native Files rendered every note in a `ScrollView` instead of a virtualized list.
- Default tab icons rendered as generic chevrons; native Material/SF symbols are now explicit.
- The web settings reminder control claimed behavior that did not exist.
- The web client used a Next.js dependency chain with four high-severity production advisories; Next.js and its matching ESLint config were upgraded to 16.3.0 and safe transitive audit fixes were applied.

## Architecture result

`packages/core` is the deep, framework-free module. It owns Markdown parsing/serialization, stable IDs, collision-safe paths, wiki-link semantics, safe saves and moves, backlink repair, and recall scheduling. React Native screens call the `MemoryVault` contract through a provider. Browser and device storage are adapters; Android and iOS share the same screens, domain logic, file format, and navigation.

The Next.js prototype remains a reference client and still has its older independent store. Migrating it onto `packages/core` would remove duplicated semantics, but it is not required for Android or iOS delivery.

## Verification

- Shared core: 7 tests passed.
- Root ESLint: passed.
- Mobile TypeScript: passed.
- Expo Doctor: 20/20 checks passed.
- Expo web/static export: passed (10 routes).
- Next.js production build: passed (12 routes).
- Expo dependency check: passed using the installed SDK 57 dependency map because network access was disabled.
- npm audit: zero production or development vulnerabilities after remediation.

## Remaining release work, in priority order

1. Run forced-relaunch, keyboard, Android hardware Back, file-move, and TalkBack tests on an Android device/emulator.
2. Add a local-notification adapter only after the exact permission and scheduling experience is tested on Android; keep it behind the same platform seam for iOS.
3. Add Markdown export/import and restore tests before real user data is entrusted to the app.
4. Add a rebuildable SQLite search index once vault size makes linear search measurable.
5. Compile and smoke-test the same Expo project in an iOS simulator, then add iOS signing and App Store metadata. No screen or domain rewrite should be necessary.

## Visual evidence

The numbered screenshots in this folder are retained as the audit trail. Files `05` through `08` are the final Expo implementation; files `01` through `04` capture the reference web experience reviewed earlier in the audit.
