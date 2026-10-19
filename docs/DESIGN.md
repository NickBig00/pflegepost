# Design & UI – höchste Priorität

## Grundsatz
Das UI ist nicht ein Teil des Produkts, es IST das Produkt. Die Nutzer sind gestresst, müde und oft nicht technikaffin. Jeder Bildschirm muss auf den ersten Blick verständlich sein und ein Gefühl von Ruhe und Kontrolle vermitteln. Ein Feature, das nicht exzellent aussieht und sich exzellent anfühlt, gilt als nicht fertig. Lieber weniger Features mit herausragendem UI als viele mittelmäßige.

## Qualitätsanspruch
- Niveau von Apps wie Things 3, Headspace, Apple Health oder Linear – kein "Admin-Dashboard"
- Fühlt sich auf iOS wie eine iOS-App und auf Android wie eine Android-App an (Human Interface Guidelines, Material 3)
- Jeder Zustand ist gestaltet: leer, lädt, Fehler, Erfolg. Keine Standard-Platzhalter
- Ladezeiten der KI mit freundlichen, ehrlichen Zwischenschritten überbrücken ("Ich lese den Brief…", "Ich suche nach Fristen…")
- Dezente, flüssige Animationen mit Reanimated (200–300 ms), Haptik-Feedback bei wichtigen Aktionen; respektiert "Bewegung reduzieren"

## Designsystem (zuerst bauen, dann Bildschirme)
- Farb-Tokens, Typografie-Skala, 8-px-Abstandsraster, Radien, Schatten – zentral definiert
- Basis-Komponenten: Button, Karte, Listeneintrag, Eingabefeld, Chip, Avatar, Bottom Sheet, Toast, Leerzustand
- Hell- und Dunkelmodus von Anfang an
- Dynamische Schriftgröße des Systems wird unterstützt, Layouts brechen dabei nicht

## Visuelle Sprache
- Warm, ruhig, menschlich: sanfte Naturtöne, viel Weißraum, weiche Ecken
- Pro Bildschirm genau eine klare Hauptaktion
- Fristen klar sichtbar, aber ohne Panik-Rot; Dringlichkeit über Text und sanfte Akzente
- Hochwertige, gut lesbare Schrift (z. B. Inter)
- Icons und Illustrationen zurückhaltend und einheitlich

## Schlüsselbildschirme (besonders sorgfältig)
1. Start: großer Button "Brief erfassen" und Mikrofon-Button; darunter "Das steht an" als ruhige Karten
2. Brief-Ergebnis: drei klare Karten "Worum geht es", "Was ist zu tun", "Bis wann"; Original mit einem Tipp erreichbar; Aufgaben mit einem Tipp übernehmen
3. Familie: wer hat was übernommen, sanfte Visualisierung der Lastverteilung mit freundlichem Textvorschlag – nie Rangliste, nie Punkte
4. Wochenrückblick: liest sich wie ein kurzer, wertschätzender Brief, nicht wie ein Report
5. Onboarding: höchstens 3 Schritte bis zum ersten erfassten Brief; Datenschutz-Einwilligung verständlich statt juristisch

## Sprache (Microcopy)
- Einfache, warme Sprache, Du-Form, kurze Sätze
- Keine Fachbegriffe ohne Erklärung
- Nie Schuld zuweisen ("Du hast vergessen…"), sondern helfen ("Das steht noch an – soll ich dich erinnern?")

## Barrierefreiheit
- Mindestens WCAG 2.2 AA, Touch-Ziele mindestens 44 × 44 pt, hoher Kontrast
- Alle Elemente mit Screenreader-Labels (VoiceOver, TalkBack)

## Pflicht-Prüfung nach jeder Ansicht
1. Screenshots auf kleinem iPhone, großem iPhone und Android, jeweils hell und dunkel
2. Selbstkritisch bewerten: "Ist das wirklich herausragend? Was würde ein Top-Designer ändern?"
3. Nachbessern, erst dann als fertig melden
