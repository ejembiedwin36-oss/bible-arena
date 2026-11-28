import { describe, expect, it } from 'vitest';
import { alignRedLetters, redLetterVerse } from './redLetterCorpus';
import john from '../data/redLetters/John.json';
import matthew from '../data/redLetters/Matthew.json';
import asvMatthew from '../data/asvRedLetters/Matthew.json';
import bsbMatthew from '../data/bsbRedLetters/Matthew.json';
import yltMatthew from '../data/yltRedLetters/Matthew.json';


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



type ChapterCorpus = Record<string, Record<string, { text: string; spans: { start: number; end: number }[] }>>;
const john3Versions = [
  { version: 'KJV', corpus: john },
  { version: 'WEB', corpus: webJohn },
  { version: 'ASV', corpus: asvJohn },
  { version: 'BSB', corpus: bsbJohn },
  { version: 'YLT', corpus: yltJohn },
] as const;
const john3ReviewedVerses = [3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21] as const;

describe('John chapter 3 translation-specific red-letter spans', () => {
  it.each(john3Versions)('$version has reviewed Jesus-speech spans in John 3', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john3ReviewedVerses) {
      const annotation = typedCorpus['3'][String(verseNumber)];
      expect(annotation, `missing John 3:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 3, verseNumber, annotation.text);
      expect(parts.map((part) => part.text).join('')).toBe(annotation.text);
      expect(parts.some((part) => part.red)).toBe(true);
    }
  });

  it('keeps Jesus’ opening words separate from the attribution in ASV, WEB, and YLT', () => {
    const expected = [
      { corpus: asvJohn, text: 'Verily, verily, I say unto thee, Except one be born anew, he cannot see the kingdom of God.' },
      { corpus: webJohn, text: 'Most certainly, I tell you, unless one is born anew, he can’t see God’s Kingdom.”' },
      { corpus: yltJohn, text: "'Verily, verily, I say to thee, If any one may not be born from above, he is not able to see the reign of God;'" },
    ];
    for (const item of expected) {
      const parts = redLetterVerse(item.corpus, 3, 3, item.corpus['3']['3'].text);
      expect(parts.filter((part) => part.red).map((part) => part.text).join('')).toBe(item.text);
      expect(parts.some((part) => !part.red)).toBe(true);
    }
  });

  it('highlights both BSB speech portions in John 3:10 but not “said Jesus”', () => {
    const verse = bsbJohn['3']['10'];
    const parts = redLetterVerse(bsbJohn, 3, 10, verse.text);
    expect(parts.filter((part) => part.red).map((part) => part.text).join('')).toBe(
      '“You are Israel’s teacher,”“and you do not understand these things?',
    );
    expect(parts.some((part) => part.text.includes('said Jesus') && !part.red)).toBe(true);
  });

  it('does not colour the BSB section heading appended after John 3:21', () => {
    const verse = bsbJohn['3']['21'];
    const parts = redLetterVerse(bsbJohn, 3, 21, verse.text);
    const redText = parts.filter((part) => part.red).map((part) => part.text).join('');
    expect(redText).toBe('But whoever practices the truth comes into the Light, so that it may be seen clearly that what he has done has been accomplished in God.”');
    expect(redText).not.toContain('John’s Testimony about Jesus');
  });

  it('leaves Nicodemus’ replies and the following narration uncoloured', () => {
    for (const { corpus } of john3Versions) {
      const typedCorpus = corpus as unknown as ChapterCorpus;
      for (const verseNumber of [4, 9, 22]) {
        const text = typedCorpus['3'][String(verseNumber)]?.text ?? 'Unannotated verse';
        expect(redLetterVerse(corpus, 3, verseNumber, text).some((part) => part.red)).toBe(false);
      }
    }
  });
});


const john4ReviewedVerses = [7, 10, 13, 14, 16, 17, 18, 21, 22, 23, 24, 26, 32, 34, 35, 36, 37, 38, 48, 50, 53] as const;

describe('John chapter 4 translation-specific red-letter spans', () => {
  it.each(john3Versions)('$version has reviewed Jesus-speech spans in John 4', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john4ReviewedVerses) {
      const annotation = typedCorpus['4'][String(verseNumber)];
      expect(annotation, `missing John 4:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 4, verseNumber, annotation.text);
      expect(parts.map((part) => part.text).join('')).toBe(annotation.text);
      expect(parts.some((part) => part.red)).toBe(true);
    }
  });

  it('highlights only Jesus’ reply in John 4:17 across translations', () => {
    const expected = [
      { corpus: john, text: 'Thou hast well said, I have no husband:' },
      { corpus: webJohn, text: '“You said well, ‘I have no husband,’' },
      { corpus: asvJohn, text: 'Thou saidst well, I have no husband:' },
      { corpus: yltJohn, text: "'Well didst thou say — A husband I have not;" },
      { corpus: bsbJohn, text: '“You are correct to say that you have no husband' },
    ];
    for (const item of expected) {
      const verse = (item.corpus as unknown as ChapterCorpus)['4']['17'];
      const parts = redLetterVerse(item.corpus, 4, 17, verse.text);
      expect(parts.filter((part) => part.red).map((part) => part.text).join('')).toBe(item.text);
      expect(parts.some((part) => !part.red)).toBe(true);
    }
  });

  it('keeps BSB attribution separate in John 4:21 and 4:50', () => {
    const verse21 = bsbJohn['4']['21'];
    const red21 = redLetterVerse(bsbJohn, 4, 21, verse21.text).filter((part) => part.red).map((part) => part.text).join('');
    expect(red21).toBe('“Believe Me, woman,”“a time is coming when you will worship the Father neither on this mountain nor in Jerusalem.');
    const verse50 = bsbJohn['4']['50'];
    const red50 = redLetterVerse(bsbJohn, 4, 50, verse50.text).filter((part) => part.red).map((part) => part.text).join('');
    expect(red50).toBe('“Go,”“Your son will live.”');
  });

  it('does not colour the BSB section heading after John 4:38', () => {
    const verse = bsbJohn['4']['38'];
    const red = redLetterVerse(bsbJohn, 4, 38, verse.text).filter((part) => part.red).map((part) => part.text).join('');
    expect(red).toBe('I sent you to reap what you have not worked for; others have done the hard work, and now you have taken up their labor.”');
    expect(red).not.toContain('Many Samaritans Believe');
  });

  it('highlights the reported spoken words in John 4:53 only', () => {
    const expected = [
      { corpus: john, text: 'Thy son liveth:' },
      { corpus: webJohn, text: '“Your son lives.”' },
      { corpus: asvJohn, text: 'Thy son liveth' },
      { corpus: yltJohn, text: "'Thy son doth live,'" },
      { corpus: bsbJohn, text: '“Your son will live.”' },
    ];
    for (const item of expected) {
      const verse = (item.corpus as unknown as ChapterCorpus)['4']['53'];
      const parts = redLetterVerse(item.corpus, 4, 53, verse.text);
      expect(parts.filter((part) => part.red).map((part) => part.text).join('')).toBe(item.text);
    }
  });

  it('leaves unannotated John 4:9 in normal text', () => {
    for (const { corpus } of john3Versions) {
      const text = (corpus as unknown as ChapterCorpus)['4']['9']?.text ?? 'Unannotated verse';
      expect(redLetterVerse(corpus, 4, 9, text).some((part) => part.red)).toBe(false);
    }
  });
});


