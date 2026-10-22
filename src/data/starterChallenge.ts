export type ChallengeQuestion = {
  question: string;
  choices: string[];
  answer: string;
  reference: string;
  bookKey: string;
  chapter: number;
};

/**
 * Small, manually verified starter set for the Bible Arena challenge.
 * Keep challenge content separate from the UI so future published challenge
 * data can replace this starter set without rewriting the game component.
 */
export const starterChallengeQuestions: ChallengeQuestion[] = [
  {
    question: 'In which book do we read about David defeating Goliath?',
    choices: ['Genesis', '1 Samuel', 'Psalms', 'Acts'],
    answer: '1 Samuel',
    reference: '1 Samuel 17',
    bookKey: '1-samuel',
    chapter: 17,
  },
  {
    question: 'Which Gospel records Jesus turning water into wine at Cana?',
    choices: ['Matthew', 'Mark', 'Luke', 'John'],
    answer: 'John',
    reference: 'John 2',
    bookKey: 'john',
    chapter: 2,
  },
  {
    question: 'Where is the fruit of the Spirit listed?',
    choices: ['Romans 8', 'Galatians 5', 'Hebrews 11', 'James 1'],
    answer: 'Galatians 5',
    reference: 'Galatians 5:22–23',
    bookKey: 'galatians',
    chapter: 5,
  },
  {
    question: 'Who built the ark before the flood?',
    choices: ['Abraham', 'Moses', 'Noah', 'Jacob'],
    answer: 'Noah',
    reference: 'Genesis 6:13–22',
    bookKey: 'genesis',
    chapter: 6,
  },
  {
    question: 'Who led the Israelites across the Red Sea?',
    choices: ['Joshua', 'Moses', 'Aaron', 'Samuel'],
    answer: 'Moses',
    reference: 'Exodus 14',
    bookKey: 'exodus',
    chapter: 14,
  },
  {
    question: 'Which prophet challenged the prophets of Baal on Mount Carmel?',
    choices: ['Elijah', 'Elisha', 'Isaiah', 'Jeremiah'],
    answer: 'Elijah',
    reference: '1 Kings 18',
    bookKey: '1-kings',
    chapter: 18,
  },
  {
    question: 'In which Gospel do we read the Sermon on the Mount beginning with the Beatitudes?',
    choices: ['Matthew', 'Mark', 'Luke', 'John'],
    answer: 'Matthew',
    reference: 'Matthew 5',
    bookKey: 'matthew',
    chapter: 5,
  },
  {
    question: 'Who baptized Jesus in the Jordan?',
    choices: ['Peter', 'John the Baptist', 'Andrew', 'Philip'],
    answer: 'John the Baptist',
    reference: 'Matthew 3:13–17',
    bookKey: 'matthew',
    chapter: 3,
  },
  {
    question: 'Who was chosen to replace Judas among the twelve apostles?',
    choices: ['Barnabas', 'Silas', 'Matthias', 'Stephen'],
    answer: 'Matthias',
    reference: 'Acts 1:15–26',
    bookKey: 'acts',
    chapter: 1,
  },
  {
    question: 'Which chapter describes the armour of God?',
    choices: ['Ephesians 6', 'Romans 12', 'Philippians 2', 'Colossians 1'],
    answer: 'Ephesians 6',
    reference: 'Ephesians 6:10–18',
    bookKey: 'ephesians',
    chapter: 6,
  },
];
