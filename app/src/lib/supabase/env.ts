import { z } from 'zod';

const envSchema = z.object({
  url: z.url({ protocol: /^https?$/ }),
  publishableKey: z.string().startsWith('sb_publishable_'),
});

export type SupabaseEnv = z.infer<typeof envSchema>;

/** Reads the public Supabase config. Expo inlines EXPO_PUBLIC_* only on static access. */
export function readSupabaseEnv(
  source: Record<string, string | undefined> = {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
): SupabaseEnv {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error('Supabase config missing or invalid: copy app/.env.example to app/.env');
  }
  return parsed.data;
}
