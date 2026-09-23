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
const interfaceLanguages = [
  { code: 'en', name: 'English' },
  { code: 'id', name: 'Idoma' },
  { code: 'ig', name: 'Igbo' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'ha', name: 'Hausa' },
  { code: 'tiv', name: 'Tiv' },
  { code: 'igl', name: 'Igala' },
  { code: 'efi', name: 'Efik / Calabar' },
];

const uiText = {
  en: { home:'Home', bible:'Bible', explore:'Explore', topics:'Topics', devotion:'Devotion', arena:'Arena', notes:'My Notes', bookmarks:'Bookmarks', ask:'Ask AI', progress:'Progress', profile:'Profile', settings:'Settings', openBible:'Open Bible', exploreStudy:'Explore Study', browseBible:'Browse Bible →', browseTopics:'Browse Topics →', writeNote:'Write a Note', viewBookmarks:'View Bookmarks', browse:'Browse', goDeeper:'Go deeper', quickActions:'Quick Actions', studyHub:'Study Hub', bibleCatalogue:'Bible Catalogue' },
  id: { home:'Home', bible:'Bible', explore:'Explore', topics:'Topics', devotion:'Devotion', arena:'Arena', notes:'My Notes', bookmarks:'Bookmarks', ask:'Ask AI', progress:'Progress', profile:'Profile', settings:'Settings', openBible:'Open Bible', exploreStudy:'Explore Study', browseBible:'Browse Bible →', browseTopics:'Browse Topics →', writeNote:'Write a Note', viewBookmarks:'View Bookmarks' },
  ig: { home:'Ụlọ', bible:'Akwụkwọ Nsọ', explore:'Nyochaa', topics:'Isiokwu', devotion:'Nraranye', arena:'Arena', notes:'Ihe m dere', bookmarks:'Ihe e debere', ask:'Jụọ AI', progress:'Ọganihu', profile:'Profaịlụ', settings:'Ntọala', openBible:'Mepee Akwụkwọ Nsọ', exploreStudy:'Nyochaa Ọmụmụ', browseBible:'Chọgharịa Akwụkwọ Nsọ →', browseTopics:'Chọgharịa Isiokwu →', writeNote:'Dee ihe edeturu', viewBookmarks:'Lee ihe e debere' },
  yo: { home:'Ile', bible:'Bibeli', explore:'Ṣàwárí', topics:'Àwọn Kókó', devotion:'Ìfọkànsìn', arena:'Arena', notes:'Àwọn Akọsilẹ Mi', bookmarks:'Àwọn Aṣàyàn', ask:'Béèrè AI', progress:'Ìlọsíwájú', profile:'Profaili', settings:'Ètò', openBible:'Ṣí Bibeli', exploreStudy:'Ṣàwárí Ìkẹ́kọ̀ọ́', browseBible:'Ṣàwárí Bibeli →', browseTopics:'Ṣàwárí Àwọn Kókó →', writeNote:'Kọ Akọsilẹ', viewBookmarks:'Wo Àwọn Aṣàyàn' },
  ha: { home:'Gida', bible:'Littafi Mai Tsarki', explore:'Bincika', topics:'Batutuwa', devotion:'Ibada', arena:'Arena', notes:'Bayanan Nawa', bookmarks:'Abubuwan da aka ajiye', ask:'Tambayi AI', progress:'Ci gaba', profile:'Bayanin Kai', settings:'Saituna', openBible:'Buɗe Littafi Mai Tsarki', exploreStudy:'Binciken Nazari', browseBible:'Duba Littafi Mai Tsarki →', browseTopics:'Duba Batutuwa →', writeNote:'Rubuta Bayani', viewBookmarks:'Duba Abubuwan da aka ajiye' },
  tiv: { home:'Ate', bible:'Bibilo', explore:'Yange', topics:'Ityôkugh', devotion:'Ior', arena:'Arena', notes:'Aman', bookmarks:'Aôndo', ask:'Yô AI', progress:'Aondo', profile:'Profile', settings:'Ior', openBible:'Yange Bibilo', exploreStudy:'Yange Ior', browseBible:'Yange Bibilo →', browseTopics:'Yange Ityôkugh →', writeNote:'Tô Aman', viewBookmarks:'Yange Aôndo' },
  igl: { home:'Ulo', bible:'Bible', explore:'Kpe', topics:'Ayo', devotion:'Idu', arena:'Arena', notes:'Eka mi', bookmarks:'Akọ', ask:'Bebe AI', progress:'Ugbè', profile:'Profaịlụ', settings:'Ise', openBible:'Kpe Bible', exploreStudy:'Kpe Ọmụmụ', browseBible:'Kpe Bible →', browseTopics:'Kpe Ayo →', writeNote:'Kọ Eka', viewBookmarks:'Kpe Akọ' },
  efi: { home:'Idọñ', bible:'Bible', explore:'Kpe', topics:'Nkan', devotion:'Idara', arena:'Arena', notes:'N̄wed mi', bookmarks:'N̄wed ẹtiene', ask:'Kpep AI', progress:'Mbube', profile:'Profile', settings:'Ntọala', openBible:'Kpe Bible', exploreStudy:'Kpe Idaha', browseBible:'Kpe Bible →', browseTopics:'Kpe Nkan →', writeNote:'N̄wed item', viewBookmarks:'Kpe N̄wed' },
} as const;

