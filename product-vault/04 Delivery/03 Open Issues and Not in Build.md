---
title: Open Issues and Product Gaps
status: active
last_reviewed: 2026-08-26
---

# Open Issues and Product Gaps

This is the short list of work that is still genuinely open after the storyteller outcome pass.

## P0 — Before wider Android release

| Area | What is still unproven | Next action |
|---|---|---|
| **Physical Android QA** | CI cannot prove TalkBack, 200% font scaling, keyboard resize, hardware Back, safe areas, force-stop recovery, or real notification delivery. | Run the release checklist on at least one physical Android device. |
| **Reminder delivery** | Scheduling code is implemented, but cold-device delivery still needs OS-level validation. | Schedule a near-term test reminder, kill the app, lock the phone, verify delivery and tap-through. |
| **Story outcome UX** | Discover prompts, Ready repertoire, micro-coaching and `I told this` are implemented but need real-user evidence that they increase motivation and real-world telling. | Test the full Discover → Remember → Tell loop with current beta users before adding more mechanics. |
| **Play Store readiness** | Store screenshots, listing copy, Data Safety answers, and final release evidence still need sign-off. | Complete the Play release checklist before production rollout. |

## P1 — Product decisions, not bugs

These should not be built automatically. Decide after beta evidence:

- Android Share-to-Stories capture
- Local-only product diagnostics if qualitative testing is insufficient
- Better deterministic trigger extraction if real stories expose weak cues

See [[05 Future Product Decisions]] for the hypothesis and recommended implementation for each.

## P2 — Useful, lower urgency

- Dark mode
- Launcher shortcut / widget for fast capture
- Optional richer Library filters if real retrieval pain appears

## Explicitly deferred

- AI chat / rewriting / story generation
- Cloud sync and accounts
- Tasks, calendars, streaks, badges, scores and leaderboards
- Storytelling courses, hook/punchline forms and graded coaching
- Global graph visualization
- Broad “save everything” content ingestion

These remain deferred unless a clear user problem—not competitor parity—justifies reopening them.
