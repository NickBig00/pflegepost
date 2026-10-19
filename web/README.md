# Pflegepost – Landingpage

Next.js 16 · Warteliste mit Double-Opt-in

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm test
```

## Warteliste

- Formular → `POST /api/warteliste` → Eintrag in Supabase (`supabase/migrations/…_waitlist.sql`) → Bestätigungs-E-Mail → `/bestaetigen?token=…`
- Gespeichert werden nur E-Mail, ein **Hash** des Bestätigungs-Tokens und Zeitstempel.
- Solange `SUPABASE_SECRET_KEY` oder der E-Mail-Dienst (`MAIL_*`) fehlen, ist die Warteliste **geschlossen** und sagt das ehrlich („öffnet in Kürze“). Es werden dann keine Daten gespeichert.
- Vor dem Livegang: E-Mail-Dienst (EU, AVV) wählen und in `lib/mail.ts` anbinden, Impressum und Datenschutzerklärung ersetzen.

Konfiguration: `.env.example` nach `.env.local` kopieren.
