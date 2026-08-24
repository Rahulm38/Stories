---
title: Recall Requirements
status: active
last_reviewed: 2026-08-24
---

# Recall

## Overview & Outcome

A due memory returns in a calm, nonjudgmental practice loop that **prompts active retrieval before rereading**, then schedules an intelligent next return.

$$\text{Due Memory} \longrightarrow \text{Cue Stage} \longrightarrow \text{Attempt Stage} \longrightarrow \text{Reveal & Rate Stage} \longrightarrow \text{Next Interval}$$

---

## The 3-Stage Recall Experience

### Stage 1: Contextual Cue
- Surfaces on the **Today** screen before capture.
- **Personalized Prompts**:
  - *Book learning*: "What idea from *[Source]* did you want to remember?"
  - *Experience*: "What changed in your experience with *[Context]*?"
  - *Note*: Custom recall prompt, or "What was worth remembering here?"
- **Actions**: `Try to recall` (primary) or `Tomorrow` (defers by 1 day without grading).

### Stage 2: Attempt (Active Retrieval Space)
- The memory body remains completely hidden from visual and screen-reader surfaces.
- **Copy**: *"Take a moment. What comes to mind in your own words?"*
- **Action**: `Reveal memory` (prompts user when ready; no mandatory typing required).

### Stage 3: Reveal, Rate & Reflect
- Reveals the original text in a distinct reading block.
- **Rating Choices**:
  - **Not yet** (`forgot`) $\rightarrow$ returns in **1 day**
  - **Partly** (`partial`) $\rightarrow$ returns in **4 days**
  - **Got it** (`remembered`) $\rightarrow$ returns in **14 days**
- **Optional Reflection**: A calm text input below the ratings: *"Add a reflection (optional)"*.
  - When filled, appends a dated section to the Markdown file:
    ```markdown
    ## Recall reflection
    2026-08-24
    Your new reflection text here...
    ```

---

## Local Notification & Android Permissions

| Capability | Behavior |
|---|---|
| **Privacy-Safe Previews** | Lock screen alerts say *"A memory is due for recall"* without exposing personal note text or sensitive cues. |
| **Contextual Timing** | Android 13+ (`POST_NOTIFICATIONS`) permission is requested contextually on the **Day 1 First Memory Card** or when toggling **Device Reminders** in Settings—never on cold start. |
| **Permission Recovery** | If permission was previously denied or permanently blocked, the UI provides a 1-tap link to Android App Settings via system deep link (`openDeviceNotificationSettings`). |
| **Day 1 Aha Trigger** | When the vault has zero notes (fresh install or after a user deletes all notes), saving the first memory triggers the welcoming Day 1 Aha prompt with 1-tap practice recall and contextual reminder prompt. |
| **Deep Link** | Tapping a reminder opens the specific memory cue directly. |
| **Reconciliation** | Rescheduling, rating, or deleting a memory immediately cancels and updates pending notifications. |
| **100% Offline** | Notification scheduling is strictly on-device using local OS alarms. |

---

## UI/UX Principles for Recall

1. **Zero Guilt**: No overdue counters, red badges, or "You missed 5 memories" alerts. All due items sort earliest-first and wait calmly.
2. **Deterministic Outcomes**: Ratings always map to predictable intervals (1d, 4d, 14d) without mysterious black-box algorithms.
3. **Closure Copy**: After rating, shows: *"Practiced. Returns on [Concrete Date]. 2 left today."*
4. **Anticipation**: When Today has zero due recalls, show a subtle preview line: *"Next memory returns on [Date]."*
5. **Aha Moment Continuity**: When all memories are deleted, the system resets cleanly so the user receives the welcoming Day 1 experience upon their next capture.
