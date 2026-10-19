# Pflegepost

Eine App, mit der erwachsene Kinder den Papierkram ihrer pflegebedürftigen Eltern gemeinsam erledigen.
Produkt, Design und Architektur: siehe [`CLAUDE.md`](CLAUDE.md) und [`docs/`](docs).
Aktueller Stand und nächste Schritte: [`docs/STATUS.md`](docs/STATUS.md) · [`docs/M1_PLAN.md`](docs/M1_PLAN.md)

| Ordner | Inhalt |
|---|---|
| [`app/`](app) | Expo-App (SDK 57), Designsystem unter `app/src/ui` |
| [`web/`](web) | Landingpage mit Warteliste (Next.js) |
| [`supabase/`](supabase) | Datenbank-Migrationen |
| [`docs/`](docs) | Produkt-, Design-, Architektur- und Compliance-Dokumente |

## Stand: Meilenstein 0 – klickbare Demo

Die App läuft komplett ohne Backend mit erfundenen Beispieldaten:

1. **Onboarding** in drei Schritten (Name, für wen, Einwilligung) – die App spricht danach von der Person, die du eingibst.
2. **Start**: „Brief erfassen“, die nächsten Aufgaben, zuletzt erfasster Brief.
3. **Brief erfassen** (simuliert): Kamera → Analyse → Ergebnis mit „Worum geht es / Was ist zu tun / Bis wann“, Frist mit wörtlichem Zitat und markiertem Original. Aufgaben entstehen erst nach Bestätigung.
4. **Aufgaben**: filtern, übernehmen, abhaken, rückgängig machen.
5. **Familie**: sanfte Lastverteilung ohne Zahlen, „um Hilfe bitten“, Einladen.
6. **Wochenrückblick** als kurzer Brief.
7. **Dokumente**: Archiv nach Monaten, Details, Original.
