import { supabase } from '../lib/supabase';

export type ReviewStatus = 'native_reviewed' | 'validated' | 'rejected';

export async function reviewVoiceEvaluationSample(input: {
  sampleId: string;
  nativeTranscript: string;
  intendedMeaning: string;
  intent: Record<string, unknown>;
  status: ReviewStatus;
  reviewerNotes?: string;
}) {
  const { data, error } = await supabase.rpc('review_voice_language_sample', {
    p_sample_id: input.sampleId,
    p_native_transcript: input.nativeTranscript,
    p_intended_meaning: input.intendedMeaning,
    p_intent: input.intent,
    p_status: input.status,
    p_notes: input.reviewerNotes ?? null,
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}
