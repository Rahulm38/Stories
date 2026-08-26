# Stories

Stories is a private, Android-first app for keeping moments, ideas, and experiences available in your memory — so they are there when you have something worth telling.

## The product loop

1. **Capture naturally.** Write a moment, idea, observation, lesson, or detail without choosing a category or organising it.
2. **Let it rest.** A new memory quietly comes back after three local calendar days.
3. **Use the clue.** Stories shows a small deterministic cue and asks you to try telling the memory before looking.
4. **Reveal the original.** The user's saved memory is always the source of truth.
5. **Answer one question.** `Not yet`, `Mostly`, or `Yes` tells Stories how available the memory felt.
6. **Bring it back intelligently.** Weak memories return sooner; strong memories progressively spread out.
7. **Stop after five.** Today persists a five-memory daily limit across navigation and relaunch so resurfacing never becomes homework.
8. **Find it later.** Library search combines remembered fragments and tolerates small typos.

## Product principles

- Capture must feel easier than deciding not to capture.
- The original memory is always the source of truth.
- Stories helps people remember and tell; it does not write or embellish their memories.
- Organisation is the system's job, not the user's.
- A clue should trigger a memory without revealing the answer.
- Speaking and natural recall matter more than exact wording.
- Resurfacing should feel useful and calm, never like review debt.
- Every additional field must justify the friction it creates.
- Privacy is part of the product, not a premium feature.

## Mobile experience

The shipping client lives in `apps/mobile` and uses Expo, React Native, and Expo Router. It targets native Android/iOS; Android is the release priority. Memory content stays in app-private device storage and no account is required.

```bash
cd apps/mobile
npx expo start
```

Memory reading/editing is intentionally direct: the body is a plain multiline editor with serialized autosave. Android Back waits for the newest non-empty edit to become durable before leaving. Share, resurfacing, and delete actions live in a native-friendly bottom action sheet.

### Android smoke check

On a device, verify the complete core loop:

1. Fresh launch shows one clear explanation and one `Save your first memory` action.
2. Capture accepts ordinary text with no categories, formatting tools, cue fields, or scheduling setup.
3. Type an unfinished capture, leave/discard, and verify a discarded draft does not reappear.
4. Save returns to Today and confirms that the memory will come back later.
5. Make a memory due, then verify the hidden card shows only a short clue — never the full title/answer.
6. Try telling it, reveal it, and answer `Not yet`, `Mostly`, or `Yes`.
7. Handle five due memories; leave Today, reopen it, and relaunch the app. Verify the daily limit remains complete until the next local day.
8. Use `Tomorrow` and confirm later review strength is not inflated by the deferral.
9. Open a memory, edit rapidly, press Android Back during autosave, reopen and confirm the newest text won.
10. Exercise Share, Stop resurfacing / Bring back, and Delete from the bottom action sheet.
11. Search Library with combinations of people, places, topics, and a deliberate small typo.
12. Check keyboard resize, predictive Back, large text, TalkBack labels, touch targets, notification permission/channel and force-stop persistence.

## Compatibility

Stories preserves an isolated compatibility codec for memories created by older beta builds so app updates do not destroy existing user data. The current UI and product model do not expose file paths, folders, Markdown authoring, wikilinks, or memory kinds. A future storage migration should be explicit and tested against real beta data before compatibility support is removed.

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

GitHub Actions runs these checks on `main`. Physical Android QA remains required for device-only behavior.
