import { supabase } from '../lib/supabase';

export type VoiceReviewQueueItem = {
  id: string;
  languageCode: string;
  nativeTranscript: string | null;
  intendedMeaning: string | null;
  verificationStatus: string;
  datasetSplit: string;
  createdAt: string;
  storagePath: string;
  mimeType: string;
  durationMs: number | null;
  audioUrl: string | null;
};

export async function loadVoiceReviewQueue(languageCode?: string) {
  let query = supabase
    .from('voice_language_evaluation_samples')
    .select(`
      id,
      language_code,
      native_transcript,
      intended_meaning,
      verification_status,
      dataset_split,
      created_at,
      voice_audio_uploads!inner(storage_path, mime_type, duration_ms)
    `)
    .in('verification_status', ['unverified', 'native_reviewed'])
    .order('created_at', { ascending: true });

  if (languageCode) query = query.eq('language_code', languageCode);

  const { data, error } = await query;
  if (error) throw error;

  const items = await Promise.all(
    (data ?? []).map(async (item: any) => {
      const upload = Array.isArray(item.voice_audio_uploads)
        ? item.voice_audio_uploads[0]
        : item.voice_audio_uploads;

      const { data: signed } = await supabase.storage
        .from('voice-audio')
        .createSignedUrl(upload.storage_path, 300);

      return {
        id: item.id,
        languageCode: item.language_code,
        nativeTranscript: item.native_transcript,
        intendedMeaning: item.intended_meaning,
        verificationStatus: item.verification_status,
        datasetSplit: item.dataset_split,
        createdAt: item.created_at,
        storagePath: upload.storage_path,
        mimeType: upload.mime_type,
        durationMs: upload.duration_ms,
        audioUrl: signed?.signedUrl ?? null,
      } satisfies VoiceReviewQueueItem;
    }),
  );

  return items;
}