const john5ReviewedVerses = [6, 8, 14, 17, ...Array.from({ length: 29 }, (_, i) => i + 19)];

describe('John chapter 5 translation-specific red-letter spans', () => {
  it.each(john3Versions)('$version has reviewed Jesus-speech spans in John 5', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john5ReviewedVerses) {
      const annotation = typedCorpus['5'][String(verseNumber)];
      expect(annotation, `missing John 5:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 5, verseNumber, annotation.text);
      expect(parts.map((part) => part.text).join('')).toBe(annotation.text);
      expect(parts.some((part) => part.red)).toBe(true);
    }
  });

  it('highlights Jesus’ question in John 5:6 without colouring the narration', () => {
    const expected = [
      { corpus: john, text: 'Wilt thou be made whole?' },
      { corpus: webJohn, text: '“Do you want to be made well?”' },
      { corpus: asvJohn, text: 'Wouldest thou be made whole?' },
      { corpus: yltJohn, text: "'Dost thou wish to become whole?'" },
      { corpus: bsbJohn, text: '“Do you want to get well?”' },
    ];
    for (const item of expected) {
      const verse = (item.corpus as unknown as ChapterCorpus)['5']['6'];
      const parts = redLetterVerse(item.corpus, 5, 6, verse.text);
      expect(parts.filter((part) => part.red).map((part) => part.text).join('')).toBe(item.text);
      expect(parts.some((part) => !part.red)).toBe(true);
    }
  });

  it('excludes BSB section headings from John 5:30 and 5:38', () => {
    const verse30 = bsbJohn['5']['30'];
    const red30 = redLetterVerse(bsbJohn, 5, 30, verse30.text).filter((part) => part.red).map((part) => part.text).join('');
    expect(red30).toBe('I can do nothing by Myself; I judge only as I hear. And My judgment is just, because I do not seek My own will, but the will of Him who sent Me.');
    expect(red30).not.toContain('Testimonies about Jesus');
    const verse38 = bsbJohn['5']['38'];
    const red38 = redLetterVerse(bsbJohn, 5, 38, verse38.text).filter((part) => part.red).map((part) => part.text).join('');
    expect(red38).toBe('nor does His word abide in you, because you do not believe the One He sent.');
    expect(red38).not.toContain('The Witness of Scripture');
  });

  it('leaves the non-speech verses John 5:9, 15, and 18 uncoloured', () => {
    for (const { corpus } of john3Versions) {
      const typedCorpus = corpus as unknown as ChapterCorpus;
      for (const verseNumber of [9, 15, 18]) {
        const text = typedCorpus['5'][String(verseNumber)]?.text ?? 'Unannotated verse';
        expect(redLetterVerse(corpus, 5, verseNumber, text).some((part) => part.red)).toBe(false);
      }
    }
  });
});


const john6ReviewedVerses = [5, 10, 12, 20, 26, 27, 29, 32, 33, 35, 36, 37, 38, 39, 40, 43, 44, 45, 46, 47, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58, 61, 62, 63, 64, 65, 67, 70] as const;

describe('John chapter 6 translation-specific red-letter spans', () => {
  it.each(john3Versions)('$version has reviewed Jesus-speech spans in John 6', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john6ReviewedVerses) {
      const annotation = typedCorpus['6'][String(verseNumber)];
      expect(annotation, `missing John 6:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 6, verseNumber, annotation.text);
      expect(parts.map((part) => part.text).join('')).toBe(annotation.text);
      expect(parts.some((part) => part.red)).toBe(true);
    }
  });

  it('keeps attribution separate in John 6:5, 10, 26, and 43', () => {
    const cases = [
      { corpus: webJohn, verse: 5, spoken: 'Where are we to buy bread, that these may eat?”', attribution: 'said to Philip' },
      { corpus: asvJohn, verse: 5, spoken: 'Whence are we to buy bread, that these may eat?', attribution: 'saith unto Philip' },
      { corpus: yltJohn, verse: 5, spoken: "Whence shall we buy loaves, that these may eat?'", attribution: 'saith unto Philip' },
      { corpus: bsbJohn, verse: 10, spoken: '“Have the people sit down,”', attribution: 'Jesus said' },
      { corpus: webJohn, verse: 26, spoken: 'Most certainly I tell you, you seek me, not because you saw signs, but because you ate of the loaves, and were filled.', attribution: 'Jesus answered them' },
      { corpus: bsbJohn, verse: 43, spoken: '“Stop grumbling among yourselves,”', attribution: 'Jesus replied' },
    ];
    for (const item of cases) {
      const annotation = (item.corpus as unknown as ChapterCorpus)['6'][String(item.verse)];
      const parts = redLetterVerse(item.corpus, 6, item.verse, annotation.text);
      expect(parts.filter(part => part.red).map(part => part.text).join('')).toBe(item.spoken);
      expect(parts.some(part => !part.red && part.text.includes(item.attribution))).toBe(true);
    }
  });

  it('does not colour BSB John 6:58 section heading or John 6:64 narration', () => {
    const verse58 = bsbJohn['6']['58'];
    const red58 = redLetterVerse(bsbJohn, 6, 58, verse58.text).filter(part => part.red).map(part => part.text).join('');
    expect(red58).toBe('This is the bread that came down from heaven. Unlike your fathers, who ate the manna and died, the one who eats this bread will live forever.”');
    expect(red58).not.toContain('Many Disciples Turn Back');
    const verse64 = bsbJohn['6']['64'];
    const red64 = redLetterVerse(bsbJohn, 6, 64, verse64.text).filter(part => part.red).map(part => part.text).join('');
    expect(red64).toBe('However, there are some of you who do not believe.”');
    expect(red64).not.toContain('For Jesus had known');
  });

  it('leaves John 6:28, 31, 34, 60, 66, 68, 69, and 71 uncoloured', () => {
    for (const { corpus } of john3Versions) {
      for (const verseNumber of [28, 31, 34, 60, 66, 68, 69, 71]) {
        const text = (corpus as unknown as ChapterCorpus)['6'][String(verseNumber)]?.text ?? 'Unannotated verse';
        expect(redLetterVerse(corpus, 6, verseNumber, text).some(part => part.red)).toBe(false);
      }
    }
  });
});


const john7ReviewedVerses = [6, 7, 8, 16, 17, 18, 19, 21, 22, 23, 24, 28, 29, 33, 34, 37, 38] as const;

