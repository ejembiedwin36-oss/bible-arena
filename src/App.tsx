import { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import type { FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { ensureProfile } from './lib/userData';
import './features.css';
import { TopicSearch, TopicStudy } from './features/TopicSearch';
import { VerseStudy } from './features/VerseStudy';

type AuthMode = 'signin' | 'signup';
type Book = { id: string; canonical_key: string; name: string; abbreviation: string; testament: string; category: string; chapter_count: number };
type BookStudyData = Book & { traditional_author: string | null; authorship_status: string | null; historical_context: string | null; intended_audience: string | null; purpose: string | null; summary: string | null };
type Version = { id: string; name: string; abbreviation: string; language_id: string; language_code: string; language_name: string };
type ReaderVerse = { id: string; verse_number: number; text: string; is_jesus_words: boolean };
type ReaderState = { book: Book; chapter: number; chapterId: string; version: Version; verses: ReaderVerse[] };
type BookmarkRow = { id: string; verse_id: string | null; created_at: string; verse: ReaderVerse & { chapter: { id: string; chapter_number: number; book: { id: string; canonical_key: string; name: string; abbreviation: string } }; version: { id: string; name: string; abbreviation: string } } };

const navigation = [
  ['/', 'Home'], ['/bible', 'Bible'], ['/explore', 'Explore'], ['/explore/topics', 'Topics'], ['/devotion', 'Devotion'],
  ['/arena', 'Arena'], ['/notes', 'My Notes'], ['/bookmarks', 'Bookmarks'], ['/ask', 'Ask AI'],
  ['/progress', 'Progress'], ['/profile', 'Profile'], ['/settings', 'Settings'],
];
const primaryNavigation = navigation.slice(0, 4);
const personalNavigation = navigation.slice(4);

function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('signin'); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('');
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setMessage(null); setError(null); if (mode === 'signup') { const { data, error: e } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } }); if (e) setError(e.message); else if (!data.session) setMessage('Account created. Check your email to confirm your account, then sign in.'); } else { const { error: e } = await supabase.auth.signInWithPassword({ email, password }); if (e) setError(e.message); } setBusy(false); }
  return <main className="auth-page"><section className="auth-card card"><span className="eyebrow">BIBLE ARENA</span><h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1><p>{mode === 'signin' ? 'Sign in to keep your Scripture journey synced.' : 'Create an account to save bookmarks, notes, and reading progress.'}</p><form onSubmit={submit} className="auth-form">{mode === 'signup' && <input value={name} onChange={e => setName(e.target.value)} placeholder="Display name" required />}<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" minLength={6} required /><button disabled={busy}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button></form>{message && <div className="notice success">{message}</div>}{error && <div className="notice error">{error}</div>}<button className="text-button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setMessage(null); }}>{mode === 'signin' ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button></section></main>;
}

function Home() {
  const navigate = useNavigate();
  return <main className="home"><section className="hero card"><div><span className="eyebrow">BIBLE ARENA</span><h1>Read. Understand. Study. Grow.</h1><p>A calm, intelligent space to encounter Scripture, study deeply, and grow every day.</p><div className="actions"><button onClick={() => navigate('/bible')}>Open Bible</button><button className="secondary" onClick={() => navigate('/explore')}>Explore Study</button></div></div><div className="verse"><span>Today's Scripture</span><strong>“Your word is a lamp to my feet and a light to my path.”</strong><small>Psalm 119:105</small></div></section><section className="grid"><article className="card"><span className="label">Bible Catalogue</span><h2>66 books</h2><p>Browse the Old and New Testaments by book and chapter.</p><button className="text-button" onClick={() => navigate('/bible')}>Browse Bible →</button></article><article className="card"><span className="label">Study Hub</span><h2>Go deeper</h2><p>Explore books, study context, and build a stronger understanding of Scripture.</p><button className="text-button" onClick={() => navigate('/explore')}>Open Study Hub →</button><button className="text-button" onClick={() => navigate('/explore/topics')}>Browse Topics →</button></article><article className="card"><span className="label">Quick Actions</span><div className="quick"><button onClick={() => navigate('/bible')}>Read Bible</button><button onClick={() => navigate('/notes')}>Write a Note</button><button onClick={() => navigate('/bookmarks')}>View Bookmarks</button></div></article></section></main>;
}

