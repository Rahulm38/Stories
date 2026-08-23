# Stories Design System

## Status and authority

This document is the product UI source of truth for Stories. It defines the
experience, tokens, components, states, copy, and acceptance criteria. The
[Native Design Language](./NATIVE-DESIGN-LANGUAGE.md) defines runtime and
platform mapping; it does not replace this document. Historical audit files are
evidence, not specifications.

The system is deliberately small. Stories uses native Expo/React Native
primitives, Material conventions on Android, Apple conventions on iOS, and the
semantic tokens in `apps/mobile/src/ui/theme.ts`. Do not add a general-purpose
component library until repeated Stories patterns require it.

## Product character

Stories is a quiet, private place for remembering. It should feel personal,
dependable, and text-first—not like a productivity dashboard or a file manager.

Every design decision should support this loop:

> Write one worthwhile thought → understand when it returns → try to remember
> it → close the loop calmly.

Interaction targets:

- A first memory can be captured in under 20 seconds.
- A due memory can be recalled in under 30 seconds.
- Optional organization never blocks capture or recall.
- One primary action is visually dominant in each state.

## Experience lifecycle

Screens must be designed and tested against the full lifecycle, not only a
seeded vault.

| State | User need | Required product response |
| --- | --- | --- |
| Empty vault | Understand the value without a tour | Today explains that saved thoughts return later and offers one capture action. Library hides search, counts, and empty folder chrome. |
| First capture | Save a thought without configuring a system | Show the writing canvas and Save. Keep kind, source, cue, and return timing behind one collapsed Memory details disclosure. |
| First memory scheduled | Know what happened and why it matters | Confirm privacy and a concrete return date, then show the saved memory in Recent. |
| Waiting for first recall | Trust that the app is working | Keep Today calm. Do not invent tasks, scores, or progress. The recent memory provides continuity. |
| First recall due | Know what to do now | Put Due recall before Capture and ask for an attempt before revealing the answer. |
| Recall completed | Understand closure and the next return | Use a calm completion message with the next date or interval. Show remaining due count only when non-zero. |
| Growing Library | Find or reopen a memory | Reveal search and folder organization after at least one memory exists; keep the hierarchy flat and readable. |

Seed data is permitted only in an explicitly labeled demo or test mode. It must
never be confused with the production first-run state.

## Foundations

### Color roles

Use semantic roles rather than literals or content-specific decoration.

| Role | Purpose |
| --- | --- |
| `canvas` | Full-screen warm background |
| `surface` | Inputs and grouped interactive surfaces |
| `surfaceMuted` | Subtle separation without elevation |
| `textPrimary` | Primary reading and labels |
| `textSecondary` | Supporting copy and metadata |
| `divider` | Hairlines and quiet boundaries |
| `action` | Interactive emphasis and focus |
| `actionMuted` | Selected or informational tint |
| `success` | Save, privacy, and completion confirmation |
| `danger` | Destructive or blocking error only |
| `onAction` | Content on the action color |

Do not assign colors to memory kinds as a primary differentiator. Type must
remain understandable through text and accessibility semantics alone.

### Typography

Use the platform system font: Roboto on Android and San Francisco on iOS. The
scale is `screenTitle`, `noteTitle`, `sectionTitle`, `body`, `action`,
`supporting`, and `metadata`. Body text uses 17/27 for comfortable long-form
reading. Prefer weight and space over uppercase or letter spacing for hierarchy.

Support system font scaling. No essential text may be clipped at 200% text
size, and layouts must not rely on a fixed one-line label when wrapping is safe.

### Spacing, radius, and size

- Spacing uses a 4-point base: 4, 8, 12, 16, 20, 24, 32, and 40.
- Radius roles are `subtle` 8, `control` 11, `panel` 14, and `round` only for
  intrinsically circular controls.
- Interactive targets are at least 44pt on iOS and 48dp for primary Android
  actions. The shared floor is 44; use 48 for primary actions.
- Default rows are at least 56 high. Icons are normally 18 or 22.
- Use flat groups and separators before borders, cards, shadows, or elevation.

## Components

Build a primitive only after the same anatomy and behavior appears on at least
two screens. Keep the initial set small.

| Component | Anatomy and behavior | Required states |
| --- | --- | --- |
| App bar | Native back/action affordances, short contextual title | Default, scrolled, disabled action |
| Section label | Sentence-case label above a related group | Default only |
| Primary button | One clear verb, full or strong width, 48 high | Default, pressed, focused, disabled, busy |
| Quiet button | Text or icon action with a 44 minimum target | Default, pressed, focused, disabled |
| Writing field | Label or prompt, multiline canvas, native cursor and selection | Empty, focused, populated, error, disabled |
| Choice group | Two or three mutually exclusive text options | Default, selected, focused, disabled |
| Disclosure row | Label, current summary, chevron; reveals optional settings inline | Collapsed, expanded, focused, disabled |
| List row | Primary text, optional supporting text, optional trailing affordance | Default, pressed, focused, disabled |
| Inline status | Short outcome plus optional next date; never overlays content | Success, informational, error |

