---
title: Today and Resurfacing
status: active
last_reviewed: 2026-08-26
---

# Today and Resurfacing

## Goal

Bring a small number of saved memories back in a way that strengthens conversational availability without making Stories feel like homework.

## Eligibility

- A memory is due when `nextRecallAt` falls on or before the user's current local calendar day.
- Quarantined/unreadable legacy files are never surfaced for review.
- New memories first return after three local calendar days.
- Stopped memories have no `nextRecallAt` and remain searchable in Library.

## Hidden state

Show:
- age/context such as `From 3 days ago`;
- a deterministic clue generated only from safe contextual words near the opening of the user's memory;
- `Try telling it without looking. Out loud if you can.`;
- primary `Reveal`;
- secondary `Tomorrow`;
- overflow with `Open memory`, `Stop resurfacing`, `Cancel`.

Do not show the derived Library title, original body, punchline, source metadata, file path or recording UI before Reveal.

## Revealed state

Show the exact original memory, then ask **Could you tell it?**

- `Not yet` -> weak return, initially 1 day.
- `Mostly` -> initially 4 days, then progressively 7 / 14 / 30 / 60 days.
- `Yes` -> initially 14 days, then progressively 30 / 90 / 180 / 365 days.

The internal `reviewStrengthDays` is the durable scheduling state. `nextRecallAt` is only the due date. `Tomorrow` must never increase strength.

## Daily calm limit

- Maximum **5 handled memories per local calendar day**.
- Handled means rating, Tomorrow or Stop resurfacing.
- Count persists across tab changes, process restart and app relaunch.
- It resets automatically when the local calendar date changes.
- When five are handled, Today shows `Done for today`; remaining backlog waits without guilt copy.

## Reminders

- Reminders are optional and generic.
- Permission is requested contextually after the user experiences a real return, not on first launch.
- Once a user has engaged with Today's session, reconciliation must not schedule another immediate one-minute reminder for remaining overdue memories.
- Remaining backlog can be reconsidered the next day.

## Accessibility

- On narrow screens or larger font scale, Reveal/Tomorrow and the three rating controls may stack vertically.
- All actions meet the 48dp minimum target.
- Reveal changes should be announced politely to assistive technology.
- A speech/quote icon may reinforce telling; do not use a microphone icon unless the app is actually recording/listening.
