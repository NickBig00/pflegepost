# Pflegepost – App

Expo **SDK 57** · React Native 0.86 · React 19.2 · TypeScript strict · Expo Router · NativeWind · Reanimated 4

## Expo-Version

Das Projekt nutzt bewusst **SDK 57**, weil die Expo-Go-App aus dem Play Store und App Store
(Stand Oktober 2026) nur SDK 57 unterstützt. SDK 58 ist zwar erschienen, Expo Go dafür kommt
aber erst in einigen Wochen in die Stores. Sobald das passiert, aktualisieren wir:

```bash
npm install expo@~58
npx expo install --fix
```

Danach Breaking Changes laut Expo-Changelog prüfen (u. a. react-native-gesture-handler 3:
`Gesture.Pan()` → `usePanGesture` in `src/ui/components/BottomSheet.tsx`).

## Starten

```bash
npm install
npm start          # QR-Code mit Expo Go scannen
npm run web        # Vorschau im Browser
```

## Prüfen

```bash
npm run typecheck
npm run lint
npm test
```

## Struktur

- `src/app/` – Routen (Expo Router)
- `src/ui/` – Designsystem: `tokens.ts` (Farben, Typo, Abstände, Bewegung), `theme.tsx` (hell/dunkel), `components/`
- `src/lib/` – Logik ohne UI (z. B. Fristen)

Farben werden nur über Tokens verwendet (`bg-surface`, `text-fg-muted` …). Die Klassen
lösen über CSS-Variablen auf, die `ThemeProvider` aus `tokens.ts` setzt – dadurch braucht
kein Bildschirm `dark:`-Varianten. Der Showcase liegt unter `/designsystem`.
