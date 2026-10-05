import { supabase } from '../lib/supabase';

export type VoiceEvaluationSample = {
  id: string;
  voiceAudioUploadId: string;
  languageCode: string;
  verificationStatus: string;
};

export async function createVoiceEvaluationSample(input: {
  voiceAudioUploadId: string;
  languageCode: string;
  datasetSplit?: 'training' | 'validation' | 'evaluation';
}): Promise<VoiceEvaluationSample> {
  const { data, error } = await supabase
    .from('voice_language_evaluation_samples')
    .insert({
      voice_audio_upload_id: input.voiceAudioUploadId,
      language_code: input.languageCode,
      dataset_split: input.datasetSplit ?? 'evaluation',
      verification_status: 'unverified',
    })
    .select('id, voice_audio_upload_id, language_code, verification_status')
    .single();

  if (error) throw error;
  return {
    id: data.id,
    voiceAudioUploadId: data.voice_audio_upload_id,
    languageCode: data.language_code,
    verificationStatus: data.verification_status,
  };
}
