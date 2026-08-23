# Stories mobile UI and UX audit

Date: 24 August 2026
Viewport: 390 x 844
Surface: Expo SDK 57 web export used as a narrow-screen proxy for the native app

## Verdict

The core Capture -> Library -> Edit -> Recall loop is calm and understandable. The highest-impact break was Library opening an empty Books folder while the newly saved Inbox memory stayed hidden. The pass also found keyboard risk in recall, stale success feedback, weak action-state semantics, technical metadata competing with reading, generic Expo launch assets, low-contrast control boundaries, and several accessibility-label gaps.

## Flow steps

1. **Empty Today - healthy.** One promise and one clear capture entry. Evidence: `01-today-before.png`.
2. **Capture - healthy after fixes.** The writing field remains primary; optional settings use a native disclosure chevron, control boundaries are clearer, draft-detail changes are guarded, and the screen has recovery behavior. Evidence: `02-capture-before.png`, `03-details-before.png`, `14-capture-after.png`.
3. **First save - healthy after fixes.** The private/local outcome is concrete and now expires instead of remaining stale. Evidence: `04-saved-before.png`.
4. **Library - fixed.** Before, empty Books opened while the saved Inbox memory was hidden. After, the first non-empty root opens automatically and vocabulary consistently says memory. Evidence: `05-library-before.png`, `12-library-after.png`.
5. **Settings - healthy.** Calm grouped rows and plain-language local-storage copy. Heading semantics were added. Evidence: `06-settings-before.png`.
6. **Reader and edit - improved.** The memory now leads with title and content; the Markdown path is secondary at the bottom. Back returns to the originating screen when possible, and editor keyboard dismissal and recovery are clearer. Evidence: `07-reader-before.png`, `13-reader-after.png`.
7. **Recall - healthy after fixes.** Cue, attempt, reveal, and rating are clear. Keyboard avoidance, busy/disabled feedback, correct button semantics, and transient completion status were added. Evidence: `08-recall-cue-before.png`, `09-recall-attempt-before.png`, `10-recall-reveal-before.png`, `11-recall-cue-after.png`.

## Accessibility and evidence limits

The pass verified visible hierarchy, narrow-screen reflow, labels/roles exposed through the web proxy, and local interaction states. It does not prove native WCAG conformance. Android TalkBack, hardware Back, keyboard resizing, 200% font scaling, gesture safe areas, force-stop persistence, and offline relaunch still require an emulator or physical device. iOS VoiceOver and Dynamic Type remain separate release gates.
