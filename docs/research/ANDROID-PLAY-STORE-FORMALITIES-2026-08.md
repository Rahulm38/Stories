# Stories Android / Google Play launch formalities

Checked 23 August 2026 against first-party Google/Android and Expo documentation. This is a launch checklist, not legal advice.

## Action-critical for this checkout

- `apps/mobile/app.json` uses the permanent Play package `com.rahulm.stories`, app name/version, and launcher/adaptive icon assets. `apps/mobile/eas.json` defines preview APK and production AAB profiles with remote versioning. Confirm this package identity before its first Play upload because it cannot be changed for the same listing later.
- The immediate deadline is target API 36: new apps and updates submitted from 31 August 2026 must target Android 16/API 36 or higher. Verify the generated release manifest/build, and update Expo/Android build configuration if the generated target is below 36. [Android target API requirement](https://developer.android.com/google/play/requirements/target-sdk)
- Build a signed production `.aab`, not an APK. Expo’s documented path is `eas build --platform android --profile production`; a production profile normally produces an AAB, while APK output is for device installation and cannot be submitted. New Play apps use Play App Signing; keep the upload credential and recovery material safe. [Expo EAS Submit](https://docs.expo.dev/submit/android/) · [Android developer verification/signing guide](https://developer.android.com/developer-verification/guides/pdf-guides/pdc-guide.pdf)
- If this is a newly created personal Play account (created after 13 Nov 2023), plan at least 14 days before public launch: closed test with at least 12 testers opted in continuously for the preceding 14 days, then apply for production access and answer Play’s testing/readiness questions. Internal testing is optional and does not satisfy this gate. [New personal-account testing requirement](https://support.google.com/googleplay/android-developer/answer/14151465)

## Account and legal formalities

1. Create a Play Console developer account, accept the agreements, pay the one-time US$25 registration fee, and choose Personal or Organization. Personal is appropriate for an individual/hobby project; Organization requires a D-U-N-S number. [Account type](https://support.google.com/googleplay/android-developer/answer/13634885) · [Google’s account setup terms/fee](https://support.google.com/googleplay/android-developer/answer/6112435)
2. Complete identity/payment-profile verification. A personal account may require a government ID; all developers verify a public developer email (organizations also verify a public phone). Organization accounts need D-U-N-S plus organization documentation. [Identity verification](https://support.google.com/googleplay/android-developer/answer/10841920)
3. Create the app in Play Console with the exact package name, default language, app/game type, and free/paid choice. For EAS Submit, create the Play app first and configure a Google service-account key for upload automation; never commit that JSON key. [Expo prerequisites](https://docs.expo.dev/submit/android/)
4. Host a globally reachable privacy-policy URL and link it in Play Console and in-app where required. The policy must cover all data access, collection, use, sharing, retention, and deletion. Data Safety answers must match the shipped binary and every SDK. [Prepare for review](https://support.google.com/googleplay/android-developer/answer/9859455) · [User data policy](https://support.google.com/googleplay/android-developer/answer/10144311)
5. Stories currently appears local-first/offline and has no account flow in the checked app. If that remains true, the account-deletion requirement for account-creating apps is not triggered; still disclose local file storage and any analytics/crash/SDK data accurately. If accounts are added, provide both in-app deletion and a web URL for account/data deletion, and actually delete associated data. [Account deletion requirement](https://support.google.com/googleplay/android-developer/answer/13327111)

## Play Console declarations before submission

- **Data Safety:** inventory what the app and bundled Expo/native SDKs collect/share, whether data is encrypted in transit/at rest, and whether users can request deletion. Local-only Markdown storage may mean “no collection,” but verify rather than assume.
- **Ads:** declare Yes/No. With no ad SDK or ad surfaces, select No. Play can show a “Contains ads” label when applicable. [App content declarations](https://support.google.com/googleplay/android-developer/answer/9859455)
- **Target audience:** declare the age group accurately. For a general productivity/learning app, do not include children unless designed for them; selecting any child age group invokes Families requirements. [Target audience](https://support.google.com/googleplay/android-developer/answer/9867159)
- **Content rating:** complete the rating questionnaire for the new app; answers generate ratings by regional authorities. [Content ratings](https://support.google.com/googleplay/android-developer/answer/9859655)
- **App access:** if all functionality works without login, state that. If anything is gated by login, subscription, location, OTP, or another mechanism, provide reusable English reviewer credentials/instructions that work globally and bypass expiring 2FA/OTP. [Review sign-in requirements](https://support.google.com/googleplay/android-developer/answer/15748846)
- Complete any permissions declarations shown after uploading the AAB. Avoid sensitive permissions unless essential; this checked app appears not to request them.

## Store listing package

Prepare the Play listing: title, short description (80 characters max), full description (4,000 max), support/developer contact, privacy-policy URL, app icon (512×512 PNG, max 1 MB), feature graphic (1024×500 JPEG/24-bit PNG), and phone screenshots that accurately show the shipped app. Screenshots/graphics are visible on test tracks too, so do not upload unfinished marketing claims. [Preview asset requirements](https://support.google.com/googleplay/android-developer/answer/9866151) · [Listing quality guidance](https://support.google.com/googleplay/android-developer/answer/13393723)

## Release and review sequence

1. Build and locally/device-test the release AAB-equivalent app (fresh install, relaunch, keyboard, safe areas, offline persistence, deep links, file/link flows).
2. Upload to Internal testing first; fix crashes and policy/listing mismatches.
3. Create Closed testing, add at least 12 testers (keep a few extra), and leave them opted in continuously for 14 days if the account is a new personal account.
4. Complete all App content and Store listing tasks, submit the production-access application, then promote the tested release to Production after approval. Google can reject if the listing promises functionality the binary does not deliver; review can take up to seven days or longer in exceptional cases. [Publishing tips](https://support.google.com/googleplay/android-developer/answer/15191715) · [Target-audience review timing](https://support.google.com/googleplay/android-developer/answer/9867159)

## Payments

For a free, ad-free, local-first launch with no paid digital features, there is no in-app billing integration to implement. If later charging for subscriptions, cloud storage, premium features, or other digital content, Play-distributed apps generally must use Google Play Billing; paid downloads also use Play Billing. [Payments policy](https://support.google.com/googleplay/android-developer/answer/10281818) · [Play Billing](https://developer.android.com/google/play/billing/)

### Sources checked

All links above are official Google Play/Android Developers or Expo documentation. Requirements can change; re-check the linked pages immediately before submission.
