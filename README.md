# Stories

Stories is a private Android app for building a bank of moments, ideas and experiences you can actually remember and tell when conversation creates the opportunity.

## The product loop

1. **Save naturally.** Write one moment, observation, idea or detail without organising it.
2. **Experience the loop immediately.** After saving, `Try telling it now` shows a small clue, asks you to tell the memory, then reveals the exact original. This demonstration does not change its return schedule.
3. **Let it rest.** A new memory first comes back after three local calendar days.
4. **Tell before looking.** Today shows a deterministic clue, then Reveal shows the original memory.
5. **Rate availability.** `Not yet`, `Mostly`, or `Yes` controls how soon the memory returns next.
6. **Keep sessions calm.** At most five scheduled memories are handled per local day.
7. **Practice anytime.** When nothing is due, `Try one now` runs the same clue → tell → reveal loop without modifying recall strength or due date.
8. **Find anytime.** Library search combines remembered fragments and tolerates small typos.

Today is for telling and remembering. Library is for finding, reading and editing. Stories deliberately does not put a recent-notes feed on Today.

## Product principles

- Capture must be easier than organising.
- The original memory is always the source of truth.
- Stories helps people remember and tell; it does not write or embellish their memories.
- A clue should trigger a memory without revealing the ending.
- Natural telling matters more than verbatim recall.
- Voluntary practice must never fake stronger memory or move a scheduled return.
- Resurfacing should feel useful and calm, never like review debt.
- No categories, folders, streaks, statistics, AI rewriting or storytelling homework in the core loop.
- Privacy is part of the product.

## Android client

The shipping client lives in `apps/mobile` and uses Expo, React Native and Expo Router. The shipping configuration targets **Android only**. Memory content stays in app-private device storage and no account is required.

```bash
cd apps/mobile
npx expo start
```

Release builds enable Android code minification and resource shrinking. Unused development-client and animation/worklet dependencies have been removed; `expo-font` remains because `expo-symbols` requires it. Preview builds remain APKs for direct testing; production builds remain AABs so Google Play can deliver device-specific splits.

Memory editing is direct plain text with serialized autosave. Android Back waits for the newest non-empty edit to become durable before leaving. `Try telling`, Share, resurfacing and delete actions live in the memory action sheet.

### Android smoke check

1. Fresh launch explains the story-bank value and offers `Save your first story`.
2. Capture accepts ordinary text with no categories, formatting tools, cue fields or scheduling setup.
3. Save a story and verify `Try telling it now` appears before returning to Today.
4. In immediate practice, tell from the clue, reveal the original, finish, and verify the memory is still scheduled for three days later.
5. When nothing is due, use `Try one now`; verify practice does not move the due date or alter recall status/strength.
6. Make a memory due; verify Today shows the clue → `Reveal original` → `Not yet` / `Mostly` / `Yes` loop.
7. Handle five due memories; leave/reopen Today and relaunch. Verify the daily limit remains complete until the next local day.
8. Use `Tomorrow` on current and older-beta memories; verify deferral does not inflate later review strength.
9. Open a Library memory, edit rapidly, press Android Back during autosave, reopen and confirm the newest text won.
10. From a memory action sheet, exercise `Try telling`, Share, Stop/Bring back and Delete.
11. Search Library using multiple fragments and a deliberate small typo.
12. Verify capture draft recovery/discard, force-stop persistence, keyboard resize, predictive Back, large text, TalkBack, notification permission/channel and generic notification content.

## Compatibility

Stories keeps an isolated compatibility codec for memories created by older beta builds. `reviewStrengthDays` is additive metadata and the serialized compatibility format remains schema v1 so a temporary rollback to an older tester APK does not make newly edited memories unreadable. The current UI does not expose file paths, folders, Markdown authoring, wikilinks or memory kinds.

## Verification

```bash
npm ci
npm --prefix apps/mobile install
npm test
npm run lint
npm run build
npm --prefix apps/mobile exec tsc -- --noEmit
cd apps/mobile && npx expo-doctor
```

GitHub Actions runs these checks on `main`. Repository checks do not replace physical Android QA for device-only behavior.
