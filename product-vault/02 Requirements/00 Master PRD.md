---
title: Master PRD
status: active
version: 1.0-streamlined
last_reviewed: 2026-08-24
---

# Stories v1 Master PRD

## Executive Summary

Stories is an Android-first, local-first memory companion for book learnings, personal insights, and lived experiences. It stores ordinary Markdown, makes capture instantaneous, and brings memories back through active recall prompts before revealing the text.

The product succeeds when people **remember and reuse what mattered**—not when they amass unread notes.

---

## Core Product Goals

- **G1 (Speed)**: Capture a thought in under 20 seconds with one required text field.
- **G2 (Recall)**: Complete a due recall session in under 30 seconds.
- **G3 (Activation)**: Give first-time users an immediate "aha moment" through a Day 1 practice recall.
- **G4 (Durability)**: Zero silent data loss across save, edit, move, relaunch, and export.
- **G5 (Trust & Privacy)**: 100% offline, zero tracking, standard UTF-8 Markdown with 1-click backup.
- **G6 (Accessibility)**: Full support for 200% font scaling, TalkBack / VoiceOver screen readers, and 48dp touch targets.

---

## Core Surfaces & User Flow

| Surface | Primary User Intent | Key Actions | Detailed Spec |
|---|---|---|---|
| **Today** | Remember due memories; capture new thoughts | Try to recall / Capture | [[02 Requirements/01 Capture]], [[02 Requirements/02 Recall]] |
| **Capture** | Preserve a thought quickly | Write / Save memory | [[02 Requirements/01 Capture]] |
| **Recall** | Active retrieval (Cue → Attempt → Reveal → Rate) | Reveal / Rate (*Not yet, Partly, Got it*) | [[02 Requirements/02 Recall]] |
| **Library** | Explore and search stored memories | Search / Filter by folder / Open | [[02 Requirements/03 Library Search and Links]] |
| **Memory Reader & Editor** | Read, edit, and link memories | Read / Edit / Link | [[02 Requirements/04 Note Editing and Content Model]] |
| **Settings** | Manage recall timing, storage, privacy, and backup | 1-Click Export / Default interval | [[02 Requirements/05 Settings Privacy and Portability]] |

---

## End-to-End User Experience

```
1. First Launch
   └─ Warm prompt: "What is worth remembering?"
   └─ User writes 1 sentence → Saves memory.
   └─ Immediate Aha Option: "Try recalling now" (practice mode) or returns on tomorrow / 3 days.

2. On Due Date
   └─ Today screen surfaces the Due Recall card above Capture.
   └─ Prompt: "What idea from [Source] did you want to remember?" (body is hidden).
   └─ User chooses "Try to recall" → enters thinking space.
   └─ User chooses "Reveal memory" → original body is revealed.
   └─ User rates: Not yet (1d) / Partly (4d) / Got it (14d).
   └─ Optional: Append a quick reflection ("What's changed since then?").

3. In Library
   └─ Clean list of memories with search across text, title, kind, and source.
   └─ Organized by kinds (Books, Experiences, Notes) or all-memories view.
```

---

## Key Metrics & Success Signals

### Primary Metric (Product Health)
- **Weekly Remembered & Reused Memories (WRRM)**: Number of unique memories rated *Partly* or *Got it* that were successfully recalled or enriched with a reflection within 7 days.

### Activation & Retention Funnel
- **Day 1 First Memory Saved**: User writes and saves at least 1 memory in their initial session.
- **Day 1 Practice Completion**: User completes the optional first-session practice loop.
- **Day 7 First Scheduled Recall**: User returns and completes their first due recall.
- **Capture Speed**: Median capture session time under 20 seconds.
- **Zero Guilt Backlog**: Recalls are calm; no accumulated red badge counts.
