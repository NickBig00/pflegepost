import Link from 'next/link';

import { Footer } from '@/components/Footer';

export const metadata = { title: 'Datenschutzerklärung – Pflegepost' };

export default function Page() {
  return (
    <>
      <main className="container" style={{ maxWidth: 720, paddingTop: 48, display: 'grid', gap: 20 }}>
        <Link href="/">← Zur Startseite</Link>
        <h1>Datenschutzerklärung</h1>
        <p className="card">
          Platzhalter: Dieser Text wird vor der Veröffentlichung durch eine rechtlich geprüfte Fassung ersetzt.
        </p>
      </main>
      <Footer />
    </>
  );
}
