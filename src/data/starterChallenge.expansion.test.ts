import { describe, expect, it } from 'vitest';

import { starterChallengeQuestions } from './starterChallenge';

describe('expanded starter Bible Arena challenge', () => {
  it('contains enough questions for a meaningful starter round', () => {
    expect(starterChallengeQuestions.length).toBeGreaterThanOrEqual(10);
  });

  it('keeps every question navigable to Scripture', () => {
    for (const question of starterChallengeQuestions) {
      expect(question.reference.trim()).not.toBe('');
      expect(question.bookKey.trim()).not.toBe('');
      expect(question.chapter).toBeGreaterThan(0);
    }
  });
});
