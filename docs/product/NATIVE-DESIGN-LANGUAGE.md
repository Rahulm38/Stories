# Stories native design language

## Character

Calm, modern, warm and lightweight. The app should feel closer to a beautifully restrained journal or reading app than a dashboard or study tool.

## Hierarchy

- One dominant task per screen.
- Large type is reserved for the screen's emotional or task anchor.
- Cards are used only when grouping improves comprehension.
- Dividers and whitespace do more work than containers.
- Supporting copy is short and secondary.

## Icons

Use native symbols through `expo-symbols` with text when an action could be ambiguous. Icons improve scanning; they do not create extra actions.

- standard action icon: about 20–24dp;
- interactive target: at least 48dp;
- use familiar platform metaphors: add, search, edit, reveal/eye, clock, archive, bell, lock, overflow.

## Core screens

### Today

New user: one visual mark, `Save it now. Tell it later.`, one primary action.

Due memory: age → story cue → verbal instruction → Reveal / Tomorrow. After reveal: original text → `Could you tell it?` → Not yet / Mostly / Yes.

### Capture

One prompt, one plain text surface, one Save action. No advanced section.

### Library

Header, search, simple rows. Search placeholder should teach the mental model: `Search people, places, moments…`.

### Memory

Readable original content with one lightweight return-state line. Edit and overflow actions remain obvious but secondary.

### Settings

Only real preferences. Reminders and privacy are visually scannable with familiar icons.

## Interaction rules

- Never use colour alone to communicate state.
- Minimum touch target 48dp.
- Prefer familiar native transitions and press feedback.
- Avoid modal chains; use alerts only for destructive/secondary actions.
- No celebration theatre, streaks, red debt counts, or gamified pressure.
- Keep content inside safe insets while allowing surfaces/backgrounds to feel edge-to-edge where appropriate.
