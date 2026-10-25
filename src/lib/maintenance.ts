import { supabase } from './supabase';

export type KjvImportResult = {
  processed: number;
  total: number;
  completed: boolean;
  failures: Array<{ book?: string; error?: string }>;
};

export async function runKjvBulkImport(): Promise<KjvImportResult> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session) throw new Error('You must be signed in to run the KJV import.');

  const { data, error } = await supabase.functions.invoke<KjvImportResult>('kjv-bulk-import', {
    method: 'POST',
  });

  if (error) throw error;
  if (!data) throw new Error('The KJV importer returned no result.');
  return data;
}