type InterfaceLanguage = keyof typeof uiText;

function useInterfaceLanguage(session: Session) {
  const [language, setLanguage] = useState<InterfaceLanguage>('en');
  useEffect(() => {
    supabase.from('profiles').select('preferred_language_code').eq('id', session.user.id).maybeSingle().then(({ data }) => {
      const code = data?.preferred_language_code as InterfaceLanguage | null;
      if (code && code in uiText) setLanguage(code);
    });
  }, [session.user.id]);
  return { language, t: uiText[language] };
function Home({ t }: { t: typeof uiText.en }) {
  const navigate = useNavigate();
  return <main className="home"><section className="hero card"><div><span className="eyebrow">BIBLE ARENA</span><h1>Read. Understand. Study. Grow.</h1><p>A calm, intelligent space to encounter Scripture, study deeply, and grow every day.</p><div className="actions"><button onClick={() => navigate('/bible')}>{t.openBible}</button><button className="secondary" onClick={() => navigate('/explore')}>{t.exploreStudy}</button></div></div><div className="verse"><span>Today's Scripture</span><strong>“Your word is a lamp to my feet and a light to my path.”</strong><small>Psalm 119:105</small></div></section><section className="grid"><article className="card"><span className="label">{t.bibleCatalogue}</span><h2>66 books</h2><p>Browse the Old and New Testaments by book and chapter.</p><button className="text-button" onClick={() => navigate('/bible')}>{t.browseBible}</button></article><article className="card"><span className="label">{t.studyHub}</span><h2>{t.goDeeper}</h2><p>Explore books, study context, and build a stronger understanding of Scripture.</p><button className="text-button" onClick={() => navigate('/explore')}>{t.exploreStudy}</button><button className="text-button" onClick={() => navigate('/explore/topics')}>{t.browseTopics}</button></article><article className="card"><span className="label">{t.quickActions}</span><div className="quick"><button onClick={() => navigate('/bible')}>{t.openBible}</button><button onClick={() => navigate('/notes')}>{t.writeNote}</button><button onClick={() => navigate('/bookmarks')}>{t.viewBookmarks}</button></div></article></section></main>;
}mport { useEffect, useMemo, useState } from 'react';
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
const interfaceLanguages = [
  { code: 'en', name: 'English' },
  { code: 'id', name: 'Idoma' },
  { code: 'ig', name: 'Igbo' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'ha', name: 'Hausa' },
  { code: 'tiv', name: 'Tiv' },
  { code: 'igl', name: 'Igala' },
  { code: 'efi', name: 'Efik / Calabar' },
];

const uiText = {
  en: { home:'Home', bible:'Bible', explore:'Explore', topics:'Topics', devotion:'Devotion', arena:'Arena', notes:'My Notes', bookmarks:'Bookmarks', ask:'Ask AI', progress:'Progress', profile:'Profile', settings:'Settings', openBible:'Open Bible', exploreStudy:'Explore Study', browseBible:'Browse Bible →', browseTopics:'Browse Topics →', writeNote:'Write a Note', viewBookmarks:'View Bookmarks', browse:'Browse', goDeeper:'Go deeper', quickActions:'Quick Actions', studyHub:'Study Hub', bibleCatalogue:'Bible Catalogue' },
  id: { home:'Home', bible:'Bible', explore:'Explore', topics:'Topics', devotion:'Devotion', arena:'Arena', notes:'My Notes', bookmarks:'Bookmarks', ask:'Ask AI', progress:'Progress', profile:'Profile', settings:'Settings', openBible:'Open Bible', exploreStudy:'Explore Study', browseBible:'Browse Bible →', browseTopics:'Browse Topics →', writeNote:'Write a Note', viewBookmarks:'View Bookmarks' },
  ig: { home:'Ụlọ', bible:'Akwụkwọ Nsọ', explore:'Nyochaa', topics:'Isiokwu', devotion:'Nraranye', arena:'Arena', notes:'Ihe m dere', bookmarks:'Ihe e debere', ask:'Jụọ AI', progress:'Ọganihu', profile:'Profaịlụ', settings:'Ntọala', openBible:'Mepee Akwụkwọ Nsọ', exploreStudy:'Nyochaa Ọmụmụ', browseBible:'Chọgharịa Akwụkwọ Nsọ →', browseTopics:'Chọgharịa Isiokwu →', writeNote:'Dee ihe edeturu', viewBookmarks:'Lee ihe e debere' },
  yo: { home:'Ile', bible:'Bibeli', explore:'Ṣàwárí', topics:'Àwọn Kókó', devotion:'Ìfọkànsìn', arena:'Arena', notes:'Àwọn Akọsilẹ Mi', bookmarks:'Àwọn Aṣàyàn', ask:'Béèrè AI', progress:'Ìlọsíwájú', profile:'Profaili', settings:'Ètò', openBible:'Ṣí Bibeli', exploreStudy:'Ṣàwárí Ìkẹ́kọ̀ọ́', browseBible:'Ṣàwárí Bibeli →', browseTopics:'Ṣàwárí Àwọn Kókó →', writeNote:'Kọ Akọsilẹ', viewBookmarks:'Wo Àwọn Aṣàyàn' },
  ha: { home:'Gida', bible:'Littafi Mai Tsarki', explore:'Bincika', topics:'Batutuwa', devotion:'Ibada', arena:'Arena', notes:'Bayanan Nawa', bookmarks:'Abubuwan da aka ajiye', ask:'Tambayi AI', progress:'Ci gaba', profile:'Bayanin Kai', settings:'Saituna', openBible:'Buɗe Littafi Mai Tsarki', exploreStudy:'Binciken Nazari', browseBible:'Duba Littafi Mai Tsarki →', browseTopics:'Duba Batutuwa →', writeNote:'Rubuta Bayani', viewBookmarks:'Duba Abubuwan da aka ajiye' },
  tiv: { home:'Ate', bible:'Bibilo', explore:'Yange', topics:'Ityôkugh', devotion:'Ior', arena:'Arena', notes:'Aman', bookmarks:'Aôndo', ask:'Yô AI', progress:'Aondo', profile:'Profile', settings:'Ior', openBible:'Yange Bibilo', exploreStudy:'Yange Ior', browseBible:'Yange Bibilo →', browseTopics:'Yange Ityôkugh →', writeNote:'Tô Aman', viewBookmarks:'Yange Aôndo' },
  igl: { home:'Ulo', bible:'Bible', explore:'Kpe', topics:'Ayo', devotion:'Idu', arena:'Arena', notes:'Eka mi', bookmarks:'Akọ', ask:'Bebe AI', progress:'Ugbè', profile:'Profaịlụ', settings:'Ise', openBible:'Kpe Bible', exploreStudy:'Kpe Ọmụmụ', browseBible:'Kpe Bible →', browseTopics:'Kpe Ayo →', writeNote:'Kọ Eka', viewBookmarks:'Kpe Akọ' },
  efi: { home:'Idọñ', bible:'Bible', explore:'Kpe', topics:'Nkan', devotion:'Idara', arena:'Arena', notes:'N̄wed mi', bookmarks:'N̄wed ẹtiene', ask:'Kpep AI', progress:'Mbube', profile:'Profile', settings:'Ntọala', openBible:'Kpe Bible', exploreStudy:'Kpe Idaha', browseBible:'Kpe Bible →', browseTopics:'Kpe Nkan →', writeNote:'N̄wed item', viewBookmarks:'Kpe N̄wed' },
} as const;

type InterfaceLanguage = keyof typeof uiText;

function useInterfaceLanguage(session: Session) {
  const [language, setLanguage] = useState<InterfaceLanguage>('en');
  useEffect(() => {
    supabase.from('profiles').select('preferred_language_code').eq('id', session.user.id).maybeSingle().then(({ data }) => {
      const code = data?.preferred_language_code as InterfaceLanguage | null;
      if (code && code in uiText) setLanguage(code);
    });
  }, [session.user.id]);
  return { language, t: uiText[language] };
}