Pressed and focused states must remain visible without changing layout. Disabled
states must use semantics in addition to reduced contrast. Busy actions retain
their label or announce the action in progress; do not replace meaning with a
spinner alone.

## Screen patterns

### Today

- Empty: one promise—“Save something worth remembering. Stories will bring it
  back later.”—and one entry, “What is worth remembering?”
- Due recalls come before Capture. Otherwise Capture comes first.
- Do not duplicate Book learning and Experience shortcuts on Today; kind remains
  available inside Memory details.
- Use “1 due” or “1 left today,” not positional progress such as “1 of 1.”
- Use “Tomorrow” for an action that always moves a recall to tomorrow.
- Recent is one quiet continuity group, not an activity feed.

### Capture and edit

- Start with the writing canvas and Save. “One sentence is enough” is the
  supporting prompt.
- Memory details are collapsed by default and summarize the current defaults,
  for example “Note · returns in 3 days.”
- Keep kind, source, cue, and return timing inside the disclosure.
- First-save confirmation uses a concrete date: “Saved privately. It returns on
  26 August.” Use the user's locale for the rendered date.
- Editing may expose existing metadata, but optional fields must not displace the
  writing surface.

### Recall

- Preserve cue → attempt → reveal → rate. Never reveal the stored answer before
  an attempt unless the user explicitly chooses reveal.
- Ratings are “Not yet,” “Partly,” and “Got it,” mapped to the existing recall
  outcomes.
- Reflection is optional and visually secondary beneath the rating.
- Completion is concrete: “Practiced. Back in 14 days.” If more are due, add “2
  left”; do not show a score.

### Library

- At zero memories, hide search, folder counts, and empty folders. Say “Your
  saved memories will appear here” and offer the existing New memory action.
- After the first save, show search and the existing folder structure.
- Call the destination “Library” in navigation and user-facing copy. Use “file”
  or “note” only when discussing storage or Markdown explicitly.

### Settings and note reading

- Settings use grouped native rows and plain-language values. Avoid exposing
  implementation detail unless it helps users manage local storage.
- Note reading prioritizes title and content; storage metadata and backlinks stay
  secondary. Editing reuses the Capture writing and disclosure patterns.

## Copy system

- Use short sentences and concrete verbs: Save, Reveal, Tomorrow, Edit.
- Say “memory” for the experience; say “note” or “file” only for storage.
- Explain outcomes, not machinery: “It returns on 26 August,” not “Recall
  interval set to 3 days.”
- Make privacy factual: “Saved privately” or “Stored on this device.”
- Avoid guilt and judgment. Use “Not yet,” not “Forgot” or “Failed.”
- Avoid gamified language: streak, perfect, score, goal, missed, catch up.
- Avoid exclamation marks in routine success messages.

## Accessibility

- All actions expose role, accessible name, state, and value where applicable.
- Icon-only controls require a text accessibility label; decorative icons are
  hidden from assistive technology.
- Reading and interaction order follows the visual task order.
- Text and controls meet WCAG AA contrast in every state; color is never the only
  signal.
- Touch targets, text scaling, reduced motion, safe areas, keyboard avoidance,
  screen reader announcements, and Android hardware Back are release gates.
- Success and error updates use polite live announcements without stealing
  focus. Validation errors identify the field and recovery action.

## Retention guardrails

Retention means helping a person complete the current memory loop, not adding
reasons to open the app. Do not add onboarding carousels, new tabs,
notifications, streaks, goals, badges, graphs, AI, sharing, sync, dashboards,
decorative rewards, or extra settings as part of this work.

The leading quality signals are:

- Empty Today → capture started.
- Capture started → first save.
- User understands that the first memory will return.
- First due recall completed within seven days.
- Due recalls completed divided by due recalls shown.
- Capture abandonment and recall deferral rates.
- Median capture under 20 seconds and recall under 30 seconds.

Use structured usability sessions or privacy-safe local aggregates during beta.
Never upload memory content to measure these signals.

## Design and release QA

For every change, capture deterministic narrow-phone states for: empty vault,
first capture, first-save confirmation, waiting, recall attempt, recall reveal,
recall completion, empty Library, and populated Library. Check light/dark system
settings even while Stories ships a single light theme so system chrome remains
legible.

Before release, verify:

- No seeded content appears outside explicit demo/test mode.
- The primary action and reading order are unambiguous in every lifecycle state.
- Copy follows the vocabulary and no-guilt rules.
- Semantic tokens replace new literals; exceptions are documented.
- 200% font scaling, screen readers, focus, keyboard, reduced motion, and
  contrast pass.
- Android keyboard resizing, TalkBack, hardware Back, safe areas, relaunch,
  offline storage, and force-stop persistence pass on a device or emulator.
- iOS VoiceOver, Dynamic Type, safe areas, keyboard, back gesture, relaunch, and
  offline storage pass before iOS release.

Web preview, typecheck, and static export are useful gates but are not evidence
of native device readiness.
