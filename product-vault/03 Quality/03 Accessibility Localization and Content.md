---
title: Accessibility Localization and Content
document_type: quality_spec
status: active
last_reviewed: 2026-08-24
---

# Accessibility, localization, and content

## Accessibility requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| A11Y-001 | All interactive targets are at least 48 dp on Android and 44 pt on iOS. | Inspector/device audit passes. |
| A11Y-002 | Every control has a programmatic role, name, state, and useful hint only where needed. | TalkBack and VoiceOver audits pass without duplicate/cryptic labels. |
| A11Y-003 | Headers expose heading semantics in a logical order. | Rotor/navigation list is coherent. |
| A11Y-004 | Radio/choice groups expose group and selected state. | Kind, timing, and rating can be understood nonvisually. |
| A11Y-005 | Disclosure controls expose expanded/collapsed state and current summary. | Screen reader announces both. |
| A11Y-006 | Loading, save success, recall completion, and errors use appropriate live-region announcements. | No repeated announcement loop. |
| A11Y-007 | Error text is associated with the affected control and does not rely on color. | Date/save fixtures are announced. |
| A11Y-008 | Disabled/busy state is semantic, not opacity-only. | Save in progress and unavailable controls are announced. |
| A11Y-009 | Body text supports platform font scaling through at least 200%. | No essential content/actions clip or overlap. |
| A11Y-010 | Reflow and wrapping do not force one-line labels for core actions. | Small-phone/large-text matrices pass. |
| A11Y-011 | Color contrast meets WCAG 2.2 AA equivalents: 4.5:1 text, 3:1 large text/UI indicators. | Token audit passes in all states. |
| A11Y-012 | Focus order matches visual/task order and is restored sensibly after modal, save, Reveal, or navigation. | Hardware keyboard/switch and screen-reader tests pass. |
| A11Y-013 | Markdown links expose link role and meaningful label; duplicate labels include context where needed. | Link navigation is unambiguous. |
| A11Y-014 | Checklist state is announced; read-only checklists are not falsely interactive. | TalkBack/VoiceOver wording matches. |
| A11Y-015 | Original recall body is absent from the accessibility tree before Reveal. | Automated/component assertion and manual audit pass. |
| A11Y-016 | Reduced-motion preference is respected. | No essential information depends on animation. |
| A11Y-017 | Platform high contrast/invert colors remains usable. | Manual platform checks pass. |
| A11Y-018 | Keyboard and selection behavior works with soft keyboard, hardware keyboard, IME, dictation, and switch input. | Capture/edit scenarios pass. |
| A11Y-019 | Bottom navigation accounts for gesture/nav bars and safe areas. | No target is obscured on supported devices. |
| A11Y-020 | Landscape/tablet behavior does not strand Save/Cancel offscreen. | Supported orientation/device matrix passes. |
| A11Y-021 | Accessibility is a release gate, not post-launch cleanup. | No open P0/P1 accessibility defect. |
| A11Y-022 | Notifications use concise titles/actions and do not expose private content by default. | TalkBack lock-screen test passes. |

## Localization and time requirements

| ID | Requirement | Acceptance criterion |
| --- | --- | --- |
| L10N-001 | All user-facing strings are centralizable; no meaning is assembled from English-only fragments. | Localization extraction review passes. |
| L10N-002 | Plurals use locale-aware rules. | 0/1/2/many due/memory cases pass. |
| L10N-003 | Dates shown to users use locale formats; strict storage/input formats are clearly labeled. | Multiple locale snapshot tests pass. |
| L10N-004 | Scheduling semantics distinguish instants from local calendar days. | DST/time-zone test matrix passes. |
| L10N-005 | Week start and 12/24-hour preferences follow locale when later exposed. | No US-only assumption. |
| L10N-006 | Unicode titles, folders, search, and links work across Latin/non-Latin/RTL scripts. | Arabic/Hindi/CJK/combining-mark fixtures pass. |
| L10N-007 | Layout supports text expansion of at least 35%. | German/Finnish-style pseudo-localization passes. |
| L10N-008 | RTL mirrors directional layout/icons but not semantic media/path text indiscriminately. | RTL device test passes. |
| L10N-009 | File paths remain stable and are not translated. | UI labels translate; stored roots follow an explicit compatibility policy. |
| L10N-010 | Case-insensitive search/link logic is locale-aware enough to avoid destructive assumptions. | Turkish I and accent fixtures do not corrupt identity. |
| L10N-011 | Relative words such as Today/Tomorrow are recalculated at local midnight/resume. | Boundary tests pass. |
| L10N-012 | Calendar edge cases include leap year, month/year rollovers, DST gaps/folds, and travel. | Fixed-zone tests pass. |
| L10N-013 | App can ship English-only initially only if file/schema behavior is globally safe. | No ASCII-only path or content logic. |
| L10N-014 | Privacy policy/store copy locale coverage matches release markets. | Release checklist verifies. |

## Content design rules

- Use “memory” for the user’s saved unit; use “note,” “file,” and “Markdown” only where storage/editing clarity needs them.
- Use “Library” consistently as the destination name.
- Use “Not yet,” “Partly,” and “Got it,” not failure/success language.
- Use “Tomorrow” only when behavior truly means tomorrow in the user’s local calendar policy.
- Use concrete outcomes: “Saved privately. It returns on 27 August.”
- Do not imply automatic backup, encryption, sync, or remote recovery.
- Do not say “portable” until export and restore are shipped.
- Do not say “nothing leaves your device” if a later link, telemetry, crash, sync, or backup integration invalidates it.
- Avoid streak, backlog, overdue, mastery, score, productivity, and guilt language.

## Required device matrix

- Android: TalkBack, font scaling 100/200%, gesture and three-button navigation, small and large phone, hardware/soft keyboard, light mode, reduced motion where supported.
- iOS before iOS release: VoiceOver, Dynamic Type through accessibility sizes, back gesture, safe areas/notch, keyboard, iPhone and supported iPad layout.
- Both: offline, app switcher/background, lock screen notification privacy, external link handler failure, RTL pseudo-locale.
