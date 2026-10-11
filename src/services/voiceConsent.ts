import { supabase } from '../lib/supabase';

export const VOICE_CONSENT_VERSION = '2026-10-11-v1';

export type VoiceConsent = {
  allowAsrTraining: boolean;
  allowModelEvaluation: boolean;
};

export async function createVoiceContribution(input: {
  voiceAudioUploadId: string;
  languageCode: string;
  consent: VoiceConsent;
}) {
  const { data, error } = await supabase.rpc('create_voice_contribution', {
    p_voice_audio_upload_id: input.voiceAudioUploadId,
    p_language_code: input.languageCode,
    p_consent_version: VOICE_CONSENT_VERSION,
    p_allow_asr_training: input.consent.allowAsrTraining,
    p_allow_model_evaluation: input.consent.allowModelEvaluation,
  });

  if (error) throw error;
  return data;
}
