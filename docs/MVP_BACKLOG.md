# MVP-Backlog

Jeder Meilenstein endet mit einer lauffähigen App, die Nick auf dem Handy über Expo Go bzw. einen Development Build testen kann.

## Meilenstein 0 – Designsystem und Demo mit Beispieldaten ✅ abgeschlossen (Oktober 2026)
Ziel: eine wunderschöne, klickbare App ohne Backend, mit der Nick Gespräche mit 10–15 Betroffenen und 2–3 Pflegestützpunkten führt.
- Expo-Projekt aufsetzen (TypeScript, Expo Router, NativeWind, Reanimated)
- Designsystem nach docs/DESIGN.md: Tokens, Typografie, Basis-Komponenten, Hell/Dunkel
- Alle Schlüsselbildschirme mit realistischen, erfundenen Beispieldaten (z. B. Brief der Pflegekasse, Termin beim Medizinischen Dienst, zwei Geschwister)
- Simulierter Ablauf "Brief erfassen" → Ergebnis mit Erklärung, Frist und Aufgaben
- Einfache Landingpage mit Warteliste in /web (E-Mail mit Double-Opt-in)
Dieser Code wird nicht weggeworfen, sondern in den nächsten Meilensteinen an echte Daten angeschlossen.

## Meilenstein 1 – Konten, Familie, Datenmodell ← als Nächstes (Detailplan: docs/M1_PLAN.md)
- Supabase anbinden (Region Frankfurt), Login per Magic Link
- Migrations für das Datenmodell, Row Level Security, RLS-Tests
- Fall anlegen, Mitglieder per Link einladen, Rollen
- Onboarding inkl. Datenschutz-Einwilligung

## Meilenstein 2 – Brief verstehen
- Nativer Dokumentenscanner, mehrseitig; PDF-Import
- Upload in privaten Storage
- Edge Function analyze-document: Extraktion, Erklärung in einfacher Sprache, Fristen mit Zitat
- Ergebnisbildschirm mit Bestätigungsdialog für Fristen und Aufgaben

## Meilenstein 3 – Aufgaben und Erinnerungen
- Aufgaben übernehmen, zuweisen, abhaken
- Push-Erinnerungen (Expo Notifications) und E-Mail
- Startbildschirm "Das steht an" mit echten Daten

## Meilenstein 4 – Sprache und Entwürfe
- Sprachnotizen mit Transkription und vorgeschlagener Zuordnung
- Antwortentwürfe, Export als PDF, Teilen über das System-Menü

## Meilenstein 5 – Übersicht und Rückblick
- Familienübersicht mit sanfter Lastverteilung
- Wöchentlicher Rückblick
- Fragen an das Archiv mit Quellenverweis

## Definition of Done (für jeden Meilenstein)
- UI-Prüfung nach docs/DESIGN.md bestanden (Screenshots iOS und Android, hell und dunkel)
- Tests für Schemas und Kernabläufe, RLS-Tests für neue Tabellen
- Keine personenbezogenen Daten in Logs, keine Secrets im App-Code
- Kurze Notiz an Nick: was neu ist, wie er es testet, was er ggf. tun muss
