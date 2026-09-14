import { supabase } from './supabase';

export async function ensureProfile(userId: string, displayName?: string | null) {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      display_name: displayName ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  return error;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}
