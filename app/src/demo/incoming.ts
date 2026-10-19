import { isoInDays, parseDay } from '@/lib/dates';

import type { Analysis, CareDocument } from './schemas';

// The letter "photographed" in the simulated capture flow.

export type Letter = {
  sender: { name: string; lines: string[] };
  recipient: string[];
  place: string;
  subject: string;
  salutation: string;
  paragraphs: string[];
  closing: string[];
};

const numericDate = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function createIncomingLetter(today: Date = new Date()) {
  const letterDate = isoInDays(-3, today);
  const dueDate = isoInDays(26, today);
  const sourceQuote = `Bitte senden Sie uns die fehlenden Unterlagen bis zum ${numericDate.format(parseDay(dueDate))} zu.`;

  const letter: Letter = {
    sender: {
      name: 'AOK Pflegekasse',
      lines: ['Servicezentrum Pflege', 'Postfach 12 34 56', '80001 München'],
    },
    recipient: ['Frau Ingrid Weber', 'Lindenstraße 12', '85049 Ingolstadt'],
    place: `München, ${numericDate.format(parseDay(letterDate))}`,
    subject: 'Ihr Antrag auf Verhinderungspflege – Az. PV-4711-0815',
    salutation: 'Sehr geehrte Frau Weber,',
    paragraphs: [
      'vielen Dank für Ihren Antrag auf Leistungen der Verhinderungspflege nach § 39 SGB XI. Damit wir über Ihren Antrag entscheiden können, benötigen wir noch folgende Unterlagen:',
      '1. Belege bzw. Quittungen über die Kosten der Ersatzpflege\n2. das beiliegende Formular, von Ihnen oder Ihrer bevollmächtigten Person unterschrieben',
      `${sourceQuote} Liegen uns die Unterlagen bis dahin nicht vor, können wir über Ihren Antrag nur nach Aktenlage entscheiden.`,
      'Bei Fragen erreichen Sie uns montags bis freitags von 8 bis 18 Uhr.',
    ],
    closing: ['Mit freundlichen Grüßen', 'Ihre AOK Pflegekasse'],
  };

  const document: CareDocument = {
    id: 'doc-aok-verhinderungspflege',
    caseId: 'mama',
    title: 'Antrag auf Verhinderungspflege',
    sender: 'AOK Pflegekasse',
    senderType: 'pflegekasse',
    receivedOn: isoInDays(0, today),
    summaryPlain:
      'Die AOK hat Mamas Antrag auf Verhinderungspflege bekommen. Das ist Geld für eine Vertretung, wenn ihr als Familie mal ausfallt. Bevor die AOK entscheidet, fehlen noch die Quittungen der Vertretung und Mamas Unterschrift.',
  };

  const analysis: Analysis = {
    referenceNumber: 'PV-4711-0815',
    letterDate,
    pageCount: 1,
    summaryPlain: document.summaryPlain,
    deadline: { dueDate, sourceQuote, page: 1 },
    suggestedTasks: [
      { id: 'sugg-quittungen', title: 'Quittungen der Ersatzpflege sammeln', daysBeforeDeadline: 7 },
      { id: 'sugg-unterschrift', title: 'Formular von Mama unterschreiben lassen', daysBeforeDeadline: 7 },
      { id: 'sugg-senden', title: 'Unterlagen an die AOK schicken', daysBeforeDeadline: 2 },
    ],
  };

  return { letter, document, analysis };
}
