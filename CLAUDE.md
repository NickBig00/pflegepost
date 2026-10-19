# CLAUDE.md – Projektkontext

## Was wir bauen
Arbeitstitel: "Pflegepost" (Name noch offen).
Eine native Mobile-App (iOS und Android) mit KI-Agent, mit der erwachsene Kinder den Papierkram ihrer pflegebedürftigen Eltern gemeinsam erledigen. Man fotografiert Briefe oder spricht Notizen ein. Der Agent erkennt Absender, Inhalt und Fristen, erklärt den Brief in einfacher Sprache, schlägt Aufgaben vor, verteilt sie in der Familie und entwirft Antwortschreiben.

## Zielgruppe
Berufstätige Erwachsene (ca. 35–60), die sich mit Geschwistern oder Partnern um pflegebedürftige Eltern kümmern. Wenig Zeit, oft aus der Ferne, häufig gestresst und nicht besonders technikaffin. Markt: zuerst Deutschland.

## Produktprinzipien (in dieser Reihenfolge)
0. Herausragendes UI hat oberste Priorität. Ein Feature, das nicht exzellent aussieht und sich exzellent anfühlt, gilt als nicht fertig. Verbindlich: docs/DESIGN.md.
1. So einfach wie eine Sprachnachricht: öffnen, fotografieren oder reinsprechen, fertig.
2. Der Mensch entscheidet: Der Agent schlägt vor und versendet nie selbst etwas.
3. Keine Rechts- oder Medizinberatung: erklären, strukturieren, Entwürfe schreiben – immer mit klarem Hinweis.
4. Fair statt anklagend: Lastverteilung freundlich und lösungsorientiert darstellen, nie als Rangliste.
5. Datenschutz als Feature: EU-Hosting, Verschlüsselung, Datensparsamkeit (siehe docs/COMPLIANCE.md).

## Tech-Stack
- App: React Native mit Expo (aktuelles SDK), TypeScript strict, Expo Router, NativeWind, Reanimated, Expo Haptics
- Dokumentenscanner: nativer Scanner (VisionKit / ML Kit, z. B. react-native-document-scanner-plugin), PDF-Import über expo-document-picker
- Sprache: expo-audio für Aufnahmen, Transkription serverseitig
- Backend: Supabase (Region Frankfurt): Postgres, Auth (Magic Link), Storage, Row Level Security, Edge Functions
- KI: ausschließlich in Supabase Edge Functions, über eine Provider-Abstraktion (Start: Azure OpenAI in EU-Region; austauschbar gegen OpenAI, Anthropic oder Mistral)
- Push: Expo Notifications
- Builds: EAS Build (kein Mac nötig)
- Landingpage/Warteliste: separate kleine Next.js-Seite im Ordner /web
- Tests: Jest für Logik und Schemas, Maestro für End-to-End-Tests auf Simulator/Emulator

## Projektstruktur (Ziel)
- /app – Expo-App (Routes, Komponenten, Designsystem unter /app/src/ui)
- /supabase – Migrations, Seeds, Edge Functions (functions/_shared/prompts, functions/_shared/schemas)
- /web – Landingpage mit Warteliste
- /docs – Produkt-, Architektur-, Design- und Compliance-Dokumente

## Code-Konventionen
- UI-Texte auf Deutsch, Code und Kommentare auf Englisch
- Strikte Typen, Zod für alle Ein- und Ausgaben, auch für alle LLM-Antworten (Structured Outputs)
- Niemals API-Keys oder Secret Keys in der App; die App nutzt nur den Supabase Publishable Key
- Keine personenbezogenen Daten in Logs, Fehlermeldungen oder Analytics
- Alle UI-Bausteine aus dem eigenen Designsystem, keine Ad-hoc-Styles
- Secrets nur in .env bzw. Supabase Secrets; .env steht in .gitignore

## Arbeitsweise
- Arbeite Meilenstein für Meilenstein nach docs/MVP_BACKLOG.md
- Vor jedem Meilenstein und jeder neuen Ansicht: kurzen Plan bzw. Layout-Konzept vorlegen und auf Freigabe warten
- Kleine, nachvollziehbare Commits mit klaren Messages
- Neue Abhängigkeiten nur mit kurzer Begründung
- Wenn ich (Nick) etwas tun muss (Keys eintragen, Account anlegen, auf dem Handy testen), sag es klar und Schritt für Schritt
- Nach jeder Ansicht: UI-Selbstprüfung nach docs/DESIGN.md

## Dokumente
- docs/PRODUCT.md – Funktionen, User Stories
- docs/DESIGN.md – UI-Anspruch (verbindlich)
- docs/ARCHITECTURE.md – Datenmodell, Agent-Pipeline
- docs/MVP_BACKLOG.md – Meilensteine
- docs/COMPLIANCE.md – DSGVO, Haftung, KI-Hinweise
