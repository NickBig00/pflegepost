import type { Role } from './supabase/rows';

/** Role names in plain language, used everywhere instead of owner/member/viewer. */
export const roleLabel: Record<Role, string> = {
  owner: 'Verwaltet den Fall',
  member: 'Hilft mit',
  viewer: 'Liest mit',
};

const TOKEN = /[A-Za-z0-9_-]{32}/;

/**
 * Finds the invite token in whatever people paste: the bare link
 * (pflegepost://einladung/…, exp://…/--/einladung/…) or the whole shared message.
 */
export function extractInviteToken(text: string): string | null {
  const fromLink = text.match(/einladung\/([A-Za-z0-9_-]{32})(?![A-Za-z0-9_-])/);
  if (fromLink) return fromLink[1]!;
  const bare = text.trim();
  return bare.length === 32 && TOKEN.test(bare) ? bare : null;
}

/** Text for the system share sheet. Explains the fallback while app links are not tappable everywhere. */
export function inviteMessage(caseName: string, link: string): string {
  return [
    `Hallo! Ich lade dich zu „${caseName}“ in Pflegepost ein, damit wir uns die Post und die Aufgaben teilen können:`,
    link,
    'Der Link gilt 7 Tage. Falls er sich nicht antippen lässt: Pflegepost öffnen, anmelden und bei „Ich wurde eingeladen“ den Link einfügen.',
  ].join('\n\n');
}

const shortDate = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' });

/** "Gültig bis 27. Okt." for an invite's expires_at timestamp (the date never wraps). */
export function inviteValidUntil(expiresAt: string): string {
  return `Gültig bis ${shortDate.format(new Date(expiresAt)).replace(/\s/g, '\u00a0')}`;
}
