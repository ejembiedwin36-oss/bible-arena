import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

type ReaderVerse = { id: string; verse_number: number; text: string };

type ReaderState = {
  book: string;
  chapter: number;
  translation: string;
  verses: ReaderVerse[];
};

const navigation = [
  ['/', 'Home'], ['/bible', 'Bible'], ['/explore', 'Explore'], ['/devotion', 'Devotion'],
  ['/arena', 'Arena'], ['/notes', 'My Notes'], ['/bookmarks', 'Bookmarks'], ['/ask', 'Ask AI'],
  ['/progress', 'Progress'], ['/profile', 'Profile'], ['/settings', 'Settings'],
];

function Home() {
  const navigate = useNavigate();
  return <main className="home">
    <section className="hero card">
      <div><span className="eyebrow">BIBLE ARENA</span><h1>Read. Understand. Study. Grow.</h1><p>A calm, intelligent space to encounter Scripture, study deeply, and grow every day.</p><div className="actions"><button onClick={() => navigate('/bible')}>Continue Reading</button><button className="secondary" onClick={() => navigate('/devotion')}>Today's Devotion</button></div></div>
      <div className="verse"><span>Today's Scripture</span><strong>“Your word is a lamp to my feet and a light to my path.”</strong><small>Psalm 119:105</small></div>
    </section>
    <section className="grid">
      <article className="card"><span className="label">Continue Reading</span><h2>Luke 1</h2><p>Pick up where you left off.</p><div className="progress"><i /></div><small>35% complete</small></article>
      <article className="card"><span className="label">Daily Progress</span><h2>3 day streak 🔥</h2><p>Keep your rhythm going.</p><div className="stat">12 chapters this week</div></article>
      <article className="card"><span className="label">Quick Actions</span><div className="quick"><button onClick={() => navigate('/bible')}>Read Bible</button><button onClick={() => navigate('/bible')}>Study a Verse</button><button onClick={() => navigate('/arena')}>Start a Challenge</button></div></article>
    </section>
  </main>;
}

function BibleReader() {
  const [reader, setReader] = useState<ReaderState | null>(null);
  const [translation, setTranslation] = useState('KJV');
  const [selected, setSelected] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadChapter() {
      setLoading(true);
      setError(null);

      const { data: version, error: versionError } = await supabase
        .from('bible_versions')
        .select('id, name, abbreviation')
        .eq('abbreviation', translation)
        .eq('is_active', true)
        .maybeSingle();

      if (versionError || !version) {
        if (!cancelled) setError(versionError?.message ?? `Translation ${translation} is not available.`);
        setLoading(false);
        return;
      }

      const { data: book, error: bookError } = await supabase
        .from('bible_books')
        .select('id, name, chapter_count')
        .eq('canonical_key', 'luke')
        .maybeSingle();

      if (bookError || !book) {
        if (!cancelled) setError(bookError?.message ?? 'Luke was not found in the Bible catalogue.');
        setLoading(false);
        return;
      }

      const { data: chapter, error: chapterError } = await supabase
        .from('bible_chapters')
        .select('id, chapter_number')
        .eq('book_id', book.id)
        .eq('chapter_number', 1)
        .maybeSingle();

      if (chapterError || !chapter) {
        if (!cancelled) setError(chapterError?.message ?? 'Luke 1 was not found.');
        setLoading(false);
        return;
      }

      const { data: verses, error: versesError } = await supabase
        .from('bible_verses')
        .select('id, verse_number, text')
        .eq('chapter_id', chapter.id)
        .eq('version_id', version.id)
        .order('verse_number');

      if (versesError) {
        if (!cancelled) setError(versesError.message);
        setLoading(false);
        return;
      }

      if (!cancelled) {
        setReader({ book: book.name, chapter: chapter.chapter_number, translation: version.abbreviation, verses: verses ?? [] });
      }
      setLoading(false);
    }

    loadChapter();
    return () => { cancelled = true; };
  }, [translation]);

  const toggleBookmark = (verseId: string) => setBookmarked((current) => current.includes(verseId) ? current.filter((id) => id !== verseId) : [...current, verseId]);

  return <main className="reader">
    <section className="reader-toolbar card">
      <div><span className="eyebrow">BIBLE READER</span><h1>{reader ? `${reader.book} ${reader.chapter}` : 'Luke 1'}</h1></div>
      <label>Translation <select value={translation} onChange={(e) => { setTranslation(e.target.value); setSelected(null); }}><option>KJV</option></select></label>
    </section>
    <section className="chapter card">
      {loading && <p>Loading Scripture from Supabase…</p>}
      {!loading && error && <div><h2>Unable to load Scripture</h2><p>{error}</p></div>}
      {!loading && !error && reader && <>
        <div className="chapter-heading"><div><span className="label">{reader.translation}</span><h2>{reader.book} {reader.chapter}</h2></div><div className="chapter-nav"><button className="secondary" disabled>‹</button><button className="secondary" disabled>›</button></div></div>
        <div className="verses">{reader.verses.map((item) => <div key={item.id} className={`verse-row ${selected === item.id ? 'selected' : ''}`} onClick={() => setSelected(item.id)}><sup>{item.verse_number}</sup><p>{item.text}</p><button className="bookmark" onClick={(event) => { event.stopPropagation(); toggleBookmark(item.id); }} aria-label={`Bookmark verse ${item.verse_number}`}>{bookmarked.includes(item.id) ? '★' : '☆'}</button></div>)}</div>
        {selected && <div className="selection-bar">{reader.book} {reader.chapter}:{reader.verses.find((verse) => verse.id === selected)?.verse_number} selected <span>•</span> {bookmarked.includes(selected) ? 'Bookmarked locally' : 'Tap ☆ to bookmark'}</div>}
      </>}
    </section>
  </main>;
}

function Placeholder({ title }: { title: string }) { return <main className="placeholder card"><span className="eyebrow">BIBLE ARENA</span><h1>{title}</h1><p>This area is prepared for the next implementation phase.</p></main>; }

export default function App() {
  return <div className="app-shell">
    <header className="topbar"><div className="brand"><div className="brand-mark">BA</div><div><strong>Bible Arena</strong><span>Read · Study · Grow</span></div></div><button className="profile">E</button></header>
    <div className="layout">
      <aside className="sidebar">{navigation.map(([to, label]) => <NavLink key={label} to={to} end={label === 'Home'}>{label}</NavLink>)}</aside>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bible" element={<BibleReader />} />
        {navigation.slice(2).map(([to, label]) => <Route key={label} path={to} element={<Placeholder title={label} />} />)}
      </Routes>
    </div>
  </div>;
}
