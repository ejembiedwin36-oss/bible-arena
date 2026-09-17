import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type VerseData = {
  id: string;
  verse_number: number;
  text: string;
  is_jesus_words: boolean;
  chapter: { id: string; chapter_number: number; book: { canonical_key: string; name: string; abbreviation: string } };
  version: { name: string; abbreviation: string };
};

type Topic = { id: string; name: string; description: string | null };

export function VerseStudy({ session }: { session: Session }) {
  const { verseId } = useParams();
  const navigate = useNavigate();
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [note, setNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!verseId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const { data: v, error: ve } = await supabase
        .from('bible_verses')
        .select('id, verse_number, text, is_jesus_words, bible_chapters(id, chapter_number, bible_books(canonical_key, name, abbreviation)), bible_versions(name, abbreviation)')
        .eq('id', verseId)
        .maybeSingle();

      if (cancelled) return;
      if (ve || !v) {
        setError(ve?.message ?? 'Verse not found.');
        setLoading(false);
        return;
      }

      const raw = v as any;
      const chapter = Array.isArray(raw.bible_chapters) ? raw.bible_chapters[0] : raw.bible_chapters;
      const book = Array.isArray(chapter?.bible_books) ? chapter.bible_books[0] : chapter?.bible_books;
      const version = Array.isArray(raw.bible_versions) ? raw.bible_versions[0] : raw.bible_versions;

      if (!chapter || !book || !version) {
        setError('Verse context is incomplete.');
        setLoading(false);
        return;
      }


      const { data: existingBookmark } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('verse_id', verseId)
        .maybeSingle();
      if (cancelled) return;
      setBookmarked(Boolean(existingBookmark));

      const { data: mappings, error: te } = await supabase
        .from('topic_scriptures')
        .select('topics(id, name, description)')
        .eq('verse_id', verseId);

      if (cancelled) return;
      if (te) setError(te.message);
      const connectedTopics = ((mappings ?? []) as any[])
        .map(row => Array.isArray(row.topics) ? row.topics[0] : row.topics)
        .filter(Boolean) as Topic[];

      setVerse({
        id: raw.id,
        verse_number: raw.verse_number,
        text: raw.text,
        is_jesus_words: raw.is_jesus_words,
        chapter: {
          id: chapter.id,
          chapter_number: chapter.chapter_number,
          book: {
            canonical_key: book.canonical_key,
            name: book.name,
            abbreviation: book.abbreviation
          }
        },
        version: { name: version.name, abbreviation: version.abbreviation }
      });
      setTopics(connectedTopics);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [verseId]);

  if (loading) return <main className="verse-study page-card"><p>Loading verse study…</p></main>;

  if (error || !verse) {
    return <main className="verse-study page-card">
      <h1>Verse study unavailable</h1>
      <p>{error ?? 'Verse not found.'}</p>
      <button onClick={() => navigate('/bible')}>Back to Bible</button>
    </main>;
  }

  const reference = `${verse.chapter.book.name} ${verse.chapter.chapter_number}:${verse.verse_number}`;

  return <main className="verse-study">
    <section className="verse-study-hero card">
      <button className="back-button" onClick={() => navigate(`/bible/${verse.chapter.book.canonical_key}/${verse.chapter.chapter_number}`)}>← Chapter</button>
      <span className="eyebrow">VERSE STUDY · {verse.version.abbreviation}</span>
      <h1>{reference}</h1>
      <p className={verse.is_jesus_words ? 'study-quote jesus-words' : 'study-quote'}>“{verse.text}”</p>
    </section>

    <section className="verse-study-grid">
      <article className="card study-panel">
        <span className="label">Scripture context</span>
        <h2>{verse.chapter.book.name} {verse.chapter.chapter_number}</h2>
        <p>This verse belongs to {verse.chapter.book.name} chapter {verse.chapter.chapter_number} in the {verse.version.name} translation.</p>
        <button className="text-button" onClick={() => navigate(`/bible/${verse.chapter.book.canonical_key}/${verse.chapter.chapter_number}`)}>Read the chapter →</button>
      </article>

      <article className="card study-panel">
        <span className="label">Connected topics</span>
        <h2>{topics.length ? `${topics.length} topic${topics.length === 1 ? '' : 's'}` : 'No mapped topics yet'}</h2>
        {topics.length ? <div className="topic-pills">{topics.map(topic => <button key={topic.id} onClick={() => navigate(`/explore/topic/${topic.id}`)}>{topic.name}</button>)}</div> : <p>This verse has not yet been mapped to a verified study topic. More topic mappings can be added without changing the Bible reader.</p>}
      </article>

      <article className="card study-panel">
        <span className="label">Study actions</span>
        <h2>Keep exploring</h2>
        <div className="study-actions">
          <button onClick={async () => {
            setActionMessage(null);
            if (bookmarked) {
              const { error: e } = await supabase.from('bookmarks').delete().eq('user_id', session.user.id).eq('verse_id', verse.id);
              if (e) setActionMessage(e.message); else { setBookmarked(false); setActionMessage('Verse removed from bookmarks.'); }
            } else {
              const { error: e } = await supabase.from('bookmarks').insert({ user_id: session.user.id, verse_id: verse.id });
              if (e) setActionMessage(e.message); else { setBookmarked(true); setActionMessage('Verse saved to bookmarks.'); }
            }
          }}>{bookmarked ? '★ Bookmarked' : '☆ Bookmark verse'}</button>
          <button onClick={() => navigate('/bookmarks')}>View bookmarks</button>
          <button onClick={() => navigate('/explore/topics')}>Explore topics</button>
        </div>
        {actionMessage && <p>{actionMessage}</p>}
      </article>
      <article className="card study-panel">
        <span className="label">Personal reflection</span>
        <h2>Write a note for this verse</h2>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={5} placeholder="What is this verse teaching you?" />
        <button disabled={noteSaving || !note.trim()} onClick={async () => {
          setNoteSaving(true); setActionMessage(null);
          const { error: e } = await supabase.from('user_notes').insert({ user_id: session.user.id, content: note.trim(), verse_id: verse.id, chapter_id: verse.chapter.id });
          if (e) setActionMessage(e.message); else { setNote(''); setActionMessage('Your note was saved with this verse.'); }
          setNoteSaving(false);
        }}>{noteSaving ? 'Saving…' : 'Save verse note'}</button>
      </article>

      <article className="card study-panel">
        <span className="label">AI foundation</span>
        <h2>Ask about this verse</h2>
        <p>The future Bible Assistant will use this verse, its context, verified topic mappings, and licensed Scripture data to build a grounded study response.</p>
        <button className="text-button" onClick={() => navigate('/ask')}>Open Bible Assistant →</button>
      </article>
    </section>
  </main>;
}
