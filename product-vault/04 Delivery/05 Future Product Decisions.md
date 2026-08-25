---
title: Future Product Decisions
status: hypotheses
last_reviewed: 2026-08-25
---

# Future Product Decisions

These are **not committed roadmap**. They are the next bets worth considering after the core Android loop is proven.

## Decision order

| Priority | Decision | Recommendation |
|---|---|---|
| 1 | Progressive recall schedule | **Test after beta** |
| 2 | Stronger reuse / reflection loop | **Likely yes** |
| 3 | Related memory after recall | **Likely yes, local-first** |
| 4 | Android Share-to-Stories | **Likely yes** |
| 5 | Local-only product diagnostics | **Useful for beta** |
| 6 | Dark mode | **Do when demanded** |
| 7 | Launcher shortcut / widget | **Later** |
| 8 | Sync / AI | **Defer** |

---

## FPD-001 — Progressive recall scheduling

**Hypothesis:** Fixed 1/4/14-day intervals will eventually feel repetitive and fail to adapt as a memory becomes stronger.

**Recommendation:** Keep v1 simple. After beta, move to a transparent progressive schedule before considering FSRS or other study-grade algorithms.

**How I would do it:**
- Keep *Not yet* ≈ 1 day.
- *Partly* grows the previous interval modestly.
- *Got it* grows it more strongly, capped around 6 months.
- Example path: 3 → 8 → 18 → 40 → 90 → 180 days.

**Decide yes if:** regular users are completing recalls but say strong memories return too often.

**Avoid:** exposing algorithm settings or making Stories feel like Anki.

---

## FPD-002 — Make “Reuse” real

**Hypothesis:** Remembering is useful, but the emotional payoff comes when an old idea changes a current decision, action, or perspective.

**Recommendation:** Strengthen the post-recall reflection before adding more surfaces.

**How I would do it:** one optional prompt after a successful recall:
- General: “Where could this matter now?”
- Experience: “Would you do anything differently today?”
- Book learning: “Where could you apply this?”

Later, show past reflections as a simple timeline inside the memory.

**Success signal:** users add reflections and later revisit memories with multiple dated reflections.

---

## FPD-003 — Related memory after recall

**Hypothesis:** A second relevant memory can create useful connections without turning Stories into a graph or knowledge-management tool.

**Recommendation:** Strong post-launch candidate, but start deterministic and fully local.

**How I would do it:** after recall completion, optionally show **“This reminds you of…”** with one memory selected from shared source, wikilinks, kind, or strong shared terms.

**Success signal:** users open the suggested memory often enough to justify the extra step.

**Avoid:** feeds, graphs, endless recommendations, or AI dependency in the first version.

---

## FPD-004 — Android Share-to-Stories

**Hypothesis:** Capture friction is highest when the useful thought starts in Kindle, Chrome, Reader apps, or another notes surface.

**Recommendation:** Add after the core capture/recall loop is stable.

**How I would do it:** Android Share sheet → Stories opens Capture with selected text as context, then asks **“What about this is worth remembering?”**

The shared text should not be blindly saved as the memory. User intent remains the required step.

**Success signal:** meaningful increase in completed captures without lower-quality, copy-pasted memories.

---

## FPD-005 — Local-only product diagnostics

**Hypothesis:** Without any product signals, beta decisions will depend too much on anecdotes.

**Recommendation:** If needed during beta, track only content-free counters locally. No automatic network analytics.

**Possible events:** capture started/saved, capture duration, recall shown/completed, result selected, recall deferred, practice completed.

**Rule:** never store memory text, prompts, sources, or reflection content in diagnostics.

**Decide yes if:** beta feedback becomes hard to interpret without knowing where people drop off.

---

## FPD-006 — Dark mode

**Hypothesis:** Readers often use reflective tools at night and may expect system dark mode.

**Recommendation:** Useful polish, not a strategic feature. Add when there is repeated demand or when visual QA bandwidth is available.

**How:** follow system appearance by default; preserve contrast and calm hierarchy rather than introducing a second visual language.

---

## FPD-007 — Launcher shortcut / widget

**Hypothesis:** A one-tap entry point can make intentional capture faster without adding product complexity.

**Recommendation:** Later than Share-to-Stories because the share flow solves a stronger real-world capture job.

**Best first version:** Android launcher shortcut directly to Capture. Widget only if shortcut usage proves valuable.

---

## FPD-008 — Sync and AI

### Sync
**Recommendation:** Defer until repeated user demand makes device migration or multi-device access a real retention problem. If built, local Markdown should remain the source of truth; sync is transport, not the product model.

### AI
**Recommendation:** Do not add generic chat or summarization. Revisit only for a narrow job where AI clearly improves recall or reuse without replacing the user's thinking.

Good trigger: users repeatedly ask for help forming better recall cues from their own memory.

Bad trigger: competitors have AI.

---

## Engineering follow-ups when the next feature forces them

- **Recall Session module — strong candidate:** centralize scheduled recall, practice, grading, reflection, deferral, and completion when another recall entry point is added.
- **Vault Health module — strong candidate:** deepen diagnostics/recovery if import, migration, or more storage failure modes appear.
- **Memory Composition module — wait:** only extract shared capture/edit behavior when duplication becomes costly.

Do not create generic abstractions just for cleanliness. Add a seam when there are two real behaviors that need it.
