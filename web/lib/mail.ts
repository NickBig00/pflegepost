// E-mail sending for the double opt-in. The provider is chosen later
// (EU hosting + DPA, see docs/COMPLIANCE.md). Until then this reports
// "not configured" and the waitlist stays closed.

export function mailConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.MAIL_PROVIDER && env.MAIL_API_KEY && env.MAIL_FROM);
}

export function confirmationMail(link: string) {
  return {
    subject: 'Bitte bestätige deine Anmeldung bei Pflegepost',
    text: [
      'Hallo,',
      '',
      'schön, dass du dich für Pflegepost interessierst. Bitte bestätige deine E-Mail-Adresse mit einem Klick:',
      link,
      '',
      'Wenn du dich nicht angemeldet hast, ignoriere diese Nachricht einfach. Dann speichern wir nichts weiter.',
      '',
      'Herzliche Grüße',
      'Pflegepost',
    ].join('\n'),
  };
}

export async function sendConfirmationMail(_to: string, _link: string): Promise<void> {
  // Implemented once the provider is chosen. Callers check mailConfigured() first.
  throw new Error('mail provider not configured');
}
