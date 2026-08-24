---
title: Content Guide, Voice, and Accessibility
status: active
last_reviewed: 2026-08-24
---

# Content Guide, Voice, and Accessibility

## Product Voice & Content Design Rules

Stories speaks with a **calm, thoughtful, non-judgmental tone**. It is a quiet companion, not an demanding coach or a corporate tool.

### Vocabulary Matrix (User-Facing)

| Use This | Instead of That | Rationale |
|---|---|---|
| **Memory** | Note / File / Item | Emphasizes the purpose (remembering) rather than storage mechanics. |
| **Library** | Vault / Files / Explorer | Warmer, more human concept than a technical directory tree. |
| **Notes / General** | Inbox | "Inbox" carries baggage of email triage and backlog anxiety. |
| **Not yet** | Forgot / Failed | Frame recall practice as an ongoing continuum, never a test score. |
| **Partly / Got it** | So-so / Perfect | Descriptive feedback without grading anxiety. |
| **Saved privately** | Saved to local disk | Reassures privacy without technical jargon. |
| **Returns on [Date]** | Interval set to 3 days | Concrete calendar outcomes resonate more than abstract intervals. |

---

## What We Never Say

- **No Guilt Language**: Avoid *overdue*, *missed*, *streak broken*, *catch up*, *backlog*.
- **No Gamification Jargon**: Avoid *points*, *level*, *mastery score*, *perfect session*, *confetti*.
- **No False Claims**: Never say "portable" without export, or "encrypted" if only protected by OS sandbox.

---

## Accessibility Standards (WCAG 2.2 AA)

1. **Touch Floor**: All primary interactive buttons are $\ge 48\text{ dp}$ on Android and $\ge 44\text{ pt}$ on iOS.
2. **Font Scaling**: Complete layout reflow through at least **200% system font size** without clipped text or broken touch targets.
3. **Screen Readers (TalkBack / VoiceOver)**:
   - Every icon and button exposes an explicit accessible label and role.
   - Live regions announce status changes (*"Memory saved. Returns 27 Aug"*) politely without stealing focus.
   - The memory body is strictly excluded from accessibility trees during the recall cue/attempt stages.
4. **Contrast**: Text maintains at least $4.5:1$ contrast against canvas and surface tokens; icons and indicators maintain $\ge 3:1$.
5. **Reduced Motion**: Respects OS reduced-motion preferences with instant state transitions.
