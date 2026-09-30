import { supabase } from './supabase';

export async function ensureProfile(userId: string, displayName?: string | null) {
  const { data: existing, error: readError } = await supabase
    .from('profiles')
    .select('id, display_name, preferred_language_code, interface_language_code, voice_input_language_code, response_audio_language_code')
    .eq('id', userId)
    .maybeSingle();

  if (readError) return readError;

  if (!existing) {
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      display_name: displayName ?? null,
      preferred_language_code: 'en',
      interface_language_code: 'en',
      voice_input_language_code: 'en',
      response_audio_language_code: 'en',
    });
    return error;
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...(displayName !== undefined ? { display_name: displayName } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return error;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}
