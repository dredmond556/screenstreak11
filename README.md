ScreenStreak

Build and publish
- iOS build: `npm run eas:build:ios` (requires Expo account). Then submit: `npm run eas:submit:ios`.
- OTA updates: `npm run publish` to publish updates via Expo.
- Web export: `npm run build:web` produces a static site in `dist/` suitable for static hosting.

Notes
- Screen Time access is iOS-only and requires enabling access in the app. Data stays on-device; mock data is used otherwise.
