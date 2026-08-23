# MemoryOS editor and Library audit

## Scope

- Product: MemoryOS Expo/React Native app.
- Flow: create a memory, edit an existing Markdown note, and retrieve it from Library.
- Viewport: 390 x 844 CSS pixels in the in-app browser.
- User goal: capture and shape book learnings or experiences without fighting a form-heavy editor.

## Flow health before redesign

1. **Capture — weak.** `01-capture-before.png` shows a large focused textbox with its cursor and content against the border, followed by two permanently expanded option groups. The writing task and memory properties compete for attention.
2. **Edit — poor.** `02-edit-before.png` is a long settings form. There is no Markdown toolbar, the body starts at the input edge, the blue focus outline dominates, and heavy title/label weights make the page feel denser than it is.
3. **Library — fair.** `03-library-before.png` is understandable, but category chips and repeated section labels behave like a generic filtered list. It does not expose the local folder structure that makes a Markdown vault predictable.

## Accessibility risks visible from the screenshots

- Focus is visible, but the web focus treatment overwhelms the writing surface rather than outlining a compact control.
- Formatting actions are absent, forcing users to remember Markdown syntax.
- Uppercase, bold metadata labels add visual noise and reduce scan hierarchy.
- Screenshots cannot establish TalkBack labels, hardware-keyboard order, dynamic type behavior, or Android keyboard avoidance.

## Selected direction

- Writing canvas and restrained actions from `audit/2026-08-08-simplicity-links/08-composer-final-mobile.png`.
- Inline Markdown-file editing from `audit/2026-08-06-mobile-lightness/27-note-inline-editor.png`.
- Collapsible vault structure from `audit/2026-08-06-mobile-lightness/23-files-obsidian-tree.png`.
- Quiet note reading from `audit/2026-08-06-mobile-lightness/24-note-obsidian-links.png`.

## Required changes

- One reusable Markdown editor module shared by Capture and Edit.
- Toolbar for headings, emphasis, lists, checklist, quote, code, links, and indent/outdent.
- Comfortable input padding with no card-like focus outline.
- Memory metadata collapsed behind a single details row by default.
- Softer typography and sentence-case labels.
- Collapsible Books, Experiences, and Inbox tree in Library.

## Post-fix flow health

1. **Capture — strong.** `09-capture-final-mobile.png` makes writing the first action, exposes Markdown tools without syntax memorization, and keeps source/recall properties behind Memory details.
2. **Edit — strong.** `07-note-edit-after.png` keeps the title and Markdown body readable, restores selection after toolbar actions, and preserves the existing wiki-link flow.
3. **Library — strong.** `06-library-after.png` uses a simple expandable Books/Experiences/Inbox tree with counts and indented note rows.
4. **Details — strong.** `10-details-final-mobile.png` keeps optional source, recall timing, and cue fields available without overwhelming the writing canvas.

## Browser interaction evidence

- Fresh toolbar test selected “Remember this”, pressed Bold, and produced `**Remember this**` with zero new console errors.
- Note Edit exposed the same eleven Markdown actions and retained the link hint.
- Expanded Memory details exposed recall controls and optional fields.

## Remaining verification gaps

The browser audit cannot prove Android keyboard resizing, TalkBack semantics, hardware Back, selection handles, large-font layout, or force-stop persistence. Those require an Android emulator or device.

## Evidence limits

The audit is browser-rendered Expo evidence. Native keyboard behavior, TalkBack, hardware Back, selection handles, and large-font layout require Android device testing.
