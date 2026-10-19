import { isoInDays } from '@/lib/dates';

import type { CareCase, CareDocument, Task } from './schemas';

// Invented example family for the demo. Dates are relative to today so the
// demo always looks current.

export const CURRENT_USER_ID = 'anna';

export function createDemoData(today: Date = new Date()) {
  const day = (offset: number) => isoInDays(offset, today);

  const careCase: CareCase = {
    id: 'mama',
    displayName: 'Mama',
    fullName: 'Ingrid Weber',
    legalBasis: 'power_of_attorney',
    members: [
      { id: 'anna', displayName: 'Anna Weber', role: 'owner' },
      { id: 'thomas', displayName: 'Thomas Weber', role: 'member' },
    ],
  };

  const documents: CareDocument[] = [
    {
      id: 'doc-aok-hoeherstufung',
      caseId: 'mama',
      title: 'Antrag auf Höherstufung',
      sender: 'AOK Pflegekasse',
      senderType: 'pflegekasse',
      receivedOn: day(-5),
      summaryPlain:
        'Die AOK hat euren Antrag auf einen höheren Pflegegrad erhalten. Sie braucht noch ärztliche Unterlagen, bevor der Medizinische Dienst zu Mama kommt.',
    },
    {
      id: 'doc-md-termin',
      caseId: 'mama',
      title: 'Einladung zur Begutachtung',
      sender: 'Medizinischer Dienst Bayern',
      senderType: 'medizinischer_dienst',
      receivedOn: day(-3),
      summaryPlain:
        'Eine Gutachterin kommt zu Mama nach Hause und schaut, wie viel Hilfe sie im Alltag braucht. Es ist gut, wenn jemand aus der Familie dabei ist.',
    },
    {
      id: 'doc-pflegedienst-rechnung',
      caseId: 'mama',
      title: 'Rechnung Oktober',
      sender: 'Pflegedienst Sonnenschein',
      senderType: 'pflegedienst',
      receivedOn: day(-1),
      summaryPlain:
        'Der Pflegedienst rechnet die Einsätze im Oktober ab. Ein Teil wird direkt mit der Pflegekasse abgerechnet, den Rest zahlt ihr selbst.',
    },
    {
      id: 'doc-aok-bescheid',
      caseId: 'mama',
      title: 'Bescheid Pflegegrad 3',
      sender: 'AOK Pflegekasse',
      senderType: 'pflegekasse',
      receivedOn: day(-47),
      summaryPlain:
        'Mama hat Pflegegrad 3. Damit stehen ihr monatlich Pflegegeld oder Pflegesachleistungen zu.',
    },
  ];

  const tasks: Task[] = [
    {
      id: 'task-unterlagen',
      caseId: 'mama',
      documentId: 'doc-aok-hoeherstufung',
      title: 'Ärztliche Unterlagen an die AOK schicken',
      dueDate: day(2),
      assigneeId: 'anna',
      status: 'open',
      completedAt: null,
    },
    {
      id: 'task-pflegetagebuch',
      caseId: 'mama',
      documentId: 'doc-md-termin',
      title: 'Pflegetagebuch für die Begutachtung vorbereiten',
      dueDate: day(5),
      assigneeId: null,
      status: 'open',
      completedAt: null,
    },
    {
      id: 'task-md-termin',
      caseId: 'mama',
      documentId: 'doc-md-termin',
      title: 'Bei der Begutachtung dabei sein',
      dueDate: day(6),
      assigneeId: 'thomas',
      status: 'open',
      completedAt: null,
    },
    {
      id: 'task-rechnung',
      caseId: 'mama',
      documentId: 'doc-pflegedienst-rechnung',
      title: 'Rechnung des Pflegedienstes prüfen',
      dueDate: day(24),
      assigneeId: null,
      status: 'open',
      completedAt: null,
    },
    // Done this week: gives the family view and the weekly review something to show.
    {
      id: 'task-pflegedienst-anruf',
      caseId: 'mama',
      documentId: 'doc-pflegedienst-rechnung',
      title: 'Pflegedienst wegen neuer Einsatzzeiten anrufen',
      dueDate: day(-1),
      assigneeId: 'anna',
      status: 'done',
      completedAt: day(-1),
    },
    {
      id: 'task-rezept',
      caseId: 'mama',
      documentId: null,
      title: 'Neues Rezept beim Hausarzt abholen',
      dueDate: day(-2),
      assigneeId: 'anna',
      status: 'done',
      completedAt: day(-2),
    },
    {
      id: 'task-hausnotruf',
      caseId: 'mama',
      documentId: null,
      title: 'Angebote für einen Hausnotruf vergleichen',
      dueDate: null,
      assigneeId: 'thomas',
      status: 'done',
      completedAt: day(-3),
    },
    {
      id: 'task-arztbericht',
      caseId: 'mama',
      documentId: 'doc-aok-hoeherstufung',
      title: 'Arztbericht bei der Hausarztpraxis anfragen',
      dueDate: day(-4),
      assigneeId: 'anna',
      status: 'done',
      completedAt: day(-4),
    },
  ];

  return { careCase, documents, tasks };
}
