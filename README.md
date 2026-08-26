# Stories

Stories is a private Android app for building a bank of moments, ideas and experiences you can actually remember and tell when conversation creates the opportunity.

## The product loop: Discover → Remember → Tell

### Discover
1. **Something happened.** Capture a moment, observation, opinion or idea directly in one plain-text field.
2. **Find a story.** If nothing obvious comes to mind, choose an open-ended prompt that helps surface a story already in your life. Prompts create no categories or metadata.

### Remember
3. **Experience the loop immediately.** After saving, `Try it now` shows a Story Trigger, asks you to tell the story, then reveals the exact original. This demonstration does not change its return schedule.
4. **Let it rest.** A new story first comes back after three local calendar days.
5. **Tell before looking.** Today shows a deterministic contextual trigger with an optional hint.
6. **Rate availability.** `Not yet`, `Mostly`, or `Yes` controls how soon a scheduled story returns next.
7. **Keep sessions calm.** At most five scheduled stories are handled per local day.
8. **Practice anytime.** `Try a story` runs trigger → tell → reveal without modifying recall strength or due date.

### Tell
9. **Build fluency subtly.** Each telling attempt can include one small cue such as `Start with where you were.` or `Tell it in under a minute.` No course, grade or score.
10. **Build a repertoire.** Stories move naturally from New → Getting ready → Ready. Ready is derived from durable retrieval strength or a confirmed real-world telling—not app activity.
11. **Close the real-world loop.** `I told this` records that the story was actually used in conversation without changing its recall schedule.
12. **Find anytime.** Library search combines remembered fragments and tolerates small typos; Ready stories are marked lightly.

Today is for discovering, telling and remembering. Library is for finding, reading and editing. Stories deliberately does not put a recent-notes feed on Today.

## Product principles

- Capture must be easier than organising.
- Help people notice stories, not merely store notes.
- The original story is always the source of truth.
- Stories helps people remember and tell; it does not write or embellish their stories.
- A trigger should evoke a story without revealing the ending.
- Natural telling matters more than verbatim recall.
- Micro-coaching should help fluency without becoming lessons or grading.
- Readiness should reflect actual tellability, never streaks, points or arbitrary percentages.
- `I told this` is the closest v1 signal to the real product outcome.
- Voluntary practice must never fake stronger recall or move a scheduled return.
- Resurfacing should feel useful and calm, never like review debt.
- No categories, folders, streaks, statistics dashboards, AI rewriting or storytelling homework in the core loop.
- Privacy is part of the product.

## Android client

The shipping client lives in `apps/mobile` and uses Expo, React Native and Expo Router. The shipping configuration targets **Android only**. Story content and outcome metadata stay in app-private device storage and no account is required.

```bash
cd apps/mobile
npx expo start
```

Release builds enable Android code minification and resource shrinking. Unused development-client and animation/worklet dependencies have been removed; `expo-font` remains because `expo-symbols` requires it. Preview builds remain APKs for direct testing; production builds remain AABs so Google Play can deliver device-specific splits.

Story editing is direct plain text with serialized autosave. Android Back waits for the newest non-empty edit to become durable before leaving. `Try telling`, `I told this`, Share, resurfacing and Delete live in the story action sheet.

### Android smoke check

1. Fresh launch explains the story-bank value and offers both `Save something` and `Find a story`.
2. Open `Find a story`; choose a prompt, write normally and verify no category/metadata is created.
3. Free capture accepts ordinary text with no categories, formatting tools, trigger fields or scheduling setup.
4. Save a story and verify `Try it now` appears before returning to Today.
5. In immediate practice, tell from the trigger, optionally request a hint, reveal the original, and verify the story is still scheduled for three days later.
6. Verify the telling prompt includes a small coaching cue and never edits or scores the story.
7. When nothing is due, use `Try a story`; verify voluntary practice does not move the due date or alter recall status/strength.
8. Use `I told this`; verify toldCount/lastToldAt persist and the recall schedule remains unchanged.
9. After two successful remembered returns (14d then 30d strength), verify the story shows Ready; a genuinely told story should also show Ready.
10. Verify Today/Library show a subtle ready-to-tell repertoire count without streaks/points/percentages.
11. Make a story due; verify Today shows Story Trigger → `Show story` → `Not yet` / `Mostly` / `Yes`.
12. Handle five due stories; leave/reopen Today and relaunch. Verify the daily limit remains complete until the next local day.
13. Use `Tomorrow` on current and older-beta stories; verify deferral does not inflate later review strength.
14. Open a Library story, edit rapidly, press Android Back during autosave, reopen and confirm the newest text won and telling metadata survived.
15. From a story action sheet, exercise `Try telling`, `I told this`, Share, Stop/Bring back and Delete.
16. Search Library using multiple fragments and a deliberate small typo.
17. Verify capture draft recovery/discard, force-stop persistence, keyboard resize, predictive Back, large text, TalkBack, notification permission/channel and generic notification content.

## Compatibility

Stories keeps an isolated compatibility codec for stories created by older beta builds. `reviewStrengthDays`, `toldCount` and `lastToldAt` are additive metadata and the serialized compatibility format remains schema v1 so a temporary rollback to an older tester APK does not make newly edited stories unreadable. The current UI does not expose file paths, folders, Markdown authoring, wikilinks or legacy memory kinds.

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

GitHub Actions also performs a clean Android prebuild and Android Metro export. Repository checks do not replace physical Android QA for device-only behavior.
