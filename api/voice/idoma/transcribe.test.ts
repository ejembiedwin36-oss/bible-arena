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

function createAudioRequest(audio = Buffer.from('idoma audio'), contentType = 'audio/webm') {
  return {
    method: 'POST',
    headers: { 'content-type': contentType },
    async *[Symbol.asyncIterator]() {
      yield audio;
    },
  };
}

function configureRunpod() {
  vi.stubEnv('IDOMA_ASR_RUNPOD_ENDPOINT_ID', 'endpoint-123');
  vi.stubEnv('RUNPOD_API_KEY', 'test-key');
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
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

  it('rejects non-audio request bodies before contacting Runpod', async () => {
    configureRunpod();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = createResponse();
    await handler(createAudioRequest(Buffer.from('text'), 'text/plain') as never, res as never);

    expect(res.statusCode).toBe(415);
    expect(res.body).toEqual({ error: 'Send the recording as an audio request body.' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an empty audio request before contacting Runpod', async () => {
    configureRunpod();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = createResponse();
    await handler(createAudioRequest(Buffer.alloc(0)) as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'No audio was provided.' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects audio larger than the proxy limit before contacting Runpod', async () => {
    configureRunpod();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = createResponse();
    await handler(createAudioRequest(Buffer.alloc((4 * 1024 * 1024) + 1)) as never, res as never);

    expect(res.statusCode).toBe(413);
    expect(res.body).toEqual({ error: 'The audio recording is too large.' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submits audio securely to Runpod and returns the completed Idoma transcript', async () => {
    vi.useFakeTimers();
    configureRunpod();

    const audio = Buffer.from('idoma audio');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'job-456' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: 'COMPLETED',
        output: { transcript: '  Idoma transcript  ', languageCode: 'idu' },
      }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const res = createResponse();
    const pending = handler(createAudioRequest(audio) as never, res as never);
    await vi.advanceTimersByTimeAsync(1000);
    await pending;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.runpod.ai/v2/endpoint-123/run');
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.runpod.ai/v2/endpoint-123/status/job-456');

    const submission = fetchMock.mock.calls[0][1] as RequestInit;
    expect(submission.method).toBe('POST');
    expect(submission.headers).toEqual({
      Authorization: 'Bearer test-key',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(String(submission.body))).toEqual({
      input: { audio: audio.toString('base64') },
    });

    const statusRequest = fetchMock.mock.calls[1][1] as RequestInit;
    expect(statusRequest.headers).toEqual({ Authorization: 'Bearer test-key' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      transcript: 'Idoma transcript',
      languageCode: 'idu',
      model: 'omniASR_CTC_300M_v2',
    });
  });

  it('returns a safe error when Runpod rejects job submission', async () => {
    configureRunpod();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'provider failure' }), { status: 500 }),
    ));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const res = createResponse();
    await handler(createAudioRequest() as never, res as never);

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: 'Could not start Idoma speech recognition.' });
  });

  it('returns a safe error when Runpod accepts submission without a job id', async () => {
    configureRunpod();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'IN_QUEUE' }), { status: 200 }),
    ));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const res = createResponse();
    await handler(createAudioRequest() as never, res as never);

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: 'Could not start Idoma speech recognition.' });
  });

  it('returns a safe error when Runpod job status cannot be read', async () => {
    vi.useFakeTimers();
    configureRunpod();

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'job-456' }), { status: 200 }))
      .mockResolvedValueOnce(new Response('provider unavailable', { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);

    const res = createResponse();
    const pending = handler(createAudioRequest() as never, res as never);
    await vi.advanceTimersByTimeAsync(1000);
    await pending;

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: 'Could not read the speech-recognition result.' });
  });

  it.each(['FAILED', 'CANCELLED'])('returns a safe error when a Runpod job is %s', async (status) => {
    vi.useFakeTimers();
    configureRunpod();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'job-456' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status,
        error: 'private provider detail',
      }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const res = createResponse();
    const pending = handler(createAudioRequest() as never, res as never);
    await vi.advanceTimersByTimeAsync(1000);
    await pending;

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: 'Idoma speech recognition failed.' });
    expect(JSON.stringify(res.body)).not.toContain('private provider detail');
  });

  it('rejects a completed Runpod job that contains no transcript', async () => {
    vi.useFakeTimers();
    configureRunpod();

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'job-456' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: 'COMPLETED',
        output: { transcript: '   ' },
      }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const res = createResponse();
    const pending = handler(createAudioRequest() as never, res as never);
    await vi.advanceTimersByTimeAsync(1000);
    await pending;

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: 'Speech recognition returned no transcript.' });
  });

  it('times out safely when Runpod never completes the job', async () => {
    vi.useFakeTimers();
    configureRunpod();

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'job-456' }), { status: 200 }))
      .mockImplementation(() => Promise.resolve(
        new Response(JSON.stringify({ status: 'IN_PROGRESS' }), { status: 200 }),
      ));
    vi.stubGlobal('fetch', fetchMock);

    const res = createResponse();
    const pending = handler(createAudioRequest() as never, res as never);
    await vi.advanceTimersByTimeAsync(55_000);
    await pending;

    expect(res.statusCode).toBe(504);
    expect(res.body).toEqual({ error: 'Idoma speech recognition timed out. Please try again.' });
    expect(fetchMock).toHaveBeenCalledTimes(56);
  });
});
