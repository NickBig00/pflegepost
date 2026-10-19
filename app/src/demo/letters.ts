import { isoInDays, parseDay } from '@/lib/dates';

import type { Letter } from './incoming';

// Original letters for the demo documents, so "Original ansehen" works everywhere.

const numericDate = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const recipient = ['Frau Ingrid Weber', 'Lindenstraße 12', '85049 Ingolstadt'];

export function createDemoLetters(today: Date = new Date()): Record<string, Letter> {
  const dated = (place: string, offset: number) =>
    `${place}, ${numericDate.format(parseDay(isoInDays(offset, today)))}`;

  return {
    'doc-aok-hoeherstufung': {
      sender: {
        name: 'AOK Pflegekasse',
        lines: ['Servicezentrum Pflege', 'Postfach 12 34 56', '80001 München'],
      },
      recipient,
      place: dated('München', -7),
      subject: 'Ihr Antrag auf Höherstufung des Pflegegrades – Az. PV-4711-0815',
      salutation: 'Sehr geehrte Frau Weber,',
      paragraphs: [
        'wir haben Ihren Antrag auf Höherstufung erhalten. Wir haben den Medizinischen Dienst beauftragt, ein Gutachten zu erstellen. Der Medizinische Dienst wird sich für einen Termin bei Ihnen melden.',
        `Damit die Begutachtung gut vorbereitet ist, bitten wir Sie, uns aktuelle ärztliche Unterlagen bis zum ${numericDate.format(parseDay(isoInDays(2, today)))} zu senden.`,
      ],
      closing: ['Mit freundlichen Grüßen', 'Ihre AOK Pflegekasse'],
    },
    'doc-md-termin': {
      sender: {
        name: 'Medizinischer Dienst Bayern',
        lines: ['Begutachtung Pflege', 'Haidenauplatz 1', '81667 München'],
      },
      recipient,
      place: dated('München', -4),
      subject: 'Ankündigung eines Hausbesuchs zur Pflegebegutachtung',
      salutation: 'Sehr geehrte Frau Weber,',
      paragraphs: [
        `im Auftrag Ihrer Pflegekasse besuchen wir Sie am ${numericDate.format(parseDay(isoInDays(6, today)))} um 10:00 Uhr zu Hause. Der Besuch dauert etwa eine Stunde.`,
        'Gerne kann eine Angehörige oder ein Angehöriger dabei sein. Halten Sie bitte, falls vorhanden, ein Pflegetagebuch sowie Arztberichte und Ihren Medikamentenplan bereit.',
      ],
      closing: ['Mit freundlichen Grüßen', 'Ihr Medizinischer Dienst Bayern'],
    },
    'doc-pflegedienst-rechnung': {
      sender: {
        name: 'Pflegedienst Sonnenschein',
        lines: ['Ambulante Pflege', 'Am Stadtpark 3', '85049 Ingolstadt'],
      },
      recipient,
      place: dated('Ingolstadt', -2),
      subject: 'Rechnung Nr. 2026-1047 für Leistungen im Oktober',
      salutation: 'Sehr geehrte Frau Weber,',
      paragraphs: [
        'für die im Oktober erbrachten Pflegeleistungen berechnen wir Ihnen den Eigenanteil, der nicht von der Pflegekasse übernommen wird. Die Aufstellung der Einsätze finden Sie in der Anlage.',
        `Bitte überweisen Sie den Betrag bis zum ${numericDate.format(parseDay(isoInDays(24, today)))} auf das unten angegebene Konto.`,
      ],
      closing: ['Mit freundlichen Grüßen', 'Ihr Pflegedienst Sonnenschein'],
    },
    'doc-aok-bescheid': {
      sender: {
        name: 'AOK Pflegekasse',
        lines: ['Servicezentrum Pflege', 'Postfach 12 34 56', '80001 München'],
      },
      recipient,
      place: dated('München', -49),
      subject: 'Bescheid über Leistungen der Pflegeversicherung',
      salutation: 'Sehr geehrte Frau Weber,',
      paragraphs: [
        'nach dem Gutachten des Medizinischen Dienstes stellen wir bei Ihnen Pflegegrad 3 fest. Sie erhalten ab dem Monat der Antragstellung Leistungen der Pflegeversicherung.',
        'Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen.',
      ],
      closing: ['Mit freundlichen Grüßen', 'Ihre AOK Pflegekasse'],
    },
  };
}
