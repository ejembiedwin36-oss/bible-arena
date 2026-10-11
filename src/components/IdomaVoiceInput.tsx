import { useRef, useState } from 'react';
import { transcribeIdomaAudio } from '../services/idomaAsr';
import { createIdomaRecorder } from '../services/idomaRecorder';

type Recorder = Awaited<ReturnType<typeof createIdomaRecorder>>;

type IdomaVoiceInputProps = {
  onTranscript?: (transcript: string) => void;
};

export function IdomaVoiceInput({ onTranscript }: IdomaVoiceInputProps) {
  const recorderRef = useRef<Recorder | null>(null);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function startRecording() {
    setError(null);
    setTranscript('');

    try {
      const recorder = await createIdomaRecorder();
      recorderRef.current = recorder;
      recorder.start();
      setStatus('recording');
    } catch (cause) {
      setStatus('idle');
      setError(cause instanceof Error ? cause.message : 'Unable to start the microphone.');
    }
  }

  async function stopAndTranscribe() {
    const recorder = recorderRef.current;
    if (!recorder) return;

    setStatus('processing');
    setError(null);

    try {
      const recording = await recorder.stop();
      recorderRef.current = null;
      const result = await transcribeIdomaAudio(recording.blob);
      setTranscript(result.transcript);
      onTranscript?.(result.transcript);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to understand the Idoma recording.');
    } finally {
      setStatus('idle');
    }
  }

  return (
    <section className="idoma-voice-input" aria-label="Idoma voice input">
      <div>
        <strong>Speak Idoma</strong>
        <p>Speak naturally and Bible Arena will turn your Idoma speech into text.</p>
      </div>

      {status === 'recording' ? (
        <button type="button" onClick={() => void stopAndTranscribe()}>
          Stop & transcribe
        </button>
      ) : (
        <button type="button" disabled={status === 'processing'} onClick={() => void startRecording()}>
          {status === 'processing' ? 'Understanding Idoma…' : '🎤 Speak Idoma'}
        </button>
      )}

      <p aria-live="polite">
        {status === 'recording' && 'Listening… Speak in Idoma, then press Stop & transcribe.'}
        {status === 'processing' && 'Processing your recording…'}
      </p>

      {error && <p role="alert" className="reader-error">{error}</p>}
      {transcript && (
        <div className="idoma-transcript">
          <strong>Idoma transcript</strong>
          <p>{transcript}</p>
        </div>
      )}
    </section>
  );
}
