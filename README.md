# Stories

Stories is a lightweight, mobile-first Markdown vault for remembering useful things—not just collecting notes.

## Product direction

- Notes are stored as Markdown documents with a small rebuildable local index.
- Folders and `[[filename.md]]` links provide the Obsidian-like foundation.
- A note can be a regular note, an experience, or a book learning.
- Experience notes preserve context and lessons; book-learning notes preserve the source, idea, and how to use it.
- The native build should map the vault to app-owned device storage without changing the Markdown format.
- A global graph stays deferred until the file/link model earns it.

## Local prototype

```bash
npm run dev
```

Open the local address printed by Next.js. Notes currently persist in the browser’s local vault adapter; the storage boundary is kept separate so it can move to native device files later.

## Native preview

The Android-first native client lives in `apps/mobile` and uses Expo SDK 57, React Native, and Expo Router. It is a real native UI path, not a responsive wrapper around the web prototype. It stores Markdown files in app-private device storage and reuses the same vault contract on iOS later.

```bash
cd apps/mobile
npx expo start
```

Use `A` with an Android Studio emulator or scan the development QR code from a physical device. This checkout does not currently include an Android SDK, so the native code is linted, type-checked, exported for web, and config-validated here; device verification is the next setup step.

### Android smoke check

With the server running, check the same product slice on a device:

1. Open Capture and save a Note, Book learning, and Experience.
2. Select text and exercise Heading, Bold, Italic, Quote, lists, Checklist, Code, Link, Increase indent, and Decrease indent. With a hardware keyboard, verify Tab and Shift+Tab.
3. Expand Memory details, set a recall cue, save, and reopen the note.
4. Open Library, expand each folder, search, open the note, edit it, and use the system Back action.
5. Force-stop and relaunch to confirm the Markdown files and recall state remain.

For a physical Android phone, install Expo Go, enable USB debugging if using a cable, keep the phone and computer on the same network, then scan the QR code. For an emulator, install Android Studio with an API image, boot it, run `adb devices`, and press `A` in the Expo terminal. Android keyboard, TalkBack, font scaling, selection handles, and force-stop persistence are device checks; the current checkout cannot claim those without the SDK or a phone.

### Expo Go SDK mismatch

This client currently targets Expo SDK 57. Expo Go supports one SDK at a time, so the project and the installed Expo Go binary must match. If the Play Store build still reports an incompatibility, download the Android SDK 57 Expo Go binary and install that APK on the phone:

```bash
cd apps/mobile
npx expo-go download android 57
```

After installing the downloaded APK, restart with `npx expo start --clear` and scan the QR code again. A development build is the longer-term path for production work; do not downgrade this project to SDK 54 just to match a store Expo Go build without deciding that tradeoff first.

Read the native decision and storage boundary in [MOBILE-ARCHITECTURE.md](docs/product/MOBILE-ARCHITECTURE.md), and the execution order in [ANDROID-FIRST-SLICES.md](docs/product/ANDROID-FIRST-SLICES.md).

## Verification

```bash
npm run test:core
npm run lint
npm run build
cd apps/mobile && npx tsc --noEmit && npx expo export --platform web
```
