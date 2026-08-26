# Settings and Privacy

## Goal

Keep Settings small. Only preferences and trust information that materially affect the user belong here.

## Reminders

One setting: **Quiet reminder**.

- Default off.
- Do not request notification permission during onboarding or first capture.
- After the first real resurfacing, offer the reminder contextually once.
- If enabled, schedule quiet local notifications only when something is ready to come back.
- If blocked, provide `Open device settings`.

## Privacy

Use a familiar lock icon and clear copy:

**Stays on this device**

`Your memories stay local. Stories does not require an account or upload your content.`

Do not expose internal storage locations, paths, data-format terminology or developer implementation details.

## Privacy policy

The in-app policy and hosted policy must remain aligned with the shipped app and Play Data Safety answers.

Current claims:

- no account;
- no ads;
- no analytics SDK;
- no developer collection or sharing of memory content;
- Android cloud backup disabled;
- local reminder scheduling only when enabled.

## Portability

Do not promise export, cloud backup, sync or migration until a user-visible, tested feature exists. Older local data remains readable through an internal compatibility layer.
