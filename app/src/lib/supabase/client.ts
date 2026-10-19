import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { readSupabaseEnv } from './env';
import { sessionStorage } from './storage';

let client: SupabaseClient | null = null;

/** The app's only Supabase client (publishable key; access is enforced by RLS). */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  const { url, publishableKey } = readSupabaseEnv();
  client = createClient(url, publishableKey, {
    auth: {
      storage: sessionStorage,
      persistSession: true,
      autoRefreshToken: true,
      // Sign-in links are handled explicitly by the deep link route.
      detectSessionInUrl: false,
    },
  });

  // Refresh tokens only while the app is in the foreground (Supabase guidance for React Native).
  if (Platform.OS !== 'web') {
    const supabase = client;
    AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
  }
  return client;
}
