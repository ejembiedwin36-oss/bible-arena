import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APPLY = process.argv.includes('--apply');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SOURCE_BASE = 'https://raw.githubusercontent.com/aruljohn/Bible-kjv/master';
const SOURCE_REPO = 'https://github.com/aruljohn/Bible-kjv';
const SOURCE_LICENSE = 'MIT License (source repository)';

const books = [
  ['Genesis', 'genesis'], ['Exodus', 'exodus'], ['Leviticus', 'leviticus'], ['Numbers', 'numbers'], ['Deuteronomy', 'deuteronomy'],
  ['Joshua', 'joshua'], ['Judges', 'judges'], ['Ruth', 'ruth'], ['1Samuel', '1-samuel'], ['2Samuel', '2-samuel'],
  ['1Kings', '1-kings'], ['2Kings', '2-kings'], ['1Chronicles', '1-chronicles'], ['2Chronicles', '2-chronicles'], ['Ezra', 'ezra'],
  ['Nehemiah', 'nehemiah'], ['Esther', 'esther'], ['Job', 'job'], ['Psalms', 'psalms'], ['Proverbs', 'proverbs'],
  ['Ecclesiastes', 'ecclesiastes'], ['SongOfSolomon', 'song-of-solomon'], ['Isaiah', 'isaiah'], ['Jeremiah', 'jeremiah'], ['Lamentations', 'lamentations'],
  ['Ezekiel', 'ezekiel'], ['Daniel', 'daniel'], ['Hosea', 'hosea'], ['Joel', 'joel'], ['Amos', 'amos'], ['Obadiah', 'obadiah'],
  ['Jonah', 'jonah'], ['Micah', 'micah'], ['Nahum', 'nahum'], ['Habakkuk', 'habakkuk'], ['Zephaniah', 'zephaniah'], ['Haggai', 'haggai'],
  ['Zechariah', 'zechariah'], ['Malachi', 'malachi'], ['Matthew', 'matthew'], ['Mark', 'mark'], ['Luke', 'luke'], ['John', 'john'],
  ['Acts', 'acts'], ['Romans', 'romans'], ['1Corinthians', '1-corinthians'], ['2Corinthians', '2-corinthians'], ['Galatians', 'galatians'],
  ['Ephesians', 'ephesians'], ['Philippians', 'philippians'], ['Colossians', 'colossians'], ['1Thessalonians', '1-thessalonians'], ['2Thessalonians', '2-thessalonians'],
  ['1Timothy', '1-timothy'], ['2Timothy', '2-timothy'], ['Titus', 'titus'], ['Philemon', 'philemon'], ['Hebrews', 'hebrews'], ['James', 'james'],
  ['1Peter', '1-peter'], ['2Peter', '2-peter'], ['1John', '1-john'], ['2John', '2-john'], ['3John', '3-john'], ['Jude', 'jude'], ['Revelation', 'revelation'],
];

const expectedChapters = books.length === 66 ? 1189 : null;

async function getSingle(table, column, value) {
  const { data, error } = await supabase.from(table).select('*').eq(column, value).single();
  if (error) throw new Error(`${table}: ${error.message}`);
  return data;
}

