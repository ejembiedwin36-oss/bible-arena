export type BibleVerse = {
  verse: number;
  text: string;
};

export type BibleChapter = {
  book: string;
  chapter: number;
  translation: string;
  verses: BibleVerse[];
};

// Seed content for the first reader implementation.
// The production Bible catalogue will move to Supabase with licensed/public-domain sources.
export const sampleLuke1: BibleChapter = {
  book: 'Luke',
  chapter: 1,
  translation: 'KJV',
  verses: [
    { verse: 1, text: 'Forasmuch as many have taken in hand to set forth in order a declaration of those things which are most surely believed among us,' },
    { verse: 2, text: 'Even as they delivered them unto us, which from the beginning were eyewitnesses, and ministers of the word;' },
    { verse: 3, text: 'It seemed good to me also, having had perfect understanding of all things from the very first, to write unto thee in order, most excellent Theophilus,' },
    { verse: 4, text: 'That thou mightest know the certainty of those things, wherein thou hast been instructed.' },
    { verse: 5, text: 'There was in the days of Herod, the king of Judaea, a certain priest named Zacharias, of the course of Abia: and his wife was of the daughters of Aaron, and her name was Elisabeth.' },
    { verse: 6, text: 'And they were both righteous before God, walking in all the commandments and ordinances of the Lord blameless.' },
    { verse: 7, text: 'And they had no child, because that Elisabeth was barren; and they both were now well stricken in years.' },
    { verse: 8, text: 'And it came to pass, that while he executed the priest’s office before God in the order of his course,' },
    { verse: 9, text: 'According to the custom of the priest’s office, his lot was to burn incense when he went into the temple of the Lord.' },
    { verse: 10, text: 'And the whole multitude of the people were praying without at the time of incense.' },
  ],
};
