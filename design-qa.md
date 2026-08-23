# Stories editor redesign QA

> **Historical evidence (2026-08-09 to 2026-08-12).** This file records a past
> editor redesign and its validation; it is not the current product
> specification. Use the
> [Stories Design System](./docs/product/STORIES-DESIGN-SYSTEM.md) for current
> lifecycle, component, copy, accessibility, and QA requirements.

## Comparison target

- Source visual truth:
  - `audit/2026-08-06-mobile-lightness/27-note-inline-editor.png`
  - `audit/2026-08-06-mobile-lightness/23-files-obsidian-tree.png`
  - `audit/2026-08-06-mobile-lightness/24-note-obsidian-links.png`
  - `audit/2026-08-08-simplicity-links/08-composer-final-mobile.png`
- Browser implementation evidence:
  - `audit/2026-08-09-editor-redesign/09-capture-final-mobile.png`
  - `audit/2026-08-09-editor-redesign/06-library-after.png`
  - `audit/2026-08-09-editor-redesign/07-note-edit-after.png`
  - `audit/2026-08-09-editor-redesign/11-details-final-clean.png`
- Viewport: 390 x 844 CSS pixels, device scale factor 1.
- Source and implementation captures: 390 x 844 pixels for the focused mobile states; no density normalization required.
- State: empty capture canvas, Markdown toolbar visible, seeded book note in Library, edit mode, and expanded memory details.

## Full-view comparison

### Typography

The editor now uses a calm 17px writing face, 27px line height, 600-weight title/actions, and sentence-case metadata. The former heavy uppercase form labels and 700-weight actions are gone. The note title, toolbar, body, and details row create a clear reading-to-writing hierarchy.

### Spacing and layout rhythm

Capture and Edit put the writing canvas first, give the body 16px internal padding, and keep properties behind one details row. The toolbar has 44px targets and a quiet divider. Library uses a predictable folder row → indented note row rhythm with no horizontal overflow at 390px.

### Colors and visual tokens

Warm paper, muted blue ink, low-contrast separators, pale selection surfaces, and restrained icons match the selected native direction. The muted text token is darkened to `#6B6C69` for readable contrast. Browser-default focus outlines are removed from the text canvas and replaced by a quiet active-edge cue; details rows are not boxed when idle.

### Icons and assets

There are no raster asset requirements. Expo Symbols supplies native Material/SF symbol mappings for toolbar, tree, navigation, and metadata icons. No emoji or handcrafted SVG was introduced.

### Copy and content

Capture says “Write what you want to remember…”, Edit says “Write in Markdown…”, and the details row communicates kind/source/recall without turning the writing surface into a settings form. Library exposes Books, Experiences, and Inbox as a lightweight local vault tree.

## Focused comparison

The 390 x 844 captures make the important details readable: editor padding and focus behavior, toolbar affordances, collapsed/expanded details, and the folder tree. The source and implementation use the same content-first mobile state; exact glyph silhouettes vary by platform as expected.

## Comparison history

### Initial findings from `audit/2026-08-09-editor-redesign/01-capture-before.png`, `02-edit-before.png`, and `03-library-before.png`

- **P1:** Capture and Edit looked like long settings forms instead of writing surfaces.
- **P1:** No Markdown controls were available; users had to remember syntax.
- **P1:** The body input sat against a harsh browser focus border, making the cursor feel stuck to the edge.
- **P2:** Typography used too many bold/uppercase labels and Library behaved like a generic filtered list.

### Fixes made

- Added the deep shared `MarkdownEditor` module with toolbar actions for heading, bold, italic, quote, bullet list, numbered list, checklist, inline code, link, indent, and outdent.
- Added pure selection-aware formatting in `packages/core/src/markdown-editor.ts` with 3 focused test cases for block and indent behavior.
- Reworked Capture and Note Edit around a writing canvas plus a collapsed Memory details row.
- Added comfortable 16px editor padding and platform-safe caret restoration; web uses `setSelectionRange`, native uses `setNativeProps`.
- Added physical Tab / Shift+Tab handling and a visible active-edge cue without pinning the caret to a browser border.
- Wrapped the toolbar at phone widths so Link, Increase indent, and Decrease indent are not hidden behind horizontal scrolling; toolbar and icon semantics have explicit accessibility labels.
- Reframed Library as an Obsidian-like collapsible Books/Experiences/Inbox tree.
- Made the Library tree recursive from Markdown folder paths and kept empty required roots visible.
- Kept kind-to-folder moves consistent when editing a note (`Books`, `Experiences`, `Inbox`) while preserving custom folders for regular notes.
- Reduced bold weights and removed uppercase tracking from the redesigned surfaces.

### Post-fix evidence

- `09-capture-final-mobile.png`: toolbar, writing canvas, padding, and collapsed details are visually quiet.
- `07-note-edit-after.png`: existing Markdown note has the same toolbar and details model in Edit.
- `11-details-final-clean.png`: optional recall fields stay discoverable without dominating the first screen; the final clean interaction produced no console errors.
- `06-library-after.png`: folder tree is readable and book notes are nested under Books.
- Fresh toolbar interaction: selecting text and pressing Bold produced `**Remember this**` with no new console errors.

## Full QA pass — 2026-08-12

- All 11 toolbar actions were exercised in the live 390px preview. Expected output was observed for Heading, Bold, Italic, Quote, Bulleted list, Numbered list, Checklist, Inline code, Link, Increase indent, and Decrease indent.
- Web keyboard behavior was exercised: Tab added two spaces and Shift+Tab removed them.
- Reader parity was checked with a saved fixture containing headings, bold, italic, bold-italic, inline code, quote, standard Markdown link, wiki-link, parent/nested bullets, ordered item, and checklist. Each form was present in read mode and the browser reported no warning/error entries during the flow.
- Capture and Edit both expose the same wrapped toolbar, body padding, details disclosure, kind controls, and link suggestions.
- Library was checked with Books, Experiences, Inbox, search, and a nested tree implementation. Folder labels include counts and expanded/collapsed state.
- Core tests: 12/12. Mobile TypeScript: pass. Focused mobile ESLint: pass. Expo web export: 10 routes. Root webpack production build: pass. `git diff --check`: pass.
- The muted color, toolbar discoverability, focus treatment, details-row idle outline, and icon-label issues identified in the design review were addressed.

## Remaining device gate

- Native Android keyboard resizing, TalkBack announcements, hardware Back, font scaling, selection handles, physical Tab/Backtab delivery, and force-stop persistence still require an Android device or emulator. This Mac has no Android SDK, `adb`, or emulator, so these are explicitly unverified rather than marked complete.
- Toolbar symbol silhouettes will differ between Material Symbols and SF Symbols by platform design.

## Primary interactions tested

- Capture opens with Note, Book learning, and Experience modes plus a Markdown toolbar.
- Selecting text and pressing Bold updates the Markdown and restores selection without a web runtime error.
- Memory details expands to show recall timing and optional source/cue fields.
- Library expands Books and opens the seeded book note.
- Note Edit shows the same toolbar, preserves wiki-link suggestions, and expands Memory details.

final result: passed for browser/static gates; Android hardware validation pending
