# Stories — Google Play listing and declarations

Prepared for the current Android client. Claims below are limited to behavior present in the checked-in app and must be rechecked against the signed release AAB before submission.

## Store listing copy

### Recommended title

`Stories — Local Recall`

This is 22 characters and keeps the product name plus its clearest differentiator. Confirm the final title is available and does not conflict with another app or trademark.

### Recommended short description

`Capture what matters, recall it later, and keep every note as local Markdown.`

This is 77 characters (within Play's 80-character limit).

### Recommended full description

Stories helps you keep useful ideas and lived experiences close enough to use again.

Capture a thought in seconds, add an optional source or context, and choose whether to bring it back later. When a memory is due, Stories asks you to try recalling it before showing the original note.

Use Stories to:

- Capture notes, book learnings, and experiences
- Add optional recall cues for tomorrow or a later date
- Practice recall before revealing the source note
- Mark a recall remembered, partly remembered, or forgotten
- Browse notes in Inbox, Books, and Experiences
- Search and edit your local Markdown files
- Connect notes with `[[wikilinks]]`
- Keep notes in app-private storage on your Android device

Stories does not require an account, cloud sync, advertising, or analytics. Your notes remain local to the app. Android cloud backup is disabled for this release.

Stories is intentionally quiet: a focused capture flow, a durable Markdown library, and a small recall loop for turning what you read and live into something you can retrieve.

## Play Console declaration guidance

These are recommendations for the current client, not legal advice. Complete the live Play Console forms from the final AAB and update them if a dependency or feature changes.

### App category

- Recommended category: **Productivity**.
- The app is a private note and recall tool, not a social network, messaging app, game, medical app, or education course.

### Ads

- **Contains ads: No.**
- There is no advertising surface or ad SDK in the mobile app.

### App access

- **No restricted access.** The app has no account, sign-in, subscription gate, OTP, paywall, or reviewer-only flow.
- Reviewer note: “Stories opens directly to the local Today screen. All capture, recall, library, linking, editing, and privacy-policy flows are available without an account or special credentials.”

### Data Safety

Recommended answers for the current release, subject to final AAB/SDK verification:

- **Does the app collect or share user data? No.** Notes are written to app-private device storage and are not transmitted to the developer or third parties.
- **Data types:** none collected or shared off-device by the app.
- **Purpose:** not applicable because no data is collected or shared.
- **Encryption in transit:** not applicable if no user data is transmitted.
- **Deletion:** no account exists and the developer cannot remotely receive or delete notes. Users can edit/delete notes, clear app data, or uninstall the app.
- **Backup:** Android cloud backup is disabled in `apps/mobile/app.json`; keep the declaration and privacy policy aligned with the shipped manifest.

Do not claim encryption at rest unless the release adds encrypted local storage. Recheck bundled Expo/native SDK behavior and the final manifest before submitting the form.

### Privacy policy

- Store-listing privacy URL placeholder: `https://YOUR-DOMAIN.example/stories/privacy`
- Publish the contents of [`PRIVACY.md`](../../PRIVACY.md) at a stable HTTPS URL before submission.
- Keep the in-app policy screen and hosted policy synchronized. Replace the current “support contact shown on the listing” wording with the real support email once chosen.

### Target audience and children

- Current product policy: **not directed to children**; it is a general productivity app for personal notes and recall.
- Recommended audience: **18+**, unless the owner intentionally wants to support younger users and completes the corresponding child-safety review.
- Do not market the app as a children’s app or include child-directed language/assets without revisiting the privacy policy and Play declarations.

### Content rating

- Complete the official questionnaire for each target region.
- Expected outcome is likely the lowest/general productivity rating: no violence, sexual content, gambling, drugs, profanity, or public social interaction is part of the shipped product.
- Answer the questionnaire from the final binary; private user-created notes should not be described as a public community or publishing feature.

## Owner-only decisions before submission

- Replace the privacy URL placeholder with a controlled HTTPS domain.
- Supply the public developer name, support email, and (if used) support website.
- Confirm the final app title, screenshots, feature graphic, icon, description translations, countries, and free pricing.
- Confirm whether the intended audience is strictly adults or a broader non-child audience.
- Confirm the Play developer account type and complete identity/contact verification.
- Enroll in Play App Signing or provide the release keystore to the build system without committing secrets.
- Run internal testing, then the required closed-test process if the Play account is a newer personal account.

## Release evidence to attach to the listing review

- Signed production AAB from `apps/mobile/eas.json` (`production` profile, `app-bundle`).
- Final package `com.rahulm.stories`, version name `1.0.0`, and a unique/incremented version code.
- At least current phone screenshots showing Today/capture, recall, Library, note editing, and Settings/privacy.
- Device test evidence for relaunch persistence, airplane-mode use, keyboard/back behavior, external-link handling, accessibility, and the disabled-backup policy.

