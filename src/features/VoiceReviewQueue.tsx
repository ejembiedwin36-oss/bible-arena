import { useCallback, useEffect, useState } from 'react';
import { loadVoiceReviewQueue, type VoiceReviewQueueItem } from '../services/voiceReviewQueue';
import { VoiceReviewForm } from './VoiceReviewForm';

type Props = { languageCode?: string; role?: 'reviewer' | 'validator' };

export function VoiceReviewQueue({ languageCode, role = 'reviewer' }: Props) {
  const [items, setItems] = useState<VoiceReviewQueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await loadVoiceReviewQueue(languageCode, role);
      setItems(next);
      setSelectedId((current) => current && next.some((item) => item.id === current) ? current : next[0]?.id ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load review queue.');
    } finally {
      setLoading(false);
    }
  }, [languageCode, role]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  function handleCompleted(sampleId: string) {
    setItems((current) => {
      const next = current.filter((item) => item.id !== sampleId);
      setSelectedId(next[0]?.id ?? null);
      return next;
    });
    void loadQueue();
  }

  if (loading && items.length === 0) return <section className="card">Loading language review queue…</section>;
  if (error && items.length === 0) return <section className="card"><div className="notice error">{error}</div></section>;

  const selected = items.find((item) => item.id === selectedId);

  return (
    <section className="voice-review-queue" aria-labelledby="voice-review-queue-title">
      <div className="card">
        <span className="eyebrow">LANGUAGE REVIEW QUEUE</span>
        <h2 id="voice-review-queue-title">Assigned voice samples</h2>
        <p>Only samples for languages assigned to the signed-in {role} are returned by the database security policies.</p>
        {error && <div className="notice error">{error}</div>}
        {items.length === 0 ? <p>No samples are waiting for {role}.</p> : (
          <div className="voice-review-list">
            {items.map((item) => (
              <button key={item.id} type="button" className={item.id === selectedId ? 'voice-review-item active' : 'voice-review-item'} onClick={() => setSelectedId(item.id)}>
                <strong>{item.languageCode.toUpperCase()}</strong><span>{item.verificationStatus.replace('_', ' ')}</span><small>{item.durationMs ? `${Math.round(item.durationMs / 1000)}s` : 'duration unknown'}</small>
              </button>
            ))}
          </div>
        )}
      </div>
      {selected && <div className="card"><h3>Listen to sample</h3>{selected.audioUrl ? <audio controls preload="metadata" src={selected.audioUrl} /> : <div className="notice error">Audio preview could not be generated.</div>}<VoiceReviewForm sampleId={selected.id} role={role} initialTranscript={selected.nativeTranscript ?? ''} initialMeaning={selected.intendedMeaning ?? ''} initialIntentType={selected.intentType} onCompleted={handleCompleted} /></div>}
    </section>
  );
}
