export type AsrCandidate = 'omnilingual' | 'idoma-specialist';

export type AsrBenchmarkCase = {
  id: string;
  languageCode: string;
  audioReference: string;
  expectedTranscript?: string;
  expectedIntent?: {
    type: string;
    bookName?: string;
    chapterNumber?: number;
    verseNumber?: number;
  };
};

export type AsrBenchmarkResult = {
  candidate: AsrCandidate;
  caseId: string;
  transcript?: string;
  wordErrorRate?: number;
  intentCorrect?: boolean;
  latencyMs?: number;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
};

export function createAsrBenchmarkRun(cases: AsrBenchmarkCase[]) {
  return cases.map((testCase) => ({
    caseId: testCase.id,
    candidates: ['omnilingual', 'idoma-specialist'] as AsrCandidate[],
    languageCode: testCase.languageCode,
    audioReference: testCase.audioReference,
    status: 'pending' as const,
  }));
}

export function wordErrorRate(reference: string, hypothesis: string): number {
  const ref = tokenize(reference);
  const hyp = tokenize(hypothesis);

  if (ref.length === 0) return hyp.length === 0 ? 0 : 1;

  const previous = Array.from({ length: hyp.length + 1 }, (_, index) => index);

  for (let i = 1; i <= ref.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= hyp.length; j += 1) {
      const substitution = previous[j - 1] + (ref[i - 1] === hyp[j - 1] ? 0 : 1);
      const insertion = current[j - 1] + 1;
      const deletion = previous[j] + 1;
      current[j] = Math.min(substitution, insertion, deletion);
    }
    for (let j = 0; j <= hyp.length; j += 1) previous[j] = current[j];
  }

  return previous[hyp.length] / ref.length;
}

function tokenize(value: string): string[] {
  return value.trim().toLowerCase().split(/\s+/).filter(Boolean);
}
