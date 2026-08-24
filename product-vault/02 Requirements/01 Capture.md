---
title: Capture Requirements
status: active
last_reviewed: 2026-08-24
---

# Capture

## Overview & Outcome

A user can preserve a meaningful thought in **under 20 seconds** and know with certainty that it reached durable local storage. Classification and scheduling are optional enhancements that never block saving.

---

## Screen Anatomy & Interaction Flow

```
┌────────────────────────────────────────┐
│  New memory                            │
│                                        │
│  [ Write what you want to remember… ]  │  ← Auto-focused writing canvas
│                                        │    (only required input)
│                                        │
│  ▼ Memory details                      │  ← Collapsed disclosure
│    Note · returns in 3 days            │    (summarizes current options)
│                                        │
│  🔒 Stored privately on this device    │  ← Reassuring local privacy cue
│                                        │
│  [ Cancel ]          [ Save memory ]   │  ← Clear action hierarchy
└────────────────────────────────────────┘
```

### Core Capture Principles

1. **Text Canvas First**: The writing area is immediately focused. One sentence is enough to save.
2. **Progressive Disclosure**: Memory kind, source, and recall timing are tucked behind a calm "Memory details" disclosure row.
3. **Smart Defaults**:
   - Kind defaults to `Note` (stored in `Notes/`).
   - Timing defaults to `3 days` (or `1 day` for the first-ever memory to accelerate the Day 1 Aha Moment).
   - Cue prompt defaults to an intelligent kind-specific fallback if left blank.

---

## Field Specifications

| Field | Required? | Default | User Options / Behavior |
|---|---|---|---|
| **Body** | **Yes** | Blank | Multiline Markdown. Save is enabled as soon as non-whitespace text is typed. |
| **Kind** | No | `Note` | `Note`, `Book learning`, `Experience`. |
| **Source / Context** | No | Blank | Visible for Book learning ("Book or author") and Experience ("People, place, or context"). |
| **Recall Timing** | No | `3 days` | `1 day` (onboarding), `3 days` (default), `1 week`, or `Off`. |
| **Recall Cue** | No | Kind Fallback | Custom prompt for future recall (e.g. *"What was the key insight about habit loops?"*). |

---

## UI/UX Polish Requirements

- **Button Clarity**: Save button uses semantic action color; disabled state indicates text is needed. Cancel is a low-emphasis action.
- **Clean Disclosure**: When "Memory details" is expanded, it uses a soft `surfaceMuted` background rather than a harsh border.
- **Title Extraction**: When no title is explicitly given, the first meaningful line of body text becomes the display title and collision-safe filename.
- **Draft Protection**: If the user attempts to leave with unsaved text, a native confirmation sheet asks *"Keep editing"* or *"Discard draft"*.
- **Instant Save Confirmation**: On successful save, returns to Today with a temporary banner: *"Saved privately. It returns on [Concrete Date]."*
