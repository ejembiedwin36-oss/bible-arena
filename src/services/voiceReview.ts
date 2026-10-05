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
  const { data, error } = await supabase
    .from('voice_language_evaluation_samples')
    .update({
      native_transcript: input.nativeTranscript.trim(),
      intended_meaning: input.intendedMeaning.trim(),
      intent: input.intent,
      verification_status: input.status,
      reviewer_notes: input.reviewerNotes?.trim() || null,
      reviewer_verified: input.status === 'validated',
    })
    .eq('id', input.sampleId)
    .select('id, verification_status, reviewer_verified')
    .single();

  if (error) throw error;
  return data;
}
