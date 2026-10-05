import { supabase } from '../lib/supabase';

const VOICE_BUCKET = 'voice-audio';

export type VoiceUploadInput = {
  recording: Blob;
  languageCode: string;
  durationMs?: number;
};

export async function uploadVoiceSample({ recording, languageCode, durationMs }: VoiceUploadInput) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('You must be signed in before uploading a voice sample.');

  const extension = recording.type.includes('mp4') ? 'mp4' : 'webm';
  const storagePath = `${user.id}/${languageCode}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(VOICE_BUCKET)
    .upload(storagePath, recording, {
      contentType: recording.type || 'audio/webm',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data, error: rowError } = await supabase
    .from('voice_audio_uploads')
    .insert({
      user_id: user.id,
      language_code: languageCode,
      storage_path: storagePath,
      mime_type: recording.type || 'audio/webm',
      duration_ms: durationMs ?? null,
      status: 'uploaded',
    })
    .select('id, storage_path, status, created_at')
    .single();

  if (rowError) {
    await supabase.storage.from(VOICE_BUCKET).remove([storagePath]);
    throw rowError;
  }

  return data;
}
