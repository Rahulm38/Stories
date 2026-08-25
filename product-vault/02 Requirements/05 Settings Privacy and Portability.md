---
title: Settings and Privacy
status: active
last_reviewed: 2026-08-25
---

# Settings and Privacy

## Overview & Screen Layout

Settings gives users **direct, honest control** over recall behavior, quiet local reminders, and the privacy of their local data. It is deliberately not a progress dashboard.

```
┌────────────────────────────────────────┐
│  Settings                              │
│  Local by default. Recall on your      │
│  terms.                                │
│                                        │
│  REMEMBERING                           │
│  New memories return in 3 days         │
│  Quiet reminder              [Enabled] │
│                                        │
│  STORAGE & PRIVACY                     │
│  Stored on this device          Local  │
│  Vault location        app-private path│
│                                        │
│  ABOUT                                 │
│  Privacy policy                  Read  │
└────────────────────────────────────────┘
```

---

## Functional Specifications

### 1. Memory Management & Defaults
- **Default Recall Timing**: New memories return in 3 days by default. Capture can choose 1 week or Off for an individual memory.
- **Quiet Device Reminders & Android Permissions**:
  - Toggle schedules a local notification at the reminder time when a memory is ready to return.
  - Reminder preference persists locally across app restarts.
  - Requests Android 13+ `POST_NOTIFICATIONS` permission only when the user enables reminders.
  - If permissions are blocked at the OS level, provides clear feedback and a direct action to Android App Settings.
  - Returning from device settings refreshes permission state and reconciles the next local reminder.
  - Lock-screen copy never includes memory contents.

### 2. Privacy Guarantees (Local Memory Content)
- **Local Memory Content**: Notes, search queries, cues, and reflections remain in app-private device storage (`stories-vault/`).
- **No Account Required**: Stories does not require sign-in or a cloud identity.
- **No Third-Party Trackers**: No advertising or analytics SDKs are part of the v1 memory experience.
- **Local Reminders**: Reminder scheduling is performed on-device and notification copy is generic.

### 3. Storage Transparency
- Settings identifies the vault as local and app-private and shows its device location for transparency.
- Stories must never imply that an in-app private file is an external backup.
- If a Markdown file cannot be read, Stories leaves it unchanged, continues opening healthy memories, and surfaces the affected path in Library.
