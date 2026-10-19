# Pflegepost – App

Expo (SDK 58) · TypeScript strict · Expo Router · NativeWind · Reanimated

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
