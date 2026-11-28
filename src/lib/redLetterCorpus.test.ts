import { describe, expect, it } from 'vitest';
import { alignRedLetters, redLetterVerse } from './redLetterCorpus';
import john from '../data/redLetters/John.json';
import matthew from '../data/redLetters/Matthew.json';

describe('KJV red-letter marker alignment', () => {
  it('bundles the John 4:10 and 4:14 red-letter passages locally', () => {
    for (const verseNumber of ['10', '14']) {
      const verse = john['4'][verseNumber as '10' | '14'];
      expect(redLetterVerse(john, 4, Number(verseNumber), verse.text).some((part) => part.red)).toBe(true);
    }
  });

  it('bundles Matthew 5:8 red letters locally', () => {
    const verse = matthew['5']['8'];
    expect(redLetterVerse(matthew, 5, 8, verse.text)).toEqual([{ text: verse.text, red: true }]);
  });
  it('highlights Matthew 5:8 while preserving the exact verse', () => {
    const verse = 'Blessed are the pure in heart: for they shall see God.';
    const parts = alignRedLetters(verse, verse, [{ start: 0, end: 7 }, { start: 12, end: 54 }]);
    expect(parts.map((part) => part.text).join('')).toBe(verse);
    expect(parts.filter((part) => part.red).map((part) => part.text).join('')).toBe('Blessedthe pure in heart: for they shall see God.');
  });

  it('keeps translated words red within Jesus speech but not in narration', () => {
    const verse = 'Narration: Blessed are the poor in spirit: for theirs is the kingdom of heaven.';
    const start = verse.indexOf('Blessed');
    const parts = alignRedLetters(verse, verse, [{ start, end: start + 7 }, { start: start + 12, end: verse.length }], [{ start: start + 8, end: start + 11 }]);
    expect(parts).toEqual([{ text: 'Narration: ', red: false }, { text: verse.slice(start), red: true }]);
  });

  it('does not color narration outside Jesus speech', () => {
    const verse = 'Jesus said, Peace be unto you.';
    const parts = alignRedLetters(verse, verse, [{ start: 12, end: verse.length }]);
    expect(parts[0]).toEqual({ text: 'Jesus said, ', red: false });
    expect(parts[1].red).toBe(true);
  });

  it('refuses mismatched text and invalid offsets', () => {
    expect(alignRedLetters('KJV wording', 'other wording', [{ start: 0, end: 3 }])).toEqual([{ text: 'other wording', red: false }]);
    expect(alignRedLetters('text', 'text', [{ start: 0, end: 99 }])).toEqual([{ text: 'text', red: false }]);
  });
});

import webMatthew from '../data/webRedLetters/Matthew.json';
import webJohn from '../data/webRedLetters/John.json';

