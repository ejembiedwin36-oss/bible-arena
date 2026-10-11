export type IdomaRecording = {
  blob: Blob;
  mimeType: string;
};

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
];

function chooseMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return PREFERRED_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

/**
 * Small browser microphone wrapper for Idoma speech input.
 * Audio conversion to mono 16 kHz happens on the secure ASR server.
 */
export async function createIdomaRecorder() {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    throw new Error('Microphone recording is not supported in this browser.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const mimeType = chooseMimeType();
  const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  const chunks: BlobPart[] = [];

  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });

  function stopTracks() {
    stream.getTracks().forEach((track) => track.stop());
  }

  return {
    start() {
      if (recorder.state !== 'inactive') {
        throw new Error('Microphone recording has already started.');
      }
      recorder.start();
    },

    stop(): Promise<IdomaRecording> {
      return new Promise((resolve, reject) => {
        if (recorder.state === 'inactive') {
          stopTracks();
          reject(new Error('No active microphone recording to stop.'));
          return;
        }

        recorder.addEventListener('stop', () => {
          stopTracks();
          const actualMimeType = recorder.mimeType || mimeType || 'audio/webm';
          resolve({
            blob: new Blob(chunks, { type: actualMimeType }),
            mimeType: actualMimeType,
          });
        }, { once: true });

        recorder.addEventListener('error', () => {
          stopTracks();
          reject(new Error('Microphone recording failed.'));
        }, { once: true });

        recorder.stop();
      });
    },

    cancel() {
      if (recorder.state !== 'inactive') recorder.stop();
      stopTracks();
    },
  };
}
