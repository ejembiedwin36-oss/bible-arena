import { useEffect, useRef, useState } from 'react';
import { uploadVoiceSample } from '../services/voiceUpload';

type Props = {
  onRecordingReady?: (recording: Blob) => void;
};

export function IdomaVoiceRecorder({ onRecordingReady }: Props) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const secondsRef = useRef(0);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      secondsRef.current += 1;
      setSeconds(secondsRef.current);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => () => {
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
  }, []);

  async function startRecording() {
    if (!consent) {
      setError('Speaker consent is required before recording.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('This browser does not support microphone recording.');
      return;
    }

    try {
      setBusy(true);
      setError(null);
      setMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      secondsRef.current = 0;
      setSeconds(0);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const recordingBlob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        onRecordingReady?.(recordingBlob);

        try {
          setBusy(true);
          await uploadVoiceSample({
            recording: recordingBlob,
            languageCode: 'id',
            durationMs: secondsRef.current * 1000,
          });
          setMessage('Recording uploaded securely. It is ready for native-speaker review.');
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'Unable to upload the recording.');
        } finally {
          setBusy(false);
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      recorder.start();
      setRecording(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to access the microphone.');
    } finally {
      setBusy(false);
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
    setRecording(false);
  }

  return (
    <section className="card voice-recorder" aria-labelledby="idoma-voice-title">
      <span className="eyebrow">VOICE · IDOMA</span>
      <h2 id="idoma-voice-title">Record natural Idoma speech</h2>
      <p>
        Speak naturally in Idoma. The audio is stored privately and separately from
        its transcript so a native speaker can verify the words and intended meaning.
      </p>

      <label className="voice-consent">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        <span>I consent to this recording being used for Bible Arena language evaluation.</span>
      </label>

      <div className="voice-recorder-actions">
        {!recording ? (
          <button type="button" disabled={busy} onClick={startRecording}>
            {busy ? 'Working…' : 'Start recording'}
          </button>
        ) : (
          <button type="button" onClick={stopRecording}>
            Stop recording · {seconds}s
          </button>
        )}
      </div>

      {recording && <p className="voice-status">Recording… speak naturally. No prepared Idoma wording is being supplied here.</p>}
      {message && <div className="notice success">{message}</div>}
      {error && <div className="notice error">{error}</div>}
    </section>
  );
}