describe('John chapter 7 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 7', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john7ReviewedVerses) {
      const annotation = typedCorpus['7'][String(verseNumber)];
      expect(annotation, `missing John 7:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 7, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('keeps verse attributions outside the red text in John 7:6, 16, 21, 28, 33, and 37', () => {
    const cases = [
      { corpus: webJohn, verse: 6, speech: 'My time has not yet come, but your time is always ready.', attribution: 'Jesus therefore said to them' },
      { corpus: asvJohn, verse: 16, speech: 'My teaching is not mine, but his that sent me.', attribution: 'Jesus therefore answered them' },
      { corpus: yltJohn, verse: 21, speech: 'One work I did, and ye all wonder,', attribution: 'Jesus answered and said to them' },
      { corpus: bsbJohn, verse: 28, speech: 'You know Me, and you know where I am from. I have not come of My own accord, but He who sent Me is true. You do not know Him,', attribution: 'Then Jesus, still teaching' },
      { corpus: webJohn, verse: 33, speech: 'I will be with you a little while longer, then I go to him who sent me.', attribution: 'Then Jesus said' },
      { corpus: asvJohn, verse: 37, speech: 'If any man thirst, let him come unto me and drink.', attribution: 'Jesus stood and cried, saying' },
    ];
    for (const item of cases) {
      const annotation = (item.corpus as unknown as ChapterCorpus)['7'][String(item.verse)];
      const parts = redLetterVerse(item.corpus, 7, item.verse, annotation.text);
      expect(parts.filter(part => part.red).map(part => part.text).join('')).toBe(item.speech);
      expect(parts.some(part => !part.red && part.text.includes(item.attribution))).toBe(true);
    }
  });

  it('keeps BSB John 7:16 speaker attribution separate and excludes the 7:24 section heading', () => {
    const verse16 = bsbJohn['7']['16'];
    const red16 = redLetterVerse(bsbJohn, 7, 16, verse16.text).filter(part => part.red).map(part => part.text).join('');
    expect(red16).toBe('“My teaching is not My own,”“ It comes from Him who sent Me.');
    expect(redLetterVerse(bsbJohn, 7, 16, verse16.text).some(part => !part.red && part.text.includes('Jesus replied'))).toBe(true);
    const verse24 = bsbJohn['7']['24'];
    const red24 = redLetterVerse(bsbJohn, 7, 24, verse24.text).filter(part => part.red).map(part => part.text).join('');
    expect(red24).toBe('Stop judging by outward appearances, and start judging justly.”');
    expect(red24).not.toContain('Is Jesus the Christ?');
  });

  it('leaves other speakers and narration in John 7 uncoloured', () => {
    for (const { corpus } of versions) {
      for (const verseNumber of [20, 25, 26, 27, 30, 31, 32, 35, 36, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53]) {
        const verse = (corpus as unknown as ChapterCorpus)['7'][String(verseNumber)]?.text ?? 'Unannotated verse';
        expect(redLetterVerse(corpus, 7, verseNumber, verse).some(part => part.red)).toBe(false);
      }
    }
  });
});

const john8ReviewedVerses = [12, 21, 23, 24, 28, 31, 32, 34, 36, 51, 56, 58] as const;

describe('John chapter 8 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 8', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john8ReviewedVerses) {
      const annotation = typedCorpus['8'][String(verseNumber)];
      expect(annotation, `missing John 8:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 8, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('keeps speaker introductions outside the red spans in John 8', () => {
    const cases = [
      { corpus: webJohn, verse: 12, attribution: 'Jesus spoke to them, saying' },
      { corpus: asvJohn, verse: 28, attribution: 'Jesus therefore said' },
      { corpus: yltJohn, verse: 21, attribution: 'therefore said Jesus again to them' },
    ];
    for (const item of cases) {
      const annotation = (item.corpus as unknown as ChapterCorpus)['8'][String(item.verse)];
      const parts = redLetterVerse(item.corpus, 8, item.verse, annotation.text);
      expect(parts.some(part => !part.red && part.text.includes(item.attribution))).toBe(true);
    }
  });

  it('splits BSB John 8:58 around the speaker attribution', () => {
    const verse = bsbJohn['8']['58'];
    const parts = redLetterVerse(bsbJohn, 8, 58, verse.text);
    const red = parts.filter(part => part.red).map(part => part.text).join('');
    expect(red).toBe('Truly, truly, I tell you,”before Abraham was born, I am!');
    expect(parts.some(part => !part.red && part.text.includes('Jesus declared'))).toBe(true);
  });

  it('does not apply John 8 red letters when the displayed text differs', () => {
    expect(redLetterVerse(webJohn, 8, 12, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
  it('includes the complete final clause in John 8:23 across translations', () => {
    const cases = [
      { corpus: webJohn, spoken: 'You are from beneath. I am from above. You are of this world. I am not of this world.' },
      { corpus: asvJohn, spoken: 'Ye are from beneath; I am from above: ye are of this world; I am not of this world.' },
      { corpus: bsbJohn, spoken: 'You are from below; I am from above. You are of this world; I am not of this world.' },
      { corpus: yltJohn, spoken: 'Ye are from beneath, I am from above; ye are of this world, I am not of this world;' },
    ];
    for (const item of cases) {
      const verse = (item.corpus as unknown as ChapterCorpus)['8']['23'];
      const red = redLetterVerse(item.corpus, 8, 23, verse.text).filter(part => part.red).map(part => part.text).join('');
      expect(red).toBe(item.spoken);
    }
  });

});
const john9ReviewedVerses = [3, 4, 5, 7, 35, 37, 39, 41] as const;

describe('John chapter 9 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 9', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john9ReviewedVerses) {
      const annotation = typedCorpus['9'][String(verseNumber)];
      expect(annotation, `missing John 9:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 9, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('keeps speaker introductions and the Siloam explanation outside the red spans', () => {
    const verse3 = webJohn['9']['3'];
    const parts3 = redLetterVerse(webJohn, 9, 3, verse3.text);
    expect(parts3.some(part => !part.red && part.text.includes('Jesus answered'))).toBe(true);

    const verse7 = webJohn['9']['7'];
    const red7 = redLetterVerse(webJohn, 9, 7, verse7.text).filter(part => part.red).map(part => part.text).join('');
    expect(red7).toBe('Go, wash in the pool of Siloam”');
    expect(red7).not.toContain('Sent');
  });

  it('splits BSB John 9:37 and 9:41 around Jesus attribution', () => {
    const verse37 = bsbJohn['9']['37'];
    const red37 = redLetterVerse(bsbJohn, 9, 37, verse37.text).filter(part => part.red).map(part => part.text).join('');
    expect(red37).toBe('You have already seen Him,”He is the One speaking with you.”');
    expect(redLetterVerse(bsbJohn, 9, 37, verse37.text).some(part => !part.red && part.text.includes('Jesus answered'))).toBe(true);

    const verse41 = bsbJohn['9']['41'];
    const red41 = redLetterVerse(bsbJohn, 9, 41, verse41.text).filter(part => part.red).map(part => part.text).join('');
    expect(red41).toBe('If you were blind,”you would not be guilty of sin. But since you claim you can see, your guilt remains.”');
    expect(red41).not.toContain('Jesus replied');
  });

  it('does not apply John 9 red letters when the displayed text differs', () => {
    expect(redLetterVerse(yltJohn, 9, 3, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});

const john10ReviewedVerses = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const;

describe('John chapter 10:1-18 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 10:1-18', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john10ReviewedVerses) {
      const annotation = typedCorpus['10'][String(verseNumber)];
      expect(annotation, `missing John 10:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 10, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('keeps the John 10:7 speaker introduction outside the red text', () => {
    const cases = [
      { corpus: webJohn, attribution: 'Jesus therefore said to them again' },
      { corpus: asvJohn, attribution: 'Jesus therefore said unto them again' },
      { corpus: bsbJohn, attribution: 'So He said to them again' },
      { corpus: yltJohn, attribution: 'Jesus said therefore again to them' },
    ];
    for (const item of cases) {
      const verse = (item.corpus as unknown as ChapterCorpus)['10']['7'];
      const parts = redLetterVerse(item.corpus, 10, 7, verse.text);
      expect(parts.some(part => !part.red && part.text.includes(item.attribution))).toBe(true);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('does not apply John 10 red letters when the displayed text differs', () => {
    expect(redLetterVerse(webJohn, 10, 7, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});

const john10LaterReviewedVerses = [25, 26, 27, 28, 29, 30, 32, 34, 35, 36, 37, 38] as const;

describe('John chapter 10:25-38 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 10:25-38', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john10LaterReviewedVerses) {
      const annotation = typedCorpus['10'][String(verseNumber)];
      expect(annotation, `missing John 10:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 10, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('splits BSB John 10:25 around Jesus replied and keeps attribution uncoloured', () => {
    const verse = bsbJohn['10']['25'];
    const parts = redLetterVerse(bsbJohn, 10, 25, verse.text);
    const red = parts.filter(part => part.red).map(part => part.text).join('');
    expect(red).toBe('I already told you,”but you did not believe. The works I do in My Father’s name testify on My behalf.');
    expect(parts.some(part => !part.red && part.text.includes('Jesus replied'))).toBe(true);
  });

  it('keeps speaker introductions outside the red text in John 10:32 and 10:34', () => {
    const cases = [
      { corpus: webJohn, verse: 32, attribution: 'Jesus answered them' },
      { corpus: bsbJohn, verse: 32, attribution: 'But Jesus responded' },
      { corpus: yltJohn, verse: 34, attribution: 'Jesus answered them' },
    ];
    for (const item of cases) {
      const verse = (item.corpus as unknown as ChapterCorpus)['10'][String(item.verse)];
      const parts = redLetterVerse(item.corpus, 10, item.verse, verse.text);
      expect(parts.some(part => !part.red && part.text.includes(item.attribution))).toBe(true);
    }
  });

  it('does not apply later John 10 red letters when the displayed text differs', () => {
    expect(redLetterVerse(bsbJohn, 10, 25, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});

const john11ReviewedVerses = [4, 7, 9, 10, 11, 14, 15, 23, 25, 26, 34, 39, 40, 41, 42, 43, 44] as const;

describe('John chapter 11 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 11', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john11ReviewedVerses) {
      const annotation = typedCorpus['11'][String(verseNumber)];
      expect(annotation, `missing John 11:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 11, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('keeps speaker introductions and other speakers out of John 11 red text', () => {
    const verse9 = webJohn['11']['9'];
    expect(redLetterVerse(webJohn, 11, 9, verse9.text).some(part => !part.red && part.text.includes('Jesus answered'))).toBe(true);

    const verse34 = bsbJohn['11']['34'];
    const red34 = redLetterVerse(bsbJohn, 11, 34, verse34.text).filter(part => part.red).map(part => part.text).join('');
    expect(red34).toBe('Where have you put him?”');
    expect(red34).not.toContain('Come and see');
    expect(redLetterVerse(bsbJohn, 11, 34, verse34.text).some(part => !part.red && part.text.includes('He asked'))).toBe(true);

    const verse39 = bsbJohn['11']['39'];
    const red39 = redLetterVerse(bsbJohn, 11, 39, verse39.text).filter(part => part.red).map(part => part.text).join('');
    expect(red39).toBe('Take away the stone,”');
    expect(red39).not.toContain('Lord, by now he stinks');

    const verse44 = bsbJohn['11']['44'];
    const red44 = redLetterVerse(bsbJohn, 11, 44, verse44.text).filter(part => part.red).map(part => part.text).join('');
    expect(red44).toBe('Unwrap him and let him go,”');
    expect(red44).not.toContain('The Plot to Kill Jesus');
  });

  it('does not apply John 11 red letters when the displayed text differs', () => {
    expect(redLetterVerse(asvJohn, 11, 43, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});

const john12ReviewedVerses = [7, 8, 23, 24, 25, 26, 27, 28, 30, 31, 32, 35, 36, 44, 45, 46, 47, 48, 49, 50] as const;

describe('John chapter 12 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 12', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john12ReviewedVerses) {
      const annotation = typedCorpus['12'][String(verseNumber)];
      expect(annotation, `missing John 12:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 12, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('splits BSB John 12:7 and excludes the John 12:8 section heading', () => {
    const verse7 = bsbJohn['12']['7'];
    const parts7 = redLetterVerse(bsbJohn, 12, 7, verse7.text);
    const red7 = parts7.filter(part => part.red).map(part => part.text).join('');
    expect(red7).toBe('Leave her alone,”She has kept this perfume in preparation for the day of My burial.');
    expect(parts7.some(part => !part.red && part.text.includes('Jesus replied'))).toBe(true);

    const verse8 = bsbJohn['12']['8'];
    const red8 = redLetterVerse(bsbJohn, 12, 8, verse8.text).filter(part => part.red).map(part => part.text).join('');
    expect(red8).toBe('The poor you will always have with you, but you will not always have Me.”');
    expect(red8).not.toContain('The Plot to Kill Lazarus');
  });

  it('stops Jesus speech before the heavenly voice and narration in John 12:28 and 12:36', () => {
    const verse28 = webJohn['12']['28'];
    const red28 = redLetterVerse(webJohn, 12, 28, verse28.text).filter(part => part.red).map(part => part.text).join('');
    expect(red28).toBe('Father, glorify your name!”');
    expect(red28).not.toContain('I have both glorified it');

    const verse36 = bsbJohn['12']['36'];
    const red36 = redLetterVerse(bsbJohn, 12, 36, verse36.text).filter(part => part.red).map(part => part.text).join('');
    expect(red36).toBe('While you have the Light, believe in the Light, so that you may become sons of light.”');
    expect(red36).not.toContain('After Jesus had spoken');
  });

  it('keeps the John 12:44 speaker introduction outside the red text', () => {
    const verse = webJohn['12']['44'];
    const parts = redLetterVerse(webJohn, 12, 44, verse.text);
    expect(parts.some(part => !part.red && part.text.includes('Jesus cried out and said'))).toBe(true);
    expect(parts.some(part => part.red)).toBe(true);
  });

  it('does not apply John 12 red letters when the displayed text differs', () => {
    expect(redLetterVerse(yltJohn, 12, 50, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});

const john13ReviewedVerses = [7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 26, 27, 31, 32, 33, 34, 35, 36, 38] as const;

describe('John chapter 13 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 13', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john13ReviewedVerses) {
      const annotation = typedCorpus['13'][String(verseNumber)];
      expect(annotation, `missing John 13:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 13, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('keeps Peter’s words and Jesus speaker attributions uncoloured in John 13:8 and 13:36', () => {
    const verse8 = bsbJohn['13']['8'];
    const red8 = redLetterVerse(bsbJohn, 13, 8, verse8.text).filter(part => part.red).map(part => part.text).join('');
    expect(red8).toBe('Unless I wash you, you have no part with Me.”');
    expect(redLetterVerse(bsbJohn, 13, 8, verse8.text).some(part => !part.red && part.text.includes('Never shall You wash my feet'))).toBe(true);

    const verse36 = bsbJohn['13']['36'];
    const parts36 = redLetterVerse(bsbJohn, 13, 36, verse36.text);
    expect(parts36.some(part => !part.red && part.text.includes('Simon Peter asked'))).toBe(true);
    expect(parts36.some(part => !part.red && part.text.includes('Jesus answered'))).toBe(true);
  });

  it('excludes narration and section headings in John 13:11, 13:17, and 13:26', () => {
    const verse11 = bsbJohn['13']['11'];
    expect(redLetterVerse(bsbJohn, 13, 11, verse11.text).filter(part => part.red).map(part => part.text).join('')).toBe('Not all of you are clean.”');

    const verse17 = bsbJohn['13']['17'];
    const red17 = redLetterVerse(bsbJohn, 13, 17, verse17.text).filter(part => part.red).map(part => part.text).join('');
    expect(red17).toBe('If you know these things, you will be blessed if you do them.');
    expect(red17).not.toContain('Jesus Predicts His Betrayal');

    const verse26 = bsbJohn['13']['26'];
    const red26 = redLetterVerse(bsbJohn, 13, 26, verse26.text).filter(part => part.red).map(part => part.text).join('');
    expect(red26).toBe('It is the one to whom I give this morsel after I have dipped it.”');
    expect(red26).not.toContain('Then He dipped the morsel');
  });

  it('splits BSB John 13:38 around Jesus replied', () => {
    const verse = bsbJohn['13']['38'];
    const parts = redLetterVerse(bsbJohn, 13, 38, verse.text);
    const red = parts.filter(part => part.red).map(part => part.text).join('');
    expect(red).toBe('Will you lay down your life for Me?”Truly, truly, I tell you, before the rooster crows, you will deny Me three times.’’');
    expect(parts.some(part => !part.red && part.text.includes('Jesus replied'))).toBe(true);
  });

  it('does not apply John 13 red letters when the displayed text differs', () => {
    expect(redLetterVerse(webJohn, 13, 34, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});

const john14ReviewedVerses = [1, 2, 3, 4, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31] as const;

describe('John chapter 14 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 14', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john14ReviewedVerses) {
      const annotation = typedCorpus['14'][String(verseNumber)];
      expect(annotation, `missing John 14:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 14, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('keeps BSB John 14 section headings outside the red text', () => {
    const verse4 = bsbJohn['14']['4'];
    const red4 = redLetterVerse(bsbJohn, 14, 4, verse4.text).filter(part => part.red).map(part => part.text).join('');
    expect(red4).toBe('You know the way to the place where I am going. ”');
    expect(red4).not.toContain('The Way, the Truth, and the Life');

    const verse14 = bsbJohn['14']['14'];
    const red14 = redLetterVerse(bsbJohn, 14, 14, verse14.text).filter(part => part.red).map(part => part.text).join('');
    expect(red14).toBe('If you ask Me for anything in My name, I will do it.');
    expect(red14).not.toContain('Jesus Promises the Holy Spirit');

    const verse26 = bsbJohn['14']['26'];
    const red26 = redLetterVerse(bsbJohn, 14, 26, verse26.text).filter(part => part.red).map(part => part.text).join('');
    expect(red26).toBe('But the Advocate, the Holy Spirit, whom the Father will send in My name, will teach you all things and will remind you of everything I have told you.');
    expect(red26).not.toContain('Peace I Leave with You');
  });

  it('keeps the John 14:6 speaker introduction outside the red text', () => {
    const verse = bsbJohn['14']['6'];
    const parts = redLetterVerse(bsbJohn, 14, 6, verse.text);
    expect(parts.some(part => !part.red && part.text.includes('Jesus answered'))).toBe(true);
    expect(parts.some(part => part.red)).toBe(true);
  });

  it('does not apply John 14 red letters when the displayed text differs', () => {
    expect(redLetterVerse(webJohn, 14, 23, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});

const john15ReviewedVerses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27] as const;

describe('John chapter 15 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 15', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john15ReviewedVerses) {
      const annotation = typedCorpus['15'][String(verseNumber)];
      expect(annotation, `missing John 15:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 15, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('excludes BSB John 15:8 and 15:17 section headings', () => {
    const verse8 = bsbJohn['15']['8'];
    const red8 = redLetterVerse(bsbJohn, 15, 8, verse8.text).filter(part => part.red).map(part => part.text).join('');
    expect(red8).toBe('This is to My Father’s glory, that you bear much fruit, proving yourselves to be My disciples.');
    expect(red8).not.toContain('No Greater Love');

    const verse17 = bsbJohn['15']['17'];
    const red17 = redLetterVerse(bsbJohn, 15, 17, verse17.text).filter(part => part.red).map(part => part.text).join('');
    expect(red17).toBe('This is My command to you: Love one another.');
    expect(red17).not.toContain('The Hatred of the World');
  });

  it('does not apply John 15 red letters when the displayed text differs', () => {
    expect(redLetterVerse(webJohn, 15, 1, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});

const john16ReviewedVerses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33] as const;

describe('John chapter 16 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 16', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john16ReviewedVerses) {
      const annotation = typedCorpus['16'][String(verseNumber)];
      expect(annotation, `missing John 16:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 16, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('excludes BSB John 16:4, 16, and 22 section headings', () => {
    const cases = [
      { verse: 4, speech: 'But I have told you these things so that when their hour comes, you will remember that I told you about them. I did not tell you these things from the beginning, because I was with you.' },
      { verse: 16, speech: 'In a little while you will see Me no more, and then after a little while you will see Me. ”' },
      { verse: 22, speech: 'So also you have sorrow now, but I will see you again and your hearts will rejoice, and no one will take away your joy.' },
    ];
    for (const item of cases) {
      const verse = bsbJohn['16'][String(item.verse) as '4' | '16' | '22'];
      const red = redLetterVerse(bsbJohn, 16, item.verse, verse.text).filter(part => part.red).map(part => part.text).join('');
      expect(red).toBe(item.speech);
      expect(red).not.toContain('The Promise of the Holy Spirit');
      expect(red).not.toContain('Grief Will Turn to Joy');
      expect(red).not.toContain('Ask in My Name');
    }
  });

  it('keeps the speaker introduction outside John 16:19 red text', () => {
    const verse = bsbJohn['16']['19'];
    const parts = redLetterVerse(bsbJohn, 16, 19, verse.text);
    expect(parts.some(part => !part.red && part.text.includes('Jesus said to them'))).toBe(true);
    expect(parts.some(part => part.red)).toBe(true);
  });

  it('keeps BSB John 16:31 Jesus replied attribution outside the spoken question', () => {
    const verse = bsbJohn['16']['31'];
    const parts = redLetterVerse(bsbJohn, 16, 31, verse.text);
    expect(parts.filter(part => part.red).map(part => part.text).join('')).toBe('Do you finally believe?”');
    expect(parts.some(part => !part.red && part.text.includes('Jesus replied'))).toBe(true);
  });

  it('does not apply John 16 red letters when the displayed text differs', () => {
    expect(redLetterVerse(webJohn, 16, 33, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});

const john17ReviewedVerses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26] as const;

describe('John chapter 17 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 17', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john17ReviewedVerses) {
      const annotation = typedCorpus['17'][String(verseNumber)];
      expect(annotation, `missing John 17:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 17, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('keeps John 17:1 narration outside the prayer', () => {
    const verse = bsbJohn['17']['1'];
    const parts = redLetterVerse(bsbJohn, 17, 1, verse.text);
    expect(parts.some(part => !part.red && part.text.includes('When Jesus had spoken these things'))).toBe(true);
    expect(parts.filter(part => part.red).map(part => part.text).join('')).toBe('Father, the hour has come. Glorify Your Son, that Your Son may glorify You.');
  });

  it('excludes BSB John 17:5 and 17:19 section headings', () => {
    const verse5 = bsbJohn['17']['5'];
    const red5 = redLetterVerse(bsbJohn, 17, 5, verse5.text).filter(part => part.red).map(part => part.text).join('');
    expect(red5).toBe('And now, Father, glorify Me in Your presence with the glory I had with You before the world existed.');
    expect(red5).not.toContain('Prayer for the Disciples');

    const verse19 = bsbJohn['17']['19'];
    const red19 = redLetterVerse(bsbJohn, 17, 19, verse19.text).filter(part => part.red).map(part => part.text).join('');
    expect(red19).toBe('For them I sanctify Myself, so that they too may be sanctified by the truth.');
    expect(red19).not.toContain('Prayer for All Believers');
  });

  it('does not apply John 17 red letters when the displayed text differs', () => {
    expect(redLetterVerse(yltJohn, 17, 26, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});

const john18ReviewedVerses = [4, 5, 6, 7, 8, 11, 20, 21, 23, 34, 36, 37] as const;

describe('John chapter 18 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 18', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john18ReviewedVerses) {
      const annotation = typedCorpus['18'][String(verseNumber)];
      expect(annotation, `missing John 18:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 18, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('highlights the reported words in John 18:6 but not the surrounding narration', () => {
    const cases = [
      { corpus: webJohn, speech: 'I am he,”', narration: 'they went backward' },
      { corpus: asvJohn, speech: 'I am he,', narration: 'they went backward' },
      { corpus: bsbJohn, speech: 'I am He,”', narration: 'they drew back' },
      { corpus: yltJohn, speech: 'I am [he],\'' },
    ];
    for (const item of cases) {
      const verse = item.corpus['18']['6'];
      const parts = redLetterVerse(item.corpus, 18, 6, verse.text);
      expect(parts.filter(part => part.red).map(part => part.text).join('')).toBe(item.speech);
      expect(parts.some(part => !part.red && part.text.includes(item.narration ?? 'they went'))).toBe(true);
    }
  });

  it('splits BSB John 18:8, 11, 20, 34, and 37 around speaker attributions', () => {
    const cases = [
      { verse: 8, spoken: 'I told you that I am He,”So if you are looking for Me, let these men go.”', attribution: 'Jesus replied' },
      { verse: 11, spoken: 'Put your sword back in its sheath!”Shall I not drink the cup the Father has given Me?”', attribution: 'Jesus said to Peter' },
      { verse: 20, spoken: 'I have spoken openly to the world,”I always taught in the synagogues and at the temple, where all the Jews come together. I said nothing in secret.', attribution: 'Jesus answered' },
      { verse: 34, spoken: 'Are you saying this on your own,”or did others tell you about Me?”', attribution: 'Jesus asked' },
      { verse: 37, spoken: 'You say that I am a king,”For this reason I was born and have come into the world, to testify to the truth. Everyone who belongs to the truth listens to My voice.”', attribution: 'Jesus answered' },
    ];
    for (const item of cases) {
      const verse = bsbJohn['18'][String(item.verse) as '8' | '11' | '20' | '34' | '37'];
      const parts = redLetterVerse(bsbJohn, 18, item.verse, verse.text);
      expect(parts.filter(part => part.red).map(part => part.text).join('')).toBe(item.spoken);
      expect(parts.some(part => !part.red && part.text.includes(item.attribution))).toBe(true);
    }
  });

  it('keeps other speakers uncoloured in John 18:5 and 18:7', () => {
    const verse5 = bsbJohn['18']['5'];
    expect(redLetterVerse(bsbJohn, 18, 5, verse5.text).some(part => !part.red && part.text.includes('Jesus of Nazareth'))).toBe(true);
    const verse7 = bsbJohn['18']['7'];
    expect(redLetterVerse(bsbJohn, 18, 7, verse7.text).some(part => !part.red && part.text.includes('Jesus of Nazareth'))).toBe(true);
  });

  it('does not apply John 18 red letters when the displayed text differs', () => {
    expect(redLetterVerse(webJohn, 18, 36, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});

const john19ReviewedVerses = [11, 26, 27, 28, 30] as const;

describe('John chapter 19 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 19', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john19ReviewedVerses) {
      const annotation = typedCorpus['19'][String(verseNumber)];
      expect(annotation, `missing John 19:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 19, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('keeps the John 19:11 speaker introduction outside the complete spoken answer', () => {
    const verse = bsbJohn['19']['11'];
    const parts = redLetterVerse(bsbJohn, 19, 11, verse.text);
    const red = parts.filter(part => part.red).map(part => part.text).join('');
    expect(red).toBe('You would have no authority over Me if it were not given to you from above. Therefore the one who handed Me over to you is guilty of greater sin.”');
    expect(parts.some(part => !part.red && part.text.includes('Jesus answered'))).toBe(true);
  });

  it('highlights only Jesus’ words to His mother and the disciple', () => {
    const verse26 = bsbJohn['19']['26'];
    expect(redLetterVerse(bsbJohn, 19, 26, verse26.text).filter(part => part.red).map(part => part.text).join('')).toBe('Woman, here is your son.”');

    const verse27 = bsbJohn['19']['27'];
    const red27 = redLetterVerse(bsbJohn, 19, 27, verse27.text).filter(part => part.red).map(part => part.text).join('');
    expect(red27).toBe('Here is your mother.”');
    expect(red27).not.toContain('The Death of Jesus');
  });

  it('excludes the BSB John 19:30 section heading', () => {
    const verse = bsbJohn['19']['30'];
    const red = redLetterVerse(bsbJohn, 19, 30, verse.text).filter(part => part.red).map(part => part.text).join('');
    expect(red).toBe('It is finished.”');
    expect(red).not.toContain('Jesus’ Side Is Pierced');
  });

  it('does not apply John 19 red letters when the displayed text differs', () => {
    expect(redLetterVerse(webJohn, 19, 28, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});

const john20ReviewedVerses = [15, 16, 17, 19, 21, 22, 23, 26, 27, 29] as const;

describe('John chapter 20 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 20', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john20ReviewedVerses) {
      const annotation = typedCorpus['20'][String(verseNumber)];
      expect(annotation, `missing John 20:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 20, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('splits BSB John 20:15 and 20:17 around speaker attributions', () => {
    const verse15 = bsbJohn['20']['15'];
    const parts15 = redLetterVerse(bsbJohn, 20, 15, verse15.text);
    const red15 = parts15.filter(part => part.red).map(part => part.text).join('');
    expect(red15).toBe('Woman, why are you weeping?”Whom are you seeking?”');
    expect(parts15.some(part => !part.red && part.text.includes('Jesus asked'))).toBe(true);
    expect(red15).not.toContain('Sir, if you have carried Him off');

    const verse17 = bsbJohn['20']['17'];
    const parts17 = redLetterVerse(bsbJohn, 20, 17, verse17.text);
    const red17 = parts17.filter(part => part.red).map(part => part.text).join('');
    expect(red17).toBe('Do not cling to Me,”for I have not yet ascended to the Father. But go and tell My brothers, ‘I am ascending to My Father and your Father, to My God and your God.’”');
    expect(parts17.some(part => !part.red && part.text.includes('Jesus said'))).toBe(true);
  });

  it('keeps Mary’s reply and Rabboni outside Jesus’ words in John 20:16', () => {
    const verse = bsbJohn['20']['16'];
    const parts = redLetterVerse(bsbJohn, 20, 16, verse.text);
    expect(parts.filter(part => part.red).map(part => part.text).join('')).toBe('Mary.”');
    expect(parts.some(part => !part.red && part.text.includes('Rabboni'))).toBe(true);
  });

  it('excludes BSB John 20:23 and 20:29 section headings', () => {
    const verse23 = bsbJohn['20']['23'];
    const red23 = redLetterVerse(bsbJohn, 20, 23, verse23.text).filter(part => part.red).map(part => part.text).join('');
    expect(red23).toBe('If you forgive anyone his sins, they are forgiven; if you withhold forgiveness from anyone, it is withheld.”');
    expect(red23).not.toContain('Jesus Appears to Thomas');

    const verse29 = bsbJohn['20']['29'];
    const red29 = redLetterVerse(bsbJohn, 20, 29, verse29.text).filter(part => part.red).map(part => part.text).join('');
    expect(red29).toBe('Because you have seen Me, you have believed; blessed are those who have not seen and yet have believed.”');
    expect(red29).not.toContain('The Purpose of John’s Book');
  });

  it('does not apply John 20 red letters when the displayed text differs', () => {
    expect(redLetterVerse(webJohn, 20, 27, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});

const john21ReviewedVerses = [5, 6, 10, 12, 15, 16, 17, 18, 19, 22] as const;

describe('John chapter 21 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in John 21', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john21ReviewedVerses) {
      const annotation = typedCorpus['21'][String(verseNumber)];
      expect(annotation, `missing John 21:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 21, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('keeps the fishermen’s answer outside Jesus’ words in John 21:5 and 21:6', () => {
    const verse5 = bsbJohn['21']['5'];
    const red5 = redLetterVerse(bsbJohn, 21, 5, verse5.text).filter(part => part.red).map(part => part.text).join('');
    expect(red5).toBe('Children, do you have any fish?”');
    expect(red5).not.toContain('No,” they answered');

    const verse6 = bsbJohn['21']['6'];
    const red6 = redLetterVerse(bsbJohn, 21, 6, verse6.text).filter(part => part.red).map(part => part.text).join('');
    expect(red6).toBe('Cast the net on the right side of the boat, and you will find some.”');
    expect(red6).not.toContain('So they cast it there');
  });

  it('splits BSB John 21:15-17 around Peter’s replies and Jesus’ attributions', () => {
    const expected = {
      15: 'Simon son of John, do you love Me more than these?”Feed My lambs.”',
      16: 'Simon son of John, do you love Me?”Shepherd My sheep.”',
      17: 'Simon son of John, do you love Me?”Do you love Me?”Feed My sheep.',
    };
    for (const verseNumber of [15, 16, 17] as const) {
      const verse = bsbJohn['21'][String(verseNumber) as '15' | '16' | '17'];
      const parts = redLetterVerse(bsbJohn, 21, verseNumber, verse.text);
      const red = parts.filter(part => part.red).map(part => part.text).join('');
      expect(red).toBe(expected[verseNumber]);
      expect(parts.some(part => !part.red && (part.text.includes('Yes, Lord') || part.text.includes('Lord, You know all things')))).toBe(true);
    }
  });

  it('keeps the John 21:19 narration and section heading outside Follow Me', () => {
    const verse = bsbJohn['21']['19'];
    const parts = redLetterVerse(bsbJohn, 21, 19, verse.text);
    expect(parts.filter(part => part.red).map(part => part.text).join('')).toBe('Follow Me.”');
    expect(parts.some(part => !part.red && part.text.includes('Jesus said this to indicate'))).toBe(true);
    expect(parts.some(part => !part.red && part.text.includes('Jesus and the Beloved Disciple'))).toBe(true);
  });

  it('does not apply John 21 red letters when the displayed text differs', () => {
    expect(redLetterVerse(yltJohn, 21, 22, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});

const john8RemainingVerses = [7, 10, 11, 14, 15, 16, 17, 18, 19, 25, 26, 29, 35, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 49, 50, 54, 55] as const;

describe('John chapter 8 remaining translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: john },
    { version: 'WEB', corpus: webJohn },
    { version: 'ASV', corpus: asvJohn },
    { version: 'BSB', corpus: bsbJohn },
    { version: 'YLT', corpus: yltJohn },
  ];

  it.each(versions)('$version has the remaining reviewed Jesus-speech spans in John 8', ({ corpus }) => {
    const typedCorpus = corpus as unknown as ChapterCorpus;
    for (const verseNumber of john8RemainingVerses) {
      const annotation = typedCorpus['8'][String(verseNumber)];
      expect(annotation, `missing John 8:${verseNumber} annotation`).toBeDefined();
      const parts = redLetterVerse(corpus, 8, verseNumber, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('splits BSB John 8:11, 8:19, 8:39, and 8:49 around speaker attributions', () => {
    const cases = [
      { verse: 11, spoken: 'Then neither do I condemn you,”Now go and sin no more.”', attribution: 'Jesus declared' },
      { verse: 19, spoken: 'You do not know Me or My Father,”If you knew Me, you would know My Father as well.”', attribution: 'Jesus answered' },
      { verse: 39, spoken: 'If you were children of Abraham,”you would do the works of Abraham.', attribution: 'said Jesus' },
      { verse: 49, spoken: 'I do not have a demon,”but I honor My Father, and you dishonor Me.', attribution: 'Jesus replied' },
    ];
    for (const item of cases) {
      const verse = bsbJohn['8'][String(item.verse) as '11' | '19' | '39' | '49'];
      const parts = redLetterVerse(bsbJohn, 8, item.verse, verse.text);
      expect(parts.filter(part => part.red).map(part => part.text).join('')).toBe(item.spoken);
      expect(parts.some(part => !part.red && part.text.includes(item.attribution))).toBe(true);
    }
  });

  it('keeps other speakers uncoloured and excludes BSB John 8 headings', () => {
    const verse7 = bsbJohn['8']['7'];
    expect(redLetterVerse(bsbJohn, 8, 7, verse7.text).filter(part => part.red).map(part => part.text).join('')).toBe('Let him who is without sin among you be the first to cast a stone at her.”');

    const verse10 = bsbJohn['8']['10'];
    expect(redLetterVerse(bsbJohn, 8, 10, verse10.text).filter(part => part.red).map(part => part.text).join('')).toBe('Woman, where are your accusers? Has no one condemned you?”');

    const verse25 = bsbJohn['8']['25'];
    const red25 = redLetterVerse(bsbJohn, 8, 25, verse25.text).filter(part => part.red).map(part => part.text).join('');
    expect(red25).toBe('Just what I have been telling you from the beginning,”');
    expect(redLetterVerse(bsbJohn, 8, 25, verse25.text).some(part => !part.red && part.text.includes('Jesus replied'))).toBe(true);

    const verse29 = bsbJohn['8']['29'];
    const red29 = redLetterVerse(bsbJohn, 8, 29, verse29.text).filter(part => part.red).map(part => part.text).join('');
    expect(red29).toBe('He who sent Me is with Me. He has not left Me alone, because I always do what pleases Him.”');
    expect(red29).not.toContain('The Truth Will Set You Free');

    const verse41 = bsbJohn['8']['41'];
    expect(redLetterVerse(bsbJohn, 8, 41, verse41.text).filter(part => part.red).map(part => part.text).join('')).toBe('You are doing the works of your father.”');

    const verse47 = bsbJohn['8']['47'];
    const red47 = redLetterVerse(bsbJohn, 8, 47, verse47.text).filter(part => part.red).map(part => part.text).join('');
    expect(red47).toBe('Whoever belongs to God hears the words of God. The reason you do not hear is that you do not belong to God.”');
    expect(red47).not.toContain('Before Abraham Was Born');
  });

  it('includes the complete spoken statements in John 8:7 and 8:10 across versions', () => {
    const cases = [
      { corpus: webJohn, seven: 'He who is without sin among you, let him throw the first stone at her.”', ten: 'Woman, where are your accusers? Did no one condemn you?”' },
      { corpus: asvJohn, seven: 'He that is without sin among you, let him first cast a stone at her.', ten: 'Woman, where are they? did no man condemn thee?' },
      { corpus: bsbJohn, seven: 'Let him who is without sin among you be the first to cast a stone at her.”', ten: 'Woman, where are your accusers? Has no one condemned you?”' },
      { corpus: yltJohn, seven: 'The sinless of you — let him first cast the stone at her;\'', ten: 'Woman, where are those — thine accusers? did no one pass sentence upon thee?\'' },
    ];
    for (const item of cases) {
      const verse7 = item.corpus['8']['7'];
      const red7 = redLetterVerse(item.corpus, 8, 7, verse7.text).filter(part => part.red).map(part => part.text).join('');
      expect(red7).toBe(item.seven);
      const verse10 = item.corpus['8']['10'];
      const red10 = redLetterVerse(item.corpus, 8, 10, verse10.text).filter(part => part.red).map(part => part.text).join('');
      expect(red10).toBe(item.ten);
    }
  });

  it('does not apply remaining John 8 red letters when the displayed text differs', () => {
    expect(redLetterVerse(asvJohn, 8, 55, 'Changed wording')).toEqual([{ text: 'Changed wording', red: false }]);
  });
});

const matthew34Reviewed = [{ chapter: 3, verse: 15 }, { chapter: 4, verse: 4 }, { chapter: 4, verse: 7 }, { chapter: 4, verse: 10 }, { chapter: 4, verse: 17 }, { chapter: 4, verse: 19 }] as const;

describe('Matthew 3-4 translation-specific red-letter spans', () => {
  const versions = [
    { version: 'KJV', corpus: matthew },
    { version: 'WEB', corpus: webMatthew },
    { version: 'ASV', corpus: asvMatthew },
    { version: 'BSB', corpus: bsbMatthew },
    { version: 'YLT', corpus: yltMatthew },
  ];

  it.each(versions)('$version has reviewed Jesus-speech spans in Matthew 3-4', ({ corpus }) => {
    for (const item of matthew34Reviewed) {
      const annotation = corpus[String(item.chapter)][String(item.verse)];
      expect(annotation, `missing Matthew ${item.chapter}:${item.verse}`).toBeDefined();
      const parts = redLetterVerse(corpus, item.chapter, item.verse, annotation.text);
      expect(parts.map(part => part.text).join('')).toBe(annotation.text);
      expect(parts.some(part => part.red)).toBe(true);
    }
  });

  it('splits BSB Matthew 3:15, 4:10, and 4:19 around Jesus attributions', () => {
    const verse315 = bsbMatthew['3']['15'];
    const parts315 = redLetterVerse(bsbMatthew, 3, 15, verse315.text);
    expect(parts315.filter(part => part.red).map(part => part.text).join('')).toBe('Let it be so now,”It is fitting for us to fulfill all righteousness in this way.”');
    expect(parts315.some(part => !part.red && part.text.includes('Jesus replied'))).toBe(true);

    const verse410 = bsbMatthew['4']['10'];
    const parts410 = redLetterVerse(bsbMatthew, 4, 10, verse410.text);
    expect(parts410.filter(part => part.red).map(part => part.text).join('')).toBe('Away from Me, Satan!”For it is written: ‘Worship the Lord your God and serve Him only.’ ”');
    expect(parts410.some(part => !part.red && part.text.includes('Jesus told him'))).toBe(true);

    const verse419 = bsbMatthew['4']['19'];
    const parts419 = redLetterVerse(bsbMatthew, 4, 19, verse419.text);
    expect(parts419.filter(part => part.red).map(part => part.text).join('')).toBe('Come, follow Me,”and I will make you fishers of men.');
    expect(parts419.some(part => !part.red && part.text.includes('Jesus said'))).toBe(true);
  });

  it('stops BSB Matthew 4:17 before the appended section heading', () => {
    const verse = bsbMatthew['4']['17'];
    const red = redLetterVerse(bsbMatthew, 4, 17, verse.text).filter(part => part.red).map(part => part.text).join('');
    expect(red).toBe('Repent, for the kingdom of heaven is near.”');
    expect(red).not.toContain('The First Disciples');
  });
});
