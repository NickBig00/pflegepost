import { useCallback, useEffect, useState } from 'react';

import { getSupabase } from '@/lib/supabase';
import { loadFamily, type Family } from '@/lib/supabase/family';

type Loaded = { caseId: string; key: number; result: Family | 'error' };

/** Members and open invites of a case; `reload` after every change. */
export function useFamily(caseId: string) {
  const [key, setKey] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadFamily(getSupabase(), caseId).then(
      (family) => !cancelled && setLoaded({ caseId, key, result: family }),
      () => !cancelled && setLoaded({ caseId, key, result: 'error' }),
    );
    return () => {
      cancelled = true;
    };
  }, [caseId, key]);

  const reload = useCallback(() => setKey((k) => k + 1), []);
  // Keep showing the previous result while reloading, so lists do not flicker.
  const current = loaded && loaded.caseId === caseId ? loaded.result : null;
  return {
    family: current && current !== 'error' ? current : null,
    failed: current === 'error',
    reload,
  };
}
