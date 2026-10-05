import { supabase } from '../lib/supabase';

export type AsrManifestItem = {
  sampleId: string;
  languageCode: string;
  audioReference: string;
  nativeTranscript: string;
  datasetSplit: 'training' | 'validation' | 'evaluation';
};

export async function loadAsrEligibleManifest(languageCode = 'id'): Promise<AsrManifestItem[]> {
  const { data, error } = await supabase
    .from('voice_language_evaluation_samples')
    .select('id, language_code, audio_reference, native_transcript, dataset_split')
    .eq('language_code', languageCode)
    .eq('verification_status', 'validated')
    .eq('asr_eligible', true)
    .not('audio_reference', 'is', null)
    .not('native_transcript', 'is', null)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .filter((row) => row.native_transcript.trim().length > 0)
    .map((row) => ({
      sampleId: row.id,
      languageCode: row.language_code,
      audioReference: row.audio_reference,
      nativeTranscript: row.native_transcript,
      datasetSplit: row.dataset_split,
    }));
}

export function toAsrJsonl(items: AsrManifestItem[]): string {
  return items.map((item) => JSON.stringify(item)).join('\n');
}
