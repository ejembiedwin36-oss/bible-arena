export type VoiceIntent =
  | { type: 'open_book_chapter'; bookName: string; chapterNumber: number }
  | { type: 'open_book'; bookName: string }
  | { type: 'search_bible'; query: string }
  | { type: 'unknown'; transcript: string };

export type VoiceIntentContext = {
  languageCode: string;
};

export type VoiceIntentParser = (
  transcript: string,
  context: VoiceIntentContext,
) => VoiceIntent;

/**
 * Language-independent voice contract.
 * Speech recognition produces text; this layer converts that text into a
 * structured Bible action. Language-specific understanding providers can be
 * plugged in later without changing the Reader UI.
 */
export const parseVoiceIntent: VoiceIntentParser = (transcript) => {
  const normalized = transcript.trim();
  if (!normalized) return { type: 'unknown', transcript };

  const chapterMatch = normalized.match(/(?:chapter|chap)\s+(\d+)/i);
  if (chapterMatch) {
    const chapterNumber = Number(chapterMatch[1]);
    const bookName = normalized
      .replace(chapterMatch[0], '')
      .replace(/^(open|go to|take me to|read)\s+/i, '')
      .trim();

    if (bookName && Number.isInteger(chapterNumber)) {
      return { type: 'open_book_chapter', bookName, chapterNumber };
    }
  }

  if (/^(open|go to|read)\s+/i.test(normalized)) {
    return {
      type: 'open_book',
      bookName: normalized.replace(/^(open|go to|read)\s+/i, '').trim(),
    };
  }

  if (/\b(search|find)\b/i.test(normalized)) {
    return {
      type: 'search_bible',
      query: normalized.replace(/^(search|find)\s+/i, '').trim(),
    };
  }

  return { type: 'unknown', transcript };
};
