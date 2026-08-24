---
title: Edge Cases and Error Handling
document_type: quality_spec
status: active
last_reviewed: 2026-08-24
---

# Edge cases and error handling

## Policy

This is the normative failure-behavior catalog. A case applies whether or not it is implemented. “Preserve data” means preserve the last verified complete version plus the user’s current draft whenever technically possible.

Severity:

- **P0:** plausible silent or irreversible loss/corruption, privacy disclosure, or unsafe path execution.
- **P1:** blocks the core loop, opens/changes the wrong memory, or creates duplicate reminders/writes.
- **P2:** degraded behavior with a safe workaround.
- **P3:** copy, polish, or rare nonblocking inconsistency.

## Startup, hydration, and lifecycle

| Case | Sev | Required handling |
| --- | --- | --- |
| First launch, folder absent | P1 | Create the vault root idempotently and show a genuine empty state; never seed demo notes. |
| Vault contains zero Markdown files | P2 | Open successfully; Today and Library use their empty states. |
| Root cannot be created | P1 | Block writes, show storage error/retry guidance, retain any in-memory draft. |
| One nested directory is unreadable | P1 | Continue scanning readable areas, identify incomplete vault state, and do not present count as complete. |
| One Markdown file is unreadable | P1 | Preserve it, skip from active view with diagnostic/recovery entry; never overwrite it automatically. |
| Hydration is slow | P2 | Show progress; disable writes or isolate pending drafts until merge is safe. |
| User taps Save before hydration | P0 | Block Save; never save against an empty snapshot. |
| App backgrounds during hydration | P1 | Resume the same open or restart idempotently; no duplicate subscriptions/scans. |
| App backgrounds during save | P0 | Complete verified transaction or recover from artifacts on next open. |
| Process dies before temporary write | P1 | Original remains; draft recovery policy applies. |
| Process dies after temporary write, before replace | P0 | Startup validates temp; promote only complete valid Markdown when destination absent/unhealthy. |
| Process dies after backup, before replace | P0 | Startup chooses verified complete version; never delete sole good copy. |
| Process dies after replace, before cleanup | P1 | Keep committed destination and clean stale verified artifacts safely. |
| App resumes after midnight/due time | P1 | Refresh due queue and localized date immediately. |
| Duplicate provider mount/subscription | P1 | Writes remain single; listeners clean up; no duplicated UI updates. |
| Unsupported/invalid route parameter | P2 | Normalize to safe default or show not found; do not crash or create arbitrary content. |

## Capture and edit

| Case | Sev | Required handling |
| --- | --- | --- |
| Empty/whitespace body on new capture | P2 | Disable Save; create nothing. |
| Only details changed, body blank | P2 | Treat draft as dirty for navigation, but still block note creation. |
| Empty title on existing note | P2 | Derive from body or use Untitled according to EDT-011; show resulting title. |
| Empty body on existing titled note | P1 | Follow explicit policy; never infer delete. |
| Very long body/source/cue/title | P1 | Do not truncate silently; preserve editing and explain tested limit/storage failure. |
| IME composition/autocorrect during save | P1 | Save committed input value; do not drop final composed characters. |
| Emoji-only/punctuation-only first line | P2 | Use collision-safe fallback filename, preserve displayed title. |
| Unicode NFC/NFD equivalents | P1 | Normalize path comparison; do not overwrite a canonically equivalent name. |
| Multiple rapid Save taps | P1 | Exactly one logical save, file, and navigation. |
| Save then immediate Back/tab tap | P1 | Block/queue navigation until completion; no false discard prompt after success. |
| Storage fills during temporary write | P0 | Original intact; draft retained; scoped temporary cleanup offered. |
| Read-back verification differs | P0 | Abort commit, preserve original/backup, show failure. |
| Save error after target committed | P0 | Roll back to verified prior state or retain committed state and report accurately; never claim ambiguous success. |
| User cancels with dirty draft | P1 | Confirm Keep editing/Discard, including hardware Back and gesture. |
| OS kills dirty draft | P1 | Until autosave exists, disclose limitation; desired behavior is local recoverable draft. |
| Date text malformed/impossible | P1 | Keep input, show inline error, do not change saved schedule. |
| Type change with custom nested folder | P1 | Preserve custom folder or ask; do not silently move. |
| Clearing optional metadata | P1 | Serialize true absence and do not restore old value. |
| Concurrent edit/write of same note | P0 | Detect version conflict; offer review/copy/retry, never silent last-write-wins. |

