# Stories Native Design Language

> This document defines runtime and platform mapping. The product UI source of
> truth is the [Stories Design System](./STORIES-DESIGN-SYSTEM.md).

## Direction

Stories should feel like a quiet system app for remembering, not a responsive website inside a phone frame. The product identity comes from its language, recall behavior, and restrained ink-blue palette; platform behavior should remain native.

## Runtime choice

The first store client uses Expo SDK 57, React Native, and Expo Router. Android and iOS therefore share one screen implementation, navigation model, and TypeScript vault contract. Storage, notifications, and deep links remain platform adapters. The Next.js app is a behavior prototype, not a responsive wrapper around the native client.

## Shared principles

- Full-screen app surfaces with safe-area-aware top and bottom navigation.
- System typography first: San Francisco on iOS and Roboto on Android.
- One primary action per screen and 44pt/48dp minimum touch targets.
- Inline capture and editing; no modal or bottom-sheet editor for the core writing flow.
- Flat grouped lists, separators, and subtle surface tints before cards, borders, or elevation.
- No hover states, ornamental animation, gradients, floating action button, or pill-shell navigation.
- Motion, when later added, is limited to platform-standard navigation and state transitions and respects reduced-motion settings.

## Platform mapping

| Product pattern | iOS / SwiftUI | Android / Jetpack Compose |
| --- | --- | --- |
| Screen hierarchy | `NavigationStack` with large/inline title | `Scaffold` with `TopAppBar` |
| Primary navigation | `TabView` | `NavigationBar` |
| Capture field | Inline `TextEditor` and native buttons | Inline `BasicTextField`/`OutlinedTextField` and Material buttons |
| Memory rows | `List` or lazy stack with semantic separators | `LazyColumn` with list items and dividers |
| Recall outcome | Native segmented actions or accessible buttons | Material segmented buttons or accessible buttons |
| Icons | SF Symbols by semantic name | Material Symbols by semantic name |
| Colors | Semantic system backgrounds, labels, separators plus Stories accent | Material color roles plus Stories accent |
| Local notifications | `UNUserNotificationCenter` | `NotificationManager` / `WorkManager` as appropriate |

The shared React Native shell uses `SafeAreaView`, `KeyboardAvoidingView`, `TextInput`, `ScrollView`/`FlatList`, Expo Router's `Stack`/`Tabs`, and Expo FileSystem. These primitives provide native keyboard, safe-area, and navigation behavior while keeping platform-specific code at adapter seams.

## Navigation

The first release has three destinations:

1. **Today:** quick capture and due recall.
2. **Library:** book learnings, experiences, Inbox items, search, and their underlying Markdown files.
3. **Settings:** capture prompts, recall preferences, privacy, and local storage.

Note links open through the native navigation stack. The back gesture/button remains platform-owned. A global graph is not a primary destination.

## Web prototype boundary

The Next.js prototype validates hierarchy, copy, density, and the Capture → Cue → Recall interaction. It is not the runtime plan for the store apps. The Expo client implements the same contracts in native UI, backed by app-private Markdown files and a later rebuildable SQLite index.
