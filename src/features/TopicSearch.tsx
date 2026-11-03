import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Topic = { id: string; name: string; description: string | null };
type TopicScripture = { topic_id: string; relevance_rank: number | null; verse: { id: string; verse_number: number; text: string; chapter: { id: string; chapter_number: number; book: { canonical_key: string; name: string } }; version: { abbreviation: string; name: string } } };

type SearchVerse = { id:string; verse_number:number; text:string; bible_chapters: { chapter_number:number; bible_books:{name:string;canonical_key:string} } | null };
const associations:Record<string,string[]> = {
  excellence:['excellent','wisdom','understanding','diligent'],
  faith:['faith','believe','trust'], prayer:['pray','prayer','supplication'],
  patience:['patient','longsuffering'], purity:['pure','holy','holiness'],
  forgiveness:['forgive','mercy'], love:['love','charity']
};
function termsFor(query:string):string[] {
  const words=(query.toLowerCase().match(/[a-z]+/g)??[]).filter(w=>!['the','of','a','an','and','in','for','spirit','biblical','about','scripture'].includes(w));
  const main=words.at(-1)??'';
  return [...new Set([main,...(associations[main]??[])])].filter(w=>w.length>2);
}
export function TopicSearch() {
  const navigate=useNavigate();
  const [topics,setTopics]=useState<Topic[]>([]);
  const [query,setQuery]=useState('');
  const [loading,setLoading]=useState(true);
  const [searching,setSearching]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [verses,setVerses]=useState<SearchVerse[]>([]);
  useEffect(()=>{supabase.from('topics').select('id,name,description').order('name').then(({data,error:e})=>{if(e)setError(e.message);setTopics(data??[]);setLoading(false);});},[]);
  const filtered=useMemo(()=>{const q=query.trim().toLowerCase();return q?topics.filter(t=>`${t.name} ${t.description??''}`.toLowerCase().includes(q)):topics;},[topics,query]);
  useEffect(()=>{
    const q=query.trim();
    if(q.length<3){setVerses([]);setSearching(false);return;}
    let cancelled=false;
    const timer=setTimeout(async()=>{
      setSearching(true);
      const terms=termsFor(q);
      if(!terms.length){setVerses([]);setSearching(false);return;}
      const {data,error:e}=await supabase.from('bible_verses')
        .select('id,verse_number,text,bible_chapters(chapter_number,bible_books(name,canonical_key))')
        .or(terms.map(t=>`text.ilike.%${t}%`).join(',')).limit(80);
      if(cancelled)return;
      setError(e?.message??null);
      setVerses(e?[]:(data??[]) as unknown as SearchVerse[]);
      setSearching(false);
    },350);
    return()=>{cancelled=true;clearTimeout(timer);};
  },[query]);
  return <main className="topic-page">
    <section className="topic-hero card"><div><span className="eyebrow">SCRIPTURE SEARCH</span><h1>Find Scripture by topic or keyword.</h1><p>Browse study topics and search the KJV text for relevant words. All displayed verses come from the Bible database.</p></div><input className="catalog-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try: Spirit of Excellence, prayer, faith…" aria-label="Search topics and Scripture"/></section>
    {loading&&<section className="card catalog-message">Loading topics…</section>}
    {error&&<section className="card catalog-message"><h2>Search unavailable</h2><p>{error}</p></section>}
    {filtered.length>0&&<section className="topic-grid">{filtered.map(t=><button key={t.id} className="topic-card card" onClick={()=>navigate(`/explore/topic/${t.id}`)}><span className="study-icon">⌕</span><div><strong>{t.name}</strong><p>{t.description??'Explore Scriptures connected to this topic.'}</p></div></button>)}</section>}
    {query.trim().length>=3&&<section className="saved-list" aria-live="polite"><h2>Matching KJV Scriptures</h2>{searching&&<p>Searching verses…</p>}{!searching&&!error&&verses.length===0&&<p>No matching verses found. Try another keyword.</p>}{!searching&&verses.map(v=>{const chapter=v.bible_chapters;const book=chapter?.bible_books;return <article key={v.id} className="bookmark-card"><div className="bookmark-main"><span className="label">KJV</span><button className="reference-button" onClick={()=>navigate(`/explore/verse/${v.id}`)}>{book?.name??'Bible'} {chapter?.chapter_number}:{v.verse_number}</button><p>{v.text}</p></div><div className="bookmark-actions"><button onClick={()=>navigate(`/explore/verse/${v.id}`)}>Study verse →</button>{book&&chapter&&<button onClick={()=>navigate(`/bible/${book.canonical_key}/${chapter.chapter_number}`)}>Read chapter →</button>}</div></article>;})}</section>}
    {!loading&&!error&&query.trim().length===0&&topics.length===0&&<section className="card empty-state"><strong>No study topics published yet.</strong><p>Search for a Scripture keyword above.</p></section>}
  </main>;
}

