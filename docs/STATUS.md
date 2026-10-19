# Projektstand

Stand: 19. Oktober 2026 · Meilenstein 0 abgeschlossen · Nächster Schritt: Meilenstein 1 (siehe [`M1_PLAN.md`](M1_PLAN.md))

Dieses Dokument fasst alles zusammen, was eine neue Session wissen muss, ohne den bisherigen Chat zu kennen.

## Was es gibt

| Bereich | Stand |
|---|---|
| `app/` | Klickbare Demo ohne Backend, Expo SDK 57. Läuft in Expo Go (Android von Nick getestet). |
| `app/src/ui/` | Designsystem: Tokens, Theme (hell/dunkel), ~25 Komponenten. Showcase unter Route `/designsystem`. |
| `app/src/demo/` | Erfundene Beispieldaten + `DemoProvider` (In-Memory-Store). **Die Naht, an der M1 Supabase anschließt.** |
| `web/` | Landingpage (Next.js 16) mit Warteliste (Double-Opt-in). Nicht deployt. |
| `supabase/migrations/` | Nur die Warteliste-Tabelle. Noch **nicht** in das Supabase-Projekt eingespielt. Supabase CLI noch nicht initialisiert (`supabase/config.toml` fehlt). |

### Bildschirme der App (`app/src/app/`)
- `onboarding/` – 3 Schritte: Willkommen → „Für wen kümmerst du dich?“ (Vorname, Name der Person, Rechtsgrundlage) → Datenschutz-Einwilligung. Die App startet immer hier (`(tabs)/_layout.tsx` leitet um, solange `onboarded` false ist). Eingegebene Namen werden in die Demo-Texte eingesetzt (`lib/personalize.ts`).
- `(tabs)/` – Start, Aufgaben, Familie, Dokumente.
- `erfassen/` – simulierter Scanner → Analyse → Ergebnis (3 Karten, Frist mit wörtlichem Zitat) → Original. Aufgaben entstehen erst nach Bestätigung.
- `dokument/[id]`, `original/[id]`, `rueckblick` – Details, Originalbrief, Wochenrückblick.

## Getroffene Entscheidungen

- **Reihenfolge:** M0 vor M1, damit alles auf dem Designsystem aufbaut.
- **Expo SDK 57 statt 58:** Die Store-Version von Expo Go unterstützt (Stand Oktober 2026) nur SDK 57. Upgrade auf 58, sobald Expo Go 58 im Play Store ist (Schritte in `app/README.md`). Breaking Change dann: react-native-gesture-handler 3 (`Gesture.Pan()` → `usePanGesture` in `BottomSheet.tsx`).
- **Design:** warmes Papier-Weiß + Salbeigrün, Terrakotta für Fristen und Fehlermeldungen (kein Alarm-Rot; Rot nur für destruktive Aktionen), Ocker für Hinweise, Taubenblau für KI-Hinweise. Schrift Inter. Icons: lucide-react-native. Alle Kontraste WCAG AA (per Test abgesichert).
- **Microcopy:** Du-Form, warm, nie Schuld zuweisen („Seit 2 Tagen offen“ statt „überfällig“). Lastverteilung nie mit Zahlen oder Rangliste.
- **Für M1 entschieden (von Nick freigegeben):**
  - Login per Magic Link **plus 6-stelligem Code in derselben E-Mail** (Link öffnet oft im falschen Browser).
  - **Konto löschen** schon in M1 (Apple-Pflicht, Löschkonzept).
  - Einladungslinks vorerst über das **App-Schema** `pflegepost://` – noch keine Domain.
  - **E-Mail-Dienst** wird später geklärt (für M1-Entwicklung reicht der eingebaute Supabase-Versand).
- **Warteliste:** bleibt „geschlossen“ (ehrliche Meldung, keine Speicherung), bis ein E-Mail-Dienst (EU, AVV) angebunden ist.

## Supabase

- Projekt-URL: `https://mukgwltgwuqtuqjrveer.supabase.co`
- Publishable Key: steht in `app/.env.example` (öffentlich by design, darf in die App).
- **Region noch prüfen:** Soll Frankfurt (eu-central-1) sein – im Dashboard bestätigen.
- Secret Key: nie ins Repo, nie in die App. Nur Supabase Secrets bzw. `web/.env.local`.

## Technische Leitplanken (aus M0 gelernt – unbedingt beachten)

1. **Keine `className` auf Reanimated-Views** (`Animated.View`). Auf echten Geräten gehen Klassen-Farben dort verloren (Bottom Sheet war auf Android durchsichtig). Animierte Views bekommen nur `style`, Farben über `useTheme().colors`.
2. **Textfarben laufen über `tone` → `style`** im `Text`-Baustein, nicht über Klassen (Klassenfarben wurden bei Laufzeitwechsel nicht aktualisiert).
3. **Keine dynamisch zusammengesetzten Tailwind-Klassen** (`bg-${x}`) – Tailwind findet sie nicht. Vollständige Klassennamen in Maps oder `style` verwenden.
4. **Modals** (`BottomSheet`) brauchen `ThemeScope` (CSS-Variablen) und einen eigenen `SafeAreaProvider` (Android-Insets).
5. **Keine verschachtelten Pressables** (Button in antippbarer Karte) – im Web ungültig, für Screenreader unklar. Muster: siehe `TaskCard` (nur der Inhaltsbereich ist antippbar).
6. **Reanimated Shared Values mit `.get()`/`.set()`** statt `.value` (React-Compiler-Lint).
7. **Gesture Handler 2.x** (SDK 57): `Gesture.Pan()`-API.
8. Farben nur über Tokens (`app/src/ui/tokens.ts`); neue Tokens auch in `app/tailwind.config.js` eintragen (ein Test prüft das).

## Arbeiten in der Cloud-Umgebung (Claude Code)

- `api.expo.dev` ist gesperrt → Expo-Befehle mit `EXPO_OFFLINE=1` (z. B. `EXPO_OFFLINE=1 npx expo install <paket>`).
- Der Metro-Dateiwatcher erkennt Änderungen oft nicht → Dev-Server nach Änderungen neu starten: `EXPO_OFFLINE=1 npx expo start --web --clear`. Typed Routes (`.expo/types`) entstehen erst beim Start des Dev-Servers – vorher meldet `tsc` neue Routen als Fehler.
- UI-Prüfung: Expo Web + Playwright (Chromium ist vorinstalliert) in Handygröße, hell und dunkel. Echte Geräte prüft Nick über Expo Go.
- Native Bundles prüfen: `EXPO_OFFLINE=1 npx expo export --platform android`.
- Ein SessionStart-Hook (`.claude/settings.json`) installiert die Abhängigkeiten in neuen Cloud-Sessions automatisch.

## Prüfbefehle

```bash
cd app && npm run typecheck && npm run lint && npm test
cd web && npm run typecheck && npm test && npx next build
```

## Offene Punkte

- iPhone-Prüfung der Demo (nur Android getestet).
- Maestro-Flow `app/.maestro/demo.yaml` geschrieben, noch nie ausgeführt (kein Simulator in der Cloud).
- RLS-Test für die Warteliste-Tabelle (in M1 mit der Supabase CLI nachholen).
- Warteliste live: E-Mail-Dienst, Hosting, Impressum und Datenschutzerklärung (Platzhalter).
- App-Icon ist nur in Development Builds/Store-Builds sichtbar; Expo Go zeigt sein eigenes Icon.
- Sprachnotiz ist nur ein Hinweis (kommt in M4).