describe('WEB red-letter annotations', () => {
  it('highlights Jesus speech in Matthew 5:8 with exact WEB text', () => {
    const verse = webMatthew['5']['8'];
    expect(redLetterVerse(webMatthew, 5, 8, verse.text)).toEqual([{ text: verse.text, red: true }]);
  });
  it('keeps John 3:3 narration black and speech red', () => {
    const verse = webJohn['3']['3'];
    const parts = redLetterVerse(webJohn, 3, 3, verse.text);
    expect(parts[0]).toEqual({ text: 'Jesus answered him, “', red: false });
    expect(parts.some(part => part.red)).toBe(true);
    expect(parts.map(part => part.text).join('')).toBe(verse.text);
  });
  it('does not invent WEB red letters in unreviewed verses', () => {
    expect(redLetterVerse(webJohn, 3, 2, 'Nicodemus spoke')).toEqual([{ text: 'Nicodemus spoke', red: false }]);
  });
  it('does not apply red letters when WEB wording changes', () => {
    expect(redLetterVerse(webMatthew, 5, 8, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});


import yltJohn from '../data/yltRedLetters/John.json';

describe('YLT red-letter annotations', () => {
  it('highlights the exact YLT wording of John 3:16', () => {
    const verse = yltJohn['3']['16'];
    const parts = redLetterVerse(yltJohn, 3, 16, verse.text);
    expect(parts).toEqual([{ text: verse.text, red: true }]);
    expect(parts.map((part) => part.text).join('')).toBe(verse.text);
  });

  it('does not apply YLT red letters when the displayed wording differs', () => {
    const parts = redLetterVerse(yltJohn, 3, 16, 'A different translation wording.');
    expect(parts).toEqual([{ text: 'A different translation wording.', red: false }]);
  });

  it('leaves unannotated YLT verses in normal text', () => {
    expect(redLetterVerse(yltJohn, 3, 15, 'Unannotated YLT verse.')).toEqual([
      { text: 'Unannotated YLT verse.', red: false },
    ]);
  });
});


import asvJohn from '../data/asvRedLetters/John.json';

describe('ASV red-letter annotations', () => {
  it('highlights the exact ASV wording of John 3:16', () => {
    const verse = asvJohn['3']['16'];
    expect(redLetterVerse(asvJohn, 3, 16, verse.text)).toEqual([{ text: verse.text, red: true }]);
  });
  it('does not colour ASV text when the displayed wording differs', () => {
    expect(redLetterVerse(asvJohn, 3, 16, 'Different wording')).toEqual([
      { text: 'Different wording', red: false },
    ]);
  });
});


import bsbJohn from '../data/bsbRedLetters/John.json';

describe('John chapter 1 translation-specific red-letter spans', () => {
  const cases = [
    { version: 'ASV', corpus: asvJohn, annotation: asvJohn['1']['38'], spoken: 'What seek ye?' },
    { version: 'WEB', corpus: webJohn, annotation: webJohn['1']['38'], spoken: '“What are you looking for?”' },
    { version: 'YLT', corpus: yltJohn, annotation: yltJohn['1']['38'], spoken: "'What seek ye?'" },
    { version: 'BSB', corpus: bsbJohn, annotation: bsbJohn['1']['38'], spoken: '“What do you want?”' },
  ];

  it.each(cases)('$version highlights Jesus words without colouring the surrounding dialogue', ({ corpus, annotation, spoken }) => {
    const parts = redLetterVerse(corpus, 1, 38, annotation.text);
    expect(parts.map((part) => part.text).join('')).toBe(annotation.text);
    expect(parts.filter((part) => part.red).map((part) => part.text).join('')).toBe(spoken);
    expect(parts.some((part) => !part.red)).toBe(true);
  });

  it('highlights the exact BSB wording in John 1:51', () => {
    const annotated = bsbJohn['1']['51'];
    const parts = redLetterVerse(bsbJohn, 1, 51, annotated.text);
    expect(parts.filter((part) => part.red).map((part) => part.text).join('')).toBe(
      '“Truly, truly, I tell you, you will all see heaven open and the angels of God ascending and descending on the Son of Man.”',
    );
  });

  it('does not colour a John 1 verse that has not been annotated', () => {
    expect(redLetterVerse(bsbJohn, 1, 1, 'In the beginning was the Word.')).toEqual([
      { text: 'In the beginning was the Word.', red: false },
    ]);
  });
});


import webJohn2 from '../data/webRedLetters/John.json';
import asvJohn2 from '../data/asvRedLetters/John.json';
import yltJohn2 from '../data/yltRedLetters/John.json';

describe('John chapter 2 translation-specific red-letter spans', () => {
  const chapter2Cases = [
    { version: 'KJV', corpus: john, spoken: {
      4: 'Woman, what have I to do with thee? mine hour is not yet come.',
      7: 'Fill the waterpots with water.',
      8: 'Draw out now, and bear unto the governor of the feast.',
      16: "Take these things hence; make not my Father's house an house of merchandise.",
      19: 'Destroy this temple, and in three days I will raise it up.',
    }},
    { version: 'WEB', corpus: webJohn2, spoken: {
      4: '“Woman, what does that have to do with you and me? My hour has not yet come.”',
      7: '“Fill the water pots with water.”',
      8: '“Now draw some out, and take it to the ruler of the feast.”',
      16: '“Take these things out of here! Don’t make my Father’s house a marketplace!”',
      19: '“Destroy this temple, and in three days I will raise it up.”',
    }},
    { version: 'ASV', corpus: asvJohn2, spoken: {
      4: 'Woman, what have I to do with thee? mine hour is not yet come.',
      7: 'Fill the waterpots with water.',
      8: 'Draw out now, and bear unto the ruler of the feast.',
      16: 'Take these things hence; make not my Father’s house a house of merchandise.',
      19: 'Destroy this temple, and in three days I will raise it up.',
    }},
    { version: 'YLT', corpus: yltJohn2, spoken: {
      4: "'What — to me and to thee, woman? not yet is mine hour come.'",
      7: "'Fill the water-jugs with water;'",
      8: "'Draw out, now, and bear to the director of the apartment;'",
      16: "'Take these things hence; make not the house of my Father a house of merchandise.'",
      19: "'Destroy this sanctuary, and in three days I will raise it up.'",
    }},
    { version: 'BSB', corpus: bsbJohn, spoken: {
      4: '“Woman, what is that to you and to Me?”“My hour has not yet come.”',
      7: '“Fill the jars with water.”',
      8: '“Now draw some out,”“and take it to the master of the banquet.”',
      16: '“Get these out of here! How dare you turn My Father’s house into a marketplace!”',
      19: '“Destroy this temple, and in three days I will raise it up again.”',
    }},
  ];

  it.each(chapter2Cases)('$version highlights only Jesus’ words in reviewed John 2 verses', ({ corpus, spoken }) => {
    for (const verseNumber of [4, 7, 8, 16, 19]) {
      const annotation = corpus['2'][verseNumber as 4 | 7 | 8 | 16 | 19];
      expect(annotation, `missing annotation for John 2:${verseNumber}`).toBeDefined();
      const parts = redLetterVerse(corpus, 2, verseNumber, annotation.text);
      expect(parts.map((part) => part.text).join('')).toBe(annotation.text);
      expect(parts.filter((part) => part.red).map((part) => part.text).join('')).toBe((spoken as Record<number, string>)[verseNumber]);
      expect(parts.some((part) => !part.red)).toBe(true);
    }
  });

  it('leaves Mary’s words in John 2:5 uncoloured in every version', () => {
    for (const corpus of [john, webJohn2, asvJohn2, yltJohn2, bsbJohn]) {
      expect(redLetterVerse(corpus, 2, 5, 'Mary said, Do whatever he tells you.')).toEqual([
        { text: 'Mary said, Do whatever he tells you.', red: false },
      ]);
    }
  });
});
