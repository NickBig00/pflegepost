import { createContext, useContext, useState, type ReactNode } from 'react';

import { createIncomingLetter } from '@/demo/incoming';
import { useDemo } from '@/demo/store';
import { personalize } from '@/lib/personalize';

type Capture = ReturnType<typeof createIncomingLetter>;

const CaptureContext = createContext<Capture | null>(null);

/** Holds the letter being captured for the duration of the flow. */
export function CaptureProvider({ children }: { children: ReactNode }) {
  const { careCase } = useDemo();
  const [capture] = useState(() => {
    const raw = createIncomingLetter();
    const name = careCase.displayName;
    const summaryPlain = personalize(raw.analysis.summaryPlain, name);
    return {
      ...raw,
      document: { ...raw.document, summaryPlain },
      analysis: {
        ...raw.analysis,
        summaryPlain,
        suggestedTasks: raw.analysis.suggestedTasks.map((t) => ({ ...t, title: personalize(t.title, name) })),
      },
    };
  });
  return <CaptureContext.Provider value={capture}>{children}</CaptureContext.Provider>;
}

export function useCapture(): Capture {
  const capture = useContext(CaptureContext);
  if (!capture) throw new Error('useCapture must be used inside CaptureProvider');
  return capture;
}
