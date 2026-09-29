import { useBibleChapterVerses } from './BibleReaderData';

type BibleReaderProps = {
  chapterId: string | null;
  versionId: string | null;
  isNewTestament?: boolean;
  title?: string;
};

export function BibleReader({ chapterId, versionId, isNewTestament = false, title = 'Bible Reader' }: BibleReaderProps) {
  const { verses, loading, error } = useBibleChapterVerses(chapterId, versionId);

  return (
    <section aria-label={title} className="bible-reader">
      <h2>{title}</h2>
      {loading && <p role="status">Loading chapter…</p>}
      {error && <p role="alert">Unable to load this chapter. Please try again.</p>}
      {!loading && !error && verses.map((verse) => (
        <p key={verse.id} className={isNewTestament && verse.is_jesus_words ? 'jesus-words' : undefined}>
          <sup>{verse.verse_number}</sup> {verse.text}
        </p>
      ))}
    </section>
  );
}
