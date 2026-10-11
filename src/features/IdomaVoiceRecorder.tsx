import { useEffect, useRef, useState } from 'react';
import { uploadVoiceSample } from '../services/voiceUpload';
import { createVoiceContribution } from '../services/voiceConsent';

type Props = {
  onRecordingReady?: (recording: Blob) => void;
};

export function IdomaVoiceRecorder({ onRecordingReady }: Props) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const secondsRef = useRef(0);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [trainingConsent, setTrainingConsent] = useState(false);
  const [evaluationConsent, setEvaluationConsent] = useState(false);
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
    if (!trainingConsent || !evaluationConsent) {
      setError('Please choose both consent options before contributing a recording to the Idoma ASR dataset.');
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
          const upload = await uploadVoiceSample({
            recording: recordingBlob,
            languageCode: 'id',
            durationMs: secondsRef.current * 1000,
          });
          await createVoiceContribution({
            voiceAudioUploadId: upload.id,
            languageCode: 'id',
            consent: {
              allowAsrTraining: trainingConsent,
              allowModelEvaluation: evaluationConsent,
            },
          });
          setMessage('Recording uploaded privately. Your consent was recorded and the sample is waiting for native-speaker review.');
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'Unable to save the recording sample.');
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
        Speak naturally in Idoma. Your audio is stored privately. A native-language reviewer must verify the transcript and meaning before the sample can be approved for the ASR dataset.
      </p>

      <fieldset className="voice-consent" disabled={recording || busy}>
        <legend>Voice data permission</legend>
        <label>
          <input type="checkbox" checked={trainingConsent} onChange={(event) => setTrainingConsent(event.target.checked)} />
          <span>I allow this recording to be used to train Bible Arena's Idoma speech-recognition model.</span>
        </label>
        <label>
          <input type="checkbox" checked={evaluationConsent} onChange={(event) => setEvaluationConsent(event.target.checked)} />
          <span>I allow this recording to be used to test and evaluate the Idoma speech-recognition model.</span>
        </label>
      </fieldset>

      <div className="voice-recorder-actions">
        {!recording ? (
          <button type="button" disabled={busy || !trainingConsent || !evaluationConsent} onClick={startRecording}>
            {busy ? 'Working…' : 'Start recording'}
          </button>
        ) : (
          <button type="button" onClick={stopRecording}>
            Stop recording · {seconds}s
          </button>
        )}
      </div>

      {recording && <p className="voice-status">Recording… speak naturally in your own Idoma words.</p>}
      {message && <div className="notice success">{message}</div>}
      {error && <div className="notice error">{error}</div>}
    </section>
  );
}
