---
title: Settings, Privacy, and Portability
status: active
last_reviewed: 2026-08-24
---

# Settings, Privacy, and Portability

## Overview & Screen Layout

Settings gives users **direct, honest control** over their memory recall cadence, device reminders, and private local data.

```
┌────────────────────────────────────────┐
│  Settings                              │
│  Local by default. Recall on your      │
│  terms.                                │
│                                        │
│  YOUR MEMORIES                         │
│  12 total memories · 3 practiced       │
│  Next recall returns 27 Aug            │
│                                        │
│  REMEMBERING                           │
│  Default recall interval        3 days ›│
│  Device reminders            [Enabled] ›│
│                                        │
│  STORAGE & PORTABILITY                 │
│  Storage on this device         Local ✓│
│  Export vault (.zip)           [Export]│
│                                        │
│  ABOUT & PRIVACY                       │
│  Privacy policy                  Read ›│
│  Stories v1.0 · Made with care         │
└────────────────────────────────────────┘
```

---

## Functional Specifications

### 1. Memory Management & Defaults
- **Default Recall Timing**: Configurable default for new memories (1 day, 3 days, 1 week, or Off).
- **Device Reminders & Android Permissions**:
  - Toggle to schedule local device alarms at the user's preferred time (e.g. 9:00 AM).
  - Contextually requests Android 13+ `POST_NOTIFICATIONS` permission upon toggle.
  - If permissions are blocked/denied at the OS level, provides clear feedback (*"Notifications are blocked on your device"*) with a direct action to open Android App Settings (`Linking.openSettings()`).
  - Listens to `AppState` changes to seamlessly update permission status when returning from device settings.

### 2. Privacy Guarantees (100% Local)
- **Zero Cloud Transmission**: All notes, search queries, cues, and reflections are strictly stored in local device storage (`stories-vault/`).
- **No Third-Party Trackers**: No advertising, analytics, or background tracking SDKs.
- **Privacy-Safe Previews**: Lock-screen notifications never display private note contents by default.

### 3. Portability & 1-Click Backup
- **1-Click Vault Export**: Packages all Markdown files and metadata into a clean standard timestamped Markdown backup (`stories-vault-backup-YYYY-MM-DD.md`) with automatic browser file downloads on web and local document creation on mobile.
- **Single Memory Share**: Option to export individual Markdown notes as `.md` or plain text.
