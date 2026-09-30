import { supabase } from './supabase';

export async function ensureProfile(userId: string, displayName?: string | null) {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      display_name: displayName ?? null,
      preferred_language_code: 'en',
      interface_language_code: 'en',
      voice_input_language_code: 'en',
      response_audio_language_code: 'en',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id', ignoreDuplicates: false },
  );

  return error;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}
