import { describe, expect, it } from 'vitest';
import { starterChallengeQuestions } from './starterChallenge';

describe('starterChallengeQuestions', () => {
  it('has a valid answer among the choices for every question', () => {
    for (const question of starterChallengeQuestions) {
      expect(question.choices).toContain(question.answer);
    }
  });

  it('has enough distinct choices to make each question meaningful', () => {
    for (const question of starterChallengeQuestions) {
      expect(question.choices.length).toBeGreaterThanOrEqual(3);
      expect(new Set(question.choices).size).toBe(question.choices.length);
    }
  });

  it('links every question to a real-looking Bible reading target', () => {
    for (const question of starterChallengeQuestions) {
      expect(question.reference.trim()).not.toBe('');
      expect(question.bookKey.trim()).not.toBe('');
      expect(question.chapter).toBeGreaterThan(0);
    }
  });
});
