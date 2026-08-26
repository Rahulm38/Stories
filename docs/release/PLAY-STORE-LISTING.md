# Stories — Google Play listing and declarations

Prepared for the Android client. Recheck all declarations against the final signed AAB before submission.

## Store listing copy

### Recommended title

`Stories — Remember & Tell`

### Recommended short description

`Save moments and ideas. Bring them back later, so they're there when you want to tell them.`

### Recommended full description

Stories helps keep the moments, ideas and observations worth telling available in your memory.

Capture something naturally in seconds. A few days later, Stories brings it back with a small clue. Try telling it before you reveal what you originally saved, then answer one simple question: could you tell it?

Use Stories to:

- Capture a moment, idea, observation, lesson or detail without organising it
- Get a small clue before seeing the original memory
- Practice telling memories naturally, out loud if you want
- Mark a memory Not yet, Mostly or Yes
- Let strong memories spread out while weaker ones return sooner
- Search by people, places, topics and words you remember
- Stop resurfacing a memory without deleting it
- Keep sessions short instead of building an overdue queue
- Edit, share or delete any saved memory

Stories does not require an account, advertising, analytics or cloud sync. Memory content stays in app-private storage on your device. Android cloud backup is disabled for this release.

## Play Console declaration guidance

### App category

- Recommended category: **Productivity**.
- Stories is a private personal-memory tool, not a social network, messaging app, game, medical product, or education course.

### Ads

- **Contains ads: No.**

### App access

- **No restricted access.** There is no account, sign-in, subscription gate, OTP, paywall, or reviewer-only flow.
- Reviewer note: “Stories opens directly to Today. Capture, resurfacing, Library search, editing and privacy flows work without an account or credentials.”

### Data Safety

Recommended answers for the current release, subject to final AAB/SDK verification:

- **Does the app collect or share user data? No.** Memory content remains in app-private device storage and is not transmitted to the developer or third parties.
- **Data types:** none collected or shared off-device by the app.
- **Deletion:** users can edit/delete memories, clear app data or uninstall. The developer cannot remotely retrieve or delete local memory content.
- **Backup:** Android cloud backup is disabled; keep Play declarations and the privacy policy aligned with the shipped manifest.

Do not claim encrypted local storage unless that is explicitly added and verified.

### Privacy policy

- Store-listing privacy URL: `https://rahulm38.github.io/Stories/privacy/`
- Publish [`PRIVACY.md`](../../PRIVACY.md) at that stable HTTPS URL.

### Target audience

- Current policy: general productivity app, not directed to children.
- Recommended audience: **18+** unless the product owner intentionally expands support and completes the corresponding Play review.

## Release evidence

Before production submission, capture current phone screenshots for:

1. New-user Today state
2. One-step capture
3. Hidden clue / tell-before-reveal
4. Revealed memory + Not yet / Mostly / Yes
5. Library search
6. Memory edit / Stop resurfacing
7. Settings / local privacy

Verify persistence after force-stop, airplane-mode use, Android Back, keyboard behaviour, notification permission, large text, TalkBack and final Data Safety declarations.
