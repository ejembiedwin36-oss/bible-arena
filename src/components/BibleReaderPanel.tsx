import { useEffect, useMemo, useState } from 'react';
import type { BibleChapter } from '../services/bibleReader';
import { listBibleBooks, listBibleLanguages, listBibleVersions, type BibleBook, type BibleLanguage, type BibleVersion } from '../services/bibleCatalogue';
import { loadBibleChapter } from '../services/bibleReader';

type BibleReaderPanelProps = {
  initialLanguageId?: string;
};

export function BibleReaderPanel({ initialLanguageId }: BibleReaderPanelProps) {
  const [languages, setLanguages] = useState<BibleLanguage[]>([]);
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [languageId, setLanguageId] = useState(initialLanguageId ?? '');
  const [versionId, setVersionId] = useState('');
  const [bookId, setBookId] = useState('');
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapter, setChapter] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([listBibleLanguages(), listBibleBooks()])
      .then(([loadedLanguages, loadedBooks]) => {
        setLanguages(loadedLanguages);
        setBooks(loadedBooks);
        setLanguageId((current) => current || loadedLanguages[0]?.id || '');
        setBookId((current) => current || loadedBooks[0]?.id || '');
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to load Bible catalogue.'));
  }, []);

  useEffect(() => {
    if (!languageId) return;
    void listBibleVersions(languageId)
      .then((loadedVersions) => {
        setVersions(loadedVersions);
        setVersionId((current) => loadedVersions.some((version) => version.id === current) ? current : loadedVersions[0]?.id || '');
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to load Bible versions.'));
  }, [languageId]);

  useEffect(() => {
    if (!versionId || !bookId) return;
    setLoading(true);
    setError(null);
    void loadBibleChapter(versionId, bookId, chapterNumber)
      .then(setChapter)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to load this chapter.'))
      .finally(() => setLoading(false));
  }, [versionId, bookId, chapterNumber]);

  const selectedLanguage = useMemo(() => languages.find((language) => language.id === languageId), [languages, languageId]);
  const selectedVersion = useMemo(() => versions.find((version) => version.id === versionId), [versions, versionId]);
  const selectedBook = useMemo(() => books.find((book) => book.id === bookId), [books, bookId]);

  return (
    <section className="bible-reader-panel" aria-label="Bible Reader">
      <header className="bible-reader-header">
        <div>
          <span className="eyebrow">BIBLE READER</span>
          <h1>{selectedBook?.name ?? 'Bible'}</h1>
          <p>{selectedLanguage?.name ?? 'Choose a language'}{selectedVersion ? ` · ${selectedVersion.abbreviation || selectedVersion.name}` : ''}</p>
        </div>
        <strong>Chapter {chapterNumber}</strong>
      </header>

      <div className="bible-reader-controls">
        <label>Language<select value={languageId} onChange={(event) => setLanguageId(event.target.value)}>{languages.map((language) => <option key={language.id} value={language.id}>{language.name}</option>)}</select></label>
        <label>Version<select value={versionId} onChange={(event) => setVersionId(event.target.value)}>{versions.map((version) => <option key={version.id} value={version.id}>{version.name}</option>)}</select></label>
        <label>Book<select value={bookId} onChange={(event) => { setBookId(event.target.value); setChapterNumber(1); }}>{books.map((book) => <option key={book.id} value={book.id}>{book.bookOrder}. {book.name}</option>)}</select></label>
      </div>

      {error && <p role="alert" className="reader-error">{error}</p>}
      {loading && <p aria-live="polite">Loading chapter…</p>}

      <article className="bible-chapter">
        {chapter?.verses.map((verse) => <p key={verse.verseNumber}><sup>{verse.verseNumber}</sup> {verse.text}</p>)}
        {!loading && chapter && chapter.verses.length === 0 && <p>No verses are available for this selection yet.</p>}
      </article>

      <nav className="bible-chapter-nav" aria-label="Chapter navigation">
        <button type="button" disabled={chapterNumber <= 1 || loading} onClick={() => setChapterNumber((current) => current - 1)}>Previous</button>
        <button type="button" disabled={loading} onClick={() => setChapterNumber((current) => current + 1)}>Next</button>
      </nav>
    </section>
  );
}
