# Stories

Stories is a private, mobile-first app for keeping moments, ideas, and experiences available in your memory — so they are there when you have something worth telling.

## The product loop

1. **Capture naturally.** Write a moment, idea, observation, lesson, or detail without choosing a category or organising it.
2. **Let it rest.** A new memory quietly comes back after a few days.
3. **Use the clue.** Stories shows a small, non-revealing cue and asks you to try telling the memory before looking.
4. **Reveal the original.** The user's saved memory is always the source of truth.
5. **Answer one question.** `Not yet`, `Mostly`, or `Yes` tells Stories how available the memory felt.
6. **Bring it back intelligently.** Weak memories return sooner; strong memories spread out. A session is capped so resurfacing never becomes homework.

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

The Android-first app lives in `apps/mobile` and uses Expo, React Native, and Expo Router. It keeps memory content in app-private device storage and does not require an account.

```bash
cd apps/mobile
npx expo start
```

### Android smoke check

On a device, verify the complete core loop:

1. Fresh launch shows one clear explanation and one `Save your first memory` action.
2. Capture accepts ordinary text with no categories, formatting tools, cue fields, or scheduling setup.
3. Save returns to Today and confirms that the memory will come back later.
4. Make a memory due, then verify the hidden card shows only a short clue — never the full title/answer.
5. Try telling it, reveal it, and answer `Not yet`, `Mostly`, or `Yes`.
6. Complete five due memories and verify the session ends instead of showing an overdue queue.
7. Use `Tomorrow`, `Stop resurfacing`, edit, share, and delete.
8. Search Library using combinations of people, places, topics, and words from the memory.
9. Force-stop and relaunch; saved memories and return state must remain intact.
10. Check Android Back, keyboard resize, large text, TalkBack labels, touch targets, and notification permission behaviour.

## Compatibility

Stories preserves a compatibility layer for memories created by older builds so existing user data is not destroyed. Those older storage concepts are not part of the current mobile UI or new-memory model.

## Verification

```bash
npm run test:core
npm run test:mobile
npm run lint
cd apps/mobile && npx tsc --noEmit
```