## Files, identity, parsing, and paths

| Case | Sev | Required handling |
| --- | --- | --- |
| Two notes have same title | P1 | Generate unique paths; disambiguate Library and suggestions. |
| Two files declare same stable ID | P0 | Load both with unique runtime identities; flag repair; never hide/overwrite. |
| Missing ID | P1 | Load with deterministic temporary identity; migration adds stable ID only after backup. |
| ID changes externally | P1 | Treat as potential conflict/new identity; do not retarget notifications blindly. |
| Same path differs only by case | P0 | Treat as collision across all platforms. |
| Path contains `..`, absolute prefix, NUL, or drive prefix | P0 | Reject/quarantine; never read/write outside vault. |
| Excessively deep/long path | P1 | Preserve file if readable; block unsafe move with clear error. |
| Non-`.md` file in vault | P2 | Ignore and preserve; do not index as a memory. |
| Uppercase `.MD` extension | P2 | Treat as Markdown without renaming silently. |
| UTF-8 BOM/CRLF | P2 | Parse correctly; normalization on save follows documented policy. |
| Non-UTF-8/binary file named `.md` | P1 | Quarantine/diagnose; do not overwrite. |
| Missing frontmatter | P1 | Read body as legacy note; preserve file; migrate only through safe policy. |
| Unterminated/malformed frontmatter | P0 | Preserve raw file and report; do not auto-serialize over it. |
| Unknown scalar/multiline frontmatter | P1 | Round-trip without letting indented keys override known metadata. |
| Invalid created/updated timestamp | P2 | Load note; place after valid dates with deterministic tie-break. |
| Impossible/locale recall timestamp | P1 | Ignore schedule, preserve raw metadata if safe, surface diagnostic. |
| Filename collision during move | P1 | Choose explicit collision-safe path; rewrite links transactionally. |
| Backlink rewrite fails mid-move | P0 | Roll back target and every rewritten file. |
| Stale `.tmp`/`.bak` artifacts | P1 | Validate completeness, restore only when safer, retain unrecoverable artifacts. |
| Derived index missing/corrupt/newer | P1 | Delete/rebuild index from Markdown without modifying source. |

## Library, search, and links

| Case | Sev | Required handling |
| --- | --- | --- |
| Search query blank/whitespace | P3 | Restore normal Library. |
| No matches | P2 | Show no-results and Clear search. |
| Query contains regex/control/RTL characters | P1 | Treat as literal text, render safely, no crash. |
| 5,000+ notes | P1 | Meet performance budget or visibly degrade with cancelable indexing/fallback. |
| Duplicate titles in results | P1 | Show path qualifier before tap. |
| Empty nested folder | P3 | Show clear empty row only when explicitly expanded. |
| Link target empty `[[ ]]` | P2 | Do not suggest/create; leave readable text. |
| Link target missing | P1 | On explicit tap, create sanitized draft or offer create/cancel per surface. |
| Link target ambiguous | P1 | Explain and require qualification; never guess. |
| Link points to current note | P2 | Resolve without infinite navigation; suggestion excludes self. |
| Circular links A→B→A | P2 | Navigation stack remains bounded by user actions; no recursive rendering. |
| Alias contains `]`/malformed syntax | P2 | Render as plain text; preserve source. |
| Move changes only case/Unicode normalization | P0 | Use safe intermediate transaction where filesystem requires it. |
| External URL unsupported/malformed | P1 | Block handoff, show error, never create local note. |
| `javascript:`, `data:`, `file:` link | P0 | Block as unsafe/unsupported. |
| OS cannot open valid `mailto/tel/sms/http` | P2 | Show handler failure; keep current note. |
| External link tapped repeatedly | P2 | Prevent duplicate handoffs while request is active. |

## Recall and time

