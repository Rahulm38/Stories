---
title: Product Brief
status: approved
last_reviewed: 2026-08-25
---

# Product Brief

## The Problem

People save ideas from books and lessons from lived experience, but retrieval fails at the moment those ideas would actually be useful. Existing note apps optimize capture, organization, or search—waiting passively for you to remember what to search for. Spaced-repetition tools improve memory, but require tedious card authoring, rigid study decks, and feel like homework.

Stories closes the gap between a private note and an active memory. It lets you capture a thought in ordinary words, prompts you with a contextual cue before revealing the answer, and schedules calm, non-judgmental return intervals.

## Product Promise

> **Keep what mattered. Remember it when it can matter again.**

Stories is designed to be:
- **Fast**: Capture an unplanned thought in under 20 seconds with zero friction.
- **Calm**: A daily surface designed to feel restorative, not demanding. No streaks, badges, or backlogs.
- **Reliable & Private**: 100% offline, local-only UTF-8 Markdown files, no account required.
- **Durable**: One ordinary Markdown file per memory, with verified writes and recovery safeguards inside the local vault.

## Target Outcome

Within four weeks, a user can name concrete ideas and lessons they would have otherwise forgotten, easily retrieve the underlying memories, and trust that their thoughts are private and safe.

## Positioning: Memory Companion

Stories is a **local-first memory companion**. It is explicitly not:
- A general knowledge base or wiki
- An Anki/flashcard deck manager
- A to-do list, habit tracker, or productivity dashboard
- An AI chat surface or summarizer
- A cloud sync or social publishing tool

## The Core Loop

$$\text{Capture} \longrightarrow \text{Cue} \longrightarrow \text{Attempt} \longrightarrow \text{Reveal} \longrightarrow \text{Rate} \longrightarrow \text{Reuse}$$

1. **Capture**: Save a single worthwhile thought in plain language.
2. **Cue**: Contextual cue triggers retrieval ("What was the key lesson from *Thinking, Fast and Slow*?").
3. **Attempt**: You attempt active recall in your own mind before seeing the stored text.
4. **Reveal & Rate**: Reveal the original memory and rate your recall: *Not yet* (1d), *Partly* (4d), or *Got it* (14d).
5. **Reuse & Reflect**: Optionally append a dated reflection or link to another memory.

## Onboarding & Activation Strategy (Aha Moment)

- **The Day 1 Gap**: The biggest churn risk is saving a memory and waiting 3 days in silence.
- **First-Session Loop**: On saving the very first memory, users are invited to try the recall interaction immediately. Practice does not change the already-promised scheduled return date.
- **Warmth Over Jargon**: Prompts use human memory language ("memory", "recall", "returns on [Date]") rather than file-system abstractions ("Inbox", "UTF-8 parse").

## Strategic Bets

| Bet | Why It Matters | How to Validate / Falsify |
|---|---|---|
| **Cue-first recall > passive rereading** | Core product wedge and differentiator. | Users attempt recall before Reveal; report retrieval in real life. |
| **Optional structure preserves capture speed** | Mandatory forms kill spontaneous capture. | Median capture remains under 20 seconds. |
| **First-session practice drives retention** | Experiencing the full loop on Day 1 creates instant comprehension without changing the scheduled return. | Higher Day 7 retention for users completing Day 1 practice. |
| **Calm UI improves daily habit** | Users avoid apps that induce guilt or pile up overdue tasks. | Users return regularly without coercive push notifications or red badges. |
| **Local Markdown builds deep trust** | Users are sensitive about deeply personal thoughts. | Users trust the app with real book learnings and experiences. |
