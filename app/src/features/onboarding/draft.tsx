import { createContext, useContext, useState, type ReactNode } from 'react';

import type { LegalBasis } from '@/demo/schemas';

type Draft = { firstName: string; caseName: string; legalBasis: LegalBasis };

type DraftState = { draft: Draft; setDraft: (patch: Partial<Draft>) => void };

const DraftContext = createContext<DraftState | null>(null);

/** Onboarding answers, kept across the steps until the user consents. */
export function OnboardingDraftProvider({ children }: { children: ReactNode }) {
  const [draft, set] = useState<Draft>({ firstName: '', caseName: '', legalBasis: 'unknown' });
  return (
    <DraftContext.Provider value={{ draft, setDraft: (patch) => set((d) => ({ ...d, ...patch })) }}>
      {children}
    </DraftContext.Provider>
  );
}

export function useOnboardingDraft(): DraftState {
  const state = useContext(DraftContext);
  if (!state) throw new Error('useOnboardingDraft must be used inside OnboardingDraftProvider');
  return state;
}
