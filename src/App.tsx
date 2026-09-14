import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { ensureProfile } from './lib/userData';

type ReaderVerse = { id: string; verse_number: number; text: string };
type ReaderState = { book: string; chapter: number; chapterId: string; versionId: string; translation: string; verses: ReaderVerse[] };
type AuthMode = 'signin' | 'signup';

const navigation = [
  ['/', 'Home'], ['/bible', 'Bible'], ['/explore', 'Explore'], ['/devotion', 'Devotion'],
  ['/arena', 'Arena'], ['/notes', 'My Notes'], ['/bookmarks', 'Bookmarks'], ['/ask', 'Ask AI'],
  ['/progress', 'Progress'], ['/profile', 'Profile'], ['/settings', 'Settings'],
];

function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('');
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(null); setError(null);
    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } });
      if (signUpError) setError(signUpError.message);
      else if (!data.session) setMessage('Account created. Check your email to confirm your account, then sign in.');
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
    }
    setBusy(false);
  }
  return <main className="auth-page"><section className="auth-card card">
    <span className="eyebrow">BIBLE ARENA</span><h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
    <p>{mode === 'signin' ? 'Sign in to keep your Scripture journey synced.' : 'Create an account to save bookmarks, notes, and reading progress.'}</p>
    <form onSubmit={submit} className="auth-form">
      {mode === 'signup' && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" required />}
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" minLength={6} required />
      <button disabled={busy}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
    </form>
    {message && <div className="notice success">{message}</div>}{error && <div className="notice error">{error}</div>}
    <button className="text-button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setMessage(null); }}>{mode === 'signin' ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button>
  </section></main>;
}

function Home() {
  const navigate = useNavigate();
  return <main className="home"><section className="hero card"><div><span className="eyebrow">BIBLE ARENA</span><h1>Read. Understand. Study. Grow.</h1><p>A calm, intelligent space to encounter Scripture, study deeply, and grow every day.</p><div className="actions"><button onClick={() => navigate('/bible')}>Continue Reading</button><button className="secondary" onClick={() => navigate('/devotion')}>Today's Devotion</button></div></div><div className="verse"><span>Today's Scripture</span><strong>“Your word is a lamp to my feet and a light to my path.”</strong><small>Psalm 119:105</small></div></section>
    <section className="grid"><article className="card"><span className="label">Continue Reading</span><h2>Luke 1</h2><p>Your reading journey is now connected to your account.</p></article><article className="card"><span className="label">Daily Progress</span><h2>Keep growing 🔥</h2><p>Your reading history will be saved securely.</p></article><article className="card"><span className="label">Quick Actions</span><div className="quick"><button onClick={() => navigate('/bible')}>Read Bible</button><button onClick={() => navigate('/notes')}>Write a Note</button><button onClick={() => navigate('/bookmarks')}>View Bookmarks</button></div></article></section>
  </main>;
}

function BibleReader({ session }: { session: Session }) {
  const [reader, setReader] = useState<ReaderState | null>(null); const [selected, setSelected] = useState<string | null>(null); const [bookmarked, setBookmarked] = useState<string[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function loadChapter() {
      setLoading(true); setError(null);
      const { data: version, error: versionError } = await supabase.from('bible_versions').select('id, abbreviation').eq('abbreviation', 'KJV').eq('is_active', true).maybeSingle();
      if (versionError || !version) { if (!cancelled) setError(versionError?.message ?? 'KJV is not available.'); setLoading(false); return; }
      const { data: book, error: bookError } = await supabase.from('bible_books').select('id, name').eq('canonical_key', 'luke').maybeSingle();
      if (bookError || !book) { if (!cancelled) setError(bookError?.message ?? 'Luke was not found.'); setLoading(false); return; }
      const { data: chapter, error: chapterError } = await supabase.from('bible_chapters').select('id, chapter_number').eq('book_id', book.id).eq('chapter_number', 1).maybeSingle();
      if (chapterError || !chapter) { if (!cancelled) setError(chapterError?.message ?? 'Luke 1 was not found.'); setLoading(false); return; }
      const { data: verses, error: versesError } = await supabase.from('bible_verses').select('id, verse_number, text').eq('chapter_id', chapter.id).eq('version_id', version.id).order('verse_number');
      if (versesError) { if (!cancelled) setError(versesError.message); setLoading(false); return; }
      if (!cancelled) setReader({ book: book.name, chapter: chapter.chapter_number, chapterId: chapter.id, versionId: version.id, translation: version.abbreviation, verses: verses ?? [] });
      setLoading(false);
    }
    loadChapter(); return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!reader) return;
    supabase.from('reading_history').insert({ user_id: session.user.id, chapter_id: reader.chapterId, version_id: reader.versionId });
    supabase.from('bookmarks').select('verse_id').eq('user_id', session.user.id).not('verse_id', 'is', null).then(({ data }) => setBookmarked((data ?? []).map((row) => row.verse_id).filter((id): id is string => Boolean(id))));
  }, [reader, session.user.id]);
  async function toggleBookmark(verseId: string) {
    if (bookmarked.includes(verseId)) { const { error } = await supabase.from('bookmarks').delete().eq('user_id', session.user.id).eq('verse_id', verseId); if (!error) setBookmarked((current) => current.filter((id) => id !== verseId)); }
    else { const { error } = await supabase.from('bookmarks').insert({ user_id: session.user.id, verse_id: verseId }); if (!error) setBookmarked((current) => [...current, verseId]); }
  }
  return <main className="reader"><section className="reader-toolbar card"><div><span className="eyebrow">BIBLE READER</span><h1>{reader ? `${reader.book} ${reader.chapter}` : 'Luke 1'}</h1></div><span className="account-chip">Signed in</span></section><section className="chapter card">
    {loading && <p>Loading Scripture from Supabase…</p>}{!loading && error && <div><h2>Unable to load Scripture</h2><p>{error}</p></div>}{!loading && !error && reader && <><div className="chapter-heading"><div><span className="label">{reader.translation}</span><h2>{reader.book} {reader.chapter}</h2></div></div><div className="verses">{reader.verses.map((item) => <div key={item.id} className={`verse-row ${selected === item.id ? 'selected' : ''}`} onClick={() => setSelected(item.id)}><sup>{item.verse_number}</sup><p>{item.text}</p><button className="bookmark" onClick={(event) => { event.stopPropagation(); toggleBookmark(item.id); }} aria-label={`Bookmark verse ${item.verse_number}`}>{bookmarked.includes(item.id) ? '★' : '☆'}</button></div>)}</div>{selected && <div className="selection-bar">{reader.book} {reader.chapter}:{reader.verses.find((verse) => verse.id === selected)?.verse_number} selected <span>•</span> {bookmarked.includes(selected) ? 'Saved to your bookmarks' : 'Tap ☆ to bookmark'}</div>}</>}
  </section></main>;
}

