import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel Functions reject request bodies above 4.5 MB before application code
// can process them. Keep our own limit lower so clients get a predictable error.
const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
const RUNPOD_BASE_URL = 'https://api.runpod.ai/v2';
const POLL_INTERVAL_MS = 1000;
const MAX_POLLS = 55;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sendError(res: VercelResponse, status: number, message: string) {
  return res.status(status).json({ error: message });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Method not allowed.');
  }

  const endpointId = process.env.IDOMA_ASR_RUNPOD_ENDPOINT_ID;
  const apiKey = process.env.RUNPOD_API_KEY;

  if (!endpointId || !apiKey) {
    return sendError(res, 503, 'Idoma speech recognition is not configured.');
  }

  const chunks: Buffer[] = [];
  let size = 0;

  try {
    for await (const chunk of req) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buffer.length;
      if (size > MAX_AUDIO_BYTES) {
        return sendError(res, 413, 'The audio recording is too large.');
      }
      chunks.push(buffer);
    }
  } catch {
    return sendError(res, 400, 'Could not read the audio request.');
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.startsWith('audio/')) {
    return sendError(res, 415, 'Send the recording as an audio request body.');
  }

  const audio = Buffer.concat(chunks);
  if (audio.length === 0) {
    return sendError(res, 400, 'No audio was provided.');
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const runResponse = await fetch(`${RUNPOD_BASE_URL}/${endpointId}/run`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ input: { audio: audio.toString('base64') } }),
  });

  const runPayload = await runResponse.json().catch(() => null) as { id?: string; error?: string } | null;
  if (!runResponse.ok || !runPayload?.id) {
    console.error('Runpod job submission failed', runResponse.status, runPayload?.error);
    return sendError(res, 502, 'Could not start Idoma speech recognition.');
  }

  for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
    await sleep(POLL_INTERVAL_MS);

    const statusResponse = await fetch(
      `${RUNPOD_BASE_URL}/${endpointId}/status/${encodeURIComponent(runPayload.id)}`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );
    const statusPayload = await statusResponse.json().catch(() => null) as {
      status?: string;
      output?: { transcript?: string; languageCode?: string };
      error?: string;
    } | null;

    if (!statusResponse.ok || !statusPayload) {
      return sendError(res, 502, 'Could not read the speech-recognition result.');
    }

    if (statusPayload.status === 'COMPLETED') {
      const transcript = statusPayload.output?.transcript?.trim();
      if (!transcript) {
        return sendError(res, 502, 'Speech recognition returned no transcript.');
      }
      return res.status(200).json({
        transcript,
        languageCode: 'idu',
        model: 'omniASR_CTC_300M_v2',
      });
    }

    if (statusPayload.status === 'FAILED' || statusPayload.status === 'CANCELLED') {
      console.error('Runpod ASR job failed', statusPayload.error);
      return sendError(res, 502, 'Idoma speech recognition failed.');
    }
  }

  return sendError(res, 504, 'Idoma speech recognition timed out. Please try again.');
}
