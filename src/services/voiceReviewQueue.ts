import { supabase } from '../lib/supabase';

export type VoiceReviewQueueItem = {
  id: string;
  languageCode: string;
  nativeTranscript: string | null;
  intendedMeaning: string | null;
  verificationStatus: string;
  datasetSplit: string | null;
  createdAt: string;
  storagePath: string;
  mimeType: string;
  durationMs: number | null;
  audioUrl: string | null;
};

export async function loadVoiceReviewQueue(
  languageCode?: string,
  role: 'reviewer' | 'validator' = 'reviewer',
) {
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
    .eq('verification_status', role === 'validator' ? 'native_reviewed' : 'unverified')
    .order('created_at', { ascending: true });

  if (languageCode) query = query.eq('language_code', languageCode);

  const { data, error } = await query;
  if (error) throw error;

  return Promise.all(
    (data ?? []).map(async (item: any) => {
      const upload = Array.isArray(item.voice_audio_uploads)
        ? item.voice_audio_uploads[0]
        : item.voice_audio_uploads;

      const { data: signed, error: signedUrlError } = await supabase.storage
        .from('voice-audio')
        .createSignedUrl(upload.storage_path, 300);

      if (signedUrlError) throw signedUrlError;

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
}