function Bookmarks({ session }: { session: Session }) {
  const [items, setItems] = useState<{ id: string; verse_id: string | null; created_at: string }[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.from('bookmarks').select('id, verse_id, created_at').eq('user_id', session.user.id).order('created_at', { ascending: false }).then(({ data }) => { setItems(data ?? []); setLoading(false); }); }, [session.user.id]);
  return <main className="placeholder card"><span className="eyebrow">BIBLE ARENA</span><h1>Bookmarks</h1>{loading ? <p>Loading your saved Scriptures…</p> : items.length === 0 ? <p>You have no bookmarks yet. Save a verse from the Bible Reader.</p> : <div className="saved-list">{items.map((item) => <div key={item.id} className="saved-item"><strong>Saved Scripture</strong><span>Verse ID: {item.verse_id}</span></div>)}</div>}</main>;
}

function Notes({ session }: { session: Session }) {
  const [notes, setNotes] = useState<{ id: string; content: string }[]>([]); const [content, setContent] = useState(''); const [busy, setBusy] = useState(false);
  const load = () => supabase.from('user_notes').select('id, content').eq('user_id', session.user.id).order('created_at', { ascending: false }).then(({ data }) => setNotes(data ?? []));
  useEffect(() => { load(); }, [session.user.id]);
  async function addNote(event: React.FormEvent) { event.preventDefault(); if (!content.trim()) return; setBusy(true); const { error } = await supabase.from('user_notes').insert({ user_id: session.user.id, content: content.trim() }); if (!error) { setContent(''); await load(); } setBusy(false); }
  return <main className="placeholder card"><span className="eyebrow">BIBLE ARENA</span><h1>My Notes</h1><form className="note-form" onSubmit={addNote}><textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write what you are learning…" rows={4} /><button disabled={busy}>{busy ? 'Saving…' : 'Save note'}</button></form><div className="saved-list">{notes.map((note) => <div key={note.id} className="saved-item"><span>{note.content}</span></div>)}</div></main>;
}

function Placeholder({ title }: { title: string }) { return <main className="placeholder card"><span className="eyebrow">BIBLE ARENA</span><h1>{title}</h1><p>This area is prepared for the next implementation phase.</p></main>; }

export default function App() {
  const [session, setSession] = useState<Session | null>(null); const [authLoading, setAuthLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthLoading(false); if (data.session) ensureProfile(data.session.user.id, data.session.user.user_metadata?.display_name); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); if (nextSession) ensureProfile(nextSession.user.id, nextSession.user.user_metadata?.display_name); });
    return () => listener.subscription.unsubscribe();
  }, []);
  if (authLoading) return <main className="auth-page"><p>Loading your Bible Arena account…</p></main>;
  if (!session) return <AuthScreen />;
  const signOut = () => supabase.auth.signOut();
  return <div className="app-shell"><header className="topbar"><div className="brand"><div className="brand-mark">BA</div><div><strong>Bible Arena</strong><span>Read · Study · Grow</span></div></div><button className="profile" title="Sign out" onClick={signOut}>{(session.user.email?.[0] ?? 'U').toUpperCase()}</button></header><div className="layout"><aside className="sidebar">{navigation.map(([to, label]) => <NavLink key={label} to={to} end={label === 'Home'}>{label}</NavLink>)}</aside><Routes><Route path="/" element={<Home />} /><Route path="/bible" element={<BibleReader session={session} />} /><Route path="/notes" element={<Notes session={session} />} /><Route path="/bookmarks" element={<Bookmarks session={session} />} />{navigation.filter(([to]) => !['/', '/bible', '/notes', '/bookmarks'].includes(to)).map(([to, label]) => <Route key={label} path={to} element={<Placeholder title={label} />} />)}</Routes></div></div>;
}
