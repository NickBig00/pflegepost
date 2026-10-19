# Plan Meilenstein 1 – Konten, Familie, Datenmodell

Status: **Plan von Nick grundsätzlich freigegeben** (inkl. Code in der E-Mail, Konto löschen, App-Schema-Links).
Laut CLAUDE.md gilt trotzdem: vor jeder neuen bzw. geänderten Ansicht ein kurzes Layout-Konzept vorlegen und auf Freigabe warten.

Lies vorher: [`STATUS.md`](STATUS.md) (Stand, Entscheidungen, technische Leitplanken).

## Ziel

Nick meldet sich auf dem Handy per E-Mail an, willigt ein, legt einen Fall an (z. B. „Mama“) und lädt seine Schwester per Link ein. Sie tritt als „Mitglied“ bei und sieht denselben Fall. Niemand außerhalb des Falls sieht etwas – belegt durch automatische RLS-Tests.

Die Demo-Bildschirme aus M0 werden dabei **nicht weggeworfen**: Onboarding, Familie und Einladen werden an echte Daten angeschlossen. Briefe, Aufgaben und Dokumente bleiben in M1 noch Demo-Daten (sie kommen in M2/M3).

## 1. Supabase-Grundlage

- `supabase init` im Repo-Root (es gibt bereits `supabase/migrations/` mit der Warteliste – beibehalten).
- Lokal: `supabase start` (braucht Docker). Remote-Projekt: siehe STATUS.md.
- App-Konfiguration: `app/.env` mit `EXPO_PUBLIC_SUPABASE_URL` und `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Vorlage: `app/.env.example`). `.env` ist in `.gitignore`.

## 2. Datenmodell (nur, was M1 braucht)

| Tabelle | Inhalt | Hinweis |
|---|---|---|
| `profiles` | id (= auth.users.id), display_name, created_at | Trigger legt Profil beim Sign-up an. `push_token` erst in M3. |
| `care_cases` | id, display_name, legal_basis, created_by, created_at | `legal_basis`: consent / power_of_attorney / legal_guardian / unknown (wie im Onboarding) |
| `case_members` | case_id, user_id, role (owner/member/viewer), joined_at | PK (case_id, user_id) |
| `case_invites` | id, case_id, token_hash, role, created_by, expires_at, used_at, used_by | Nur der **Hash** des Tokens wird gespeichert |
| `consents` | user_id, consent_type, version, accepted_at, revoked_at | Nachweis der Art.-9-Einwilligung mit Textversion |
| `audit_log` | id, case_id, actor_id, action, target_type, target_id, created_at | Ohne Inhaltsdaten, für Clients nicht schreibbar |

Die Zod-Schemas in `app/src/demo/schemas.ts` (`careCaseSchema`, `memberSchema`, `legalBasisSchema`) sind bereits auf diese Form ausgelegt – anpassen statt neu erfinden.

## 3. Sicherheit: RLS und RPCs

- RLS auf **jeder** Tabelle, Standard: nichts erlaubt.
- Hilfsfunktionen `is_case_member(case_id)` und `has_case_role(case_id, roles[])` als `security definer` (sonst Rekursion in den Policies von `case_members`).
- Mehrschrittige Schreibvorgänge nur über Postgres-Funktionen:
  - `create_case(display_name, legal_basis)` – legt Fall an + trägt Aufrufer als owner ein (atomar).
  - `create_invite(case_id, role)` – nur owner; gibt den Klartext-Token **einmal** zurück; 7 Tage gültig, einmalig.
  - `accept_invite(token)` – prüft Hash, Ablauf, Nutzung; trägt als Mitglied ein.
  - `change_member_role`, `remove_member` – nur owner; **der letzte owner kann nicht entfernt/herabgestuft werden**.
  - `leave_case()`.
  - `record_consent(type, version)`.
  - Jede Funktion schreibt ins `audit_log`.
- Rollen: viewer = lesen; member = lesen + Inhalte (ab M2); owner = zusätzlich Mitglieder/Einladungen.
- **Konto löschen:** Edge Function `delete-account` (löscht auth-User; Fälle, in denen man einziger Owner ist, vorher klären – Vorschlag: Fall wird mitgelöscht, wenn keine anderen Mitglieder; sonst muss vorher Owner übertragen werden).

## 4. RLS-Tests (pgTAP, `supabase test db`)

Mehrere Testnutzer. Szenarien:
- Fremde sehen keinen Fall, kein Mitglied, keine Einladung.
- viewer kann nichts schreiben; member kann keine Einladungen erstellen/Rollen ändern.
- Token nur einmal nutzbar; abgelaufen/falsch → Fehler.
- Letzter owner geschützt.
- Niemand kann sich per direktem Insert in `case_members` eintragen.
- `audit_log` für Clients nicht schreibbar.
- Nachholen aus M0: Warteliste-Tabelle für `anon`/`authenticated` vollständig gesperrt.

## 5. Login (Magic Link + 6-stelliger Code)

- Supabase Auth, E-Mail-OTP. E-Mail-Vorlage enthält Link **und** `{{ .Token }}` (Code).
- Deep Link über `pflegepost://` (in Expo Go `exp://…`; `expo-linking` → `Linking.createURL`). Redirect-URLs im Supabase-Dashboard eintragen.
- Sitzung verschlüsselt speichern: `expo-secure-store` (2-KB-Limit beachten → aktuelles Muster aus der Supabase-Expo-Doku verwenden).
- Routing-Wächter (Expo Router): keine Sitzung → Anmelden; keine Einwilligung → Einwilligung; kein Fall → „Für wen?“; sonst Tabs. Ersetzt die heutige `onboarded`-Weiche in `app/src/app/(tabs)/_layout.tsx`.

