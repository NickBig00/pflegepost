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
  | 'code_invalid'
  | 'email_invalid'
  | 'rate_limited'
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
  code_invalid:
    'Der Code passt nicht oder ist abgelaufen. Schau noch mal nach oder lass dir einen neuen schicken.',
  email_invalid: 'Bitte prüf die E-Mail-Adresse.',
  rate_limited: 'Gerade wurden sehr viele E-Mails verschickt. Versuch es in ein paar Minuten noch einmal.',
  network: 'Gerade gibt es keine Verbindung. Versuch es gleich noch einmal.',
  unknown: 'Das hat leider nicht geklappt. Versuch es bitte noch einmal.',
};

// Error codes of Supabase Auth (AuthApiError.code). A wrong and an expired code
// both come back as otp_expired, so the app cannot tell them apart.
const AUTH_CODES: Record<string, AppErrorCode> = {
  otp_expired: 'code_invalid',
  otp_disabled: 'code_invalid',
  email_address_invalid: 'email_invalid',
  validation_failed: 'email_invalid',
  over_email_send_rate_limit: 'rate_limited',
  over_request_rate_limit: 'rate_limited',
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
    const { message, name, code, status } = error as {
      message?: unknown;
      name?: unknown;
      code?: unknown;
      status?: unknown;
    };
    if (typeof code === 'string' && code in AUTH_CODES) return AUTH_CODES[code];
    if (status === 429) return 'rate_limited';
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
