-- Run in Supabase SQL Editor after the KJV import workflow completes.
-- This is read-only and verifies the Phase 1 Bible data checkpoint.

-- 1. KJV verse count
select
  v.abbreviation,
  count(bv.id) as verse_count
from public.bible_versions v
left join public.bible_verses bv on bv.version_id = v.id
where v.abbreviation = 'KJV'
group by v.abbreviation;

-- 2. KJV translation verse count
select
  t.code,
  count(tv.id) as translated_verse_count
from public.bible_translations t
left join public.bible_translation_verses tv on tv.translation_id = t.id
where t.code = 'KJV'
group by t.code;

-- 3. Books with verse counts
select
  b.book_order,
  b.name,
  b.chapter_count,
  count(bv.id) as verse_count
from public.bible_books b
left join public.bible_chapters c on c.book_id = b.id
left join public.bible_verses bv on bv.chapter_id = c.id
join public.bible_versions v on v.abbreviation = 'KJV'
  and bv.version_id = v.id
where b.book_order between 1 and 66
group by b.book_order, b.name, b.chapter_count
order by b.book_order;

-- 4. Required smoke-test passages
select
  b.name as book,
  c.chapter_number,
  bv.verse_number,
  bv.text
from public.bible_verses bv
join public.bible_chapters c on c.id = bv.chapter_id
join public.bible_books b on b.id = c.book_id
join public.bible_versions v on v.id = bv.version_id
where v.abbreviation = 'KJV'
  and (
    (b.name = 'Genesis' and c.chapter_number = 1 and bv.verse_number <= 3)
    or (b.name = 'Matthew' and c.chapter_number = 5 and bv.verse_number <= 3)
    or (b.name = 'John' and c.chapter_number = 3 and bv.verse_number = 16)
    or (b.name = 'Revelation' and c.chapter_number = 22 and bv.verse_number >= 20)
  )
order by b.book_order, c.chapter_number, bv.verse_number;
