import { supabase } from './supabase';
import { withTimeout } from './resilience';

const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Run a Supabase request with a bounded wait time.
 * The caller still receives Supabase's normal { data, error } result.
 */
export function withSupabaseTimeout<T>(
  request: PromiseLike<T>,
  timeoutMs = DEFAULT_TIMEOUT_MS,
) {
  return withTimeout(request, timeoutMs);
}

/**
 * Convenience helper for one-off reads where a query is already built.
 * Keep writes and mutations explicit at the call site.
 */
export async function resilientHealthCheck(timeoutMs = DEFAULT_TIMEOUT_MS) {
  return withSupabaseTimeout(
    supabase.from('languages').select('code').eq('is_active', true).limit(1),
    timeoutMs,
  );
}
