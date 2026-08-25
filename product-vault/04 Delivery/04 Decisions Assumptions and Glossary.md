---
title: Decisions, Assumptions, and Glossary
status: active
last_reviewed: 2026-08-25
---

# Decisions, Assumptions, and Glossary

## Key Product Decisions

| ID | Decision | Why | Revisit when |
|---|---|---|---|
| **D-001** | Stories is a **memory companion**, not a general note app. | Recall and reuse are the wedge. | The recall loop does not create repeat value. |
| **D-002** | Local UTF-8 Markdown files are authoritative. | Private, durable, simple data model. | Storage becomes a proven scale or reliability problem. |
| **D-003** | Recall stays **Cue → Attempt → Reveal → Rate**. | Retrieval should happen before rereading. | Users consistently skip the attempt step. |
| **D-004** | v1 uses simple, predictable recall intervals. | Calm and understandable beats study-app complexity. | Beta data shows the schedule is too repetitive or ineffective. |
| **D-005** | Day-1 practice teaches the loop but **does not change the scheduled return date**. | Practice should explain the product, not silently alter it. | Never unless the onboarding model changes. |
| **D-006** | No streaks, overdue guilt, badges, or gamified pressure. | Calm is a core product principle. | Do not revisit casually. |
| **D-007** | **No vault export/backup feature in v1.** Do not promise one in product copy. | Removed intentionally; keep scope focused and claims honest. | Repeated user demand for portability or device-migration support. |
| **D-008** | Standard vocabulary is **Memory**, **Library**, **Notes/General**. | Keeps the mental model about remembering, not filing. | Research shows terminology confusion. |
| **D-009** | Recall eligibility is based on the **local calendar day**, not the exact capture time. | “Returns in 3 days” should mean that day, not 72 hours to the minute. | Time-sensitive recall becomes a real user need. |
| **D-010** | Device reminders are local, generic, and content-private. | Useful without exposing personal memory text on the lock screen. | Users ask for richer notification previews. |

Future choices live in [[05 Future Product Decisions]]. They are hypotheses, not committed roadmap.

---

## Working Assumptions

1. **Active retrieval beats passive rereading** for the memories Stories is designed to keep alive.
2. **Privacy is part of the product value**, not only a technical choice.
3. **Calm products can retain without compulsion** if resurfacing is genuinely useful.
4. **Reuse matters more than review volume**: the best outcome is a past idea becoming useful again.

---

## Product Glossary

| Term | Definition |
|---|---|
| **Memory** | The core user unit, stored as an individual Markdown file with frontmatter. |
| **Cue** | The prompt shown before the memory body is revealed. |
| **Attempt** | The thinking space where the user tries to retrieve the idea. |
| **Reveal & Rate** | The original memory is shown and rated: *Not yet*, *Partly*, or *Got it*. |
| **Practice** | An early/on-demand recall that teaches or refreshes without pushing a future scheduled recall further out. |
| **Reflection** | Optional text added after recall to connect the memory to the present. |
| **Library** | Searchable collection of memories, organized primarily by memory kind. |
| **Wikilink** | Internal link formatted as `[[Target Memory]]` or `[[Target Memory|Label]]`. |
