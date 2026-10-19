import { createContext, useContext, useState, type ReactNode } from 'react';

import { createIncomingLetter } from '@/demo/incoming';

type Capture = ReturnType<typeof createIncomingLetter>;

const CaptureContext = createContext<Capture | null>(null);

/** Holds the letter being captured for the duration of the flow. */
export function CaptureProvider({ children }: { children: ReactNode }) {
  const [capture] = useState(() => createIncomingLetter());
  return <CaptureContext.Provider value={capture}>{children}</CaptureContext.Provider>;
}

export function useCapture(): Capture {
  const capture = useContext(CaptureContext);
  if (!capture) throw new Error('useCapture must be used inside CaptureProvider');
  return capture;
}
