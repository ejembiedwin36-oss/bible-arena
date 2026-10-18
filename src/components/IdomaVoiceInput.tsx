import { useEffect, useRef, useState } from 'react';
import { transcribeIdomaAudio } from '../services/idomaAsr';
import { createIdomaRecorder } from '../services/idomaRecorder';

type Recorder = Awaited<ReturnType<typeof createIdomaRecorder>>;

type IdomaVoiceInputProps = {
  onTranscript?: (transcript: string) => void;
};

const MAX_RECORDING_SECONDS = 30;

export function IdomaVoiceInput({ onTranscript }: IdomaVoiceInputProps) {
  const recorderRef = useRef<Recorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  function clearRecordingTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => () => {
    clearRecordingTimer();
    recorderRef.current?.cancel();
    recorderRef.current = null;
  }, []);

  async function startRecording() {
    setError(null);
    setTranscript('');
    setElapsedSeconds(0);

    try {
      const recorder = await createIdomaRecorder();
      recorderRef.current = recorder;
      recorder.start();
      setStatus('recording');

      timerRef.current = setInterval(() => {
        setElapsedSeconds((current) => current + 1);
      }, 1000);
    } catch (cause) {
      setStatus('idle');
      setError(cause instanceof Error ? cause.message : 'Unable to start the microphone.');
    }
  }

  async function stopAndTranscribe() {
    const recorder = recorderRef.current;
    if (!recorder || status !== 'recording') return;

    clearRecordingTimer();
    setStatus('processing');
    setError(null);

    try {
      const recording = await recorder.stop();
      recorderRef.current = null;
      const result = await transcribeIdomaAudio(recording.blob);
      setTranscript(result.transcript);
      onTranscript?.(result.transcript);
    } catch (cause) {
      recorderRef.current = null;
      setError(cause instanceof Error ? cause.message : 'Unable to understand the Idoma recording.');
    } finally {
      setStatus('idle');
      setElapsedSeconds(0);
    }
  }

  useEffect(() => {
    if (status === 'recording' && elapsedSeconds >= MAX_RECORDING_SECONDS) {
      void stopAndTranscribe();
    }
  }, [elapsedSeconds, status]);

  return (
    <section className="idoma-voice-input" aria-label="Idoma voice input">
      <div>
        <strong>Speak Idoma</strong>
        <p>Speak naturally in Idoma for up to 30 seconds. Bible Arena will turn the recording into text.</p>
      </div>

      {status === 'recording' ? (
        <button type="button" onClick={() => void stopAndTranscribe()}>
          Stop & transcribe ({elapsedSeconds}s)
        </button>
      ) : (
        <button type="button" disabled={status === 'processing'} onClick={() => void startRecording()}>
          {status === 'processing' ? 'Understanding Idoma…' : '🎤 Speak Idoma'}
        </button>
      )}

      <p aria-live="polite">
        {status === 'recording' && `Listening… ${MAX_RECORDING_SECONDS - elapsedSeconds}s remaining.`}
        {status === 'processing' && 'Understanding your recording… The first request may take longer while the speech service starts.'}
      </p>

      {error && (
        <div role="alert" className="reader-error">
          <p>{error}</p>
          <p>Your recording was not saved. You can try again when the speech service is available.</p>
        </div>
      )}

      {transcript && (
        <div className="idoma-transcript">
          <strong>Idoma transcript</strong>
          <p>{transcript}</p>
        </div>
      )}
    </section>
  );
}
