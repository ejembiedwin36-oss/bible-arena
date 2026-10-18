import { afterEach, describe, expect, it, vi } from 'vitest';

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

function createAudioRequest(audio = Buffer.from('idoma audio')) {
  return {
    method: 'POST',
    headers: { 'content-type': 'audio/webm' },
    async *[Symbol.asyncIterator]() {
      yield audio;
    },
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

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
  });

  it('submits audio to Runpod and returns the completed Idoma transcript', async () => {
    vi.useFakeTimers();
    vi.stubEnv('IDOMA_ASR_RUNPOD_ENDPOINT_ID', 'endpoint-123');
    vi.stubEnv('RUNPOD_API_KEY', 'test-key');

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'job-456' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: 'COMPLETED',
        output: { transcript: '  Idoma transcript  ', languageCode: 'idu' },
      }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const res = createResponse();
    const pending = handler(createAudioRequest() as never, res as never);
    await vi.advanceTimersByTimeAsync(1000);
    await pending;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.runpod.ai/v2/endpoint-123/run');
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.runpod.ai/v2/endpoint-123/status/job-456');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      transcript: 'Idoma transcript',
      languageCode: 'idu',
      model: 'omniASR_CTC_300M_v2',
    });
  });

  it('returns a safe error when Runpod rejects job submission', async () => {
    vi.stubEnv('IDOMA_ASR_RUNPOD_ENDPOINT_ID', 'endpoint-123');
    vi.stubEnv('RUNPOD_API_KEY', 'test-key');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'provider failure' }), { status: 500 }),
    ));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const res = createResponse();
    await handler(createAudioRequest() as never, res as never);

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: 'Could not start Idoma speech recognition.' });
  });
});
