// Maps errors from Supabase (RPC error codes from our migrations, auth and
// network errors) to friendly German texts. Never shows raw messages, which
// could contain personal data or technical details.

export type AppErrorCode =
  | 'invite_invalid'
  | 'invite_used'
  | 'invite_expired'
  | 'consent_required'
  | 'last_owner'
  | 'not_allowed'
  | 'member_not_found'
  | 'not_authenticated'
  | 'network'
  | 'unknown';

const MESSAGES: Record<AppErrorCode, string> = {
  invite_invalid: 'Dieser Einladungslink funktioniert nicht. Frag am besten nach einem neuen Link.',
  invite_used: 'Dieser Link wurde schon benutzt. Frag am besten nach einem neuen Link.',
  invite_expired: 'Dieser Link ist abgelaufen. Einladungen gelten 7 Tage – frag einfach nach einem neuen.',
  consent_required: 'Bitte stimm zuerst der Verarbeitung der Daten zu.',
  last_owner: 'Niemand außer dir verwaltet diesen Fall. Gib die Verwaltung zuerst an jemand anderen weiter.',
  not_allowed: 'Das kann nur, wer den Fall verwaltet.',
  member_not_found: 'Diese Person gehört nicht mehr zum Fall.',
  not_authenticated: 'Bitte melde dich noch einmal an.',
  network: 'Gerade gibt es keine Verbindung. Versuch es gleich noch einmal.',
  unknown: 'Das hat leider nicht geklappt. Versuch es bitte noch einmal.',
};

const RPC_CODES = new Set<AppErrorCode>([
  'invite_invalid',
  'invite_used',
  'invite_expired',
  'consent_required',
  'last_owner',
  'not_allowed',
  'member_not_found',
  'not_authenticated',
]);

export function toAppErrorCode(error: unknown): AppErrorCode {
  if (error && typeof error === 'object') {
    const { message, name } = error as { message?: unknown; name?: unknown };
    if (typeof message === 'string' && RPC_CODES.has(message as AppErrorCode)) {
      return message as AppErrorCode;
    }
    const text = `${typeof name === 'string' ? name : ''} ${typeof message === 'string' ? message : ''}`;
    if (/network request failed|failed to fetch|fetcherror|retryablefetch/i.test(text)) {
      return 'network';
    }
  }
  return 'unknown';
}

export function errorMessage(error: unknown): string {
  return MESSAGES[toAppErrorCode(error)];
}
