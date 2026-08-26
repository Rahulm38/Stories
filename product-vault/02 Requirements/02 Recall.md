# Resurfacing and Tellability Requirements

## Goal

Keep worthwhile memories available for real-world telling and use without turning Stories into study software.

## Hidden state

A due memory must not display its full title or body before reveal when either could expose the answer.

Instead show:

- how long ago it was saved;
- a short deterministic clue made from a few distinctive words in the original memory;
- the instruction: **Try telling it without looking. Out loud if you can.**
- primary action: **Reveal**;
- secondary action: **Tomorrow**;
- overflow: Edit memory / Stop resurfacing.

## Revealed state

Show the original memory exactly as saved in ordinary readable text.

Ask one question:

**Could you tell it?**

Outcomes:

- **Not yet** — return soon.
- **Mostly** — increase the interval modestly.
- **Yes** — increase the interval substantially.

## Scheduling

- New memories first return after 3 days.
- First outcome retains simple initial intervals so the product is predictable.
- Later successful returns progressively spread out, capped at a long interval.
- A failed return comes back soon.
- The model stays invisible to the user.

## Session design

- Show no more than 5 due memories in one session.
- Do not show overdue counts, red badges, catch-up debt, or streak penalties.
- If more are due, end with **Done for now** and leave the rest for a later session.

## Stop resurfacing

Stopping must clear future returns without deleting the memory. The memory remains searchable in Library and can be scheduled again later.

## First real return

Do not simulate an immediate practice round after first save. The first real return after time has passed is the activation moment.

After the first completed real return, Stories may offer the user a quiet notification permission prompt once. Declining must not block the product.
