import { describe, expect, it, vi } from 'vitest';

import handler from './transcribe';

function createResponse() {
  const response = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return response;
}

describe('Idoma transcription API', () => {
  it('rejects non-POST requests', async () => {
    const res = createResponse();
    await handler({ method: 'GET' } as never, res as never);

    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe('POST');
    expect(res.body).toEqual({ error: 'Method not allowed.' });
  });

  it('returns 503 when Runpod is not configured', async () => {
    vi.stubEnv('IDOMA_ASR_RUNPOD_ENDPOINT_ID', '');
    vi.stubEnv('RUNPOD_API_KEY', '');

    const res = createResponse();
    await handler({ method: 'POST' } as never, res as never);

    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({ error: 'Idoma speech recognition is not configured.' });

    vi.unstubAllEnvs();
  });
});
