import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { isoInDays } from '@/lib/dates';
import { personalize } from '@/lib/personalize';

import { createDemoData, CURRENT_USER_ID } from './data';
import type { Letter } from './incoming';
import { createDemoLetters } from './letters';
import type { CareCase, CareDocument, LegalBasis, Member, Task } from './schemas';

type Original = { letter: Letter; highlight?: string };

type Profile = { firstName: string; caseName: string; legalBasis: LegalBasis };

type DemoState = {
  careCase: CareCase;
  documents: CareDocument[];
  tasks: Task[];
  currentUser: Member;
  onboarded: boolean;
  memberById: (id: string | null) => Member | undefined;
  documentById: (id: string | null) => CareDocument | undefined;
  originalById: (documentId: string) => Original | undefined;
  /** Assign a task to someone, or unassign with null. */
  assignTask: (taskId: string, memberId: string | null) => void;
  setTaskDone: (taskId: string, done: boolean) => void;
  /** Save a confirmed letter together with the tasks the user accepted. */
  addDocument: (document: CareDocument, tasks: Task[], original?: Original) => void;
  completeOnboarding: (profile?: Profile) => void;
};

const DemoContext = createContext<DemoState | null>(null);

/** In-memory demo data. Replaced by Supabase queries in milestone 1. */
export function DemoProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => createDemoData());
  const [tasks, setTasks] = useState(initial.tasks);
  const [documents, setDocuments] = useState(initial.documents);
  const [originals, setOriginals] = useState<Record<string, Original>>(() =>
    Object.fromEntries(Object.entries(createDemoLetters()).map(([id, letter]) => [id, { letter }])),
  );
  const [profile, setProfile] = useState<Profile | null>(null);
  const [onboarded, setOnboarded] = useState(false);

  const assignTask = useCallback((taskId: string, memberId: string | null) => {
    setTasks((all) => all.map((t) => (t.id === taskId ? { ...t, assigneeId: memberId } : t)));
  }, []);

  const setTaskDone = useCallback((taskId: string, done: boolean) => {
    setTasks((all) =>
      all.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: done ? 'done' : 'open',
              completedAt: done ? isoInDays(0) : null,
              // Whoever ticks off an unassigned task gets the credit.
              assigneeId: t.assigneeId ?? (done ? CURRENT_USER_ID : null),
            }
          : t,
      ),
    );
  }, []);

  const addDocument = useCallback((document: CareDocument, newTasks: Task[], original?: Original) => {
    setDocuments((all) => [document, ...all.filter((d) => d.id !== document.id)]);
    setTasks((all) => [...all.filter((t) => t.documentId !== document.id), ...newTasks]);
    if (original) setOriginals((all) => ({ ...all, [document.id]: original }));
  }, []);

  const completeOnboarding = useCallback((p?: Profile) => {
    if (p) {
      setProfile(p);
      // Rewrite the demo texts once, so they speak about the person the user named.
      setDocuments((all) =>
        all.map((d) => ({ ...d, summaryPlain: personalize(d.summaryPlain, p.caseName) })),
      );
      setTasks((all) => all.map((t) => ({ ...t, title: personalize(t.title, p.caseName) })));
    }
    setOnboarded(true);
  }, []);

  const value = useMemo<DemoState>(() => {
    const careCase: CareCase = profile
      ? { ...initial.careCase, displayName: profile.caseName, legalBasis: profile.legalBasis }
      : initial.careCase;
    const members = careCase.members.map((m) =>
      m.id === CURRENT_USER_ID && profile ? { ...m, displayName: profile.firstName } : m,
    );
    const memberById = (id: string | null) => members.find((m) => m.id === id);
    return {
      careCase: { ...careCase, members },
      documents,
      tasks,
      currentUser: memberById(CURRENT_USER_ID)!,
      onboarded,
      memberById,
      documentById: (id) => documents.find((d) => d.id === id),
      originalById: (id) => originals[id],
      assignTask,
      setTaskDone,
      addDocument,
      completeOnboarding,
    };
  }, [
    initial,
    profile,
    onboarded,
    documents,
    tasks,
    originals,
    assignTask,
    setTaskDone,
    addDocument,
    completeOnboarding,
  ]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoState {
  const state = useContext(DemoContext);
  if (!state) throw new Error('useDemo must be used inside DemoProvider');
  return state;
}
