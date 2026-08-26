---
title: Master PRD
status: active
version: 2.0-tellable-memories
last_reviewed: 2026-08-26
---

# Stories v1 Master PRD

## Executive summary

Stories is an Android-first, local-first personal-memory companion. It helps people keep moments, ideas and observations mentally available so they are there when the user has something worth telling.

The product succeeds outside the app: a good memory comes to mind naturally in conversation because Stories helped the user revisit and retell it beforehand.

## Goals

- **Fast capture**: save something worthwhile in seconds with one required text field.
- **Real resurfacing**: return after time has passed with a clue that does not reveal the answer.
- **Tellability**: encourage the user to tell the memory naturally before revealing it.
- **Calm retention**: weak memories return sooner, strong memories spread out, and sessions never become a debt queue.
- **Durability**: no silent data loss across save, edit, relaunch and draft recovery.
- **Trust**: local memory content, no account, ads or analytics.
- **Accessibility**: clear semantics, large-text support and 48dp minimum touch targets.

## Core surfaces

| Surface | User job | Primary actions |
|---|---|---|
| Today | See what is worth bringing back | Tell / Reveal / Not yet / Mostly / Yes / Tomorrow |
| Capture | Preserve something before it disappears | Write / Save |
| Library | Find a memory from fragments | Search / Open / New |
| Memory | Read or change the original | Edit / Share / Stop resurfacing / Delete |
| Settings | Control reminders and understand privacy | Reminder on/off / Privacy policy |

## End-to-end experience

1. **First launch** — short explanation: `Save it now. Tell it later.` One action: Save your first memory.
2. **Capture** — ordinary text only. No category, format, source, cue or scheduling setup. First return is automatically set for 3 days.
3. **Real return** — Today shows how long ago the memory was saved and a small clue made only from original words. Full title/body remain hidden.
4. **Tell** — `Try telling it without looking. Out loud if you can.`
5. **Reveal** — show the original memory.
6. **Tellability** — ask `Could you tell it?` with `Not yet`, `Mostly`, `Yes`.
7. **Resurface** — weaker memories return sooner; successful memories progressively spread out.
8. **Session end** — after five memories, stop. Do not surface backlog debt.

## Activation

The first scheduled return after actual time has passed is the primary activation event. There is no immediate fake practice loop after capture.

## Success signals

- First memory saved.
- First real return completed.
- Share of returns answered `Mostly` or `Yes`.
- Repeat resurfacing sessions without growing session size.
- Search success using partial remembered fragments.
- Qualitative: `Did something Stories brought back later come to mind in a real conversation?`
