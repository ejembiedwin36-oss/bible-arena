import { useState } from 'react';
import { reviewVoiceEvaluationSample, type ReviewStatus } from '../services/voiceReview';

type Props = { sampleId: string };

export function VoiceReviewForm({ sampleId }: Props) {
  const [transcript, setTranscript] = useState('');
  const [meaning, setMeaning] = useState('');
  const [intentType, setIntentType] = useState('unknown');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(status: ReviewStatus) {
    if (!transcript.trim() || !meaning.trim()) {
      setError('Native transcript and intended meaning are required.');
      return;
    }
    try {
      setBusy(true);
      setError(null);
      setMessage(null);
      await reviewVoiceEvaluationSample({
        sampleId,
        nativeTranscript: transcript,
        intendedMeaning: meaning,
        intent: { type: intentType },
        status,
        reviewerNotes: notes,
      });
      setMessage(`Sample marked ${status.replace('_', ' ')}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save review.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card voice-review" aria-labelledby="voice-review-title">
      <span className="eyebrow">LANGUAGE REVIEW</span>
      <h2 id="voice-review-title">Review native speech</h2>
      <p>Listen to the recording first. Enter the exact words spoken in the original language, then record the intended meaning separately.</p>

      <label>Native transcript<textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} /></label>
      <label>Intended meaning<textarea value={meaning} onChange={(event) => setMeaning(event.target.value)} /></label>
      <label>Bible intent
        <select value={intentType} onChange={(event) => setIntentType(event.target.value)}>
          <option value="unknown">Unknown</option>
          <option value="open_book">Open book</option>
          <option value="open_book_chapter">Open book and chapter</option>
          <option value="open_verse">Open verse</option>
          <option value="search_scripture">Search Scripture</option>
          <option value="read_current">Read current passage</option>
          <option value="explain_current">Explain current passage</option>
          <option value="stop_reading">Stop reading</option>
        </select>
      </label>
      <label>Reviewer notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label>

      <div className="voice-review-actions">
        <button disabled={busy} type="button" onClick={() => submit('native_reviewed')}>Save native review</button>
        <button disabled={busy} type="button" onClick={() => submit('validated')}>Validate sample</button>
        <button disabled={busy} type="button" onClick={() => submit('rejected')}>Reject sample</button>
      </div>

      {message && <div className="notice success">{message}</div>}
      {error && <div className="notice error">{error}</div>}
    </section>
  );
}
