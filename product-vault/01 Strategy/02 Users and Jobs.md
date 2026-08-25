---
title: Users and Jobs
status: approved
last_reviewed: 2026-08-25
---

# Users and Jobs

## Primary User Persona: The Reflective Learner

A thoughtful adult who reads non-fiction, reflects on work and relationships, and makes decisions from experience. They capture insights in notes or highlights, but struggle when they need to recall them: *"I know I learned something valuable about this, but I can't retrieve it right now."*

They value **privacy**, **low cognitive load**, and **simplicity** over complex databases, dashboards, or public sharing.

### Secondary Segments
- **The Avid Reader**: Wants to remember 5–10 core takeaways from each book without building complex flashcards.
- **The Deliberate Professional**: Wants lessons from past projects, retrospectives, and client conversations to resurface when relevant.
- **The Reflective Journaler**: Wants meaningful life experiences and personal insights to inform future decisions.

---

## Jobs to Be Done (JTBD)

### 1. Capture: "Preserve the thought before it slips away"
- **Context**: I just read an insightful page or had a breakthrough in a meeting.
- **Job**: Help me record the idea in under 20 seconds without forcing me to categorize, tag, or format.
- **Success Signal**: One sentence in plain text is enough to save, and an unfinished capture can be recovered after interruption.

### 2. Recall: "Re-engage my mind before showing me the answer"
- **Context**: A memory from last week is due to return.
- **Job**: Prompt me with a cue so I can actively retrieve the concept before reading the note.
- **Success Signal**: Cue gives enough context without spoiling the answer; loop takes <30 seconds.

### 3. Reuse: "Connect the old insight with today's reality"
- **Context**: A past lesson is relevant to something happening today.
- **Job**: Let me quickly add what changed (a reflection) or link it to another memory.
- **Success Signal**: Reflection is appended cleanly without overwriting the original memory.

### 4. Trust: "My private thoughts stay on my device"
- **Context**: I write personal, candid reflections.
- **Job**: Keep memory content local, offline, and readable as ordinary Markdown without requiring an account.
- **Success Signal**: No account, no cloud telemetry, verified local writes, and explicit warnings if a local Markdown file cannot be read.

---

## User Anxieties & UX Solutions

| User Anxiety | How Stories Solves It |
|---|---|
| *"Will I lose my thought if I switch apps or Android closes it?"* | Unsaved-change guard plus a recoverable local capture draft. |
| *"Why is this memory returning? Can I stop it?"* | Transparent calendar-day scheduling with a clear "Bring this back" picker and "Off" option. |
| *"Did Stories silently lose one of my files?"* | Healthy files continue opening while unreadable Markdown files are reported explicitly and left unchanged. |
| *"Am I falling behind if I miss a few days?"* | No overdue badges, no streak penalties, no red counts. Calm catch-up. |
| *"Is this app reading or uploading my private notes?"* | Memory content stays on-device; reminders are scheduled locally. |
