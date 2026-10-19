import Link from 'next/link';

import { Footer } from '@/components/Footer';
import { confirm, readConfig } from '@/lib/waitlist';

export const metadata = { title: 'Anmeldung bestätigen – Pflegepost' };
export const dynamic = 'force-dynamic';

async function check(token: string | undefined): Promise<'ok' | 'invalid' | 'unavailable'> {
  const config = readConfig();
  if (!config) return 'unavailable';
  if (!token) return 'invalid';
  try {
    return (await confirm(config, token)) ? 'ok' : 'invalid';
  } catch {
    console.error('waitlist confirm failed');
    return 'unavailable';
  }
}

const copy = {
  ok: { title: 'Danke, du stehst auf der Liste.', text: 'Wir melden uns, sobald Pflegepost startet.' },
  invalid: {
    title: 'Dieser Link funktioniert nicht mehr',
    text: 'Vielleicht ist er abgelaufen oder wurde schon benutzt. Melde dich einfach noch einmal an.',
  },
  unavailable: { title: 'Gerade nicht erreichbar', text: 'Bitte versuche es später noch einmal.' },
};

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const result = copy[await check(token)];
  return (
    <>
      <main className="container" style={{ maxWidth: 640, paddingTop: 96, display: 'grid', gap: 16 }}>
        <p className="eyebrow">Pflegepost</p>
        <h1>{result.title}</h1>
        <p className="muted">{result.text}</p>
        <p>
          <Link href="/">Zur Startseite</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
