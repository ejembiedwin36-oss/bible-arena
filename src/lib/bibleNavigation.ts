export type ChapterNavigationRecord = {
  id: string;
  bookId: string;
  bookName: string;
  bookOrder: number;
  chapterNumber: number;
  chapterCount: number;
};

export function getNextChapter(
  current: ChapterNavigationRecord,
  books: ChapterNavigationRecord[],
) {
  if (current.chapterNumber < current.chapterCount) {
    return books.find(
      (chapter) =>
        chapter.bookId === current.bookId &&
        chapter.chapterNumber === current.chapterNumber + 1,
    ) ?? null;
  }

  return books.find(
    (chapter) =>
      chapter.bookOrder === current.bookOrder + 1 &&
      chapter.chapterNumber === 1,
  ) ?? null;
}

export function getPreviousChapter(
  current: ChapterNavigationRecord,
  books: ChapterNavigationRecord[],
) {
  if (current.chapterNumber > 1) {
    return books.find(
      (chapter) =>
        chapter.bookId === current.bookId &&
        chapter.chapterNumber === current.chapterNumber - 1,
    ) ?? null;
  }

  return books.find(
    (chapter) =>
      chapter.bookOrder === current.bookOrder - 1 &&
      chapter.chapterNumber === chapter.chapterCount,
  ) ?? null;
}
