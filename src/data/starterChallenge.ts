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
];
