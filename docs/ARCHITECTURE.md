# Architektur

## Überblick
Expo-App → Supabase (Auth, Postgres, Storage) → Edge Functions → KI-Provider (EU)
Die App spricht nie direkt mit einem KI-Anbieter. Alle KI-Aufrufe laufen über Edge Functions.

## Datenmodell (Postgres)
- profiles (id = auth.users.id, display_name, push_token, created_at)
- care_cases (id, display_name, created_by, created_at) – z. B. "Mama"
- case_members (case_id, user_id, role: owner | member | viewer, joined_at)
- case_invites (id, case_id, token, role, expires_at, used_at)
- documents (id, case_id, uploaded_by, storage_path, mime_type, page_count, status: uploaded | processing | ready | failed, created_at)
- document_analysis (document_id, sender, sender_type, document_date, reference_number, doc_type, summary_plain, action_required, raw_json, model_version, prompt_version)
- deadlines (id, case_id, document_id, due_date, description, source_quote, confidence, confirmed_by)
- tasks (id, case_id, document_id, title, description, assignee_id, due_date, status: open | in_progress | done, created_by, created_at, completed_at)
- notes (id, case_id, author_id, type: voice | text, transcript, audio_path, created_at)
- drafts (id, case_id, document_id, title, body_markdown, created_by, created_at)
- reminders (id, task_id oder deadline_id, user_id, send_at, channel: push | email, sent_at)
- audit_log (id, case_id, actor_id, action, target_type, target_id, created_at) – ohne Inhaltsdaten

## Sicherheit
- Row Level Security auf allen Tabellen: Zugriff nur für Mitglieder des jeweiligen Falls; viewer nur lesend
- Storage: privater Bucket, Pfad {case_id}/{document_id}/, Zugriff nur über kurzlebige signierte URLs
- Audioaufnahmen nach erfolgreicher Transkription löschen (Datensparsamkeit), außer der Nutzer will sie behalten

## Agent-Pipeline: Brief
1. App lädt Seiten in Storage hoch, legt documents-Eintrag an (status = uploaded)
2. Edge Function analyze-document: Vision-Modell liest alle Seiten → strukturiertes JSON nach Zod-Schema
3. Fristen-Prüfung: jede Frist braucht ein wörtliches Zitat aus dem Dokument; ohne Zitat → als "unsicher" markieren und dem Nutzer zur Prüfung zeigen
4. Erklärung in einfacher Sprache + Aufgabenvorschläge
5. Status = ready; App zeigt Ergebnis, Nutzer bestätigt oder ändert → tasks, deadlines, reminders werden angelegt
6. Bei Fehlern: status = failed mit nutzerfreundlicher Meldung und "Erneut versuchen"

## Agent-Pipeline: Sprachnotiz
1. Aufnahme in der App → Upload → Edge Function transcribe-note
2. Transkription → Agent erkennt Aufgaben, Termine und Infos und schlägt Zuordnung zum Fall vor
3. Nutzer bestätigt, erst dann wird gespeichert

## Fragen an das Archiv
- Embeddings (pgvector) über document_analysis und notes
- Antworten immer mit Verweis auf das Quelldokument; wenn nichts gefunden wird, ehrlich sagen

## KI-Schicht (Supabase Edge Functions)
- _shared/provider.ts – Provider-Abstraktion (Azure OpenAI jetzt, andere später)
- _shared/schemas.ts – Zod-Schemas für alle Ausgaben
- _shared/prompts/ – extract_document, explain_plain, suggest_tasks, draft_letter, weekly_summary, answer_question (versioniert)
- Jeder Prompt enthält: keine Rechts- oder Medizinberatung, bei Unsicherheit an Pflegeberatung oder Fachstelle verweisen
- Kostenschutz: Limits pro Nutzer und Tag, Seitenlimit pro Dokument, Logging nur von Tokenzahlen ohne Inhalt

## Hintergrundjobs
- Erinnerungen: Supabase Cron prüft regelmäßig fällige reminders und versendet Push (Expo Push API) bzw. E-Mail
- Wochenrückblick: Cron jeden Sonntagabend; Lastverteilung = Anteil erledigter bzw. übernommener Aufgaben pro Mitglied, als freundlicher Textvorschlag statt Wertung
