import '@fontsource-variable/inter';
import './globals.css';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Pflegepost – Die Post für deine Eltern, gemeinsam im Griff',
  description:
    'Pflegepost erklärt Briefe von Pflegekasse, Ärzten und Ämtern in einfachen Worten, erinnert an Fristen und verteilt die Aufgaben fair in der Familie.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f3ed' },
    { media: '(prefers-color-scheme: dark)', color: '#141715' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
