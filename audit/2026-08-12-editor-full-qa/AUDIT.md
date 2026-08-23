# MemoryOS editor full QA — 2026-08-12

## Scope

This pass resumes the interrupted Sunday editor redesign. It checks the writing-first Capture and Edit surfaces, every Markdown action, reader parity, Library tree behavior, and the source-level Android readiness boundary at a 390 x 844 web preview viewport.

## Evidence

- Live preview: `http://localhost:8084/capture`
- Existing visual comparison captures: `audit/2026-08-09-editor-redesign/09-capture-final-mobile.png`, `07-note-edit-after.png`, `06-library-after.png`, and `11-details-final-clean.png`.
- The browser DOM snapshot exposed all 11 toolbar controls in the narrow layout, the details disclosure, and the recursive folder rows.
- A saved `Format QA` fixture was opened in read mode after editing and exposed headings, bold, italic, combined emphasis, code, standard Markdown links, wiki-links, quote, parent/nested bullets, ordered list, and checklist content.

## Interaction matrix

| Area | Result | Notes |
| --- | --- | --- |
| Heading | Pass | `alpha\nbeta` → `## alpha\n## beta` |
| Bold | Pass | `alpha` → `**alpha**` |
| Italic | Pass | `alpha` → `*alpha*` |
| Quote | Pass | Each selected line receives `> ` |
| Bulleted list | Pass | Each selected line receives `- ` |
| Numbered list | Pass | Lines receive incrementing markers |
| Checklist | Pass | Lines receive `- [ ] ` |
| Inline code | Pass | Selection is wrapped in backticks |
| Link | Pass | Selection becomes `[alpha]()` and keeps the URL caret position |
| Increase / decrease indent | Pass | Two-space line indentation is added/removed without losing selection |
| Physical web Tab / Shift+Tab | Pass | Adds/removes two spaces at the current line |
| Reader parity | Pass | All emitted forms render in read mode; nested leading whitespace is preserved |
| Details | Pass | Capture and Edit disclose kind/source/recall controls with accessible state |
| Library | Pass | Books, Experiences, Inbox roots and nested folder paths are recursively rendered |
| Kind/folder move | Pass | Book learning → Books; Experience → Experiences; regular conversion → Inbox |

## Automated gates

- Core tests: 12/12 pass.
- Mobile TypeScript: pass.
- Focused mobile ESLint: pass.
- Root ESLint: pass with one generated `.expo/types/router.d.ts` unused-disable warning and no errors.
- Expo web export: pass, 10 static routes.
- Root `next build --webpack`: pass.
- Default `npm run build` remains blocked by a Turbopack worker port-bind `Operation not permitted` error in this managed environment; the same production build passes with `next build --webpack`.
- `git diff --check`: pass.
- Offline production dependency audit: no reported vulnerabilities in root or mobile lockfiles.

## Explicitly unverified

This environment has Java but no Android SDK, `adb`, emulator, or `ANDROID_HOME`/`ANDROID_SDK_ROOT`. Android keyboard resizing, TalkBack, hardware Back, font scaling, selection handles, native Tab/Backtab delivery, force-stop persistence, and iOS simulator launch therefore remain device gates. The shared Expo/React Native architecture keeps the same screen and editor code available for iOS; no second editor implementation is required.

## Outcome

The Sunday web/editor scope is complete and backed by live interaction evidence. The overall native release is not marked complete until the Android smoke checklist is run on an emulator or physical phone.