| Case | Sev | Required handling |
| --- | --- | --- |
| No due recalls | P3 | Capture first; no empty recall card. |
| Many overdue recalls | P2 | Earliest first, accurate count, no punitive styling; one item at a time. |
| Equal due timestamps | P2 | Stable path/ID tie-break. |
| Due date crosses DST | P1 | Calendar-day intent stays coherent; never schedule twice or skip silently. |
| User changes time zone | P1 | Recompute display/queue and reconcile notifications using documented instant/calendar semantics. |
| User moves clock backward/forward | P1 | Refresh queue; outcome remains idempotent. |
| Leap day/month-end | P1 | Valid calendar arithmetic; tests for Feb 29, month/year rollover. |
| Invalid timestamp | P1 | Exclude from due queue; diagnostic available. |
| Cue is blank | P2 | Use type fallback. |
| Cue accidentally contains full answer | P2 | User-authored content is shown, but notification preview stays generic; product may warn, not censor. |
| Note changes during attempt | P1 | Detect version mismatch and reset; never grade stale body. |
| Note removed during attempt | P1 | Exit safely, reconcile schedule, preserve reflection draft for copy if nonblank. |
| App backgrounds on revealed stage | P2 | Preserve stage in-process; lock-screen/app-switcher privacy policy must be tested. |
| Rapid rating taps | P1 | One outcome and at most one reflection append. |
| Outcome write fails | P0 | Keep revealed state/reflection; due date unchanged; retry. |
| Defer write fails | P1 | Keep current cue; no success copy. |
| Reflection blank/whitespace | P3 | Append nothing. |
| Reflection already includes a wikilink/heading | P2 | Preserve as Markdown; do not sanitize ordinary syntax. |
| All due items completed | P3 | Calm completion and Capture-first Today; no score/streak. |

## Notifications

| Case | Sev | Required handling |
| --- | --- | --- |
| Permission not determined | P2 | Ask only in context after explanation; in-app queue works. |
| Permission denied/blocked | P2 | Show OS guidance if user asks; do not reprompt repeatedly. |
| Permission revoked later | P1 | Settings reflects state; reconcile safely; in-app queue remains. |
| OS pending-request limit reached | P1 | Schedule bounded horizon and record diagnostic; never lose Markdown due dates. |
| Same note rescheduled repeatedly | P1 | Replace one stable request, no duplicates. |
| Note graded/deferred/disabled/deleted | P1 | Cancel stale request and schedule current one if applicable. |
| App update/reboot | P1 | Reconcile all pending IDs against Markdown. |
| Notification fires after note unavailable | P2 | Safe unavailable state; remove stale derived request. |
| Cold-start notification tap before hydration | P1 | Hold validated destination, open once after vault ready. |
| Multiple notification taps | P1 | Deduplicate navigation and outcome. |
| Private cue on lock screen | P0 | Generic default preview; explicit opt-in required for content. |
| Notification scheduling API fails | P2 | Explain in Settings/diagnostics; in-app due state remains authoritative. |

## Backup, restore, upgrade, and deletion

| Case | Sev | Required handling |
| --- | --- | --- |
| User cancels destination picker | P3 | No error/success; source unchanged. |
| Backup target exists | P1 | Unique name or explicit overwrite confirmation; never silent overwrite. |
| Storage fills during backup | P1 | Source intact; incomplete export not marked valid. |
| Backup interrupted | P1 | No success; incomplete artifact clearly invalid/removable. |
| Restore archive corrupt/checksum mismatch | P0 | Reject before mutation. |
| Restore contains traversal/symlink/absolute paths | P0 | Reject/quarantine; never escape staging root. |
| Restore from newer schema | P0 | Open no files for write; explain version requirement. |
| Merge same ID/same content | P2 | Deduplicate safely. |
| Merge same ID/different content | P0 | Conflict; keep both/stage resolution, no overwrite. |
| Merge different ID/same path | P1 | Collision-safe rename with reported mapping and link strategy. |
| Restore fails after staging | P0 | Roll back to automatic pre-restore backup. |
| Migration interrupted | P0 | Resume/rollback idempotently; at least one complete vault remains. |
| Delete note with inbound links | P1 | Move to trash; links remain unresolved, not removed. |
| Restore deleted note into occupied path | P1 | Offer collision-safe restore; stable ID preserved. |
| Uninstall/clear app data | P0 | Consequence disclosed beforehand; no remote recovery claim. |

## Error copy pattern

Every error should answer:

1. What did not happen? (“This memory was not saved.”)
2. Is existing data safe? (“Your previous file was not replaced.”)
3. What can the user do? (“Free space and try again.”)
4. Where can they get more detail without exposing content? (Diagnostics/copyable error code.)

Avoid “Something went wrong” as the only message. Never claim recovery, backup, encryption, or persistence unless verified.
