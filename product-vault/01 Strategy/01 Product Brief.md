---
title: Product Brief
document_type: strategy
status: approved
last_reviewed: 2026-08-24
---

# Product brief

## Problem

People save ideas from books and lessons from lived experience, but retrieval fails at the moment those ideas would be useful. Existing notes products optimize capture, organization, or search. They generally wait for the user to remember what to look for. Spaced-repetition tools can improve memory, but often require card authoring, rigid study sessions, and a school-like workflow.

Stories closes the gap between a private note and an active memory. It lets a person save a thought in ordinary language, return to it through a cue, attempt recall before seeing the answer, and optionally connect the memory to a new reflection or another note.

## Product promise

**Keep what mattered. Remember it when it can matter again.**

Stories must be:

- fast enough for an unplanned thought;
- calm enough to revisit daily without becoming a task manager;
- reliable offline and across app restarts;
- private by default, without an account;
- portable because the durable record is Markdown;
- opinionated about recall, but permissive about note structure.

## Target outcome

After four weeks, a successful user can name ideas or lessons they would otherwise have forgotten, can find the underlying notes, and trusts that saving or practicing never silently loses data.

## Positioning

Stories is a local-first recall companion. It is not:

- a general-purpose knowledge base;
- an Obsidian clone or plugin host;
- a flashcard deck manager;
- a to-do list, calendar, or habit tracker;
- an AI chat surface;
- a social, collaborative, or publishing product.

## Wedge

The initial wedge is people who already notice the pain of forgotten reading and experience-based learning. The first two structured memory types are Book learning and Experience. A plain Note remains available because classification must never block capture.

## Core loop

1. Capture one worthwhile thought.
2. Optionally add a source, cue, and return timing.
3. Encounter a cue when the memory is due.
4. Attempt recall while the original remains hidden.
5. Reveal and rate the attempt.
6. Add a reflection or connection when useful.
7. Return later according to a deterministic interval.

## Strategic bets

| Bet | Why it matters | How to falsify it |
| --- | --- | --- |
| Cue-first recall is more valuable than passive rereading. | This is the differentiation. | Users repeatedly reveal without attempting, ignore due items, or report no retrieval benefit. |
| Optional structure preserves capture speed. | Complex schemas kill spontaneous capture. | Median capture exceeds 20 seconds or users abandon details. |
| Local Markdown increases trust. | Users are sensitive to losing private thoughts. | Users cannot understand storage/recovery or demand sync before trusting the app. |
| A quiet daily surface improves return behavior. | The product should feel restorative, not demanding. | Users miss due work because hierarchy is too subtle, or interpret it as an empty notes app. |

## Product risks

- Recall may feel like homework rather than help.
- A default three-day return may be wrong for different content types.
- App-private storage can be trustworthy but hard to back up or move.
- No account reduces friction but makes uninstall/device loss unrecoverable until backup exists.
- Markdown interoperability can be overstated if users cannot export the app-private vault.
- Local-only telemetry limits quantitative learning; research must not compromise privacy.

## Release thesis

The first credible release is not “a notes app with folders.” It is a device-tested, loss-resistant Capture → Recall loop with a usable Library. Native notifications, backup/restore, and accessibility validation are release-quality capabilities, not decorative follow-ons. See [[04 Delivery/01 Release Plan and Acceptance]].
