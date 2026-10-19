import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { createDemoData, CURRENT_USER_ID } from './data';
import type { CareCase, CareDocument, Member, Task } from './schemas';

type DemoState = {
  careCase: CareCase;
  documents: CareDocument[];
  tasks: Task[];
  currentUser: Member;
  memberById: (id: string | null) => Member | undefined;
  documentById: (id: string | null) => CareDocument | undefined;
  /** Assign a task to someone, or unassign with null. */
  assignTask: (taskId: string, memberId: string | null) => void;
};

const DemoContext = createContext<DemoState | null>(null);

/** In-memory demo data. Replaced by Supabase queries in milestone 1. */
export function DemoProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => createDemoData());
  const [tasks, setTasks] = useState(initial.tasks);

  const assignTask = useCallback((taskId: string, memberId: string | null) => {
    setTasks((all) => all.map((t) => (t.id === taskId ? { ...t, assigneeId: memberId } : t)));
  }, []);

  const value = useMemo<DemoState>(() => {
    const { careCase, documents } = initial;
    const memberById = (id: string | null) => careCase.members.find((m) => m.id === id);
    return {
      careCase,
      documents,
      tasks,
      currentUser: memberById(CURRENT_USER_ID)!,
      memberById,
      documentById: (id) => documents.find((d) => d.id === id),
      assignTask,
    };
  }, [initial, tasks, assignTask]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoState {
  const state = useContext(DemoContext);
  if (!state) throw new Error('useDemo must be used inside DemoProvider');
  return state;
}