function Explore() {
  const navigate = useNavigate(); const [books, setBooks] = useState<Book[]>([]); const [query, setQuery] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { supabase.from('bible_books').select('id, canonical_key, name, abbreviation, testament, category, chapter_count').order('id').then(({ data, error: e }) => { if (e) setError(e.message); setBooks(data ?? []); setLoading(false); }); }, []);
  const filtered = useMemo(() => books.filter(book => `${book.name} ${book.abbreviation} ${book.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12), [books, query]);
  return <main className="explore"><section className="explore-hero card"><div><span className="eyebrow">EXPLORE & STUDY</span><h1>Go deeper into Scripture.</h1><p>Start with a Bible book, understand its place in Scripture, then move into focused study tools.</p></div><input className="catalog-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search books or categories…" /></section><section className="study-grid"><button className="study-card card" onClick={() => navigate('/bible')}><span className="study-icon">📖</span><div><strong>Browse the Bible</strong><p>Read by book and chapter using the Scripture catalogue.</p></div></button><button className="study-card card" onClick={() => navigate('/notes')}><span className="study-icon">✍️</span><div><strong>Personal Study Notes</strong><p>Capture what you learn and keep your reflections with your account.</p></div></button><button className="study-card card" onClick={() => navigate('/bookmarks')}><span className="study-icon">🔖</span><div><strong>Saved Scriptures</strong><p>Return quickly to verses you have chosen to remember.</p></div></button></section><section className="card explore-books"><div className="catalog-title"><div><span className="eyebrow">BOOK STUDY</span><h2>Start with a book</h2></div><button className="text-button" onClick={() => navigate('/bible')}>View all →</button></div>{loading && <p>Loading study catalogue…</p>}{error && <p>{error}</p>}{!loading && !error && <div className="book-grid compact">{filtered.map(book => <button key={book.id} className="book-card" onClick={() => navigate(`/explore/book/${book.canonical_key}`)}><span>{book.abbreviation}</span><strong>{book.name}</strong><small>{book.chapter_count} chapters · {book.testament === 'old' ? 'Old Testament' : 'New Testament'}</small></button>)}</div>}{!loading && !error && filtered.length === 0 && <p>No books match your search.</p>}</section><section className="card study-note"><span className="eyebrow">STUDY FOUNDATION</span><h2>Study the Bible with context.</h2><p>Book background, topic Scripture mappings, verse study, and related Scripture will be built on verified data already stored in Bible Arena.</p></section></main>;
}

function BookStudy() {
  const { bookKey } = useParams(); const navigate = useNavigate(); const [book, setBook] = useState<BookStudyData | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!bookKey) return; let cancelled = false; supabase.from('bible_books').select('id, canonical_key, name, abbreviation, testament, category, chapter_count, traditional_author, authorship_status, historical_context, intended_audience, purpose, summary').eq('canonical_key', bookKey).maybeSingle().then(({ data, error: e }) => { if (cancelled) return; if (e || !data) setError(e?.message ?? 'Book study information was not found.'); else setBook(data); setLoading(false); }); return () => { cancelled = true; }; }, [bookKey]);
  if (loading) return <main className="book-study page-card"><p>Loading book study…</p></main>;
  if (error || !book) return <main className="book-study page-card"><h1>Book study unavailable</h1><p>{error ?? 'Book not found.'}</p><button onClick={() => navigate('/explore')}>Back to Explore</button></main>;
  const facts = [['Authorship', book.traditional_author], ['Authorship status', book.authorship_status], ['Historical context', book.historical_context], ['Intended audience', book.intended_audience], ['Purpose', book.purpose], ['Summary', book.summary]];
  return <main className="book-study"><section className="book-study-hero card"><div><button className="back-button" onClick={() => navigate('/explore')}>← Explore</button><span className="eyebrow">BOOK STUDY · {book.testament === 'old' ? 'OLD TESTAMENT' : 'NEW TESTAMENT'}</span><h1>{book.name}</h1><p>{book.category} · {book.chapter_count} chapters · {book.abbreviation}</p></div><button onClick={() => navigate(`/bible/${book.canonical_key}/1`)}>Read {book.name} →</button></section><section className="study-facts">{facts.map(([label, value]) => <article key={label} className="card study-fact"><span className="label">{label}</span><p>{value || 'No information has been added yet.'}</p></article>)}</section></main>;
}

function BibleCatalogue() {
  const navigate = useNavigate(); const [books, setBooks] = useState<Book[]>([]); const [query, setQuery] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { supabase.from('bible_books').select('id, canonical_key, name, abbreviation, testament, category, chapter_count').order('testament').order('id').then(({ data, error: e }) => { if (e) setError(e.message); setBooks(data ?? []); setLoading(false); }); }, []);
  const filtered = useMemo(() => books.filter(book => `${book.name} ${book.abbreviation}`.toLowerCase().includes(query.toLowerCase())), [books, query]);
  const old = filtered.filter(b => b.testament === 'old'); const newer = filtered.filter(b => b.testament === 'new');
  const group = (title: string, items: Book[]) => <section className="catalog-section"><div className="catalog-title"><div><span className="eyebrow">{title.toUpperCase()}</span><h2>{title}</h2></div><span>{items.length} books</span></div><div className="book-grid">{items.map(book => <div key={book.id} className="book-card-wrap"><button className="book-card" onClick={() => navigate(`/bible/${book.canonical_key}/1`)}><span>{book.abbreviation}</span><strong>{book.name}</strong><small>{book.chapter_count} chapters · {book.category}</small></button><button className="study-link" onClick={() => navigate(`/explore/book/${book.canonical_key}`)}>Study background →</button></div>)}</div></section>;
  return <main className="catalog"><section className="catalog-hero card"><div><span className="eyebrow">SCRIPTURE LIBRARY</span><h1>Choose a book</h1><p>Browse the Bible by testament, then choose a chapter to begin reading.</p></div><input className="catalog-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search books…" /></section>{loading && <section className="card catalog-message">Loading Bible catalogue…</section>}{error && <section className="card catalog-message"><h2>Unable to load catalogue</h2><p>{error}</p></section>}{!loading && !error && <>{group('Old Testament', old)}{group('New Testament', newer)}</>}</main>;
}

function BibleReader({ session }: { session: Session }) {
  const { bookKey, chapterNumber } = useParams(); const navigate = useNavigate(); const chapter = Number(chapterNumber ?? 1); const [reader, setReader] = useState<ReaderState | null>(null); const [versions, setVersions] = useState<Version[]>([]); const [languages, setLanguages] = useState<{ id: string; code: string; name: string }[]>([]); const [languageId, setLanguageId] = useState(''); const [versionId, setVersionId] = useState(''); const [selected, setSelected] = useState<string | null>(null); const [bookmarked, setBookmarked] = useState<string[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { (async () => { const [{ data: ls }, { data: vs }] = await Promise.all([supabase.from('languages').select('id, code, name').eq('is_active', true).order('name'), supabase.from('bible_versions').select('id, name, abbreviation, language_id, languages(code, name)').eq('is_active', true).order('name')]); const languageList = ls ?? []; const versionList = ((vs ?? []) as any[]).map(v => { const language = Array.isArray(v.languages) ? v.languages[0] : v.languages; return { id: v.id, name: v.name, abbreviation: v.abbreviation, language_id: v.language_id, language_code: language?.code ?? '', language_name: language?.name ?? '' }; }) as Version[]; setLanguages(languageList); setVersions(versionList); if (!languageId && versionList[0]) setLanguageId(versionList[0].language_id); })(); }, []);
  useEffect(() => { const available = versions.filter(v => v.language_id === languageId); if (available.length && !available.some(v => v.id === versionId)) setVersionId(available[0].id); else if (!available.length) setVersionId(''); }, [languageId, versions]);
  useEffect(() => { if (!bookKey || !versionId || !Number.isInteger(chapter) || chapter < 1) return; let cancelled = false; async function load() { setLoading(true); setError(null); const { data: book, error: be } = await supabase.from('bible_books').select('id, canonical_key, name, abbreviation, testament, category, chapter_count').eq('canonical_key', bookKey).maybeSingle(); if (be || !book) { setError(be?.message ?? 'Book not found.'); setLoading(false); return; } const { data: ch, error: ce } = await supabase.from('bible_chapters').select('id, chapter_number').eq('book_id', book.id).eq('chapter_number', chapter).maybeSingle(); if (ce || !ch) { setError(ce?.message ?? `Chapter ${chapter} is not available.`); setLoading(false); return; } const version = versions.find(v => v.id === versionId && v.language_id === languageId); if (!version) return; const { data: verses, error: ve } = await supabase.from('bible_verses').select('id, verse_number, text, is_jesus_words').eq('chapter_id', ch.id).eq('version_id', version.id).order('verse_number'); if (!cancelled) { if (ve) setError(ve.message); else setReader({ book, chapter: ch.chapter_number, chapterId: ch.id, version, verses: verses ?? [] }); setLoading(false); } } load(); return () => { cancelled = true; }; }, [bookKey, chapter, versionId, versions, languageId]);
  useEffect(() => { if (!reader) return; supabase.from('reading_history').insert({ user_id: session.user.id, chapter_id: reader.chapterId, version_id: reader.version.id }); supabase.from('bookmarks').select('verse_id').eq('user_id', session.user.id).not('verse_id', 'is', null).then(({ data }) => setBookmarked((data ?? []).map(row => row.verse_id).filter((id): id is string => Boolean(id)))); }, [reader, session.user.id]);
  async function toggleBookmark(verseId: string) { if (bookmarked.includes(verseId)) { const { error: e } = await supabase.from('bookmarks').delete().eq('user_id', session.user.id).eq('verse_id', verseId); if (!e) setBookmarked(current => current.filter(id => id !== verseId)); } else { const { error: e } = await supabase.from('bookmarks').insert({ user_id: session.user.id, verse_id: verseId }); if (!e) setBookmarked(current => [...current, verseId]); } }
  if (!bookKey) return <BibleCatalogue />;
  const canPrevious = reader ? chapter > 1 : false; const canNext = reader ? chapter < reader.book.chapter_count : false;
  return <main className="reader"><section className="reader-toolbar card"><div><button className="back-button" onClick={() => navigate('/bible')}>← Books</button><span className="eyebrow">BIBLE READER</span><h1>{reader?.book.name ?? 'Bible'}</h1></div><div className="reader-controls">{languages.length > 0 && <select value={languageId} onChange={e => setLanguageId(e.target.value)} aria-label="Bible language">{languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select>}{versions.filter(v => v.language_id === languageId).length > 0 ? <select value={versionId} onChange={e => setVersionId(e.target.value)} aria-label="Bible version">{versions.filter(v => v.language_id === languageId).map(v => <option key={v.id} value={v.id}>{v.name} ({v.abbreviation})</option>)}</select> : <span className="account-chip">No active version yet</span>}<span className="account-chip">Signed in</span></div></section><section className="chapter card">{loading && <p>Loading Scripture from Supabase…</p>}{!loading && error && <div><h2>Unable to load Scripture</h2><p>{error}</p><button onClick={() => navigate('/bible')}>Back to books</button></div>}{!loading && !error && reader && <><div className="chapter-heading"><div><span className="label">{reader.version.abbreviation}</span><h2>{reader.book.name} {reader.chapter}</h2></div><div className="chapter-nav"><button disabled={!canPrevious} onClick={() => navigate(`/bible/${reader.book.canonical_key}/${chapter - 1}`)}>← Previous</button><select value={chapter} onChange={e => navigate(`/bible/${reader.book.canonical_key}/${e.target.value}`)}>{Array.from({ length: reader.book.chapter_count }, (_, i) => <option key={i + 1} value={i + 1}>Chapter {i + 1}</option>)}</select><button disabled={!canNext} onClick={() => navigate(`/bible/${reader.book.canonical_key}/${chapter + 1}`)}>Next →</button></div></div>{reader.verses.length === 0 ? <div className="catalog-message"><h3>Text not loaded yet</h3><p>This chapter is already in the Bible catalogue, but its verse text has not been imported for this translation yet.</p></div> : <div className="verses">{reader.verses.map(item => <div key={item.id} className={`verse-row ${selected === item.id ? 'selected' : ''}`} onClick={() => setSelected(item.id)}><sup>{item.verse_number}</sup><p className={item.is_jesus_words ? 'jesus-words' : ''}>{item.text}</p><button className="bookmark" onClick={event => { event.stopPropagation(); toggleBookmark(item.id); }} aria-label={`Bookmark verse ${item.verse_number}`}>{bookmarked.includes(item.id) ? '★' : '☆'}</button></div>)}</div>}{selected && <div className="selection-bar"><span>{reader.book.name} {reader.chapter}:{reader.verses.find(v => v.id === selected)?.verse_number} selected <span>•</span> {reader.version.abbreviation}</span><button className="text-button" onClick={() => navigate(`/explore/verse/${selected}`)}>Study verse →</button></div>}</>}</section></main>;
}

function Bookmarks({ session }: { session: Session }) {
  const navigate = useNavigate(); const [items, setItems] = useState<BookmarkRow[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [removing, setRemoving] = useState<string | null>(null);
  async function loadBookmarks() { setLoading(true); setError(null); const { data, error: e } = await supabase.from('bookmarks').select('id, verse_id, created_at, bible_verses(id, verse_number, text, bible_chapters(id, chapter_number, bible_books(id, canonical_key, name, abbreviation)), bible_versions(id, name, abbreviation))').eq('user_id', session.user.id).not('verse_id', 'is', null).order('created_at', { ascending: false }); if (e) { setError(e.message); setItems([]); } else { const normalized = ((data ?? []) as unknown[]).map(row => { const item = row as any; const verse = item.bible_verses; const chapter = Array.isArray(verse?.bible_chapters) ? verse.bible_chapters[0] : verse?.bible_chapters; const book = Array.isArray(chapter?.bible_books) ? chapter.bible_books[0] : chapter?.bible_books; const version = Array.isArray(verse?.bible_versions) ? verse.bible_versions[0] : verse?.bible_versions; if (!verse || !chapter || !book || !version) return null; return { id: item.id, verse_id: item.verse_id, created_at: item.created_at, verse: { id: verse.id, verse_number: verse.verse_number, text: verse.text, chapter: { id: chapter.id, chapter_number: chapter.chapter_number, book: { id: book.id, canonical_key: book.canonical_key, name: book.name, abbreviation: book.abbreviation } }, version: { id: version.id, name: version.name, abbreviation: version.abbreviation } } } as BookmarkRow; }).filter((item): item is BookmarkRow => Boolean(item)); setItems(normalized); } setLoading(false); }
  useEffect(() => { loadBookmarks(); }, [session.user.id]);
  async function removeBookmark(id: string) { setRemoving(id); const { error: e } = await supabase.from('bookmarks').delete().eq('id', id).eq('user_id', session.user.id); if (e) setError(e.message); else setItems(current => current.filter(item => item.id !== id)); setRemoving(null); }
  return <main className="placeholder bookmarks-page card"><div className="page-heading"><div><span className="eyebrow">YOUR ARENA</span><h1>Bookmarks</h1><p>Keep the Scriptures you want to return to close at hand.</p></div><span className="count-chip">{items.length} saved</span></div>{loading && <p>Loading your saved Scriptures…</p>}{error && <div className="notice error">{error}</div>}{!loading && !error && items.length === 0 && <div className="empty-state"><strong>No bookmarks yet.</strong><p>Save a verse from the Bible Reader and it will appear here with its full reference.</p><button onClick={() => navigate('/bible')}>Open Bible →</button></div>}{!loading && items.length > 0 && <div className="saved-list">{items.map(item => <article key={item.id} className="bookmark-card"><div className="bookmark-main"><span className="label">{item.verse.version.abbreviation}</span><button className="reference-button" onClick={() => navigate(`/bible/${item.verse.chapter.book.canonical_key}/${item.verse.chapter.chapter_number}`)}>{item.verse.chapter.book.name} {item.verse.chapter.chapter_number}:{item.verse.verse_number}</button><p>“{item.verse.text}”</p></div><div className="bookmark-actions"><button onClick={() => navigate(`/bible/${item.verse.chapter.book.canonical_key}/${item.verse.chapter.chapter_number}`)}>Read →</button><button className="danger-button" disabled={removing === item.id} onClick={() => removeBookmark(item.id)}>{removing === item.id ? 'Removing…' : 'Remove'}</button></div></article>)}</div>}</main>;
}

function Notes({ session }: { session: Session }) {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [items, setItems] = useState<{ id: string; content: string; created_at: string; verse: { verse_number: number; text: string; chapter: { chapter_number: number; book: { canonical_key: string; name: string; abbreviation: string } } } | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error: e } = await supabase.from('user_notes')
      .select('id, content, created_at, bible_verses(verse_number, text, bible_chapters(chapter_number, bible_books(canonical_key, name, abbreviation)))')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (e) setError(e.message);
    const normalized = ((data ?? []) as any[]).map(item => {
      const rawVerse = Array.isArray(item.bible_verses) ? item.bible_verses[0] : item.bible_verses;
      const rawChapter = Array.isArray(rawVerse?.bible_chapters) ? rawVerse.bible_chapters[0] : rawVerse?.bible_chapters;
      const rawBook = Array.isArray(rawChapter?.bible_books) ? rawChapter.bible_books[0] : rawChapter?.bible_books;
      return {
        id: item.id,
        content: item.content,
        created_at: item.created_at,
        verse: rawVerse && rawChapter && rawBook ? {
          verse_number: rawVerse.verse_number,
          text: rawVerse.text,
          chapter: { chapter_number: rawChapter.chapter_number, book: rawBook }
        } : null
      };
    });
    setItems(normalized);
    setLoading(false);
  }

  useEffect(() => { load(); }, [session.user.id]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    setError(null);
    const { error: e } = await supabase.from('user_notes').insert({ user_id: session.user.id, content: text.trim() });
    if (e) setError(e.message);
    else { setText(''); await load(); }
    setSaving(false);
  }

  return <main className="placeholder card"><span className="eyebrow">YOUR ARENA</span><h1>My Notes</h1><p>Write down what Scripture is teaching you.</p>
    <form className="note-form" onSubmit={save}><textarea value={text} onChange={e => setText(e.target.value)} rows={5} placeholder="Write a reflection…" /><button disabled={saving}>{saving ? 'Saving…' : 'Save note'}</button></form>
    {error && <div className="notice error">{error}</div>}
    {loading ? <p>Loading notes…</p> : <div className="saved-list">{items.map(item => <article key={item.id} className="saved-item">
      <strong>{item.verse ? <button className="reference-button" onClick={() => navigate(`/bible/${item.verse!.chapter.book.canonical_key}/${item.verse!.chapter.chapter_number}`)}>{item.verse.chapter.book.name} {item.verse.chapter.chapter_number}:{item.verse.verse_number}</button> : 'Personal note'}</strong>
      {item.verse && <small>“{item.verse.text}”</small>}
      <p>{item.content}</p><time>{new Date(item.created_at).toLocaleString()}</time>
    </article>)}</div>}
  </main>;
}
function ReadingPlans() {
  const [plans, setPlans] = useState<{ id: string; name: string; description: string | null; duration_days: number | null; is_active: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('reading_plans').select('id, name, description, duration_days, is_active').eq('is_active', true).order('created_at')
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        setPlans(data ?? []);
        setLoading(false);
      });
  }, []);

  return <main className="reading-plans page-card">
    <div className="page-heading">
      <div><span className="eyebrow">YOUR ARENA</span><h1>Reading Plans</h1><p>Build a steady rhythm of Scripture reading, one plan at a time.</p></div>
      <span className="count-chip">{plans.length} published</span>
    </div>
    {loading && <p>Loading reading plans…</p>}
    {error && <div className="notice error">{error}</div>}
    {!loading && !error && plans.length === 0 && <div className="plan-empty">
      <span className="plan-icon">📖</span>
      <strong>Reading plans are ready for content.</strong>
      <p>No reading plans have been published yet. The foundation is connected to Supabase, so plans can be added without changing the reader.</p>
      <small>Daily chapter assignments will be added when plan content is published.</small>
    </div>}
    {!loading && !error && plans.length > 0 && <div className="plan-list">{plans.map(plan => <article key={plan.id} className="plan-card">
      <div><span className="label">{plan.duration_days ? `${plan.duration_days} days` : 'Flexible plan'}</span><h2>{plan.name}</h2><p>{plan.description || 'A Scripture reading journey.'}</p></div>
      <span className="count-chip">Coming next</span>
    </article>)}</div>}
  </main>;
}

function Placeholder({ title, description }: { title: string; description: string }) { return <main className="placeholder card"><span className="eyebrow">BIBLE ARENA</span><h1>{title}</h1><p>{description}</p><div className="study-note"><strong>This module is planned in the implementation roadmap.</strong><p>We are building the foundation first so future features can use real Bible data safely.</p></div></main>; }
function SidebarSection({ title, items }: { title: string; items: string[][] }) { return <div className="nav-section"><span className="nav-section-title">{title}</span>{items.map(([path, label]) => <NavLink key={path} to={path} end={path === '/'}>{label}</NavLink>)}</div>; }

function AppShell({ session }: { session: Session }) {
  const navigate = useNavigate(); const [displayName, setDisplayName] = useState(session.user.email?.split('@')[0] ?? 'Reader');
  useEffect(() => { ensureProfile(session).then(profile => { if (profile?.display_name) setDisplayName(profile.display_name); }); }, [session]);
  return <div className="app"><header className="topbar"><button className="brand" onClick={() => navigate('/')}><span className="brand-mark">BA</span><span>Bible Arena</span></button><div className="topbar-actions"><span className="account-name">{displayName}</span><button className="text-button" onClick={() => supabase.auth.signOut()}>Sign out</button></div></header><div className="layout"><aside className="sidebar"><SidebarSection title="Main" items={primaryNavigation} /><SidebarSection title="Your Arena" items={personalNavigation} /></aside><section className="content"><Routes><Route path="/" element={<Home />} /><Route path="/bible" element={<BibleCatalogue />} /><Route path="/bible/:bookKey/:chapterNumber" element={<BibleReader session={session} />} />
<Route path="/explore/verse/:verseId" element={<VerseStudy session={session} />} /><Route path="/explore" element={<Explore />} /><Route path="/explore/topics" element={<TopicSearch />} /><Route path="/explore/topic/:topicId" element={<TopicStudy />} /><Route path="/explore/book/:bookKey" element={<BookStudy />} /><Route path="/bookmarks" element={<Bookmarks session={session} />} /><Route path="/notes" element={<Notes session={session} />} /><Route path="/devotion" element={<Placeholder title="Today’s Devotion" description="Daily devotional content, completion tracking, and Scripture reflection will live here." />} /><Route path="/arena" element={<Placeholder title="Bible Arena" description="Challenges, questions, streaks, and friendly Scripture competition will live here." />} /><Route path="/ask" element={<Placeholder title="Ask AI" description="The Bible Assistant will be added after the Scripture study foundation is complete." />} /><Route path="/progress" element={<ReadingPlans />} /><Route path="/profile" element={<Placeholder title="Profile" description="Your Bible Arena profile and personal preferences will live here." />} /><Route path="/settings" element={<Placeholder title="Settings" description="Language, Bible version, appearance, notification, and account settings will live here." />} /><Route path="*" element={<Home />} /></Routes></section></div></div>;
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setSession(data.session)); const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next)); return () => listener.subscription.unsubscribe(); }, []);
  if (session === undefined) return <main className="auth-page"><section className="auth-card card"><p>Loading Bible Arena…</p></section></main>;
  return session ? <AppShell session={session} /> : <AuthScreen />;
}
