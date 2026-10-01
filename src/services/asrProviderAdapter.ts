import type { AsrCandidate, AsrBenchmarkCase, AsrBenchmarkResult } from './asrBenchmark';

export type AsrProviderResponse = {
  transcript: string;
  confidence?: number;
};

export interface AsrProviderAdapter {
  readonly candidate: AsrCandidate;
  recognize(testCase: AsrBenchmarkCase): Promise<AsrProviderResponse>;
}

export class HttpAsrProviderAdapter implements AsrProviderAdapter {
  constructor(
    public readonly candidate: AsrCandidate,
    private readonly endpoint: string,
    private readonly accessToken?: string,
  ) {}

  async recognize(testCase: AsrBenchmarkCase): Promise<AsrProviderResponse> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.accessToken) headers.Authorization = `Bearer ${this.accessToken}`;

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        languageCode: testCase.languageCode,
        audioReference: testCase.audioReference,
      }),
    });

    const payload = await response.json().catch(() => null) as AsrProviderResponse | null;

    if (!response.ok) {
      throw new Error(`ASR provider request failed with status ${response.status}.`);
    }

    if (!payload || typeof payload.transcript !== 'string' || payload.transcript.trim() === '') {
      throw new Error('ASR provider returned no transcript.');
    }

    return payload;
  }
}

export async function runAsrBenchmarkCase(
  testCase: AsrBenchmarkCase,
  provider: AsrProviderAdapter,
): Promise<AsrBenchmarkResult> {
  const startedAt = performance.now();

  try {
    const response = await provider.recognize(testCase);
    return {
      candidate: provider.candidate,
      caseId: testCase.id,
      transcript: response.transcript,
      wordErrorRate: testCase.expectedTranscript
        ? wordErrorRate(testCase.expectedTranscript, response.transcript)
        : undefined,
      latencyMs: Math.round(performance.now() - startedAt),
      status: 'completed',
    };
  } catch (error) {
    return {
      candidate: provider.candidate,
      caseId: testCase.id,
      latencyMs: Math.round(performance.now() - startedAt),
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown ASR provider error.',
    };
  }
}

function wordErrorRate(reference: string, hypothesis: string): number {
  const ref = tokenize(reference);
  const hyp = tokenize(hypothesis);
  if (ref.length === 0) return hyp.length === 0 ? 0 : 1;
  const previous = Array.from({ length: hyp.length + 1 }, (_, index) => index);
  for (let i = 1; i <= ref.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= hyp.length; j += 1) {
      current[j] = Math.min(
        previous[j - 1] + (ref[i - 1] === hyp[j - 1] ? 0 : 1),
        current[j - 1] + 1,
        previous[j] + 1,
      );
    }
    for (let j = 0; j <= hyp.length; j += 1) previous[j] = current[j];
  }
  return previous[hyp.length] / ref.length;
}

function tokenize(value: string): string[] {
  return value.trim().toLowerCase().split(/\s+/).filter(Boolean);
}
