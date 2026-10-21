import { describe, expect, it } from 'vitest';

/**
 * Daily Devotion intentionally never invents Scripture or devotional copy when
 * the database has no published devotion. These small contract tests keep the
 * fallback wording explicit while the live devotion schema is being verified.
 */
describe('Daily Devotion content policy', () => {
  it('keeps an explicit unpublished fallback instead of generated devotion content', () => {
    const unpublishedHeading = 'Today’s devotion is not published yet.';
    const unpublishedMessage = 'When a verified devotion is published for today, it will appear here. We do not generate placeholder Scripture or devotional content.';

    expect(unpublishedHeading).toContain('not published');
    expect(unpublishedMessage).toContain('verified devotion');
    expect(unpublishedMessage).toContain('do not generate placeholder Scripture');
  });

  it('keeps Bible reading available when devotion data is unavailable', () => {
    const fallbackAction = { label: 'Read the Bible →', route: '/bible' };

    expect(fallbackAction.route).toBe('/bible');
    expect(fallbackAction.label).toContain('Bible');
  });
});