export function TopicStudy(){
  const {topicId}=useParams(); const navigate=useNavigate(); const [topic,setTopic]=useState<Topic|null>(null); const [items,setItems]=useState<TopicScripture[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  useEffect(()=>{if(!topicId){setTopic(null);setItems([]);setError('Topic not found.');setLoading(false);return;}let cancelled=false;(async()=>{setLoading(true);setError(null);setTopic(null);setItems([]);const [{data:t,error:te},{data:s,error:se}]=await Promise.all([supabase.from('topics').select('id,name,description').eq('id',topicId).maybeSingle(),supabase.from('topic_scriptures').select('topic_id,relevance_rank,bible_verses(id,verse_number,text,bible_chapters(id,chapter_number,bible_books(canonical_key,name)),bible_versions(name,abbreviation))').eq('topic_id',topicId).order('relevance_rank',{ascending:true,nullsFirst:false})]);if(cancelled)return;if(te||se){setError(te?.message??se?.message??'Unable to load topic.');setLoading(false);return;}setTopic(t??null);const seen=new Set<string>();const normalized=((s??[]) as any[]).map(row=>{const v=row.bible_verses,c=Array.isArray(v?.bible_chapters)?v.bible_chapters[0]:v?.bible_chapters,b=Array.isArray(c?.bible_books)?c.bible_books[0]:c?.bible_books,ver=Array.isArray(v?.bible_versions)?v.bible_versions[0]:v?.bible_versions;if(!v||!c||!b||!ver||seen.has(v.id))return null;seen.add(v.id);return {topic_id:row.topic_id,relevance_rank:row.relevance_rank,verse:{id:v.id,verse_number:v.verse_number,text:v.text,chapter:{id:c.id,chapter_number:c.chapter_number,book:{canonical_key:b.canonical_key,name:b.name}},version:{name:ver.name,abbreviation:ver.abbreviation}}};}).filter(Boolean) as TopicScripture[];setItems(normalized);setLoading(false);})();return()=>{cancelled=true}},[topicId]);
  if(loading)return <main className="topic-study page-card"><p>Loading topic study…</p></main>; if(error||!topic)return <main className="topic-study page-card"><h1>Topic study unavailable</h1><p>{error??'Topic not found.'}</p><button onClick={()=>navigate('/explore/topics')}>Back to topics</button></main>;
  return <main className="topic-study"><section className="topic-study-hero card"><button className="back-button" onClick={()=>navigate('/explore/topics')}>← Topics</button><span className="eyebrow">TOPIC STUDY</span><h1>{topic.name}</h1><p>{topic.description??'Explore the Scriptures connected to this topic.'}</p><span className="count-chip">{items.length} Scripture{items.length===1?'':'s'}</span></section>{items.length===0?<section className="card empty-state"><strong>No Scripture mappings yet.</strong><p>This topic exists, but no verified Scripture references have been connected yet.</p></section>:<section className="saved-list">{items.map(item=><article key={item.verse.id} className="bookmark-card"><div className="bookmark-main"><span className="label">{item.verse.version.abbreviation}</span><button className="reference-button" onClick={()=>navigate(`/explore/verse/${item.verse.id}`)}>{item.verse.chapter.book.name} {item.verse.chapter.chapter_number}:{item.verse.verse_number}</button><p>{item.verse.text}</p></div><div className="bookmark-actions"><button onClick={()=>navigate(`/explore/verse/${item.verse.id}`)}>Study verse →</button><button onClick={()=>navigate(`/bible/${item.verse.chapter.book.canonical_key}/${item.verse.chapter.chapter_number}`)}>Read chapter →</button></div></article>)}</section>}</main>;
}
