import { NextResponse } from 'next/server';

import { mailConfigured, sendConfirmationMail } from '@/lib/mail';
import { createToken, readConfig, savePending, signupSchema } from '@/lib/waitlist';

export async function POST(request: Request) {
  const config = readConfig();
  if (!config || !mailConfigured()) {
    // Honest: without a mail provider we cannot do double opt-in yet.
    return NextResponse.json({ status: 'closed' }, { status: 503 });
  }

  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ status: 'invalid' }, { status: 400 });
  }

  const { token, hash } = createToken();
  try {
    await savePending(config, parsed.data.email, hash);
    await sendConfirmationMail(parsed.data.email, `${config.siteUrl}/bestaetigen?token=${token}`);
  } catch {
    // No personal data in logs.
    console.error('waitlist signup failed');
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
  // Same answer whether the address was new or known, so nobody can probe addresses.
  return NextResponse.json({ status: 'pending' });
}
