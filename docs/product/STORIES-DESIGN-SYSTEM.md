# Stories Design System

## Product character

Stories is calm, private and human. It should feel polished enough for a top Play Store app without feeling like a dashboard, study tool or file manager.

The experience is designed around one loop:

> Save something worth keeping → let it rest → see a small clue → try telling it → reveal the original → answer how tellable it felt → move on.

## Foundations

### Colour

Use semantic tokens from `apps/mobile/src/ui/theme.ts`. New screens must not introduce raw colour values.

- `canvas`: warm page background
- `surface`: interactive/grouped surfaces
- `surfaceMuted`: quiet icon or status backgrounds
- `textPrimary`: reading content
- `textSecondary`: support and metadata
- `divider`: hairlines
- `action`: primary interaction/focus
- `actionMuted`: subtle action tint
- `success`: completion/privacy state
- `danger`: destructive/error state only

### Typography

Use system fonts and the token scale: display, title, section, body, supporting, metadata, action. Keep body reading comfortable and support system text scaling.

### Spacing and shape

- 4pt baseline spacing system.
- 48dp minimum interactive targets.
- 12dp controls, 16dp cards, compact 8dp icon containers.
- Prefer whitespace and dividers to extra cards and borders.

## Icon system

Use `expo-symbols` so iOS and Android receive familiar platform symbols.

Use icons when they improve scanning or action recognition, generally together with text for non-obvious actions.

Preferred metaphors:

- add → New memory
- search → Library search
- eye → Reveal
- microphone/voice → tell aloud hint
- clock/history → returns and Tomorrow
- pencil → Edit
- archive → Library / stopped resurfacing
- bell → reminders
- lock → privacy
- overflow → secondary actions

Avoid decorative icon noise. One primary action still dominates each state.

## Screen patterns

### Today — empty

- One small visual mark.
- `Save it now. Tell it later.`
- One sentence explaining clue → tell → reveal.
- One primary action: `Save your first memory`.
- No onboarding carousel.

### Today — memory back

Order:

1. `From X days ago`
2. short story cue
3. `Try telling it without looking. Out loud if you can.`
4. `Reveal` primary, `Tomorrow` secondary
5. original memory after reveal
6. `Could you tell it?`
7. `Not yet / Mostly / Yes`

Never display an auto-derived title before reveal if it can expose the memory.

After five memories, show `Done for now`. Never show a backlog or catch-up count.

### Capture

- Prompt: `What's worth remembering?`
- Supporting: `A moment, idea or detail is enough. Write it naturally.`
- Plain writing canvas.
- Small return hint.
- Full-width `Save memory` action.

Nothing else.

### Library

- Display title + count.
- Search field with search icon and placeholder `Search people, places, moments…`.
- Simple rows with a subtle memory icon, title, short snippet/cue and date.
- No type filters, folder browser, or implementation metadata.

### Memory

- Readable original content with one quiet return-state line.
- Edit text action + icon; overflow for Share, Stop resurfacing/Bring back, Delete.
- Edit is only the memory text. Do not add a separate title, category, cue, or return-date form.

### Settings

Only real preferences and trust surfaces:

- Quiet reminder with bell icon.
- Local privacy with lock icon.
- Privacy policy.

## Interaction and motion

- Prefer platform-native presses, alerts, date pickers, keyboard behaviour and transitions.
- Keep primary actions stable between states.
- Avoid modal chains.
- Use polite status messages rather than celebratory overlays.
- No streaks, badges, confetti, red debt counts or punitive copy.

## Copy

Use ordinary spoken language.

Preferred: Save, Tell, Reveal, Tomorrow, Comes back, Stop resurfacing, Not yet, Mostly, Yes.

Avoid study-system language, storage terminology, technical metadata and judgmental failure language.

## Accessibility and Android quality gates

- Every icon-only action has an accessibility label.
- Colour is never the only signal.
- Text can wrap at large system font sizes.
- Minimum touch target is 48dp.
- Content respects safe insets and keyboard resize.
- Verify TalkBack reading order, hardware Back, focus, disabled/busy states, notification permission, force-stop persistence and offline operation on a physical Android device.
