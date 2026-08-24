---
title: Decisions, Assumptions, and Glossary
status: active
last_reviewed: 2026-08-24
---

# Decisions, Assumptions, and Glossary

## Key Product Decisions

| ID | Decision | Rationale | Revisit Trigger |
|---|---|---|---|
| **D-001** | Stories is a **memory companion**, not a general note app. | Sharp differentiation against Apple Notes & Obsidian. | Core recall loop fails to show user value. |
| **D-002** | Local UTF-8 Markdown files are authoritative. | 100% private, human-readable, zero database lock-in. | Storage fails performance/scale budgets. |
| **D-003** | 3-stage recall: Cue $\rightarrow$ Attempt (hidden body) $\rightarrow$ Reveal & Rate. | Active cognitive retrieval before passive rereading. | Users overwhelmingly reveal without thinking. |
| **D-004** | Fixed non-judgmental ratings: *Not yet* (1d), *Partly* (4d), *Got it* (14d). | Simple, predictable, stress-free habit. | Longitudinal research requires SRS tuning. |
| **D-005** | Day 1 Aha Moment: Offer immediate practice recall or 1-day initial return. | Prevents silent churn between capture and first recall. | Onboarding retention exceeds 60% without it. |
| **D-006** | No streaks, gamification, or overdue backlogs. | Preserves calm, restorative product character. | Never (core brand principle). |
| **D-007** | 1-Click `.zip` vault export before complex sync. | Provides immediate trust and portability without cloud lock-in. | Cloud sync is requested by paying cohort. |
| **D-008** | Standardized vocabulary: "Memory", "Library", "Notes/General". | Reinforces recall mental model; removes "Inbox" email triage baggage. | User feedback shows terminology confusion. |

---

## Working Assumptions

1. **Active Retrieval**: Prompting users with a cue before showing the note significantly enhances memory retention compared to passive rereading.
2. **Privacy as a Feature**: Thoughtful readers and professionals value a 100% private, offline tool over cloud sync features.
3. **Calm Design Habits**: Users return more consistently to an app that doesn't induce guilt with red overdue badges or broken streaks.

---

## Product Glossary

| Term | Definition |
|---|---|
| **Memory** | The core user unit in Stories, stored as an individual Markdown file with YAML frontmatter. |
| **Cue** | The question or prompt displayed on the Today screen before the memory body is revealed. |
| **Attempt Stage** | The cognitive thinking space where the user tries to retrieve the concept in their own words. |
| **Reveal & Rate** | The step where the original text is shown and graded (*Not yet*, *Partly*, *Got it*). |
| **Reflection** | An optional dated note appended to the memory after practicing recall. |
| **Library** | The organized collection of all stored memories with search and kind-based filtering. |
| **Wikilink** | Internal link formatted as `[[Target Memory]]` or `[[Target Memory|Custom Label]]`. |