async function main() {
  const version = await getSingle('bible_versions', 'abbreviation', 'KJV');
  const translation = await getSingle('bible_translations', 'code', 'KJV');

  if (translation.language_code !== 'en') {
    throw new Error(`KJV translation has unexpected language_code: ${translation.language_code}`);
  }

  const { data: dbBooks, error: booksError } = await supabase
    .from('bible_books')
    .select('id,canonical_key,name,chapter_count')
    .order('canonical_key');
  if (booksError) throw booksError;

  const byKey = new Map(dbBooks.map((book) => [book.canonical_key, book]));
  if (dbBooks.length !== 66) throw new Error(`Expected 66 Bible books in Supabase; found ${dbBooks.length}.`);

  const imported = [];
  let totalChapters = 0;
  let totalVerses = 0;

  for (const [filename, canonicalKey] of books) {
    const dbBook = byKey.get(canonicalKey);
    if (!dbBook) throw new Error(`Missing Supabase book: ${canonicalKey}`);

    const response = await fetch(`${SOURCE_BASE}/${filename}.json`);
    if (!response.ok) throw new Error(`Unable to download ${filename}.json: HTTP ${response.status}`);
    const source = await response.json();

    if (source.book !== filename) throw new Error(`Unexpected source book name in ${filename}.json`);
    if (source.chapters.length !== dbBook.chapter_count) {
      throw new Error(`${filename}: source has ${source.chapters.length} chapters; database expects ${dbBook.chapter_count}.`);
    }

    totalChapters += source.chapters.length;
    totalVerses += source.chapters.reduce((sum, chapter) => sum + chapter.verses.length, 0);
    imported.push({ dbBook, source });
  }

  if (totalChapters !== expectedChapters) throw new Error(`Expected ${expectedChapters} chapters; source contains ${totalChapters}.`);

  console.log(`Validated KJV source: ${imported.length} books, ${totalChapters} chapters, ${totalVerses} verses.`);
  console.log(`Source: ${SOURCE_REPO}`);
  console.log(`License metadata: ${SOURCE_LICENSE}`);

  if (!APPLY) {
    console.log('Dry run only. Re-run with --apply to write the validated import.');
    return;
  }

  // Import by upsert instead of deleting verse rows. Existing verse IDs may already
  // be referenced by topics, Arena questions, notes, bookmarks, or other features.
  // Preserving those IDs keeps the import safe and repeatable.
  for (const { dbBook, source } of imported) {
    const { data: chapters, error: chaptersError } = await supabase
      .from('bible_chapters')
      .select('id,chapter_number')
      .eq('book_id', dbBook.id)
      .order('chapter_number');
    if (chaptersError) throw chaptersError;

    const chapterMap = new Map(chapters.map((chapter) => [chapter.chapter_number, chapter.id]));

    for (const chapter of source.chapters) {
      const chapterId = chapterMap.get(Number(chapter.chapter));
      if (!chapterId) throw new Error(`Missing chapter ${dbBook.name} ${chapter.chapter}`);

      const verseRows = chapter.verses.map((verse) => ({
        version_id: version.id,
        chapter_id: chapterId,
        verse_number: Number(verse.verse),
        text: verse.text,
        is_jesus_words: false,
      }));

      const { data: insertedVerses, error: verseError } = await supabase
        .from('bible_verses')
        .upsert(verseRows, {
          onConflict: 'version_id,chapter_id,verse_number',
          ignoreDuplicates: false,
        })
        .select('id,verse_number');
      if (verseError) throw verseError;

      const sourceTextByNumber = new Map(
        chapter.verses.map((sourceVerse) => [Number(sourceVerse.verse), sourceVerse.text]),
      );

      const translationRows = insertedVerses.map((verse) => ({
        translation_id: translation.id,
        verse_id: verse.id,
        verse_text: sourceTextByNumber.get(verse.verse_number),
      }));

      if (translationRows.length) {
        const { error: translationError } = await supabase
          .from('bible_translation_verses')
          .upsert(translationRows, {
            onConflict: 'translation_id,verse_id',
            ignoreDuplicates: false,
          });
        if (translationError) throw translationError;
      }
    }
  }

  const { error: versionUpdateError } = await supabase
    .from('bible_versions')
    .update({ is_active: true, rights_verified: true })
    .eq('id', version.id);
  if (versionUpdateError) throw versionUpdateError;

  const { error: batchError } = await supabase.from('bible_import_batches').insert({
    version_id: version.id,
    translation_id: translation.id,
    source_name: 'aruljohn/Bible-kjv',
    source_url: SOURCE_REPO,
    license_name: SOURCE_LICENSE,
    license_url: `${SOURCE_REPO}/blob/master/LICENSE`,
    rights_verified: true,
    import_status: 'completed',
    expected_verse_count: totalVerses,
    imported_verse_count: totalVerses,
    completed_at: new Date().toISOString(),
  });
  if (batchError) throw batchError;

  console.log(`Imported/upserted ${totalVerses} KJV verses successfully without deleting existing verse IDs.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
