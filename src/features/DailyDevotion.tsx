import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type DevotionVerse = {
  id: string;
  verse_number: number;
  text: string;
  chapter: {
    chapter_number: number;
    book: { canonical_key: string; name: string };
  };
};

type Devotion = {
  id: string;
  title: string;
  body: string;
  reflection_question: string | null;
  prayer: string | null;
  verses: DevotionVerse[];
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DailyDevotion({ session }: { session: Session }) {
  const navigate = useNavigate();
  const [devotion, setDevotion] = useState<Devotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setCompleted(false);
      const today = localDateKey();
      const { data, error: devotionError } = await supabase
        .from('devotions')
        .select('id,title,message,reflection_question,prayer,devotion_scriptures(bible_verses(id,verse_number,text,bible_chapters(chapter_number,bible_books(canonical_key,name))))')
        .eq('published_on', today)
        .maybeSingle();
      if (cancelled) return;
      if (devotionError) {
        console.error('Unable to load daily devotion', devotionError);
        setError('Today’s devotion could not be loaded right now.');
        setLoading(false);
        return;
      }
      if (!data) {
        setDevotion(null);
        setLoading(false);
        return;
      }

      const raw = data as any;
      const links = Array.isArray(raw.devotion_scriptures) ? raw.devotion_scriptures : [];
      const verses: DevotionVerse[] = links.flatMap((link: any) => {
        const rawVerse = Array.isArray(link?.bible_verses) ? link.bible_verses[0] : link?.bible_verses;
        const rawChapter = Array.isArray(rawVerse?.bible_chapters) ? rawVerse.bible_chapters[0] : rawVerse?.bible_chapters;
        const rawBook = Array.isArray(rawChapter?.bible_books) ? rawChapter.bible_books[0] : rawChapter?.bible_books;
        if (!rawVerse || !rawChapter || !rawBook) return [];
        return [{
          id: rawVerse.id,
          verse_number: rawVerse.verse_number,
          text: rawVerse.text,
          chapter: {
            chapter_number: rawChapter.chapter_number,
            book: { canonical_key: rawBook.canonical_key, name: rawBook.name },
          },
        }];
      });

      setDevotion({
        id: raw.id,
        title: raw.title,
        body: raw.message,
        reflection_question: raw.reflection_question ?? null,
        prayer: raw.prayer ?? null,
        verses,
      });

      const { data: completion, error: completionError } = await supabase
        .from('devotion_completions')
        .select('devotion_id')
        .eq('user_id', session.user.id)
        .eq('devotion_id', raw.id)
        .maybeSingle();
      if (cancelled) return;
      if (completionError) console.error('Unable to load devotion completion', completionError);
      setCompleted(Boolean(completion));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [session.user.id]);

  async function markComplete() {
    if (!devotion || completed) return;
    setError(null);
    const { error: completionError } = await supabase
      .from('devotion_completions')
      .insert({ user_id: session.user.id, devotion_id: devotion.id });
    if (completionError) {
      console.error('Unable to save devotion completion', completionError);
      setError('Your completion could not be saved right now. Please try again.');
    } else {
      setCompleted(true);
    }
  }

  if (loading) return <main className="placeholder card"><p>Loading today’s devotion…</p></main>;
  if (error && !devotion) return <main className="placeholder card"><span className="eyebrow">DAILY DEVOTION</span><h1>Devotion unavailable</h1><p>{error}</p><p>Your Bible Reader and study tools are still available.</p><button onClick={() => navigate('/bible')}>Open Bible →</button></main>;
  if (!devotion) return <main className="placeholder card"><span className="eyebrow">DAILY DEVOTION</span><h1>Today’s devotion is not published yet.</h1><p>When a verified devotion is published for today, it will appear here. We do not generate placeholder Scripture or devotional content.</p><button onClick={() => navigate('/bible')}>Read the Bible →</button></main>;

  return <main className="topic-study">
    <section className="topic-study-hero card">
      <span className="eyebrow">DAILY DEVOTION</span>
      <h1>{devotion.title}</h1>
      <p>{devotion.body}</p>
      {completed && <span className="count-chip">Completed ✓</span>}
      {error && <div className="notice error">{error}</div>}
    </section>
    {devotion.verses.map((verse) => <section className="card" key={verse.id}>
      <span className="label">TODAY’S SCRIPTURE</span>
      <button className="reference-button" onClick={() => navigate(`/explore/verse/${verse.id}`)}>{verse.chapter.book.name} {verse.chapter.chapter_number}:{verse.verse_number}</button>
      <p>“{verse.text}”</p>
      <div className="bookmark-actions"><button onClick={() => navigate(`/explore/verse/${verse.id}`)}>Study verse →</button><button onClick={() => navigate(`/bible/${verse.chapter.book.canonical_key}/${verse.chapter.chapter_number}`)}>Read chapter →</button></div>
    </section>)}
    {devotion.reflection_question && <section className="card"><span className="label">REFLECT</span><h2>Think about this</h2><p>{devotion.reflection_question}</p></section>}
    {devotion.prayer && <section className="card"><span className="label">PRAYER</span><h2>Pray</h2><p>{devotion.prayer}</p></section>}
    <section className="card"><button className="plan-complete" disabled={completed} onClick={markComplete}>{completed ? 'Completed ✓' : 'Mark today’s devotion complete'}</button></section>
  </main>;
}
