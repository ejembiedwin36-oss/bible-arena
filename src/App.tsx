import { useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { sampleLuke1 } from './data/bible';

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
  const [translation, setTranslation] = useState(sampleLuke1.translation);
  const [selected, setSelected] = useState<number | null>(null);
  const [bookmarked, setBookmarked] = useState<number[]>([]);

  const toggleBookmark = (verse: number) => setBookmarked((current) => current.includes(verse) ? current.filter((v) => v !== verse) : [...current, verse]);

  return <main className="reader">
    <section className="reader-toolbar card">
      <div><span className="eyebrow">BIBLE READER</span><h1>{sampleLuke1.book} {sampleLuke1.chapter}</h1></div>
      <label>Translation <select value={translation} onChange={(e) => setTranslation(e.target.value)}><option>KJV</option><option>WEB (planned)</option></select></label>
    </section>
    <section className="chapter card">
      <div className="chapter-heading"><div><span className="label">{translation}</span><h2>Luke 1</h2></div><div className="chapter-nav"><button className="secondary">‹</button><button className="secondary">›</button></div></div>
      <div className="verses">{sampleLuke1.verses.map((item) => <div key={item.verse} className={`verse-row ${selected === item.verse ? 'selected' : ''}`} onClick={() => setSelected(item.verse)}><sup>{item.verse}</sup><p>{item.text}</p><button className="bookmark" onClick={(event) => { event.stopPropagation(); toggleBookmark(item.verse); }} aria-label={`Bookmark verse ${item.verse}`}>{bookmarked.includes(item.verse) ? '★' : '☆'}</button></div>)}</div>
      {selected && <div className="selection-bar">Luke 1:{selected} selected <span>•</span> {bookmarked.includes(selected) ? 'Bookmarked' : 'Tap ☆ to bookmark'}</div>}
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
