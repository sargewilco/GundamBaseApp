# GundamBaseApp — Project Context

React Native / Expo companion app for the GundamBase Gunpla inventory manager.

## Related Project
Web app (API server): `C:\Users\commw\GundamBase`
API base URL: `https://gundam.tomcannon.com/api`

## Stack
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation — bottom tabs + native stack
- **Auth storage**: AsyncStorage (`auth_credentials` key, base64-encoded `user:pass`)
- **Haptics**: `expo-haptics`
- **Audio**: `expo-audio` (NOT expo-av — deprecated in SDK 54)
- **Icons**: `@expo/vector-icons` Ionicons

## Running the App
```bash
npx expo start    # then press i for iOS, a for Android
```

## File Structure

```
App.js                        # Root: tab navigator wrapping two stacks
index.js                      # Expo entry point
constants/theme.js            # Shared colors + grade color tokens
services/api.js               # All API calls (fetchInventory, addKit, updateKit, deleteKit)
utils/feedback.js             # Haptic + sound feedback helpers
screens/
  CollectionScreen.js         # 2-column kit grid, search, grade/status filters
  KitDetailScreen.js          # Full kit detail view, status change, delete
  AddEditScreen.js            # Add and edit kit form; handles 401 → auth prompt
  StatsScreen.js              # Stats: grade distribution, build status, top series
  InventoryScreen.js          # (unused/legacy)
assets/
  click.wav / click.mp3       # Tap sound effect
  complete.wav / complete.mp3 # Success sound effect
```

## Navigation Structure
```
Tabs
├── CollectionTab (CollectionStack)
│   ├── Collection (CollectionScreen)
│   ├── KitDetail  (KitDetailScreen)
│   └── AddEdit    (AddEditScreen) — modal presentation
└── StatsTab (StatsStack)
    └── Stats (StatsScreen)
```

## Authentication
- nginx basic auth protects all non-GET API routes
- App catches 401 responses and shows a credential prompt (bottom sheet in AddEditScreen)
- Credentials saved to AsyncStorage after successful auth; reused automatically
- `runWithAuth(action)` pattern in AddEditScreen: attempt action → on 401 → prompt → retry

## Key Patterns

### API calls
All calls go through `services/api.js` which reads the stored auth credentials and injects the `Authorization: Basic ...` header on write operations.

### Feedback
```js
import { tapFeedback, selectFeedback, successFeedback, errorFeedback } from '../utils/feedback';
```
Each function triggers both a haptic and a sound.

### Grade colors
```js
import { grade as gradeTheme } from '../constants/theme';
// gradeTheme['HG'] → { bg: '...', text: '...' }
```

### Charts / Visualizations
No SVG library — all charts are pure React Native `View` components using flex layout.
- `GradeSegmentBar` in StatsScreen: flex row of colored segments
- `ProgressBar` in StatsScreen: track + fill using percentage width
- `GradeBar` in StatsScreen: badge + bar + count

## Known Compatibility Constraints (Expo SDK 54)
- **Do NOT use** `react-native-svg` — incompatible, causes Metro bundling errors
- **Do NOT use** `expo-av` — deprecated; use `expo-audio` with `createAudioPlayer` instead
- **Do NOT use** `victory-native` or other chart libs that depend on SVG

## Grade Values
`PG`, `MG`, `RG`, `FM`, `HG`, `EG`, `OTHER`

## Kit Status Values
`backlog`, `in-progress`, `complete`
