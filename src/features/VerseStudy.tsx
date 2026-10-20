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
type RelatedVerse = { id: string; verse_number: number; text: string; chapter_number: number; book_key: string; book_name: string; version_abbreviation: string };
type ContextVerse = { id: string; verse_number: number; text: string; is_jesus_words: boolean };

export function VerseStudy({ session }: { session: Session }) {
  const { verseId } = useParams();
  const navigate = useNavigate();
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [related, setRelated] = useState<RelatedVerse[]>([]);
  const [contextVerses, setContextVerses] = useState<ContextVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!verseId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setActionMessage(null);
      setNoteId(null);
      setNote('');
      const { data: v, error: ve } = await supabase
        .from('bible_verses')
        .select('id, verse_number, text, is_jesus_words, bible_chapters(id, chapter_number, bible_books(canonical_key, name, abbreviation)), bible_versions(id, name, abbreviation)')
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

      if (!chapter || !book || !version?.id) {
        setError('Verse context is incomplete.');
        setLoading(false);
        return;
      }

      const { data: chapterRows, error: chapterError } = await supabase
        .from('bible_verses')
        .select('id, verse_number, text, is_jesus_words')
        .eq('chapter_id', chapter.id)
        .eq('version_id', version.id)
        .order('verse_number', { ascending: true });
      if (cancelled) return;
      if (chapterError) {
        setError(chapterError.message);
        setLoading(false);
        return;
      }
      setContextVerses((chapterRows ?? []) as ContextVerse[]);

      const [{ data: existingBookmark }, { data: existingNotes, error: noteError }] = await Promise.all([
        supabase.from('bookmarks').select('id').eq('user_id', session.user.id).eq('verse_id', verseId).maybeSingle(),
        supabase.from('user_notes').select('id, content').eq('user_id', session.user.id).eq('verse_id', verseId).order('created_at', { ascending: false }).limit(1),
      ]);
      if (cancelled) return;
      setBookmarked(Boolean(existingBookmark));
      if (noteError) {
        setError(noteError.message);
        setLoading(false);
        return;
      }
      const existingNote = existingNotes?.[0];
      setNoteId(existingNote?.id ?? null);
      setNote(existingNote?.content ?? '');

      const { data: mappings, error: te } = await supabase
        .from('topic_scriptures')
        .select('topics(id, name, description)')
        .eq('verse_id', verseId);

      if (cancelled) return;
      if (te) setError(te.message);
      const connectedTopics = ((mappings ?? []) as any[])
        .map(row => Array.isArray(row.topics) ? row.topics[0] : row.topics)
        .filter(Boolean) as Topic[];

      const topicIds = connectedTopics.map(topic => topic.id);
      if (topicIds.length) {
        const { data: relatedMappings } = await supabase
          .from('topic_scriptures')
          .select('verse_id, topics!inner(id), bible_verses!inner(id, verse_number, text, bible_chapters!inner(chapter_number, bible_books!inner(canonical_key, name)), bible_versions!inner(abbreviation))')
          .in('topic_id', topicIds)
          .neq('verse_id', verseId)
          .limit(8);
        const seen = new Set<string>();
        const relatedVerses = ((relatedMappings ?? []) as any[]).map(row => {
          const rv = Array.isArray(row.bible_verses) ? row.bible_verses[0] : row.bible_verses;
          const rc = Array.isArray(rv?.bible_chapters) ? rv.bible_chapters[0] : rv?.bible_chapters;
          const rb = Array.isArray(rc?.bible_books) ? rc.bible_books[0] : rc?.bible_books;
          const ver = Array.isArray(rv?.bible_versions) ? rv.bible_versions[0] : rv?.bible_versions;
          if (!rv || !rc || !rb || !ver || seen.has(rv.id)) return null;
          seen.add(rv.id);
          return { id: rv.id, verse_number: rv.verse_number, text: rv.text, chapter_number: rc.chapter_number, book_key: rb.canonical_key, book_name: rb.name, version_abbreviation: ver.abbreviation };
        }).filter(Boolean) as RelatedVerse[];
        setRelated(relatedVerses);
      } else {
        setRelated([]);
      }

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
  }, [verseId, session.user.id]);

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
        <h2>Where this verse sits</h2>
        <p>{verse.chapter.book.name} chapter {verse.chapter.chapter_number} · {verse.version.name}</p>
        {contextVerses.length ? <div className="verse-context-list">{contextVerses.map(item => <button key={item.id} className={item.id === verse.id ? 'active' : ''} onClick={() => item.id === verse.id ? undefined : navigate(`/explore/verse/${item.id}`)}><strong>{item.verse_number}</strong><span className={item.is_jesus_words ? 'jesus-words' : ''}>{item.text}</span></button>)}</div> : <p>The surrounding chapter text is not loaded yet for this translation.</p>}
        <button className="text-button" onClick={() => navigate(`/bible/${verse.chapter.book.canonical_key}/${verse.chapter.chapter_number}`)}>Read the complete chapter →</button>
      </article>

      <article className="card study-panel">
        <span className="label">Connected topics</span>
        <h2>{topics.length ? `${topics.length} topic${topics.length === 1 ? '' : 's'}` : 'No mapped topics yet'}</h2>
        {topics.length ? <div className="topic-pills">{topics.map(topic => <button key={topic.id} onClick={() => navigate(`/explore/topic/${topic.id}`)}>{topic.name}</button>)}</div> : <p>This verse has not yet been mapped to a verified study topic. More topic mappings can be added without changing the Bible reader.</p>}
      </article>

      <article className="card study-panel">
        <span className="label">Related Scriptures</span>
        <h2>{related.length ? 'Explore connected verses' : 'No related Scriptures yet'}</h2>
        {related.length ? <div className="related-scriptures">{related.map(item => <button key={item.id} onClick={() => navigate(`/explore/verse/${item.id}`)}><strong>{item.book_name} {item.chapter_number}:{item.verse_number}</strong><small>{item.version_abbreviation} · {item.text}</small></button>)}</div> : <p>Related Scriptures will appear here when verified topic mappings connect this verse to other passages.</p>}
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
        <h2>{noteId ? 'Your note for this verse' : 'Write a note for this verse'}</h2>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={5} placeholder="What is this verse teaching you?" />
        <div className="study-actions">
          <button disabled={noteSaving || !note.trim()} onClick={async () => {
            setNoteSaving(true); setActionMessage(null);
            if (noteId) {
              const { error: e } = await supabase.from('user_notes').update({ content: note.trim() }).eq('id', noteId).eq('user_id', session.user.id);
              if (e) setActionMessage(e.message); else setActionMessage('Your verse note was updated.');
            } else {
              const { data, error: e } = await supabase.from('user_notes').insert({ user_id: session.user.id, content: note.trim(), verse_id: verse.id, chapter_id: verse.chapter.id }).select('id').single();
              if (e) setActionMessage(e.message); else { setNoteId(data.id); setActionMessage('Your note was saved with this verse.'); }
            }
            setNoteSaving(false);
          }}>{noteSaving ? 'Saving…' : noteId ? 'Update verse note' : 'Save verse note'}</button>
          <button type="button" onClick={() => navigate('/notes')}>View all notes</button>
        </div>
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