## 6. Onboarding mit echtem Login (Layout-Konzept vorher vorlegen!)

DESIGN.md: höchstens 3 Schritte bis zum ersten Brief. Vorschlag:
1. **Anmelden** – Willkommen + E-Mail-Feld auf einer Seite; danach Code-Eingabe (oder Link antippen).
2. **Für wen kümmerst du dich?** – existiert schon (`onboarding/fall.tsx`), jetzt mit `create_case`.
3. **Einwilligung** – existiert schon (`onboarding/einwilligung.tsx`), jetzt mit `record_consent`.

Eingeladene Personen: Anmelden → Einwilligung → direkt beitreten (Schritt 2 entfällt).

## 7. Familie und Einladungen

- **Familie** (`(tabs)/familie.tsx`): Mitgliederliste aus `case_members` + `profiles`. Die Lastverteilung bleibt bis M3 auf Demo-Aufgaben.
- **Einladen** (Bottom Sheet existiert): Rolle wählen → `create_invite` → Link `pflegepost://einladung/<token>` über das System-Teilen-Menü.
- **Einladung annehmen** (neue Route, z. B. `einladung/[token]`): „Anna lädt dich zu ‚Mama‘ ein“, eine Hauptaktion.
- **Mitglied verwalten** (nur owner): Rolle ändern, entfernen. Jeder kann den Fall verlassen.
- **Einstellungen** (neu): Abmelden, Einwilligung ansehen/widerrufen, Konto löschen.
- Jeder Zustand gestaltet: leer, lädt, Fehler, Link abgelaufen, Link schon benutzt, offline.

## 8. Datenschicht in der App

- `DemoProvider` (`app/src/demo/store.tsx`) schrittweise ersetzen: Konto-, Fall- und Mitgliederdaten aus Supabase, Briefe/Aufgaben vorerst weiter aus Demo-Daten.
- Alle Supabase-Antworten mit Zod parsen.
- Keine personenbezogenen Daten in Logs/Fehlermeldungen.

## 9. Tests und Definition of Done

- Jest: Schemas, Routing-Wächter-Logik, Einladungs-Link-Parsing.
- pgTAP: RLS (siehe 4).
- Maestro: Anmelden (Code aus lokalem Mailpit) → Einwilligung → Fall anlegen. Bei der Gelegenheit `app/.maestro/demo.yaml` aktualisieren.
- UI-Prüfung nach DESIGN.md (Screenshots hell/dunkel; echte Geräte durch Nick).

## 10. Neue Abhängigkeiten (mit Begründung)

| Paket | Wofür |
|---|---|
| `@supabase/supabase-js` | Offizieller Client (Auth, DB, RPCs) |
| `expo-secure-store` | Sitzung verschlüsselt speichern (in Expo Go enthalten) |
| `supabase` (CLI, dev) | Migrations, lokaler Stack, pgTAP |

Versionen mit `EXPO_OFFLINE=1 npx expo install` installieren (passend zu SDK 57).

## 11. Commit-Reihenfolge (Vorschlag)

1. `supabase init`, Config, `.env.example`
2. Migration Tabellen + Profil-Trigger
3. RLS, Hilfsfunktionen, RPCs
4. pgTAP-Tests
5. Supabase-Client + Sitzungsspeicher
6. Anmelden (Link + Code) – Layout-Konzept vorher
7. Onboarding an echte Daten (Fall, Einwilligung)
8. Familie, Einladen, Einladung annehmen – Layout-Konzept vorher
9. Einstellungen + Konto löschen (`delete-account`)
10. Tests, UI-Prüfung, Notiz an Nick

## Was Nick tun muss (vor bzw. während M1)

1. Im Supabase-Dashboard prüfen, dass das Projekt in **Frankfurt (eu-central-1)** liegt.
2. Für lokale Migrationen/Deploys: Supabase Access Token bzw. DB-Passwort bereitstellen (als Secret, nie im Chat oder Repo) – die Session sagt genau, wann und wo.
3. Später, vor Tests mit echten Nutzern: E-Mail-Dienst (EU, AVV) für Auth-Mails und Warteliste wählen. Der eingebaute Supabase-Versand schafft nur wenige Mails pro Stunde.
